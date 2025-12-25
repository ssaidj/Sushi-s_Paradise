import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService, OrderItem } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
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
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Réinitialiser l'état
    this.orderConfirmed = false;
    this.paymentMethod = null;
    
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

    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      alert('Erreur: utilisateur non connecté');
      return;
    }

    // Convertir les items du panier en OrderItems
    const orderItems: OrderItem[] = this.cartItems.map(item => ({
      box_id: item.box.id,
      name: item.box.name,
      quantity: item.quantity,
      unit_price: item.box.price
    }));

    // Vider le panier et afficher la confirmation IMMÉDIATEMENT
    this.cartService.clearCart();
    this.orderConfirmed = true;

    // Créer la commande en arrière-plan (sans bloquer l'UI)
    this.orderService.createOrder(user.id, orderItems, this.totalPrice, this.paymentMethod).subscribe({
      next: (response) => {
        console.log('Order created successfully:', response);
      },
      error: (err) => {
        console.error('Error creating order:', err);
        // Ne pas déranger l'utilisateur - la confirmation est déjà affichée
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
