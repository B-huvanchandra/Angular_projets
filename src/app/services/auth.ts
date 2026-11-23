
import { Injectable } from '@angular/core';

export type UserRole =
  'owner' | 'manager' | 'employee' | 'customer';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoggedInUser {
  username: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private users: User[] = [
    { username: 'owner', password: 'owner123', role: 'owner' },
    { username: 'manager', password: 'manager123', role: 'manager' },
    { username: 'employee', password: 'employee123', role: 'employee' }
  ];

  login(username: string, password: string): User | null {

    const enteredName = username.trim();

    if (!enteredName) {
      return null;
    }

    // Check staff accounts first
    const staffUser = this.users.find(
      user => user.username.toLowerCase() === enteredName.toLowerCase()
    );

    if (staffUser) {

      if (staffUser.password !== password) {
        return null;
      }

      this.saveUser(staffUser.username, staffUser.role);
      return staffUser;
    }

    // Customer can enter their name without a password
    if (password.trim() !== '') {
      return null;
    }

    const customer: User = {
      username: enteredName,
      password: '',
      role: 'customer'
    };

    this.saveUser(enteredName, 'customer');

    return customer;
  }

  private saveUser(username: string, role: UserRole): void {

    const loggedInUser: LoggedInUser = {
      username,
      role
    };

    localStorage.setItem(
      'loggedInUser',
      JSON.stringify(loggedInUser)
    );
  }

  getCurrentUser(): LoggedInUser | null {

    const user = localStorage.getItem('loggedInUser');

    return user ? JSON.parse(user) as LoggedInUser : null;
  }

  logout(): void {
    localStorage.removeItem('loggedInUser');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role ?? null;
  }
}
