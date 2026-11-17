
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  id?: number;
  date: string;
  items: SaleItem[];
  grandTotal: number;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './sales.html',
  styleUrl: './sales.css'
})
export class Sales implements OnInit {
    searchText = signal('');
selectedDate = signal('');

  sales = signal<Sale[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSales();
  }
  filterSales(): Sale[] {

  const search = this.searchText().toLowerCase().trim();
  const date = this.selectedDate();

  return this.sales().filter(sale => {

    const matchesSearch =
      String(sale.id ?? '').includes(search) ||
      sale.items.some(item =>
        item.productName.toLowerCase().includes(search)
      );

    const matchesDate = date
      ? sale.date.substring(0, 10) === date
      : true;

    return matchesSearch && matchesDate;

  });

}

  loadSales(): void {

    this.http.get<Sale[]>('http://localhost:3000/sales')
      .subscribe({

        next: (data) => {
          this.sales.set(data);
          console.log('Sales loaded:', data);
        },

        error: (error) => {
          console.error('Sales loading error:', error);
        }

      });

  }

  getTotalRevenue(): number {

    return this.sales().reduce(
      (total, sale) => total + sale.grandTotal,
      0
    );

  }

}
