import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent {
  // MUST be inside the class curly braces [cite: 46, 54]
  account: Account = {
    customerName: '',
    customerID: '',
    accountType: 'Savings', // [cite: 52]
    balance: 0,
    branch: 'Chennai',
    status: 'Active' // [cite: 54]
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private accountService: AccountService, private router: Router) {}

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    console.log('Creating account:', this.account);

    this.accountService.createAccount(this.account).subscribe({
      next: (response: any) => {
        console.log('=== ACCOUNT CREATION SUCCESS ===');
        console.log('Response from server:', response);
        this.successMessage = 'Account created successfully!';
        this.isLoading = false;
        
        // Show success screen instead of alert
        // The success screen will be shown automatically due to successMessage being set
      },
      error: (error: any) => {
        console.log('=== ACCOUNT CREATION ERROR ===');
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);
        
        this.errorMessage = 'Failed to create account. Please try again.';
        this.isLoading = false;
        
        // Show detailed error alert
        let errorDetails = 'Unknown error occurred';
        
        if (error.name === 'TimeoutError') {
          errorDetails = 'Request timeout - Server took too long to respond. Please try again.';
        } else if (error.status === 0) {
          errorDetails = 'Network error - unable to connect to server. Please check if backend is running on http://localhost:5000';
        } else if (error.status === 401) {
          errorDetails = 'Authentication failed - Please login again and try';
        } else if (error.status === 403) {
          errorDetails = 'Permission denied - You don\'t have permission to create accounts';
        } else if (error.status === 404) {
          errorDetails = 'API endpoint not found - Check if backend API paths are correct';
        } else if (error.status === 500) {
          errorDetails = 'Server error - Please try again later';
        } else if (error.error && error.error.message) {
          errorDetails = error.error.message;
        } else if (error.message) {
          errorDetails = error.message;
        } else if (error.statusText) {
          errorDetails = `Server error: ${error.statusText}`;
        }
        
        console.log('=== ERROR DETAILS FOR USER ===');
        console.log('Error details:', errorDetails);
        
        alert(`Failed to create account!\n\nError: ${errorDetails}\n\nStatus: ${error.status || 'Unknown'}\n\nPlease check browser console (F12) for more details.`);
      }
    });
  }

  resetForm() {
    this.account = {
      customerName: '',
      customerID: '',
      accountType: 'Savings',
      balance: 0,
      branch: 'Chennai',
      status: 'Active'
    };
    this.successMessage = '';
    this.errorMessage = '';
  }

  createAnotherAccount() {
    this.resetForm();
  }

  goToDashboard() {
    this.router.navigate(['/officer/dashboard']);
  }
}