import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-list.component.html'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];

  constructor(
      private accountService: AccountService, 
      private router: Router 
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => this.accounts = data,
      error: (err) => console.error('Failed to load accounts', err)
    });
  }

  viewDetails(id: number | undefined) {
  if (id) {
    this.router.navigate(['/officer/account-details', id]);
  }
}

// Fixes TS2339: Property 'onClose'
onClose(id: number | undefined) {
  if (id && confirm('Are you sure you want to close this account?')) {
    this.accountService.closeAccount(id).subscribe({
      next: () => {
        alert('Account Closed');
        this.loadAccounts(); // Refresh the table
      }
    });
  }
}

  onCloseAccount(id: number) {
  if (confirm('Are you sure you want to close this account?')) {
    this.accountService.closeAccount(id).subscribe({
      next: () => {
        alert('Account closed successfully');
        this.loadAccounts(); 
      },
      error: (err: any) => console.error('Error closing account', err)
    });
  }
}
}