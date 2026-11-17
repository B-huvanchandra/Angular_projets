import { Routes } from '@angular/router';

import { Dashboard } from './pages/dashboard/dashboard';
import { Products } from './pages/products/products';
import { Inventory } from './pages/inventory/inventory';
import { Billing } from './pages/billing/billing';
import { Sales } from './pages/sales/sales';
import { Employees } from './pages/employees/employees';
import { Reports } from './pages/reports/reports';

export const routes: Routes = [
    {
  path: 'reports',
  component: Reports
},
    {
  path: 'employees',
  component: Employees
},
    {
  path: 'sales',
  component: Sales
},
    {
  path: 'billing',
  component: Billing
},
    {
  path: 'inventory',
  component: Inventory
},

  {
    path: 'dashboard',
    component: Dashboard
  },

  {
    path: 'products',
    component: Products
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }

];