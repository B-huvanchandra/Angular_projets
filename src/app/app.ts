
import { Component, signal } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';

import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';
import { LoadingService } from './services/loading';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    RouterOutlet,
    Navbar,
    Sidebar
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  showLayout = signal(false);

  constructor(
    private router: Router,
    public loadingService: LoadingService
  ) {

    this.updateLayout();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.updateLayout();
      });
  }

  updateLayout() {
    this.showLayout.set(
      this.router.url !== '/login' &&
      this.router.url !== '/shop'
    );
  }

}
