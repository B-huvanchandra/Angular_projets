
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(private auth: Auth) {}

  get menuItems(): MenuItem[] {

    const user = this.auth.getCurrentUser();

    if (!user) {
      return [];
    }

    // Owner: All modules
    if (user.role === 'owner') {
      return [
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Products', route: '/products' },
        { label: 'Inventory', route: '/inventory' },
        { label: 'Billing', route: '/billing' },
        { label: 'Sales', route: '/sales' },
        { label: 'Employees', route: '/employees' },
        { label: 'Reports', route: '/reports' }
      ];
    }

    // Manager: Limited management access
    if (user.role === 'manager') {
      return [
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Products', route: '/products' },
        { label: 'Inventory', route: '/inventory' },
        { label: 'Billing', route: '/billing' },
        { label: 'Sales', route: '/sales' },
        { label: 'Employees', route: '/employees' },
        { label: 'Reports', route: '/reports' }
      ];
    }

    // Employee: Stock update only
    if (user.role === 'employee') {
      return [
        { label: 'Stock Update', route: '/stock-update' }
      ];
    }

    return [];
  }
}
