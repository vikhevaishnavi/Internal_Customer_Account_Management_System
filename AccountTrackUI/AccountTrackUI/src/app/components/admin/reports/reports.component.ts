import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: string;
}

interface ChartData {
  labels: string[];
  data: number[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  metrics: DashboardMetric[] = [
    {
      title: 'Total Accounts',
      value: '4',
      change: '+12% from last month',
      color: 'blue',
      icon: 'account'
    },
    {
      title: 'Total Balance',
      value: '$80.5K',
      change: '+8% from last month',
      color: 'green',
      icon: 'balance'
    },
    {
      title: 'Total Transactions',
      value: '4',
      change: '+15% from last month',
      color: 'purple',
      icon: 'transactions'
    },
    {
      title: 'Transaction Value',
      value: '$159.5K',
      change: '+10% from last month',
      color: 'orange',
      icon: 'value'
    }
  ];

  accountTypeData: ChartData = {
    labels: ['Savings', 'Current', 'Fixed Deposit'],
    data: [50, 35, 15]
  };

  transactionTypeData: ChartData = {
    labels: ['Deposit', 'Withdrawal', 'Transfer'],
    data: [120000, 140000, 160000]
  };

  constructor() {}

  ngOnInit(): void {}

  exportReport(): void {
    console.log('Exporting report...');
    // Implement export functionality
  }

  getMetricIcon(icon: string): string {
    return icon;
  }

  getAccountTypePercentage(index: number): number {
    const total = this.accountTypeData.data.reduce((sum, val) => sum + val, 0);
    return Math.round((this.accountTypeData.data[index] / total) * 100);
  }

  getAccountTypeColor(index: number): string {
    const colors = ['#3498db', '#27ae60', '#f39c12'];
    return colors[index] || '#95a5a6';
  }

  getTransactionTypeColor(index: number): string {
    const colors = ['#9b59b6', '#e74c3c', '#3498db'];
    return colors[index] || '#95a5a6';
  }

  getBarHeight(value: number): number {
    const maxValue = Math.max(...this.transactionTypeData.data);
    return (value / maxValue) * 100;
  }

  getCosValue(degrees: number): number {
    return Math.cos(degrees * Math.PI / 180);
  }

  getSinValue(degrees: number): number {
    return Math.sin(degrees * Math.PI / 180);
  }
}
