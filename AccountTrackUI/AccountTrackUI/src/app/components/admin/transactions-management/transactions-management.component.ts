import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Transaction {
  id: number;
  type: string;
  accountNumber: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  approval: string;
}

@Component({
  selector: 'app-transactions-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions-management.component.html',
  styleUrls: ['./transactions-management.component.css']
})
export class TransactionsManagementComponent implements OnInit {
  transactions: Transaction[] = [
    {
      id: 1,
      type: 'Deposit',
      accountNumber: 'ACC001234567',
      amount: 5000.00,
      date: '2026-02-20',
      description: 'Initial deposit',
      status: 'Completed',
      approval: 'Approved'
    },
    {
      id: 2,
      type: 'Withdrawal',
      accountNumber: 'ACC001234568',
      amount: 1500.00,
      date: '2026-02-21',
      description: 'ATM withdrawal',
      status: 'Completed',
      approval: 'Approved'
    },
    {
      id: 3,
      type: 'Transfer',
      accountNumber: 'ACC001234569',
      amount: 150000.00,
      date: '2026-02-22',
      description: 'Large transfer to savings - requires manager approval',
      status: 'Pending',
      approval: 'Pending'
    }
  ];

  searchTerm: string = '';
  filteredTransactions: Transaction[] = [...this.transactions];

  ngOnInit(): void {}

  onSearchChange(): void {
    this.filteredTransactions = this.transactions.filter(transaction =>
      transaction.accountNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'deposit';
      case 'withdrawal':
        return 'withdrawal';
      case 'transfer':
        return 'transfer';
      default:
        return 'default';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
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

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'type-deposit';
      case 'withdrawal':
        return 'type-withdrawal';
      case 'transfer':
        return 'type-transfer';
      default:
        return 'type-default';
    }
  }
}
