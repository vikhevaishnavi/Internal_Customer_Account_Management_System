import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-account.component.html'
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

  constructor(private accountService: AccountService) {}

  onSubmit() {
    this.accountService.createAccount(this.account).subscribe({
      next: (res: any) => alert('Account Created Successfully!'),
      error: (err: any) => console.error('Error!', err)
    });
  }
}