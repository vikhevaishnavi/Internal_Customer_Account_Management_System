import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  accountId: string;
  customerName: string;
  customerId: string;
  accountType: 'Savings' | 'Current';
  balance: number;
  status: 'Active' | 'Closed' | 'Pending';
  approval: 'Approved' | 'Pending' | 'Rejected';
  createdDate: string;
  branch: string;
}

export interface Transaction {
  transactionId: string;
  accountId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  description: string;
  accountNumber?: string;
  customerName?: string;
}

export interface CreateAccountRequest {
  customerName: string;
  customerId: string;
  accountType: 'Savings' | 'Current';
  initialDeposit?: number;
  branch: string;
}

export interface TransactionRequest {
  accountId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  description?: string;
  targetAccountId?: string; // For transfers
}

export interface DashboardMetrics {
  totalAccounts: number;
  todayTransactions: number;
  pendingApprovals: number;
  newCustomers: number;
  accountGrowthRate: number;
  transactionVolume: number;
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: 'ApprovalReminder' | 'SuspiciousActivity' | 'SystemAlert';
  message: string;
  status: 'Unread' | 'Read';
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfficerService {
  private baseUrl = 'https://localhost:7154/api'; // Updated to match your backend

  constructor(private http: HttpClient) {}

  // Dashboard Metrics
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/Officer/dashboard/metrics`);
  }

  // Account Management
  getAccounts(): Observable<Account[]> {
    console.log('Fetching accounts from:', `${this.baseUrl}/Accounts`);
    return this.http.get<Account[]>(`${this.baseUrl}/Accounts`);
  }

  createAccount(accountData: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/Accounts`, accountData);
  }

  updateAccount(accountId: string, accountData: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/Accounts/${accountId}`, accountData);
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/Accounts/by-number/${accountNumber}`);
  }

  // Transaction Management
  getTransactions(accountId?: string): Observable<Transaction[]> {
    const url = accountId 
      ? `${this.baseUrl}/Transactions?accountId=${accountId}`
      : `${this.baseUrl}/Transactions`;
    return this.http.get<Transaction[]>(url);
  }

  createTransaction(transactionData: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/Transactions`, transactionData);
  }

  getRecentTransactions(limit: number = 10): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/Transactions/recent?limit=${limit}`);
  }

  // Notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/Notifications`);
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/Notifications/${notificationId}/read`, {});
  }

  getUnreadNotificationsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/Notifications/unread-count`);
  }

  // Search and Filter
  searchAccounts(query: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/Accounts/search?q=${query}`);
  }

  searchTransactions(query: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/Transactions/search?q=${query}`);
  }

  // Reports
  getTransactionReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Reports/transactions?start=${startDate}&end=${endDate}`);
  }

  getAccountReport(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Reports/accounts`);
  }
}
