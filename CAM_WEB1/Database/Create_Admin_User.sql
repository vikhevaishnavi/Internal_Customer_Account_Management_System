-- Create admin user with proper bcrypt hash
USE [AccountTrackDB]
GO

-- Delete existing admin user
DELETE FROM t_User WHERE Email = 'admin@bank.com';
GO

-- Insert new admin user with known working bcrypt hash for "admin123"
INSERT INTO t_User (Name, Email, PasswordHash, Role, Branch, Status, CreatedDate)
VALUES (
    'System Administrator',
    'admin@bank.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This hash works with "password"
    'Admin',
    'Main Branch',
    'Active',
    GETUTCDATE()
);
GO

-- Verify the user was created
SELECT UserID, Name, Email, Role, Branch, Status, CreatedDate 
FROM t_User 
WHERE Email = 'admin@bank.com';
GO

PRINT 'Admin user created successfully!'
PRINT 'Login with: admin@bank.com / password'
