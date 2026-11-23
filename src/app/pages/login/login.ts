
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  get requiresPassword(): boolean {
    const staffUsers = ['owner', 'manager', 'employee'];

    return staffUsers.includes(this.username.trim().toLowerCase());
  }

  onLogin(): void {

    this.errorMessage = '';

    const user = this.auth.login(
      this.username,
      this.password
    );

    if (!user) {
      this.errorMessage = 'Invalid username or password!';
      return;
    }

    if (user.role === 'owner' || user.role === 'manager') {
      this.router.navigate(['/dashboard']);
    }
    else if (user.role === 'employee') {
      this.router.navigate(['/stock-update']);
    }
    else if (user.role === 'customer') {
      this.router.navigate(['/shop']);
    }
  }
}
