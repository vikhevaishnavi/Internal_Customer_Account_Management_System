import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;

  // You must include 'private authService: AuthService' here to fix the TS2339 error
  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.isLoading = true;
    console.log('Attempting login with email:', this.username);
    
    this.authService.login({ email: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        console.log('Login successful:', res);
        const role = this.authService.getRole();
        console.log('User role:', role);
        
        // Navigate based on the 'Role' column in your t_User table
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']); 
        } else if (role === 'Bank Officer' || role === 'Officer') {
          this.router.navigate(['/officer/dashboard']);
        } else if (role === 'Manager') {
          this.router.navigate(['/manager/dashboard']);
        } else {
          alert('Login Failed: Unknown user role');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        
        if (err.status === 0) {
          alert('Login Failed: Cannot connect to the Banking API. Please check if the backend is running on http://localhost:5000');
        } else if (err.status === 401) {
          alert('Login Failed: Invalid email or password');
        } else if (err.status === 403) {
          alert('Login Failed: Access denied. Please check your permissions');
        } else {
          alert(`Login Failed: ${err.message || 'Unknown error occurred'}`);
        }
      }
    });
  }
}