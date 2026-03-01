/****** Stored procedure: usp_user_audit ******/
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.usp_user_audit', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_user_audit;
GO

CREATE PROCEDURE dbo.usp_user_audit
    @UserID INT,
    @Action NVARCHAR(100),
    @OldValue NVARCHAR(1000) = NULL,
    @NewValue NVARCHAR(1000) = NULL,
    @TableName NVARCHAR(100) = NULL,
    @RecordID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT INTO dbo.t_UserAudit (UserID, Action, OldValue, NewValue, TableName, RecordID, AuditDate)
        VALUES (@UserID, @Action, @OldValue, @NewValue, @TableName, @RecordID, GETUTCDATE());
        
        SELECT SCOPE_IDENTITY() AS AuditID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrState INT = ERROR_STATE();
        
        RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
    END CATCH
END
GO
