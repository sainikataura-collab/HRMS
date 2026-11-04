-- =================================================================================================
-- Script: HR_Task_Insert_Sidebar_Menu.sql
-- Description: Registers the Task Manager menu in UM_WebPage_Mst and assigns permissions in UM_UserPageRights
-- Date: 2026-11-04
-- =================================================================================================

USE [HRBook];
GO

SET NOCOUNT ON;
PRINT '--> Registering Task Manager in UM_WebPage_Mst and UM_UserPageRights...';

DECLARE @HrMgmtParentId INT = 1476;
DECLARE @HrModuleId TINYINT = 6;
DECLARE @NewWebPageId INT;
DECLARE @TaskPath VARCHAR(100) = 'hr/hrdashboard/task-manager';

-- 1. Check if 'Task Manager' page already exists under HR Management
IF NOT EXISTS (SELECT 1 FROM [dbo].[UM_WebPage_Mst] WHERE [pagepath] = @TaskPath)
BEGIN
    SELECT @NewWebPageId = ISNULL(MAX(pk_webpageId), 0) + 1 FROM [dbo].[UM_WebPage_Mst];

    INSERT INTO [dbo].[UM_WebPage_Mst] (
        [pk_webpageId],
        [menucaption],
        [webpagename],
        [pagepath],
        [tooltip],
        [parentId],
        [displayorder],
        [activestatus],
        [fk_moduleId],
        [fk_pagetypeId],
        [pagedescription],
        [selectable],
        [orderby],
        [icon]
    )
    VALUES (
        @NewWebPageId,
        'Task Manager',
        'Task Manager',
        @TaskPath,
        'HR Task Manager & Interactive Kanban Board',
        @HrMgmtParentId,
        1,              -- High display priority in dropdown
        1,              -- Active
        @HrModuleId,
        1,              -- Standard page type
        'HR Task Manager, Interactive Kanban Board & History',
        1,
        1,
        'fa-list-check'
    );

    PRINT '--> Successfully inserted Task Manager menu in UM_WebPage_Mst with pk_webpageId: ' + CAST(@NewWebPageId AS VARCHAR(10));
END
ELSE
BEGIN
    SELECT @NewWebPageId = pk_webpageId FROM [dbo].[UM_WebPage_Mst] WHERE [pagepath] = @TaskPath;
    PRINT '--> Task Manager page already exists with pk_webpageId: ' + CAST(@NewWebPageId AS VARCHAR(10));
END;

-- 2. Assign Page Rights to Superadmin (GU-1) and all users who currently have HR Management rights
IF @NewWebPageId IS NOT NULL
BEGIN
    -- Ensure GU-1 has full access
    IF NOT EXISTS (SELECT 1 FROM [dbo].[UM_UserPageRights] WHERE [fk_userId] = 'GU-1' AND [fk_webpageId] = @NewWebPageId)
    BEGIN
        INSERT INTO [dbo].[UM_UserPageRights] (
            [fk_userId],
            [fk_webpageId],
            [AllowAdd],
            [AllowUpdate],
            [AllowDelete],
            [AllowView],
            [L1_Access],
            [L2_Access],
            [L3_Access],
            [CanRaiseRequisition],
            [CanEditManpower]
        )
        VALUES ('GU-1', @NewWebPageId, 1, 1, 1, 1, 1, 1, 1, 0, 0);

        PRINT '--> Granted full rights to user GU-1.';
    END;

    -- Grant access to all other users who have HR Management parent (1476) or active page rights
    INSERT INTO [dbo].[UM_UserPageRights] (
        [fk_userId],
        [fk_webpageId],
        [AllowAdd],
        [AllowUpdate],
        [AllowDelete],
        [AllowView],
        [L1_Access],
        [L2_Access],
        [L3_Access],
        [CanRaiseRequisition],
        [CanEditManpower]
    )
    SELECT DISTINCT
        U.fk_userId,
        @NewWebPageId,
        1, 1, 1, 1, 0, 0, 0, 0, 0
    FROM [dbo].[UM_UserPageRights] U
    WHERE U.fk_userId <> 'GU-1'
      AND (
          U.fk_webpageId = @HrMgmtParentId
          OR U.fk_webpageId IN (SELECT pk_webpageId FROM [dbo].[UM_WebPage_Mst] WHERE parentId = @HrMgmtParentId)
      )
      AND NOT EXISTS (
          SELECT 1 FROM [dbo].[UM_UserPageRights] Existing
          WHERE Existing.fk_userId = U.fk_userId AND Existing.fk_webpageId = @NewWebPageId
      );

    DECLARE @GrantedCount INT = @@ROWCOUNT;
    PRINT '--> Granted Task Manager rights to ' + CAST(@GrantedCount AS VARCHAR(10)) + ' existing HR users.';
END;

-- 3. Also check Taskbox parent (8728) if present, add Task Board option
DECLARE @TaskboxParentId INT = 8728;
DECLARE @TaskboxModuleId TINYINT = 17;
DECLARE @TaskboxPagePath VARCHAR(100) = 'dash/taskbox/taskboxdashboard';
DECLARE @NewTaskboxWebPageId INT;

IF EXISTS (SELECT 1 FROM [dbo].[UM_WebPage_Mst] WHERE [pk_webpageId] = @TaskboxParentId)
   AND NOT EXISTS (SELECT 1 FROM [dbo].[UM_WebPage_Mst] WHERE [pagepath] = @TaskboxPagePath)
BEGIN
    SELECT @NewTaskboxWebPageId = ISNULL(MAX(pk_webpageId), 0) + 1 FROM [dbo].[UM_WebPage_Mst];

    INSERT INTO [dbo].[UM_WebPage_Mst] (
        [pk_webpageId],
        [menucaption],
        [webpagename],
        [pagepath],
        [tooltip],
        [parentId],
        [displayorder],
        [activestatus],
        [fk_moduleId],
        [fk_pagetypeId],
        [pagedescription],
        [selectable],
        [orderby],
        [icon]
    )
    VALUES (
        @NewTaskboxWebPageId,
        'Task Board',
        'Task Board',
        @TaskboxPagePath,
        'Taskbox Kanban Board',
        @TaskboxParentId,
        1,
        1,
        @TaskboxModuleId,
        1,
        'Taskbox Kanban Board',
        1,
        1,
        'fa-list-check'
    );

    PRINT '--> Inserted Task Board in Taskbox menu with pk_webpageId: ' + CAST(@NewTaskboxWebPageId AS VARCHAR(10));

    -- Grant rights for Taskbox to users
    INSERT INTO [dbo].[UM_UserPageRights] (
        [fk_userId],
        [fk_webpageId],
        [AllowAdd],
        [AllowUpdate],
        [AllowDelete],
        [AllowView],
        [L1_Access],
        [L2_Access],
        [L3_Access],
        [CanRaiseRequisition],
        [CanEditManpower]
    )
    SELECT DISTINCT
        U.fk_userId,
        @NewTaskboxWebPageId,
        1, 1, 1, 1, 0, 0, 0, 0, 0
    FROM [dbo].[UM_UserPageRights] U
    WHERE U.fk_webpageId = @TaskboxParentId
       OR U.fk_webpageId IN (SELECT pk_webpageId FROM [dbo].[UM_WebPage_Mst] WHERE parentId = @TaskboxParentId);
END;

PRINT '--> Verification query:';
SELECT pk_webpageId, menucaption, pagepath, parentId, activestatus, fk_moduleId
FROM [dbo].[UM_WebPage_Mst]
WHERE [pagepath] IN (@TaskPath, @TaskboxPagePath);
GO
