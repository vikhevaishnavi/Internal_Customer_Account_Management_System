import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  private baseUrl = 'http://localhost:5000/api/v1'; // Use direct URL for now

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('=== OFFICER SERVICE AUTH DEBUG ===');
    console.log('Raw token from localStorage:', token);
    console.log('Token available:', !!token);
    console.log('Token length:', token?.length || 0);
    
    // Check if token is valid format
    if (!token || token.length < 10) {
      console.error('Invalid or missing token - using empty headers');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    // Clean token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanToken}`
    });
    
    console.log('Final headers:', headers.keys().map(key => `${key}: ${headers.get(key)}`));
    return headers;
  }

  // Dashboard Metrics
  getDashboardMetrics(): Observable<DashboardMetrics> {
    console.log('=== GET DASHBOARD METRICS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Officer/dashboard/metrics`);
    
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/Officer/dashboard/metrics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== DASHBOARD METRICS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Account Management - Use AccountService paths
  getAccounts(): Observable<Account[]> {
    console.log('=== GET ACCOUNTS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Accounts/all`);
    
    return this.http.get<Account[]>(`${this.baseUrl}/Accounts/all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET ACCOUNTS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  createAccount(accountData: CreateAccountRequest): Observable<Account> {
    console.log('=== CREATE ACCOUNT DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Accounts/create`);
    console.log('Account data:', accountData);
    
    return this.http.post<Account>(`${this.baseUrl}/Accounts/create`, accountData, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== CREATE ACCOUNT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  updateAccount(accountId: string, accountData: Partial<Account>): Observable<Account> {
    console.log('=== UPDATE ACCOUNT DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Accounts/update/${accountId}`);
    console.log('Account data:', accountData);
    
    return this.http.put<Account>(`${this.baseUrl}/Accounts/update/${accountId}`, accountData, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== UPDATE ACCOUNT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  getAccountByNumber(accountNumber: string): Observable<Account> {
    console.log('=== GET ACCOUNT BY NUMBER DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Accounts/details/${accountNumber}`);
    
    return this.http.get<Account>(`${this.baseUrl}/Accounts/details/${accountNumber}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET ACCOUNT BY NUMBER ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Transaction Management
  getTransactions(accountId?: string): Observable<Transaction[]> {
    const url = accountId 
      ? `${this.baseUrl}/Transactions?accountId=${accountId}`
      : `${this.baseUrl}/Transactions`;
    console.log('=== GET TRANSACTIONS DEBUG ===');
    console.log('API URL:', url);
    
    return this.http.get<Transaction[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET TRANSACTIONS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  createTransaction(transactionData: TransactionRequest): Observable<Transaction> {
    console.log('=== CREATE TRANSACTION DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Transactions`);
    console.log('Transaction data:', transactionData);
    
    return this.http.post<Transaction>(`${this.baseUrl}/Transactions`, transactionData, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== CREATE TRANSACTION ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  getRecentTransactions(limit: number = 10): Observable<Transaction[]> {
    console.log('=== GET RECENT TRANSACTIONS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Transactions/recent?limit=${limit}`);
    
    return this.http.get<Transaction[]>(`${this.baseUrl}/Transactions/recent?limit=${limit}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET RECENT TRANSACTIONS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Notifications
  getNotifications(): Observable<Notification[]> {
    console.log('=== GET NOTIFICATIONS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Notifications`);
    
    return this.http.get<Notification[]>(`${this.baseUrl}/Notifications`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET NOTIFICATIONS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    console.log('=== MARK NOTIFICATION READ DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Notifications/${notificationId}/read`);
    
    return this.http.patch<void>(`${this.baseUrl}/Notifications/${notificationId}/read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== MARK NOTIFICATION READ ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  getUnreadNotificationsCount(): Observable<{ count: number }> {
    console.log('=== GET UNREAD COUNT DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Notifications/unread-count`);
    
    return this.http.get<{ count: number }>(`${this.baseUrl}/Notifications/unread-count`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET UNREAD COUNT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Search and Filter
  searchAccounts(query: string): Observable<Account[]> {
    console.log('=== SEARCH ACCOUNTS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Accounts/search?q=${query}`);
    
    return this.http.get<Account[]>(`${this.baseUrl}/Accounts/search?q=${query}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== SEARCH ACCOUNTS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  searchTransactions(query: string): Observable<Transaction[]> {
    console.log('=== SEARCH TRANSACTIONS DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Transactions/search?q=${query}`);
    
    return this.http.get<Transaction[]>(`${this.baseUrl}/Transactions/search?q=${query}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== SEARCH TRANSACTIONS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // Reports
  getTransactionReport(startDate: string, endDate: string): Observable<any> {
    console.log('=== GET TRANSACTION REPORT DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Reports/transactions?start=${startDate}&end=${endDate}`);
    
    return this.http.get<any>(`${this.baseUrl}/Reports/transactions?start=${startDate}&end=${endDate}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET TRANSACTION REPORT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  getAccountReport(): Observable<any> {
    console.log('=== GET ACCOUNT REPORT DEBUG ===');
    console.log('API URL:', `${this.baseUrl}/Reports/accounts`);
    
    return this.http.get<any>(`${this.baseUrl}/Reports/accounts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET ACCOUNT REPORT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}
