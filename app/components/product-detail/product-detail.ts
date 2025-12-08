import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
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
  selectedExtras = {
    sauceSalee: false,
    sauceSucree: false,
    gingembre: false,
    wasabi: false
  };

  // Mock data - À remplacer par un service plus tard
  mockBoxes: Box[] = [
    {
      id: 1,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 2,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 3,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 4,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 5,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 6,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 7,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    },
    {
      id: 8,
      name: 'Salmon Lovers',
      description: 'Quantité : 8 Saumons Avocats, 6 Sushis Saumons, 1 Salade de chou\n\nSaveurs: coriandre, saumon, avocat',
      price: 11.96,
      size: 'large'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.box = this.mockBoxes.find(b => b.id === id) || null;
    
    if (!this.box) {
      this.router.navigate(['/']);
    }
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

    const success = this.cartService.addToCart(this.box, this.quantity, this.selectedExtras);
    
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
