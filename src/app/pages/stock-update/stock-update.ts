
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-stock-update',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stock-update.html',
  styleUrl: './stock-update.css'
})
export class StockUpdate implements OnInit {

  products = signal<Product[]>([]);
  message = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data),
      error: () => this.message = 'Unable to load products.'
    });
  }

  updateStock(product: Product) {
    const { id, ...productData } = product;

    this.productService.updateProduct(id, productData).subscribe({
      next: () => {
        this.message = 'Stock updated successfully!';
        this.loadProducts();
      },
      error: () => {
        this.message = 'Failed to update stock.'
      }
    });
  }
}
