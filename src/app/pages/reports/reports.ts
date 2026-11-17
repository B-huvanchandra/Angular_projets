
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
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  totalProducts = signal(0);
  totalEmployees = signal(0);
  totalSales = signal(0);
  totalRevenue = signal(0);
  lowStockProducts = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {

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

        this.totalSales.set(data.sales.length);

        const revenue = data.sales.reduce(
          (total, sale) => total + sale.grandTotal,
          0
        );

        this.totalRevenue.set(revenue);

        const lowStock = data.products.filter(
          product => product.quantity > 0 &&
                     product.quantity <= 10
        ).length;

        this.lowStockProducts.set(lowStock);

        console.log('Reports loaded:', data);

      },

      error: (error) => {
        console.error('Reports loading error:', error);
      }

    });

  }

}
