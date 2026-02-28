import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixes NG8103
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // Add CommonModule and RouterLink
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userRole: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check login state on load
    this.isLoggedIn = !!localStorage.getItem('token');
    this.userRole = this.authService.getRole();
  }

  // Fixes TS2339: Property 'logout' does not exist
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}