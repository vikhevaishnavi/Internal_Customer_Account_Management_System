import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:7154/api/v1/accounts'; 

  constructor(private http: HttpClient) { }

  createAccount(account: Account): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, account);
  }

  // New: Get all accounts for the dashboard [cite: 114]
  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/all`);
  }

  // New: Get specific account details [cite: 120]
  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/details/${id}`);
  }

  // New: Close an account (Soft delete) [cite: 54, 114]
  closeAccount(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/close/${id}`, {});
  }
}