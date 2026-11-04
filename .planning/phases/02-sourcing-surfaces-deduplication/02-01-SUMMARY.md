# Phase 2 Summary: Sourcing Surfaces Deduplication & Document Submission Stage Progression

**Execution Date:** 2026-11-03  
**Status:** Completed  
**Associated Plan:** `02-01-PLAN.md`

---

## 1. Accomplishments

### A. Centralized Service Integration (`AtsService.ts`)
- Added `verifyAadhaarUniqueness` and upgraded `checkCandidateAadhaarStatus` in `Frontend/src/app/shared/services/ats.service.ts`.
- Mapped client requests directly to `GET /api/v1/AtsJobRequisition/CheckCandidateAadhaar` which delegates live to `dbo.usp_REC_ValidateAadhaarCard`.
- Supports multi-tenant scoping (`companyId`) and self-record exclusion (`currentAppId`).

### B. Manpower Public Apply (`PublicWalkinApplyComponent`)
- Integrated real-time Aadhaar validation on 12-digit input and blur events.
- Added comprehensive handling for `res.CanProceed === 0` and duplicate categories (`EMPLOYEE`, `ACTIVE_PIPELINE`, `BLACKLISTED`).
- If an Aadhaar belongs to an active employee or candidate in active stages, submission is immediately blocked with explicit error banners.

### C. Staffing Vendor Portal & Candidate Registration
- **`VendorAddCandidateComponent`:**
  - Extended `BatchCandidateRow` with real-time `aadhaarStatus` (`idle`, `checking`, `verified`, `duplicate`) and `aadhaarMessage`.
  - Added debounced verification via `validateRowAadhaar()`.
  - Decorated input fields with status spinners, verified checkmarks, and duplicate warning badges.
  - Added pre-flight batch submission guard in `submitCandidateBatch()` blocking any row with duplicate Aadhaar before sending to the backend.
- **`VendorPortalComponent`:**
  - Added `aadhaarStatus` and row-level validation to the batch roster table.
  - Implemented pre-flight duplicate rejection before network dispatch.
  - Added `dossierAadhaarStatus` and real-time duplicate checking on statutory dossier Aadhaar input with candidate self-exclusion (`currentAppId`).

### D. Automatic Stage Progression on Document Submission
- **Addressing User Requirement:** *"while we submit docs of selected candidate candidate should also move to next step, we are not moving candidate to next step right?"*
- **`VendorPassedInterviewComponent`:**
  - Added `submitToSiteHR()` which validates mandatory documents, statutory identities (Aadhaar & PAN), saves the candidate dossier, and automatically advances the candidate stage to `'Docs_Submitted'` via `atsService.moveCandidateStage`.
  - Updated both Desktop view (`dossier-action-footer`) and Mobile view (`mob-bottom-pinned-bar`) with a prominent "Submit Documents to Site HR (Move to Next Step)" action.
  - Once submitted, candidate moves cleanly to the Site HR Document Verification queue and is cleared from the pending dossiers list.
- **`dbo.usp_REC_SaveCandidateOnboardingDossier` (SQL Server):**
  - Upgraded procedure to call `dbo.usp_REC_ValidateAadhaarCard` on `@CleanAadhaar`, preventing any duplicate employee or candidate Aadhaar from being stealthily saved into a selected candidate record.
  - Added `@AutoAdvanceStage BIT = 0` support.
- **Universal Employee Identity Check:**
  - Updated `dbo.usp_REC_ValidateAadhaarCard` with company ID normalization (`GU-` prefix handling) and universal active employee detection, ensuring active employees across any company branch cannot be re-registered as new candidates.

---

## 2. Verification Results
- `GET /api/v1/AtsJobRequisition/CheckCandidateAadhaar?aadhaarNo=102265430276&companyId=1`:
  - Returns `CanProceed: 0`, `ExistsStatus: 1`, `DuplicateType: "EMPLOYEE"`, `Message: "Duplicate Identity: (RAM KISHOR / SLV0012211) is already an active employee (SECURITY GUARD). Cannot be registered as a candidate."`
- `GET /api/v1/AtsJobRequisition/CheckCandidateAadhaar?aadhaarNo=999988887777&companyId=1`:
  - Returns `CanProceed: 1`, `ExistsStatus: 0`, `DuplicateType: "NONE"`, `Message: "Aadhaar card number is unique and eligible for registration."`

---

## 3. Files Modified
- `Frontend/src/app/shared/services/ats.service.ts`
- `Frontend/src/app/pages/public-apply/public-walkin-apply.component.ts`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-add-candidate/vendor-add-candidate.component.ts`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-add-candidate/vendor-add-candidate.component.html`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-portal/vendor-portal.component.ts`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-portal/vendor-portal.component.html`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-passed-interview/vendor-passed-interview.component.ts`
- `Frontend/src/app/pages/all-dashboard/recruitment/vendor-passed-interview/vendor-passed-interview.component.html`
- Database: `dbo.usp_REC_SaveCandidateOnboardingDossier`, `dbo.usp_REC_ValidateAadhaarCard`, `dbo.usp_REC_CheckCandidateAadhaarStatus`

