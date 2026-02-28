import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './components/auth/login/login';
import { CreateAccountComponent } from './components/officer/create-account/create-account';
import { AccountListComponent } from './components/officer/account-list/account-list';
import { UserManagementComponent } from './components/admin/user-management/user-management';

// ADD THIS IMPORT:
import { TransactionComponent } from './components/officer/transactions/transactions'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin/users', 
    component: UserManagementComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'officer/create-account', 
    component: CreateAccountComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Officer' } 
  },
  { 
    path: 'officer/account-list', 
    component: AccountListComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Officer' } 
  },
  { 
    path: 'officer/transactions', 
    component: TransactionComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Officer' } 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];