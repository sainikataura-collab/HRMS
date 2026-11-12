import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AtsService } from '../../../../shared/services/ats.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-job-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './job-management.component.html',
  styleUrl: './job-management.component.scss'
})
export class JobManagementComponent implements OnInit {
  jobList: any[] = [];
  filteredJobs: any[] = [];
  searchQuery: string = '';
  activeTab: 'Approvals' | 'Active' | 'Drafts' | 'Closed' | 'All' | 'Rejected' = 'All';
  selectedLevelFilter: string = 'ALL';

  // User Approval Context
  userId: string = '';
  userName: string = '';
  approvalLevel: number = 0;
  levelLabel: string = '';
  roleLabel: string = '';
  isAdmin: boolean = false;
  hasApprovalRights: boolean = false;

  // CJ DARCL Level & Functional Access Rights
  l1_Access: boolean = false;
  l2_Access: boolean = false;
  l3_Access: boolean = false;
  canRaiseRequisition: boolean = true;
  canEditManpower: boolean = false;
  assignedLocationIds: string[] = [];
  rightsLoaded: boolean = false;

  // Counts
  totalJobsCount: number = 0;
  pendingApprovalsCount: number = 0;
  activeJobsCount: number = 0;
  rejectedCount: number = 0;
  draftsCount: number = 0;
  closedCount: number = 0;

  // Granular Level Counts
  l1Count: number = 0;
  l2Count: number = 0;
  l3Count: number = 0;
  submittedCount: number = 0;

  // Dynamic KPI summary
  totalOpenings: number = 0;
  totalApplicants: number = 0;

  // OATS View Mode & Extended Filters
  viewMode: 'table' | 'grid' = 'table';
  timelineFilter: string = 'all';
  jobStatusFilter: string = 'all';
  selectedLocationFilter: string = 'all';
  uniqueLocations: string[] = [];
  selectedJobCodes: Set<string | number> = new Set();

  // Pagination (Matching OATS tablePagination: 10, 20, 30)
  currentPage: number = 1;
  pageSize: number = 10;

  // Approval Modal & Action state
  showApprovalModal: boolean = false;
  selectedJobForApproval: any = null;
  approvalHistory: any[] = [];
  approvalState: any = null;
  approvalRemarks: string = '';
  isSubmittingApproval: boolean = false;
  isLoadingHistory: boolean = false;

  // Job Requisition Full Details Drawer (Mirroring MRF List)
  showJobDetailDrawer: boolean = false;
  selectedJobForDetail: any = null;

  // ── Step 5: Sourcing Channel & Vendor Allocation (TA or Supply Vendors) ──
  companyId: string = '';
  showVendorAllocationModal: boolean = false;
  selectedJobForVendor: any = null;
  vendorAllocationList: any[] = [];
  filteredVendorList: any[] = [];
  bulkChannelType: 'Supply Vendors' | 'TA' = 'Supply Vendors';
  isBulkSaving: boolean = false;
  vendorSearchQuery: string = '';
  isLoadingVendors: boolean = false;

  // ── Step 5b: Post-Allocation Vendor Intimation Email Modal ──
  showVendorEmailModal: boolean = false;
  isSendingVendorEmails: boolean = false;
  vendorEmailSubject: string = '';
  vendorEmailCustomRemarks: string = '';
  lockedVendorRecipients: { vendorId: string; vendorCode: string; vendorName: string; email: string }[] = [];
  vendorsWithoutEmailCount: number = 0;
  additionalEmailRecipients: string[] = [];
  newAdditionalEmailInput: string = '';

  constructor(
    private atsService: AtsService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('userId') || sessionStorage.getItem('UserId') || '';
    this.userName = sessionStorage.getItem('username') || sessionStorage.getItem('name') || 'User';
    this.companyId = sessionStorage.getItem('companyId') || 
                     localStorage.getItem('companyId') || 
                     sessionStorage.getItem('fk_companyId') || 
                     localStorage.getItem('fk_companyId') || 
                     '';

    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'Approvals' || tab === 'Active' || tab === 'Drafts' || tab === 'Closed' || tab === 'All' || tab === 'Rejected') {
        this.activeTab = tab as any;
      }
      const level = params['level'];
      if (level) {
        this.selectedLevelFilter = level.toUpperCase();
      }
      if (this.jobList && this.jobList.length > 0) {
        this.applyFilter();
      }
    });

    this.checkApprovalAuthority();
    this.viewMode = 'table';
    localStorage.removeItem('oats_job_view_mode');
    this.loadJobs();
  }

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = 'table';
  }

  onTimelineChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  getInitials(title: string): string {
    if (!title) return 'JB';
    const words = title.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  getPriority(job: any): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (job.priority) return job.priority;
    if (job.urgency === 'Immediate' || job.isUrgent) return 'Critical';
    if ((job.openPositions || job.openingsCount || 1) >= 5) return 'High';
    return 'Medium';
  }

  getPriorityColor(job: any): string {
    const p = this.getPriority(job);
    switch (p) {
      case 'Critical': return '#ef4444';
      case 'High': return '#dd7c06';
      case 'Medium': return '#16a34a';
      case 'Low': return '#eab308';
      default: return '#16a34a';
    }
  }

  getSubmissionsCount(job: any): number {
    return job.submissionCount || job.applicantsCount || 0;
  }

  getPipelineCount(job: any): number {
    return job.pipelineCount || (job.applicantsCount ? Math.max(1, job.applicantsCount) : 0);
  }

  toggleSelectAllJobs(event: any): void {
    const isChecked = event?.target?.checked ?? false;
    if (isChecked) {
      this.paginatedJobs.forEach(j => this.selectedJobCodes.add(j.reqId || j.jobId));
    } else {
      this.selectedJobCodes.clear();
    }
  }

  toggleSelectJob(job: any): void {
    const id = job.reqId || job.jobId;
    if (this.selectedJobCodes.has(id)) {
      this.selectedJobCodes.delete(id);
    } else {
      this.selectedJobCodes.add(id);
    }
  }

  isJobSelected(job: any): boolean {
    return this.selectedJobCodes.has(job.reqId || job.jobId);
  }

  isAllJobsSelected(): boolean {
    if (!this.paginatedJobs || this.paginatedJobs.length === 0) return false;
    return this.paginatedJobs.every(j => this.selectedJobCodes.has(j.reqId || j.jobId));
  }

  isIndeterminateSelected(): boolean {
    const count = this.paginatedJobs.filter(j => this.selectedJobCodes.has(j.reqId || j.jobId)).length;
    return count > 0 && count < this.paginatedJobs.length;
  }

  changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
  }

  checkApprovalAuthority(): void {
    const role = (sessionStorage.getItem('role') || localStorage.getItem('role') || '').toUpperCase();
    this.isAdmin = role.includes('ADMIN') || role === 'S' || !role;
    this.hasApprovalRights = this.isAdmin;

    this.atsService.getMyApprovalLevel(this.userId).subscribe({
      next: (res) => {
        this.approvalLevel = res.approvalLevel || 3;
        this.levelLabel = res.levelLabel || (this.isAdmin ? 'Administrator' : 'Approver');
        this.roleLabel = res.roleLabel || 'ADMINISTRATOR';
        if (res.isAdmin !== undefined) this.isAdmin = res.isAdmin;
        this.hasApprovalRights = true;

        if (this.pendingApprovalsCount > 0) {
          this.applyFilter();
        }
      },
      error: () => {
        this.isAdmin = true;
        this.hasApprovalRights = true;
      }
    });

    if (this.userId) {
      this.atsService.getUserAccessRights(this.userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.l1_Access = !!(res.data.l1_Access || res.data.L1_Access);
            this.l2_Access = !!(res.data.l2_Access || res.data.L2_Access);
            this.l3_Access = !!(res.data.l3_Access || res.data.L3_Access);
            this.canRaiseRequisition = !!(res.data.canRaiseRequisition || res.data.CanRaiseRequisition || this.isAdmin);
            this.canEditManpower = !!(res.data.canEditManpower || res.data.CanEditManpower || this.isAdmin);
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];

            if (this.l1_Access || this.l2_Access || this.l3_Access) {
              this.hasApprovalRights = true;
            }
            this.rightsLoaded = true;
            this.calculateMetrics();
            this.populateUniqueLocations();
            this.applyFilter();
          }
        },
        error: () => {
          this.rightsLoaded = true;
        }
      });
    }
  }

  isLocationAllowed(job: any): boolean {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return true; // No location restrictions assigned -> can see all
    }
    const jobLocId = String(job.fk_locid || job.locId || job.locationId || '').trim();
    if (!jobLocId) return true;

    const cleanJobLoc = jobLocId.replace(/^GU-/i, '');

    return this.assignedLocationIds.some(assignedLoc => {
      const assignedStr = String(assignedLoc || '').trim();
      const cleanAssigned = assignedStr.replace(/^GU-/i, '');
      return assignedStr.toLowerCase() === jobLocId.toLowerCase() || 
             (cleanJobLoc && cleanAssigned && cleanJobLoc === cleanAssigned);
    });
  }

  get authorizedJobs(): any[] {
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return this.jobList;
    }
    return this.jobList.filter(j => this.isLocationAllowed(j));
  }

  hasGranularRightsConfigured(): boolean {
    return this.rightsLoaded && (this.l1_Access || this.l2_Access || this.l3_Access);
  }

  hasL1Right(): boolean {
    if (this.rightsLoaded) {
      return this.l1_Access;
    }
    return this.isAdmin || this.approvalLevel >= 1;
  }

  hasL2Right(): boolean {
    if (this.rightsLoaded) {
      return this.l2_Access;
    }
    return this.isAdmin || this.approvalLevel >= 2;
  }

  hasL3Right(): boolean {
    if (this.rightsLoaded) {
      return this.l3_Access;
    }
    return this.isAdmin || this.approvalLevel >= 3;
  }

  getGrantedRightsSummary(): string {
    const list: string[] = [];
    if (this.l1_Access) list.push('L1');
    if (this.l2_Access) list.push('L2');
    if (this.l3_Access) list.push('L3');
    if (list.length === 0) return this.levelLabel || (this.isAdmin ? 'Admin' : 'Approver');
    return `${list.join(', ')} Approver`;
  }

  loadJobs(): void {
    this.loaderService.start();
    this.atsService.getJobRequisitions(this.companyId).subscribe({
      next: (data) => {
        this.loaderService.stop();
        this.jobList = data || [];
        this.calculateMetrics();
        this.populateUniqueLocations();
        this.applyFilter();
      },
      error: (err) => {
        this.loaderService.stop();
        console.warn('Error loading requisitions:', err);
      }
    });
  }

  populateUniqueLocations(): void {
    const locSet = new Set<string>();
    this.authorizedJobs.forEach(j => {
      if (j.location && typeof j.location === 'string' && j.location.trim().length > 0) {
        locSet.add(j.location.trim());
      }
    });
    this.uniqueLocations = Array.from(locSet).sort();
  }

  onLocationFilterChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  getFilterScopedBaseJobs(): any[] {
    let list = [...this.authorizedJobs];

    // 1. Location filter
    if (this.selectedLocationFilter && this.selectedLocationFilter !== 'all') {
      const locTarget = this.selectedLocationFilter.toLowerCase().trim();
      list = list.filter(j => (j.location || '').toLowerCase().trim() === locTarget);
    }

    // 2. Timeline filter
    if (this.timelineFilter && this.timelineFilter !== 'all') {
      const now = new Date();
      list = list.filter(j => {
        const rawDate = j.createdAt || j.createdDate || j.creationDate || j.postedDate;
        if (!rawDate) return true;
        const cDate = new Date(rawDate);
        if (isNaN(cDate.getTime())) return true;
        const diffDays = (now.getTime() - cDate.getTime()) / (1000 * 3600 * 24);
        if (this.timelineFilter === 'today') return diffDays <= 1;
        if (this.timelineFilter === 'last_7_days') return diffDays <= 7;
        if (this.timelineFilter === 'last_30_days') return diffDays <= 30;
        if (this.timelineFilter === 'this_year') return cDate.getFullYear() === now.getFullYear();
        return true;
      });
    }

    // 3. Search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(j =>
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q)) ||
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q)) ||
        (j.workflowStatus && j.workflowStatus.toLowerCase().includes(q))
      );
    }

    return list;
  }

  calculateMetrics(): void {
    const baseList = this.getFilterScopedBaseJobs();
    this.totalJobsCount = baseList.length;

    this.l1Count = baseList.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L1_Pending').length;
    this.l2Count = baseList.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L2_Pending').length;
    this.l3Count = baseList.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L3_Pending').length;
    this.submittedCount = baseList.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'Submitted').length;

    this.rejectedCount = baseList.filter(j => this.isJobRejected(j)).length;

    this.pendingApprovalsCount = baseList.filter(j => 
      !this.isJobRejected(j) && (
        j.workflowStatus === 'L1_Pending' || 
        j.workflowStatus === 'L2_Pending' || 
        j.workflowStatus === 'L3_Pending' ||
        j.workflowStatus === 'Submitted' ||
        (j.workflowStatus && !this.isJobActive(j) && (j.status || '').toLowerCase() !== 'closed' && (j.workflowStatus || '').toLowerCase() !== 'rejected')
      )
    ).length;

    this.activeJobsCount = baseList.filter(j => this.isJobActive(j)).length;

    this.draftsCount = baseList.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'draft' || (j.workflowStatus || '').toLowerCase() === 'draft')).length;
    this.closedCount = baseList.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'closed' || (j.workflowStatus || '').toLowerCase() === 'closed')).length;

    this.totalOpenings = baseList
      .filter(j => this.isJobActive(j))
      .reduce((sum, j) => sum + (j.openPositions || j.openingsCount || 1), 0);
    this.totalApplicants = baseList.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
  }

  setTab(tab: 'Approvals' | 'Active' | 'Drafts' | 'Closed' | 'All' | 'Rejected'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.selectedLevelFilter = 'ALL';
    this.jobStatusFilter = 'all';
    this.applyFilter();
  }

  setLevelFilter(level: string): void {
    this.selectedLevelFilter = level;
    this.currentPage = 1;
    if (level === 'ACTIVE') {
      this.activeTab = 'Active';
    } else if (level === 'L1' || level === 'L2' || level === 'L3' || level === 'SUBMITTED') {
      this.activeTab = 'Approvals';
    } else if (level === 'REJECTED') {
      this.activeTab = 'Rejected';
    } else if (level === 'ALL') {
      this.activeTab = 'All';
    }
    this.jobStatusFilter = 'all';
    this.applyFilter();
  }

  applyFilter(): void {
    // 0. Recalculate top dashboard counts based on the active filters section (location, timeline, search)
    this.calculateMetrics();

    let list = this.getFilterScopedBaseJobs();

    // 1. Tab / Primary Status filter
    if (this.activeTab === 'Approvals') {
      list = list.filter(j => 
        !this.isJobRejected(j) && (
          j.workflowStatus === 'L1_Pending' || 
          j.workflowStatus === 'L2_Pending' || 
          j.workflowStatus === 'L3_Pending' ||
          j.workflowStatus === 'Submitted' ||
          (j.workflowStatus && !this.isJobActive(j) && (j.status || '').toLowerCase() !== 'closed' && (j.workflowStatus || '').toLowerCase() !== 'rejected')
        )
      );
    } else if (this.activeTab === 'Active') {
      list = list.filter(j => this.isJobActive(j));
    } else if (this.activeTab === 'Drafts') {
      list = list.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'draft' || (j.workflowStatus || '').toLowerCase() === 'draft'));
    } else if (this.activeTab === 'Closed') {
      list = list.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'closed' || (j.workflowStatus || '').toLowerCase() === 'closed'));
    } else if (this.activeTab === 'Rejected') {
      list = list.filter(j => this.isJobRejected(j));
    }

    // 2. Specific Level / Stage sub-filter (only applies within selected tab context)
    if (this.selectedLevelFilter !== 'ALL') {
      if (this.selectedLevelFilter === 'L1') {
        list = list.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L1_Pending');
      } else if (this.selectedLevelFilter === 'L2') {
        list = list.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L2_Pending');
      } else if (this.selectedLevelFilter === 'L3') {
        list = list.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'L3_Pending');
      } else if (this.selectedLevelFilter === 'SUBMITTED') {
        list = list.filter(j => !this.isJobRejected(j) && j.workflowStatus === 'Submitted');
      } else if (this.selectedLevelFilter === 'ACTIVE') {
        list = list.filter(j => this.isJobActive(j));
      } else if (this.selectedLevelFilter === 'REJECTED') {
        list = list.filter(j => this.isJobRejected(j));
      }
    }

    // 3. OATS Status Filter Dropdown
    if (this.jobStatusFilter !== 'all') {
      if (this.jobStatusFilter === 'Active') {
        list = list.filter(j => this.isJobActive(j));
      } else if (this.jobStatusFilter === 'Pending') {
        list = list.filter(j => !this.isJobActive(j) && !this.isJobRejected(j) && (j.status || '').toLowerCase() !== 'closed');
      } else if (this.jobStatusFilter === 'Draft') {
        list = list.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'draft' || (j.workflowStatus || '').toLowerCase() === 'draft'));
      } else if (this.jobStatusFilter === 'Closed') {
        list = list.filter(j => !this.isJobRejected(j) && ((j.status || '').toLowerCase() === 'closed' || (j.workflowStatus || '').toLowerCase() === 'closed'));
      } else if (this.jobStatusFilter === 'Rejected') {
        list = list.filter(j => this.isJobRejected(j));
      }
    }

    this.filteredJobs = list;
  }

  get paginatedJobs(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredJobs.length / this.pageSize) || 1;
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewCandidates(job: any): void {
    if (job.workflowStatus && job.workflowStatus !== 'Active') {
      this.toastr.info('This requisition is still undergoing approval. Candidate sourcing opens once fully approved.', 'Pending Approval');
      return;
    }
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/pipeline'], {
      queryParams: { jobId: job.jobId || job.reqId }
    });
  }

  editJob(job: any): void {
    const id = job.jobId || job.reqId;
    if (id) {
      this.router.navigate(['/dash/recruitment/recruitmentdashboard/edit-job', id]);
    } else {
      this.toastr.warning('Invalid Job Requisition ID', 'Navigation Warning');
    }
  }

  closeJob(job: any): void {
    job.status = 'Closed';
    this.applyFilter();
    this.toastr.warning(`Requisition ${job.jobTitle} marked as Closed.`, 'Status Updated');
  }

  isJobActive(job: any): boolean {
    if (!job) return false;
    const status = (job.workflowStatus || job.status || '').toLowerCase().trim();
    if (status === 'draft' || status.includes('pending') || status.includes('submitted') || status.includes('reject') || status.includes('hold')) {
      return false;
    }
    return status === 'active' || status === 'approved' || status === 'sanctioned' || status === 'open';
  }

  isJobRejected(job: any): boolean {
    if (!job) return false;
    const ws = (job.workflowStatus || '').toLowerCase();
    const st = (job.status || '').toLowerCase();
    const rs = (job.requisitionStatus || '').toLowerCase();

    // Active pending workflow tiers are NOT rejected
    if (ws === 'l1_pending' || ws === 'l2_pending' || ws === 'l3_pending' || ws === 'submitted' || ws === 'active' || ws === 'approved' || st === 'active' || st === 'p') {
      return false;
    }

    return job.isDisapproved == 1 ||
           job.isDisapproved === true ||
           ws === 'rejected' ||
           st === 'rejected' ||
           st === 'r' ||
           rs === 'rejected' ||
           (!!job.rejectedByLevel && ws !== 'l1_pending' && ws !== 'l2_pending' && ws !== 'l3_pending') ||
           (!!job.rejectedByName && ws !== 'l1_pending' && ws !== 'l2_pending' && ws !== 'l3_pending');
  }

  hasRejectionHistory(job: any): boolean {
    if (!job) return false;
    return !!job.resubmittedDate || !!job.resubmittedBy || 
           (Array.isArray(this.approvalHistory) && this.approvalHistory.some((h: any) => (h.action || '').toLowerCase().includes('reject')));
  }

  getHistoryActionBadgeClass(action: string): string {
    const act = (action || '').toLowerCase();
    if (act.includes('approve')) return 'bg-success-subtle text-success border border-success-subtle';
    if (act.includes('reject')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (act.includes('resubmit')) return 'bg-warning-subtle text-warning border border-warning-subtle';
    return 'bg-primary-subtle text-primary border border-primary-subtle';
  }

  getHistoryActionIcon(action: string): string {
    const act = (action || '').toLowerCase();
    if (act.includes('approve')) return 'bi-check-circle-fill text-success';
    if (act.includes('reject')) return 'bi-x-circle-fill text-danger';
    if (act.includes('resubmit')) return 'bi-arrow-repeat text-warning';
    return 'bi-info-circle-fill text-primary';
  }

  isJobApproved(job: any): boolean {
    return this.isJobActive(job);
  }

  // ─── Approval Workflow Modal & Actions ─────────────────────────────────────

  canUserAct(job: any): boolean {
    if (!job) return false;
    if (!this.isLocationAllowed(job)) return false;
    const status = job.workflowStatus || job.status;
    if (status === 'Active' || status === 'Closed' || status === 'Rejected' || job.isDisapproved == 1) return false;

    // Granular rights strictly override generic Admin access
    if (this.hasGranularRightsConfigured()) {
      if (status === 'L1_Pending' || status === 'Submitted') return this.l1_Access;
      if (status === 'L2_Pending') return this.l2_Access;
      if (status === 'L3_Pending') return this.l3_Access;
      return false;
    }

    if (this.isAdmin) return true;
    if (status === 'L1_Pending') return this.approvalLevel >= 1;
    if (status === 'L2_Pending') return this.approvalLevel >= 2;
    if (status === 'L3_Pending') return this.approvalLevel >= 3;
    return true;
  }

  openApprovalModal(job: any): void {
    this.selectedJobForApproval = job;
    this.approvalRemarks = '';
    this.showApprovalModal = true;
    this.isLoadingHistory = true;

    const reqId = job.reqId || job.jobId;
    this.atsService.getApprovalHistory(reqId).subscribe({
      next: (res) => {
        this.approvalHistory = res.history || [];
        this.approvalState = res.currentState || job;
        this.isLoadingHistory = false;
      },
      error: () => {
        this.isLoadingHistory = false;
      }
    });
  }

  closeApprovalModal(): void {
    this.showApprovalModal = false;
    this.selectedJobForApproval = null;
    this.approvalHistory = [];
    this.approvalRemarks = '';
  }

  // ─── Job Requisition Full Details Drawer (Mirroring MRF List) ─────────────
  openJobDetail(job: any): void {
    if (!job) return;
    this.selectedJobForDetail = job;
    this.showJobDetailDrawer = true;
  }

  closeJobDetail(): void {
    this.showJobDetailDrawer = false;
    this.selectedJobForDetail = null;
  }

  openApprovalFromDetail(): void {
    if (!this.selectedJobForDetail) return;
    const job = this.selectedJobForDetail;
    this.closeJobDetail();
    this.openApprovalModal(job);
  }

  submitApproval(isApprove: boolean): void {
    if (!this.selectedJobForApproval) return;
    if (!isApprove && !this.approvalRemarks.trim()) {
      this.toastr.warning('Please enter a rejection reason in Remarks before proceeding.', 'Remarks Required');
      return;
    }

    this.isSubmittingApproval = true;
    const reqId = this.selectedJobForApproval.reqId || this.selectedJobForApproval.jobId;

    const currentStatus = this.selectedJobForApproval.workflowStatus;
    let targetLevel = 1;
    if (currentStatus === 'L1_Pending' || currentStatus === 'Submitted') targetLevel = 1;
    else if (currentStatus === 'L2_Pending') targetLevel = 2;
    else if (currentStatus === 'L3_Pending') targetLevel = 3;

    // Strict validation against granted level
    if (targetLevel === 1 && !this.hasL1Right()) {
      this.toastr.error('You do not have Level 1 (Operations) approval rights.', 'Access Denied');
      this.isSubmittingApproval = false;
      return;
    }
    if (targetLevel === 2 && !this.hasL2Right()) {
      this.toastr.error('You do not have Level 2 (Corporate HR) approval rights.', 'Access Denied');
      this.isSubmittingApproval = false;
      return;
    }
    if (targetLevel === 3 && !this.hasL3Right()) {
      this.toastr.error('You do not have Level 3 (HOD) approval rights.', 'Access Denied');
      this.isSubmittingApproval = false;
      return;
    }

    const payload = {
      reqId: reqId,
      approvalLevel: targetLevel,
      approverId: this.userId,
      approverName: this.userName,
      approverRole: this.getGrantedRightsSummary() || (this.isAdmin ? 'ADMINISTRATOR' : this.roleLabel || `L${targetLevel} Approver`),
      remarks: this.approvalRemarks.trim() || (isApprove ? 'Approved as per operational demand.' : 'Rejected.')
    };

    const action$ = isApprove 
      ? this.atsService.approveRequisition(payload)
      : this.atsService.rejectRequisition(payload);

    this.loaderService.start();
    action$.subscribe({
      next: (res) => {
        this.loaderService.stop();
        this.isSubmittingApproval = false;
        const approvedJob = this.selectedJobForApproval;
        this.closeApprovalModal();
        if (isApprove) {
          this.toastr.success(res.message || 'Requisition approved successfully!', 'Workflow Approved');
          if (res.status === 'Active' || res.overallStatus === 'Active' || targetLevel === 3) {
            this.openVendorAllocationModal(approvedJob);
          }
        } else {
          this.toastr.error(res.message || 'Requisition rejected.', 'Workflow Rejected');
          this.activeTab = 'Rejected';
          this.selectedLevelFilter = 'REJECTED';
        }
        this.loadJobs();
      },
      error: (err) => {
        this.loaderService.stop();
        this.isSubmittingApproval = false;
        this.toastr.error(err.error?.message || 'Error processing approval action', 'Action Failed');
      }
    });
  }

  getStepClass(step: number): 'passed' | 'current' | 'future' | 'rejected' {
    if (!this.selectedJobForApproval) return 'future';
    const status = this.selectedJobForApproval.workflowStatus || this.selectedJobForApproval.status;

    if (step === 1) return 'passed'; // Step 1 is always completed upon submission

    if (step === 2) {
      if (this.approvalState?.L1Action === 'Approved') return 'passed';
      if (this.approvalState?.L1Action === 'Rejected') return 'rejected';
      if (status === 'L1_Pending') return 'current';
      if (status === 'L2_Pending' || status === 'L3_Pending' || status === 'Active') return 'passed';
      return 'future';
    }

    if (step === 3) {
      if (this.approvalState?.L2Action === 'Approved') return 'passed';
      if (this.approvalState?.L2Action === 'Rejected') return 'rejected';
      if (status === 'L2_Pending') return 'current';
      if (status === 'L3_Pending' || status === 'Active') return 'passed';
      return 'future';
    }

    if (step === 4) {
      if (this.approvalState?.L3Action === 'Approved') return 'passed';
      if (this.approvalState?.L3Action === 'Rejected') return 'rejected';
      if (status === 'L3_Pending') return 'current';
      if (status === 'Active') return 'passed';
      return 'future';
    }

    if (step === 5) {
      if (status === 'Active') return 'passed';
      return 'future';
    }

    return 'future';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'L1_Pending': return 'l1-pending';
      case 'L2_Pending': return 'l2-pending';
      case 'L3_Pending': return 'l3-pending';
      case 'Active': return 'active-status';
      case 'Submitted':
      case 'Rejected': return 'rejected-status';
      case 'Draft': return 'draft-status';
      default: return 'draft-status';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'L1_Pending': return 'L1 Pending (Operations)';
      case 'L2_Pending': return 'L2 Pending (Corp HR)';
      case 'L3_Pending': return 'L3 Pending (HOD)';
      case 'Active': return 'Active / Hiring Open';
      case 'Submitted': return 'Submitted / Resubmit';
      case 'Rejected': return 'Rejected';
      case 'Draft': return 'Draft';
      default: return status || 'Pending';
    }
  }

  getLevelTitle(status: string): string {
    switch (status) {
      case 'L1_Pending': return 'Level 1: Operations Pending';
      case 'L2_Pending': return 'Level 2: Corporate HR Pending';
      case 'L3_Pending': return 'Level 3: HOD Final Signoff';
      case 'Submitted': return 'Site HR: Submitted';
      case 'Active': return 'Sanctioned & Approved';
      case 'Draft': return 'Draft Requisition';
      case 'Rejected': return 'Rejected / Returned';
      default: return status || 'Pending Review';
    }
  }

  getLevelBadgeClass(status: string): string {
    switch (status) {
      case 'L1_Pending': return 'badge-l1-amber';
      case 'L2_Pending': return 'badge-l2-sky';
      case 'L3_Pending': return 'badge-l3-indigo';
      case 'Submitted': return 'badge-submitted-rose';
      case 'Active': return 'badge-active-green';
      case 'Rejected': return 'badge-rejected-red';
      default: return 'badge-default-slate';
    }
  }

  getLevelIcon(status: string): string {
    switch (status) {
      case 'L1_Pending': return 'bi-gear-wide-connected';
      case 'L2_Pending': return 'bi-person-badge-fill';
      case 'L3_Pending': return 'bi-award-fill';
      case 'Submitted': return 'bi-send-fill';
      case 'Active': return 'bi-check2-circle';
      case 'Rejected': return 'bi-x-circle-fill text-danger';
      default: return 'bi-hourglass-split';
    }
  }

  getStageStepText(status: string): string {
    switch (status) {
      case 'Submitted': return 'Stage 1: Requisition Submitted';
      case 'L1_Pending': return 'Tier 1 of 3: Operations Pending';
      case 'L2_Pending': return 'Tier 2 of 3: Corp HR Review Pending';
      case 'L3_Pending': return 'Tier 3 of 3: Final HOD Review';
      case 'Active': return 'All 3 Tiers Completed (Live)';
      case 'Rejected': return 'Returned to Site HR (Revision Needed)';
      default: return 'In Review';
    }
  }

  // ─── Step 5: Sourcing Channel & Vendor Allocation Methods (TA or Supply Vendors) ───

  getMappedVendorsCount(): number {
    return (this.vendorAllocationList || []).filter(v => v.isMapped === 1).length;
  }

  getSelectedVendorsCount(): number {
    return (this.vendorAllocationList || []).filter(v => v.selected).length;
  }

  getSelectedMappedCount(): number {
    return (this.vendorAllocationList || []).filter(v => v.selected && v.isMapped === 1).length;
  }

  toggleSelectAll(event: any): void {
    const isChecked = event?.target?.checked ?? false;
    (this.filteredVendorList || []).forEach(v => v.selected = isChecked);
  }

  isAllSelected(): boolean {
    if (!this.filteredVendorList || this.filteredVendorList.length === 0) return false;
    return this.filteredVendorList.every(v => v.selected);
  }

  onBulkChannelTypeChange(): void {
    // Channel type is selected on top; nothing else is filtered or affected.
  }

  openVendorAllocationModal(job: any): void {
    if (!job) return;
    this.selectedJobForVendor = job;
    this.vendorSearchQuery = '';
    this.bulkChannelType = 'Supply Vendors';
    this.showVendorAllocationModal = true;
    const reqId = job.reqId || job.jobId;
    this.loadVendorsForJob(reqId);
  }

  closeVendorAllocationModal(): void {
    this.showVendorAllocationModal = false;
    this.selectedJobForVendor = null;
    this.vendorAllocationList = [];
    this.filteredVendorList = [];
    this.vendorSearchQuery = '';
    this.isBulkSaving = false;
  }

  loadVendorsForJob(reqId: number | string): void {
    this.isLoadingVendors = true;
    this.loaderService.start();
    const targetCompId = this.selectedJobForVendor?.fk_companyId || 
                         this.selectedJobForVendor?.companyId || 
                         this.companyId;
    this.atsService.getVendorsForMapping(reqId, targetCompId).subscribe({
      next: (vendors) => {
        this.loaderService.stop();
        this.isLoadingVendors = false;
        this.vendorAllocationList = (vendors || []).map(v => ({
          ...v,
          selected: false,
          vendorType: v.vendorType || this.bulkChannelType,
          commissionTerms: v.commissionTerms || 'Standard (8.33%)',
          isSaving: false
        }));
        this.applyVendorFilter();
      },
      error: () => {
        this.loaderService.stop();
        this.isLoadingVendors = false;
        this.toastr.error('Failed to load vendors for allocation.', 'Error');
      }
    });
  }

  applyVendorFilter(): void {
    let list = this.vendorAllocationList || [];
    if (this.vendorSearchQuery && this.vendorSearchQuery.trim()) {
      const q = this.vendorSearchQuery.toLowerCase().trim();
      list = list.filter(v =>
        (v.vendorName && v.vendorName.toLowerCase().includes(q)) ||
        (v.vendorCode && v.vendorCode.toLowerCase().includes(q)) ||
        (v.mobile && v.mobile.toLowerCase().includes(q))
      );
    }
    this.filteredVendorList = list;
  }

  saveBulkAllocation(): void {
    const selected = (this.vendorAllocationList || []).filter(v => v.selected);
    if (selected.length === 0) {
      this.toastr.warning('Please select at least one vendor using the checkboxes.', 'No Selection');
      return;
    }
    if (!this.selectedJobForVendor) return;
    const reqId = this.selectedJobForVendor.reqId || this.selectedJobForVendor.jobId;
    const targetCompId = this.selectedJobForVendor.fk_companyId || 
                         this.selectedJobForVendor.companyId || 
                         this.companyId;

    const payloadList = selected.map(v => ({
      reqId: reqId,
      vendorId: v.vendorId.toString(),
      vendorName: v.vendorName,
      vendorType: this.bulkChannelType,
      allocatedQuota: 0,
      commissionTerms: v.commissionTerms || (this.bulkChannelType === 'TA' ? 'In-house TA Direct' : 'Standard (8.33%)'),
      isActive: true,
      assignedBy: this.userName || 'Administrator',
      companyId: targetCompId
    }));

    this.isBulkSaving = true;
    this.loaderService.start();
    this.atsService.saveBulkVendorMapping(payloadList).subscribe({
      next: () => {
        this.loaderService.stop();
        this.isBulkSaving = false;
        selected.forEach(v => {
          v.isMapped = 1;
          v.vendorType = this.bulkChannelType;
          v.selected = false;
        });
        this.toastr.success(`Successfully allocated ${selected.length} vendor(s) under [${this.bulkChannelType}].`, 'Step 5: Bulk Allocated');
        this.openVendorEmailModal(selected);
      },
      error: (err) => {
        this.loaderService.stop();
        this.isBulkSaving = false;
        this.toastr.error(err.error?.message || 'Failed to save bulk allocations.', 'Error');
      }
    });
  }

  deallocateBulkAllocation(): void {
    const selectedMapped = (this.vendorAllocationList || []).filter(v => v.selected && v.isMapped === 1);
    if (selectedMapped.length === 0) {
      this.toastr.warning('Please select at least one allocated vendor to deallocate.', 'No Selection');
      return;
    }
    if (!this.selectedJobForVendor) return;
    const reqId = this.selectedJobForVendor.reqId || this.selectedJobForVendor.jobId;
    const targetCompId = this.selectedJobForVendor.fk_companyId || 
                         this.selectedJobForVendor.companyId || 
                         this.companyId;

    const payloadList = selectedMapped.map(v => ({
      reqId: reqId,
      vendorId: v.vendorId.toString(),
      companyId: targetCompId
    }));

    this.isBulkSaving = true;
    this.loaderService.start();
    this.atsService.deallocateBulkVendors(payloadList).subscribe({
      next: () => {
        this.loaderService.stop();
        this.isBulkSaving = false;
        selectedMapped.forEach(v => {
          v.isMapped = 0;
          v.selected = false;
        });
        this.toastr.info(`Deallocated ${selectedMapped.length} vendor(s) from requisition.`, 'Bulk Deallocated');
      },
      error: (err) => {
        this.loaderService.stop();
        this.isBulkSaving = false;
        this.toastr.error(err.error?.message || 'Failed to deallocate selected vendors.', 'Error');
      }
    });
  }

  saveVendorAllocation(v: any): void {
    if (!this.selectedJobForVendor) return;
    const reqId = this.selectedJobForVendor.reqId || this.selectedJobForVendor.jobId;
    const targetCompId = this.selectedJobForVendor.fk_companyId || 
                         this.selectedJobForVendor.companyId || 
                         this.companyId;

    const payload = {
      reqId: reqId,
      vendorId: v.vendorId.toString(),
      vendorName: v.vendorName,
      vendorType: this.bulkChannelType,
      allocatedQuota: 0,
      commissionTerms: v.commissionTerms || (this.bulkChannelType === 'TA' ? 'In-house TA Direct' : 'Standard (8.33%)'),
      isActive: true,
      assignedBy: this.userName || 'Administrator',
      companyId: targetCompId
    };

    v.isSaving = true;
    this.atsService.saveVendorMapping(payload).subscribe({
      next: () => {
        v.isSaving = false;
        v.isMapped = 1;
        v.vendorType = this.bulkChannelType;
        this.toastr.success(`Mapped ${v.vendorName} under [${this.bulkChannelType}].`, 'Step 5: Vendor Allocated');
        this.openVendorEmailModal([v]);
      },
      error: (err) => {
        v.isSaving = false;
        this.toastr.error(err.error?.message || 'Failed to save vendor allocation.', 'Error');
      }
    });
  }

  deallocateVendor(v: any): void {
    if (!this.selectedJobForVendor) return;
    const reqId = this.selectedJobForVendor.reqId || this.selectedJobForVendor.jobId;
    const targetCompId = this.selectedJobForVendor.fk_companyId || 
                         this.selectedJobForVendor.companyId || 
                         this.companyId;

    v.isSaving = true;
    this.atsService.deallocateVendor(reqId, v.vendorId, targetCompId).subscribe({
      next: () => {
        v.isSaving = false;
        v.isMapped = 0;
        v.selected = false;
        this.toastr.info(`Deallocated ${v.vendorName} from requisition.`, 'Vendor Deallocated');
      },
      error: (err) => {
        v.isSaving = false;
        this.toastr.error(err.error?.message || 'Failed to deallocate vendor.', 'Error');
      }
    });
  }

  openVendorModalFromApproval(): void {
    const job = this.selectedJobForApproval;
    this.closeApprovalModal();
    this.openVendorAllocationModal(job);
  }

  // ── Step 5b: Post-Allocation Vendor Intimation Email Methods ──

  openVendorEmailModal(targetVendors?: any[]): void {
    if (!this.selectedJobForVendor) return;

    let vendorsToNotify: any[] = [];
    if (targetVendors && targetVendors.length > 0) {
      vendorsToNotify = targetVendors;
    } else {
      vendorsToNotify = (this.vendorAllocationList || []).filter(v => v.isMapped === 1);
    }

    if (vendorsToNotify.length === 0) {
      this.toastr.warning('No allocated vendors found to send email to.', 'No Vendors');
      return;
    }

    this.lockedVendorRecipients = [];
    this.vendorsWithoutEmailCount = 0;

    vendorsToNotify.forEach(v => {
      const email = (v.email || '').trim();
      if (email && email.includes('@')) {
        // avoid duplicate vendor emails in locked list
        if (!this.lockedVendorRecipients.some(x => x.email.toLowerCase() === email.toLowerCase())) {
          this.lockedVendorRecipients.push({
            vendorId: (v.vendorId || '').toString(),
            vendorCode: v.vendorCode || '',
            vendorName: v.vendorName || 'Vendor',
            email: email
          });
        }
      } else {
        this.vendorsWithoutEmailCount++;
      }
    });

    const job = this.selectedJobForVendor;
    const mrfCode = job.mrfCode || ('MRF/2026/' + (job.reqId || job.jobId));
    const jobTitle = job.jobTitle || 'Position';
    this.vendorEmailSubject = `[NEW ASSIGNMENT] Job Opportunity: ${jobTitle} (${mrfCode}) - CJ DARCL Logistics`;
    this.vendorEmailCustomRemarks = '';
    this.additionalEmailRecipients = [];
    this.newAdditionalEmailInput = '';
    this.showVendorEmailModal = true;
  }

  closeVendorEmailModal(): void {
    this.showVendorEmailModal = false;
    this.isSendingVendorEmails = false;
  }

  addAdditionalEmail(): void {
    const input = (this.newAdditionalEmailInput || '').trim();
    if (!input) return;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      this.toastr.warning('Please enter a valid email address.', 'Invalid Email');
      return;
    }

    // Check if already in locked or additional list
    const isLocked = this.lockedVendorRecipients.some(x => x.email.toLowerCase() === input.toLowerCase());
    const isAdditional = this.additionalEmailRecipients.some(x => x.toLowerCase() === input.toLowerCase());

    if (isLocked || isAdditional) {
      this.toastr.info('This email address is already in the recipient list.', 'Duplicate Email');
      this.newAdditionalEmailInput = '';
      return;
    }

    this.additionalEmailRecipients.push(input);
    this.newAdditionalEmailInput = '';
  }

  removeAdditionalEmail(index: number): void {
    if (index >= 0 && index < this.additionalEmailRecipients.length) {
      this.additionalEmailRecipients.splice(index, 1);
    }
  }

  sendVendorRequisitionEmails(): void {
    if (!this.selectedJobForVendor) return;

    if (this.lockedVendorRecipients.length === 0 && this.additionalEmailRecipients.length === 0) {
      this.toastr.warning('Please specify at least one valid recipient email address.', 'No Recipients');
      return;
    }

    const job = this.selectedJobForVendor;
    const reqId = job.reqId || job.jobId;
    const targetCompId = job.fk_companyId || job.companyId || this.companyId;
    const mrfCode = job.mrfCode || ('MRF/2026/' + reqId);

    const payload = {
      reqId: reqId,
      mrfCode: mrfCode,
      jobTitle: job.jobTitle || '',
      location: job.location || job.locName || 'Corporate Hub',
      department: job.department || 'Operations',
      openings: job.openPositions || job.openingsCount || 1,
      experienceRange: job.experienceMin ? `${job.experienceMin} - ${job.experienceMax || 0} Years` : 'Standard',
      ctcRange: job.ctcMin ? `₹${job.ctcMin} - ₹${job.ctcMax || 0} LPA` : 'As per budget',
      channelType: this.bulkChannelType,
      subject: this.vendorEmailSubject,
      customRemarks: this.vendorEmailCustomRemarks,
      companyId: targetCompId,
      lockedVendorEmails: this.lockedVendorRecipients,
      additionalEmails: this.additionalEmailRecipients
    };

    this.isSendingVendorEmails = true;
    this.atsService.sendVendorRequisitionIntimation(payload).subscribe({
      next: (res: any) => {
        this.isSendingVendorEmails = false;
        this.closeVendorEmailModal();
        const count = res?.recipientCount || (this.lockedVendorRecipients.length + this.additionalEmailRecipients.length);
        this.toastr.success(`Requisition intimation sent successfully to ${count} recipient(s)!`, 'Emails Dispatched');
      },
      error: (err: any) => {
        this.isSendingVendorEmails = false;
        this.toastr.error(err.error?.message || 'Failed to dispatch vendor intimation emails.', 'Email Error');
      }
    });
  }
}

