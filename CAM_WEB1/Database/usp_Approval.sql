/****** Stored procedure: usp_Approval ******/
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.usp_Approval', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_Approval;
GO

CREATE PROCEDURE dbo.usp_Approval
    @Action NVARCHAR(20),
    @ApprovalID INT = NULL,
    @TransactionID INT = NULL,
    @ReviewerID INT = NULL,
    @Decision NVARCHAR(20) = NULL,
    @Comments NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @Action = 'GetAll'
        BEGIN
            SELECT ApprovalID, TransactionID, ReviewerID, Decision, Comments, ApprovalDate
            FROM dbo.t_Approval
            ORDER BY ApprovalDate DESC;
        END
        ELSE IF @Action = 'GetById'
        BEGIN
            SELECT ApprovalID, TransactionID, ReviewerID, Decision, Comments, ApprovalDate
            FROM dbo.t_Approval
            WHERE ApprovalID = @ApprovalID;
        END
        ELSE IF @Action = 'Create'
        BEGIN
            INSERT INTO dbo.t_Approval (TransactionID, ApprovalDate)
            VALUES (@TransactionID, GETUTCDATE());
            
            SET @ApprovalID = CAST(SCOPE_IDENTITY() AS INT);
            SELECT @ApprovalID AS ApprovalID;
        END
        ELSE IF @Action = 'Update'
        BEGIN
            UPDATE dbo.t_Approval
            SET ReviewerID = @ReviewerID,
                Decision = @Decision,
                Comments = @Comments,
                ApprovalDate = GETUTCDATE()
            WHERE ApprovalID = @ApprovalID;
            
            SELECT @@ROWCOUNT AS AffectedRows;
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
