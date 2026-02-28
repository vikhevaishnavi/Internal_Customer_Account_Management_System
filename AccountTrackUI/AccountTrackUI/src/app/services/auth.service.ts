import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Use relative URL for proxy - will be proxied to https://localhost:7154/api/Users

  private platformId = inject(PLATFORM_ID);
  private apiUrl = '/api/Users'; 

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // Your backend returns 'accessToken' and 'refreshToken'
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        
        // We will decode the role from the JWT token
        const role = this.decodeRoleFromToken(res.accessToken);
        localStorage.setItem('role', role);
      })
    );
  }

  private decodeRoleFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Your backend uses ClaimTypes.Role which maps to this key in JWT
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (e) {
      return '';
    }
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('role');
    }
    return null;
  }

  logout() {
    localStorage.clear();
  }

  getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            name: payload.name || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 'User',
            email: payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || '',
            role: this.getRole()
          };
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}