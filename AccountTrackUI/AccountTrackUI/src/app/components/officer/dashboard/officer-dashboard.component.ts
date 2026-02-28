import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OfficerService, DashboardMetrics, Transaction, Notification } from '../../../services/officer.service';

interface DashboardMetric {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
  change?: string;
}

interface RecentTransaction {
  id: string;
  accountNumber: string;
  customerName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './officer-dashboard.component.html',
  styleUrls: ['./officer-dashboard.component.css']
})
export class OfficerDashboardComponent implements OnInit {
  currentUser: string = '';
  metrics: DashboardMetric[] = [];
  recentTransactions: Transaction[] = [];
  notifications: Notification[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private officerService: OfficerService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()?.name || 'Bank Officer';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all dashboard data in parallel
    this.officerService.getDashboardMetrics().subscribe({
      next: (metrics: DashboardMetrics) => {
        this.metrics = this.formatMetrics(metrics);
        console.log('Real-time metrics loaded:', metrics);
      },
      error: (err) => {
        console.error('Error loading metrics:', err);
        // Show error state instead of fallback data
        this.metrics = [];
      }
    });

    this.officerService.getRecentTransactions(5).subscribe({
      next: (transactions: Transaction[]) => {
        this.recentTransactions = transactions;
        console.log('Real-time transactions loaded:', transactions);
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        // Show error state instead of fallback data
        this.recentTransactions = [];
      }
    });

    this.officerService.getNotifications().subscribe({
      next: (notifications: Notification[]) => {
        this.notifications = notifications;
        console.log('Real-time notifications loaded:', notifications);
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        // Show error state instead of fallback data
        this.notifications = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  formatMetrics(metrics: DashboardMetrics): DashboardMetric[] {
    return [
      {
        title: 'Total Accounts',
        value: metrics.totalAccounts.toString(),
        subtitle: 'Active accounts',
        color: 'blue',
        icon: 'account',
        change: `+${metrics.accountGrowthRate}% this month`
      },
      {
        title: 'Today\'s Transactions',
        value: metrics.todayTransactions.toString(),
        subtitle: 'Completed today',
        color: 'green',
        icon: 'transaction',
        change: '+8% from yesterday'
      },
      {
        title: 'Pending Approvals',
        value: metrics.pendingApprovals.toString(),
        subtitle: 'Awaiting review',
        color: 'orange',
        icon: 'pending'
      },
      {
        title: 'New Customers',
        value: metrics.newCustomers.toString(),
        subtitle: 'This week',
        color: 'purple',
        icon: 'customer',
        change: '+2 new today'
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  getMetricIcon(icon: string): string {
    switch (icon) {
      case 'account':
        return 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2';
      case 'transaction':
        return 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6';
      case 'pending':
        return 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6';
      case 'customer':
        return 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  }

  markAsRead(notificationId: string): void {
    this.officerService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.notificationId === notificationId);
        if (notification) {
          notification.status = 'Read';
        }
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
        // Still update locally for better UX
        const notification = this.notifications.find(n => n.notificationId === notificationId);
        if (notification) {
          notification.status = 'Read';
        }
      }
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => n.status === 'Unread').length;
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}
