import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Box } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    // Charger le panier depuis localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addToCart(box: Box, quantity: number = 1): boolean {
    const currentTotal = this.getTotalQuantity();
    const existingItem = this.cartItems.find(item => item.box.id === box.id);
    
    // Calculer le nouveau total après l'ajout
    const newTotal = currentTotal + quantity;
    
    // Vérifier la limite de 10 produits
    if (newTotal > 10) {
      return false; // Retourne false si la limite est dépassée
    }
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ box, quantity });
    }
    
    this.updateCart();
    return true; // Retourne true si l'ajout a réussi
  }

  removeFromCart(boxId: number): void {
    this.cartItems = this.cartItems.filter(item => item.box.id !== boxId);
    this.updateCart();
  }

  updateQuantity(boxId: number, quantity: number): boolean {
    const item = this.cartItems.find(item => item.box.id === boxId);
    if (item) {
      // Calculer le total sans l'item actuel
      const totalWithoutItem = this.getTotalQuantity() - item.quantity;
      const newTotal = totalWithoutItem + quantity;
      
      // Vérifier la limite de 10 produits
      if (newTotal > 10) {
        return false;
      }
      
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(boxId);
      } else {
        this.updateCart();
      }
      return true;
    }
    return false;
  }

  getCartItems(): CartItem[] {
    return this.cartItems;
  }

  getTotalQuantity(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.box.price * item.quantity), 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  private updateCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }
}
