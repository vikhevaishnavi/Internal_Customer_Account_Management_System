import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';

  // You must include 'private authService: AuthService' here to fix the TS2339 error
  constructor(private authService: AuthService, private router: Router) {}

 onLogin() {
  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      const role = this.authService.getRole();
      
      // Navigate based on the 'Role' column in your t_User table
      if (role === 'Admin') {
        this.router.navigate(['/admin/users']); 
      } else if (role === 'Bank Officer' || role === 'Officer') {
        this.router.navigate(['/officer/create-account']);
      } else if (role === 'Manager') {
        this.router.navigate(['/manager/approvals']);
      }
    },
    error: (err) => alert('Login Failed: Cannot connect to the Banking API.')
  });
}
}