
import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Products } from './pages/products/products';
import { Inventory } from './pages/inventory/inventory';
import { Billing } from './pages/billing/billing';
import { Sales } from './pages/sales/sales';
import { Employees } from './pages/employees/employees';
import { Reports } from './pages/reports/reports';
import { Login } from './pages/login/login';
import { StockUpdate } from './pages/stock-update/stock-update';
import { Shop } from './pages/shop/shop';

import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  // Public login page
  {
    path: 'login',
    component: Login
  },

  // Customer: shopping only
  {
  path: 'shop',
  component: Shop
},

  // Owner and Manager: billing
  {
    path: 'billing',
    component: Billing,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner and Manager: dashboard
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner and Manager: product catalogue management
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner, Manager and Employee: inventory
  {
    path: 'inventory',
    component: Inventory,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager', 'employee'] }
  },

  // Owner and Manager: sales
  {
    path: 'sales',
    component: Sales,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner and Manager: employees
  {
    path: 'employees',
    component: Employees,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner and Manager: reports
  {
    path: 'reports',
    component: Reports,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager'] }
  },

  // Owner, Manager and Employee: stock update
  {
    path: 'stock-update',
    component: StockUpdate,
    canActivate: [authGuard],
    data: { roles: ['owner', 'manager', 'employee'] }
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
