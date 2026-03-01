import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { isPlatformBrowser } from '@angular/common';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:5000/api/v1/Accounts'; 

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('=== ACCOUNT SERVICE AUTH DEBUG ===');
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

  createAccount(account: Account): Observable<any> {
    console.log('=== CREATE ACCOUNT DEBUG ===');
    console.log('API URL:', `${this.apiUrl}/create`);
    console.log('Account data:', account);
    
    return this.http.post(`${this.apiUrl}/create`, account, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(10000), // Reduced to 10 second timeout for faster feedback
      catchError((error) => {
        console.error('=== CREATE ACCOUNT TIMEOUT/ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // New: Get all accounts for the dashboard [cite: 114]
  getAllAccounts(): Observable<Account[]> {
    console.log('=== GET ALL ACCOUNTS DEBUG ===');
    console.log('API URL:', `${this.apiUrl}/all`);
    
    return this.http.get<Account[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET ALL ACCOUNTS ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // New: Get specific account details [cite: 120]
  getAccountById(id: number): Observable<Account> {
    console.log('=== GET ACCOUNT BY ID DEBUG ===');
    console.log('API URL:', `${this.apiUrl}/details/${id}`);
    
    return this.http.get<Account>(`${this.apiUrl}/details/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== GET ACCOUNT BY ID ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  // New: Update account details
  updateAccount(id: number, account: Account): Observable<any> {
    console.log('=== UPDATE ACCOUNT DEBUG ===');
    console.log('API URL:', `${this.apiUrl}/update/${id}`);
    console.log('Account data:', account);
    
    return this.http.put(`${this.apiUrl}/update/${id}`, account, {
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

  // New: Close an account (Soft delete) [cite: 54, 114]
  closeAccount(id: number): Observable<any> {
    console.log('=== CLOSE ACCOUNT DEBUG ===');
    console.log('API URL:', `${this.apiUrl}/close/${id}`);
    
    return this.http.put(`${this.apiUrl}/close/${id}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(30000),
      catchError((error) => {
        console.error('=== CLOSE ACCOUNT ERROR ===');
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}