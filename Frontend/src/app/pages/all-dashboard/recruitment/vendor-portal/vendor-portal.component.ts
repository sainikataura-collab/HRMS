import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AtsService } from '../../../../shared/services/ats.service';

export interface BatchCandidateRow {
  candidateName: string;
  mobile: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  fatherName: string;
  aadhaarNo: string;
  aadhaarStatus?: 'idle' | 'checking' | 'verified' | 'duplicate';
  aadhaarMessage?: string;
}

@Component({
  selector: 'app-vendor-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vendor-portal.component.html',
  styleUrl: './vendor-portal.component.scss'
})
export class VendorPortalComponent implements OnInit {
  // Company Scoping (Zero Hardcoding)
  get companyId(): string {
    return sessionStorage.getItem('companyId') ||
           localStorage.getItem('fk_companyId') ||
           localStorage.getItem('companyId') ||
           sessionStorage.getItem('fk_companyId') || '';
  }

  // Active Vendors & Switcher
  vendors: any[] = [];
  selectedVendorId: string = '';
  selectedVendor: any = null;
  loadingVendors: boolean = false;
  loadingData: boolean = false;

  // Vendor Dashboard Metrics
  metrics = {
    assignedJobsCount: 0,
    totalSubmissions: 0,
    inReviewCount: 0,
    selectedCount: 0,
    hiredCount: 0
  };

  // Data Collections
  assignedJobs: any[] = [];
  selectedCandidates: any[] = [];

  // Search & Filter
  jobSearchQuery: string = '';
  candidateSearchQuery: string = '';
  selectedLocation: string = '';
  selectedJobFilter: 'recent' | 'open' | 'closed' | 'this-month' = 'recent';
  tempSelectedFilter: 'recent' | 'open' | 'closed' | 'this-month' = 'recent';
  showJobFilterModal: boolean = false;

  // Navigation Architecture
  activePage: 'jobs' | 'job-submissions' | 'add-candidates' | 'selected' | 'dossier' | 'all-candidates' = 'jobs';

  // Job Submissions & Add Candidates State
  selectedJobForBatch: any = null;
  batchCandidates: BatchCandidateRow[] = [];
  submittingBatch: boolean = false;
  batchSubmissionFeedback: any = null;
  jobSubmittedCandidates: any[] = [];
  loadingJobSubmissions: boolean = false;
  jobCandidateSearch: string = '';

  // Sourcing Mode & Talent Pool (Bench & Previously Rejected)
  sourcingMode: 'NEW' | 'POOL' = 'NEW';
  poolCandidates: any[] = [];
  loadingPool: boolean = false;
  poolSearchQuery: string = '';
  poolFilterTab: 'ALL' | 'BENCH' | 'REJECTED' = 'ALL';
  selectedPoolAppIds: Set<number> = new Set();
  assigningPoolCandidates: boolean = false;

  // Selected Candidate Dossier & Document Modal/Drawer
  showDossierModal: boolean = false;
  selectedCandidateForDossier: any = null;
  loadingDocs: boolean = false;
  savingDossier: boolean = false;
  submittingToHR: boolean = false;
  candidateDocs: any[] = [];
  uploadingDocCode: string | null = null;
  dossierActiveSection: 'info' | 'docs' = 'info';

  dossierForm = {
    aadhaarNo: '',
    panNo: '',
    bankAccNo: '',
    bankIfsc: '',
    bankName: '',
    nomineeName: '',
    nomineeRelation: 'Father',
    nomineeDOB: '',
    nomineeContact: '',
    uanNo: '',
    esicNo: ''
  };
  dossierAadhaarStatus: 'idle' | 'checking' | 'verified' | 'duplicate' = 'idle';
  dossierAadhaarMessage: string = '';

  // Document Preview Modal
  showDocPreviewModal: boolean = false;
  previewDocTitle: string = '';
  previewDocUrl: SafeResourceUrl | null = null;

  // Job Details Modal
  showJobDetailsModal: boolean = false;
  selectedJobForDetails: any = null;

  // Vendor User Detection & Identity (Zero Hardcoding)
  isVendorUser: boolean = false;
  vendorProfile: any = null;
  assignedLocationIds: string[] = [];

  constructor(
    private atsService: AtsService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService,
    private loaderService: NgxUiLoaderService
  ) {}


  get userId(): string {
    return sessionStorage.getItem('userId') || 
           localStorage.getItem('userId') || 
           sessionStorage.getItem('fk_userId') || 
           localStorage.getItem('fk_userId') || '';
  }

  loadUserAccessRights(): void {
    if (!this.isVendorUser && this.userId) {
      this.atsService.getUserAccessRights(this.userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];
            this.cdr.detectChanges();
          }
        },
        error: () => {}
      });
    }
  }

  isLocationAllowed(job: any): boolean {
    if (this.isVendorUser || !this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return true;
    }
    const locId = String(job.fk_locid || job.locId || job.locationId || '').trim();
    const locName = String(job.location || '').trim();

    const cleanTargetId = locId.replace(/^GU-/i, '');
    const cleanTargetName = locName.toLowerCase();

    return this.assignedLocationIds.some(assigned => {
      const assignedStr = String(assigned || '').trim();
      const cleanAssigned = assignedStr.replace(/^GU-/i, '');
      if (cleanAssigned && cleanTargetId && cleanAssigned.toLowerCase() === cleanTargetId.toLowerCase()) return true;
      if (assignedStr.toLowerCase() === locId.toLowerCase()) return true;
      if (cleanTargetName && (assignedStr.toLowerCase() === cleanTargetName || cleanAssigned.toLowerCase() === cleanTargetName)) return true;
      return false;
    });
  }

  get authorizedAssignedJobs(): any[] {
    return this.assignedJobs || [];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params && (params['tab'] === 'selected' || params['page'] === 'selected')) {
        this.activePage = 'selected';
      }
      if (params && params['vendorId']) {
        const decryptedVendorId = this.encryptionService.decryptText(params['vendorId']);
        this.selectedVendorId = decryptedVendorId || params['vendorId'];
      }
    });
    this.loadUserAccessRights();
    this.detectVendorAndLoad();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Detect Vendor User & Load Vendors
  // ─────────────────────────────────────────────────────────────────────────────
  detectVendorAndLoad(): void {
    const sessionIsVendor = sessionStorage.getItem('isVendor') === 'true' || 
                            localStorage.getItem('isVendor') === 'true';
    const sessionVendorId = sessionStorage.getItem('fk_vendorId') || 
                            localStorage.getItem('fk_vendorId') || '';

    if (sessionIsVendor && sessionVendorId) {
      this.isVendorUser = true;
      this.selectedVendorId = sessionVendorId;
    }

    this.atsService.getMyVendorProfile().subscribe({
      next: (profile: any) => {
        if (profile && profile.isVendor && profile.vendorId) {
          this.isVendorUser = true;
          this.selectedVendorId = profile.vendorId;
          this.vendorProfile = profile;
          sessionStorage.setItem('isVendor', 'true');
          sessionStorage.setItem('fk_vendorId', profile.vendorId);
        }
        this.loadVendors();
      },
      error: () => {
        this.loadVendors();
      }
    });
  }

  loadVendors(): void {
    this.loadingVendors = true;
    this.loaderService.start();
    this.atsService.getVendorListForPortal(this.companyId).subscribe({
      next: (res: any[]) => {
        this.loaderService.stop();
        this.vendors = res || [];
        this.loadingVendors = false;

        // If current user is a vendor, strictly lock onto their vendorId
        if (this.isVendorUser && this.selectedVendorId) {
          this.onVendorChange(this.selectedVendorId);
        } else if (this.selectedVendorId && this.vendors.some(v => v.vendorId === this.selectedVendorId)) {
          this.onVendorChange(this.selectedVendorId);
        } else {
          const savedVendorId = sessionStorage.getItem('ats_active_vendor_id');
          if (savedVendorId && this.vendors.some(v => v.vendorId === savedVendorId)) {
            this.onVendorChange(savedVendorId);
          } else if (this.vendors.length > 0) {
            this.onVendorChange(this.vendors[0].vendorId);
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.loadingVendors = false;
        this.toastr.error('Failed to load staffing vendors for portal.', 'Vendor Portal');
      }
    });
  }

  onVendorChange(vendorId: string): void {
    if (this.isVendorUser && this.selectedVendorId && vendorId !== this.selectedVendorId) {
      return;
    }
    this.selectedVendorId = vendorId;
    sessionStorage.setItem('ats_active_vendor_id', vendorId);
    this.selectedVendor = this.vendors.find(v => v.vendorId === vendorId) || null;

    // Encrypt vendorId in URL query parameters so ID is always encoded like other pages
    if (vendorId) {
      const encId = this.encryptionService.encryptText(vendorId);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { vendorId: encId },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    this.refreshVendorData();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Refresh Vendor Data (Metrics, Assigned Jobs, Selected Candidates)
  // ─────────────────────────────────────────────────────────────────────────────
  refreshVendorData(): void {
    if (!this.selectedVendorId) return;
    this.loadingData = true;
    this.loaderService.start();

    // 1. Load Metrics
    this.atsService.getVendorPortalMetrics(this.selectedVendorId, this.companyId).subscribe({
      next: (m) => {
        if (m) {
          this.metrics = {
            assignedJobsCount: m.assignedJobsCount || 0,
            totalSubmissions: m.totalSubmissions || 0,
            inReviewCount: m.inReviewCount || 0,
            selectedCount: m.selectedCount || 0,
            hiredCount: m.hiredCount || 0
          };
        }
      },
      error: () => {}
    });

    // 2. Load Assigned Jobs
    this.atsService.getVendorAssignedJobs(this.selectedVendorId, this.companyId).subscribe({
      next: (jobs: any[]) => {
        this.loaderService.stop();
        this.assignedJobs = jobs || [];
        this.loadingData = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loaderService.stop();
        this.loadingData = false;
        this.toastr.error('Failed to load allocated jobs for this vendor.', 'Jobs Error');
      }
    });

    // 3. Load Selected Candidates
    this.atsService.getVendorSelectedCandidates(this.selectedVendorId, this.companyId).subscribe({
      next: (cands: any[]) => {
        this.selectedCandidates = cands || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading selected candidates:', err);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Filtered Collections
  // ─────────────────────────────────────────────────────────────────────────────
  get availableLocations(): string[] {
    const locs = this.authorizedAssignedJobs
      .map(j => (j.location || '').trim())
      .filter((loc, index, self) => !!loc && self.indexOf(loc) === index);
    return locs.sort();
  }

  get filteredJobs(): any[] {
    let list = [...this.authorizedAssignedJobs];

    // 1. Location Filter
    if (this.selectedLocation) {
      list = list.filter(j => (j.location || '').trim().toLowerCase() === this.selectedLocation.trim().toLowerCase());
    }

    // 2. Search Query Filter
    if (this.jobSearchQuery.trim()) {
      const q = this.jobSearchQuery.toLowerCase();
      list = list.filter(j =>
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q)) ||
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }

    // 3. User Filter/Sort Modal Options
    switch (this.selectedJobFilter) {
      case 'open':
        list = list.filter(j => this.isJobOpen(j));
        break;

      case 'closed':
        list = list.filter(j => this.isJobClosed(j));
        break;

      case 'this-month':
        list = list.filter(j => this.isJobThisMonth(j));
        break;

      case 'recent':
      default:
        break;
    }

    // Default sort by recent (latest assignedDate or reqId descending)
    list.sort((a, b) => {
      const dateA = a.assignedDate ? new Date(a.assignedDate).getTime() : 0;
      const dateB = b.assignedDate ? new Date(b.assignedDate).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (Number(b.reqId) || 0) - (Number(a.reqId) || 0);
    });

    return list;
  }

  // ── Robust Filter Condition Checkers ─────────────────────────────────────
  isJobClosed(j: any): boolean {
    const wf = (j.workflowStatus || '').toLowerCase();
    const st = (j.status || '').toLowerCase();
    const reqSt = (j.requisitionStatus || '').toLowerCase();
    if (wf === 'closed' || wf === 'c' || wf === 'filled' || wf === 'rejected') return true;
    if (st === 'closed' || st === 'c' || st === 'filled' || st === 'rejected') return true;
    if (reqSt === 'closed' || reqSt === 'c' || reqSt === 'filled' || reqSt === 'rejected') return true;
    const openings = Number(j.openingsCount) || 0;
    const hired = Number(j.hiredCount) || 0;
    if (openings > 0 && hired >= openings) return true;
    return false;
  }

  isJobOpen(j: any): boolean {
    return !this.isJobClosed(j);
  }

  isJobThisMonth(j: any): boolean {
    const dateVal = j.assignedDate || j.dated || j.createdDate || j.postingDate;
    if (!dateVal) return false;
    let d = new Date(dateVal);
    if (isNaN(d.getTime()) && typeof dateVal === 'string') {
      const parts = dateVal.split(/[\/\-\s]/);
      if (parts.length >= 3) {
        if (parts[2].length === 4) {
          d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        } else if (parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
      }
    }
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  // ── Job Filter Modal Helpers ─────────────────────────────────────────────
  openJobFilterModal(): void {
    this.tempSelectedFilter = this.selectedJobFilter;
    this.showJobFilterModal = true;
  }

  closeJobFilterModal(): void {
    this.showJobFilterModal = false;
  }

  applyJobFilter(filter: 'recent' | 'open' | 'closed' | 'this-month'): void {
    this.selectedJobFilter = filter;
    this.closeJobFilterModal();
    this.cdr.detectChanges();
  }

  resetJobFilter(): void {
    this.selectedJobFilter = 'recent';
    this.tempSelectedFilter = 'recent';
    this.selectedLocation = '';
    this.jobSearchQuery = '';
    this.closeJobFilterModal();
    this.cdr.detectChanges();
  }

  get currentFilterLabel(): string {
    switch (this.selectedJobFilter) {
      case 'open': return 'Open Positions';
      case 'closed': return 'Closed Jobs';
      case 'this-month': return 'This Month';
      case 'recent': default: return 'Recent Jobs';
    }
  }

  getFilterCount(type: 'recent' | 'open' | 'closed' | 'this-month'): number {
    if (!this.assignedJobs || this.assignedJobs.length === 0) return 0;
    switch (type) {
      case 'recent':
        return this.assignedJobs.length;
      case 'open':
        return this.assignedJobs.filter(j => this.isJobOpen(j)).length;
      case 'closed':
        return this.assignedJobs.filter(j => this.isJobClosed(j)).length;
      case 'this-month':
        return this.assignedJobs.filter(j => this.isJobThisMonth(j)).length;
    }
  }

  get filteredSelectedCandidates(): any[] {
    if (!this.candidateSearchQuery.trim()) return this.selectedCandidates;
    const q = this.candidateSearchQuery.toLowerCase();
    return this.selectedCandidates.filter(c =>
      (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
      (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.toLowerCase().includes(q)) ||
      (c.mrfCode && c.mrfCode.toLowerCase().includes(q)) ||
      (c.jobTitle && c.jobTitle.toLowerCase().includes(q))
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Page Navigation & Batch Candidate Submission (Page 2)
  // ─────────────────────────────────────────────────────────────────────────────
  navigateToPage(page: 'jobs' | 'add-candidates' | 'selected' | 'dossier' | 'all-candidates'): void {
    if (page === 'all-candidates') {
      this.openCandidateListPage();
      return;
    }
    if (page === 'selected' || page === 'dossier') {
      this.openPassedInterviewPage();
      return;
    }
    this.activePage = page;
  }

  openPassedInterviewPage(candidate?: any): void {
    const encVendorId = this.selectedVendorId
      ? this.encryptionService.encryptText(String(this.selectedVendorId))
      : '';

    const qParams: any = {};
    if (encVendorId) qParams.vendorId = encVendorId;

    if (candidate && candidate.appId) {
      const encAppId = this.encryptionService.encryptText(String(candidate.appId));
      qParams.appId = encAppId;
    }

    const targetPath = ['/dash/recruitment/recruitmentdashboard/vendor-passed-interview'];

    this.router.navigate(targetPath, { queryParams: qParams }).then(success => {
      if (!success) {
        this.router.navigate(['../vendor-passed-interview'], { relativeTo: this.route, queryParams: qParams });
      }
    });
  }

  openCandidateListPage(): void {
    const qParams: any = {};
    if (this.selectedVendorId) {
      qParams.vendorId = this.encryptionService.encryptText(String(this.selectedVendorId));
    }
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-candidates'], { queryParams: qParams }).then(success => {
      if (!success) {
        this.router.navigate(['../vendor-candidates'], { relativeTo: this.route, queryParams: qParams });
      }
    });
  }

  openAddCandidatesPage(job?: any): void {
    const targetJob = job || (this.assignedJobs.length > 0 ? this.assignedJobs[0] : null);
    if (!targetJob) {
      this.toastr.warning('No active jobs currently allocated to this vendor.', 'Allocation Required');
      return;
    }

    const reqId = targetJob.reqId;
    const encVendorId = this.selectedVendorId
      ? this.encryptionService.encryptText(String(this.selectedVendorId))
      : '';
    const qParams: any = {};
    if (encVendorId) qParams.vendorId = encVendorId;

    if (reqId) {
      const encReqId = this.encryptionService.encryptText(String(reqId));
      const targetPath = ['/dash/recruitment/recruitmentdashboard/vendor-add-candidate', encReqId];
      this.router.navigate(targetPath, { queryParams: qParams }).then(success => {
        if (!success) {
          this.router.navigate(['../vendor-add-candidate', encReqId], { relativeTo: this.route, queryParams: qParams });
        }
      });
    } else {
      this.router.navigate(['/dash/recruitment/recruitmentdashboard/vendor-add-candidate'], { queryParams: qParams }).then(success => {
        if (!success) {
          this.router.navigate(['../vendor-add-candidate'], { relativeTo: this.route, queryParams: qParams });
        }
      });
    }
  }

  openJobDetailsModal(job: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedJobForDetails = job;
    this.showJobDetailsModal = true;
  }

  closeJobDetailsModal(): void {
    this.showJobDetailsModal = false;
    this.selectedJobForDetails = null;
  }

  openJobSubmissionsPage(job: any): void {
    this.openAddCandidatesPage(job);
  }

  get filteredJobSubmittedCandidates(): any[] {
    if (!this.jobCandidateSearch || !this.jobCandidateSearch.trim()) {
      return this.jobSubmittedCandidates;
    }
    const q = this.jobCandidateSearch.toLowerCase().trim();
    return this.jobSubmittedCandidates.filter(c =>
      (c.candidateName && c.candidateName.toLowerCase().includes(q)) ||
      (c.applicationNo && c.applicationNo.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.aadhaarNo && c.aadhaarNo.includes(q)) ||
      (c.stage && c.stage.toLowerCase().includes(q))
    );
  }

  onBatchJobChange(job: any): void {
    this.selectedJobForBatch = job;
    this.batchSubmissionFeedback = null;
    if (job?.reqId) {
      this.loadJobSubmissions(job.reqId);
    }
  }

  loadJobSubmissions(reqId: number): void {
    if (!this.selectedVendorId || !reqId) return;
    this.loadingJobSubmissions = true;
    this.atsService.getVendorJobSubmissions(this.selectedVendorId, reqId, this.companyId).subscribe({
      next: (list: any[]) => {
        this.jobSubmittedCandidates = list || [];
        this.loadingJobSubmissions = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingJobSubmissions = false;
        console.error('Error loading job submissions:', err);
      }
    });
  }

  // Alias for compatibility
  openBatchModal(job?: any): void {
    this.openAddCandidatesPage(job);
  }

  closeAddCandidatesPage(): void {
    if (this.selectedJobForBatch) {
      this.activePage = 'job-submissions';
      if (this.selectedJobForBatch.reqId) {
        this.loadJobSubmissions(this.selectedJobForBatch.reqId);
      }
    } else {
      this.activePage = 'jobs';
    }
    this.batchCandidates = [];
    this.batchSubmissionFeedback = null;
  }

  closeBatchModal(): void {
    this.closeAddCandidatesPage();
  }

  createEmptyCandidateRow(): BatchCandidateRow {
    return {
      candidateName: '',
      mobile: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      fatherName: '',
      aadhaarNo: ''
    };
  }

  addBatchCandidateRow(): void {
    if (this.batchCandidates.length >= 25) {
      this.toastr.warning('Maximum 25 candidates per batch submission.', 'Limit Reached');
      return;
    }
    this.batchCandidates.push(this.createEmptyCandidateRow());
  }

  addMultipleBatchRows(count: number = 3): void {
    for (let i = 0; i < count; i++) {
      if (this.batchCandidates.length >= 25) break;
      this.batchCandidates.push(this.createEmptyCandidateRow());
    }
  }

  removeBatchCandidateRow(index: number): void {
    if (this.batchCandidates.length === 1) {
      this.toastr.warning('At least one candidate is required.', 'Cannot Remove');
      return;
    }
    this.batchCandidates.splice(index, 1);
  }

  onMobileInput(row: BatchCandidateRow): void {
    row.mobile = (row.mobile || '').replace(/\D/g, '').slice(0, 10);
  }

  onAadhaarInput(row: BatchCandidateRow): void {
    row.aadhaarNo = (row.aadhaarNo || '').replace(/\D/g, '').slice(0, 12);
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
          this.toastr.error(`Row [${row.candidateName || 'Candidate'}]: ${row.aadhaarMessage}`, 'Duplicate Aadhaar');
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

  onDossierAadhaarInput(): void {
    if (this.dossierForm.aadhaarNo) {
      this.dossierForm.aadhaarNo = this.dossierForm.aadhaarNo.replace(/\D/g, '').slice(0, 12);
    }
    if (!this.dossierForm.aadhaarNo || this.dossierForm.aadhaarNo.length < 12) {
      this.dossierAadhaarStatus = 'idle';
      this.dossierAadhaarMessage = '';
      return;
    }
    if (this.dossierForm.aadhaarNo.length === 12) {
      this.validateDossierAadhaar();
    }
  }

  validateDossierAadhaar(): void {
    const cleanAadhaar = (this.dossierForm.aadhaarNo || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) return;

    this.dossierAadhaarStatus = 'checking';
    const currentAppId = this.selectedCandidateForDossier?.appId;
    this.atsService.verifyAadhaarUniqueness({ aadhaarNo: cleanAadhaar, companyId: this.companyId, currentAppId }).subscribe({
      next: (res: any) => {
        const canProceed = res?.canProceed !== undefined 
          ? (res.canProceed === true || res.canProceed === 1) 
          : (res?.CanProceed === 1 || res?.CanProceed === true);
        const isDuplicate = res?.isDuplicate === true || res?.ExistsStatus === 1;
        const msg = res?.message || res?.Message || '';

        if (!canProceed || isDuplicate) {
          this.dossierAadhaarStatus = 'duplicate';
          this.dossierAadhaarMessage = msg || 'Aadhaar already registered in employee or candidate records.';
          this.toastr.error(this.dossierAadhaarMessage, 'Duplicate Aadhaar');
        } else {
          this.dossierAadhaarStatus = 'verified';
          this.dossierAadhaarMessage = '';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.dossierAadhaarStatus = 'verified';
        this.dossierAadhaarMessage = '';
        this.cdr.detectChanges();
      }
    });
  }

  submitCandidateBatch(): void {
    if (!this.selectedJobForBatch) {
      this.toastr.error('Please select an active Job MRF for submission.', 'Job Required');
      return;
    }

    // Validate rows with strict Pipeline page verification standard
    const validCandidates: BatchCandidateRow[] = [];
    for (let i = 0; i < this.batchCandidates.length; i++) {
      const c = this.batchCandidates[i];

      // 1. Candidate Full Name
      if (!c.candidateName.trim()) {
        this.toastr.warning(`Row #${i + 1}: Candidate Full Name is required.`, 'Validation');
        return;
      }

      // 2. Mobile Verification (10 Digits starting with 6-9)
      const cleanMobile = (c.mobile || '').replace(/\D/g, '');
      if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
        this.toastr.warning(`Row #${i + 1} (${c.candidateName}): Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.`, 'Mobile Number Required');
        return;
      }

      // 3. Aadhaar Verification (Exactly 12 Numeric Digits)
      const cleanAadhaar = (c.aadhaarNo || '').replace(/\D/g, '');
      if (!cleanAadhaar || cleanAadhaar.length !== 12) {
        this.toastr.warning(`Row #${i + 1} (${c.candidateName}): Please enter a valid 12-digit Aadhaar Card number.`, 'Aadhaar Required');
        return;
      }

      // 4. Batch Internal Duplicate Prevention
      if (validCandidates.some(x => x.mobile === cleanMobile)) {
        this.toastr.warning(`Row #${i + 1} (${c.candidateName}): Mobile number ${cleanMobile} is duplicated within this batch roster.`, 'Duplicate Mobile');
        return;
      }
      if (validCandidates.some(x => x.aadhaarNo === cleanAadhaar)) {
        this.toastr.warning(`Row #${i + 1} (${c.candidateName}): Aadhaar number ${cleanAadhaar} is duplicated within this batch roster.`, 'Duplicate Aadhaar');
        return;
      }

      // 5. Database Duplicate Check
      if (c.aadhaarStatus === 'duplicate') {
        this.toastr.error(`Row #${i + 1} (${c.candidateName}): ${c.aadhaarMessage || 'Duplicate Aadhaar blocked.'}`, 'Duplicate Aadhaar Blocked');
        return;
      }

      validCandidates.push({
        ...c,
        candidateName: c.candidateName.trim(),
        mobile: cleanMobile,
        email: c.email ? c.email.trim() : '',
        fatherName: c.fatherName ? c.fatherName.trim() : '',
        aadhaarNo: cleanAadhaar
      });
    }

    const payload = {
      reqId: this.selectedJobForBatch.reqId,
      vendorId: this.selectedVendorId,
      vendorName: this.selectedVendor?.vendorName || 'Staffing Partner',
      candidates: validCandidates,
      submittedBy: this.selectedVendor?.vendorName || 'Staffing Partner',
      companyId: this.companyId
    };

    this.submittingBatch = true;
    this.atsService.submitVendorCandidateBatch(payload).subscribe({
      next: (res: any) => {
        this.submittingBatch = false;
        this.batchSubmissionFeedback = res;

        if (res.succeeded > 0) {
          this.toastr.success(`${res.succeeded} candidate(s) successfully registered into ATS!`, 'Batch Submitted');
          this.refreshVendorData();
          if (this.selectedJobForBatch?.reqId) {
            this.loadJobSubmissions(this.selectedJobForBatch.reqId);
          }
          this.batchCandidates = [
            this.createEmptyCandidateRow(),
            this.createEmptyCandidateRow(),
            this.createEmptyCandidateRow()
          ];
        }
        if (res.failed > 0) {
          this.toastr.warning(`${res.failed} candidate(s) could not be registered (duplicates or validation failure).`, 'Partial Submission');
        }
      },
      error: (err) => {
        this.submittingBatch = false;
        this.toastr.error(err?.error?.message || 'Error occurred while processing batch submission.', 'Submission Error');
      }
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
    const currentReqId = this.selectedJobForBatch?.reqId || null;

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
    if (!this.selectedJobForBatch || !this.selectedJobForBatch.reqId) {
      this.toastr.error('No target Job Requisition selected.', 'Job Required');
      return;
    }

    const currentReqId = this.selectedJobForBatch.reqId;
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. Selected Candidate Dossier & Document Upload (Page 4)
  // ─────────────────────────────────────────────────────────────────────────────
  openDossierPage(candidate: any): void {
    this.openPassedInterviewPage(candidate);
  }

  // Alias for compatibility
  openDossierModal(candidate: any): void {
    this.openDossierPage(candidate);
  }

  closeDossierPage(): void {
    this.activePage = 'selected';
    this.selectedCandidateForDossier = null;
    this.candidateDocs = [];
  }

  closeDossierModal(): void {
    this.closeDossierPage();
  }

  loadCandidateDocuments(appId: number): void {
    this.loadingDocs = true;
    this.atsService.getCandidateDocuments(appId, this.companyId).subscribe({
      next: (res: any) => {
        const docsList = res?.documents || (Array.isArray(res) ? res : []);
        this.candidateDocs = docsList.map((d: any) => ({
          ...d,
          docId: d.docId || d.pk_docId,
          appId: d.appId || d.fk_appId || appId,
          isVerified: d.verificationStatus === 'Approved'
        }));
        this.loadingDocs = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingDocs = false;
        this.toastr.error('Failed to load candidate document requirements.', 'Documents');
      }
    });
  }

  saveDossierDetails(): void {
    if (!this.selectedCandidateForDossier) return;

    if (this.dossierAadhaarStatus === 'duplicate') {
      this.toastr.error(this.dossierAadhaarMessage || 'Cannot save: Duplicate Aadhaar card detected in records.', 'Duplicate Aadhaar');
      return;
    }

    const payload = {
      appId: this.selectedCandidateForDossier.appId,
      aadhaarNo: this.dossierForm.aadhaarNo.trim(),
      panNo: this.dossierForm.panNo.trim(),
      bankAccNo: this.dossierForm.bankAccNo.trim(),
      bankIfsc: this.dossierForm.bankIfsc.trim(),
      bankName: this.dossierForm.bankName.trim(),
      nomineeName: this.dossierForm.nomineeName.trim(),
      nomineeRelation: this.dossierForm.nomineeRelation,
      nomineeDOB: this.dossierForm.nomineeDOB || null,
      nomineeContact: this.dossierForm.nomineeContact.trim(),
      uanNo: this.dossierForm.uanNo.trim(),
      esicNo: this.dossierForm.esicNo.trim(),
      companyId: this.companyId
    };

    this.savingDossier = true;
    this.atsService.saveCandidateOnboardingDossier(payload).subscribe({
      next: (res: any) => {
        this.savingDossier = false;
        if (res && res.success === false) {
          this.toastr.error(res.message || 'Error saving candidate statutory details.', 'Save Restricted');
          return;
        }
        this.toastr.success('Candidate dossier details saved successfully.', 'Dossier Saved');
        // Update local object
        Object.assign(this.selectedCandidateForDossier, payload);
        this.refreshVendorData();
      },
      error: (err) => {
        this.savingDossier = false;
        this.toastr.error(err?.error?.message || 'Error saving candidate statutory details.', 'Save Error');
      }
    });
  }

  onFileSelected(event: any, docTypeCode: string): void {
    const file = event.target?.files?.[0];
    if (!file || !this.selectedCandidateForDossier) return;

    if (file.size > 10 * 1024 * 1024) {
      this.toastr.error('File size exceeds the 10MB limit.', 'File Too Large');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('appId', this.selectedCandidateForDossier.appId.toString());
    formData.append('docTypeCode', docTypeCode);
    formData.append('companyId', this.companyId);

    this.uploadingDocCode = docTypeCode;
    this.atsService.uploadCandidateDocument(formData).subscribe({
      next: (res: any) => {
        this.uploadingDocCode = null;
        this.toastr.success(`${file.name} uploaded successfully.`, 'Document Uploaded');
        this.loadCandidateDocuments(this.selectedCandidateForDossier.appId);
        this.refreshVendorData();
      },
      error: (err) => {
        this.uploadingDocCode = null;
        this.toastr.error(err?.error?.message || 'Failed to upload document.', 'Upload Error');
      }
    });
  }

  previewDocument(doc: any): void {
    if (!doc.fileName) {
      this.toastr.info('No document has been uploaded yet for this credential.', 'Pending Upload');
      return;
    }
    const rawUrl = this.atsService.getDocumentViewUrl(doc.pk_docId, doc.fk_appId, doc.docTypeCode);
    this.previewDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    this.previewDocTitle = `${doc.docTypeName} (${doc.fileName})`;
    this.showDocPreviewModal = true;
  }

  closeDocPreviewModal(): void {
    this.showDocPreviewModal = false;
    this.previewDocUrl = null;
    this.previewDocTitle = '';
  }

  get missingMandatoryDocsCount(): number {
    return this.candidateDocs.filter(d => d.isMandatory && !d.fileName).length;
  }

  get totalMandatoryDocsCount(): number {
    return this.candidateDocs.filter(d => d.isMandatory).length;
  }

  get uploadedMandatoryDocsCount(): number {
    return this.candidateDocs.filter(d => d.isMandatory && !!d.fileName).length;
  }

  get uploadedDocsCount(): number {
    return this.candidateDocs.filter(d => !!d.fileName).length;
  }

  submitToSiteHR(): void {
    if (!this.selectedCandidateForDossier) return;

    // Check mandatory documents
    const missingMandatory = this.missingMandatoryDocsCount;
    if (missingMandatory > 0) {
      this.toastr.error(
        `Cannot submit: ${missingMandatory} mandatory document(s) are still missing. Please upload all required documents first.`,
        'Mandatory Documents Required'
      );
      this.dossierActiveSection = 'docs';
      return;
    }

    // Check essential statutory details
    if (!this.dossierForm.aadhaarNo && !this.selectedCandidateForDossier.aadhaarNo) {
      this.toastr.warning('Please enter and save Aadhaar Number before submitting to HR.', 'Aadhaar Required');
      this.dossierActiveSection = 'info';
      return;
    }

    if (!this.dossierForm.bankAccNo && !this.selectedCandidateForDossier.bankAccNo) {
      this.toastr.warning('Please enter Bank Account Details before submitting to HR.', 'Bank Details Required');
      this.dossierActiveSection = 'info';
      return;
    }

    this.submittingToHR = true;
    const payload = {
      appId: this.selectedCandidateForDossier.appId,
      targetStage: 'Docs_Submitted',
      remarks: `All onboarding documents and statutory dossier uploaded and submitted by staffing partner [${this.selectedVendor?.vendorName}] for Site HR verification.`,
      movedBy: this.selectedVendor?.vendorName || 'Staffing Partner',
      companyId: this.companyId
    };

    this.atsService.moveCandidateStage(payload).subscribe({
      next: (res: any) => {
        this.submittingToHR = false;
        this.toastr.success(
          `Candidate ${this.selectedCandidateForDossier.candidateName} successfully forwarded to Site HR Document Verification Queue!`,
          'Submitted to Site HR'
        );
        this.closeDossierModal();
        this.refreshVendorData();
      },
      error: (err) => {
        this.submittingToHR = false;
        this.toastr.error(err?.error?.message || 'Failed to submit candidate to Site HR.', 'Submission Failed');
      }
    });
  }
}
