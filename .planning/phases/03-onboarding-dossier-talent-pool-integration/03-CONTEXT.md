# Phase 3: Candidate Hire Deduplication, Sequence Generation & Talent Bench Integration - Context

**Gathered:** 2026-11-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 addresses candidate conversion to employee master, UI polish, employee code sequence generation, and talent bench allocation:
1. Candidate Hire & Transfer to Employee Master duplicate Aadhaar checking (preventing duplicate hiring of active employees or active candidates).
2. Elimination of raw DB/SQL internals from UI (`GETDATE()`, `SAL_Company_Config`, `SAL_EmployeeOther_Details`).
3. Resolution of employee code generation (`EMP-001` / `EMP000001` repetition) by normalizing company IDs, linking to `dbo.SAL_Company_Config`, and checking existing employee sequence in `dbo.SAL_Employee_Mst`.
4. Talent Bench Aadhaar detection and seamless re-allocation workflow.

</domain>

<decisions>
## Implementation Decisions

### D-01: Candidate Hire Modal UI Cleanup
In `candidate-pipeline.component.html`:
- Replace `Today (GETDATE())` with `Effective Today`.
- Replace `Assigned automatically on hire` with `Official joining date assigned upon transfer`.
- Replace `Generated from SAL_Company_Config (e.g. T000011)` with `Auto-Generated (Company Sequence)`.
- Replace `Required for SAL_EmployeeOther_Details` with `Required for statutory employee master`.

### D-02: Candidate Hire Aadhaar Duplicate Prevention
- **Frontend (`candidate-pipeline.component.ts` & `.html`):**
  - Track `hireAadhaarStatus`: `'idle' | 'checking' | 'verified' | 'duplicate'`.
  - Add real-time `onHireAadhaarInput()` method calling `atsService.verifyAadhaarUniqueness(...)` with `@CurrentAppId` (to exclude candidate's own application).
  - In `candidate-pipeline.component.html`, add real-time status badge and duplicate warning alert beneath the Aadhaar input.
  - In `confirmHireAndTransfer()`, block submission if `hireAadhaarStatus === 'duplicate'`, displaying a descriptive toastr warning.
- **Backend (`dbo.usp_REC_HireAndTransferToEmployeeMaster`):**
  - Prior to employee insertion, execute `dbo.usp_REC_ValidateAadhaarCard` on `@AadhaarNo` passing `@AppId`.
  - If Aadhaar belongs to an existing active employee in `dbo.SAL_Employee_Mst` or another active candidate, abort transaction and return `Success = 0` with a clear duplicate message.

### D-03: Robust Employee Code Sequence Generation
In `dbo.usp_REC_HireAndTransferToEmployeeMaster`:
- Normalize `@CompanyId` (handling both `'GU-X'` and plain `'X'`).
- Query `dbo.SAL_Company_Config` with normalized company ID.
- If `maxEmpcode` in `dbo.SAL_Company_Config` is 0 or null:
  - Query `dbo.SAL_Employee_Mst` for the maximum existing employee code under `@CompanyId` to initialize the starting sequence.
  - For numeric codes (e.g., CJ Darcl / `GU-8` where max is currently 313046), increment cleanly to `313047`.
  - For prefixed codes (e.g., `PP`, `SS`, `TS`), use the configured prefix and increment the sequence.
- Increment `@MaxCode = @MaxCode + 1` and update `dbo.SAL_Company_Config.maxEmpcode` inside the transaction.
- Ensure the while loop verifies against existing `SAL_Employee_Mst.empcode` to guarantee no collisions.

### D-04: Talent Bench Detection & Re-Allocation
- When `verifyAadhaarUniqueness` returns `duplicateType === 'TALENT_BENCH'`:
  - Show a banner informing the recruiter/vendor that the candidate is already in the Talent Bench.
  - Provide a button to view/allocate that candidate to the current job requisition rather than creating a duplicate profile.

</decisions>

<canonical_refs>
## Canonical References
- `Frontend/src/app/pages/all-dashboard/recruitment/candidate-pipeline/candidate-pipeline.component.ts`
- `Frontend/src/app/pages/all-dashboard/recruitment/candidate-pipeline/candidate-pipeline.component.html`
- `Frontend/src/app/shared/services/ats.service.ts`
- `SQL Stored Procedure: dbo.usp_REC_HireAndTransferToEmployeeMaster`
- `SQL Stored Procedure: dbo.usp_REC_ValidateAadhaarCard`
- `SQL Table: dbo.SAL_Company_Config`
- `SQL Table: dbo.SAL_Employee_Mst`
</canonical_refs>

---
*Phase 3 context gathered: 2026-11-03*
