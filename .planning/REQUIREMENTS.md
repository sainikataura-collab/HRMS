# Requirements: HRBook - Duplicate Aadhaar Card Prevention

**Defined:** 2026-11-03
**Core Value:** Zero duplicate Aadhaar card records can enter the HRMS system across any sourcing, recruitment, vendor, or onboarding channel.

## v1 Requirements

### Centralized Backend Validation & API

- [ ] **BACKEND-01**: Create SQL stored procedure `dbo.usp_REC_ValidateAadhaarCard` that takes `AadhaarNo`, `CompanyId`, and optional `CurrentAppId`. It queries `tbl_Employee_Mst` for existing employees, `REC_Candidate_Applications` for active pipeline candidates, and identifies Talent Bench candidates.
- [ ] **BACKEND-02**: Expose `POST /api/v1/AtsLifecycle/VerifyAadhaarUniqueness` endpoint in `AtsLifecycleController.cs` returning structured response `{ isDuplicate: bool, canProceed: bool, duplicateType: string, existingDetails: object, message: string }`.
- [ ] **BACKEND-03**: Update `AtsJobRequisitionController.CheckCandidateAadhaar` and `SubmitWalkInCandidate` to use the unified validation logic.
- [ ] **BACKEND-04**: Add server-side duplicate check guard inside `SubmitVendorCandidateBatch` in `AtsLifecycleRepository.cs` so even direct API requests cannot bypass the check.

### Manpower Public Walk-In Apply Page

- [ ] **MANPOWER-01**: In `public-walkin-apply.component.ts`, enhance `validateAadhaarStatus()` to use the unified Aadhaar validation API.
- [ ] **MANPOWER-02**: Display clear visual indicators (green checkmark for unique, red alert for blocked duplicate with reason: "Active Employee" or "In-Process Candidate").
- [ ] **MANPOWER-03**: Block `submitApplication()` button if Aadhaar is marked as duplicate.

### Vendor Portal Registration

- [ ] **VENDOR-01**: In `vendor-portal.component.ts` and `vendor-add-candidate.component.ts`, add debounced real-time Aadhaar validation on batch candidate rows (`(blur)` / 12-digit input).
- [ ] **VENDOR-02**: Highlight duplicate Aadhaar rows with badge/error message showing where the duplicate was detected.
- [ ] **VENDOR-03**: In `submitCandidateBatch()`, execute pre-flight Aadhaar deduplication check against the database before sending batch to server.

### Docs Complete & Statutory Dossier

- [ ] **DOSSIER-01**: In `vendor-portal.component.ts` Dossier section, validate `dossierForm.aadhaarNo` against existing active employees and other candidates on blur.
- [ ] **DOSSIER-02**: In `saveCandidateOnboardingDossier()`, prevent saving or submitting to HR if Aadhaar belongs to another candidate or employee (ignoring current candidate's own record).
- [ ] **DOSSIER-03**: Show clear toast and inline error if duplicate is detected during onboarding.

### Talent Pool / Talent Bench

- [ ] **TALENT-01**: When entering Aadhaar in vendor registration or pipeline and the candidate is found in the Talent Bench / Previously Rejected pool, display an informational banner: *"Candidate [Name] already exists in Talent Bench under MRF [Code]. Click here to allocate them."*
- [ ] **TALENT-02**: Provide seamless one-click transition to allocate the existing candidate to the target MRF rather than registering a duplicate profile.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACKEND-01  | Phase 1 | Pending |
| BACKEND-02  | Phase 1 | Pending |
| BACKEND-03  | Phase 1 | Pending |
| BACKEND-04  | Phase 1 | Pending |
| MANPOWER-01 | Phase 2 | Pending |
| MANPOWER-02 | Phase 2 | Pending |
| MANPOWER-03 | Phase 2 | Pending |
| VENDOR-01   | Phase 2 | Pending |
| VENDOR-02   | Phase 2 | Pending |
| VENDOR-03   | Phase 2 | Pending |
| DOSSIER-01  | Phase 3 | Pending |
| DOSSIER-02  | Phase 3 | Pending |
| DOSSIER-03  | Phase 3 | Pending |
| TALENT-01   | Phase 3 | Pending |
| TALENT-02   | Phase 3 | Pending |

---
*Requirements defined: 2026-11-03*
