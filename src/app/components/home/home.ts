import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BoxService  } from '../../services/box.service';
import { Box } from '../../models/models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  largeBoxes: Box[] = [];

  constructor(
    private cartService: CartService, 
    private boxService: BoxService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadMockProducts();
  }

  loadMockProducts(): void {
    console.log('Fetching boxes from API...');
    
    this.boxService.getAllBoxes().subscribe({
      next: (boxes) => {
        console.log('Boxes received from API:', boxes);
        this.largeBoxes = boxes;
        this.cdr.detectChanges(); // Force change detection
        console.log('Change detection triggered, largeBoxes length:', this.largeBoxes.length);
      },
      error: (err) => {
        console.error('Error fetching boxes from API:', err);
      }
    });
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
