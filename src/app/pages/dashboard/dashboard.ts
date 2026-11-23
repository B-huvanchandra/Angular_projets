
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

interface CustomerOrder {
  id?: number;
  customer: string;
  items: any[];
  totalAmount: number;
  orderDate: string;
  status: string;
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

  // Compare dates using the browser's local date
  isToday(dateValue: string): boolean {
    const date = new Date(dateValue);

    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
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
      ),

      orders: this.http.get<CustomerOrder[]>(
        'http://localhost:3000/orders'
      )

    }).subscribe({

      next: (data) => {

        this.totalProducts.set(data.products.length);

        this.totalEmployees.set(data.employees.length);

        // Today's employee billing sales
        const todayEmployeeSales = data.sales.filter(sale =>
          this.isToday(sale.date)
        );

        const employeeTodayRevenue = todayEmployeeSales.reduce(
          (total, sale) => total + Number(sale.grandTotal || 0),
          0
        );

        // Today's customer orders
        const todayCustomerOrders = data.orders.filter(order =>
          this.isToday(order.orderDate)
        );

        const customerTodayRevenue = todayCustomerOrders.reduce(
          (total, order) => total + Number(order.totalAmount || 0),
          0
        );

        // Combine both sources
        this.todaySales.set(
          employeeTodayRevenue + customerTodayRevenue
        );

        // Total revenue from both collections
        const employeeRevenue = data.sales.reduce(
          (total, sale) => total + Number(sale.grandTotal || 0),
          0
        );

        const customerRevenue = data.orders.reduce(
          (total, order) => total + Number(order.totalAmount || 0),
          0
        );

        this.totalRevenue.set(
          employeeRevenue + customerRevenue
        );

        this.lowStockProducts.set(
          data.products.filter(product =>
            product.quantity > 0 && product.quantity <= 10
          ).length
        );

        console.log('Employee sales:', data.sales);
        console.log('Customer orders:', data.orders);
        console.log('Today sales amount:', this.todaySales());

      },

      error: (error) => {
        console.error('Dashboard loading error:', error);
      }

    });

  }
}
