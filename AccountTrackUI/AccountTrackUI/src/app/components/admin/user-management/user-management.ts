import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html', // Use the external file
  styleUrl: './user-management.component.css'    // Optional
})
export class UserManagementComponent {
  // Ensure this object contains ALL fields required by the API
  user = { 
    name: '', 
    role: 'Officer', 
    email: '', 
    password: '', 
    branch: '' 
  };

  constructor(private http: HttpClient) {}

  onRegister() {
    // This sends the payload to your backend controller
    this.http.post('https://localhost:7154/api/Users', this.user).subscribe({
      next: () => {
        alert('User successfully registered in database!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error(err);
        alert('Registration failed. Ensure the backend is running and CORS is enabled.');
      }
    });
  }

  resetForm() {
    this.user = { name: '', role: 'Officer', email: '', password: '', branch: '' };
  }
}