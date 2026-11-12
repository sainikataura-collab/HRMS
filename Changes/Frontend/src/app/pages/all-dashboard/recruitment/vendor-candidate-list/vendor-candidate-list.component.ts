import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../../../shared/services/ats.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface PreRegisterCandidateRow {
  candidateName: string;
  mobile: string;
  aadhaarNo: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  targetReqId: number | null; // null = Talent Bench
}

@Component({
  selector: 'app-vendor-candidate-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-candidate-list.component.html',
  styleUrls: ['./vendor-candidate-list.component.scss']
})
export class VendorCandidateListComponent implements OnInit {
  get companyId(): string {
    return sessionStorage.getItem('companyId') ||
           localStorage.getItem('fk_companyId') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') || '';
  }

  // Active Vendor & Profile
  vendors: any[] = [];
  selectedVendorId: string = '';
  selectedVendor: any = null;
  vendorProfile: any = null;
  isVendorUser: boolean = false;
  loadingVendors: boolean = false;

  // Candidates Data
  candidates: any[] = [];
  loadingCandidates: boolean = false;
  assignedJobs: any[] = [];

  // Metrics
  metrics = {
    totalSourced: 0,
    inPipeline: 0,
    passedInterview: 0,
    benchPool: 0,
    rejected: 0
  };

  // Search & Filters
  searchQuery: string = '';
  stageFilter: string = 'ALL';
  mrfFilter: string = 'ALL';

  // Desktop Add Candidate Modal
  showAddModal: boolean = false;
  submittingCandidates: boolean = false;
  submissionFeedback: any = null;
  batchRows: PreRegisterCandidateRow[] = [];

  // Mobile Add Candidate Modal
  showMobileAddModal: boolean = false;
  mobileRow: PreRegisterCandidateRow = this.createEmptyRow();

  // Candidate Details Modal
  showDetailsModal: boolean = false;
  selectedCandidateForDetails: any = null;

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
    this.initBatchRows();
    this.detectVendorAndInit();
  }

  createEmptyRow(): PreRegisterCandidateRow {
    return {
      candidateName: '',
      mobile: '',
      aadhaarNo: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      targetReqId: null // default to Bench
    };
  }

  initBatchRows(): void {
    this.batchRows = [
      this.createEmptyRow()
    ];
  }

  addBatchRow(): void {
    this.batchRows.push(this.createEmptyRow());
  }

  removeBatchRow(index: number): void {
    if (this.batchRows.length <= 1) {
      this.batchRows = [this.createEmptyRow()];
      return;
    }
    this.batchRows.splice(index, 1);
  }

  detectVendorAndInit(): void {
    const encVendorId = this.route.snapshot.queryParamMap.get('vendorId');
    // Decrypt vendorId from query param (City Master encryption pattern)
    const qVendorId = encVendorId
      ? (this.encryptionService.decryptText(encVendorId) || encVendorId)
      : '';
    const storedVendorId = sessionStorage.getItem('ats_active_vendor_id');

    this.loadingVendors = true;
    this.atsService.getMyVendorProfile().subscribe({
      next: (profile: any) => {
        this.loadingVendors = false;
        if (profile && profile.isVendor && profile.vendorId) {
          this.isVendorUser = true;
          this.vendorProfile = profile;
          this.selectedVendorId = profile.vendorId;
          this.selectedVendor = profile;
          this.loadCandidates();
          this.loadAssignedJobs();
        } else {
          this.isVendorUser = false;
          this.loadVendorsList(qVendorId || storedVendorId);
        }
      },
      error: () => {
        this.loadingVendors = false;
        this.loadVendorsList(qVendorId || storedVendorId);
      }
    });
  }

  loadVendorsList(preferVendorId: string | null = null): void {
    const storedVendorId = sessionStorage.getItem('ats_active_vendor_id');
    this.loadingVendors = true;
    this.atsService.getVendorListForPortal(this.companyId).subscribe({
      next: (list: any[]) => {
        this.loadingVendors = false;
        this.vendors = list || [];

        if (preferVendorId) {
          this.selectedVendorId = preferVendorId;
        } else if (this.vendors.length > 0) {
          this.selectedVendorId = this.vendors[0].vendorId;
        } else if (storedVendorId) {
          this.selectedVendorId = storedVendorId;
        }

        if (this.selectedVendorId) {
          this.selectedVendor = this.vendors.find(v => v.vendorId === this.selectedVendorId) || null;
          sessionStorage.setItem('ats_active_vendor_id', this.selectedVendorId);
          this.loadCandidates();
          this.loadAssignedJobs();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingVendors = false;
        console.error('Error loading vendors list:', err);
        if (preferVendorId || storedVendorId) {
          this.selectedVendorId = preferVendorId || storedVendorId || '';
          this.loadCandidates();
        }
      }
    });
  }

  onBatchTargetReqIdChange(reqId: number | null): void {
    if (this.batchRows && this.batchRows.length > 0) {
      for (const r of this.batchRows) {
        r.targetReqId = reqId;
      }
    }
  }

  onVendorChange(newVendorId: string): void {
    this.selectedVendorId = newVendorId;
    this.selectedVendor = this.vendors.find(v => v.vendorId === newVendorId) || null;
    sessionStorage.setItem('ats_active_vendor_id', newVendorId);
    this.loadCandidates();
    this.loadAssignedJobs();
  }

  loadAssignedJobs(): void {
    if (!this.selectedVendorId) return;
    this.atsService.getVendorAssignedJobs(this.selectedVendorId, this.companyId).subscribe({
      next: (jobs: any[]) => {
        this.assignedJobs = jobs || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assigned jobs:', err);
      }
    });
  }

  loadCandidates(): void {
    if (!this.selectedVendorId) return;

    this.loadingCandidates = true;
    this.loaderService.start();
    this.atsService.getVendorAllCandidates(this.selectedVendorId, this.companyId, 'ALL', '').subscribe({
      next: (data: any[]) => {
        this.loaderService.stop();
        this.candidates = data || [];
        this.recalculateMetrics();
        this.loadingCandidates = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.loadingCandidates = false;
        console.error('Error loading vendor candidates:', err);
        this.toastr.error('Failed to load candidate list.', 'Data Error');
      }
    });
  }

  recalculateMetrics(): void {
    let sourced = 0;
    let pipeline = 0;
    let passed = 0;
    let bench = 0;
    let rej = 0;

    for (const c of this.candidates) {
      sourced++;
      const stage = (c.stage || '').toUpperCase();
      const isRej = c.isRejected || stage === 'REJECTED';
      const isBench = !c.reqId || c.reqId === 0 || c.mrfCode === 'BENCH' || stage === 'BENCH';

      if (isRej) {
        rej++;
      } else if (stage === 'SELECTED' || stage === 'HIRED' || c.interviewStatus === 'Passed') {
        passed++;
      } else if (isBench) {
        bench++;
      } else {
        pipeline++;
      }
    }

    this.metrics = {
      totalSourced: sourced,
      inPipeline: pipeline,
      passedInterview: passed,
      benchPool: bench,
      rejected: rej
    };
  }

  get filteredCandidates(): any[] {
    let list = this.candidates;

    // Stage filter
    if (this.stageFilter !== 'ALL') {
      if (this.stageFilter === 'BENCH') {
        list = list.filter(c => !c.reqId || c.reqId === 0 || c.mrfCode === 'BENCH' || c.stage === 'Bench');
      } else if (this.stageFilter === 'REJECTED') {
        list = list.filter(c => c.isRejected || c.stage === 'Rejected');
      } else if (this.stageFilter === 'INTERVIEW_PASSED') {
        list = list.filter(c => c.stage === 'Selected' || c.interviewStatus === 'Passed');
      } else if (this.stageFilter === 'APPLIED') {
        list = list.filter(c => c.stage === 'Applied' && !c.isRejected && c.mrfCode !== 'BENCH');
      } else {
        list = list.filter(c => c.stage === this.stageFilter);
      }
    }

    // MRF / Allocation Filter
    if (this.mrfFilter !== 'ALL') {
      if (this.mrfFilter === 'BENCH') {
        list = list.filter(c => !c.reqId || c.reqId === 0 || c.mrfCode === 'BENCH');
      } else {
        list = list.filter(c => c.mrfCode === this.mrfFilter);
      }
    }

    // Search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
        (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
        (c.mrfCode && c.mrfCode.toLowerCase().includes(q)) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(q))
      );
    }

    return list;
  }

  // Format Helpers
  onMobileInput(row: PreRegisterCandidateRow): void {
    if (row.mobile) {
      row.mobile = row.mobile.replace(/\D/g, '').slice(0, 10);
    }
  }

  onAadhaarInput(row: PreRegisterCandidateRow): void {
    if (row.aadhaarNo) {
      row.aadhaarNo = row.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
  }

  // Modal Handlers (Desktop)
  openAddModal(): void {
    this.initBatchRows();
    this.submissionFeedback = null;
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.submissionFeedback = null;
  }

  // Modal Handlers (Mobile)
  openMobileAddModal(): void {
    this.mobileRow = this.createEmptyRow();
    this.showMobileAddModal = true;
  }

  closeMobileAddModal(): void {
    this.showMobileAddModal = false;
  }

  saveMobileCandidate(): void {
    const row = this.mobileRow;
    if (!row.candidateName?.trim()) {
      this.toastr.warning('Please enter candidate full name.', 'Validation');
      return;
    }
    if (!row.mobile || !/^[6-9]\d{9}$/.test(row.mobile.trim())) {
      this.toastr.warning('Please enter a valid 10-digit mobile number.', 'Validation');
      return;
    }
    if (!row.aadhaarNo || !/^\d{12}$/.test(row.aadhaarNo.trim())) {
      this.toastr.warning('Please enter a valid 12-digit Aadhaar number.', 'Validation');
      return;
    }

    this.submitSingleRow(row, true);
  }

  submitBatchCandidates(): void {
    const validRows = this.batchRows.filter(r => r.candidateName && r.candidateName.trim().length > 0);

    if (validRows.length === 0) {
      this.toastr.warning('Please enter at least one candidate full name.', 'Validation');
      return;
    }

    for (const r of validRows) {
      if (!r.mobile || !/^[6-9]\d{9}$/.test(r.mobile.trim())) {
        this.toastr.error(`Candidate "${r.candidateName}" must have a valid 10-digit mobile number.`, 'Validation');
        return;
      }
      if (!r.aadhaarNo || !/^\d{12}$/.test(r.aadhaarNo.trim())) {
        this.toastr.error(`Candidate "${r.candidateName}" must have a valid 12-digit Aadhaar number.`, 'Validation');
        return;
      }
    }

    this.submittingCandidates = true;
    const vendorName = this.selectedVendor?.vendorName || this.vendorProfile?.vendorName || 'Vendor Partner';

    // Group submissions: Bench (reqId = null) or specific reqId
    const candidatesDto = validRows.map(r => ({
      candidateName: r.candidateName.trim(),
      mobile: r.mobile.trim(),
      aadhaarNo: r.aadhaarNo.trim(),
      email: r.email ? r.email.trim() : null,
      gender: r.gender || 'Male',
      dateOfBirth: r.dateOfBirth ? r.dateOfBirth : null
    }));

    const payload = {
      reqId: validRows[0].targetReqId || null, // null = Bench
      vendorId: this.selectedVendorId,
      vendorName: vendorName,
      companyId: this.companyId,
      candidates: candidatesDto
    };

    this.loaderService.start();
    this.atsService.submitVendorCandidateBatch(payload).subscribe({
      next: (resp: any) => {
        this.loaderService.stop();
        this.submittingCandidates = false;
        this.submissionFeedback = resp;
        if (resp && resp.success) {
          this.toastr.success(resp.message || 'Candidates registered successfully!', 'Success');
          this.loadCandidates();
          setTimeout(() => {
            this.closeAddModal();
          }, 1400);
        } else {
          this.toastr.warning(resp?.message || 'Some candidates were rejected/duplicate.', 'Submission Notice');
          this.loadCandidates();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.submittingCandidates = false;
        console.error('Error submitting candidates:', err);
        this.toastr.error('Failed to submit candidate batch.', 'Submission Error');
        this.cdr.detectChanges();
      }
    });
  }

  submitSingleRow(row: PreRegisterCandidateRow, isMobile: boolean = false): void {
    this.submittingCandidates = true;
    const vendorName = this.selectedVendor?.vendorName || this.vendorProfile?.vendorName || 'Vendor Partner';

    const payload = {
      reqId: row.targetReqId || null,
      vendorId: this.selectedVendorId,
      vendorName: vendorName,
      companyId: this.companyId,
      candidates: [
        {
          candidateName: row.candidateName.trim(),
          mobile: row.mobile.trim(),
          aadhaarNo: row.aadhaarNo.trim(),
          email: row.email ? row.email.trim() : null,
          gender: row.gender || 'Male',
          dateOfBirth: row.dateOfBirth ? row.dateOfBirth : null
        }
      ]
    };

    this.atsService.submitVendorCandidateBatch(payload).subscribe({
      next: (resp: any) => {
        this.submittingCandidates = false;
        if (resp && resp.success) {
          this.toastr.success(resp.message || 'Candidate registered successfully!', 'Success');
          if (isMobile) this.closeMobileAddModal();
          this.loadCandidates();
        } else {
          this.toastr.warning(resp?.message || 'Candidate registration failed or duplicate profile.', 'Duplicate/Notice');
          this.loadCandidates();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submittingCandidates = false;
        console.error('Error submitting candidate:', err);
        this.toastr.error('Failed to register candidate.', 'Error');
        this.cdr.detectChanges();
      }
    });
  }

  // Candidate Details Modal
  openCandidateDetails(cand: any): void {
    this.selectedCandidateForDetails = cand;
    this.showDetailsModal = true;
  }

  closeCandidateDetails(): void {
    this.showDetailsModal = false;
    this.selectedCandidateForDetails = null;
  }

  // Navigation
  goBackToVendorPortal(): void {
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-portal']);
  }
}
