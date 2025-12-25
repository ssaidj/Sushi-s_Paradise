import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Sushi Paradise';
  showNavbar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Afficher la navbar partout sauf sur login
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const hideNavbarOn = ['/login'];
      this.showNavbar = !hideNavbarOn.includes(event.url);
    });
  }
}
