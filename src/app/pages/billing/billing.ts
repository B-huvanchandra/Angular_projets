
import { Component, OnInit, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class Billing implements OnInit {

  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);

  constructor(
  private productService: ProductService,
  private http: HttpClient
) {}

checkout(): void {

  const items = this.cart();

  if (items.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const saleData = {
    date: new Date().toISOString(),
    items: items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity
    })),
    grandTotal: this.getGrandTotal()
  };

  // Save sale in JSON Server
  this.http.post('http://localhost:3000/sales', saleData)
    .subscribe({

      next: () => {

        // Update stock for all purchased products
        const stockUpdates = items.map(item => {

          const updatedProduct = {
            name: item.product.name,
            category: item.product.category,
            price: item.product.price,
            quantity: item.product.quantity - item.quantity,
            barcode: item.product.barcode
          };

          return this.productService.updateProduct(
            item.product.id,
            updatedProduct
          );

        });

        forkJoin(stockUpdates).subscribe({

          next: () => {
            alert('Bill generated successfully!');

            this.cart.set([]);
            this.loadProducts();
          },

          error: (error) => {
            console.error('Stock update error:', error);
            alert('Sale was saved, but stock updating failed. Please check inventory.');
          }

        });

      },

      error: (error) => {
        console.error('Sale saving error:', error);
        alert('Unable to generate bill.');
      }

    });

}


  ngOnInit(): void {
    this.loadProducts();
  }

increaseQuantity(productId: number): void {

  const item = this.cart().find(
    item => item.product.id === productId
  );

  if (!item) {
    return;
  }

  if (item.quantity >= item.product.quantity) {
    alert('Not enough stock available!');
    return;
  }

  this.cart.update(items =>
    items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );

}

decreaseQuantity(productId: number): void {

  this.cart.update(items =>
    items
      .map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0)
  );

}

removeFromCart(productId: number): void {

  this.cart.update(items =>
    items.filter(item => item.product.id !== productId)
  );

}


  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (error) => {
        console.error('Products loading error:', error);
      }
    });
  }

  addToCart(product: Product): void {

    if (product.quantity <= 0) {
      alert('This product is out of stock!');
      return;
    }

    const existingItem = this.cart().find(
      item => item.product.id === product.id
    );

    if (existingItem) {

      if (existingItem.quantity >= product.quantity) {
        alert('Not enough stock available!');
        return;
      }

      this.cart.update(items =>
        items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );

    } else {

      this.cart.update(items => [
        ...items,
        { product, quantity: 1 }
      ]);

    }
  }

  getGrandTotal(): number {
    return this.cart().reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    );
  }

}
