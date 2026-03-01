import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface User {
  UserID: number;
  Name: string;
  Email: string;
  Role: string;
  Branch: string;
  Status: string;
  CreatedDate: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;
  errorMessage = '';

  user = {
    Name: '',
    Email: '',
    Password: '',
    Role: 'Officer',
    Branch: ''
  };

  searchTerm: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    console.log('=== USER MANAGEMENT INIT ===');
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Loading users from API...');
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getUsers().subscribe({
      next: (data) => {
        console.log('Users loaded successfully:', data);
        this.users = data;
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.Role.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.Branch.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  addUser(): void {
    console.log('Add user functionality');
  }

  onRegister(): void {
    console.log('Registering user:', this.user);
    
    this.adminService.createUser(this.user).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        alert('User created successfully!');
        this.loadUsers(); // Reload users list
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        alert('Failed to create user. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.user = {
      Name: '',
      Email: '',
      Password: '',
      Role: 'Officer',
      Branch: ''
    };
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.Name}?`)) {
      console.log('Delete user functionality - not implemented yet');
      // TODO: Implement delete user API call
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

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-default';
    }
  }
}
