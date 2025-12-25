import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/models';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  totalQuantity: number = 0;
  totalPrice: number = 0;
  errorMessage: string = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalQuantity = this.cartService.getTotalQuantity();
      this.totalPrice = this.cartService.getTotalPrice();
    });
  }

  updateQuantity(boxId: number, quantity: number): void {
    const success = this.cartService.updateQuantity(boxId, quantity);
    if (!success) {
      this.errorMessage = 'Vous ne pouvez pas avoir plus de 10 produits dans le panier';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  removeItem(boxId: number): void {
    if (confirm('Voulez-vous vraiment retirer cet article?')) {
      this.cartService.removeFromCart(boxId);
    }
  }

  checkout(): void {
    // Vérifier la limite de 10 boxes
    if (this.totalQuantity > 10) {
      this.errorMessage = `Vous ne pouvez pas commander plus de 10 boxes à la fois (vous en avez ${this.totalQuantity})`;
      return;
    }

    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Vous devez vous connecter pour passer une commande';
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      }, 1500);
      return;
    }

    this.router.navigate(['/checkout']);
  }
}
