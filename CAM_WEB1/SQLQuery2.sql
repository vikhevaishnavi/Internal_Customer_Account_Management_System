-- Add the missing columns to match the LLD design
ALTER TABLE t_Accounts 
ADD AccountType NVARCHAR(MAX) NOT NULL DEFAULT 'Savings',
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE();
GO