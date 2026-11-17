
import { Component, OnInit, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  // Product data
  products = signal<Product[]>([]);

  // Form controls
  showForm = signal(false);
  isEditMode = signal(false);
  selectedProductId: number | null = null;

  // Search
  searchText = signal('');

  productForm: any;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      barcode: ['', Validators.required]
    });

  }

  // Load products when component starts
  ngOnInit(): void {
    this.loadProducts();
  }

  // GET: Load all products
  loadProducts(): void {

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        console.log('Products loaded:', data);
      },
      error: (error) => {
        console.error('Loading error:', error);
      }
    });

  }

  // Search products
  searchProducts(): Product[] {

    const search = this.searchText().toLowerCase().trim();

    return this.products().filter(product =>
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );

  }

  // Open Add Product form
  openAddForm(): void {

    this.isEditMode.set(false);
    this.selectedProductId = null;

    this.productForm.reset({
      name: '',
      category: '',
      price: 0,
      quantity: 0,
      barcode: ''
    });

    this.showForm.set(true);

  }

  // Open Edit Product form
  editProduct(product: Product): void {

    this.isEditMode.set(true);
    this.selectedProductId = product.id;

    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      barcode: product.barcode
    });

    this.showForm.set(true);

  }

  // POST / PUT: Save or update product
  saveProduct(): void {

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;

    const productData = {
      name: formValue.name,
      category: formValue.category,
      price: Number(formValue.price),
      quantity: Number(formValue.quantity),
      barcode: formValue.barcode
    };

    // UPDATE existing product
    if (this.isEditMode() && this.selectedProductId !== null) {

      this.productService.updateProduct(
        this.selectedProductId,
        productData
      ).subscribe({

        next: () => {
          alert('Product updated successfully!');

          this.productForm.reset();
          this.showForm.set(false);
          this.isEditMode.set(false);
          this.selectedProductId = null;

          this.loadProducts();
        },

        error: (error) => {
          console.error('Update error:', error);
          alert('Unable to update product');
        }

      });

    } else {

      // ADD new product
      this.productService.addProduct(productData).subscribe({

        next: () => {
          alert('Product added successfully!');

          this.productForm.reset();
          this.showForm.set(false);

          this.loadProducts();
        },

        error: (error) => {
          console.error('Add error:', error);
          alert('Unable to add product');
        }

      });

    }

  }

  // DELETE: Remove product
  deleteProduct(id: number): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmDelete) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({

      next: () => {
        alert('Product deleted successfully!');

        this.products.update(products =>
          products.filter(product => product.id !== id)
        );
      },

      error: (error) => {
        console.error('Delete error:', error);
        alert('Unable to delete product');
      }

    });

  }

}
