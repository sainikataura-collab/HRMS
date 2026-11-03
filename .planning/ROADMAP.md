# Roadmap: HRBook - Duplicate Aadhaar Card Prevention

## Overview

This roadmap delivers end-to-end duplicate Aadhaar card prevention across HRBook HRMS. We start by building a centralized, high-performance SQL validation procedure and API endpoint on the backend, then integrate real-time deduplication guards into the active sourcing surfaces (Manpower Public Link & Vendor Portal batch registration), and finalize with onboarding dossier and talent pool bench re-allocation flows.

## Phases

- [x] **Phase 1: Centralized Backend Aadhaar Deduplication Engine** - Unified stored procedure, repository, and REST API validation service with server-side guards.
- [x] **Phase 2: Sourcing Surfaces Deduplication & Document Submission Stage Progression** - Real-time client feedback and submission blocks for Manpower Public Apply, Vendor Portal registration, and automatic progression to Docs_Submitted.
- [ ] **Phase 3: Onboarding Dossier & Talent Pool Integration** - Statutory dossier uniqueness checks and Talent Bench re-allocation workflow.

## Phase Details

### Phase 1: Centralized Backend Aadhaar Deduplication Engine
**Goal**: Build a single source of truth for Aadhaar uniqueness across active employees, ATS applications, and talent bench pools.
**Depends on**: Nothing
**Requirements**: BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04
**Success Criteria**:
  1. `dbo.usp_REC_ValidateAadhaarCard` accurately detects if an Aadhaar number exists in `tbl_Employee_Mst`, active `REC_Candidate_Applications`, or Talent Bench.
  2. `POST /api/v1/AtsLifecycle/VerifyAadhaarUniqueness` returns sub-100ms structured responses indicating duplicate status, source, and existing record summary.
  3. Batch candidate submission in `AtsLifecycleRepository.cs` enforces server-side duplicate rejection even if client-side validation is bypassed.
**Plans**: 2 plans

Plans:
- [x] 01-01: Create SQL Stored Procedure `dbo.usp_REC_ValidateAadhaarCard` and DTO response models.
- [x] 01-02: Implement repository methods, controller endpoints, and server-side batch submission guards in WebAPI.

### Phase 2: Sourcing Surfaces Deduplication
**Goal**: Prevent duplicate Aadhaar submissions at the initial point of entry on Manpower Public Apply and Vendor Portal registration, and advance candidates on document submission.
**Depends on**: Phase 1
**Requirements**: MANPOWER-01, MANPOWER-02, MANPOWER-03, VENDOR-01, VENDOR-02, VENDOR-03
**Success Criteria**:
  1. Candidates entering Aadhaar on the public walk-in link receive instant inline verification; duplicate numbers are blocked from submitting.
  2. Vendors typing Aadhaar numbers in batch registration rows receive immediate duplicate warnings before submitting the batch roster.
  3. Pre-flight check prevents batch submission if any duplicate Aadhaar exists in the database.
  4. Submitting candidate documents and statutory dossier advances selected candidates to Docs_Submitted.
**Plans**: 1 plan

Plans:
- [x] 02-01: Implement real-time Aadhaar deduplication across Public Apply, Vendor Add Candidate, Vendor Portal, and auto-advance selected candidates to Docs_Submitted on document submission.

### Phase 3: Onboarding Dossier & Talent Pool Integration
**Goal**: Enforce Aadhaar uniqueness during statutory onboarding document completion and enable smart re-allocation from the Talent Bench.
**Depends on**: Phase 2
**Requirements**: DOSSIER-01, DOSSIER-02, DOSSIER-03, TALENT-01, TALENT-02
**Success Criteria**:
  1. Saving or submitting the candidate statutory dossier ("Docs Complete") verifies Aadhaar against active employees and blocks duplicates.
  2. When an Aadhaar matches a candidate in the Talent Bench, vendors/recruiters see a prompt to re-allocate rather than creating a duplicate profile.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Integrate Aadhaar deduplication check into `vendor-portal.component.ts` statutory dossier form and save routine.
- [ ] 03-02: Add Talent Bench detection and one-click re-allocation flow in recruitment candidate sourcing.

---
*Roadmap generated: 2026-11-03*

