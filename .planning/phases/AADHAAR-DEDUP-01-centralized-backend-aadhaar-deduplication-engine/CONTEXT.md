# Phase 1: Centralized Backend Aadhaar Deduplication Engine - Context

**Gathered:** 2026-11-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the foundational backend validation infrastructure for Aadhaar deduplication:
1. SQL Stored Procedure `dbo.usp_REC_ValidateAadhaarCard` querying active employees, active recruitment pipeline candidates, and talent bench records.
2. WebAPI endpoint `POST /api/v1/AtsLifecycle/VerifyAadhaarUniqueness` in `AtsLifecycleController.cs`.
3. Server-side validation guard in `AtsLifecycleRepository.SubmitVendorCandidateAsync` preventing duplicate insertion even if client checks are bypassed.
4. Harmonization of existing `AtsJobRequisitionController.CheckCandidateAadhaar` to utilize the new unified stored procedure.

</domain>

<decisions>
## Implementation Decisions

### Data Sources & Scope
- **D-01 (Active Employees Check):** Query `tbl_Employee_Mst` matching `adhaarNo = @AadhaarNo` where employee is active or serving notice. If matched, `duplicateType = 'EMPLOYEE'`.
- **D-02 (ATS Active Candidates Check):** Query `REC_Candidate_Applications` matching `AadhaarNo = @AadhaarNo` and `(CurrentAppId IS NULL OR pk_appId <> @CurrentAppId)` across active interview stages. If matched, `duplicateType = 'ACTIVE_PIPELINE'`.
- **D-03 (Talent Bench Check):** If matching candidate is marked as `BENCH` or `REJECTED`, flag `duplicateType = 'TALENT_BENCH'` and allow candidate re-allocation instead of hard failure.
- **D-04 (Self-Exclusion for Dossier Updates):** Accept optional `@CurrentAppId` parameter so updating an existing candidate's statutory info in the dossier does not self-flag as a duplicate.

### API Response Contract
- **D-05:** Centralized response shape:
  ```json
  {
    "isSuccess": true,
    "isDuplicate": true,
    "canProceed": false,
    "duplicateType": "EMPLOYEE | ACTIVE_PIPELINE | TALENT_BENCH",
    "message": "Candidate with Aadhaar [X] already exists...",
    "existingRecord": {
      "candidateName": "John Doe",
      "mrfCode": "MRF-2026-081",
      "jobTitle": "Warehouse Associate",
      "vendorName": "Adecco Staffing",
      "currentStage": "L2_Technical_Interview",
      "appId": 1042
    }
  }
  ```

### Server-Side Integrity
- **D-06:** In `AtsLifecycleRepository.SubmitVendorCandidateAsync`, check `AadhaarNo` using the new SP prior to inserting. If duplicate, reject row with specific descriptive error message without rolling back the entire batch.

</decisions>

<canonical_refs>
## Canonical References
- `WebAPI/Controllers/RecruitmentManagementController/AtsLifecycleController.cs`
- `WebAPI/Repository/AtsLifecycleRepository.cs`
- `WebAPI/Controllers/RecruitmentManagementController/AtsJobRequisitionController.cs`
- `WebAPI/Repository/AtsJobRequisitionRepository.cs`
- `WebAPI/Models/AtsLifecycleModels.cs`
</canonical_refs>

---
*Phase 1 context gathered: 2026-11-03*

