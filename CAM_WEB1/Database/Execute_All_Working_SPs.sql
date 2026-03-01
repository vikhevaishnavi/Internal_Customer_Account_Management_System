-- Execute all working stored procedures provided by user
USE [AccountTrackDB]
GO

-- 1. Execute usp_Transaction
IF OBJECT_ID('dbo.usp_Transaction', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Transaction;
GO

CREATE PROCEDURE [dbo].[usp_Transaction]
(
    @Action NVARCHAR(20),
    @AccountID INT = NULL,
    @ToAccountID INT = NULL,
    @Type NVARCHAR(20) = NULL,
    @Amount DECIMAL(18,2) = NULL,
    @TransactionID INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;
        
        -- CREATE
        IF @Action = 'CREATE'
        BEGIN
            DECLARE @Status NVARCHAR(20);
            DECLARE @Balance DECIMAL(18,2);
            
            SELECT @Balance = Balance FROM t_Account WHERE AccountID = @AccountID;
            
            IF @Balance IS NULL
                RAISERROR('Invalid Account ID',16,1);
                
            IF @Type IN ('Withdraw','Transfer') AND @Balance < @Amount
                RAISERROR('Insufficient balance',16,1);
                
            -- > 1 Lakh goes to approval
            IF @Type = 'Transfer' AND @Amount > 100000
                SET @Status = 'Pending';
            ELSE
                SET @Status = 'Completed';
                
            INSERT INTO t_Transactions (AccountID, ToAccountID, Type, Amount, Status, Date)
            VALUES (@AccountID, @ToAccountID, @Type, @Amount, @Status, SYSDATETIME());
            
            SET @TransactionID = SCOPE_IDENTITY();
            
            -- If Pending → Create Approval Entry
            IF @Status = 'Pending'
            BEGIN
                EXEC usp_Approval @Action = 'Create', @TransactionId = @TransactionID;
            END
            ELSE
            BEGIN
                -- Direct Balance Update
                IF @Type = 'Deposit'
                BEGIN
                    UPDATE t_Account SET Balance = Balance + @Amount WHERE AccountID = @AccountID;
                END
                ELSE IF @Type = 'Withdraw'
                BEGIN
                    UPDATE t_Account SET Balance = Balance - @Amount WHERE AccountID = @AccountID;
                END
                ELSE IF @Type = 'Transfer'
                BEGIN
                    UPDATE t_Account SET Balance = Balance - @Amount WHERE AccountID = @AccountID;
                    UPDATE t_Account SET Balance = Balance + @Amount WHERE AccountID = @ToAccountID;
                END
            END
        END
        
        -- GETALL
        ELSE IF @Action = 'GETALL'
        BEGIN
            SELECT * FROM t_Transactions ORDER BY Date DESC;
        END
        
        -- GETBYID
        ELSE IF @Action = 'GETBYID'
        BEGIN
            SELECT * FROM t_Transactions WHERE TransactionID = @TransactionID;
        END
        
        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg,16,1);
    END CATCH
END
GO

PRINT 'usp_Transaction created successfully!'

-- 2. Execute usp_user_crud (your working version)
IF OBJECT_ID('dbo.usp_user_crud', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_user_crud;
GO

CREATE PROCEDURE [dbo].[usp_user_crud] 
(
    @Action NVARCHAR(20),
    @UserID INT = NULL,
    @Name NVARCHAR(100) = NULL,
    @Email NVARCHAR(150) = NULL,
    @PasswordHash NVARCHAR(255) = NULL,
    @Role NVARCHAR(20) = NULL,
    @Branch NVARCHAR(50) = NULL,
    @Status NVARCHAR(20) = NULL,
    @RefreshToken NVARCHAR(200) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. FIRST ADMIN (ONE TIME)
        IF @Action = 'FIRST_ADMIN'
        BEGIN
            IF EXISTS (SELECT 1 FROM t_user WHERE Role = 'Admin')
                THROW 50001, 'Admin already exists', 1;

            INSERT INTO t_user (Name, Email, PasswordHash, Role, Branch, Status) 
            VALUES (@Name, @Email, @PasswordHash, 'Admin', @Branch, ISNULL(@Status, 'Active')); 
            RETURN;
        END

        -- 2. LOGIN (GET HASH + ROLE)
        IF @Action = 'LOGIN'
        BEGIN
            SELECT UserID, PasswordHash, Role
            FROM t_user
            WHERE Email = @Email
              AND Status = 'Active'; 
            RETURN;
        END

        -- 3. SAVE REFRESH TOKEN
        IF @Action = 'SAVE_REFRESH'
        BEGIN
            INSERT INTO t_refresh_token (UserID, RefreshToken, ExpiryDate)
            VALUES (@UserID, @RefreshToken, DATEADD(DAY, 7, GETUTCDATE()));
            RETURN;
        END

        -- 4. LOGOUT
        IF @Action = 'LOGOUT'
        BEGIN
            UPDATE t_refresh_token
            SET IsRevoked = 1
            WHERE RefreshToken = @RefreshToken; 
            RETURN;
        END

        -- 5. CREATE USER
        IF @Action = 'CREATE'
        BEGIN
            IF EXISTS (SELECT 1 FROM t_user WHERE Email = @Email)
            BEGIN
                SELECT 'EMAIL_EXISTS' AS Result;
                RETURN;
            END

            INSERT INTO t_user (Name, Email, PasswordHash, Role, Branch, Status)
            VALUES (@Name, @Email, @PasswordHash, @Role, @Branch, 'Active');

            SELECT 'USER_CREATED' AS Result;
            RETURN;
        END

        -- 6. GET USERS (FILTERED)
        IF @Action = 'GET'
        BEGIN
            SELECT UserID, Name, Email, Role, Branch, Status, CreatedDate
            FROM t_user
            WHERE (@UserID IS NULL OR UserID = @UserID) 
              AND (@Role IS NULL OR Role = @Role)
              AND (@Branch IS NULL OR Branch = @Branch)
              AND (@Status IS NULL OR Status = @Status); 
            RETURN;
        END

        -- 7. UPDATE USER
        IF @Action = 'UPDATE'
        BEGIN
            UPDATE t_user
            SET Name   = ISNULL(@Name, Name), 
                Branch = ISNULL(@Branch, Branch)
            WHERE UserID = @UserID; 
            RETURN;
        END

        -- 8. UPDATE STATUS
        IF @Action = 'STATUS'
        BEGIN
            UPDATE t_user
            SET Status = @Status
            WHERE UserID = @UserID; 
            RETURN;
        END

        -- 9. DELETE USER (SOFT DELETE)
        IF @Action = 'DELETE'
        BEGIN
            UPDATE t_user
            SET Status = 'Inactive'
            WHERE UserID = @UserID; 
            RETURN;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE(); 
        THROW 50000, @ErrMsg, 1;
    END CATCH
END
GO

PRINT 'usp_user_crud created successfully!'

-- 3. Execute usp_Reports_Master
IF OBJECT_ID('dbo.usp_Reports_Master', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Reports_Master;
GO

CREATE PROCEDURE [dbo].[usp_Reports_Master]
    @Mode NVARCHAR(50),
    @BranchName NVARCHAR(100) = NULL,
    @FromDate DATETIME = NULL,
    @ToDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Mode = 'GENERATE'
        BEGIN
            -- 1. Count Transactions ONLY for the specific branch
            DECLARE @TxCount INT = (
                SELECT COUNT(t.TransactionID)
                FROM t_Transactions t
                INNER JOIN t_Account a ON t.AccountID = a.AccountID
                WHERE (a.Branch = @BranchName OR @BranchName = 'Global' OR @BranchName IS NULL)
               AND t.[Date] >= @FromDate AND t.[Date] < DATEADD(DAY, 1, @ToDate)
            );

            -- 2. High Value Count ONLY for the specific branch
            DECLARE @HVCount INT = (
                SELECT COUNT(t.TransactionID)
                FROM t_Transactions t
                INNER JOIN t_Account a ON t.AccountID = a.AccountID
                WHERE (a.Branch = @BranchName OR @BranchName = 'Global' OR @BranchName IS NULL)
                AND t.Amount >= 100000
              AND t.[Date] >= @FromDate AND t.[Date] < DATEADD(DAY, 1, @ToDate)
            );

            -- 3. Account Growth (New accounts in this specific branch)
            DECLARE @Growth DECIMAL(18,2) = (
                SELECT COUNT(*) FROM t_Account
                WHERE (Branch = @BranchName OR @BranchName = 'Global' OR @BranchName IS NULL)
                AND CreatedDate >= @FromDate AND CreatedDate < DATEADD(DAY, 1, @ToDate)
            );

            -- 4. Insert into YOUR module's table
            INSERT INTO t_Report (Branch, TotalTransactions, HighValueCount, AccountGrowthRate, GeneratedDate)
            VALUES (ISNULL(@BranchName, 'chennai'), @TxCount, @HVCount, @Growth, GETUTCDATE());
            
            SELECT 'Report Snapshot Created Successfully' AS Message;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@ErrorMessage, 16, 1);
    END CATCH
END
GO

PRINT 'usp_Reports_Master created successfully!'

-- 4. Execute usp_Account
IF OBJECT_ID('dbo.usp_Account', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Account;
GO

CREATE PROCEDURE [dbo].[usp_Account]
    @Action NVARCHAR(16),
    @AccountID INT = NULL OUTPUT,
    @Branch NVARCHAR(100) = NULL,
    @CustomerName NVARCHAR(100) = NULL,
    @CustomerID NVARCHAR(50) = NULL,
    @AccountType NVARCHAR(50) = NULL,
    @Balance DECIMAL(18,2) = NULL,
    @Status NVARCHAR(20) = NULL,
    @CreatedDate DATETIME2(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. CREATE ACTION
        IF @Action = 'Create'
        BEGIN
            INSERT INTO dbo.t_Account (Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate)
            VALUES (
                ISNULL(@Branch, 'Main Branch'), 
                @CustomerName, 
                @CustomerID, 
                ISNULL(@AccountType, 'Savings'), 
                ISNULL(@Balance, 0), 
                ISNULL(@Status, 'Active'), 
                ISNULL(@CreatedDate, SYSUTCDATETIME())
            );
            SET @AccountID = CAST(SCOPE_IDENTITY() AS INT);
            SELECT AccountID, Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate 
            FROM dbo.t_Account WHERE AccountID = @AccountID;
        END
        
        -- 2. GET BY ID ACTION
        ELSE IF @Action = 'GetById'
        BEGIN
            SELECT AccountID, Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate
            FROM dbo.t_Account WHERE AccountID = @AccountID;
        END
        
        -- 3. GET ALL ACTION
        ELSE IF @Action = 'GetAll'
        BEGIN
            SELECT AccountID, Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate
            FROM dbo.t_Account;
        END
        
        -- 4. UPDATE ACTION
        ELSE IF @Action = 'Update'
        BEGIN
            UPDATE dbo.t_Account
            SET 
                Branch = ISNULL(@Branch, Branch),
                CustomerName = ISNULL(@CustomerName, CustomerName),
                CustomerID = ISNULL(@CustomerID, CustomerID),
                AccountType = ISNULL(@AccountType, AccountType),
                Balance = ISNULL(@Balance, Balance),
                Status = ISNULL(@Status, Status)
            WHERE AccountID = @AccountID;
            
            SELECT AccountID, Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate 
            FROM dbo.t_Account WHERE AccountID = @AccountID;
        END
        
        -- 5. CLOSE ACTION
        ELSE IF @Action = 'Close'
        BEGIN
            UPDATE dbo.t_Account SET Status = 'Closed' WHERE AccountID = @AccountID;
            SELECT AccountID, Branch, CustomerName, CustomerID, AccountType, Balance, Status, CreatedDate 
            FROM dbo.t_Account WHERE AccountID = @AccountID;
        END
        
        -- 6. DELETE ACTION
        ELSE IF @Action = 'Delete'
        BEGIN
            DELETE FROM dbo.t_Account WHERE AccountID = @AccountID;
            SELECT @@ROWCOUNT AS AffectedRows;
        END
        
        -- 7. INVALID ACTION HANDLER
        ELSE
        BEGIN
            ;THROW 50003, 'Invalid Action specified. Use Create, Update, Delete, GetById, GetAll, or Close.', 1;
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

PRINT 'usp_Account created successfully!'

-- 5. Execute usp_Approval
IF OBJECT_ID('dbo.usp_Approval', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Approval;
GO

CREATE PROCEDURE [dbo].[usp_Approval]
(
    @Action        NVARCHAR(20),
    @ApprovalId    INT = NULL,
    @TransactionId INT = NULL,
    @ReviewerId    INT = NULL,
    @Decision      NVARCHAR(20) = NULL,
    @Comments      NVARCHAR(1024) = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRAN;
        DECLARE @TxnId INT;
        DECLARE @FromAccount INT;
        DECLARE @ToAccount INT;
        DECLARE @Amount DECIMAL(18,2);
        
        -- CREATE (AUTO FROM TRANSACTION)
        IF @Action = 'Create'
        BEGIN
            INSERT INTO t_Approval (TransactionId, Decision, Comments, ApprovalDate)
            VALUES (@TransactionId, 'Pending', 'Waiting for manager approval', GETDATE());
            
            UPDATE t_Transactions SET Status = 'Pending' WHERE TransactionId = @TransactionId;
        END
        
        -- UPDATE (Manager Decision)
        ELSE IF @Action = 'Update'
        BEGIN
            SELECT @TxnId = TransactionId FROM t_Approval WHERE ApprovalId = @ApprovalId;
            
            UPDATE t_Approval
            SET Decision = @Decision,
                Comments = @Comments,
                ReviewerId = @ReviewerId,
                ApprovalDate = GETDATE()
            WHERE ApprovalId = @ApprovalId;
            
            IF @Decision = 'Approved'
            BEGIN
                SELECT @FromAccount = AccountID, @ToAccount = ToAccountID, @Amount = Amount
                FROM t_Transactions WHERE TransactionID = @TxnId;
                
                UPDATE t_Account SET Balance = Balance - @Amount WHERE AccountID = @FromAccount;
                UPDATE t_Account SET Balance = Balance + @Amount WHERE AccountID = @ToAccount;
                UPDATE t_Transactions SET Status = 'Approved' WHERE TransactionID = @TxnId;
            END
            ELSE IF @Decision = 'Rejected'
            BEGIN
                UPDATE t_Transactions SET Status = 'Rejected' WHERE TransactionID = @TxnId;
            END
        END
        
        -- GETALL
        ELSE IF @Action = 'GetAll'
        BEGIN
            SELECT * FROM t_Approval ORDER BY ApprovalDate DESC;
        END
        
        -- GETBYID
        ELSE IF @Action = 'GetById'
        BEGIN
            SELECT * FROM t_Approval WHERE ApprovalId = @ApprovalId;
        END
        
        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg,16,1);
    END CATCH
END
GO

PRINT 'usp_Approval created successfully!'

-- 6. Execute usp_user_audit
IF OBJECT_ID('dbo.usp_user_audit', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_user_audit;
GO

CREATE PROCEDURE [dbo].[usp_user_audit]
(
    @UserId INT,
    @Action NVARCHAR(50),
    @OldValue NVARCHAR(MAX),
    @NewValue NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO t_user_audit (UserId, Action, OldValue, NewValue)
        VALUES (@UserId, @Action, @OldValue, @NewValue);
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50002, @ErrMsg, 1;
    END CATCH
END
GO

PRINT 'usp_user_audit created successfully!'

-- 7. Execute usp_LogError
IF OBJECT_ID('dbo.usp_LogError', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_LogError;
GO

CREATE PROCEDURE [dbo].[usp_LogError]
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.t_ErrorLog (
        ErrorNumber, ErrorSeverity, ErrorState, ErrorProcedure, ErrorLine, ErrorMessage
    )
    VALUES (
        ERROR_NUMBER(),
        ERROR_SEVERITY(),
        ERROR_STATE(),
        ERROR_PROCEDURE(),
        ERROR_LINE(),
        ERROR_MESSAGE()
    );
END
GO

PRINT 'usp_LogError created successfully!'

-- Verify all stored procedures
SELECT 
    name AS ProcedureName,
    create_date,
    modify_date
FROM sys.procedures 
WHERE name IN ('usp_user_crud', 'usp_Transaction', 'usp_Approval', 'usp_Reports_Master', 'usp_user_audit', 'usp_Account', 'usp_LogError')
ORDER BY name;

PRINT 'All working stored procedures have been created successfully!'
