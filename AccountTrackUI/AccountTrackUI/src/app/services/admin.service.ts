import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:5000/api'; // Use full URL since proxy is disabled

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('=== AUTH DEBUG ===');
    console.log('Raw token from localStorage:', token);
    console.log('Token available:', !!token);
    console.log('Token length:', token?.length || 0);
    
    // Check if token is valid format
    if (!token || token.length < 10) {
      console.error('Invalid or missing token');
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
  getDashboardMetrics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/dashboard/metrics`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching dashboard metrics:', error);
        throw error;
      })
    );
  }

  // Users Management
  getUsers(): Observable<any> {
    console.log('Making GET request to:', `${this.baseUrl}/Users`);
    console.log('Headers:', this.getAuthHeaders());
    
    return this.http.get(`${this.baseUrl}/Users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching users:', error);
        throw error;
      })
    );
  }

  createUser(userData: any): Observable<any> {
    console.log('=== CREATE USER DEBUG ===');
    console.log('Making POST request to:', `${this.baseUrl}/Users`);
    console.log('User data being sent:', userData);
    
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    
    // Ensure proper data format
    const requestData = {
      Name: userData.Name,
      Email: userData.Email,
      Password: userData.Password,
      Role: userData.Role,
      Branch: userData.Branch
    };
    
    console.log('Final request data:', requestData);
    
    return this.http.post(`${this.baseUrl}/Users`, requestData, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('=== CREATE USER ERROR ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error response:', error.error);
        }
        throw error;
      })
    );
  }

  updateUser(userId: number, userData: any): Observable<any> {
    console.log('=== UPDATE USER DEBUG ===');
    console.log('Making PUT request to:', `${this.baseUrl}/Users/${userId}`);
    console.log('User data being sent:', userData);
    
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    
    return this.http.put(`${this.baseUrl}/Users/${userId}`, userData, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('=== UPDATE USER ERROR ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error response:', error.error);
        }
        throw error;
      })
    );
  }

  updateUserStatus(userId: number, status: string): Observable<any> {
    console.log('=== UPDATE USER STATUS DEBUG ===');
    console.log('Making PATCH request to:', `${this.baseUrl}/Users/${userId}/status`);
    console.log('Status being sent:', status);
    
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    
    return this.http.patch(`${this.baseUrl}/Users/${userId}/status`, status, {
      headers: headers
    }).pipe(
      catchError((error) => {
        console.error('=== UPDATE USER STATUS ERROR ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error response:', error.error);
        }
        throw error;
      })
    );
  }

  // Accounts Management
  getAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Accounts`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching accounts:', error);
        throw error;
      })
    );
  }

  createAccount(accountData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Accounts`, accountData).pipe(
      catchError((error) => {
        console.error('Error creating account:', error);
        throw error;
      })
    );
  }

  updateAccount(accountId: number, accountData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Accounts/${accountId}`, accountData).pipe(
      catchError((error) => {
        console.error('Error updating account:', error);
        throw error;
      })
    );
  }

  // Transactions Management
  getTransactions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Transactions`).pipe(
      catchError((error) => {
        console.error('Error fetching transactions:', error);
        throw error;
      })
    );
  }

  createTransaction(transactionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Transactions`, transactionData).pipe(
      catchError((error) => {
        console.error('Error creating transaction:', error);
        throw error;
      })
    );
  }

  // Approvals Management
  getApprovals(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Approvals`).pipe(
      catchError((error) => {
        console.error('Error fetching approvals:', error);
        throw error;
      })
    );
  }

  updateApproval(approvalId: number, decision: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Approvals/${approvalId}`, decision).pipe(
      catchError((error) => {
        console.error('Error updating approval:', error);
        throw error;
      })
    );
  }

  // Reports
  getReports(reportParams?: any): Observable<any> {
    const params = reportParams ? `?${new URLSearchParams(reportParams)}` : '';
    return this.http.get(`${this.baseUrl}/Reports${params}`).pipe(
      catchError((error) => {
        console.error('Error fetching reports:', error);
        throw error;
      })
    );
  }

  generateReport(reportData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Reports/generate`, reportData).pipe(
      catchError((error) => {
        console.error('Error generating report:', error);
        throw error;
      })
    );
  }
}
