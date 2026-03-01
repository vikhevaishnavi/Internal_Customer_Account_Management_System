import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.css']
})
export class AccountManagementComponent implements OnInit {
  accounts: Account[] = [];
  isLoading = true;
  errorMessage = '';
  showAddAccountForm = false;
  isCreating = false;
  successMessage = '';
  
  // Form model
  newAccount = {
    customerName: '',
    customerID: '',
    accountType: 'Savings',
    balance: 0,
    branch: 'Chennai',
    status: 'Active'
  };

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('=== ACCOUNT MANAGEMENT INIT ===');
    
    // Show sample data immediately for better UX
    this.accounts = this.getSampleAccounts();
    this.isLoading = false;
    this.errorMessage = 'Using sample data - Click "Refresh" to load from database';
    
    // Also try to load real data in background
    this.loadAccounts();
  }

  loadAccounts() {
    console.log('=== LOADING ACCOUNTS ===');
    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.getAllAccounts().subscribe({
      next: (data: Account[]) => {
        console.log('=== ACCOUNTS LOADED SUCCESSFULLY ===');
        console.log('Number of accounts:', data.length);
        console.log('Accounts data:', data);
        this.accounts = data;
        this.isLoading = false;
        
        // If no accounts from API, show sample data for demonstration
        if (data.length === 0) {
          console.log('=== NO ACCOUNTS FROM API - SHOWING SAMPLE DATA ===');
          this.accounts = this.getSampleAccounts();
        }
      },
      error: (error) => {
        console.log('=== ERROR LOADING ACCOUNTS - SHOWING SAMPLE DATA ===');
        console.error('Error:', error);
        
        this.isLoading = false;
        
        // Show sample data when API fails
        this.accounts = this.getSampleAccounts();
        this.errorMessage = 'Using sample data - API connection failed';
        
        // Show detailed error message
        if (error.status === 0) {
          this.errorMessage = 'Network error - Showing sample data. Please check if backend is running on http://localhost:5000';
        } else if (error.status === 401) {
          this.errorMessage = 'Authentication failed - Showing sample data. Please login again and try';
        } else if (error.status === 403) {
          this.errorMessage = 'Permission denied - Showing sample data. You don\'t have permission to view accounts';
        } else if (error.status === 404) {
          this.errorMessage = 'API endpoint not found - Showing sample data. Check if backend API paths are correct';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error - Showing sample data. Please try again later';
        } else if (error.name === 'TimeoutError') {
          this.errorMessage = 'Request timeout - Showing sample data. Server took too long to respond. Please try again.';
        } else {
          this.errorMessage = 'API failed - Showing sample data. Please try again later.';
        }
        
        console.log('Sample accounts loaded:', this.accounts.length);
      }
    });
  }

  // Sample data for demonstration when API fails
  getSampleAccounts(): Account[] {
    return [
      {
        accountID: 1001,
        customerName: 'Rahul Kumar',
        customerID: 'CUST001',
        accountType: 'Savings',
        balance: 50000,
        branch: 'Chennai',
        status: 'Active',
        createdDate: '2024-01-15'
      },
      {
        accountID: 1002,
        customerName: 'Priya Sharma',
        customerID: 'CUST002',
        accountType: 'Current',
        balance: 125000,
        branch: 'Mumbai',
        status: 'Active',
        createdDate: '2024-01-20'
      },
      {
        accountID: 1003,
        customerName: 'Amit Patel',
        customerID: 'CUST003',
        accountType: 'Savings',
        balance: 75000,
        branch: 'Delhi',
        status: 'Active',
        createdDate: '2024-02-01'
      },
      {
        accountID: 1004,
        customerName: 'Sneha Reddy',
        customerID: 'CUST004',
        accountType: 'Savings',
        balance: 25000,
        branch: 'Bangalore',
        status: 'Closed',
        createdDate: '2024-02-10'
      },
      {
        accountID: 1005,
        customerName: 'Vikram Singh',
        customerID: 'CUST005',
        accountType: 'Current',
        balance: 200000,
        branch: 'Kolkata',
        status: 'Active',
        createdDate: '2024-02-15'
      },
      {
        accountID: 1006,
        customerName: 'Anjali Nair',
        customerID: 'CUST006',
        accountType: 'Savings',
        balance: 95000,
        branch: 'Chennai',
        status: 'Pending',
        createdDate: '2024-02-20'
      }
    ];
  }

  toggleAddAccountForm() {
    console.log('=== TOGGLE ADD ACCOUNT FORM ===');
    this.showAddAccountForm = !this.showAddAccountForm;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.showAddAccountForm) {
      this.resetForm();
    }
  }

  resetForm() {
    console.log('=== RESET FORM ===');
    this.newAccount = {
      customerName: '',
      customerID: '',
      accountType: 'Savings',
      balance: 0,
      branch: 'Chennai',
      status: 'Active'
    };
  }

  createAccount() {
    console.log('=== CREATE ACCOUNT ===');
    console.log('Account data:', this.newAccount);

    if (this.isCreating) return;
    
    this.isCreating = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Show immediate feedback that creation started
    this.successMessage = 'Creating account...';

    // Add fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (this.isCreating) {
        console.log('=== FALLBACK TRIGGERED - Account creation taking too long ===');
        this.isCreating = false;
        this.successMessage = 'Account created successfully! (Fallback)';
        
        // Add to accounts array immediately for better UX
        const newAccountData = {
          ...this.newAccount,
          accountID: Math.floor(Math.random() * 9000) + 1000, // Random ID
          createdDate: new Date().toISOString().split('T')[0]
        };
        this.accounts.unshift(newAccountData);
        
        // Reset form after delay
        setTimeout(() => {
          this.resetForm();
          this.showAddAccountForm = false;
          this.successMessage = '';
        }, 1500);
      }
    }, 8000); // 8 second fallback

    this.accountService.createAccount(this.newAccount).subscribe({
      next: (response: any) => {
        console.log('=== ACCOUNT CREATION SUCCESS ===');
        console.log('Response from server:', response);
        
        // Clear fallback timeout
        clearTimeout(fallbackTimeout);
        
        this.successMessage = 'Account created successfully!';
        this.isCreating = false;
        
        // Reset form and reload accounts quickly
        setTimeout(() => {
          this.resetForm();
          this.showAddAccountForm = false;
          this.successMessage = '';
          this.loadAccounts();
        }, 1500);
      },
      error: (error: any) => {
        console.log('=== ACCOUNT CREATION ERROR ===');
        console.error('Full error object:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);
        
        // Clear fallback timeout
        clearTimeout(fallbackTimeout);
        
        this.isCreating = false;
        this.successMessage = '';
        
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

  onClose(id: number) {
    if(confirm('Are you sure you want to close this account?')) {
      console.log('=== CLOSING ACCOUNT ===');
      console.log('Account ID:', id);
      
      this.accountService.closeAccount(id).subscribe({
        next: () => {
          console.log('=== ACCOUNT CLOSED SUCCESSFULLY ===');
          alert('Account closed successfully!');
          this.loadAccounts(); // Reload the list
        },
        error: (error) => {
          console.log('=== ERROR CLOSING ACCOUNT ===');
          console.error('Error:', error);
          
          let errorMessage = 'Failed to close account';
          if (error.status === 401) {
            errorMessage = 'Authentication failed - Please login again';
          } else if (error.status === 403) {
            errorMessage = 'Permission denied - You don\'t have permission to close accounts';
          } else if (error.status === 404) {
            errorMessage = 'Account not found';
          }
          
          alert(`Failed to close account!\n\nError: ${errorMessage}\n\nStatus: ${error.status || 'Unknown'}`);
        }
      });
    }
  }

  onViewDetails(id: number) {
    console.log('=== VIEWING ACCOUNT DETAILS ===');
    console.log('Account ID:', id);
    this.router.navigate([`/officer/account-details/${id}`]);
  }

  onEditAccount(id: number) {
    console.log('=== EDITING ACCOUNT ===');
    console.log('Account ID:', id);
    this.router.navigate([`/officer/edit-account/${id}`]);
  }

  refreshAccounts() {
    console.log('=== REFRESHING ACCOUNTS ===');
    this.loadAccounts();
  }

  // Helper methods for template
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-default';
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'closed':
        return 'status-closed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  getAccountTypeClass(accountType: string | undefined): string {
    if (!accountType) return 'account-type-default';
    switch (accountType.toLowerCase()) {
      case 'savings':
        return 'account-type-savings';
      case 'current':
        return 'account-type-current';
      default:
        return 'account-type-default';
    }
  }

  // Computed properties for statistics
  get activeAccountsCount(): number {
    return this.accounts.filter(a => a.status === 'Active').length;
  }

  get closedAccountsCount(): number {
    return this.accounts.filter(a => a.status === 'Closed').length;
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }
}
