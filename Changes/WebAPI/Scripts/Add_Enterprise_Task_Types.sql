-- ======================================================================================
-- SCRIPT: Add_Enterprise_Task_Types.sql
-- PURPOSE: Populates 15-20 enterprise Task Types in LSP_Master_General (CodeTypeId = 24)
-- ======================================================================================

BEGIN TRANSACTION;

DECLARE @NewTypes TABLE (CodeId SMALLINT, Name NVARCHAR(100), Code NVARCHAR(50), Description NVARCHAR(100));

INSERT INTO @NewTypes VALUES
(6, 'Recruitment', 'REC', 'Talent Acquisition & Interview Scheduling'),
(7, 'Training & Dev', 'TRN', 'Employee Learning & Development'),
(8, 'Appraisal & PMS', 'PMS', 'Performance Reviews & Goal Tracking'),
(9, 'Statutory & Legal', 'LEG', 'Labor Law, PF, ESIC & Legal Compliance'),
(10, 'Employee Relations', 'ER', 'Employee Grievance & Disciplinary Action'),
(11, 'Exit & Clearance', 'EXT', 'Separations, Handover & Full-and-Final'),
(12, 'IT & Assets', 'IT', 'Hardware Provisioning & System Access'),
(13, 'Admin & Facility', 'ADM', 'Office Facilities, Transport & Pantry'),
(14, 'Vendor Mgmt', 'VND', 'Vendor Onboarding, Invoices & SLA'),
(15, 'Health & Safety', 'HSE', 'Workplace Safety, POSH & Medical Drives'),
(16, 'Travel & Expense', 'TRV', 'Travel Desk, Visa & Reimbursement Audits'),
(17, 'Engagement & CSR', 'CSR', 'Employee Engagement & Welfare Activities'),
(18, 'Policy & SOP', 'SOP', 'HR Manual Updates, Policies & Guidelines'),
(19, 'Tax & Investment', 'TAX', 'TDS, Form 16 & Investment Declarations'),
(20, 'Vigilance & Ethics', 'VIG', 'Internal Audit, Fraud & Vigilance Checks');

-- Insert for company '0' (global default)
INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, Name, Code, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId)
SELECT 24, t.CodeId, t.Name, t.Code, t.Description, 1, 'System', GETDATE(), '0'
FROM @NewTypes t
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.LSP_Master_General g 
    WHERE g.CodeTypeId = 24 AND g.CodeId = t.CodeId AND g.fk_companyId = '0'
);

-- Insert for company 'GU-1' (primary active company)
INSERT INTO dbo.LSP_Master_General (CodeTypeId, CodeId, Name, Code, CodeDescription, IsActive, EntryBy, EntryDate, fk_companyId)
SELECT 24, t.CodeId, t.Name, t.Code, t.Description, 1, 'System', GETDATE(), 'GU-1'
FROM @NewTypes t
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.LSP_Master_General g 
    WHERE g.CodeTypeId = 24 AND g.CodeId = t.CodeId AND g.fk_companyId = 'GU-1'
);

COMMIT TRANSACTION;

