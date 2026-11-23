
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  storeName = 'FreshMart';

  constructor(
    private auth: Auth,
    private router: Router,
    private location: Location
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/shop']);
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
