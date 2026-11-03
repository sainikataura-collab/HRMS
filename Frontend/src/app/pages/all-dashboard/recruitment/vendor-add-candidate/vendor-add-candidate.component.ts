import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../../../shared/services/ats.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface BatchCandidateRow {
  candidateName: string;
  mobile: string;
  aadhaarNo: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  aadhaarStatus?: 'idle' | 'checking' | 'verified' | 'duplicate';
  aadhaarMessage?: string;
}

@Component({
  selector: 'app-vendor-add-candidate',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-add-candidate.component.html',
  styleUrls: ['./vendor-add-candidate.component.scss']
})
export class VendorAddCandidateComponent implements OnInit {
  // CJ DARCL Recruitment ATS: Talent Bench & Rejected Pool Sourcing Support
  get companyId(): string {
    return sessionStorage.getItem('companyId') ||
           localStorage.getItem('fk_companyId') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') || '';
  }

  selectedVendorId: string = '';
  vendorProfile: any = null;
  isVendorUser: boolean = false;

  // Selected Requisition & Assigned Jobs
  targetReqId: number | null = null;
  assignedJobs: any[] = [];
  selectedJob: any = null;
  loadingJobs: boolean = false;

  // Submitted Candidates for Selected Job
  jobSubmittedCandidates: any[] = [];
  loadingSubmissions: boolean = false;
  submissionSearchQuery: string = '';

  // Sourcing Mode: 'NEW' (Manual Batch Roster) or 'POOL' (Talent Bench & Rejected Pool)
  sourcingMode: 'NEW' | 'POOL' = 'NEW';

  // New Candidates Sourcing Roster
  batchCandidates: BatchCandidateRow[] = [];
  submittingBatch: boolean = false;
  batchSubmissionFeedback: any = null;

  // Existing Pool Candidates (Bench & Previously Rejected)
  poolCandidates: any[] = [];
  loadingPool: boolean = false;
  poolSearchQuery: string = '';
  poolFilterTab: 'ALL' | 'BENCH' | 'REJECTED' = 'ALL';
  selectedPoolAppIds: Set<number> = new Set();
  assigningPoolCandidates: boolean = false;

  // Job Details Modal
  showJobDetailsModal: boolean = false;

  // Mobile: Single-candidate Add Modal
  showMobileAddModal: boolean = false;
  newCandidateRow: BatchCandidateRow = this.createEmptyRow();
  savingMobileCandidate: boolean = false;

  // Mobile: Pool Selection Modal
  showMobilePoolModal: boolean = false;

  openMobileAddModal(): void {
    this.newCandidateRow = this.createEmptyRow();
    this.showMobileAddModal = true;
  }

  closeMobileAddModal(): void {
    this.showMobileAddModal = false;
  }

  openMobilePoolModal(): void {
    this.loadPoolCandidates();
    this.showMobilePoolModal = true;
  }

  closeMobilePoolModal(): void {
    this.showMobilePoolModal = false;
  }

  saveMobileCandidate(): void {
    const row = this.newCandidateRow;
    if (!row.candidateName?.trim()) {
      alert('Please enter the candidate full name.');
      return;
    }
    if (!row.mobile || row.mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!row.aadhaarNo || row.aadhaarNo.length !== 12) {
      alert('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    // Push to batch and submit immediately
    this.batchCandidates = [{ ...row }];
    this.showMobileAddModal = false;
    this.submitCandidateBatch();
  }

  onMobileModalMobileInput(): void {
    if (this.newCandidateRow.mobile) {
      this.newCandidateRow.mobile = this.newCandidateRow.mobile.replace(/\D/g, '').slice(0, 10);
    }
  }

  onMobileModalAadhaarInput(): void {
    if (this.newCandidateRow.aadhaarNo) {
      this.newCandidateRow.aadhaarNo = this.newCandidateRow.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
  }

  openJobDetailsModal(): void {
    this.showJobDetailsModal = true;
  }

  closeJobDetailsModal(): void {
    this.showJobDetailsModal = false;
  }

  // Candidate Details Modal
  showCandidateModal: boolean = false;
  selectedCandidate: any = null;

  openCandidateDetails(cand: any): void {
    this.selectedCandidate = cand;
    this.showCandidateModal = true;
  }

  closeCandidateDetails(): void {
    this.showCandidateModal = false;
    this.selectedCandidate = null;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atsService: AtsService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    // Read route param or query param — decrypt encrypted IDs (City Master pattern)
    const paramReqId = this.route.snapshot.paramMap.get('reqId');
    const queryReqId = this.route.snapshot.queryParamMap.get('reqId');
    if (paramReqId) {
      const decrypted = this.encryptionService.decryptText(paramReqId);
      this.targetReqId = parseInt(decrypted, 10) || parseInt(paramReqId, 10);
    } else if (queryReqId) {
      const decrypted = this.encryptionService.decryptText(queryReqId);
      this.targetReqId = parseInt(decrypted, 10) || parseInt(queryReqId, 10);
    }

    // Decrypt vendorId from query param
    const encVendorId = this.route.snapshot.queryParamMap.get('vendorId');
    if (encVendorId) {
      const decryptedVendorId = this.encryptionService.decryptText(encVendorId);
      // Store decrypted vendor ID into session for this page's use
      if (decryptedVendorId) {
        sessionStorage.setItem('ats_active_vendor_id', decryptedVendorId);
      }
    }

    this.initCandidateRoster();
    this.detectVendorAndLoadJobs();
  }

  initCandidateRoster(): void {
    this.batchCandidates = [
      this.createEmptyRow(),
      this.createEmptyRow(),
      this.createEmptyRow()
    ];
  }

  createEmptyRow(): BatchCandidateRow {
    return {
      candidateName: '',
      mobile: '',
      aadhaarNo: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      aadhaarStatus: 'idle',
      aadhaarMessage: ''
    };
  }

  addBatchRow(): void {
    this.batchCandidates.push(this.createEmptyRow());
  }

  addMultipleRows(count: number = 3): void {
    for (let i = 0; i < count; i++) {
      this.batchCandidates.push(this.createEmptyRow());
    }
  }

  removeBatchRow(index: number): void {
    if (this.batchCandidates.length <= 1) {
      this.batchCandidates = [this.createEmptyRow()];
      return;
    }
    this.batchCandidates.splice(index, 1);
  }

  onMobileInput(row: BatchCandidateRow): void {
    if (row.mobile) {
      row.mobile = row.mobile.replace(/\D/g, '').slice(0, 10);
    }
  }

  onAadhaarInput(row: BatchCandidateRow): void {
    if (row.aadhaarNo) {
      row.aadhaarNo = row.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
    if (!row.aadhaarNo || row.aadhaarNo.length < 12) {
      row.aadhaarStatus = 'idle';
      row.aadhaarMessage = '';
      return;
    }
    if (row.aadhaarNo.length === 12) {
      this.validateRowAadhaar(row);
    }
  }

  validateRowAadhaar(row: BatchCandidateRow): void {
    const cleanAadhaar = (row.aadhaarNo || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) return;

    row.aadhaarStatus = 'checking';
    this.atsService.verifyAadhaarUniqueness({ aadhaarNo: cleanAadhaar, companyId: this.companyId }).subscribe({
      next: (res: any) => {
        const canProceed = res?.canProceed !== undefined 
          ? (res.canProceed === true || res.canProceed === 1) 
          : (res?.CanProceed === 1 || res?.CanProceed === true);
        const isDuplicate = res?.isDuplicate === true || res?.ExistsStatus === 1;
        const msg = res?.message || res?.Message || '';

        if (!canProceed || isDuplicate) {
          row.aadhaarStatus = 'duplicate';
          row.aadhaarMessage = msg || 'Aadhaar already registered in employee or candidate records.';
          this.toastr.error(`Row [${row.candidateName || 'Candidate'}]: ${row.aadhaarMessage}`, 'Duplicate Aadhaar Blocked');
        } else {
          row.aadhaarStatus = 'verified';
          row.aadhaarMessage = '';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        row.aadhaarStatus = 'verified';
        row.aadhaarMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  compareJobs(j1: any, j2: any): boolean {
    if (!j1 || !j2) return j1 === j2;
    return j1.reqId === j2.reqId || j1.reqId == j2.reqId;
  }

  detectVendorAndLoadJobs(): void {
    const qVendorId = this.route.snapshot.queryParamMap.get('vendorId');
    const sessionVendorId = sessionStorage.getItem('fk_vendorId') || 
                            localStorage.getItem('fk_vendorId') ||
                            sessionStorage.getItem('ats_active_vendor_id') ||
                            sessionStorage.getItem('vendorId') || '';

    if (qVendorId) {
      this.selectedVendorId = qVendorId;
      sessionStorage.setItem('ats_active_vendor_id', qVendorId);
    } else if (sessionVendorId) {
      this.selectedVendorId = sessionVendorId;
    }

    this.atsService.getMyVendorProfile().subscribe({
      next: (profile: any) => {
        if (profile && profile.isVendor && profile.vendorId) {
          this.isVendorUser = true;
          this.vendorProfile = profile;
          this.selectedVendorId = profile.vendorId;
          sessionStorage.setItem('isVendor', 'true');
          sessionStorage.setItem('fk_vendorId', profile.vendorId);
          sessionStorage.setItem('ats_active_vendor_id', profile.vendorId);
        }
        this.ensureVendorAndLoadJobs();
      },
      error: () => {
        this.ensureVendorAndLoadJobs();
      }
    });
  }

  ensureVendorAndLoadJobs(): void {
    // If a target requisition is requested, check if vendors mapped to it can be resolved
    if (this.targetReqId) {
      this.atsService.getVendorsForMapping(this.targetReqId, this.companyId).subscribe({
        next: (mapped: any[]) => {
          if (mapped && mapped.length > 0) {
            const match = mapped.find(m => (m.fk_vendorId || m.vendorId || m.pk_recId) === this.selectedVendorId);
            if (!match) {
              const activeMapped = mapped[0];
              this.selectedVendorId = activeMapped.fk_vendorId || activeMapped.vendorId || activeMapped.pk_recId;
              sessionStorage.setItem('ats_active_vendor_id', this.selectedVendorId);
            }
          }
          this.proceedWithVendorJobs();
        },
        error: () => {
          this.proceedWithVendorJobs();
        }
      });
    } else {
      this.proceedWithVendorJobs();
    }
  }

  proceedWithVendorJobs(): void {
    if (this.selectedVendorId) {
      this.loadAssignedJobs();
    } else {
      // Fallback: Query portal vendors list and pick the first vendor with active assigned jobs
      this.atsService.getVendorListForPortal(this.companyId).subscribe({
        next: (vendors: any[]) => {
          if (vendors && vendors.length > 0) {
            const activeVendor = vendors.find(v => (v.assignedJobsCount || 0) > 0) || vendors[0];
            this.selectedVendorId = activeVendor.vendorId;
            sessionStorage.setItem('ats_active_vendor_id', this.selectedVendorId);
            this.loadAssignedJobs();
          } else {
            this.loadingJobs = false;
          }
        },
        error: () => {
          this.loadingJobs = false;
        }
      });
    }
  }

  loadAssignedJobs(): void {
    if (!this.selectedVendorId) {
      this.loadingJobs = false;
      return;
    }

    this.loadingJobs = true;
    this.loaderService.start();
    this.atsService.getVendorAssignedJobs(this.selectedVendorId, this.companyId).subscribe({
      next: (jobs: any[]) => {
        this.loaderService.stop();
        this.assignedJobs = jobs || [];
        this.loadingJobs = false;

        if (this.assignedJobs.length > 0) {
          if (this.targetReqId) {
            this.selectedJob = this.assignedJobs.find(j => j.reqId == this.targetReqId) || this.assignedJobs[0];
          } else {
            this.selectedJob = this.assignedJobs[0];
          }
          this.targetReqId = this.selectedJob?.reqId || null;

          if (this.selectedJob?.reqId) {
            this.loadJobSubmissions(this.selectedJob.reqId);
          }
        } else {
          // If no assigned jobs found for this vendor, fallback to portal vendor list with active jobs
          this.atsService.getVendorListForPortal(this.companyId).subscribe({
            next: (vendors: any[]) => {
              const vendorWithJobs = vendors?.find(v => (v.assignedJobsCount || 0) > 0 && v.vendorId !== this.selectedVendorId);
              if (vendorWithJobs) {
                this.selectedVendorId = vendorWithJobs.vendorId;
                sessionStorage.setItem('ats_active_vendor_id', this.selectedVendorId);
                this.loadAssignedJobs();
              }
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.loadingJobs = false;
        console.error('Error loading assigned jobs:', err);
      }
    });
  }

  onJobSelectChange(job: any): void {
    if (!job) return;
    this.selectedJob = job;
    this.targetReqId = job?.reqId || null;
    this.batchSubmissionFeedback = null;
    this.selectedPoolAppIds.clear();
    if (job?.reqId) {
      this.loadJobSubmissions(job.reqId);
      if (this.sourcingMode === 'POOL') {
        this.loadPoolCandidates();
      }
    }
  }

  loadJobSubmissions(reqId: number): void {
    if (!this.selectedVendorId || !reqId) return;

    this.loadingSubmissions = true;
    this.atsService.getVendorJobSubmissions(this.selectedVendorId, reqId, this.companyId).subscribe({
      next: (list: any[]) => {
        this.jobSubmittedCandidates = list || [];
        this.loadingSubmissions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingSubmissions = false;
        console.error('Error loading job submissions:', err);
      }
    });
  }

  get filteredSubmissions(): any[] {
    if (!this.submissionSearchQuery || !this.submissionSearchQuery.trim()) {
      return this.jobSubmittedCandidates;
    }
    const q = this.submissionSearchQuery.toLowerCase().trim();
    return this.jobSubmittedCandidates.filter(c =>
      (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
      (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
      (c.stage && c.stage.toLowerCase().includes(q))
    );
  }

  submitCandidateBatch(): void {
    if (!this.selectedJob || !this.selectedJob.reqId) {
      this.toastr.warning('Please select an assigned job requisition before submitting candidates.', 'Job Required');
      return;
    }

    const validRows = this.batchCandidates.filter((r: BatchCandidateRow) => r.candidateName && r.candidateName.trim().length > 0);

    if (validRows.length === 0) {
      this.toastr.warning('Please enter at least one candidate full name.', 'No Candidates Entered');
      return;
    }

    // Client-side validations
    for (const r of validRows) {
      if (!r.mobile || !/^[6-9]\d{9}$/.test(r.mobile.trim())) {
        this.toastr.error(
          `Candidate "${r.candidateName}" has an invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.`,
          'Validation Error'
        );
        return;
      }
      if (!r.aadhaarNo || !/^\d{12}$/.test(r.aadhaarNo.trim())) {
        this.toastr.error(
          `Candidate "${r.candidateName}" must have a valid 12-digit Aadhaar Card No.`,
          'Aadhaar Required'
        );
        return;
      }
    }

    // In-batch duplicate checks
    const mobileSet = new Set<string>();
    const aadhaarSet = new Set<string>();
    for (const r of validRows) {
      const mob = r.mobile.trim();
      const aadh = r.aadhaarNo.trim();
      if (mobileSet.has(mob)) {
        this.toastr.error(`Duplicate Mobile Number "${mob}" found in the submission roster.`, 'Batch Duplicate');
        return;
      }
      mobileSet.add(mob);

      if (aadhaarSet.has(aadh)) {
        this.toastr.error(`Duplicate Aadhaar Number "${aadh}" found in the submission roster.`, 'Batch Duplicate');
        return;
      }
      aadhaarSet.add(aadh);
    }

    // Database duplicate check verification
    const duplicateRow = validRows.find(r => r.aadhaarStatus === 'duplicate');
    if (duplicateRow) {
      this.toastr.error(
        `Cannot submit: Candidate "${duplicateRow.candidateName}" has a duplicate Aadhaar (${duplicateRow.aadhaarNo}): ${duplicateRow.aadhaarMessage}`,
        'Duplicate Aadhaar Blocked'
      );
      return;
    }

    const currentReqId = this.selectedJob.reqId;
    const payload = {
      reqId: currentReqId,
      vendorId: this.selectedVendorId,
      vendorName: this.vendorProfile?.vendorName || sessionStorage.getItem('vendorName') || 'Authorized Vendor',
      submittedBy: sessionStorage.getItem('userName') || 'Vendor Portal',
      companyId: this.companyId,
      candidates: validRows.map((r: BatchCandidateRow) => ({
        candidateName: r.candidateName.trim(),
        mobile: r.mobile.trim(),
        aadhaarNo: r.aadhaarNo.trim(),
        email: (r.email || '').trim(),
        gender: r.gender || 'Male',
        dateOfBirth: r.dateOfBirth ? r.dateOfBirth : null
      }))
    };

    this.submittingBatch = true;
    this.batchSubmissionFeedback = null;
    this.loaderService.start();

    this.atsService.submitVendorCandidateBatch(payload).subscribe({
      next: (res: any) => {
        this.loaderService.stop();
        this.submittingBatch = false;
        this.batchSubmissionFeedback = res;

        if (res.succeeded > 0) {
          this.toastr.success(`${res.succeeded} candidate(s) successfully registered into ATS!`, 'Batch Submitted');
          if (currentReqId) {
            this.loadJobSubmissions(currentReqId);
          }
          this.initCandidateRoster();
        }
        if (res.failed > 0) {
          this.toastr.warning(`${res.failed} candidate(s) could not be registered (duplicates or validation failure).`, 'Partial Submission');
        }
      },
      error: (err: any) => {
        this.loaderService.stop();
        this.submittingBatch = false;
        this.toastr.error(err?.error?.message || 'Error occurred while processing batch submission.', 'Submission Error');
      }
    });
  }

  backToAssignedJobs(): void {
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-portal']).catch(() => {
      this.router.navigate(['../vendor-portal'], { relativeTo: this.route });
    });
  }

  // ── TALENT POOL (BENCH & PREVIOUSLY REJECTED) WORKFLOW ────────────────────

  setSourcingMode(mode: 'NEW' | 'POOL'): void {
    this.sourcingMode = mode;
    if (mode === 'POOL') {
      this.loadPoolCandidates();
    }
  }

  setPoolFilter(tab: 'ALL' | 'BENCH' | 'REJECTED'): void {
    this.poolFilterTab = tab;
  }

  loadPoolCandidates(): void {
    if (!this.selectedVendorId) return;
    this.loadingPool = true;
    const currentReqId = this.selectedJob?.reqId || this.targetReqId || null;

    this.atsService.getVendorPoolCandidates(
      this.selectedVendorId,
      currentReqId,
      this.poolSearchQuery,
      this.poolFilterTab,
      this.companyId
    ).subscribe({
      next: (candidates: any[]) => {
        this.poolCandidates = candidates || [];
        this.loadingPool = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPool = false;
        console.error('Error loading pool candidates:', err);
      }
    });
  }

  get filteredPoolCandidates(): any[] {
    // Only exclude ACTIVE in-process candidates on this job by unique ID/AppNo
    const activeCandidates = (this.jobSubmittedCandidates || []).filter(c => !c.isRejected && c.stage !== 'Rejected');
    const activeAppNos = new Set(activeCandidates.map(c => c.applicationNo));
    const activeAppIds = new Set(activeCandidates.map(c => c.appId || c.pk_appId));

    let list = this.poolCandidates.filter(c =>
      !activeAppNos.has(c.applicationNo) &&
      !activeAppIds.has(c.appId)
    );

    if (this.poolFilterTab === 'BENCH') {
      list = list.filter(c => c.poolType === 'BENCH');
    } else if (this.poolFilterTab === 'REJECTED') {
      list = list.filter(c => c.poolType === 'REJECTED');
    }

    if (this.poolSearchQuery && this.poolSearchQuery.trim()) {
      const q = this.poolSearchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
        (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
        (c.skillClassification && c.skillClassification.toLowerCase().includes(q))
      );
    }

    return list;
  }

  get poolBenchCount(): number {
    return this.poolCandidates.filter(c => c.poolType === 'BENCH').length;
  }

  get poolRejectedCount(): number {
    return this.poolCandidates.filter(c => c.poolType === 'REJECTED').length;
  }

  toggleSelectAllPool(event: any): void {
    if (event.target.checked) {
      this.filteredPoolCandidates.forEach(c => this.selectedPoolAppIds.add(c.appId));
    } else {
      this.selectedPoolAppIds.clear();
    }
  }

  toggleSelectPoolCandidate(appId: number): void {
    if (this.selectedPoolAppIds.has(appId)) {
      this.selectedPoolAppIds.delete(appId);
    } else {
      this.selectedPoolAppIds.add(appId);
    }
  }

  isPoolCandidateSelected(appId: number): boolean {
    return this.selectedPoolAppIds.has(appId);
  }

  isAllPoolSelected(): boolean {
    const list = this.filteredPoolCandidates;
    if (list.length === 0) return false;
    return list.every(c => this.selectedPoolAppIds.has(c.appId));
  }

  assignSelectedPoolCandidates(): void {
    if (this.selectedPoolAppIds.size === 0) {
      this.toastr.warning('Please select at least one candidate from the pool.', 'No Candidate Selected');
      return;
    }
    if (!this.selectedJob || !this.selectedJob.reqId) {
      this.toastr.error('No target Job Requisition selected.', 'Job Required');
      return;
    }

    const currentReqId = this.selectedJob.reqId;
    const appIdsToAssign = Array.from(this.selectedPoolAppIds);

    this.assigningPoolCandidates = true;
    const payload = {
      reqId: currentReqId,
      vendorId: this.selectedVendorId,
      appIds: appIdsToAssign,
      companyId: this.companyId,
      assignedBy: sessionStorage.getItem('userName') || 'Vendor Portal'
    };

    this.atsService.assignBenchCandidatesToJob(payload).subscribe({
      next: (res: any) => {
        this.assigningPoolCandidates = false;
        if (res.success) {
          this.toastr.success(res.message || `Successfully assigned ${appIdsToAssign.length} candidate(s) to this job!`, 'Pool Candidates Assigned');
          this.selectedPoolAppIds.clear();
          this.loadJobSubmissions(currentReqId);
          this.loadPoolCandidates();
        } else {
          this.toastr.error(res.message || 'Failed to assign candidates.', 'Assignment Failed');
        }
      },
      error: (err: any) => {
        this.assigningPoolCandidates = false;
        this.toastr.error(err?.error?.message || 'Error assigning candidates to job.', 'Server Error');
      }
    });
  }
}

