import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../services/transaction.service'; // Use TransactionService

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html'
})
export class TransactionComponent {
  transaction = { accountID: null, type: 'Deposit', amount: 0 };

  // Inject TransactionService instead of AccountService
  constructor(private transactionService: TransactionService) {}

  onProcess() {
    // Fixes TS2339: Property 'createTransaction' does not exist on type 'AccountService'
    this.transactionService.createTransaction(this.transaction).subscribe({
      next: () => alert('Success!'),
      error: () => alert('Error')
    });
  }
}