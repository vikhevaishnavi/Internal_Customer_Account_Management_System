import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Approval {
  id: number;
  type: string;
  requestedOn: string;
  requestedBy: string;
  description: string;
  details: {
    accountNumber?: string;
    customerName?: string;
    transactionId?: string;
    amount?: number;
  };
  status: string;
}

@Component({
  selector: 'app-approvals-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approvals-management.component.html',
  styleUrls: ['./approvals-management.component.css']
})
export class ApprovalsManagementComponent implements OnInit {
  approvals: Approval[] = [
    {
      id: 1,
      type: 'Account',
      requestedOn: '2026-02-20',
      requestedBy: 'officer',
      description: 'New Current account for Robert Williams - ACC001234569',
      details: {
        accountNumber: 'ACC001234569',
        customerName: 'Robert Williams'
      },
      status: 'pending'
    },
    {
      id: 2,
      type: 'Transaction',
      requestedOn: '2026-02-22',
      requestedBy: 'officer',
      description: 'Large transfer requiring manager approval',
      details: {
        transactionId: 'TXN001234567',
        amount: 150000.00
      },
      status: 'pending'
    }
  ];

  selectedFilter: string = 'all';
  filteredApprovals: Approval[] = [...this.approvals];
  filterCounts = {
    all: 2,
    accounts: 1,
    transactions: 1
  };

  ngOnInit(): void {}

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.filterApprovals();
  }

  filterApprovals(): void {
    if (this.selectedFilter === 'all') {
      this.filteredApprovals = [...this.approvals];
    } else if (this.selectedFilter === 'accounts') {
      this.filteredApprovals = this.approvals.filter(a => a.type === 'Account');
    } else if (this.selectedFilter === 'transactions') {
      this.filteredApprovals = this.approvals.filter(a => a.type === 'Transaction');
    }
  }

  approveRequest(approval: Approval): void {
    const index = this.approvals.findIndex(a => a.id === approval.id);
    if (index !== -1) {
      this.approvals.splice(index, 1);
      this.filterApprovals();
      this.updateFilterCounts();
    }
  }

  rejectRequest(approval: Approval): void {
    if (confirm(`Are you sure you want to reject this ${approval.type.toLowerCase()} request?`)) {
      const index = this.approvals.findIndex(a => a.id === approval.id);
      if (index !== -1) {
        this.approvals.splice(index, 1);
        this.filterApprovals();
        this.updateFilterCounts();
      }
    }
  }

  updateFilterCounts(): void {
    this.filterCounts.all = this.approvals.length;
    this.filterCounts.accounts = this.approvals.filter(a => a.type === 'Account').length;
    this.filterCounts.transactions = this.approvals.filter(a => a.type === 'Transaction').length;
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTypeIcon(type: string): string {
    return type === 'Account' ? 'account' : 'transaction';
  }
}
