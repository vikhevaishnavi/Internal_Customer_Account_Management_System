export interface Transaction {
  transactionID?: number;
  accountID: number;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  date: Date;
  status: 'Completed' | 'Pending';
}