# Plan 01-01 Summary: Centralized SQL Stored Procedure for Unified Aadhaar Deduplication

**Completed:** 2026-11-03
**Status:** Success

## Deliverables
1. **`dbo.usp_REC_ValidateAadhaarCard`** created and deployed in SQL Server database `HRBook`:
   - Validates 12-digit numeric structure.
   - Detects blacklisted records in `SAL_Employee_Mst` (`isBlacklisted = 1`).
   - Detects active employees in `SAL_Employee_Mst` and links to `SAL_Designation_Mst` (`CanProceed = 0`, `DuplicateType = 'EMPLOYEE'`).
   - Detects active candidate applications in `REC_Candidate_Applications` (`CanProceed = 0`, `DuplicateType = 'ACTIVE_PIPELINE'`).
   - Detects candidates in Talent Bench / Previously Rejected pool (`CanProceed = 1`, `DuplicateType = 'TALENT_BENCH'`).
   - Supports `@CurrentAppId` to allow candidate dossier updates without self-flagging.
2. **`dbo.usp_REC_SubmitVendorCandidate`** updated with server-side validation:
   - Prevents vendor registration of active employees and active pipeline candidates even if client checks are bypassed.

## Verification Evidence
- Tested unique Aadhaar `999988887777` $\rightarrow$ `CanProceed = True`, `IsDuplicate = False`, `Type = NONE`.
- Tested active employee Aadhaar `490286349371` $\rightarrow$ `CanProceed = False`, `IsDuplicate = True`, `Type = EMPLOYEE`, Existing Employee: Deepak Kumar Upreti / EMP01 (Managing Director).
- Tested active candidate Aadhaar without `@CurrentAppId` $\rightarrow$ `CanProceed = False`, `IsDuplicate = True`, `Type = ACTIVE_PIPELINE`, Existing Candidate: NIKUNJ.
- Tested candidate Aadhaar with `@CurrentAppId` (self-exclusion) $\rightarrow$ `CanProceed = True`, `IsDuplicate = False`, `Type = NONE`.

