import { Component, OnInit } from '@angular/core';
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
    private route: ActivatedRoute
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
    // Données mock pour le développement
    const mockSmallBoxes: Box[] = [
      {
        id: 101,
        name: 'Mini Saumon',
        description: '6 pièces de saumon délicieux',
        price: 6.99,
        size: 'small'
      },
      {
        id: 102,
        name: 'Mini Thon',
        description: '6 pièces de thon frais',
        price: 7.49,
        size: 'small'
      },
      {
        id: 103,
        name: 'Mini Avocat',
        description: '6 makis avocat',
        price: 5.99,
        size: 'small'
      },
      {
        id: 104,
        name: 'Mini Crevette',
        description: '6 pièces de crevette',
        price: 7.99,
        size: 'small'
      },
      {
        id: 105,
        name: 'Mini Veggie',
        description: '6 makis végétariens',
        price: 5.49,
        size: 'small'
      },
      {
        id: 106,
        name: 'Mini California',
        description: '6 california rolls',
        price: 6.49,
        size: 'small'
      }
    ];

    const mockLargeBoxes: Box[] = [
      {
        id: 201,
        name: 'Salmon Lovers',
        description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou',
        price: 11.96,
        size: 'large'
      },
      {
        id: 202,
        name: 'Mix Prestige',
        description: 'Quantité : 10 pièces variées de sushis et makis premium',
        price: 14.99,
        size: 'large'
      },
      {
        id: 203,
        name: 'Thon Deluxe',
        description: 'Quantité : 8 Thons Avocats, 6 Sushis Thon, 1 Salade de chou',
        price: 12.99,
        size: 'large'
      },
      {
        id: 204,
        name: 'Veggie Paradise',
        description: 'Quantité : 12 makis végétariens variés, 1 Salade',
        price: 10.49,
        size: 'large'
      },
      {
        id: 205,
        name: 'California Dream',
        description: 'Quantité : 12 california rolls, 6 sushis saumon',
        price: 13.49,
        size: 'large'
      },
      {
        id: 206,
        name: 'Crevette Royale',
        description: 'Quantité : 8 crevettes tempura, 6 sushis crevette',
        price: 15.99,
        size: 'large'
      }
    ];

    // Filtrer selon la taille
    this.boxes = this.filterSize === 'small' ? mockSmallBoxes : mockLargeBoxes;
    this.isLoading = false;
  }

  addToCart(box: Box): void {
    this.cartService.addToCart(box, 1);
    // Message de confirmation plus discret
    const notification = document.createElement('div');
    notification.textContent = `✓ ${box.name} ajouté au panier`;
    notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#4caf50;color:white;padding:15px 20px;border-radius:8px;z-index:9999;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }
}
