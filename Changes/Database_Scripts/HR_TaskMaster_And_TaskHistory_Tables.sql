-- ======================================================================================
-- DATABASE SCHEMA SETUP & MIGRATION: HR_TaskMaster & HR_TaskHistory
-- Database: HRBook (SQL Server)
-- Tables:
--   1. dbo.HR_TaskMaster  (Full Kanban & Task Engine with Recurrence & SLA Columns)
--   2. dbo.HR_TaskHistory (Audit Trail with State Transitions & Remarks)
--   3. dbo.LSP_Master_General (Initial Seed for Task Type Lookup: CodeTypeId = 24)
--
-- DESIGN:
-- - Idempotent: Can be safely executed on both a fresh database and an existing database.
-- - Contains CREATE TABLE if not exists + ALTER TABLE column-level checks.
-- - Creates all performance, unique, and filtered indexes.
-- ======================================================================================

USE [HRBook];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- --------------------------------------------------------------------------------------
-- 1. TABLE: dbo.HR_TaskMaster (Create if not exists)
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'HR_TaskMaster' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Creating table dbo.HR_TaskMaster...';
    CREATE TABLE dbo.HR_TaskMaster
    (
        TaskId                      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_HR_TaskMaster PRIMARY KEY CLUSTERED,
        TaskCode                    VARCHAR(50)       NOT NULL,
        Subject                     NVARCHAR(250)     NOT NULL,
        Description                 NVARCHAR(MAX)     NULL,
        Priority                    VARCHAR(20)       NOT NULL CONSTRAINT DF_HR_TaskMaster_Priority DEFAULT ('MEDIUM'),
        Status                      VARCHAR(20)       NOT NULL CONSTRAINT DF_HR_TaskMaster_Status DEFAULT ('OPEN'),
        TargetDeptId                VARCHAR(50)       NULL,
        AssignedToEmpId             VARCHAR(50)       NULL,
        CreatedByEmpId              VARCHAR(50)       NULL,
        CreatedByUserId             VARCHAR(50)       NULL,
        CreatedByName               NVARCHAR(150)     NULL,
        CreatorDeptId               VARCHAR(50)       NULL,
        DueDate                     DATETIME          NOT NULL,
        AttachmentName              NVARCHAR(255)     NULL,
        AttachmentPath              NVARCHAR(500)     NULL,
        IsRecurring                 BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsRecurring DEFAULT (0),
        RecurrenceType              VARCHAR(20)       NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceType DEFAULT ('NONE'),
        RecurrenceInterval          INT               NOT NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceInterval DEFAULT (1),
        NextOccurrenceDate          DATETIME          NULL,
        ParentTaskId                INT               NULL,
        IsSelfTask                  BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsSelfTask DEFAULT (0),
        ClosedAt                    DATETIME          NULL,
        CompanyId                   VARCHAR(50)       NULL,
        CreatedAt                   DATETIME          NOT NULL CONSTRAINT DF_HR_TaskMaster_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt                   DATETIME          NOT NULL CONSTRAINT DF_HR_TaskMaster_UpdatedAt DEFAULT (GETDATE()),
        IsActive                    BIT               NOT NULL CONSTRAINT DF_HR_TaskMaster_IsActive DEFAULT (1),
        RecurrenceDays              VARCHAR(50)       NULL,
        RecurrenceDayOfMonth        INT               NULL,
        RecurrenceEndType           VARCHAR(20)       NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceEndType DEFAULT ('NEVER'),
        RecurrenceEndDate           DATETIME          NULL,
        RecurrenceOccurrencesTotal  INT               NULL,
        RecurrenceOccurrencesCount  INT               NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceOccurrencesCount DEFAULT (0),
        TaskTypeId                  INT               NULL,
        TaskTypeName                VARCHAR(100)      NULL,
        RecurrenceDueOffsetHours    INT               NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceDueOffsetHours DEFAULT (24),
        RecurrenceDueOffsetUnit     VARCHAR(10)       NULL     CONSTRAINT DF_HR_TaskMaster_RecurrenceDueOffsetUnit DEFAULT ('DAYS')
    );
    PRINT 'Table dbo.HR_TaskMaster created successfully.';
END
ELSE
BEGIN
    PRINT 'Table dbo.HR_TaskMaster already exists. Applying column migration checks...';
END
GO

-- --------------------------------------------------------------------------------------
-- 1.1 MIGRATION: Ensure all recent columns exist on dbo.HR_TaskMaster
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceDays')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceDays VARCHAR(50) NULL;
    PRINT 'Added column RecurrenceDays to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceDayOfMonth')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceDayOfMonth INT NULL;
    PRINT 'Added column RecurrenceDayOfMonth to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceEndType')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceEndType VARCHAR(20) NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceEndType DEFAULT ('NEVER');
    PRINT 'Added column RecurrenceEndType to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceEndDate')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceEndDate DATETIME NULL;
    PRINT 'Added column RecurrenceEndDate to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceOccurrencesTotal')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceOccurrencesTotal INT NULL;
    PRINT 'Added column RecurrenceOccurrencesTotal to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceOccurrencesCount')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceOccurrencesCount INT NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceOccurrencesCount DEFAULT (0);
    PRINT 'Added column RecurrenceOccurrencesCount to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'TaskTypeId')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD TaskTypeId INT NULL;
    PRINT 'Added column TaskTypeId to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'TaskTypeName')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD TaskTypeName VARCHAR(100) NULL;
    PRINT 'Added column TaskTypeName to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceDueOffsetHours')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceDueOffsetHours INT NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceDueOffsetHours DEFAULT (24);
    PRINT 'Added column RecurrenceDueOffsetHours to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'RecurrenceDueOffsetUnit')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD RecurrenceDueOffsetUnit VARCHAR(10) NULL CONSTRAINT DF_HR_TaskMaster_RecurrenceDueOffsetUnit DEFAULT ('DAYS');
    PRINT 'Added column RecurrenceDueOffsetUnit to dbo.HR_TaskMaster';
END
GO

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HR_TaskMaster' AND COLUMN_NAME = 'CompanyId')
BEGIN
    ALTER TABLE dbo.HR_TaskMaster ADD CompanyId VARCHAR(50) NULL;
    PRINT 'Added column CompanyId to dbo.HR_TaskMaster';
END
GO

-- --------------------------------------------------------------------------------------
-- 1.2 INDEXES ON dbo.HR_TaskMaster
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_HR_TaskMaster_TaskCode' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_HR_TaskMaster_TaskCode ON dbo.HR_TaskMaster(TaskCode);
    PRINT 'Created index UQ_HR_TaskMaster_TaskCode';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_Status_Active' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_Status_Active ON dbo.HR_TaskMaster(Status, IsActive);
    PRINT 'Created index IX_HR_TaskMaster_Status_Active';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_AssignedTo' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_AssignedTo ON dbo.HR_TaskMaster(AssignedToEmpId) WHERE AssignedToEmpId IS NOT NULL;
    PRINT 'Created index IX_HR_TaskMaster_AssignedTo';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_CreatedBy' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_CreatedBy ON dbo.HR_TaskMaster(CreatedByEmpId);
    PRINT 'Created index IX_HR_TaskMaster_CreatedBy';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_TargetDept' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_TargetDept ON dbo.HR_TaskMaster(TargetDeptId);
    PRINT 'Created index IX_HR_TaskMaster_TargetDept';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_CompanyId' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_CompanyId ON dbo.HR_TaskMaster(CompanyId, IsActive);
    PRINT 'Created index IX_HR_TaskMaster_CompanyId';
END
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskMaster_Recurrence' AND object_id = OBJECT_ID('dbo.HR_TaskMaster'))
BEGIN
    DROP INDEX IX_HR_TaskMaster_Recurrence ON dbo.HR_TaskMaster;
END
GO
CREATE NONCLUSTERED INDEX IX_HR_TaskMaster_Recurrence 
ON dbo.HR_TaskMaster(IsRecurring, NextOccurrenceDate) 
WHERE IsRecurring = 1;
PRINT 'Created filtered index IX_HR_TaskMaster_Recurrence';
GO


-- --------------------------------------------------------------------------------------
-- 2. TABLE: dbo.HR_TaskHistory (Audit Trail & Activity Log)
-- --------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'HR_TaskHistory' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Creating table dbo.HR_TaskHistory...';
    CREATE TABLE dbo.HR_TaskHistory
    (
        HistoryId           INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_HR_TaskHistory PRIMARY KEY CLUSTERED,
        TaskId              INT               NOT NULL,
        ActionType          VARCHAR(50)       NOT NULL, -- CREATED, STATUS_CHANGED, ASSIGNED, REMARK_ADDED, EDITED, ATTACHMENT_ADDED, RECURRENCE_GENERATED
        OldStatus           VARCHAR(20)       NULL,
        NewStatus           VARCHAR(20)       NULL,
        OldAssigneeEmpId    VARCHAR(50)       NULL,
        NewAssigneeEmpId    VARCHAR(50)       NULL,
        Remarks             NVARCHAR(MAX)     NOT NULL,
        AttachmentName      NVARCHAR(255)     NULL,
        AttachmentPath      NVARCHAR(500)     NULL,
        ActionByEmpId       VARCHAR(50)       NULL,
        ActionByUserId      VARCHAR(50)       NULL,
        ActionByName        NVARCHAR(150)     NULL,
        CreatedAt           DATETIME          NOT NULL CONSTRAINT DF_HR_TaskHistory_CreatedAt DEFAULT (GETDATE()),
        CONSTRAINT FK_HR_TaskHistory_TaskId FOREIGN KEY (TaskId) REFERENCES dbo.HR_TaskMaster(TaskId) ON DELETE CASCADE
    );
    PRINT 'Table dbo.HR_TaskHistory created successfully.';
END
ELSE
BEGIN
    PRINT 'Table dbo.HR_TaskHistory already exists.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HR_TaskHistory_TaskId' AND object_id = OBJECT_ID('dbo.HR_TaskHistory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_HR_TaskHistory_TaskId ON dbo.HR_TaskHistory(TaskId, CreatedAt DESC);
    PRINT 'Created index IX_HR_TaskHistory_TaskId';
END
GO


-- --------------------------------------------------------------------------------------
-- 3. LOOKUP SEED: Task Types in dbo.LSP_Master_General (CodeTypeId = 24)
-- Inserts default standard Task Types for global fallback (company '0') and active companies.
-- --------------------------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'LSP_Master_General' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT 'Verifying default Task Types in dbo.LSP_Master_General (CodeTypeId = 24)...';

    DECLARE @DefaultTaskTypes TABLE (
        CodeId INT,
        Name VARCHAR(100),
        Code VARCHAR(50),
        CodeDescription VARCHAR(200)
    );

    INSERT INTO @DefaultTaskTypes (CodeId, Name, Code, CodeDescription)
    VALUES
        (1,  'Compliance',           'COMP', 'Statutory, legal and regulatory compliance'),
        (2,  'Audit',                'AUD',  'Internal, external and client audit reviews'),
        (3,  'Recruitment',          'REC',  'Hiring drives, interview rounds & onboarding'),
        (4,  'Payroll',              'PAY',  'Salary processing, tax declarations & payouts'),
        (5,  'General',              'GEN',  'General administrative tasks and errands'),
        (6,  'Employee Relations',   'ER',   'Grievance handling, mediation & counselling'),
        (7,  'Performance Appraisal','PMS',  'KRA setting, quarterly review & appraisals'),
        (8,  'Training & Dev',       'TND',  'Upskilling, workshops & technical training'),
        (9,  'Exit & Offboarding',   'EXT',  'Resignation workflow, clearance & handover'),
        (10, 'IT & Asset Support',   'IT',   'Hardware allocation, software & network setup'),
        (11, 'Documentation',        'DOC',  'Contracts, verification & record keeping'),
        (12, 'Operations',           'OPS',  'Facility management, shift rosters & logistics'),
        (13, 'Billing & Finance',    'FIN',  'Invoices, vendor payments & expense approvals'),
        (14, 'Vendor Management',    'VND',  'Vendor Onboarding, Invoices & SLA'),
        (15, 'Health & Safety',      'HSE',  'Workplace Safety, POSH & Medical Drives'),
        (16, 'Travel & Expense',     'TRV',  'Travel Desk, Visa & Reimbursement Audits'),
        (17, 'Engagement & CSR',     'CSR',  'Employee Engagement & Welfare Activities'),
        (18, 'Policy & SOP',         'SOP',  'HR Manual Updates, Policies & Guidelines'),
        (19, 'Tax & Investment',     'TAX',  'TDS, Form 16 & Investment Declarations'),
        (20, 'Vigilance & Ethics',   'VIG',  'Internal Audit, Fraud & Vigilance Checks');

    -- Seed for global fallback company '0'
    INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, Name, Code, CodeDescription, fk_companyId, IsActive, EntryDate)
    SELECT 
        24,
        t.CodeId,
        t.Name,
        t.Code,
        t.CodeDescription,
        '0',
        1,
        GETDATE()
    FROM @DefaultTaskTypes t
    WHERE NOT EXISTS (
        SELECT 1 
        FROM dbo.LSP_Master_General g 
        WHERE g.CodeTypeId = 24 
          AND g.CodeId = t.CodeId 
          AND g.fk_companyId = '0'
    );

    PRINT 'Task Types check complete.';
END
GO

PRINT '======================================================================================';
PRINT 'DATABASE SCHEMA SETUP FOR HR_TaskMaster & HR_TaskHistory COMPLETED SUCCESSFULLY!';
PRINT '======================================================================================';

