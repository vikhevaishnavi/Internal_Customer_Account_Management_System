export interface User {
  userID?: number;
  name: string;
  role: 'Officer' | 'Manager' | 'Admin';
  email: string;
  branch: string;
  status: 'Active' | 'Inactive';
}