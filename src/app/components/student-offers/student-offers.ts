import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BoxService } from '../../services/box.service';
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
    private boxService: BoxService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudentOffers();
  }

  loadStudentOffers(): void {
    this.loading = true;
    this.boxService.getAllBoxes().subscribe({
      next: (boxes) => {
        // Appliquer une réduction de 10% sur tous les produits et les marquer comme offres étudiantes
        this.offers = boxes.map(box => ({
          ...box,
          price: box.price * 0.9,
          isStudentOffer: true
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching boxes from API:', err);
        this.loading = false;
      }
    });
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
