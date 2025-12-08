import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/models';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  paymentMethod: 'cash' | 'card' | null = null;
  orderConfirmed: boolean = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.totalPrice = this.cartService.getTotalPrice();
    this.totalQuantity = this.cartService.getTotalQuantity();

    // Rediriger si le panier est vide
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  selectPaymentMethod(method: 'cash' | 'card'): void {
    this.paymentMethod = method;
  }

  confirmOrder(): void {
    if (!this.paymentMethod) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    // Confirmer la commande
    this.orderConfirmed = true;

    // Afficher un message de confirmation
    setTimeout(() => {
      // Vider le panier
      this.cartService.clearCart();
      
      // Rediriger vers la page d'accueil après 3 secondes
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
