# HRBook - Duplicate Aadhaar Card Prevention & Deduplication Engine

## What This Is

An enterprise-grade cross-channel Aadhaar card deduplication system integrated into HRBook HRMS. It prevents duplicate candidate submissions, multi-vendor cannibalization, and re-registration of existing active employees across the entire recruitment and onboarding lifecycle: Manpower Public Apply QR portal, Staffing Vendor Portal registration, Statutory Onboarding Dossier ("Docs Complete"), and Talent Pool / Bench re-allocation.

## Core Value

Zero duplicate Aadhaar card records can enter the HRMS system across any sourcing, recruitment, vendor, or onboarding channel.

## Business Context

- **Customer:** HR Operations, Recruitment Managers, Talent Acquisition Teams, and Empanelled Staffing Vendors.
- **Revenue model / Impact:** Prevents ghost candidate billing, duplicate vendor claims, duplicate PF/ESIC statutory compliance filings, and redundant interview cycles.
- **Success metric:** 100% of candidate registration surfaces reject duplicate Aadhaar numbers in real time prior to database insertion.

## Requirements

### Validated (Existing Brownfield Capabilities)

- ✓ [Multi-tenant HRMS Web API & Angular 18 Frontend] — existing
- ✓ [Public Walk-In QR code candidate registration] — existing
- ✓ [Staffing Partner Vendor Portal with batch candidate registration] — existing
- ✓ [Onboarding Candidate Statutory Dossier and Document Verification] — existing
- ✓ [Talent Bench & Rejected Pool re-allocation] — existing

### Active (Aadhaar Deduplication Engine)

- [ ] **DEDUP-01 (Centralized Backend Validation)**: Centralized SQL stored procedure (`usp_REC_ValidateAadhaarCard`) and API endpoint (`/api/v1/AtsLifecycle/VerifyAadhaarUniqueness`) that checks incoming Aadhaar against Active Employees (`tbl_Employee_Mst.adhaarNo`), Active ATS Candidates (`REC_Candidate_Applications`), and Talent Bench candidates.
- [ ] **DEDUP-02 (Manpower Public Apply Page)**: Real-time 12-digit Aadhaar validation with inline feedback and submission blocking if Aadhaar already exists as an employee or candidate.
- [ ] **DEDUP-03 (Vendor Portal Single & Batch Registration)**: Real-time blur/input Aadhaar check on individual entry and batch roster rows; pre-submission batch deduplication preventing duplicate candidate submissions across vendors.
- [ ] **DEDUP-04 (Docs Complete / Statutory Dossier Submission)**: Aadhaar uniqueness validation when saving candidate statutory info and before submitting onboarding documents to HR.
- [ ] **DEDUP-05 (Talent Pool & Bench Cross-Channel Detection)**: When a matching Aadhaar is found in the Talent Bench / Previously Rejected pool, notify user/vendor with option to allocate from pool instead of creating a redundant record.

### Out of Scope

- Biometric fingerprint matching (Fingerprint hardware SDK) — Out of scope for this phase; Aadhaar number verification is numeric 12-digit identity deduplication.
- Government UIDAI OTP authentication (e-KYC) — Already handled selectively via SurePass API sandbox during document verification; not required for raw registration duplicate checks.

## Context

- **Backend:** ASP.NET Core 8.0 Web API, Dapper, SQL Server (`DataBaseFactory.cs`, `AtsLifecycleController.cs`, `AtsJobRequisitionController.cs`).
- **Frontend:** Angular 18 Standalone components (`vendor-portal.component.ts`, `vendor-add-candidate.component.ts`, `public-walkin-apply.component.ts`, `candidate-pipeline.component.ts`).
- **Data Model:** Candidate applications stored in `REC_Candidate_Applications` table with `AadhaarNo` column; employee records in `tbl_Employee_Mst` with `adhaarNo` column.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Centralized Validation Stored Procedure | Avoid replicating SQL checks across different controllers; one single source of truth for Aadhaar uniqueness | Approved |
| Real-time Debounced Validation on 12 Digits | Gives instant visual feedback to candidate/vendor before form submission | Approved |
| Hard Block on Employee & Active Candidate | An active employee or in-process candidate cannot be re-registered | Approved |
| Smart Alert for Talent Pool Records | If Aadhaar exists in Talent Bench, allow reallocation instead of duplicate creation | Approved |

## Constraints

- Aadhaar number must be strictly 12 numeric digits.
- Check must execute with sub-200ms latency to provide smooth real-time typing/blur UX in batch rosters.
- Must support multi-tenant company scoping while offering cross-entity safety where needed.

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-11-03 after initialization*

