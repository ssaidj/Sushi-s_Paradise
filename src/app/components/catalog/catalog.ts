import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BoxService } from '../../services/box.service';
import { CartService } from '../../services/cart.service';
import { Box } from '../../models/models';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit {
  boxes: Box[] = [];
  isLoading: boolean = true;
  pageTitle: string = 'Nos grands boxes';
  filterSize:  string | null = null;

  constructor(
    private boxService: BoxService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Récupérer le filtre de taille depuis les données de route
    this.route.data.subscribe(data => {
      this.filterSize = data['size'] || null;
      this.pageTitle = this.filterSize === 'small' 
        ? 'Nos petites boxes' 
        : 'Nos grandes boxes';
      this.loadBoxes();
    });
  }

  loadBoxes(): void {
    this.isLoading = true;
    
    this.boxService.getAllBoxes().subscribe({
      next: (boxes) => {
        if (this.filterSize === 'small') {
          // Petites boxes : -40% de prix + préfixe "Mini " + adapter descriptions
          this.boxes = boxes.map(box => {
            const adaptedFoods = box.foods?.map(food => ({
              ...food,
              quantity: Math.ceil(food.quantity / 2)
            }));
            
            return {
              ...box,
              name: 'Mini ' + box.name,
              price: box.price * 0.6,
              description: this.generateDescriptionFromFoods(adaptedFoods, 'small'),
              foods: adaptedFoods,
              size: 'small'
            };
          });
        } else if (this.filterSize === 'large') {
          // Grandes boxes : +30% de prix + préfixe "Grande " + adapter description et foods
          this.boxes = boxes.map(box => {
            const adaptedFoods = box.foods?.map(food => ({
              ...food,
              quantity: Math.ceil(food.quantity * 1.3)
            }));
            
            return {
              ...box,
              name: 'Grande ' + box.name,
              price: box.price * 1.3,
              description: this.generateDescriptionFromFoods(adaptedFoods, 'large'),
              foods: adaptedFoods,
              size: 'large'
            };
          });
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching boxes from API:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Adapte la description pour les petites boxes en réduisant les quantités
   */
  private adaptDescriptionForSmall(description: string): string {
    // Vérifier que la description existe
    if (!description) {
      return '';
    }
    
    // Réduire de moitié les quantités mentionnées dans la description
    try {
      return description
        .replace(/(\d+)\s+/g, (match, number) => {
          const reduced = Math.ceil(parseInt(number) / 2);
          return reduced + ' ';
        })
        .replace('Quantité :', 'Quantité réduite :');
    } catch (error) {
      console.error('Error adapting description:', error);
      return description; // Retourner la description originale en cas d'erreur
    }
  }

  /**
   * Adapte la description pour les grandes boxes en augmentant les quantités
   */
  private adaptDescriptionForLarge(description: string): string {
    if (!description) {
      return '';
    }
    
    try {
      return description
        .replace(/(\d+)\s+/g, (match, number) => {
          const increased = Math.ceil(parseInt(number) * 1.3); // Augmentation de 30%
          return increased + ' ';
        })
        .replace('Quantité :', 'Grande quantité :');
    } catch (error) {
      console.error('Error adapting description:', error);
      return description;
    }
  }

  /**
   * Génère une description basée sur le tableau foods
   */
  private generateDescriptionFromFoods(foods: { name: string; quantity: number }[] | undefined, sizeType: string): string {
    if (!foods || foods.length === 0) {
      return 'Une délicieuse box de sushis fraîchement préparés.';
    }

    const quantityLabel = sizeType === 'small' ? 'Quantité réduite :' : 
                         sizeType === 'large' ? 'Grande quantité :' : 
                         'Quantité :';
    
    const itemsList = foods
      .map(food => `${food.quantity} ${food.name}`)
      .join(', ');
    
    return `${quantityLabel} ${itemsList}`;
  }

  addToCart(box: Box): void {
    const success = this.cartService.addToCart(box, 1);
    
    const notification = document.createElement('div');
    
    if (success) {
      notification.textContent = `✓ ${box.name} ajouté au panier`;
      notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#4caf50;color:white;padding:15px 20px;border-radius:8px;z-index:9999;';
    } else {
      notification.textContent = `⚠ Limite de 10 produits atteinte`;
      notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#ff9800;color:white;padding:15px 20px;border-radius:8px;z-index:9999;';
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}
