// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AccountService } from '../../../services/account.service';
// import { Account } from '../../../models/account.model';

// @Component({
//   selector: 'app-account-list',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './account-list.component.html'
// })
// export class AccountListComponent implements OnInit {
//   accounts: Account[] = [];

//   constructor(private accountService: AccountService) {}

//   ngOnInit() {
//     this.accountService.getAllAccounts().subscribe(data => this.accounts = data);
//   }

//   onClose(id: number) {
//     if(confirm('Are you sure you want to close this account?')) {
//       this.accountService.closeAccount(id).subscribe(() => this.ngOnInit());
//     }
//   }
// }