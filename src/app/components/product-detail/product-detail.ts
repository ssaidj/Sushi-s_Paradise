import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BoxService } from '../../services/box.service';
import { Box } from '../../models/models';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  box: Box | null = null;
  quantity: number = 1;
  boxType: string | null = null; // 'small', 'large', ou null (page d'accueil)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private boxService: BoxService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.boxType = this.route.snapshot.queryParamMap.get('boxType');
    
    console.log('Loading box with ID:', id, 'Type:', this.boxType);
    
    this.boxService.getBoxById(id).subscribe({
      next: (box) => {
        console.log('Box loaded:', box);
        
        // Appliquer les transformations selon le type de box
        if (this.boxType === 'small') {
          // Petites boxes : -40% + préfixe "Mini " + adapter description
          const adaptedFoods = box.foods?.map(food => ({
            ...food,
            quantity: Math.ceil(food.quantity / 2)
          }));
          
          this.box = {
            ...box,
            name: 'Mini ' + box.name,
            price: box.price * 0.6,
            description: this.generateDescriptionFromFoods(adaptedFoods, 'small'),
            foods: adaptedFoods,
            size: 'small'
          };
        } else if (this.boxType === 'large') {
          // Grandes boxes : +30% + préfixe "Grande " + adapter description et foods
          const adaptedFoods = box.foods?.map(food => ({
            ...food,
            quantity: Math.ceil(food.quantity * 1.3)
          }));
          
          this.box = {
            ...box,
            name: 'Grande ' + box.name,
            price: box.price * 1.3,
            description: this.generateDescriptionFromFoods(adaptedFoods, 'large'),
            foods: adaptedFoods,
            size: 'large'
          };
        } else if (this.boxType === 'student') {
          // Offres étudiantes : -10%
          this.box = {
            ...box,
            price: box.price * 0.9,
            isStudentOffer: true
          };
        } else {
          // Page d'accueil : pas de transformation
          this.box = box;
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading box:', err);
        this.box = null;
      }
    });
  }

  /**
   * Adapte la description pour les petites boxes en réduisant les quantités
   */
  private adaptDescriptionForSmall(description: string): string {
    if (!description) {
      return '';
    }
    
    try {
      return description
        .replace(/(\d+)\s+/g, (match, number) => {
          const reduced = Math.ceil(parseInt(number) / 2);
          return reduced + ' ';
        })
        .replace('Quantité :', 'Quantité réduite :');
    } catch (error) {
      console.error('Error adapting description:', error);
      return description;
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

  incrementQuantity(): void {
    const currentTotal = this.cartService.getTotalQuantity();
    if (currentTotal + this.quantity < 10) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.box) return;

    const success = this.cartService.addToCart(this.box, this.quantity);
    
    const notification = document.createElement('div');
    
    if (success) {
      notification.textContent = `✓ ${this.quantity} ${this.box.name} ajouté(s) au panier`;
      notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#4caf50;color:white;padding:15px 20px;border-radius:8px;z-index:9999;';
      
      // Redirection vers le panier après 1 seconde
      setTimeout(() => {
        this.router.navigate(['/cart']);
      }, 1000);
    } else {
      notification.textContent = `⚠ Limite de 10 produits atteinte`;
      notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#ff9800;color:white;padding:15px 20px;border-radius:8px;z-index:9999;';
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}
