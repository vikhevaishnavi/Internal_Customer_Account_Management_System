import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('=== ACCOUNT LIST INIT ===');
    this.loadAccounts();
  }

  loadAccounts() {
    console.log('=== LOADING ACCOUNTS ===');
    this.accountService.getAllAccounts().subscribe({
      next: (data: Account[]) => {
        console.log('=== ACCOUNTS LOADED SUCCESSFULLY ===');
        this.accounts = data;
      },
      error: (error) => {
        console.log('=== ERROR LOADING ACCOUNTS ===');
        console.error('Error:', error);
      }
    });
  }
}
