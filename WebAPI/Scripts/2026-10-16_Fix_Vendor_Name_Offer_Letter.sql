-- =========================================================================================
-- Script Name: 2026-10-16_Fix_Vendor_Name_Offer_Letter.sql
-- Description:
-- 1. Add fk_vendorid and vendorname columns to HR_Format_Mst and HR_Format_Trn if not present.
-- 2. Update HR_Employee_GetById to return actual vendor name from REC_Candidate_Details (cd.Vendor_Name / cd.candidate_name)
--    instead of dummy placeholder 'Authorized Vendor' from REC_Candidate_Applications.
-- 3. Update HR_Candidate_Letter_Ins to persist fk_vendorid and vendorname into HR_Format_Mst and HR_Format_Trn.
-- 4. Update HR_Format_Download to return actual vendor name, prioritizing transaction/master vendor and
--    REC_Candidate_Details joins over any placeholder string.
-- 5. Update USP_Vendor_Service_GetVendors to show clean Vendor_Name in dropdown.
-- 6. Backfill existing Offer Letter transactions with actual vendor name.
-- =========================================================================================

-- 1. Schema Updates: Add vendor columns if missing
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('HR_Format_Mst') AND name = 'fk_vendorid')
BEGIN
    ALTER TABLE HR_Format_Mst ADD fk_vendorid varchar(50) NULL;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('HR_Format_Mst') AND name = 'vendorname')
BEGIN
    ALTER TABLE HR_Format_Mst ADD vendorname varchar(255) NULL;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('HR_Format_Trn') AND name = 'fk_vendorid')
BEGIN
    ALTER TABLE HR_Format_Trn ADD fk_vendorid varchar(50) NULL;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('HR_Format_Trn') AND name = 'vendorname')
BEGIN
    ALTER TABLE HR_Format_Trn ADD vendorname varchar(255) NULL;
END;
GO

-- 2. Update HR_Employee_GetById
CREATE OR ALTER PROCEDURE [dbo].[HR_Employee_GetById]
(
    @fk_empid VARCHAR(15)
)
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        
        SELECT 
            E.pk_empid as fk_empid,
            E.empcode,
            E.empname,
            E.fk_locid,
            L.locname as Location,
            COALESCE(NULLIF(L.address, ''), NULLIF(E.CustomerAddress, ''), '') as address,
            E.fk_deptid,
            D.description as Department,
            E.fk_desgid,
            COALESCE(NULLIF(DG.designation, ''), NULLIF(ca.Designation, '')) as DesignationName,
            COALESCE(NULLIF(E.fk_cityid, ''), NULLIF(L.fk_cityid, '')) AS fk_cityid,
            COALESCE(NULLIF(C.cityname, ''), NULLIF(LC.cityname, '')) AS cityname,
            E.dateofjoining,
            E.ctc,
            E.email,
            COALESCE(NULLIF(ca.Mobile, ''), NULLIF(cd.mobile, ''), NULLIF(cd.phone, ''), NULLIF(E.MobileDeviceID, ''), '') AS contactno,
            COALESCE(NULLIF(ca.Mobile, ''), NULLIF(cd.mobile, ''), NULLIF(cd.phone, ''), NULLIF(E.MobileDeviceID, ''), '') AS mobile,
            '' AS pinno,
            COALESCE(NULLIF(E.vendorId, ''), NULLIF(ca.fk_vendorId, '')) AS vendorId,
            COALESCE(
                NULLIF(cd.Vendor_Name, ''),
                NULLIF(cd.candidate_name, ''),
                NULLIF(cd_app.Vendor_Name, ''),
                NULLIF(cd_app.candidate_name, ''),
                CASE WHEN ca.VendorName NOT IN ('Authorized Vendor', 'Vendor', 'Authorized Staffing Partner', 'NA', 'N/A', '') THEN ca.VendorName ELSE NULL END,
                NULLIF(E.vendorId, '')
            ) AS vendorname
        FROM 
            SAL_Employee_Mst E
            LEFT JOIN Location_Mst L ON E.fk_locid = L.pk_locid
            LEFT JOIN Department_Mst D ON E.fk_deptid = D.pk_deptid
            LEFT JOIN SAL_Designation_Mst DG ON E.fk_desgid = DG.pk_desgid
            LEFT JOIN SAL_City_Mst C ON E.fk_cityid = C.pk_cityid
            LEFT JOIN SAL_City_Mst LC ON L.fk_cityid = LC.pk_cityid
            LEFT JOIN REC_Candidate_Applications ca ON (ca.EmployeeCode = E.empcode OR (ca.AadhaarNo IS NOT NULL AND ca.AadhaarNo <> '' AND ca.AadhaarNo = E.adhaarNo))
            LEFT JOIN REC_Candidate_Details cd ON (cd.pk_recId = E.vendorId OR cd.Vendor_Code = E.vendorId)
            LEFT JOIN REC_Candidate_Details cd_app ON (cd_app.pk_recId = ca.fk_vendorId OR cd_app.Vendor_Code = ca.fk_vendorId)
        WHERE 
            E.pk_empid = @fk_empid;
            
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000), @ErrSeverity INT;
        SELECT @ErrMsg = ERROR_MESSAGE(), @ErrSeverity = ERROR_SEVERITY();
        RAISERROR(@ErrMsg, @ErrSeverity, 1);
    END CATCH
END;
GO

-- 3. Update HR_Candidate_Letter_Ins to persist vendor
CREATE OR ALTER PROCEDURE [dbo].[HR_Candidate_Letter_Ins]
(	
	@xmlDoc varchar(max),
	@fk_companyId varchar(15)
)
AS  
Declare @Idoc Int
BEGIN
BEGIN TRY
EXEC sp_xml_preparedocument @Idoc OUTPUT, @xmlDoc
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
BEGIN TRAN

Declare @fk_formatid bigint
  DECLARE @fk_locid varchar(15),
                @fk_deptid varchar(15),
                @fk_desgid varchar(15),
                @fk_cityid varchar(15),
                @fk_emphrid varchar(15),
                @contactno varchar(50),
                @pinno varchar(6),
                @address varchar(255),
                @ctc numeric(18,2),
                @fk_empid varchar(15),
                @fk_vendorid varchar(50),
                @vendorname varchar(255),
                @formattype varchar(1)
              

declare @fk_trnid bigint

-- Insert into HR_Format_Mst with vendor columns
Insert Into HR_Format_Mst(fk_empid, fk_locid, fk_deptid, fk_desgid, fk_cityid,
fk_emphrid, name, nname, contactno, pinno, address, joiningdate, ctc, 
ctcinword, fk_companyId, fk_vendorid, vendorname)
Select 
    x.fk_empid, x.fk_locid, x.fk_deptid, x.fk_desgid, x.fk_cityid, x.fk_emphrid, x.name,
    x.nname, x.contactno, x.pinno, x.address, x.joiningdate, x.ctc, dbo.fNumToWords(x.ctc), 
    @fk_companyId,
    COALESCE(NULLIF(x.fk_vendorid, ''), NULLIF(Emp.vendorId, ''), NULLIF(ca.fk_vendorId, '')),
    COALESCE(
        NULLIF(x.vendorname, ''),
        NULLIF(cd.Vendor_Name, ''),
        NULLIF(cd.candidate_name, ''),
        NULLIF(cd_app.Vendor_Name, ''),
        NULLIF(cd_app.candidate_name, ''),
        CASE WHEN ca.VendorName NOT IN ('Authorized Vendor', 'Vendor', 'Authorized Staffing Partner', 'NA', 'N/A', '') THEN ca.VendorName ELSE NULL END
    )
FROM OPENXML (@Idoc, '/NewDataSet/HR_Format_Mst',2)
WITH(
    fk_empid varchar(15), fk_locid varchar(15), fk_deptid varchar(15), 
    fk_desgid varchar(15), fk_cityid varchar(15), fk_emphrid varchar(15), 
    name varchar(150), nname varchar(50), contactno varchar(50), pinno varchar(6), 
    address varchar(255), joiningdate varchar(10), ctc numeric(18,2),
    fk_vendorid varchar(50), vendorname varchar(255)
) x
LEFT JOIN SAL_Employee_Mst Emp ON x.fk_empid = Emp.pk_empid
LEFT JOIN REC_Candidate_Applications ca ON (ca.EmployeeCode = Emp.empcode OR (ca.AadhaarNo IS NOT NULL AND ca.AadhaarNo <> '' AND ca.AadhaarNo = Emp.adhaarNo))
LEFT JOIN REC_Candidate_Details cd ON (cd.pk_recId = COALESCE(NULLIF(x.fk_vendorid, ''), Emp.vendorId) OR cd.Vendor_Code = COALESCE(NULLIF(x.fk_vendorid, ''), Emp.vendorId))
LEFT JOIN REC_Candidate_Details cd_app ON (cd_app.pk_recId = ca.fk_vendorId OR cd_app.Vendor_Code = ca.fk_vendorId);

SET @fk_formatid = @@IDENTITY

-- load the inserted master columns into variables so we can reuse them in the Trn insert
SELECT
    @fk_locid = fk_locid,
    @fk_deptid = fk_deptid,
    @fk_desgid = fk_desgid,
    @fk_cityid = fk_cityid,
    @fk_emphrid = fk_emphrid,
    @contactno = contactno,
    @pinno = pinno,
    @address = address,
    @ctc = ctc,
    @fk_vendorid = fk_vendorid,
    @vendorname = vendorname
FROM HR_Format_Mst
WHERE pk_formatid = @fk_formatid;

-- Duplicate check for TRN
DECLARE @empid VARCHAR(15);

-- Read formattype and empid from XML
SELECT TOP 1 
    @formattype = formattype
FROM OPENXML (@Idoc, '/NewDataSet/HR_Format_Trn', 2)
WITH (formattype varchar(1));

SELECT TOP 1 
    @empid = fk_empid
FROM OPENXML (@Idoc, '/NewDataSet/HR_Format_Mst', 2)
WITH (fk_empid VARCHAR(15));

-- Only check for formattype A or L
IF (@formattype IN ('A', 'L'))
BEGIN
    IF EXISTS (
        SELECT 1 FROM HR_Format_Trn T
        INNER JOIN HR_Format_Mst M ON T.fk_formatid = M.pk_formatid
        WHERE M.fk_empid = @empid
          AND T.formattype = @formattype
    )
    BEGIN
        RAISERROR('Record already exists for this employee with same format type.', 16, 1);
        RETURN;
    END
END

Insert Into HR_Format_Trn(fk_formatid, formattype, fk_locid, fk_deptid, fk_desgid, fk_cityid,
fk_emphrid, contactno, pinno, address, ctc, ctcinword, refno, dated, eperiod, fk_pdesgid, newctc,
newctcinword, effectivedate, fk_empcooid, confirmdate, resigndate, relievedate, trandate,
fk_tran_tolocid, description, IncrementAmount, PerMonthSalary, PLI, fk_Offerdesgid, fk_Offergrade, 
fk_Offerempid, offergender, fk_Offercostcentreid, comments1, comments2, comments3, comments4,
fk_vendorid, vendorname)
Select @fk_formatid, formattype, @fk_locid, @fk_deptid, @fk_desgid, @fk_cityid, @fk_emphrid,
@contactno, @pinno, @address, @ctc, dbo.fNumToWords(@ctc), refno, dated, eperiod,
fk_pdesgid, newctc, Case newctc When 0 then '' Else dbo.fNumToWords(newctc) End,
effectivedate, fk_empcooid, confirmdate, resigndate, relievedate, trandate, fk_tran_tolocid, description,
IncrementAmount, PerMonthSalary, PLI, fk_Offerdesgid, fk_Offergrade, fk_Offerempid, offergender, fk_Offercostcentreid,
comments1, comments2, comments3, comments4,
COALESCE(NULLIF(fk_vendorid, ''), @fk_vendorid),
COALESCE(NULLIF(vendorname, ''), @vendorname)
FROM OPENXML (@Idoc, '/NewDataSet/HR_Format_Trn',2)
WITH (formattype char(1), refno varchar(25), dated varchar(10),
eperiod varchar(50), fk_pdesgid varchar(15), newctc numeric(18,2), effectivedate varchar(10),
fk_empcooid varchar(15), confirmdate varchar(10), resigndate varchar(10), relievedate varchar(10),
trandate varchar(10), fk_tran_tolocid varchar(15), description varchar(500), IncrementAmount numeric(18,2), 
PerMonthSalary numeric(18,2), PLI varchar(500), fk_Offerdesgid varchar(15), fk_Offergrade varchar(15), fk_Offerempid varchar(15)
, offergender varchar(1), fk_Offercostcentreid varchar(15), comments1 varchar(max), comments2 varchar(max),
comments3 varchar(max), comments4 varchar(max), fk_vendorid varchar(50), vendorname varchar(255))
Set @fk_trnid = @@Identity

-- Store formattype
SELECT @formattype = formattype
FROM HR_Format_Trn
WHERE pk_trnid = @fk_trnid;

-- Insert heads for BOTH 'A' (Appointment Letter) AND 'O' (Offer Letter)
IF (@formattype IN ('A', 'O'))
BEGIN
Insert Into HR_Format_Head(fk_trnid, fk_headid, annualamount, amount)
Select @fk_trnid, fk_headid, 
       CASE WHEN ISNULL(annualamount, 0) = 0 AND ISNULL(amount, 0) > 0 THEN amount * 12 ELSE annualamount END,
       CASE WHEN ISNULL(amount, 0) = 0 AND ISNULL(annualamount, 0) > 0 THEN ROUND(annualamount / 12.0, 2) ELSE amount END
FROM OPENXML (@Idoc, '/NewDataSet/HR_Format_Head',2)
WITH (fk_headid bigint, annualamount numeric(18,2), amount numeric(18,2))
WHERE ISNULL(annualamount, 0) > 0 OR ISNULL(amount, 0) > 0;
END

COMMIT TRAN
END TRY

BEGIN CATCH
IF @@TRANCOUNT > 0
ROLLBACK
DECLARE @ErrMsg nvarchar(4000), @ErrSeverity int
SELECT @ErrMsg = ERROR_MESSAGE(),
@ErrSeverity = ERROR_SEVERITY()
RAISERROR(@ErrMsg, @ErrSeverity, 1)
END CATCH
EXEC sp_xml_removedocument @Idoc
END;
GO

-- 4. Update HR_Format_Download
CREATE OR ALTER PROCEDURE [dbo].[HR_Format_Download]  
(  
    @pk_trnid bigint  
)  
AS  
BEGIN  
    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  
    SET NOCOUNT ON;  

    ----------------------------------------------------------------------
    -- 1. Company Record
    ----------------------------------------------------------------------
    SELECT TOP 1 *   
    FROM Common_Client_Details  
    ORDER BY pk_clientid;

    ----------------------------------------------------------------------
    -- 2. TRN Record
    ----------------------------------------------------------------------
    SELECT 
        t.*, 
        L.locname AS TransferLocation,
        CASE t.formattype 
            WHEN 'A' THEN 'Appointment Letter'
            WHEN 'B' THEN 'Confirmation Letter With Increment'
            WHEN 'C' THEN 'Confirmation Letter'
            WHEN 'R' THEN 'Promotion Letter'
            WHEN 'D' THEN 'Increment Letter'
            WHEN 'L' THEN 'Retirement Letter'
            WHEN 'F' THEN 'Transfer Letter'
            WHEN 'X' THEN 'Confirmation of Extension Letter'
            WHEN 'O' THEN 'Offer Letter'
            ELSE 'Others'
        END AS FormatTypeName,
        COALESCE(
            NULLIF(t.vendorname, ''),
            NULLIF(m.vendorname, ''),
            NULLIF(cd_trn.Vendor_Name, ''),
            NULLIF(cd_trn.candidate_name, ''),
            NULLIF(cd_mst.Vendor_Name, ''),
            NULLIF(cd_mst.candidate_name, ''),
            NULLIF(cd.Vendor_Name, ''),
            NULLIF(cd.candidate_name, ''),
            NULLIF(cd_app.Vendor_Name, ''),
            NULLIF(cd_app.candidate_name, ''),
            CASE WHEN ca.VendorName NOT IN ('Authorized Vendor', 'Vendor', 'Authorized Staffing Partner', 'NA', 'N/A', '') THEN ca.VendorName ELSE NULL END,
            NULLIF(Emp.vendorId, '')
        ) AS vendorname
    FROM HR_Format_Trn t
    INNER JOIN HR_Format_Mst m ON t.fk_formatid = m.pk_formatid
    LEFT JOIN SAL_Employee_Mst Emp ON m.fk_empid = Emp.pk_empid
    LEFT JOIN REC_Candidate_Applications ca ON (ca.EmployeeCode = Emp.empcode OR (ca.AadhaarNo IS NOT NULL AND ca.AadhaarNo <> '' AND ca.AadhaarNo = Emp.adhaarNo))
    LEFT JOIN REC_Candidate_Details cd ON (cd.pk_recId = Emp.vendorId OR cd.Vendor_Code = Emp.vendorId)
    LEFT JOIN REC_Candidate_Details cd_app ON (cd_app.pk_recId = ca.fk_vendorId OR cd_app.Vendor_Code = ca.fk_vendorId)
    LEFT JOIN REC_Candidate_Details cd_trn ON (cd_trn.pk_recId = t.fk_vendorid OR cd_trn.Vendor_Code = t.fk_vendorid)
    LEFT JOIN REC_Candidate_Details cd_mst ON (cd_mst.pk_recId = m.fk_vendorid OR cd_mst.Vendor_Code = m.fk_vendorid)
    LEFT JOIN Location_Mst L ON t.fk_tran_tolocid = L.pk_locid
    WHERE t.pk_trnid = @pk_trnid;

    ----------------------------------------------------------------------
    -- 3. MST records
    ----------------------------------------------------------------------
    SELECT 
        m.*,
        d.designation AS DesignationName,
        dm.description As Department,
        E.empname As HrName,
        L.locname As Location,
        L.address As LocAddress,
        C.cityname As City,
        Emp.empcode,
        Emp.fathername As FatherName,
        Emp.adhaarNo,
        Emp.panno,
        COALESCE(
            NULLIF(m.vendorname, ''),
            NULLIF(t.vendorname, ''),
            NULLIF(cd_mst.Vendor_Name, ''),
            NULLIF(cd_mst.candidate_name, ''),
            NULLIF(cd_trn.Vendor_Name, ''),
            NULLIF(cd_trn.candidate_name, ''),
            NULLIF(cd.Vendor_Name, ''),
            NULLIF(cd.candidate_name, ''),
            NULLIF(cd_app.Vendor_Name, ''),
            NULLIF(cd_app.candidate_name, ''),
            CASE WHEN ca.VendorName NOT IN ('Authorized Vendor', 'Vendor', 'Authorized Staffing Partner', 'NA', 'N/A', '') THEN ca.VendorName ELSE NULL END,
            NULLIF(Emp.vendorId, '')
        ) AS VendorName
    FROM HR_Format_Mst m
    INNER JOIN HR_Format_Trn t ON m.pk_formatid = t.fk_formatid
    LEFT JOIN SAL_Employee_Mst Emp ON m.fk_empid = Emp.pk_empid
    LEFT JOIN REC_Candidate_Applications ca ON (ca.EmployeeCode = Emp.empcode OR (ca.AadhaarNo IS NOT NULL AND ca.AadhaarNo <> '' AND ca.AadhaarNo = Emp.adhaarNo))
    LEFT JOIN REC_Candidate_Details cd ON (cd.pk_recId = Emp.vendorId OR cd.Vendor_Code = Emp.vendorId)
    LEFT JOIN REC_Candidate_Details cd_app ON (cd_app.pk_recId = ca.fk_vendorId OR cd_app.Vendor_Code = ca.fk_vendorId)
    LEFT JOIN REC_Candidate_Details cd_mst ON (cd_mst.pk_recId = m.fk_vendorid OR cd_mst.Vendor_Code = m.fk_vendorid)
    LEFT JOIN REC_Candidate_Details cd_trn ON (cd_trn.pk_recId = t.fk_vendorid OR cd_trn.Vendor_Code = t.fk_vendorid)
    LEFT JOIN SAL_Designation_Mst d ON t.fk_desgid = d.pk_desgid
    LEFT JOIN Department_Mst DM ON t.fk_deptid = DM.pk_deptid
    LEFT JOIN SAL_Employee_Mst E ON t.fk_emphrid = E.pk_empid
    LEFT JOIN Location_Mst L ON t.fk_locid = L.pk_locid
    LEFT JOIN SAL_City_Mst C ON t.fk_cityid = C.cityname
    WHERE t.pk_trnid = @pk_trnid;

    ----------------------------------------------------------------------
    -- 4. Get HEAD Records (with SAL_Head_Mst join for HeadName)
    ----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM HR_Format_Head WHERE fk_trnid = @pk_trnid AND (ISNULL(amount, 0) > 0 OR ISNULL(annualamount, 0) > 0)
    )
    BEGIN
        SELECT 
            h.fk_trnid,
            h.fk_headid,
            CASE WHEN ISNULL(h.annualamount, 0) = 0 AND ISNULL(h.amount, 0) > 0 THEN h.amount * 12 ELSE h.annualamount END AS annualamount,
            CASE WHEN ISNULL(h.amount, 0) = 0 AND ISNULL(h.annualamount, 0) > 0 THEN ROUND(h.annualamount / 12.0, 2) ELSE h.amount END AS amount,
            COALESCE(NULLIF(shm.shortdesc, ''), NULLIF(shm.description, ''), 'Component ' + CAST(h.fk_headid AS VARCHAR(20))) AS HeadName,
            shm.displayorder
        FROM HR_Format_Head h
        INNER JOIN HR_Format_Trn t ON h.fk_trnid = t.pk_trnid
        LEFT JOIN SAL_Head_Mst shm ON h.fk_headid = shm.pk_headid
        WHERE t.pk_trnid = @pk_trnid
          AND (ISNULL(h.amount, 0) > 0 OR ISNULL(h.annualamount, 0) > 0)
        ORDER BY ISNULL(shm.displayorder, 9999), h.fk_headid;
    END
    ELSE
    BEGIN
        SELECT 
            @pk_trnid AS fk_trnid,
            eh.fk_headid,
            ROUND(eh.amount * 12.0, 2) AS annualamount,
            eh.amount AS amount,
            COALESCE(NULLIF(shm.shortdesc, ''), NULLIF(shm.description, ''), 'Component ' + CAST(eh.fk_headid AS VARCHAR(20))) AS HeadName,
            shm.displayorder
        FROM HR_Format_Mst m
        INNER JOIN HR_Format_Trn t ON m.pk_formatid = t.fk_formatid
        INNER JOIN SAL_EmployeeHead_Details eh ON m.fk_empid = eh.fk_empid
        LEFT JOIN SAL_Head_Mst shm ON eh.fk_headid = shm.pk_headid
        WHERE t.pk_trnid = @pk_trnid
          AND ISNULL(eh.amount, 0) > 0
        ORDER BY ISNULL(shm.displayorder, 9999), eh.fk_headid;
    END
END;
GO
