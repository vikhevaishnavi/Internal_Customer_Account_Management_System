import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { isPlatformBrowser } from '@angular/common';

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
  selector: 'app-user-management-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementNewComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading = false;
  errorMessage = '';
  
  // Add user form
  showAddUserForm = false;
  newUser = {
    Name: '',
    Email: '',
    Password: '',
    Role: 'Officer',
    Branch: 'Main Branch'
  };

  constructor(
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Loading users from API...');
    
    // Check if user is authenticated (SSR safe)
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('Token available:', !!token);
    
    if (!token) {
      console.error('No authentication token found');
      this.errorMessage = 'You are not authenticated. Please login again.';
      this.isLoading = false;
      return;
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (this.isLoading) {
        console.error('Loading timeout - showing empty state');
        this.isLoading = false;
        this.errorMessage = 'Loading timeout. Please check your connection and try again.';
        this.users = [];
        this.filteredUsers = [];
      }
    }, 10000); // 10 second timeout

    this.adminService.getUsers().subscribe({
      next: (data) => {
        clearTimeout(timeout);
        console.log('Users loaded from API:', data);
        console.log('Data type:', typeof data);
        console.log('Is array?', Array.isArray(data));
        
        // Handle different response formats
        let usersData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // If response is an object, try to extract users array
          if (data.users) {
            usersData = data.users;
          } else if (data.data) {
            usersData = data.data;
          } else if (Array.isArray(data)) {
            usersData = data;
          } else {
            usersData = [];
          }
        }
        
        this.users = usersData || [];
        this.filteredUsers = [...this.users];
        this.isLoading = false;
        
        // Debug: Show what we got
        console.log('Final users array:', this.users);
        console.log('Final filtered users:', this.filteredUsers);
      },
      error: (error) => {
        clearTimeout(timeout);
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
        
        // Don't set fallback data - keep it empty to show real state
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  onSearchChange(): void {
    this.filteredUsers = this.users.filter(user =>
      user.Name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.Email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.Role.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.Branch.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleAddUserForm(): void {
    console.log('=== TOGGLE ADD USER FORM ===');
    console.log('Current state:', this.showAddUserForm);
    this.showAddUserForm = !this.showAddUserForm;
    console.log('New state:', this.showAddUserForm);
    
    if (!this.showAddUserForm) {
      this.resetAddUserForm();
    }
    
    // Force change detection
    setTimeout(() => {
      console.log('Form should be visible now:', this.showAddUserForm);
    }, 100);
  }

  resetAddUserForm(): void {
    this.newUser = {
      Name: '',
      Email: '',
      Password: '',
      Role: 'Officer',
      Branch: 'Main Branch'
    };
  }

  addUser(): void {
    console.log('=== ADD USER CLICKED ===');
    console.log('Add User clicked with data:', this.newUser);
    
    if (!this.newUser.Name || !this.newUser.Email || !this.newUser.Password) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    console.log('Creating user via API...');

    // RESTORE REAL API CALL - Fix the actual issue
    this.adminService.createUser(this.newUser).subscribe({
      next: (response) => {
        console.log('=== USER CREATION SUCCESS ===');
        console.log('Response from server:', response);
        
        // Reload users from database to get real data
        this.loadUsers();
        this.toggleAddUserForm();
        this.isLoading = false;
        alert('User created successfully in database!');
      },
      error: (error) => {
        console.log('=== USER CREATION ERROR ===');
        console.error('Error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Show detailed error for debugging
        let errorMessage = 'Failed to create user. ';
        if (error.status === 401) {
          errorMessage += 'Authentication failed. Please login again.';
        } else if (error.status === 403) {
          errorMessage += 'Permission denied. Admin access required.';
        } else if (error.status === 400) {
          errorMessage += 'Invalid data. Please check all fields.';
        } else if (error.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += 'Please check console for details.';
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  editUser(user: User): void {
    const newName = prompt('Enter new name:', user.Name);
    if (newName && newName.trim()) {
      this.isLoading = true;
      
      this.adminService.updateUser(user.UserID, { Name: newName.trim() }).subscribe({
        next: () => {
          this.loadUsers();
          this.isLoading = false;
          alert('User updated successfully!');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Failed to update user. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    console.log('=== TOGGLE USER STATUS ===');
    console.log('User to toggle:', user);
    
    const newStatus = user.Status === 'Active' ? 'Inactive' : 'Active';
    const action = user.Status === 'Active' ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${action} ${user.Name}?`)) {
      this.isLoading = true;
      
      this.adminService.updateUserStatus(user.UserID, newStatus).subscribe({
        next: (response) => {
          console.log('=== USER STATUS UPDATE SUCCESS ===');
          console.log('Response from server:', response);
          this.loadUsers(); // Reload users from database
          this.isLoading = false;
          alert(`User ${action}d successfully!`);
        },
        error: (error) => {
          console.log('=== USER STATUS UPDATE ERROR ===');
          console.error('Error updating user status:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          
          let errorMessage = `Failed to ${action} user. `;
          if (error.status === 401) {
            errorMessage += 'Authentication failed. Please login again.';
          } else if (error.status === 403) {
            errorMessage += 'Permission denied. Admin access required.';
          } else if (error.status === 404) {
            errorMessage += 'User not found.';
          } else if (error.status === 500) {
            errorMessage += 'Server error. Please try again later.';
          } else {
            errorMessage += 'Please check console for details.';
          }
          
          alert(errorMessage);
          this.isLoading = false;
        }
      });
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
