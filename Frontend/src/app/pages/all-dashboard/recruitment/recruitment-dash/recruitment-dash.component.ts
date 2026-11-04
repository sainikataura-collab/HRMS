import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AtsService } from '../../../../shared/services/ats.service';

interface FunnelStageItem {
  code: string;
  label: string;
  count: number;
  pct: number;
  color: string;
  icon: string;
}

interface LocationDemandItem {
  locationName: string;
  openDemand: number;
  hiredCount: number;
  fillPct: number;
}

interface SourcingChannelItem {
  name: string;
  count: number;
  pct: number;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-recruitment-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recruitment-dash.component.html',
  styleUrls: ['./recruitment-dash.component.scss']
})
export class RecruitmentDashComponent implements OnInit, OnDestroy {
  // Session & Company Context (100% Dynamic Company Scoping)
  userId: string = '';
  userName: string = '';
  companyId: string = '';

  // Loading & State
  isLoading: boolean = true;
  isRefreshing: boolean = false;

  // Raw Unfiltered Data Stores
  rawRequisitions: any = [];
  rawCandidates: any = [];
  rawLocations: any = [];

  // Filter Modal & Criteria
  showFilterModal: boolean = false;
  availableVendors: any[] = [];
  availableLocations: string[] = [];

  // Working Filter Form Inputs
  tempVendorId: string = 'ALL';
  tempLocation: string = 'ALL';
  tempDateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom' = 'all';
  tempCustomStartDate: string = '';
  tempCustomEndDate: string = '';

  // Applied Filter State
  appliedVendorId: string = 'ALL';
  appliedVendorName: string = 'All Vendors';
  appliedLocation: string = 'ALL';
  appliedDateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom' = 'all';
  appliedCustomStartDate: string = '';
  appliedCustomEndDate: string = '';
  activeFilterCount: number = 0;

  // KPI Metrics
  totalJobsCount: number = 0;
  activeJobsCount: number = 0;
  closedJobsCount: number = 0;
  totalHeadcountDemand: number = 0;
  totalCandidatesInPipeline: number = 0;
  totalHiredCount: number = 0;
  pendingApprovalsCount: number = 0;
  totalVendorsCount: number = 0;
  hiringFulfillmentRate: number = 0;
  rejectedJobsCount: number = 0;

  // User Access Rights (Location Scoping + Approval Tiers from UM_UserPageRights)
  assignedLocationIds: string[] = [];
  l1_Access: boolean = false;
  l2_Access: boolean = false;
  l3_Access: boolean = false;
  rightsLoaded: boolean = false;

  // Conversion Funnel
  funnelStages: FunnelStageItem[] = [];

  // Location Manpower Demands
  locationDemandList: LocationDemandItem[] = [];

  // Sourcing Channel Mix
  sourcingChannels: SourcingChannelItem[] = [];

  // Recent Candidates
  recentCandidates: any[] = [];

  // Requisitions Table
  filteredRequisitions: any[] = [];
  get allRequisitions(): any[] {
    return this.filteredRequisitions || this.rawRequisitions || [];
  }
  searchReqText: string = '';
  activeReqTab: 'ALL' | 'ACTIVE' | 'PENDING' | 'CLOSED' = 'ALL';

  private subs: Subscription = new Subscription();

  constructor(
    private atsService: AtsService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem('userId') || sessionStorage.getItem('UserId') || '';
    this.userName = sessionStorage.getItem('username') || sessionStorage.getItem('name') || 'Recruiter';
    this.companyId = sessionStorage.getItem('companyId') || 
                     localStorage.getItem('companyId') || 
                     sessionStorage.getItem('fk_companyId') || 
                     localStorage.getItem('fk_companyId') || 
                     '';

    this.loadAllDashboardData();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadAllDashboardData(): void {
    this.isLoading = true;
    this.isRefreshing = true;

    // 0. Load User Access Rights (Assigned Locations + L1/L2/L3) - Recruitment Module (5)
    if (this.userId) {
      const subRights = this.atsService.getUserAccessRights(this.userId, 5).subscribe({
        next: (res) => {
          const d = res?.data || {};
          this.assignedLocationIds = d.assignedLocationIds || d.AssignedLocationIds || [];
          this.l1_Access = !!(d.l1_Access || d.L1_Access);
          this.l2_Access = !!(d.l2_Access || d.L2_Access);
          this.l3_Access = !!(d.l3_Access || d.L3_Access);
          this.rightsLoaded = true;
          this.populateLocationList();
          this.applyAllDashboardFilters();
        },
        error: () => {
          this.rightsLoaded = true;
        }
      });
      this.subs.add(subRights);
    }

    // 1. Load Job Requisitions (Strictly Company-Scoped)
    const subJobs = this.atsService.getJobRequisitions(this.companyId).subscribe({
      next: (jobs: any) => {
        this.rawRequisitions = Array.isArray(jobs) ? jobs : (jobs?.data || jobs?.result || []);
        this.populateLocationList();
        this.applyAllDashboardFilters();
      },
      error: (err) => {
        console.warn('Error loading requisitions for dashboard:', err);
      }
    });
    this.subs.add(subJobs);

    // 2. Load Candidate Pipeline (Strictly Company-Scoped)
    const subCandidates = this.atsService.getCandidatePipelineRoster(undefined, 'ALL', undefined, this.companyId).subscribe({
      next: (candidates: any) => {
        this.rawCandidates = Array.isArray(candidates) ? candidates : (candidates?.data || candidates?.result || []);
        this.applyAllDashboardFilters();
      },
      error: (err) => {
        console.warn('Error loading candidate roster:', err);
      }
    });
    this.subs.add(subCandidates);

    // 3. Pending Approvals Count is now derived locally in recomputeMetrics()
    //    from location-authorized + filtered requisitions and the user's L1/L2/L3 rights.

    // 4. Load Vendor List for Portal Count (Strictly Company-Scoped)
    const subVendors = this.atsService.getVendorListForPortal(this.companyId).subscribe({
      next: (vendors: any) => {
        this.availableVendors = Array.isArray(vendors) ? vendors : (vendors?.data || vendors?.result || []);
        this.applyAllDashboardFilters();
      },
      error: () => {
        this.availableVendors = [];
        this.totalVendorsCount = 0;
      }
    });
    this.subs.add(subVendors);

    // 5. Load Location Manpower Demand (Strictly Company-Scoped)
    const subLoc = this.atsService.getLocationManpowerList(this.companyId).subscribe({
      next: (locations: any) => {
        this.rawLocations = Array.isArray(locations) ? locations : (locations?.data || locations?.result || []);
        this.populateLocationList();
        this.applyAllDashboardFilters();
        this.isLoading = false;
        this.isRefreshing = false;
      },
      error: () => {
        this.rawLocations = [];
        this.applyAllDashboardFilters();
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
    this.subs.add(subLoc);
  }

  refreshDashboard(): void {
    this.loadAllDashboardData();
    this.toastr.info('Dashboard metrics synchronized.', 'Refreshed');
  }

  // ── Populate Locations from Company Data ──────────────────────────────────
  populateLocationList(): void {
    const locSet = new Set<string>();
    (this.authorizedRequisitions || []).forEach(j => {
      if (j.location && j.location.trim()) {
        locSet.add(j.location.trim());
      }
    });
    const locList: any[] = Array.isArray(this.rawLocations) ? this.rawLocations : ((this.rawLocations as any)?.data || []);
    locList.forEach((l: any) => {
      const name = l.locationName || l.locname;
      const id = l.locationId || l.fk_locid || l.pk_locid || l.locId;
      if (name && name.trim() && this.isLocationAllowed(id, name)) {
        locSet.add(name.trim());
      }
    });
    this.availableLocations = Array.from(locSet).sort();

    // Drop an applied location that the user is no longer authorized for
    if (this.appliedLocation !== 'ALL' && !this.availableLocations.includes(this.appliedLocation)) {
      this.appliedLocation = 'ALL';
      this.calculateActiveFilterCount();
    }
  }

  // ── Location Authorization (UM_UserPageRights assigned hubs) ──────────────
  get hasLocationRestriction(): boolean {
    return !!this.assignedLocationIds && this.assignedLocationIds.length > 0;
  }

  isLocationAllowed(locId: any, locName?: string): boolean {
    if (!this.hasLocationRestriction) return true;
    const idStr = String(locId ?? '').trim();
    const cleanId = idStr.replace(/^GU-/i, '').toLowerCase();
    const name = String(locName ?? '').trim().toLowerCase();

    return this.assignedLocationIds.some(assigned => {
      const a = String(assigned ?? '').trim();
      const cleanA = a.replace(/^GU-/i, '').toLowerCase();
      if (cleanId && cleanA && cleanId === cleanA) return true;
      if (name && (a.toLowerCase() === name || cleanA === name)) return true;
      return false;
    });
  }

  get authorizedRequisitions(): any[] {
    const list: any[] = Array.isArray(this.rawRequisitions) ? this.rawRequisitions : ((this.rawRequisitions as any)?.data || []);
    if (!this.hasLocationRestriction) return list;
    return list.filter((j: any) =>
      this.isLocationAllowed(j.fk_locid || j.locId || j.locationId, j.location)
    );
  }

  // ── Status Predicates (single source of truth for counts AND tabs) ────────
  isRejectedJob(j: any): boolean {
    return j?.isDisapproved == 1 || j?.isDisapproved === true ||
           j?.workflowStatus === 'Rejected' || j?.status === 'Rejected';
  }

  isFilledJob(j: any): boolean {
    const open = Number(j?.openPositions || j?.openingsCount || 1);
    return open > 0 && Number(j?.hiredCount || 0) >= open;
  }

  isClosedJob(j: any): boolean {
    const st = (j?.workflowStatus || j?.status || '').toLowerCase();
    return st.includes('close') || this.isRejectedJob(j) || this.isFilledJob(j);
  }

  isActiveJob(j: any): boolean {
    if (this.isClosedJob(j)) return false;
    const st = (j?.workflowStatus || '').toLowerCase();
    return st === 'active' || st === 'approved' || st === 'live';
  }

  isPendingApprovalJob(j: any): boolean {
    if (this.isRejectedJob(j)) return false;
    const wf = j?.workflowStatus;
    const hasGranular = this.rightsLoaded && (this.l1_Access || this.l2_Access || this.l3_Access);
    if (hasGranular) {
      if (wf === 'L1_Pending' || wf === 'Submitted') return this.l1_Access;
      if (wf === 'L2_Pending') return this.l2_Access;
      if (wf === 'L3_Pending') return this.l3_Access;
      return false;
    }
    return wf === 'L1_Pending' || wf === 'L2_Pending' || wf === 'L3_Pending' || wf === 'Submitted';
  }

  // ── Filter Modal Operations ───────────────────────────────────────────────
  openFilterModal(): void {
    this.tempVendorId = this.appliedVendorId;
    this.tempLocation = this.appliedLocation;
    this.tempDateRange = this.appliedDateRange;
    this.tempCustomStartDate = this.appliedCustomStartDate;
    this.tempCustomEndDate = this.appliedCustomEndDate;
    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
  }

  setDatePreset(preset: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom'): void {
    this.tempDateRange = preset;
    if (preset !== 'custom') {
      this.tempCustomStartDate = '';
      this.tempCustomEndDate = '';
    }
  }

  applyFilters(): void {
    this.appliedVendorId = this.tempVendorId;
    if (this.appliedVendorId !== 'ALL') {
      const v = this.availableVendors.find(x => x.vendorId?.toString() === this.appliedVendorId || x.vendorCode === this.appliedVendorId);
      this.appliedVendorName = v ? (v.vendorName || v.contactPerson || 'Selected Vendor') : 'Selected Vendor';
    } else {
      this.appliedVendorName = 'All Vendors';
    }

    this.appliedLocation = this.tempLocation;
    this.appliedDateRange = this.tempDateRange;
    this.appliedCustomStartDate = this.tempCustomStartDate;
    this.appliedCustomEndDate = this.tempCustomEndDate;

    this.calculateActiveFilterCount();
    this.applyAllDashboardFilters();
    this.closeFilterModal();
    this.toastr.success('Dashboard filters applied.', 'Filtered');
  }

  resetFilters(): void {
    this.tempVendorId = 'ALL';
    this.tempLocation = 'ALL';
    this.tempDateRange = 'all';
    this.tempCustomStartDate = '';
    this.tempCustomEndDate = '';

    this.appliedVendorId = 'ALL';
    this.appliedVendorName = 'All Vendors';
    this.appliedLocation = 'ALL';
    this.appliedDateRange = 'all';
    this.appliedCustomStartDate = '';
    this.appliedCustomEndDate = '';

    this.activeFilterCount = 0;
    this.applyAllDashboardFilters();
    this.closeFilterModal();
    this.toastr.info('All filters cleared.', 'Reset');
  }

  removeVendorFilter(): void {
    this.appliedVendorId = 'ALL';
    this.appliedVendorName = 'All Vendors';
    this.calculateActiveFilterCount();
    this.applyAllDashboardFilters();
  }

  removeLocationFilter(): void {
    this.appliedLocation = 'ALL';
    this.calculateActiveFilterCount();
    this.applyAllDashboardFilters();
  }

  removeDateFilter(): void {
    this.appliedDateRange = 'all';
    this.appliedCustomStartDate = '';
    this.appliedCustomEndDate = '';
    this.calculateActiveFilterCount();
    this.applyAllDashboardFilters();
  }

  calculateActiveFilterCount(): void {
    let count = 0;
    if (this.appliedVendorId !== 'ALL') count++;
    if (this.appliedLocation !== 'ALL') count++;
    if (this.appliedDateRange !== 'all') count++;
    this.activeFilterCount = count;
  }

  // ── Unified Multi-Dimensional Dashboard Filter Engine ─────────────────────
  applyAllDashboardFilters(): void {
    // 1. Filter Requisitions (start from location-authorized set only)
    let filteredJobs = [...this.authorizedRequisitions];

    // Location Filter
    if (this.appliedLocation !== 'ALL') {
      const locQ = this.appliedLocation.toLowerCase().trim();
      filteredJobs = filteredJobs.filter(j => (j.location || '').toLowerCase().trim().includes(locQ));
    }

    // Date Filter on Requisitions
    if (this.appliedDateRange !== 'all') {
      filteredJobs = filteredJobs.filter(j => this.isDateInRange(j.createdDate || j.postedDate || j.dated));
    }

    // 2. Filter Candidates (restricted to requisitions in the user's authorized hubs)
    let filteredCandidates = [...this.rawCandidates];
    if (this.hasLocationRestriction) {
      const authReqIds = new Set(this.authorizedRequisitions.map(j => Number(j.reqId || j.jobId)));
      filteredCandidates = filteredCandidates.filter(c => authReqIds.has(Number(c.reqId || c.fk_reqid || c.jobId)));
    }

    // Vendor Filter
    if (this.appliedVendorId !== 'ALL') {
      filteredCandidates = filteredCandidates.filter(c =>
        c.vendorId === this.appliedVendorId ||
        c.vendorName === this.appliedVendorName ||
        (c.vendorCode && c.vendorCode === this.appliedVendorId)
      );
    }

    // Location Filter on Candidates
    if (this.appliedLocation !== 'ALL') {
      const locQ = this.appliedLocation.toLowerCase().trim();
      filteredCandidates = filteredCandidates.filter(c =>
        (c.currentLocation || '').toLowerCase().trim().includes(locQ) ||
        (c.operatingHub || '').toLowerCase().trim().includes(locQ)
      );
    }

    // Date Filter on Candidates
    if (this.appliedDateRange !== 'all') {
      filteredCandidates = filteredCandidates.filter(c => this.isDateInRange(c.createdDate || c.appliedDate));
    }

    // If Vendor Filter is active, also filter Requisitions to only those having applications by this vendor
    if (this.appliedVendorId !== 'ALL') {
      const activeReqIds = new Set(filteredCandidates.map(c => Number(c.reqId || c.fk_reqid || c.jobId)));
      filteredJobs = filteredJobs.filter(j => activeReqIds.has(Number(j.reqId || j.jobId)));
    }

    // Keep candidates aligned with the filtered requisitions (location/date filters)
    if (this.appliedLocation !== 'ALL' || this.appliedDateRange !== 'all') {
      const jobReqIds = new Set(filteredJobs.map(j => Number(j.reqId || j.jobId)));
      filteredCandidates = filteredCandidates.filter(c => {
        const rid = Number(c.reqId || c.fk_reqid || c.jobId);
        return !rid || jobReqIds.has(rid);
      });
    }

    // 3. Re-calculate All Metrics
    this.recomputeMetrics(filteredJobs, filteredCandidates);
  }

  isDateInRange(dateStr?: string): boolean {
    if (!dateStr) return true;
    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (this.appliedDateRange) {
      case 'today':
        return targetDate >= today;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return targetDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return targetDate >= monthAgo;
      }
      case 'quarter': {
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return targetDate >= quarterAgo;
      }
      case 'custom': {
        let match = true;
        if (this.appliedCustomStartDate) {
          const s = new Date(this.appliedCustomStartDate);
          if (targetDate < s) match = false;
        }
        if (this.appliedCustomEndDate) {
          const e = new Date(this.appliedCustomEndDate);
          e.setHours(23, 59, 59, 999);
          if (targetDate > e) match = false;
        }
        return match;
      }
      default:
        return true;
    }
  }

  recomputeMetrics(jobs: any[], candidates: any[]): void {
    let totalDemands = 0;
    let totalHired = 0;

    jobs.forEach(j => {
      // Requisition-based metrics
      if (this.isRejectedJob(j)) return;
      totalDemands += Number(j.openPositions || j.openingsCount || 1);
      totalHired += Number(j.hiredCount || 0);
    });

    this.totalJobsCount = jobs.length;
    this.activeJobsCount = jobs.filter(j => this.isActiveJob(j)).length;
    this.closedJobsCount = jobs.filter(j => this.isClosedJob(j)).length;
    this.rejectedJobsCount = jobs.filter(j => this.isRejectedJob(j)).length;
    this.pendingApprovalsCount = jobs.filter(j => this.isPendingApprovalJob(j)).length;

    // Headcount Demand: Total diff between (headcount + buffer) - current employee count across all user-authorized locations
    let locationDemandSum = 0;
    let hasLocationDemandData = false;
    const locList: any[] = Array.isArray(this.rawLocations) ? this.rawLocations : ((this.rawLocations as any)?.data || []);

    if (locList.length > 0) {
      locList.forEach((l: any) => {
        const name = l.locationName || l.locname;
        const id = l.locationId || l.fk_locid || l.pk_locid || l.locId;
        if (!this.isLocationAllowed(id, name)) return;
        if (this.appliedLocation !== 'ALL') {
          const locName = (name || '').toLowerCase().trim();
          if (!locName.includes(this.appliedLocation.toLowerCase().trim())) return;
        }

        const base = Number(l.baseRequired != null ? l.baseRequired : (l.baseDemand || 0));
        const buffer = Number(l.bufferHeadcount != null ? l.bufferHeadcount : (l.bufferHeads || 0));
        const current = Number(l.currentOccupied != null ? l.currentOccupied : 0);
        const target = Number(l.totalTargetCapacity != null ? l.totalTargetCapacity : (base + buffer));
        const diff = Math.max(0, target - current);
        if (target > 0 || current > 0) {
          locationDemandSum += diff;
          hasLocationDemandData = true;
        }
      });
    }

    // Staffing network: vendors actually engaged within the current scope
    if (this.appliedVendorId !== 'ALL') {
      this.totalVendorsCount = 1;
    } else if (this.hasLocationRestriction || this.appliedLocation !== 'ALL' || this.appliedDateRange !== 'all') {
      const vSet = new Set<string>();
      candidates.forEach(c => {
        const v = c.vendorId || c.vendorCode || c.vendorName;
        if (v) vSet.add(String(v));
      });
      this.totalVendorsCount = vSet.size;
    } else {
      this.totalVendorsCount = this.availableVendors.length;
    }

    this.totalHeadcountDemand = hasLocationDemandData ? locationDemandSum : totalDemands;
    this.totalHiredCount = totalHired;
    this.hiringFulfillmentRate = this.totalHeadcountDemand > 0 ? Math.min(100, Math.round((totalHired / this.totalHeadcountDemand) * 100)) : 0;
    this.totalCandidatesInPipeline = candidates.length;

    this.processCandidateFunnel(candidates);
    this.processSourcingChannels(candidates);
    this.recentCandidates = candidates.slice(0, 5);
    this.processLocationDemands(jobs);
    this.applyReqTableFilter(jobs);
  }

  processCandidateFunnel(candidates: any[]): void {
    const total = candidates.length || 1;

    let applied = 0;
    let interview = 0;
    let selected = 0;
    let docVerified = 0;
    let offer = 0;
    let hired = 0;

    candidates.forEach(c => {
      const st = (c.stage || '').toLowerCase();
      if (st === 'applied' || st === 'screening' || st === 'none' || !st) applied++;
      else if (st.includes('interview')) interview++;
      else if (st.includes('select') || st.includes('fitment')) selected++;
      else if (st.includes('doc') || st.includes('confirm')) docVerified++;
      else if (st.includes('offer')) offer++;
      else if (st.includes('hire') || st.includes('join')) hired++;
      else applied++;
    });

    this.funnelStages = [
      {
        code: 'APPLIED',
        label: 'Sourced / Applied',
        count: applied,
        pct: Math.round((applied / total) * 100),
        color: '#3b82f6',
        icon: 'bi-inbox-fill'
      },
      {
        code: 'INTERVIEW',
        label: 'Interview Round',
        count: interview,
        pct: Math.round((interview / total) * 100),
        color: '#f59e0b',
        icon: 'bi-calendar2-check-fill'
      },
      {
        code: 'SELECTED',
        label: 'Selected / Fitment',
        count: selected,
        pct: Math.round((selected / total) * 100),
        color: '#8b5cf6',
        icon: 'bi-hand-thumbs-up-fill'
      },
      {
        code: 'DOC_VERIFIED',
        label: '22-Pt KYC Audit',
        count: docVerified,
        pct: Math.round((docVerified / total) * 100),
        color: '#06b6d4',
        icon: 'bi-file-earmark-check-fill'
      },
      {
        code: 'OFFER_ISSUED',
        label: 'Offer Letter Sent',
        count: offer,
        pct: Math.round((offer / total) * 100),
        color: '#10b981',
        icon: 'bi-envelope-check-fill'
      },
      {
        code: 'HIRED',
        label: 'Hired & Bio Sync',
        count: hired,
        pct: Math.round((hired / total) * 100),
        color: '#3080e8',
        icon: 'bi-person-check-fill'
      }
    ];
  }

  processSourcingChannels(candidates: any[]): void {
    const total = candidates.length || 1;
    let vendorCount = 0;
    let jobBoardCount = 0;
    let walkinCount = 0;
    let referralCount = 0;

    candidates.forEach(c => {
      const src = (c.sourceType || '').toLowerCase();
      if (src.includes('vendor')) vendorCount++;
      else if (src.includes('board') || src.includes('naukri') || src.includes('linkedin') || src.includes('indeed')) jobBoardCount++;
      else if (src.includes('walk')) walkinCount++;
      else if (src.includes('refer')) referralCount++;
      else vendorCount++;
    });

    this.sourcingChannels = [
      {
        name: 'Staffing Vendors',
        count: vendorCount,
        pct: Math.round((vendorCount / total) * 100),
        color: '#3080e8',
        icon: 'bi-buildings'
      },
      {
        name: 'Job Boards Syndication',
        count: jobBoardCount,
        pct: Math.round((jobBoardCount / total) * 100),
        color: '#0284c7',
        icon: 'bi-globe2'
      },
      {
        name: 'Direct Walk-in',
        count: walkinCount,
        pct: Math.round((walkinCount / total) * 100),
        color: '#10b981',
        icon: 'bi-person-walking'
      },
      {
        name: 'Employee Referrals',
        count: referralCount,
        pct: Math.round((referralCount / total) * 100),
        color: '#f59e0b',
        icon: 'bi-share-fill'
      }
    ];
  }

  processLocationDemands(jobs: any[]): void {
    const locList: any[] = Array.isArray(this.rawLocations) ? this.rawLocations : ((this.rawLocations as any)?.data || []);
    const list: LocationDemandItem[] = [];

    if (locList.length > 0) {
      locList.forEach((l: any) => {
        const name = l.locationName || l.locname;
        const id = l.locationId || l.fk_locid || l.pk_locid || l.locId;
        if (!this.isLocationAllowed(id, name)) return;
        if (this.appliedLocation !== 'ALL') {
          const locName = (name || '').toLowerCase().trim();
          if (!locName.includes(this.appliedLocation.toLowerCase().trim())) return;
        }

        const base = Number(l.baseRequired != null ? l.baseRequired : (l.baseDemand || 0));
        const buffer = Number(l.bufferHeadcount != null ? l.bufferHeadcount : (l.bufferHeads || 0));
        const target = Number(l.totalTargetCapacity != null ? l.totalTargetCapacity : (base + buffer));
        const current = Number(l.currentOccupied != null ? l.currentOccupied : 0);
        const openDemand = Math.max(0, target - current);

        if (target > 0 || openDemand > 0) {
          list.push({
            locationName: name,
            openDemand: openDemand,
            hiredCount: current,
            fillPct: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
          });
        }
      });
    }

    // Fallback to job requisition openings if no location manpower data exists
    if (list.length === 0) {
      const locMap = new Map<string, { open: number, hired: number }>();
      (jobs || []).forEach(j => {
        if (this.isRejectedJob(j)) return;
        const loc = j.location || 'Hub Operations';
        const open = Number(j.openPositions || j.openingsCount || 1);
        const hired = Number(j.hiredCount || 0);

        const existing = locMap.get(loc) || { open: 0, hired: 0 };
        existing.open += open;
        existing.hired += hired;
        locMap.set(loc, existing);
      });

      locMap.forEach((val, key) => {
        list.push({
          locationName: key,
          openDemand: val.open,
          hiredCount: val.hired,
          fillPct: val.open > 0 ? Math.min(100, Math.round((val.hired / val.open) * 100)) : 0
        });
      });
    }

    list.sort((a, b) => b.openDemand - a.openDemand);
    this.locationDemandList = list.slice(0, 5);
  }

  // ── Requisition Filter Logic ──────────────────────────────────────────────
  setReqTab(tab: 'ALL' | 'ACTIVE' | 'PENDING' | 'CLOSED'): void {
    this.activeReqTab = tab;
    this.applyAllDashboardFilters();
  }

  applyReqTableFilter(jobs: any[]): void {
    let list = jobs || [];

    if (this.activeReqTab === 'ACTIVE') {
      list = list.filter(j => this.isActiveJob(j));
    } else if (this.activeReqTab === 'PENDING') {
      list = list.filter(j => this.isPendingApprovalJob(j));
    } else if (this.activeReqTab === 'CLOSED') {
      list = list.filter(j => this.isClosedJob(j));
    }

    if (this.searchReqText && this.searchReqText.trim()) {
      const q = this.searchReqText.toLowerCase().trim();
      list = list.filter(j =>
        (j.jobTitle && j.jobTitle.toLowerCase().includes(q)) ||
        (j.mrfCode && j.mrfCode.toLowerCase().includes(q)) ||
        (j.department && j.department.toLowerCase().includes(q)) ||
        (j.location && j.location.toLowerCase().includes(q))
      );
    }

    this.filteredRequisitions = list;
  }

  applyReqFilter(): void {
    this.applyAllDashboardFilters();
  }

  getStatusBadgeClass(job: any): string {
    const st = (job.workflowStatus || job.status || '').toLowerCase();
    if (st.includes('active') || st.includes('live')) return 'badge-active';
    if (st.includes('l1')) return 'badge-l1';
    if (st.includes('l2')) return 'badge-l2';
    if (st.includes('l3')) return 'badge-l3';
    if (st.includes('submit')) return 'badge-submitted';
    if (st.includes('reject')) return 'badge-rejected';
    return 'badge-pending';
  }

  getStatusLabel(job: any): string {
    const st = job.workflowStatus || job.status || 'Active';
    switch (st) {
      case 'L1_Pending': return 'L1 Operations Pending';
      case 'L2_Pending': return 'L2 Corp HR Pending';
      case 'L3_Pending': return 'L3 HOD Signoff';
      case 'Active': return 'Hiring Live';
      case 'Submitted': return 'Submitted';
      case 'Rejected': return 'Rejected';
      default: return st;
    }
  }

  getStageBadgeClass(stage: string): string {
    const s = (stage || '').toLowerCase();
    if (s.includes('hire') || s.includes('join')) return 'stage-hired';
    if (s.includes('offer')) return 'stage-offer';
    if (s.includes('select')) return 'stage-selected';
    if (s.includes('interview')) return 'stage-interview';
    if (s.includes('doc')) return 'stage-doc';
    return 'stage-applied';
  }

  navigateToFunnelStage(stageCode: string): void {
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/pipeline'], {
      queryParams: { stage: stageCode }
    });
  }

  navigateToJob(job: any): void {
    const reqId = job.reqId || job.jobId;
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/pipeline'], {
      queryParams: { reqId: reqId }
    });
  }
}
