import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Box } from '../../models/models';

@Component({
  selector: 'app-student-offers',
  imports: [CommonModule, RouterModule],
  templateUrl: './student-offers.html',
  styleUrl: './student-offers.css',
})
export class StudentOffers implements OnInit {
  offers: Box[] = [];
  loading = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudentOffers();
  }

  loadStudentOffers(): void {
    // Produits avec réduction étudiante de 10%
    const basePrice1 = 11.96;
    const basePrice2 = 14.99;
    const basePrice3 = 12.99;
    const basePrice4 = 10.49;
    const basePrice5 = 13.49;
    const basePrice6 = 15.99;

    this.offers = [
      {
        id: 301,
        name: 'Salmon Lovers - Étudiant',
        description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou',
        price: basePrice1 * 0.9, // -10%
        size: 'large'
      },
      {
        id: 302,
        name: 'Mix Prestige - Étudiant',
        description: 'Quantité : 10 pièces variées de sushis et makis premium',
        price: basePrice2 * 0.9,
        size: 'large'
      },
      {
        id: 303,
        name: 'Thon Deluxe - Étudiant',
        description: 'Quantité : 8 Thons Avocats, 6 Sushis Thon, 1 Salade de chou',
        price: basePrice3 * 0.9,
        size: 'large'
      },
      {
        id: 304,
        name: 'Veggie Paradise - Étudiant',
        description: 'Quantité : 12 makis végétariens variés, 1 Salade',
        price: basePrice4 * 0.9,
        size: 'large'
      },
      {
        id: 305,
        name: 'California Dream - Étudiant',
        description: 'Quantité : 12 california rolls, 6 sushis saumon',
        price: basePrice5 * 0.9,
        size: 'large'
      },
      {
        id: 306,
        name: 'Crevette Royale - Étudiant',
        description: 'Quantité : 8 crevettes tempura, 6 sushis crevette',
        price: basePrice6 * 0.9,
        size: 'large'
      }
    ];
  }

  getOriginalPrice(discountedPrice: number): number {
    return discountedPrice / 0.9;
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
