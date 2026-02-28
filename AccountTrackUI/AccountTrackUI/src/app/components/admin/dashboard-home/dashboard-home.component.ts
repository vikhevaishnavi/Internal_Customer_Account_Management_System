import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DashboardMetric {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  metrics: DashboardMetric[] = [
    {
      title: 'Total Accounts',
      value: '4',
      subtitle: '3 active',
      color: 'blue',
      icon: 'account'
    },
    {
      title: 'Total Balance',
      value: '$80,501.25',
      subtitle: 'all accounts combined',
      color: 'green',
      icon: 'balance'
    },
    {
      title: 'Transactions',
      value: '3',
      subtitle: 'completed this month',
      color: 'purple',
      icon: 'transactions'
    },
    {
      title: 'Pending Approvals',
      value: '2',
      subtitle: 'awaiting review',
      color: 'orange',
      icon: 'pending'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}
}
