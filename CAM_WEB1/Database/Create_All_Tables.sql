-- Create all tables for AccountTrack Database
USE [AccountTrackDB]
GO

-- 1. t_User table
IF OBJECT_ID('dbo.t_User', 'U') IS NOT NULL
    DROP TABLE dbo.t_User;
GO

CREATE TABLE dbo.t_User (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Officer',
    Branch NVARCHAR(50) NOT NULL DEFAULT 'Chennai',
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE()
);
GO

-- 2. t_Account table
IF OBJECT_ID('dbo.t_Account', 'U') IS NOT NULL
    DROP TABLE dbo.t_Account;
GO

CREATE TABLE dbo.t_Account (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,
    Branch NVARCHAR(100) NOT NULL DEFAULT 'Main Branch',
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerID NVARCHAR(50) NOT NULL,
    AccountType NVARCHAR(50) NOT NULL DEFAULT 'Savings',
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE()
);
GO

-- 3. t_Transactions table
IF OBJECT_ID('dbo.t_Transactions', 'U') IS NOT NULL
    DROP TABLE dbo.t_Transactions;
GO

CREATE TABLE dbo.t_Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,
    ToAccountID INT NULL,
    Type NVARCHAR(20) NOT NULL, -- Deposit, Withdraw, Transfer
    Amount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Completed', -- Completed, Pending, Approved, Rejected
    Date DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (AccountID) REFERENCES dbo.t_Account(AccountID),
    FOREIGN KEY (ToAccountID) REFERENCES dbo.t_Account(AccountID)
);
GO

-- 4. t_Approval table
IF OBJECT_ID('dbo.t_Approval', 'U') IS NOT NULL
    DROP TABLE dbo.t_Approval;
GO

CREATE TABLE dbo.t_Approval (
    ApprovalID INT IDENTITY(1,1) PRIMARY KEY,
    TransactionID INT NOT NULL,
    ReviewerID INT NULL,
    Decision NVARCHAR(20) NULL, -- Approved, Rejected, Pending
    Comments NVARCHAR(1024) NULL,
    ApprovalDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TransactionID) REFERENCES dbo.t_Transactions(TransactionID),
    FOREIGN KEY (ReviewerID) REFERENCES dbo.t_User(UserID)
);
GO

-- 5. t_Report table
IF OBJECT_ID('dbo.t_Report', 'U') IS NOT NULL
    DROP TABLE dbo.t_Report;
GO

CREATE TABLE dbo.t_Report (
    ReportID INT IDENTITY(1,1) PRIMARY KEY,
    Branch NVARCHAR(100) NOT NULL,
    TotalTransactions INT NOT NULL DEFAULT 0,
    HighValueCount INT NOT NULL DEFAULT 0,
    AccountGrowthRate DECIMAL(18,2) NOT NULL DEFAULT 0,
    GeneratedDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE()
);
GO

-- 6. t_user_audit table
IF OBJECT_ID('dbo.t_user_audit', 'U') IS NOT NULL
    DROP TABLE dbo.t_user_audit;
GO

CREATE TABLE dbo.t_user_audit (
    AuditID INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    AuditDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES dbo.t_User(UserID)
);
GO

-- 7. t_refresh_token table (for JWT refresh tokens)
IF OBJECT_ID('dbo.t_refresh_token', 'U') IS NOT NULL
    DROP TABLE dbo.t_refresh_token;
GO

CREATE TABLE dbo.t_refresh_token (
    TokenID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    RefreshToken NVARCHAR(200) NOT NULL,
    IsRevoked BIT NOT NULL DEFAULT 0,
    CreatedDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    ExpiryDate DATETIME2(7) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES dbo.t_User(UserID)
);
GO

-- 8. t_ErrorLog table
IF OBJECT_ID('dbo.t_ErrorLog', 'U') IS NOT NULL
    DROP TABLE dbo.t_ErrorLog;
GO

CREATE TABLE dbo.t_ErrorLog (
    ErrorLogID INT IDENTITY(1,1) PRIMARY KEY,
    ErrorNumber INT NOT NULL,
    ErrorSeverity INT NOT NULL,
    ErrorState INT NOT NULL,
    ErrorProcedure NVARCHAR(128) NULL,
    ErrorLine INT NULL,
    ErrorMessage NVARCHAR(4000) NOT NULL,
    ErrorDate DATETIME2(7) NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Create indexes for better performance
CREATE INDEX IX_t_User_Email ON dbo.t_User(Email);
CREATE INDEX IX_t_User_Branch ON dbo.t_User(Branch);
CREATE INDEX IX_t_User_Status ON dbo.t_User(Status);
CREATE INDEX IX_t_Account_Branch ON dbo.t_Account(Branch);
CREATE INDEX IX_t_Account_CustomerID ON dbo.t_Account(CustomerID);
CREATE INDEX IX_t_Account_Status ON dbo.t_Account(Status);
CREATE INDEX IX_t_Transactions_AccountID ON dbo.t_Transactions(AccountID);
CREATE INDEX IX_t_Transactions_Date ON dbo.t_Transactions(Date);
CREATE INDEX IX_t_Transactions_Status ON dbo.t_Transactions(Status);
CREATE INDEX IX_t_Approval_TransactionID ON dbo.t_Approval(TransactionID);
CREATE INDEX IX_t_Approval_Decision ON dbo.t_Approval(Decision);
CREATE INDEX IX_t_user_audit_UserId ON dbo.t_user_audit(UserID);
CREATE INDEX IX_t_user_audit_AuditDate ON dbo.t_user_audit(AuditDate);
GO

PRINT 'All tables created successfully!'

-- Verify tables were created
SELECT 
    t.name AS TableName,
    p.rows AS RowCounts,
    CAST(ROUND(((SUM(a.total_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS TotalSpaceMB
FROM sys.tables t
INNER JOIN sys.indexes i ON t.object_id = i.object_id
INNER JOIN sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE t.is_ms_shipped = 0
AND i.object_id > 255
GROUP BY t.name, p.rows
ORDER BY t.name;
GO

PRINT 'Table structure verification completed!'
