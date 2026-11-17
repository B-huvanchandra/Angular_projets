
import { Component, OnInit, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit {
    updateStock(product: Product): void {

  const newQuantity = prompt(
    `Enter new stock quantity for ${product.name}:`,
    product.quantity.toString()
  );

  if (newQuantity === null || newQuantity.trim() === '') {
    return;
  }

  const quantity = Number(newQuantity);

  if (!Number.isInteger(quantity) || quantity < 0) {
    alert('Please enter a valid non-negative whole number.');
    return;
  }

  const updatedProduct = {
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: quantity,
    barcode: product.barcode
  };

  this.productService.updateProduct(
    product.id,
    updatedProduct
  ).subscribe({

    next: () => {
      alert('Stock updated successfully!');
      this.loadInventory();
    },

    error: (error) => {
      console.error('Stock update error:', error);
      alert('Unable to update stock.');
    }

  });

}

  products = signal<Product[]>([]);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        console.log('Inventory loaded:', data);
      },
      error: (error) => {
        console.error('Inventory loading error:', error);
      }
    });
  }

  getInStockCount(): number {
    return this.products().filter(p => p.quantity > 10).length;
  }

  getLowStockCount(): number {
    return this.products().filter(
      p => p.quantity > 0 && p.quantity <= 10
    ).length;
  }

  getOutOfStockCount(): number {
    return this.products().filter(p => p.quantity === 0).length;
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) {
      return 'Out of Stock';
    } else if (quantity <= 10) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }
}
