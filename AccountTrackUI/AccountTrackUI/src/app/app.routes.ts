import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './components/auth/login/login';
import { CreateAccountComponent } from './components/officer/create-account/create-account';
import { AccountListComponent } from './components/officer/account-list/account-list';
import { UserManagementComponent } from './components/admin/user-management/user-management';

// Admin Dashboard Components
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { DashboardHomeComponent } from './components/admin/dashboard-home/dashboard-home.component';
import { UserManagementNewComponent } from './components/admin/user-management-new/user-management.component';
import { AccountsManagementComponent } from './components/admin/accounts-management/accounts-management.component';
import { TransactionsManagementComponent } from './components/admin/transactions-management/transactions-management.component';
import { ApprovalsManagementComponent } from './components/admin/approvals-management/approvals-management.component';
import { ReportsComponent } from './components/admin/reports/reports.component';

// Officer Components
import { TransactionComponent } from './components/officer/transactions/transactions';
import { OfficerDashboardComponent } from './components/officer/dashboard/officer-dashboard.component';

// Manager Components
import { ManagerDashboardComponent } from './components/manager/dashboard/manager-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Admin Dashboard Routes
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [roleGuard],
    data: { role: 'Admin' },
    children: [
      { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardHomeComponent },
      { path: 'users', component: UserManagementNewComponent },
      { path: 'accounts', component: AccountsManagementComponent },
      { path: 'transactions', component: TransactionsManagementComponent },
      { path: 'approvals', component: ApprovalsManagementComponent },
      { path: 'reports', component: ReportsComponent }
    ]
  },
  
  // Legacy Admin Routes (redirect to new dashboard)
  { 
    path: 'admin/users', 
    redirectTo: '/admin/users'
  },
  
  // Officer Routes
  { 
    path: 'officer/dashboard', 
    component: OfficerDashboardComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Officer' } 
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
  
  // Manager Routes
  { 
    path: 'manager/dashboard', 
    component: ManagerDashboardComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Manager' } 
  },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];