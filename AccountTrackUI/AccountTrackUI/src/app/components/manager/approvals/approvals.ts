import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Manager: Pending Approvals</h2>
      <table class="table table-hover">
        <thead><tr><th>Trans ID</th><th>Amount</th><th>Decision</th></tr></thead>
        <tbody>
          <tr>
            <td>#1045</td>
            <td>₹5,00,000</td>
            <td>
              <button class="btn btn-sm btn-success me-2">Approve</button>
              <button class="btn btn-sm btn-danger">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ApprovalComponent {}