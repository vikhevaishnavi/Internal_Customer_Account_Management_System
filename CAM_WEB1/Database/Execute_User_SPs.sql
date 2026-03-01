-- Execute your working user stored procedures
USE [AccountTrackDB]
GO

-- Drop and recreate usp_user_crud with your working version
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
            INSERT INTO t_refresh_token (UserID, RefreshToken)
            VALUES (@UserID, @RefreshToken);
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

        -- 5. CREATE USER (Updated to prevent NULL Status)
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

PRINT 'usp_user_crud updated successfully!'
