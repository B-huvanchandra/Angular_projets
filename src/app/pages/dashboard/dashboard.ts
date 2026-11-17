
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { Product } from '../../models/product.model';
import { Employee } from '../../models/employee.model';

interface Sale {
  id?: number;
  date: string;
  items: any[];
  grandTotal: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  totalProducts = signal(0);
  totalEmployees = signal(0);
  todaySales = signal(0);
  totalRevenue = signal(0);
  lowStockProducts = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {

    forkJoin({

      products: this.http.get<Product[]>(
        'http://localhost:3000/products'
      ),

      employees: this.http.get<Employee[]>(
        'http://localhost:3000/employees'
      ),

      sales: this.http.get<Sale[]>(
        'http://localhost:3000/sales'
      )

    }).subscribe({

      next: (data) => {

        this.totalProducts.set(data.products.length);

        this.totalEmployees.set(data.employees.length);

        const today = new Date().toLocaleDateString('en-CA');

        const todaySales = data.sales.filter(sale =>
          new Date(sale.date).toLocaleDateString('en-CA') === today
        );

        this.todaySales.set(
          todaySales.reduce(
            (total, sale) => total + sale.grandTotal,
            0
          )
        );

        this.totalRevenue.set(
          data.sales.reduce(
            (total, sale) => total + sale.grandTotal,
            0
          )
        );

        this.lowStockProducts.set(
          data.products.filter(product =>
            product.quantity > 0 && product.quantity <= 10
          ).length
        );

      },

      error: (error) => {
        console.error('Dashboard loading error:', error);
      }

    });

  }

}
