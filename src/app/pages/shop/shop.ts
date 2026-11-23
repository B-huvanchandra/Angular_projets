
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { DatePipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';
import { Auth } from '../../services/auth';

interface CartItem {
  product: Product;
  quantity: number;
}

interface BillItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

interface SavedOrder {
  id: number;
  customer: string;
  items: BillItem[];
  totalAmount: number;
  orderDate: string;
  status: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './shop.html',
  styleUrl: './shop.css'
})
export class Shop implements OnInit {

  // Products and cart
  products = signal<Product[]>([]);
  cart = signal<CartItem[]>([]);

  // Search and customer details
  searchText = signal('');
  customerName = signal('');

  // Messages and checkout status
  message = signal('');
  isBuying = signal(false);

  // Generated bill
  lastBill = signal<SavedOrder | null>(null);

  private ordersUrl = 'http://localhost:3000/orders';

  constructor(
    private productService: ProductService,
    private http: HttpClient,
    private auth: Auth
  ) {}

  // Get customer name from login
  ngOnInit(): void {

    const user = this.auth.getCurrentUser();

    if (user && user.role === 'customer') {
      this.customerName.set(user.username);
    }

    this.loadProducts();
  }

  // Load products
  loadProducts(): void {

    this.productService.getProducts().subscribe({
      next: data => {
        this.products.set(data);
      },
      error: error => {
        console.error('Product loading error:', error);
        this.message.set('Unable to load products. Please try again.');
      }
    });
  }

  // Search products
  get filteredProducts(): Product[] {

    return this.products().filter(product =>
      product.name.toLowerCase().includes(
        this.searchText().toLowerCase()
      )
    );
  }

  // Add product to cart
  addToCart(product: Product): void {

    if (product.quantity <= 0) {
      this.message.set('Product is out of stock.');
      return;
    }

    const existingItem = this.cart().find(
      item => item.product.id === product.id
    );

    if (existingItem) {
      this.increaseQuantity(product.id);
      return;
    }

    this.cart.update(items => [
      ...items,
      { product, quantity: 1 }
    ]);

    this.message.set(`${product.name} added to cart.`);
  }

  // Increase quantity
  increaseQuantity(productId: number): void {

    this.cart.update(items =>
      items.map(item => {

        if (item.product.id === productId) {

          if (item.quantity < item.product.quantity) {
            return {
              ...item,
              quantity: item.quantity + 1
            };
          }

          this.message.set('Available stock limit reached.');
        }

        return item;
      })
    );
  }

  // Decrease quantity
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

  // Remove product
  removeFromCart(productId: number): void {

    this.cart.update(items =>
      items.filter(item => item.product.id !== productId)
    );
  }

  // Calculate grand total
  getGrandTotal(): number {

    return this.cart().reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0
    );
  }

  // Place order and generate bill
  placeOrder(): void {

    if (this.cart().length === 0) {
      this.message.set('Your cart is empty.');
      return;
    }

    // Get customer name from login
    const customer = this.customerName().trim();

    if (!customer) {
      this.message.set('Customer name not found. Please login again.');
      return;
    }

    this.isBuying.set(true);
    this.message.set('');
    this.lastBill.set(null);

    const cartItems = this.cart();
    const stockCheck = this.products();

    // Check stock availability
    for (const item of cartItems) {

      const currentProduct = stockCheck.find(
        product => product.id === item.product.id
      );

      if (!currentProduct || currentProduct.quantity < item.quantity) {

        this.isBuying.set(false);

        this.message.set(
          `Insufficient stock for ${item.product.name}. Please refresh and try again.`
        );

        this.loadProducts();
        return;
      }
    }

    const orderDate = new Date().toISOString();

    // Prepare bill items
    const billItems: BillItem[] = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));

    // Calculate total
    const totalAmount = billItems.reduce(
      (total, item) => total + item.total,
      0
    );

    // Prepare order
    const order = {
      customer: customer,
      items: billItems,
      totalAmount: totalAmount,
      orderDate: orderDate,
      status: 'Confirmed'
    };

    // Update stock
    const stockUpdates = cartItems.map(item => {

      const currentProduct = stockCheck.find(
        product => product.id === item.product.id
      )!;

      const { id, ...productData } = currentProduct;

      return this.productService.updateProduct(id, {
        ...productData,
        quantity: productData.quantity - item.quantity
      });
    });

    forkJoin(stockUpdates).subscribe({

      next: () => {

        // Save order
        this.http.post<SavedOrder>(
          this.ordersUrl,
          order
        ).subscribe({

          next: savedOrder => {

            // Generate bill
            this.lastBill.set(savedOrder);

            this.cart.set([]);
            this.isBuying.set(false);

            this.message.set(
              'Order placed successfully! Your bill is ready.'
            );

            this.loadProducts();
          },

          error: error => {

            console.error('Order saving error:', error);

            this.isBuying.set(false);

            this.message.set(
              'Order could not be saved. Please try again.'
            );

            this.loadProducts();
          }
        });
      },

      error: error => {

        console.error('Stock update error:', error);

        this.isBuying.set(false);

        this.message.set(
          'Unable to update stock. Please try again.'
        );

        this.loadProducts();
      }
    });
  }

  // Print bill
  printBill(): void {

    if (this.lastBill()) {
      window.print();
    }
  }
}
