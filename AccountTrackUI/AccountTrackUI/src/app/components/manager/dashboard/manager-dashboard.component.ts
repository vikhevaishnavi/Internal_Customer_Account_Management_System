import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { OfficerService, Account } from '../../../services/officer.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {
  currentUser: string = 'Jane Manager';
  searchTerm: string = '';
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  isLoading = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private officerService: OfficerService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.officerService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        this.filteredAccounts = [...this.accounts];
        console.log('Real-time accounts loaded:', accounts);
      },
      error: (err) => {
        console.error('Error loading accounts from backend:', err);
        // Show error message instead of fallback data
        this.accounts = [];
        this.filteredAccounts = [];
        this.errorMessage = 'Failed to load accounts from database. Please check your connection.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  showError(message: string): void {
    this.errorMessage = message;
  }

  onSearchChange(): void {
    if (!this.searchTerm) {
      this.filteredAccounts = [...this.accounts];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredAccounts = this.accounts.filter(account =>
      account.customerName.toLowerCase().includes(searchLower) ||
      account.accountId.toLowerCase().includes(searchLower)
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'inactive':
        return 'status-inactive';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }

  getApprovalClass(approval: string): string {
    switch (approval.toLowerCase()) {
      case 'approved':
        return 'approval-approved';
      case 'pending':
        return 'approval-pending';
      case 'rejected':
        return 'approval-rejected';
      default:
        return 'approval-default';
    }
  }

  refreshData(): void {
    this.loadAccounts();
  }
}
