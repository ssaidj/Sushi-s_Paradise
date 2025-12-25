import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: Order[] = [];
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user || !user.id) {
      return;
    }

    // Charger les commandes en arrière-plan
    this.orderService.getOrders(user.id).subscribe({
      next: (orders) => {
        console.log('Orders loaded from API:', orders);
        this.orders = orders;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        // En cas d'erreur, ne rien faire - l'utilisateur verra "Aucune commande"
        this.orders = [];
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }
}
