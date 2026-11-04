import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../../../shared/services/ats.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-job-requisition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-requisition-list.component.html',
  styleUrl: './job-requisition-list.component.scss'
})
export class JobRequisitionListComponent implements OnInit {
  jobList: any[] = [];
  filteredJobs: any[] = [];
  isLoading: boolean = true;

  // Search & Filter State
  searchQuery: string = '';
  activeStatusFilter: 'All' | 'Active' | 'Pending' | 'Draft' | 'Buffer' | 'Diversity' | 'Rejected' = 'All';
  selectedDepartment: string = 'All';
  selectedLocation: string = 'All';
  selectedCompany: string = 'All';

  // Available unique filter values
  uniqueDepartments: string[] = [];
  uniqueLocations: string[] = [];
  uniqueCompanies: string[] = [];

  // Slide-over Details Drawer
  selectedJobForDetail: any = null;
  showDetailDrawer: boolean = false;

  // KPIs
  totalCount: number = 0;
  activeCount: number = 0;
  pendingCount: number = 0;
  rejectedCount: number = 0;
  draftCount: number = 0;
  bufferUtilizedCount: number = 0;
  diversityCount: number = 0;
  assignedLocationIds: string[] = [];

  constructor(
    private atsService: AtsService,
    private router: Router,
    private toastr: ToastrService,
    private encryptionService: EncryptionService,
    private loaderService: NgxUiLoaderService
  ) {}

  get userId(): string {
    return sessionStorage.getItem('userId') || 
           localStorage.getItem('userId') || 
           sessionStorage.getItem('fk_userId') || 
           localStorage.getItem('fk_userId') || '';
  }

  get activeCompanyId(): string {
    return sessionStorage.getItem('companyId') || 
           sessionStorage.getItem('companyCode') || 
           localStorage.getItem('companyCode') || 
           sessionStorage.getItem('fk_CompanyCode') || 
           localStorage.getItem('fk_CompanyCode') || 
           localStorage.getItem('companyId') || 
           sessionStorage.getItem('fk_companyId') || 
           localStorage.getItem('fk_companyId') || '';
  }

  loadUserAccessRights(): void {
    if (this.userId) {
      this.atsService.getUserAccessRights(this.userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];
            this.calculateMetrics();
            this.applyFilters();
          }
        },
        error: () => {}
      });
    }
  }

  isLocationAllowed(job: any): boolean {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
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

  get authorizedJobs(): any[] {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return this.jobList;
    }
    return this.jobList.filter(j => this.isLocationAllowed(j));
  }

  ngOnInit(): void {
    if (this.activeCompanyId) {
      this.selectedCompany = this.activeCompanyId;
    }
    this.loadUserAccessRights();
    this.loadRequisitions();
  }

  onCompanyChange(): void {
    this.loadRequisitions(this.selectedCompany);
  }

  loadRequisitions(overrideCompany?: string): void {
    this.isLoading = true;
    this.loaderService.start();
    const compId = overrideCompany !== undefined 
      ? (overrideCompany === 'All' ? '' : overrideCompany)
      : (this.selectedCompany !== 'All' ? this.selectedCompany : this.activeCompanyId);

    this.atsService.getJobRequisitions(compId).subscribe({
      next: (jobs: any[]) => {
        this.isLoading = false;
        this.loaderService.stop();
        this.jobList = Array.isArray(jobs) ? jobs : [];
        this.populateDropdowns();
        this.applyFilters();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loaderService.stop();
        this.toastr.error('Error fetching job requisitions: ' + (err?.error?.message || err?.message || 'Server error'), 'Fetch Error');
      }
    });
  }

  populateDropdowns(): void {
    const list = this.authorizedJobs;
    const depts = new Set<string>();
    const locs = new Set<string>();
    const comps = new Set<string>();
    list.forEach(j => {
      if (j.department) depts.add(j.department);
      if (j.location) locs.add(j.location);
      const c = j.companyId || j.fk_companyId;
      if (c) comps.add(c);
    });
    if (this.activeCompanyId) comps.add(this.activeCompanyId);
    this.uniqueDepartments = Array.from(depts).sort();
    this.uniqueLocations = Array.from(locs).sort();
    this.uniqueCompanies = Array.from(comps).sort();
  }

  getFilterScopedJobs(): any[] {
    let list = [...this.authorizedJobs];

    // Department Filter
    if (this.selectedDepartment !== 'All') {
      list = list.filter(j => j.department === this.selectedDepartment);
    }

    // Location Filter
    if (this.selectedLocation !== 'All') {
      list = list.filter(j => j.location === this.selectedLocation);
    }

    // Company Filter
    if (this.selectedCompany !== 'All') {
      const target = this.selectedCompany.trim().toUpperCase();
      const cleanTarget = target.replace(/^GU-/i, '');
      list = list.filter(j => {
        const jComp = String(j.companyId || j.fk_companyId || '').trim().toUpperCase();
        const cleanJComp = jComp.replace(/^GU-/i, '');
        return jComp === target || (cleanTarget && cleanJComp === cleanTarget);
      });
    }

    // Search Query (MRF code, Job Title, Designation, Department, Location)
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(j => 
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q)) ||
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.designation && j.designation.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.serviceType && j.serviceType.toLowerCase().includes(q)) ||
        (j.workflowStatus && j.workflowStatus.toLowerCase().includes(q)) ||
        (j.rejectionRemarks && j.rejectionRemarks.toLowerCase().includes(q))
      );
    }

    return list;
  }

  calculateMetrics(): void {
    const list = this.getFilterScopedJobs();
    this.totalCount = list.length;
    this.activeCount = list.filter(j => j.status === 'Active' && !this.isRejected(j)).length;
    this.pendingCount = list.filter(j => (j.status?.includes('Pending') || j.workflowStatus?.includes('Pending')) && !this.isRejected(j)).length;
    this.rejectedCount = list.filter(j => this.isRejected(j)).length;
    this.draftCount = list.filter(j => (j.status === 'Draft' || j.isDraft) && !this.isRejected(j)).length;
    this.bufferUtilizedCount = list.filter(j => j.isBufferUtilized).length;
    this.diversityCount = list.filter(j => j.isDiversityHiring).length;
  }

  setStatusFilter(status: 'All' | 'Active' | 'Pending' | 'Draft' | 'Buffer' | 'Diversity' | 'Rejected'): void {
    this.activeStatusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    this.calculateMetrics();
    let list = this.getFilterScopedJobs();

    // Status / Mode Filter
    if (this.activeStatusFilter === 'Active') {
      list = list.filter(j => j.status === 'Active' && !this.isRejected(j));
    } else if (this.activeStatusFilter === 'Pending') {
      list = list.filter(j => (j.status?.includes('Pending') || j.workflowStatus?.includes('Pending')) && !this.isRejected(j));
    } else if (this.activeStatusFilter === 'Rejected') {
      list = list.filter(j => this.isRejected(j));
    } else if (this.activeStatusFilter === 'Draft') {
      list = list.filter(j => (j.status === 'Draft' || j.isDraft) && !this.isRejected(j));
    } else if (this.activeStatusFilter === 'Buffer') {
      list = list.filter(j => j.isBufferUtilized);
    } else if (this.activeStatusFilter === 'Diversity') {
      list = list.filter(j => j.isDiversityHiring);
    }

    this.filteredJobs = list;
  }

  openJobDetail(job: any): void {
    this.selectedJobForDetail = job;
    this.showDetailDrawer = true;
  }

  closeJobDetail(): void {
    this.showDetailDrawer = false;
    this.selectedJobForDetail = null;
  }

  isRejected(job: any): boolean {
    if (!job) return false;
    return job.isDisapproved == 1 || 
           job.isDisapproved === true || 
           job.workflowStatus === 'Rejected' || 
           job.status === 'Rejected' || 
           job.status === 'R' ||
           job.requisitionStatus === 'Rejected' ||
           !!job.rejectedByLevel;
  }

  canEdit(job: any): boolean {
    if (!job) return false;
    // Rule: When rejected from ANY stage (L1, L2, L3), it MUST come back for editing
    if (this.isRejected(job)) {
      return true;
    }

    // Rule: Drafts are always editable
    const st = (job.status || '').trim();
    if (st === 'Draft' || job.isDraft) {
      return true;
    }

    // Rule: Pre-L1 stages (Submitted, L1_Pending) are editable
    const wf = (job.workflowStatus || '').trim();
    if (wf === 'Draft' || wf === 'Submitted' || wf === 'L1_Pending') {
      return true;
    }

    // Rule: AFTER L1 (L2_Pending, L3_Pending, Approved, Active, etc.) -> IT SHOULD NOT BE EDITED!
    return false;
  }

  navigateToEdit(job: any): void {
    if (!job) return;
    if (!this.canEdit(job)) {
      this.toastr.warning('This requisition has already passed Level 1 approval and is locked for editing.', 'Editing Locked');
      return;
    }
    const id = job.reqId || job.jobId || job.pk_reqid;
    if (id) {
      this.closeJobDetail();
      const encryptedId = this.encryptionService.encryptText(String(id));
      this.router.navigate(['/dash/recruitment/recruitmentdashboard/edit-job', encryptedId]);
    } else {
      this.toastr.warning('Invalid Requisition identifier.', 'Navigation Warning');
    }
  }

  copyMrfCode(code: string, event: MouseEvent): void {
    event.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      this.toastr.info(`MRF Code copied: ${code}`, 'Copied');
    }
  }
}
