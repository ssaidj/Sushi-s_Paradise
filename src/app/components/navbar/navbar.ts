import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  cartItemCount: number = 0;
  showBoxesDropdown: boolean = false;
  showAccountDropdown: boolean = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  toggleBoxesDropdown(): void {
    this.showBoxesDropdown = !this.showBoxesDropdown;
    this.showAccountDropdown = false;
  }

  toggleAccountDropdown(): void {
    this.showAccountDropdown = !this.showAccountDropdown;
    this.showBoxesDropdown = false;
  }

  closeDropdowns(): void {
    this.showBoxesDropdown = false;
    this.showAccountDropdown = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeDropdowns();
    this.router.navigate(['/']);
  }
}
