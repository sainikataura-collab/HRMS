import { Component, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';

import { VendorService } from '../Service/vendor.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { MenuService } from '../../../../shared/services/menu.service';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export interface VendorDashboardStats {
  active: number;
  inactive: number;
  pending: number;
  total: number;
  totalClients: number;
  activeClients: number;
  totalModels: number;
  mappedVendors: number;
  unmappedVendors: number;
  verifiedVendors: number;
  notVerifiedVendors: number;
  totalPayableAmount: number;
}

export interface VendorWeeklySummary {
  thisWeek: number;
  lastWeek: number;
  pendingApprovals: number;
}

export interface VendorTimelineItem {
  pk_recId: string;
  name: string;
  vendorCode: string;
  email: string;
  mobile: string;
  status: string;
  isMapped: boolean;
  regDate?: string;
}

export interface HiTopVendor {
  vendorId: string;
  vendorName: string;
  onboardingStatus: string;
  completionPercentage: number;
  activeStatus: string;
}

@Component({
  selector: 'app-vendor-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './vendor-dash.component.html',
  styleUrl: './vendor-dash.component.scss'
})
export class VendorDashComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = false;
  error: string | null = null;

  filterForm!: FormGroup;

  // Month & Year default lists (fallback + dynamic from API)
  months: any[] = [
    { name: 'All Months', value: '' },
    { name: 'January', value: '1' },
    { name: 'February', value: '2' },
    { name: 'March', value: '3' },
    { name: 'April', value: '4' },
    { name: 'May', value: '5' },
    { name: 'June', value: '6' },
    { name: 'July', value: '7' },
    { name: 'August', value: '8' },
    { name: 'September', value: '9' },
    { name: 'October', value: '10' },
    { name: 'November', value: '11' },
    { name: 'December', value: '12' }
  ];

  years: any[] = [
    { name: 'All Years', value: '' },
    { name: '2024', value: '2024' },
    { name: '2025', value: '2025' },
    { name: '2026', value: '2026' },
    { name: '2027', value: '2027' },
    { name: '2028', value: '2028' }
  ];

  clients: any[] = [];
  allModels: any[] = [];
  filteredModels: any[] = [];

  vendorFilterOptions: any[] = [
    { name: 'All Vendors', value: '' },
    { name: 'Mapped Vendors', value: 'mapped' },
    { name: 'Unmapped Vendors', value: 'unmapped' },
    { name: 'Verified Vendors', value: 'verified' },
    { name: 'Pending / Initiated', value: 'pending' },
    { name: 'Active Vendors', value: 'active' },
    { name: 'Inactive Vendors', value: 'inactive' }
  ];

  totalVendors: number = 0;
  totalClients: number = 0;
  totalModels: number = 0;

  allVendors: any[] = [];
  filteredVendors: any[] = [];
  recentVendors: any[] = [];
  timeline: VendorTimelineItem[] = [];

  // Selected vendor detail & rate card inspection
  selectedVendor: any = null;
  selectedVendorFHRDetails: any[] = [];
  isLoadingRateCards: boolean = false;

  searchText: string = '';
  showAll: boolean = false;

  stats: VendorDashboardStats = {
    active: 0,
    inactive: 0,
    pending: 0,
    total: 0,
    totalClients: 0,
    activeClients: 0,
    totalModels: 0,
    mappedVendors: 0,
    unmappedVendors: 0,
    verifiedVendors: 0,
    notVerifiedVendors: 0,
    totalPayableAmount: 0
  };

  weeklySummary: VendorWeeklySummary = {
    thisWeek: 0,
    lastWeek: 0,
    pendingApprovals: 0
  };

  // Quick Action permission flags
  canAddVendor: boolean = false;
  canViewVendorList: boolean = false;
  canUploadVendor: boolean = false;
  canMapFhrid: boolean = false;
  canViewRateCards: boolean = false;
  canViewTransactionList: boolean = false;
  canDeductionEntry: boolean = false;
  canRecoveryMIS: boolean = false;
  canRecoveryStrategy: boolean = false;

  get hasAnyQuickAction(): boolean {
    return this.canAddVendor || this.canViewVendorList || this.canUploadVendor ||
           this.canMapFhrid || this.canViewRateCards || this.canViewTransactionList ||
           this.canDeductionEntry || this.canRecoveryMIS || this.canRecoveryStrategy;
  }

  private chart!: Chart;

  // ===== ROLE BASED (HI USER) DASHBOARD =====
  readonly HI_ROLE_ID = 10;              // SP me bhi role 10 hi allowed hai
  isHiUser = false;
  roleId = 0;
  roleName = '';

  hiLoading = false;
  hiError: string | null = null;

  hiSummary = {
    totalVendors: 0, verifiedVendors: 0, pendingVerification: 0, notInitiatedVendors: 0,
    initiatedVendors: 0, submittedVendors: 0, reInitiatedVendors: 0,
    activeVendors: 0, inactiveVendors: 0, averageCompletionPercentage: 0
  };
  hiStatusList: { status: string; total: number; percentage: number }[] = [];
  hiPending = {
    incompleteOnboardingVendors: 0, vendorsWithMissingDocuments: 0,
    vendorsPendingVerification: 0, completedOnboardingVendors: 0
  };
  hiKpis: { label: string; value: number | string; icon: string; color: string; sub: string }[] = [];
  hiPendingCards: { label: string; value: number; icon: string; color: string }[] = [];

  // NEW: Top 5 vendors (SP ka 4th result set)
  hiTopVendors: HiTopVendor[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private vendorService: VendorService,
    private router: Router,
    public encryptionService: EncryptionService,
    private toastrService: ToastrService,
    private loader: NgxUiLoaderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.resolveRole();
    this.loadMenuPermissions();

    if (this.isHiUser) {
      // HI user -> sirf HI dashboard load hoga
      this.loadHiDashboard();
      return;
    }

    // Baaki sab users -> purana dashboard (ELSE case)
    this.initFilterForm();
    this.loadDropdowns();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && !this.isHiUser) {
      setTimeout(() => this.initChart(), 300);
    }
  }

  // ===================== HI DASHBOARD (ROLE BASED) =====================

  /** sessionStorage se roleId + roleName padh ke decide karta hai HI dashboard dikhana hai ya nahi */
  resolveRole(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.roleId = Number(sessionStorage.getItem('roleId') || 0);
    this.roleName = (sessionStorage.getItem('roleName') || '').trim();

    // Primary check: roleId (SP bhi roleId = 10 hi check karta hai)
    // Fallback: roleId na mile to roleName 'HI' se check
    this.isHiUser =
      this.roleId === this.HI_ROLE_ID ||
      (this.roleId === 0 && this.roleName.toUpperCase() === 'HI');
  }

  loadHiDashboard(): void {
    this.hiLoading = true;
    this.hiError = null;
    this.loader.start();

    this.vendorService.getHiDashboardSummary().subscribe({
      next: (res: any) => {
        this.hiLoading = false;
        this.loader.stop();

        if (res && res.isSuccess && res.data) {
          this.mapHiResponse(res.data);
          this.cdr.detectChanges();
        } else {
          this.hiError = res?.message || 'Failed to load HI dashboard';
        }
      },
      error: (err: any) => {
        this.hiLoading = false;
        this.loader.stop();
        this.hiError = err?.error?.message || 'Failed to load HI dashboard';
        this.toastrService?.error(this.hiError || 'Failed to load HI dashboard');
        console.error('Error loading HI dashboard:', err);
      }
    });
  }

  refreshHiDashboard(): void {
    this.loadHiDashboard();
  }

  /** API response (keys kisi bhi case me ho sakti hain) -> typed objects */
  private mapHiResponse(d: any): void {
    const n = (o: any, k: string) => Number(this.getProp(o, k) ?? 0) || 0;

    const s = this.getProp(d, 'summary') || {};
    this.hiSummary = {
      totalVendors: n(s, 'TotalVendors'),
      verifiedVendors: n(s, 'VerifiedVendors'),
      pendingVerification: n(s, 'PendingVerification'),
      notInitiatedVendors: n(s, 'NotInitiatedVendors'),
      initiatedVendors: n(s, 'InitiatedVendors'),
      submittedVendors: n(s, 'SubmittedVendors'),
      reInitiatedVendors: n(s, 'ReInitiatedVendors'),
      activeVendors: n(s, 'ActiveVendors'),
      inactiveVendors: n(s, 'InactiveVendors'),
      averageCompletionPercentage: n(s, 'AverageCompletionPercentage')
    };

    const list = this.getProp(d, 'statusSummary') || [];
    this.hiStatusList = (Array.isArray(list) ? list : []).map((r: any) => ({
      status: String(this.getProp(r, 'OnboardingStatus') ?? ''),
      total: n(r, 'TotalVendors'),
      percentage: n(r, 'StatusPercentage')
    }));

    const p = this.getProp(d, 'pendingWork') || {};
    this.hiPending = {
      incompleteOnboardingVendors: n(p, 'IncompleteOnboardingVendors'),
      vendorsWithMissingDocuments: n(p, 'VendorsWithMissingDocuments'),
      vendorsPendingVerification: n(p, 'VendorsPendingVerification'),
      completedOnboardingVendors: n(p, 'CompletedOnboardingVendors')
    };

    // NEW: Top 5 vendors
    const tv = this.getProp(d, 'topVendors') || [];
    this.hiTopVendors = (Array.isArray(tv) ? tv : []).map((r: any) => ({
      vendorId: String(this.getProp(r, 'VendorId') ?? ''),
      vendorName: String(this.getProp(r, 'VendorName') ?? ''),
      onboardingStatus: String(this.getProp(r, 'OnboardingStatus') ?? ''),
      completionPercentage: n(r, 'CompletionPercentage'),
      activeStatus: String(this.getProp(r, 'ActiveStatus') ?? '')
    }));

    const h = this.hiSummary;
    this.hiKpis = [
      { label: 'Total Vendors',        value: h.totalVendors,          icon: 'fa-users',           color: 'primary',   sub: 'Under your locations' },
      { label: 'Verified',             value: h.verifiedVendors,       icon: 'fa-circle-check',    color: 'success',   sub: 'Onboarding verified' },
      { label: 'Pending Verification', value: h.pendingVerification,   icon: 'fa-user-clock',      color: 'danger',    sub: 'Submitted, awaiting you' },
      { label: 'Not Initiated',        value: h.notInitiatedVendors,   icon: 'fa-hourglass-start', color: 'warning',   sub: 'Onboarding not started' },
      { label: 'Initiated',            value: h.initiatedVendors,      icon: 'fa-play',            color: 'info',      sub: 'In progress' },
      { label: 'Re-Initiated',         value: h.reInitiatedVendors,    icon: 'fa-rotate-right',    color: 'secondary', sub: 'Sent back for correction' },
      { label: 'Active Vendors',       value: h.activeVendors,         icon: 'fa-user-check',      color: 'success',   sub: 'Inactive: ' + h.inactiveVendors },
      { label: 'Avg. Completion',      value: h.averageCompletionPercentage.toFixed(1) + '%', icon: 'fa-chart-pie', color: 'primary', sub: 'Profile completion' }
    ];

    const w = this.hiPending;
    this.hiPendingCards = [
      { label: 'Incomplete Onboarding', value: w.incompleteOnboardingVendors, icon: 'fa-list-check',        color: 'warning' },
      { label: 'Missing Documents',     value: w.vendorsWithMissingDocuments, icon: 'fa-file-circle-xmark', color: 'danger' },
      { label: 'Pending Verification',  value: w.vendorsPendingVerification,  icon: 'fa-user-clock',        color: 'info' },
      { label: 'Completed Onboarding',  value: w.completedOnboardingVendors,  icon: 'fa-circle-check',      color: 'success' }
    ];
  }

  getHiStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'not initiated': return '#ffa446';
      case 'initiated':     return '#20c9d8';
      case 'submitted':     return '#3080e8';
      case 'verified':      return '#54ca68';
      case 'reinitiated':
      case 're-initiated':  return '#dc3545';
      default:              return '#adb5bd';
    }
  }

  /** Vertical bar ki height (%). 0 count ho to bhi thodi si line dikhe, isliye min 2% */
  getHiBarHeight(percentage: number): number {
    const p = Number(percentage) || 0;
    return p <= 0 ? 2 : Math.min(p, 100);
  }

  /** Top 5 vendor table me status badge ka class */
  getHiVendorStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'verified':      return 'bg-success-subtle text-success border border-success';
      case 'submitted':     return 'bg-primary-subtle text-primary border border-primary';
      case 'initiated':     return 'bg-info-subtle text-info border border-info';
      case 'reinitiated':
      case 're-initiated':  return 'bg-danger-subtle text-danger border border-danger';
      default:              return 'bg-warning-subtle text-warning border border-warning'; // Not Initiated
    }
  }

  /** Completion % progress bar ka color class */
  getHiCompletionClass(pct: number): string {
    if (pct >= 100) return 'bg-success';
    if (pct >= 50)  return 'bg-info';
    if (pct > 0)    return 'bg-warning';
    return 'bg-danger';
  }

  // ===================== EXISTING VENDOR DASHBOARD (ELSE CASE) =====================

  initFilterForm(): void {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    this.filterForm = this.fb.group({
      client: [null],
      model: [null],
      month: [currentMonth.toString()],
      year: [currentYear.toString()],
      status: ['']
    });
  }

  loadDropdowns(): void {
    const currentMonthNum = new Date().getMonth() + 1;
    const currentYearNum = new Date().getFullYear();
    const compId = sessionStorage.getItem('companyId') || 'GU-1';

    forkJoin([
      this.vendorService.getDropdownList('Month').pipe(catchError(() => of({ isSuccess: false }))),
      this.vendorService.getDropdownList('Year').pipe(catchError(() => of({ isSuccess: false }))),
      this.vendorService.getDropdownList('Client').pipe(catchError(() => of({ isSuccess: false }))),
      this.vendorService.getDdlListBasedOnCodeType('4', compId).pipe(catchError(() => of({ isSuccess: false })))
    ]).subscribe({
      next: ([monthRes, yearRes, clientRes, modelRes]) => {
        if (monthRes && monthRes.isSuccess && Array.isArray(monthRes.data) && monthRes.data.length > 0) {
          this.months = [
            { name: 'All Months', value: '' },
            ...monthRes.data.map((m: any) => ({
              name: m.name || m.text || m.value,
              value: m.value?.toString() || m.id?.toString()
            }))
          ];
          const matchMonth = this.months.find(m => Number(m.value) === currentMonthNum);
          if (matchMonth) {
            this.filterForm.patchValue({ month: matchMonth.value });
          }
        }

        if (yearRes && yearRes.isSuccess && Array.isArray(yearRes.data) && yearRes.data.length > 0) {
          this.years = [
            { name: 'All Years', value: '' },
            ...yearRes.data.map((y: any) => ({
              name: y.name || y.text || y.value,
              value: y.value?.toString() || y.name?.toString()
            }))
          ];
          const matchYear = this.years.find(y => Number(y.value) === currentYearNum || y.name === currentYearNum.toString());
          if (matchYear) {
            this.filterForm.patchValue({ year: matchYear.value });
          }
        }

        if (clientRes && clientRes.isSuccess && Array.isArray(clientRes.data) && clientRes.data.length > 0) {
          this.clients = clientRes.data.map((c: any) => ({
            name: c.name || c.text || c.client_Name || c.value,
            value: c.value || c.id || c.clientId
          }));
          this.totalClients = this.clients.length;
        }

        const defaultModelsMaster = [
          { value: '1', name: 'Flipkart: ODH-MDH', displayName: 'ODH-MDH', clientName: 'flipkart' },
          { value: '2', name: 'Flipkart: XRM', displayName: 'XRM', clientName: 'flipkart' },
          { value: '3', name: 'Flipkart: Large', displayName: 'Large', clientName: 'flipkart' },
          { value: '4', name: 'Amazon: DSP', displayName: 'DSP', clientName: 'amazon' },
          { value: '5', name: 'Amazon: EDSP', displayName: 'EDSP', clientName: 'amazon' },
          { value: '6', name: 'Amazon: ESDP', displayName: 'ESDP', clientName: 'amazon' },
          { value: '7', name: 'Shiprocket: B2C Delivery', displayName: 'B2C Delivery', clientName: 'shiprocket' },
          { value: '8', name: 'Airtel: FSE-Pickup', displayName: 'FSE-Pickup', clientName: 'airtel' },
          { value: '9', name: 'Ebees: LMD (Delivery & Pickup)', displayName: 'LMD (Delivery & Pickup)', clientName: 'ebees' },
          { value: '10', name: 'Blue Dart: LMD (Forward Delivery)', displayName: 'LMD (Forward Delivery)', clientName: 'bluedart' }
        ];

        if (modelRes && modelRes.isSuccess && Array.isArray(modelRes.data) && modelRes.data.length > 0) {
          this.allModels = modelRes.data.map((m: any) => {
            let cleanName = m.name || '';
            if (cleanName.includes(':')) {
              cleanName = cleanName.split(':')[1]?.trim() || cleanName;
            }
            return {
              value: m.value?.toString(),
              name: m.name,
              displayName: cleanName,
              clientId: m.companyId || m.clientId || m.parentId
            };
          });
        } else {
          this.allModels = defaultModelsMaster;
        }
        this.filteredModels = [...this.allModels];
        this.totalModels = this.allModels.length;

        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error fetching dropdown lists from General/Payroll API:', err);
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    this.loader.start();

    const formValues = this.filterForm?.value || {};
    const selectedMonth = formValues.month || '';
    const selectedYear = formValues.year || '';

    // 1. Fetch live metrics from Backend
    this.vendorService.getVendorDashboardSummary(selectedMonth, selectedYear).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data) {
          const d = res.data;
          this.totalClients = this.clients.length || d.totalClients || d.TotalClients || 6;
          this.totalModels = this.allModels.length || d.totalModels || d.TotalModels || 4;
        }
      },
      error: (err) => console.error('Error fetching dashboard summary counts:', err)
    });

    // 2. Fetch full vendor list for grid & deep filtering
    this.vendorService.getAllVendors(1, 1000, '').subscribe({
      next: (res) => {
        this.loading = false;
        this.loader.stop();
        if (res && res.isSuccess) {
          const data = res.data;
          this.allVendors = data?.vendors || data?.Vendors || [];
          this.totalVendors = data?.totalCount || data?.TotalCount || this.allVendors.length;

          // Populate clients list dynamically if not populated
          if ((!this.clients || this.clients.length === 0) && this.allVendors.length > 0) {
            const clientMap = new Map<string, string>();
            this.allVendors.forEach(v => {
              const cName = v.clientName || v.client_Name;
              const cId = v.clientId || v.fk_clientID || cName;
              if (cName && cId) {
                clientMap.set(cId.toString(), cName.toString());
              }
            });
            if (clientMap.size > 0) {
              this.clients = Array.from(clientMap.entries()).map(([value, name]) => ({ name, value }));
            }
          }

          this.applyFilters();
          this.cdr.detectChanges();
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initChart(), 100);
          }
        } else {
          this.error = res?.message || 'Failed to load vendor dashboard data';
        }
      },
      error: (err) => {
        this.loading = false;
        this.loader.stop();
        this.error = 'Failed to load vendor dashboard data';
        this.toastrService?.error('Failed to load vendor dashboard data');
        console.error('Error loading vendor dashboard:', err);
      }
    });
  }

  getModelsForClient(clientId: any): any[] {
    if (!clientId) {
      return [...this.allModels];
    }
    const selectedClient = this.clients.find(c => c.value?.toString() === clientId?.toString());
    const clientName = (selectedClient?.name || clientId?.toString() || '').toLowerCase();

    if (clientName.includes('flipkart')) {
      const kw = ['ODH', 'XRM', 'LARGE', 'FLIPKART'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'flipkart');
    } else if (clientName.includes('amazon')) {
      const kw = ['DSP', 'EDSP', 'ESDP', 'AMAZON'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'amazon');
    } else if (clientName.includes('shiprocket')) {
      const kw = ['B2C', 'SHIPROCKET'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'shiprocket');
    } else if (clientName.includes('airtel')) {
      const kw = ['FSE', 'AIRTEL'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'airtel');
    } else if (clientName.includes('ebees')) {
      const kw = ['EBEES', 'EB_', 'EB:', 'LMD'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'ebees');
    } else if (clientName.includes('bluedart') || clientName.includes('blue dart')) {
      const kw = ['BLUEDART', 'BD_', 'BD:', 'BLUE', 'LMD'];
      const res = this.allModels.filter(m => kw.some(k => ((m.displayName || '') + ' ' + (m.name || '')).toUpperCase().includes(k)));
      return res.length > 0 ? res : this.allModels.filter(m => m.clientName === 'bluedart');
    }

    const filtered = this.allModels.filter(m =>
      (m.clientId && m.clientId.toString() === clientId.toString()) ||
      (clientName && m.name && m.name.toLowerCase().includes(clientName))
    );
    return filtered.length > 0 ? filtered : this.allModels;
  }

  // Handle Client selection change -> Cascades and filters Models dynamically
  onClientChange(selectedClient: any): void {
    const clientId = this.filterForm.get('client')?.value;
    this.filterForm.patchValue({ model: null });

    if (!clientId) {
      this.filteredModels = [...this.allModels];
    } else {
      this.filteredModels = this.getModelsForClient(clientId);
    }

    this.onSelectionChange();
  }

  onSelectionChange(): void {
    const formValues = this.filterForm?.value || {};
    const selectedMonth = formValues.month || '';
    const selectedYear = formValues.year || '';

    // Re-fetch backend summary with new month/year
    this.vendorService.getVendorDashboardSummary(selectedMonth, selectedYear).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data) {
          const d = res.data;
          this.totalClients = this.clients.length || d.totalClients || d.TotalClients || 6;
          this.totalModels = this.allModels.length || d.totalModels || d.TotalModels || 4;
        }
      }
    });

    this.applyFilters();
    this.cdr.detectChanges();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 100);
    }
  }

  parseDate(dateVal: any): Date | null {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;

    const s = dateVal.toString().trim();

    // 1. Check for YYYYMMDD format (e.g. "20260917" or 20260917)
    if (/^\d{8}$/.test(s)) {
      const y = parseInt(s.substring(0, 4), 10);
      const m = parseInt(s.substring(4, 6), 10) - 1;
      const d = parseInt(s.substring(6, 8), 10);
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 2. Check for DD/MM/YYYY or DD-MM-YYYY format
    const ddmmyyyyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (ddmmyyyyMatch) {
      const d = parseInt(ddmmyyyyMatch[1], 10);
      const m = parseInt(ddmmyyyyMatch[2], 10) - 1;
      const y = parseInt(ddmmyyyyMatch[3], 10);
      const dt = new Date(y, m, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    // 3. Standard ISO String / Date parser
    const dt = new Date(s);
    return isNaN(dt.getTime()) ? null : dt;
  }

  extractDate(v: any): Date | null {
    return this.parseDate(
      v.insDate ||
      v.createdDate ||
      v.createdOn ||
      v.vendor_RegistrationDate ||
      v.registrationDate ||
      v.fk_insDateID ||
      v.insDateID
    );
  }

  isVendorMapped(v: any): boolean {
    const fhrid = v.vendor_HFRID || v.Vendor_HFRID || v.fhrid || v.fHRID || v.FHRID;
    const clientId = v.vendor_FKClientId || v.Vendor_FKClientId || v.clientId || v.fk_clientID;
    const modelId = v.vendor_FK_ModelId || v.Vendor_FK_ModelId || v.modelId;
    const isMappedFlag = v.isMapped ?? v.IsMapped;

    if (isMappedFlag === true || isMappedFlag === 1 || isMappedFlag === '1') return true;
    if (isMappedFlag === false || isMappedFlag === 0 || isMappedFlag === '0') return false;

    return !!(fhrid && fhrid.toString().trim() !== '' && fhrid.toString().trim() !== '0') ||
      !!(clientId && modelId);
  }

  isVendorActive(v: any): boolean {
    if (!v) return false;
    if (v.isActive === false || v.isActive === 0 || v.isActive === '0' || v.isActive === 'false' || v.IsActive === false || v.IsActive === 0 || v.IsActive === '0') {
      return false;
    }
    const st = (v.status || '').toString().toLowerCase().trim();
    if (st === 'inactive' || st === 'disabled' || st === 'blocked' || st === 'deleted') {
      return false;
    }
    return true;
  }

  isVendorVerified(v: any): boolean {
    const st = (v.vendor_Status || v.Vendor_Status || v.status || '').toString().toLowerCase().trim();
    return st === 'verified' || st === 'active';
  }

  sortLatestVendors(list: any[]): any[] {
    return (list || []).slice().sort((a, b) => {
      const dtA = this.extractDate(a);
      const dtB = this.extractDate(b);
      if (dtA && dtB) {
        return dtB.getTime() - dtA.getTime();
      }
      const idA = Number((a.pk_recId || a.id || '0').toString().replace(/\D/g, '')) || 0;
      const idB = Number((b.pk_recId || b.id || '0').toString().replace(/\D/g, '')) || 0;
      if (idA && idB) {
        return idB - idA;
      }
      return 0;
    });
  }

  applyFilters(): void {
    const formValues = this.filterForm?.value || {};
    const selMonthStr = formValues.month ? formValues.month.toString().trim() : '';
    const selYearStr = formValues.year ? formValues.year.toString().trim() : '';
    const selMonthNum = selMonthStr ? parseInt(selMonthStr, 10) : NaN;
    const selYearNum = selYearStr ? parseInt(selYearStr, 10) : NaN;
    const selStatus = (formValues.status || '').toLowerCase().trim();
    const selClient = formValues.client ? formValues.client.toString().trim().toLowerCase() : null;
    const selModel = formValues.model ? formValues.model.toString().trim().toLowerCase() : null;

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfThisWeek);

    let activeCount = 0;
    let inactiveCount = 0;
    let pendingCount = 0;
    let mappedCount = 0;
    let unmappedCount = 0;
    let verifiedCount = 0;
    let notVerifiedCount = 0;
    let totalPayableSum = 0;
    let thisWeekCount = 0;
    let lastWeekCount = 0;
    let pendingApprovalsCount = 0;

    const distinctClients = new Set<string>();
    const activeClientsSet = new Set<string>();
    const distinctModels = new Set<string>();

    this.filteredVendors = [];
    this.timeline = [];

    this.allVendors.forEach((v) => {
      const dateObj = this.extractDate(v);
      const isMapped = this.isVendorMapped(v);
      const isVerified = this.isVendorVerified(v);
      const statusFormatted = this.formatStatus(v.status || v.vendor_Status || v.isActive).toLowerCase();

      // Collect distinct clients and models
      const cName = v.clientName || v.client_Name || v.clientId || v.fk_clientID;
      const mName = v.modelName || v.model_Name || v.modelId || v.vendor_FK_ModelId;
      if (cName) {
        const clientKey = cName.toString().trim().toLowerCase();
        distinctClients.add(clientKey);
        if (statusFormatted === 'active' || isVerified || isMapped) {
          activeClientsSet.add(clientKey);
        }
      }
      if (mName) distinctModels.add(mName.toString());

      // Payable amount calculation
      const payableVal = Number(v.totalPayable || v.payableAmount || v.netPayable || v.amount || v.vendor_Rate || 0);
      if (!isNaN(payableVal)) {
        totalPayableSum += payableVal;
      }

      // Filter matches
      const matchesYear = isNaN(selYearNum) || !selYearNum || !dateObj || dateObj.getFullYear() === selYearNum;
      const matchesMonth = isNaN(selMonthNum) || !selMonthNum || !dateObj || (dateObj.getMonth() + 1 === selMonthNum);

      let matchesStatus = true;
      if (selStatus) {
        if (selStatus === 'mapped') {
          matchesStatus = isMapped;
        } else if (selStatus === 'unmapped') {
          matchesStatus = !isMapped;
        } else if (selStatus === 'verified') {
          matchesStatus = isVerified;
        } else if (selStatus === 'pending') {
          matchesStatus = statusFormatted.includes('pending') || statusFormatted.includes('initiated');
        } else {
          matchesStatus = statusFormatted.includes(selStatus);
        }
      }

      const vClientId = (v.clientId || v.fk_clientID || v.vendor_FKClientId || '').toString().toLowerCase();
      const vClientName = (v.client_Name || v.clientName || '').toString().toLowerCase();
      const matchesClient = !selClient || vClientId === selClient || vClientName.includes(selClient);

      const vModelId = (v.modelId || v.vendor_FK_ModelId || '').toString().toLowerCase();
      const vModelName = (v.modelName || v.model_Name || '').toString().toLowerCase();
      const matchesModel = !selModel || vModelId === selModel || vModelName.includes(selModel);

      if (matchesYear && matchesMonth && matchesStatus && matchesClient && matchesModel) {
        this.filteredVendors.push(v);

        if (isMapped) mappedCount++;
        else unmappedCount++;

        if (isVerified) verifiedCount++;
        else notVerifiedCount++;

        const isAct = this.isVendorActive(v);
        if (isAct) {
          activeCount++;
        } else if (statusFormatted === 'initiated' || statusFormatted === 'pending' || statusFormatted === 'in progress') {
          pendingCount++;
        } else {
          inactiveCount++;
        }

        if (dateObj) {
          if (dateObj >= startOfThisWeek) {
            thisWeekCount++;
          } else if (dateObj >= startOfLastWeek && dateObj < endOfLastWeek) {
            lastWeekCount++;
          }
        }

        if (statusFormatted === 'pending' || statusFormatted === 'initiated') {
          pendingApprovalsCount++;
        }

        this.timeline.push({
          pk_recId: v.pk_recId || v.id || '',
          name: v.vendor_Name || v.vendorName || v.name || 'N/A',
          vendorCode: v.vendor_Code || v.vendorCode || 'N/A',
          email: v.email || v.vendor_Email || v.contact_Email || 'N/A',
          mobile: v.mobile || v.vendor_Mobile || v.contact_No || 'N/A',
          status: this.formatStatus(v.status || v.vendor_Status || v.isActive),
          isMapped: isMapped,
          regDate: dateObj ? dateObj.toLocaleDateString('en-GB') : ''
        });
      }
    });

    let totalClientsCount: number;
    let activeClientsCount: number;

    if (selClient) {
      totalClientsCount = 1;
      const hasActive = this.filteredVendors.some(v =>
        this.formatStatus(v.status || v.vendor_Status || v.isActive).toLowerCase() === 'active' ||
        this.isVendorVerified(v) ||
        this.isVendorMapped(v)
      );
      activeClientsCount = hasActive ? 1 : 0;
    } else {
      totalClientsCount = this.clients.length > 0 ? this.clients.length : (distinctClients.size || 6);
      activeClientsCount = activeClientsSet.size > 0 ? activeClientsSet.size : 2;
    }

    let totalModelsCount: number;
    if (selModel) {
      totalModelsCount = 1;
    } else if (selClient) {
      const cModels = this.getModelsForClient(selClient);
      totalModelsCount = cModels.length > 0 ? cModels.length : 1;
    } else {
      totalModelsCount = this.allModels.length > 0 ? this.allModels.length : 10;
    }

    this.totalClients = totalClientsCount;
    this.totalModels = totalModelsCount;

    this.stats = {
      active: activeCount,
      inactive: inactiveCount,
      pending: pendingCount,
      total: this.filteredVendors.length,
      totalClients: totalClientsCount,
      activeClients: activeClientsCount,
      totalModels: totalModelsCount,
      mappedVendors: mappedCount,
      unmappedVendors: unmappedCount,
      verifiedVendors: verifiedCount,
      notVerifiedVendors: notVerifiedCount,
      totalPayableAmount: totalPayableSum
    };

    this.weeklySummary = {
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      pendingApprovals: pendingApprovalsCount
    };

    this.recentVendors = this.sortLatestVendors(this.filteredVendors).slice(0, 5);
  }

  get tableVendorList(): any[] {
    return this.sortLatestVendors(this.filteredVendors).slice(0, 5);
  }

  // Row selection handler & loads rate cards/linked FHRID for selected vendor
  selectVendor(vendor: any): void {
    if (this.selectedVendor?.pk_recId === vendor.pk_recId) {
      this.selectedVendor = null;
      this.selectedVendorFHRDetails = [];
      return;
    }

    this.selectedVendor = vendor;
    this.loadSelectedVendorRateCards(vendor.pk_recId);
  }

  loadSelectedVendorRateCards(pk_recId: string): void {
    if (!pk_recId) {
      this.selectedVendorFHRDetails = [];
      return;
    }

    this.selectedVendorFHRDetails = [];
    this.isLoadingRateCards = true;

    this.vendorService.getVendorFHRIDHistory(pk_recId, 1, 50).subscribe({
      next: (res) => {
        this.isLoadingRateCards = false;
        let rawData = [];
        if (res && res.isSuccess && res.data) {
          rawData = res.data.list || res.data.vendors || [];
        } else {
          rawData = Array.isArray(res) ? res : (res && res.data ? res.data : []);
        }

        if (rawData && rawData.length > 0) {
          this.selectedVendorFHRDetails = rawData.map((item: any) => {
            const rates = [];
            const normal = this.getRateConfig(item, 'Normal', 'Normal');
            if (normal) rates.push(normal);
            const pickup = this.getRateConfig(item, 'Pickup', 'Pickup');
            if (pickup) rates.push(pickup);
            const mfn = this.getRateConfig(item, 'MFN', 'MFN');
            if (mfn) rates.push(mfn);
            const van = this.getRateConfig(item, 'Van', 'Van');
            if (van) rates.push(van);
            const u2s = this.getRateConfig(item, 'U2S', 'U2S');
            if (u2s) rates.push(u2s);
            const shopsy = this.getRateConfig(item, 'Shopsy', 'Shopsy', 'Shopsy_Rate');
            if (shopsy) rates.push(shopsy);
            const prexo = this.getRateConfig(item, 'Prexo', 'Prexo');
            if (prexo) rates.push(prexo);
            const grocery = this.getRateConfig(item, 'Grocery', 'Grocery');
            if (grocery) rates.push(grocery);
            const rto = this.getRateConfig(item, 'Rto', 'Rto', 'Rto_Rate');
            if (rto) rates.push(rto);
            const dto = this.getRateConfig(item, 'Dto', 'Dto', 'Dto_Rate');
            if (dto) rates.push(dto);
            const fm = this.getRateConfig(item, 'Fm', 'Fm', 'Fm_Rate');
            if (fm) rates.push(fm);

            return {
              name: item.FHRID || item.fHRID || item.fhrid || item.vendor_HFRID || 'N/A',
              clientName: item.ClientName || item.clientName || 'Flipkart',
              modelName: item.ModelName || item.modelName || 'ODH-MDH',
              location: item.LocationName || item.locationName || item.location || 'N/A',
              effectiveFrom: item.EffectiveFrom || item.effectiveFrom || item.insDate || '',
              vehicleTypeName: item.Large_VehicleTypeName || item.large_VehicleTypeName || item.VehicleTypeName || item.vehicleTypeName || '',
              isActive: item.IsActive ?? item.isActive ?? true,
              rates: rates
            };
          });
        } else if (this.selectedVendor) {
          const rType = this.selectedVendor.vendor_RateType || this.selectedVendor.Vendor_RateType;
          const rVal = this.selectedVendor.vendor_Rate || this.selectedVendor.Vendor_Rate;
          const fhr = this.selectedVendor.vendor_HFRID || this.selectedVendor.fhrid;
          if (rType || rVal || fhr) {
            const isSlab = String(rType || '').toLowerCase().includes('slab');
            const isFixed = String(rType || '').toLowerCase().includes('fixed');
            this.selectedVendorFHRDetails = [{
              name: fhr || 'Master FHR',
              clientName: this.selectedVendor.clientName || this.selectedVendor.client_Name || 'Flipkart',
              modelName: this.selectedVendor.modelName || this.selectedVendor.model_Name || 'ODH-MDH',
              location: this.selectedVendor.cityName || this.selectedVendor.stateName || 'Assigned Location',
              effectiveFrom: this.selectedVendor.vendor_RegistrationDate || new Date(),
              vehicleTypeName: this.selectedVendor.vehicleTypeName || '',
              isActive: true,
              rates: [{
                label: 'Standard',
                type: rType || 'Fixed',
                isFixed: isFixed || !isSlab,
                isSlab: isSlab,
                value: rVal || '0'
              }]
            }];
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingRateCards = false;
        this.cdr.detectChanges();
      }
    });
  }

  getProp(obj: any, key: string): any {
    if (!obj) return null;
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    const lKey = key.toLowerCase();
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === lKey) return obj[k];
    }
    return null;
  }

  getRateConfig(item: any, label: string, prefix: string, valKey: string = prefix + '_Rate'): any {
    const type = this.getProp(item, prefix + '_RateType');
    if (!type) return null;

    const isSlab = (type || '').toString().toLowerCase() === 'slab';
    const isFixed = (type || '').toString().toLowerCase() === 'fixed';

    let val = '';
    if (isSlab) {
      val = this.getProp(item, prefix + '_SlabExpr');
    } else {
      val = this.getProp(item, valKey);
    }

    return {
      label: label,
      type: type,
      isFixed: isFixed,
      isSlab: isSlab,
      value: val
    };
  }

  formatStatus(statusVal: any): string {
    if (statusVal === true || statusVal === '1' || statusVal === 1 || String(statusVal).toLowerCase() === 'active' || String(statusVal).toLowerCase() === 'verified') {
      return 'Active';
    }
    if (String(statusVal).toLowerCase() === 'pending' || String(statusVal).toLowerCase() === 'initiated') {
      return 'Initiated';
    }
    if (String(statusVal).toLowerCase() === 'in progress') {
      return 'In Progress';
    }
    return 'Inactive';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success-subtle text-success border border-success';
      case 'In Progress':
        return 'bg-info-subtle text-info border border-info';
      case 'Pending':
      case 'Initiated':
        return 'bg-warning-subtle text-warning border border-warning';
      default:
        return 'bg-danger-subtle text-danger border border-danger';
    }
  }

  getAvatarColor(index: number): string {
    const colors = ['avatar-blue', 'avatar-green', 'avatar-orange', 'avatar-purple', 'avatar-teal', 'avatar-red'];
    return colors[index % colors.length];
  }

  getInitial(name: string): string {
    return (name || 'V').trim().charAt(0).toUpperCase();
  }

  // Chart.js Donut — Mapped vs Unmapped & Verified
  initChart(): void {
    const canvas = document.getElementById('vendorChartDiv') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const data = [this.stats.mappedVendors, this.stats.unmappedVendors, this.stats.pending];
    const total = data.reduce((s, v) => s + v, 0);
    const THRESHOLD = 0.04;

    const datalabelsPlugin = {
      id: 'customDatalabels',
      afterDatasetDraw(chart: any) {
        const { ctx, data: chartData } = chart;
        const meta = chart.getDatasetMeta(0);
        const values: number[] = chartData.datasets[0].data;
        const sum = values.reduce((a: number, b: number) => a + b, 0);
        meta.data.forEach((arc: any, i: number) => {
          const pct = sum > 0 ? values[i] / sum : 0;
          if (pct < THRESHOLD) return;
          const { x, y } = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 3;
          ctx.fillText(`${Math.round(pct * 100)}%`, x, y);
          ctx.restore();
        });
      }
    };

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Mapped Vendors', 'Unmapped Vendors', 'Pending / Initiated'],
        datasets: [{
          data,
          backgroundColor: ['#54ca68', '#ffa446', '#20c9d8'],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              }
            }
          }
        },
        animation: { animateRotate: true, duration: 800 }
      },
      plugins: [datalabelsPlugin]
    });
  }

  // Action / Navigation handlers
  navigateToAddVendor(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_master_form']);
  }

  navigateToVendorList(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_master_form_list']);
  }

  navigateToVendorUpload(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_upload']);
  }

  navigateToRateCardUpload(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/ratecard_excel_upload']);
  }

  navigateToFhridMapping(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_fhrid_mapping_upload']);
  }

  navigateToTransactionList(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_transaction_list']);
  }

  navigateToDeductionEntry(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_deduction_entry']);
  }

  navigateToDeductionUpload(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_deduction_upload']);
  }

  navigateToRecoveryMIS(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_deduction_recovery_mis']);
  }

  navigateToRecoveryStrategy(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_recovery_strategy_config']);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
    this.toastrService?.info('Dashboard refreshed');
  }

  viewVendor(pk_recId: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!pk_recId) return;
    const encryptedId = this.encryptionService.encryptText(pk_recId);
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_master_form', encryptedId]);
  }




  exportExcel(): void {
    const listToExport = this.filteredVendors.length > 0 ? this.filteredVendors : this.allVendors;
    if (listToExport.length === 0) {
      this.toastrService?.warning('No vendor records found to export');
      return;
    }

    const exportRows = listToExport.map((v, i) => {
      const dt = this.extractDate(v);
      return {
        'Sr. No.': i + 1,
        'Vendor Code': v.vendor_Code || v.vendorCode || 'N/A',
        'Vendor Name': v.vendor_Name || v.vendorName || v.name || 'N/A',
        'Email': v.email || v.vendor_Email || 'N/A',
        'Client': v.clientName || v.client_Name || 'N/A',
        'Model': v.modelName || v.model_Name || 'N/A',
        'FHR ID': v.vendor_HFRID || v.fhrid || 'N/A',
        'Mapping Status': this.isVendorMapped(v) ? 'Mapped' : 'Unmapped',
        'Verification Status': this.isVendorVerified(v) ? 'Verified' : 'Not Verified',
        'GST No': v.gstNo || v.gst_No || v.vendor_GSTNo || 'N/A',
        'PAN No': v.panNo || v.pan_No || v.vendor_PANNo || 'N/A',
        'State / City': (v.stateName || v.state || '') + (v.cityName ? ', ' + v.cityName : ''),
        'Registration Date': dt ? dt.toLocaleDateString('en-GB') : '',
        'Status': this.formatStatus(v.status || v.vendor_Status || v.isActive)
      };
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendor Summary');
    XLSX.writeFile(wb, `Vendor_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.toastrService?.success('Vendor report exported successfully to Excel');
  }

  loadMenuPermissions(): void {
    // 1. Subscribe to reactive menu updates
    this.menuService.menu$.subscribe(menu => {
      if (menu && Array.isArray(menu)) {
        this.evaluateQuickActionPermissions(menu);
      }
    });

    // 2. Evaluate from existing cached storage first
    const currentMenu = this.menuService.getCurrentMenu();
    if (currentMenu && Array.isArray(currentMenu) && currentMenu.length > 0) {
      this.evaluateQuickActionPermissions(currentMenu);
    }

    // 3. Fetch fresh permissions from API to sync instantly if rights were modified
    this.menuService.getallMenubasedonUser().subscribe({
      next: (res: any) => {
        const menuData = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(menuData) && menuData.length > 0) {
          this.menuService.setMenu(menuData);
          this.evaluateQuickActionPermissions(menuData);
        }
      },
      error: (err) => {
        console.error('Error fetching latest user menu rights', err);
      }
    });
  }

  evaluateQuickActionPermissions(menu: any[]): void {
    if (!menu || !Array.isArray(menu) || menu.length === 0) {
      this.canAddVendor = false;
      this.canViewVendorList = false;
      this.canUploadVendor = false;
      this.canMapFhrid = false;
      this.canViewRateCards = false;
      this.canViewTransactionList = false;
      this.cdr.markForCheck();
      return;
    }

    // Strictly filter only assigned items (isAssigned must be 1 or true)
    const assigned = menu.filter(item => Number(item?.isAssigned) === 1 || item?.isAssigned === true);

    const matchesAny = (keywords: string[]): boolean => {
      return assigned.some(item => {
        const path = (item.pagepath || '').toLowerCase();
        const name = (item.webpagename || '').toLowerCase();
        const caption = (item.menucaption || '').toLowerCase();
        return keywords.some(kw => {
          const lowerKw = kw.toLowerCase();
          return path.includes(lowerKw) || name.includes(lowerKw) || caption.includes(lowerKw);
        });
      });
    };

    // Add Vendor
    this.canAddVendor = assigned.some(item => {
      const path = (item.pagepath || '').toLowerCase();
      const name = (item.webpagename || '').toLowerCase();
      const caption = (item.menucaption || '').toLowerCase();
      return (
        (path.includes('vendor_master_form') && !path.includes('vendor_master_form_list')) ||
        (name.includes('vendor_master_form') && !name.includes('vendor_master_form_list')) ||
        caption === 'add vendor' || caption === 'vendor master' || caption.includes('add vendor')
      );
    });

    // Vendor List
    this.canViewVendorList = matchesAny([
      'vendor_master_form_list',
      'vendor_master_list',
      'vendor_excel_list',
      'vendor list',
      'vendor master list'
    ]);

    // Vendor Upload
    this.canUploadVendor = matchesAny([
      'vendor_upload',
      'vendor_excel_upload',
      'vendor_excel_doc_upload',
      'vendor upload',
      'vendor excel upload'
    ]);

    // FHR ID Mapping
    this.canMapFhrid = matchesAny([
      'vendor_fhrid_mapping_upload',
      'fhrid',
      'fhr_id',
      'fhr id mapping'
    ]);

    // Rate Cards
    this.canViewRateCards = matchesAny([
      'ratecard_excel_upload',
      'common_rate_card',
      'amazon_dsp_rate_card',
      'ratecard',
      'rate_card',
      'rate cards',
      'rate card'
    ]);

    // Transaction List
    this.canViewTransactionList = matchesAny([
      'vendor_transaction_list',
      'vendor_transaction_upload',
      'vendor_transaction',
      'transaction list'
    ]);

    // Deduction Entry
    this.canDeductionEntry = matchesAny([
      'vendor_deduction_entry',
      'deduction_entry',
      'deduction entry'
    ]) || this.canViewTransactionList;

    // Recovery MIS
    this.canRecoveryMIS = matchesAny([
      'vendor_deduction_recovery_mis',
      'deduction_recovery',
      'recovery mis'
    ]) || this.canViewTransactionList;

    // Recovery Strategy
    this.canRecoveryStrategy = matchesAny([
      'vendor_recovery_strategy_config',
      'recovery_strategy',
      'recovery strategy',
      'strategy'
    ]) || this.canViewTransactionList;

    this.cdr.markForCheck();
  }

  exportPdf(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}