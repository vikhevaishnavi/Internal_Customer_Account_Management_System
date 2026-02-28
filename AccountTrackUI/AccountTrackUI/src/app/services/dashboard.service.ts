import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardMetric {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  color: string;
  icon: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  branch: string;
}

export interface Account {
  accountNumber: string;
  customerName: string;
  type: string;
  balance: number;
  status: string;
  approval: string;
  createdDate: string;
}

export interface Transaction {
  id: number;
  type: string;
  accountNumber: string;
  amount: number;
  date: string;
  description: string;
  status: string;
  approval: string;
}

export interface Approval {
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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Dashboard Metrics
  getDashboardMetrics(): Observable<DashboardMetric[]> {
    return this.http.get<DashboardMetric[]>(`${this.apiUrl}/dashboard/metrics`);
  }

  // Users Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  // Accounts Management
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }

  createAccount(account: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, account);
  }

  updateAccount(accountNumber: string, account: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/accounts/${accountNumber}`, account);
  }

  deleteAccount(accountNumber: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${accountNumber}`);
  }

  // Transactions Management
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  createTransaction(transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, transaction);
  }

  // Approvals Management
  getApprovals(): Observable<Approval[]> {
    return this.http.get<Approval[]>(`${this.apiUrl}/approvals`);
  }

  approveRequest(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approvals/${id}/approve`, {});
  }

  rejectRequest(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approvals/${id}/reject`, {});
  }

  // Reports
  getAccountTypeDistribution(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/account-types`);
  }

  getTransactionAmountByType(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/transaction-amounts`);
  }

  exportReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/export`, { responseType: 'blob' });
  }
}
