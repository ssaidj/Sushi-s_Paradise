import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Box } from '../../models/models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  largeBoxes: Box[] = [];
  loading = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadMockProducts();
  }

  loadMockProducts(): void {
    // Mock data with 8 Salmon Lovers products at 11.96€
    this.largeBoxes = [
      {
        id: 1,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 2,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 3,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 4,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 5,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 6,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 7,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      },
      {
        id: 8,
        name: 'Salmon Lovers',
        description: 'Box saumon premium',
        price: 11.96,
        size: 'large'
      }
    ];
  }

  addToCart(box: Box): void {
    const success = this.cartService.addToCart(box, 1);
    
    // Notification
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
