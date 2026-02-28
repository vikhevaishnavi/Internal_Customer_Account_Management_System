import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Account {
  accountNumber: string;
  customerName: string;
  type: string;
  balance: number;
  status: string;
  approval: string;
  createdDate: string;
}

@Component({
  selector: 'app-accounts-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts-management.component.html',
  styleUrls: ['./accounts-management.component.css']
})
export class AccountsManagementComponent implements OnInit {
  accounts: Account[] = [
    {
      accountNumber: 'ACC001234567',
      customerName: 'John Doe',
      type: 'Current',
      balance: 25000.00,
      status: 'Active',
      approval: 'Approved',
      createdDate: '2026-02-15'
    },
    {
      accountNumber: 'ACC001234568',
      customerName: 'Jane Smith',
      type: 'Savings',
      balance: 45000.50,
      status: 'Active',
      approval: 'Approved',
      createdDate: '2026-02-18'
    },
    {
      accountNumber: 'ACC001234569',
      customerName: 'Robert Williams',
      type: 'Current',
      balance: 10500.75,
      status: 'Pending',
      approval: 'Pending',
      createdDate: '2026-02-20'
    },
    {
      accountNumber: 'ACC001234570',
      customerName: 'Sarah Johnson',
      type: 'Savings',
      balance: 0.00,
      status: 'Inactive',
      approval: 'Approved',
      createdDate: '2026-02-10'
    }
  ];

  searchTerm: string = '';
  filteredAccounts: Account[] = [...this.accounts];

  ngOnInit(): void {}

  onSearchChange(): void {
    this.filteredAccounts = this.accounts.filter(account =>
      account.accountNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      account.customerName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  }

  getApprovalBadgeClass(approval: string): string {
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

  formatBalance(balance: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  }
}
