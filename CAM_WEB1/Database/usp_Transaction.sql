/****** Stored procedure: usp_Transaction ******/
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.usp_Transaction', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Transaction;
GO

CREATE PROCEDURE dbo.usp_Transaction
    @Action NVARCHAR(20),
    @TransactionID INT = NULL OUTPUT,
    @AccountID INT = NULL,
    @ToAccountID INT = NULL,
    @Type NVARCHAR(50) = NULL,
    @Amount DECIMAL(18,2) = NULL,
    @Status NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @Action = 'CREATE'
        BEGIN
            INSERT INTO dbo.t_Transaction (AccountID, ToAccountID, Type, Amount, Status, Date)
            VALUES (@AccountID, @ToAccountID, @Type, @Amount, ISNULL(@Status, 'Completed'), GETUTCDATE());
            
            SET @TransactionID = CAST(SCOPE_IDENTITY() AS INT);
            SELECT @TransactionID AS TransactionID;
        END
        ELSE IF @Action = 'GETALL'
        BEGIN
            SELECT TransactionID, AccountID, ToAccountID, Type, Amount, Status, Date
            FROM dbo.t_Transaction
            ORDER BY Date DESC;
        END
        ELSE IF @Action = 'GETBYID'
        BEGIN
            SELECT TransactionID, AccountID, ToAccountID, Type, Amount, Status, Date
            FROM dbo.t_Transaction
            WHERE TransactionID = @TransactionID;
        END
        ELSE IF @Action = 'GETBYACCOUNT'
        BEGIN
            SELECT TransactionID, AccountID, ToAccountID, Type, Amount, Status, Date
            FROM dbo.t_Transaction
            WHERE AccountID = @AccountID OR ToAccountID = @AccountID
            ORDER BY Date DESC;
        END
        ELSE
        BEGIN
            THROW 50000, 'Invalid Action specified', 1;
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
