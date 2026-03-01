/****** Execute All Stored Procedures ******/
-- This script will create all required stored procedures for the AccountTrack system

-- 1. User CRUD Stored Procedure
:R usp_user_crud.sql

-- 2. Transaction Stored Procedure  
:R usp_Transaction.sql

-- 3. Approval Stored Procedure
:R usp_Approval.sql

-- 4. Reports Master Stored Procedure
:R usp_Reports_Master.sql

-- 5. User Audit Stored Procedure
:R usp_user_audit.sql

-- 6. Account Stored Procedure (already exists)
:R sp_Account.sql

PRINT 'All stored procedures have been created successfully!'

-- Verify creation
SELECT 
    name AS ProcedureName,
    create_date,
    modify_date
FROM sys.procedures 
WHERE name IN ('usp_user_crud', 'usp_Transaction', 'usp_Approval', 'usp_Reports_Master', 'usp_user_audit', 'sp_Account')
ORDER BY name;
