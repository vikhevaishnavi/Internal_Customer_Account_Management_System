import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
  branch: string;
}

@Component({
  selector: 'app-user-management-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementNewComponent implements OnInit {
  users: User[] = [
    {
      id: 1,
      username: 'admin',
      name: 'Admin User',
      email: 'admin@bank.com',
      role: 'admin',
      branch: 'N/A'
    },
    {
      id: 2,
      username: 'officer',
      name: 'John Officer',
      email: 'officer@bank.com',
      role: 'officer',
      branch: 'Main Branch'
    },
    {
      id: 3,
      username: 'manager',
      name: 'Jane Manager',
      email: 'manager@bank.com',
      role: 'manager',
      branch: 'Main Branch'
    }
  ];

  searchTerm: string = '';
  filteredUsers: User[] = [...this.users];

  ngOnInit(): void {}

  onSearchChange(): void {
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addUser(): void {
    console.log('Add user functionality');
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'officer':
        return 'role-officer';
      default:
        return 'role-default';
    }
  }
}
