/****** Stored procedure: usp_user_crud ******/
SET NOCOUNT ON;
GO

IF OBJECT_ID('dbo.usp_user_crud', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_user_crud;
GO

CREATE PROCEDURE dbo.usp_user_crud
    @Action NVARCHAR(20),
    @UserID INT = NULL OUTPUT,
    @Name NVARCHAR(100) = NULL,
    @Email NVARCHAR(100) = NULL,
    @PasswordHash NVARCHAR(255) = NULL,
    @Role NVARCHAR(50) = NULL,
    @Branch NVARCHAR(100) = NULL,
    @Status NVARCHAR(20) = NULL,
    @RefreshToken NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @Action = 'FIRST_ADMIN'
        BEGIN
            INSERT INTO dbo.t_User (Name, Email, PasswordHash, Role, Branch, Status, CreatedDate)
            VALUES (@Name, @Email, @PasswordHash, 'Admin', @Branch, @Status, GETUTCDATE());
            
            SELECT SCOPE_IDENTITY() AS UserID;
        END
        ELSE IF @Action = 'CREATE'
        BEGIN
            INSERT INTO dbo.t_User (Name, Email, PasswordHash, Role, Branch, Status, CreatedDate)
            VALUES (@Name, @Email, @PasswordHash, @Role, @Branch, @Status, GETUTCDATE());
            
            SET @UserID = CAST(SCOPE_IDENTITY() AS INT);
            SELECT @UserID AS UserID;
        END
        ELSE IF @Action = 'LOGIN'
        BEGIN
            SELECT UserID, Name, Email, PasswordHash, Role, Branch, Status
            FROM dbo.t_User
            WHERE Email = @Email AND Status = 'Active';
        END
        ELSE IF @Action = 'LOGOUT'
        BEGIN
            UPDATE dbo.t_User 
            SET PasswordHash = NULL 
            WHERE UserID = @UserID;
            
            SELECT 1 AS Success;
        END
        ELSE IF @Action = 'GET'
        BEGIN
            IF @UserID IS NOT NULL
            BEGIN
                SELECT UserID, Name, Email, Role, Branch, Status, CreatedDate
                FROM dbo.t_User
                WHERE UserID = @UserID;
            END
            ELSE
            BEGIN
                SELECT UserID, Name, Email, Role, Branch, Status, CreatedDate
                FROM dbo.t_User
                WHERE (@Role IS NULL OR Role = @Role)
                AND (@Status IS NULL OR Status = @Status)
                ORDER BY UserID;
            END
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.t_User
            SET Name = COALESCE(@Name, Name),
                Email = COALESCE(@Email, Email),
                Role = COALESCE(@Role, Role),
                Branch = COALESCE(@Branch, Branch),
                Status = COALESCE(@Status, Status)
            WHERE UserID = @UserID;
            
            SELECT @@ROWCOUNT AS AffectedRows;
        END
        ELSE IF @Action = 'STATUS'
        BEGIN
            UPDATE dbo.t_User
            SET Status = @Status
            WHERE UserID = @UserID;
            
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
