import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // Matches the transaction endpoint structure in your LLD [cite: 115]
  private apiUrl = 'https://localhost:7154/api/v1/transactions';

  constructor(private http: HttpClient) { }

  // Record deposits, withdrawals, and transfers [cite: 57]
  createTransaction(transaction: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, transaction);
  }

  // Get history for a specific account 
  getHistory(accountId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history/${accountId}`);
  }
}