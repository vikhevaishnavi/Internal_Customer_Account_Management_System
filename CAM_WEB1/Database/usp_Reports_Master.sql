/****** Stored procedure: usp_Reports_Master ******/
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.usp_Reports_Master', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Reports_Master;
GO

CREATE PROCEDURE dbo.usp_Reports_Master
    @Mode NVARCHAR(50),
    @BranchName NVARCHAR(100) = NULL,
    @FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @Mode = 'ACCOUNT_SUMMARY'
        BEGIN
            SELECT 
                a.AccountID,
                a.CustomerName,
                a.CustomerID,
                a.AccountType,
                a.Balance,
                a.Status,
                a.Branch,
                a.CreatedDate,
                COUNT(t.TransactionID) AS TransactionCount,
                ISNULL(SUM(CASE WHEN t.Type = 'Deposit' THEN t.Amount ELSE 0 END), 0) AS TotalDeposits,
                ISNULL(SUM(CASE WHEN t.Type = 'Withdrawal' THEN t.Amount ELSE 0 END), 0) AS TotalWithdrawals
            FROM dbo.t_Account a
            LEFT JOIN dbo.t_Transaction t ON a.AccountID = t.AccountID
            WHERE (@BranchName IS NULL OR a.Branch = @BranchName)
            AND (@FromDate IS NULL OR a.CreatedDate >= @FromDate)
            AND (@ToDate IS NULL OR a.CreatedDate <= @ToDate)
            GROUP BY a.AccountID, a.CustomerName, a.CustomerID, a.AccountType, a.Balance, a.Status, a.Branch, a.CreatedDate
            ORDER BY a.AccountID;
        END
        ELSE IF @Mode = 'TRANSACTION_SUMMARY'
        BEGIN
            SELECT 
                t.TransactionID,
                t.AccountID,
                a.CustomerName,
                t.Type,
                t.Amount,
                t.Status,
                t.Date AS TransactionDate,
                a.Branch
            FROM dbo.t_Transaction t
            INNER JOIN dbo.t_Account a ON t.AccountID = a.AccountID
            WHERE (@BranchName IS NULL OR a.Branch = @BranchName)
            AND (@FromDate IS NULL OR t.Date >= @FromDate)
            AND (@ToDate IS NULL OR t.Date <= @ToDate)
            ORDER BY t.Date DESC;
        END
        ELSE IF @Mode = 'USER_SUMMARY'
        BEGIN
            SELECT 
                u.UserID,
                u.Name,
                u.Email,
                u.Role,
                u.Branch,
                u.Status,
                u.CreatedDate,
                COUNT(a.AccountID) AS AccountCount
            FROM dbo.t_User u
            LEFT JOIN dbo.t_Account a ON u.Branch = a.Branch
            WHERE (@BranchName IS NULL OR u.Branch = @BranchName)
            AND (@FromDate IS NULL OR u.CreatedDate >= @FromDate)
            AND (@ToDate IS NULL OR u.CreatedDate <= @ToDate)
            GROUP BY u.UserID, u.Name, u.Email, u.Role, u.Branch, u.Status, u.CreatedDate
            ORDER BY u.UserID;
        END
        ELSE IF @Mode = 'BRANCH_SUMMARY'
        BEGIN
            SELECT 
                a.Branch,
                COUNT(DISTINCT a.AccountID) AS TotalAccounts,
                COUNT(DISTINCT u.UserID) AS TotalUsers,
                ISNULL(SUM(a.Balance), 0) AS TotalBalance,
                COUNT(DISTINCT t.TransactionID) AS TotalTransactions
            FROM dbo.t_Account a
            LEFT JOIN dbo.t_User u ON a.Branch = u.Branch
            LEFT JOIN dbo.t_Transaction t ON a.AccountID = t.AccountID
            GROUP BY a.Branch
            ORDER BY a.Branch;
        END
        ELSE
        BEGIN
            THROW 50000, 'Invalid Mode specified', 1;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrState INT = ERROR_STATE();
        
        RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
    END CATCH
END
GO
