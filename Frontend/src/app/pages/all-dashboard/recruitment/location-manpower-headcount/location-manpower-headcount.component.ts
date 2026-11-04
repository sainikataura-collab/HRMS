import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as QRCode from 'qrcode';
import { AtsService } from '../../../../shared/services/ats.service';
import { LocationMasterService } from '../../user/services/location-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { environment } from '../../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';

export interface LocationMasterRecord {
  locationId: string;
  locationName: string;
  locationCode: string;
  state: string;
  zone: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  companyLogoUrl?: string;

  // Headcount & Buffer Master Metrics
  baseRequired: number;
  bufferPercentage: number;
  bufferHeadcount: number;
  totalTargetCapacity: number;

  lastUpdatedDate: string;
  lastUpdatedBy: string;
  remarks?: string;
}

@Component({
  selector: 'app-location-manpower-headcount',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './location-manpower-headcount.component.html',
  styleUrls: ['./location-manpower-headcount.component.scss']
})
export class LocationManpowerHeadcountComponent implements OnInit, OnDestroy {
  protected readonly Math = Math;
  private toastr = inject(ToastrService);
  private atsService = inject(AtsService);
  private locationMasterService = inject(LocationMasterService);
  private encryptionService = inject(EncryptionService);
  private loaderService = inject(NgxUiLoaderService);
  private cdr = inject(ChangeDetectorRef);

  // QR Code Modal & Printable Poster State
  showQrModal: boolean = false;
  qrModalLocation: LocationMasterRecord | null = null;
  qrCodeDataUrl: string = '';
  qrApplyUrl: string = '';
  qrToken: string = '';
  isGeneratingQr: boolean = false;

  // View Navigation State ('list' for main table, 'edit' or 'add' for dedicated page)
  currentView: 'list' | 'edit' | 'add' = 'list';

  // Buffer Preset Choices (matching ATS theme)
  presetOptions: number[] = [0, 5, 8, 10, 12, 15, 20];

  // Master Available Hub Directory (Dynamically loaded from company-specific Location_Mst)
  availableHubMasterList: any[] = [];

  // Search & Filter State
  searchQuery: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Access Rights
  canEditManpower: boolean = false;
  isAdmin: boolean = false;
  assignedLocationIds: string[] = [];

  // Master Records List
  allMasterRecords: LocationMasterRecord[] = [];
  filteredMasterRecords: LocationMasterRecord[] = [];

  // Summary Metrics
  totalRecordsCount: number = 0;
  totalBaseSanctioned: number = 0;
  totalBufferHeadcount: number = 0;
  totalTargetCapacity: number = 0;

  // Form Fields for Dedicated Add / Edit Page
  editingLocationId: string | null = null;
  formLocationId: string = '';
  formLocationName: string = '';
  formLocationCode: string = '';
  formState: string = '';

  formBaseRequired: number = 100;
  formBufferPercentage: number = 10;
  formRemarks: string = '';

  // Real-Time Computed Getters for Dedicated Form Page
  get formComputedBufferHeadcount(): number {
    return Math.ceil(Number(this.formBaseRequired || 0) * (Number(this.formBufferPercentage || 0) / 100));
  }

  get formComputedTargetCapacity(): number {
    return Number(this.formBaseRequired || 0) + this.formComputedBufferHeadcount;
  }

  get authorizedHubMasterList(): any[] {
    if (this.isAdmin || !this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return this.availableHubMasterList;
    }
    const filtered = this.availableHubMasterList.filter(h => this.isLocationAllowed(h));
    return filtered.length > 0 ? filtered : this.availableHubMasterList;
  }

  // Get list of hubs available for new registration
  get unassignedHubs(): any[] {
    return this.authorizedHubMasterList.filter(h => !this.authorizedMasterRecords.some(r => r.locationId === h.id));
  }

  ngOnInit(): void {
    const userId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || localStorage.getItem('userId') || localStorage.getItem('fk_UserID') || '';
    const role = (sessionStorage.getItem('role') || localStorage.getItem('role') || sessionStorage.getItem('usertype') || '').toUpperCase();
    this.isAdmin = role.includes('ADMIN') || role === 'S' || !role;

    if (userId) {
      this.atsService.getUserAccessRights(userId, 5).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data) {
            this.canEditManpower = !!(res.data.canEditManpower || res.data.CanEditManpower || this.isAdmin);
            this.assignedLocationIds = res.data.assignedLocationIds || res.data.AssignedLocationIds || [];
            this.recalculateSummary();
          } else {
            this.canEditManpower = this.isAdmin;
          }
        },
        error: () => {
          this.canEditManpower = this.isAdmin;
        }
      });
    } else {
      this.canEditManpower = true;
    }

    this.loadCompanyLocationsData();
  }

  // Helper to resolve company logo URL with local assets fallback
  resolveLogoUrl(logoName?: string): string {
    if (!logoName || !logoName.trim()) {
      return 'assets/Image/Logo/logo.png';
    }
    const clean = logoName.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('assets/')) {
      return clean;
    }
    const base = environment.baseURL1 || environment.baseURL || '';
    return `${base}/CandidateExperienceDetails/logoimages/${encodeURIComponent(clean)}`;
  }

  onLogoError(event: any): void {
    if (event?.target) {
      event.target.src = 'assets/Image/Logo/logo.png';
    }
  }

  // ── 1. LOAD COMPANY-SPECIFIC MASTER LOCATIONS FROM BACKEND ─────────────────────────
  loadCompanyLocationsData(): void {
    const rawCompanyId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';
    const userId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || localStorage.getItem('userId') || localStorage.getItem('fk_UserID') || '';

    // If companyId is purely non-numeric (e.g. company code string 'CJ'), use clean numeric ID or query global
    const cleanCompanyId = rawCompanyId.replace(/^GU-/i, '');
    const companyId = !isNaN(Number(cleanCompanyId)) && cleanCompanyId !== '' ? rawCompanyId : '';

    this.loaderService.start();
    // Primary: Query usp_REC_GetLocationManpowerList (joins Common_Client_Details & SAL_Company_Config)
    this.atsService.getLocationManpowerList(companyId).subscribe({
      next: (res) => {
        let locations = (res && res.data && res.data.length > 0) ? res.data : (Array.isArray(res) ? res : []);
        
        // If companyId query returned 0, try fetching global location manpower list
        if ((!locations || locations.length === 0) && companyId) {
          this.atsService.getLocationManpowerList('').subscribe({
            next: (allRes) => {
              const allLocs = (allRes && allRes.data && allRes.data.length > 0) ? allRes.data : [];
              if (allLocs.length > 0) {
                this.populateMasterRecords(allLocs, rawCompanyId);
              } else {
                this.fallbackLoadMasterData(userId, rawCompanyId);
              }
            },
            error: () => this.fallbackLoadMasterData(userId, rawCompanyId)
          });
          return;
        }

        if (locations.length > 0) {
          this.populateMasterRecords(locations, rawCompanyId);
        } else {
          this.fallbackLoadMasterData(userId, rawCompanyId);
        }
      },
      error: () => {
        this.fallbackLoadMasterData(userId, rawCompanyId);
      }
    });
  }

  private populateMasterRecords(locations: any[], companyId: string): void {
    this.loaderService.stop();
    this.availableHubMasterList = locations.map((loc: any) => ({
      id: String(loc.locationId || loc.id || loc.pk_locid || loc.code || ''),
      name: String(loc.locationName || loc.locname || loc.name || 'Hub').trim(),
      code: String(loc.locationCode || loc.code || 'HUB').trim(),
      zone: String(loc.zone || 'General Zone').trim(),
      state: String(loc.state || 'Operational Hub').trim(),
      companyId: loc.companyId || loc.fk_companyId || companyId,
      companyName: loc.companyName || 'Empower Logics HRMS',
      companyLogo: loc.companyLogo || ''
    }));

    this.allMasterRecords = locations.map((loc: any) => {
      const base = loc.baseRequired != null ? Number(loc.baseRequired) : (loc.baseDemand != null ? Number(loc.baseDemand) : 0);
      const buffer = loc.bufferPercentage != null ? Number(loc.bufferPercentage) : (loc.bufferPercent != null ? Number(loc.bufferPercent) : 0);
      const bufferCount = loc.bufferHeadcount != null ? Number(loc.bufferHeadcount) : (loc.bufferHeads != null ? Number(loc.bufferHeads) : Math.ceil(base * (buffer / 100)));
      const target = loc.totalTargetCapacity != null ? Number(loc.totalTargetCapacity) : (loc.targetCapacity != null ? Number(loc.targetCapacity) : (base + bufferCount));
      const compName = loc.companyName || 'Empower Logics HRMS';
      const compLogo = loc.companyLogo || '';

      return {
        locationId: String(loc.locationId || loc.id || loc.pk_locid || loc.code || ''),
        locationName: String(loc.locationName || loc.locname || loc.name || 'Hub').trim(),
        locationCode: String(loc.locationCode || loc.code || 'HUB').trim(),
        state: String(loc.state || 'Operational Hub').trim(),
        zone: String(loc.zone || 'General Zone').trim(),
        companyId: loc.companyId || loc.fk_companyId || companyId,
        companyName: compName,
        companyLogo: compLogo,
        companyLogoUrl: this.resolveLogoUrl(compLogo),
        baseRequired: base,
        bufferPercentage: buffer,
        bufferHeadcount: bufferCount,
        totalTargetCapacity: target,
        lastUpdatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastUpdatedBy: this.currentLoggedInUserName,
        remarks: loc.currentOccupied ? `${loc.currentOccupied} Active Employees` : 'Master Hub'
      };
    });

    this.recalculateSummary();
    this.cdr.markForCheck();
  }

  private fallbackLoadMasterData(userId: string, companyId: string): void {
    this.atsService.getRequisitionMasterData(userId, '', companyId).subscribe({
      next: (res) => {
        this.loaderService.stop();
        if (res && res.locations && Array.isArray(res.locations) && res.locations.length > 0) {
          this.availableHubMasterList = res.locations.map((loc: any) => ({
            id: String(loc.locationId || loc.id || loc.pk_locid || loc.code || ''),
            name: String(loc.locationName || loc.name || loc.locname || 'Hub').trim(),
            code: String(loc.code || loc.locationCode || 'HUB').trim(),
            zone: String(loc.zone || 'General Zone').trim(),
            state: String(loc.state || 'Operational Hub').trim(),
            companyId: loc.companyId || loc.fk_companyId || companyId,
            companyName: loc.companyName || 'Empower Logics HRMS',
            companyLogo: loc.companyLogo || ''
          }));

          this.allMasterRecords = res.locations.map((loc: any) => {
            const base = loc.baseDemand != null ? Number(loc.baseDemand) : (loc.baseRequired != null ? Number(loc.baseRequired) : 0);
            const buffer = loc.bufferPercent != null ? Number(loc.bufferPercent) : (loc.bufferPercentage != null ? Number(loc.bufferPercentage) : 0);
            const bufferCount = loc.bufferHeads != null ? Number(loc.bufferHeads) : (loc.bufferHeadcount != null ? Number(loc.bufferHeadcount) : Math.ceil(base * (buffer / 100)));
            const target = loc.targetCapacity != null ? Number(loc.targetCapacity) : (loc.totalTargetCapacity != null ? Number(loc.totalTargetCapacity) : (base + bufferCount));
            const compLogo = loc.companyLogo || '';

            return {
              locationId: String(loc.locationId || loc.id || loc.pk_locid || loc.code || ''),
              locationName: String(loc.locationName || loc.name || loc.locname || 'Hub').trim(),
              locationCode: String(loc.code || loc.locationCode || 'HUB').trim(),
              state: String(loc.state || 'Operational Hub').trim(),
              zone: String(loc.zone || 'General Zone').trim(),
              companyId: loc.companyId || loc.fk_companyId || companyId,
              companyName: loc.companyName || 'Empower Logics HRMS',
              companyLogo: compLogo,
              companyLogoUrl: this.resolveLogoUrl(compLogo),
              baseRequired: base,
              bufferPercentage: buffer,
              bufferHeadcount: bufferCount,
              totalTargetCapacity: target,
              lastUpdatedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              lastUpdatedBy: this.currentLoggedInUserName,
              remarks: loc.currentOccupied ? `${loc.currentOccupied} Active Employees` : 'Master Hub'
            };
          });

          this.recalculateSummary();
          this.cdr.markForCheck();
        } else {
          this.recalculateSummary();
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.loaderService.stop();
        this.recalculateSummary();
        this.cdr.markForCheck();
      }
    });
  }

  isLocationAllowed(recordOrId: any): boolean {
    if (this.isAdmin) {
      return true;
    }
    if (!this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return true;
    }
    const locId = typeof recordOrId === 'object' && recordOrId !== null
      ? (recordOrId.locationId || recordOrId.id || recordOrId.pk_locid || '')
      : (recordOrId || '');
    const locCode = typeof recordOrId === 'object' && recordOrId !== null
      ? (recordOrId.locationCode || recordOrId.code || '')
      : '';
    const locName = typeof recordOrId === 'object' && recordOrId !== null
      ? (recordOrId.locationName || recordOrId.name || recordOrId.locname || '')
      : '';

    const cleanTargetId = String(locId || '').trim().replace(/^GU-/i, '');
    const cleanTargetCode = String(locCode || '').trim().toLowerCase();
    const cleanTargetName = String(locName || '').trim().toLowerCase();

    return this.assignedLocationIds.some(assigned => {
      const assignedStr = String(assigned || '').trim();
      const cleanAssigned = assignedStr.replace(/^GU-/i, '');
      if (cleanAssigned === '0' || cleanAssigned.toLowerCase() === 'all' || cleanAssigned === '*') {
        return true;
      }
      if (cleanAssigned && cleanTargetId && cleanAssigned.toLowerCase() === cleanTargetId.toLowerCase()) return true;
      if (assignedStr.toLowerCase() === String(locId || '').trim().toLowerCase()) return true;
      if (cleanTargetCode && (assignedStr.toLowerCase() === cleanTargetCode || cleanAssigned.toLowerCase() === cleanTargetCode)) return true;
      if (cleanTargetName && (assignedStr.toLowerCase() === cleanTargetName || cleanAssigned.toLowerCase() === cleanTargetName)) return true;
      return false;
    });
  }

  get authorizedMasterRecords(): LocationMasterRecord[] {
    if (this.isAdmin || !this.assignedLocationIds || this.assignedLocationIds.length === 0) {
      return this.allMasterRecords;
    }
    const filtered = this.allMasterRecords.filter(r => this.isLocationAllowed(r));
    return filtered.length > 0 ? filtered : this.allMasterRecords;
  }

  // ── 2. RECALCULATE SUMMARY ────────────────────────────────────────────────
  recalculateSummary(): void {
    const baseList = this.authorizedMasterRecords;
    this.totalRecordsCount = baseList.length;
    this.totalBaseSanctioned = baseList.reduce((sum, r) => sum + r.baseRequired, 0);
    this.totalBufferHeadcount = baseList.reduce((sum, r) => sum + r.bufferHeadcount, 0);
    this.totalTargetCapacity = baseList.reduce((sum, r) => sum + r.totalTargetCapacity, 0);

    this.applyFilters();
  }

  // ── 3. FILTERING & PAGINATION ─────────────────────────────────────────────
  applyFilters(): void {
    let list = [...this.authorizedMasterRecords];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(l =>
        (l.locationName || '').toLowerCase().includes(q) ||
        (l.locationCode || '').toLowerCase().includes(q) ||
        (l.state || '').toLowerCase().includes(q) ||
        (l.locationId || '').toLowerCase().includes(q)
      );
    }

    this.filteredMasterRecords = list;
    this.totalPages = Math.ceil(this.filteredMasterRecords.length / this.pageSize) || 1;
    this.currentPage = 1;
  }

  get paginatedList(): LocationMasterRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMasterRecords.slice(start, start + this.pageSize);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
    }
  }

  // ── 4. DEDICATED PAGE NAVIGATION (ADD / EDIT) ───────────────────────────
  openAddPage(): void {
    if (!this.canEditManpower && !this.isAdmin) {
      this.toastr.warning('You do not have permission to add location manpower.', 'Access Restricted');
      return;
    }
    this.currentView = 'add';
    this.editingLocationId = null;

    // Pick first available hub or default
    const available = this.unassignedHubs[0] || this.availableHubMasterList[0];
    if (available) {
      this.onSelectHub(available.id);
    }

    this.formBaseRequired = 100;
    this.formBufferPercentage = 10;
    this.formRemarks = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEditPage(record: LocationMasterRecord): void {
    if (!this.canEditManpower && !this.isAdmin) {
      this.toastr.warning('You do not have permission to edit location manpower.', 'Access Restricted');
      return;
    }
    this.currentView = 'edit';
    this.editingLocationId = record.locationId;

    // Lock location identity (Cannot be altered in edit page)
    this.formLocationId = record.locationId;
    this.formLocationName = record.locationName;
    this.formLocationCode = record.locationCode;
    this.formState = record.state;

    // Load editable metrics
    this.formBaseRequired = record.baseRequired;
    this.formBufferPercentage = record.bufferPercentage;
    this.formRemarks = record.remarks || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.currentView = 'list';
    this.editingLocationId = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSelectHub(hubId: string): void {
    const found = this.availableHubMasterList.find(h => h.id === hubId);
    if (found) {
      this.formLocationId = found.id;
      this.formLocationName = found.name;
      this.formLocationCode = found.code;
      this.formState = found.state;
    }
  }

  selectBufferPreset(pct: number): void {
    this.formBufferPercentage = pct;
  }

  get currentLoggedInUserName(): string {
    return sessionStorage.getItem('username') ||
      localStorage.getItem('username') ||
      sessionStorage.getItem('name') ||
      localStorage.getItem('name') ||
      localStorage.getItem('fk_UserID') ||
      'Admin';
  }

  saveMasterRecord(): void {
    if (!this.canEditManpower && !this.isAdmin) {
      this.toastr.error('You do not have permission to modify location manpower.', 'Access Restricted');
      return;
    }

    if (!this.formLocationName || this.formBaseRequired < 1) {
      this.toastr.warning('Please select a valid location and enter a base headcount requirement.', 'Validation');
      return;
    }

    const bufferCount = this.formComputedBufferHeadcount;
    const target = this.formComputedTargetCapacity;
    const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const user = this.currentLoggedInUserName;
    const targetLocId = this.currentView === 'edit' && this.editingLocationId ? this.editingLocationId : this.formLocationId;

    const payload = {
      locationId: targetLocId,
      baseDemand: Number(this.formBaseRequired),
      bufferPercent: Number(this.formBufferPercentage),
      modifiedBy: user
    };

    // Invoke API to persist to Location_Mst via Location_Update_Manpower_Buffer SP
    this.loaderService.start();
    this.atsService.updateLocationManpowerBuffer(payload).subscribe({
      next: (res) => {
        this.loaderService.stop();
        if (res && res.success) {
          const idx = this.allMasterRecords.findIndex(r => r.locationId === targetLocId);
          if (idx !== -1) {
            this.allMasterRecords[idx] = {
              ...this.allMasterRecords[idx],
              baseRequired: Number(this.formBaseRequired),
              bufferPercentage: Number(this.formBufferPercentage),
              bufferHeadcount: bufferCount,
              totalTargetCapacity: target,
              lastUpdatedDate: dateStr,
              lastUpdatedBy: user,
              remarks: this.formRemarks
            };
          } else {
            const newRecord: LocationMasterRecord = {
              locationId: targetLocId || `LOC-${Date.now()}`,
              locationName: this.formLocationName,
              locationCode: this.formLocationCode || 'HUB',
              state: this.formState || 'Operational Hub',
              zone: 'General Zone',
              baseRequired: Number(this.formBaseRequired),
              bufferPercentage: Number(this.formBufferPercentage),
              bufferHeadcount: bufferCount,
              totalTargetCapacity: target,
              lastUpdatedDate: dateStr,
              lastUpdatedBy: user,
              remarks: this.formRemarks
            };
            this.allMasterRecords.unshift(newRecord);
          }

          this.toastr.success(res.message || `Location manpower updated for ${this.formLocationName} (${this.formLocationCode}). Target: ${target} Heads.`, 'Database Master Saved');
          this.recalculateSummary();
          this.backToList();
        } else {
          this.toastr.error(res?.message || 'Failed to update location manpower in database.', 'Save Failed');
        }
      },
      error: (err) => {
        this.loaderService.stop();
        console.error('Error updating location manpower:', err);
        // Fallback to local state update if offline
        const idx = this.allMasterRecords.findIndex(r => r.locationId === targetLocId);
        if (idx !== -1) {
          this.allMasterRecords[idx] = {
            ...this.allMasterRecords[idx],
            baseRequired: Number(this.formBaseRequired),
            bufferPercentage: Number(this.formBufferPercentage),
            bufferHeadcount: bufferCount,
            totalTargetCapacity: target,
            lastUpdatedDate: dateStr,
            lastUpdatedBy: user,
            remarks: this.formRemarks
          };
        }
        this.toastr.success(`Location manpower updated for ${this.formLocationName} (${this.formLocationCode}). Target: ${target} Heads.`, 'Local Master Saved');
        this.recalculateSummary();
        this.backToList();
      }
    });
  }

  deleteMasterRecord(record: LocationMasterRecord): void {
    if (!this.canEditManpower && !this.isAdmin) {
      this.toastr.error('You do not have permission to delete location manpower.', 'Access Restricted');
      return;
    }

    if (confirm(`Are you sure you want to delete the manpower master record for ${record.locationName} (${record.locationCode})?`)) {
      this.allMasterRecords = this.allMasterRecords.filter(r => r.locationId !== record.locationId);
      this.recalculateSummary();
      this.toastr.info(`Master record for ${record.locationName} deleted.`, 'Record Deleted');
    }
  }

  // ── 5. EXPORT TO CSV ──────────────────────────────────────────────────────
  exportMasterToCsv(): void {
    if (this.allMasterRecords.length === 0) {
      this.toastr.warning('No records to export.', 'Export');
      return;
    }

    const headers = ['Location ID', 'Location Name', 'Code', 'State', 'Zone', 'Base Sanctioned (Heads)', 'Buffer %', 'Buffer Headcount', 'Target Total Capacity', 'Last Updated Date', 'Last Updated By', 'Remarks'];
    const rows = this.allMasterRecords.map(r => [
      `"${r.locationId}"`,
      `"${r.locationName}"`,
      `"${r.locationCode}"`,
      `"${r.state}"`,
      `"${r.zone}"`,
      r.baseRequired,
      `${r.bufferPercentage}%`,
      r.bufferHeadcount,
      r.totalTargetCapacity,
      `"${r.lastUpdatedDate}"`,
      `"${r.lastUpdatedBy}"`,
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `REC_Location_Manpower_Master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.toastr.success('Location Manpower Master exported to CSV successfully.', 'Export Complete');
  }

  // ── 6. QR CODE POSTER MODAL & PRINT ACTIONS ─────────────────────────────
  async openQrModal(record: LocationMasterRecord): Promise<void> {
    this.isGeneratingQr = true;
    this.qrModalLocation = record;
    this.showQrModal = true;
    document.body.classList.add('modal-qr-open');

    try {
      const companyId = record.companyId || sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || sessionStorage.getItem('fk_companyId') || '';

      const payload = JSON.stringify({
        companyId: companyId,
        locationId: record.locationId,
        locationCode: record.locationCode,
        locationName: record.locationName,
        state: record.state,
        zone: record.zone,
        source: 'WALKIN_LOCATION_QR',
        timestamp: Date.now()
      });

      this.qrToken = this.encryptionService.encryptText(payload);

      // Base URL Hierarchy:
      // 1. window.__PUBLIC_PORTAL_URL__ (configured in main.ts)
      // 2. Fallback to current browser window.location.origin
      const configuredHost = ((window as any)?.__PUBLIC_PORTAL_URL__ || '').trim();
      const baseHost = configuredHost ? configuredHost.replace(/\/+$/, '') : window.location.origin;
      this.qrApplyUrl = `${baseHost}/#/public-apply/${this.qrToken}`;

      this.qrCodeDataUrl = await QRCode.toDataURL(this.qrApplyUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      this.toastr.error('Failed to generate QR code for this location.', 'QR Error');
    } finally {
      this.isGeneratingQr = false;
    }
  }

  closeQrModal(): void {
    this.showQrModal = false;
    this.qrModalLocation = null;
    this.qrCodeDataUrl = '';
    this.qrApplyUrl = '';
    this.qrToken = '';
    document.body.classList.remove('modal-qr-open');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-qr-open');
  }

  printQrPoster(): void {
    if (!this.qrCodeDataUrl || !this.qrModalLocation) {
      this.toastr.warning('QR code is not ready for printing.', 'Print');
      return;
    }

    const loc = this.qrModalLocation;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      this.toastr.error('Popup was blocked by your browser. Please allow popups to print the poster.', 'Print Error');
      return;
    }

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Walk-In QR Poster - ${loc.locationName} (${loc.locationCode})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .poster-sheet {
      width: 100%;
      max-width: 480px;
      border: 3px solid #0051d5;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: none;
      page-break-inside: avoid;
      overflow: hidden;
      text-align: center;
    }
    .top-header {
      background-color: #edf4fe;
      padding: 24px 20px 18px 20px;
      border-bottom: 1.5px solid #dbeafe;
    }
    .company-logo-wrap {
      margin-bottom: 10px;
    }
    .company-logo {
      max-height: 48px;
      max-width: 160px;
      object-fit: contain;
    }
    .hero-title {
      font-size: 28px;
      font-weight: 800;
      color: #0b1a30;
      letter-spacing: -0.5px;
      line-height: 1.15;
      margin-bottom: 4px;
    }
    .hero-subhindi {
      font-size: 14px;
      font-weight: 600;
      color: #0051d5;
    }
    .location-section {
      padding: 16px 20px 10px 20px;
    }
    .location-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 3px;
    }
    .loc-name {
      font-size: 20px;
      font-weight: 800;
      color: #0051d5;
    }
    .hub-pill {
      font-size: 13px;
      font-weight: 800;
      border: 2px solid #0051d5;
      color: #0051d5;
      background: #eff6ff;
      padding: 2px 9px;
      border-radius: 8px;
    }
    .walkin-sub {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
    .qr-section {
      padding: 10px 20px 12px 20px;
    }
    .qr-blue-frame {
      display: inline-block;
      border: 4px solid #0051d5;
      border-radius: 22px;
      padding: 12px;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 81, 213, 0.12);
    }
    .qr-image {
      width: 215px;
      height: 215px;
      display: block;
      border-radius: 12px;
    }
    .scan-cta {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 10px;
    }
    .steps-section {
      padding: 10px 28px 20px 28px;
      text-align: left;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }
    .step-item:last-child {
      margin-bottom: 0;
    }
    .step-badge {
      width: 28px;
      height: 28px;
      background-color: #0051d5;
      color: #ffffff;
      border-radius: 50%;
      font-size: 14px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .step-en {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
    .step-hi {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .dark-footer {
      background-color: #081528;
      padding: 14px 18px;
    }
    .footer-cards-row {
      display: flex;
      gap: 12px;
      justify-content: space-between;
    }
    .footer-info-card {
      flex: 1;
      background-color: #162844;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }
    .footer-card-icon {
      width: 34px;
      height: 34px;
      background-color: #0051d5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }
    .footer-card-label {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.1;
    }
    .footer-card-title {
      font-size: 13px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      margin: 2px 0;
    }
    .footer-card-sub {
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.1;
    }
  </style>
</head>
<body>
  <div class="poster-sheet">
    <!-- Top Header -->
    <div class="top-header">
      ${loc.companyLogoUrl ? `<div class="company-logo-wrap"><img src="${loc.companyLogoUrl}" alt="Logo" class="company-logo" onerror="this.style.display='none'"></div>` : ''}
      <h1 class="hero-title">Scan karo, Apply karo</h1>
      <div class="hero-subhindi">स्कैन करें और आज ही नौकरी के लिए अप्लाई करें</div>
    </div>

    <!-- Location -->
    <div class="location-section">
      <div class="location-row">
        <span class="loc-name">📍 ${loc.locationName}</span>
        <span class="hub-pill">${loc.locationCode}</span>
      </div>
      <div class="walkin-sub">Spot Hiring & Walk-In Application</div>
    </div>

    <!-- QR Code -->
    <div class="qr-section">
      <div class="qr-blue-frame">
        <img src="${this.qrCodeDataUrl}" alt="Walk-In QR Code" class="qr-image" />
      </div>
      <div class="scan-cta">Camera ya Google Lens se scan karein</div>
    </div>

    <!-- 3-Step Guide -->
    <div class="steps-section">
      <div class="step-item">
        <div class="step-badge">1</div>
        <div>
          <div class="step-en">Open camera or Google Lens</div>
          <div class="step-hi">कैमरा या गूगल लेंस खोलें</div>
        </div>
      </div>
      <div class="step-item">
        <div class="step-badge">2</div>
        <div>
          <div class="step-en">Scan this QR to see open jobs</div>
          <div class="step-hi">खुली नौकरियाँ देखने के लिए QR स्कैन करें</div>
        </div>
      </div>
      <div class="step-item">
        <div class="step-badge">3</div>
        <div>
          <div class="step-en">Enter name, mobile, Aadhaar & pick vendor</div>
          <div class="step-hi">नाम, मोबाइल, आधार भरें और वेंडर चुनें</div>
        </div>
      </div>
    </div>

    <!-- Dual-Card Navy Footer -->
    <div class="dark-footer">
      <div class="footer-cards-row">
        <!-- Card 1: Aadhaar -->
        <div class="footer-info-card">
          <div class="footer-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><line x1="15" y1="8" x2="17" y2="8"/><line x1="15" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>
          </div>
          <div>
            <div class="footer-card-label">Saath layein</div>
            <div class="footer-card-title">Aadhaar Card</div>
            <div class="footer-card-sub">आधार कार्ड साथ लाएँ</div>
          </div>
        </div>

        <!-- Card 2: HR Helpline -->
        <div class="footer-info-card">
          <div class="footer-card-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
          <div>
            <div class="footer-card-label">HR helpline</div>
            <div class="footer-card-title">+91 XXXXX XXXXX</div>
            <div class="footer-card-sub">मदद के लिए कॉल करें</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
        window.onafterprint = function() {
          window.close();
        };
      }, 250);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }

  copyQrLink(): void {
    if (!this.qrApplyUrl) return;
    navigator.clipboard.writeText(this.qrApplyUrl).then(() => {
      this.toastr.success('Walk-in application link copied to clipboard!', 'Link Copied');
    }).catch(() => {
      this.toastr.info(this.qrApplyUrl, 'Application Link');
    });
  }

  downloadQrImage(): void {
    if (!this.qrCodeDataUrl || !this.qrModalLocation) return;
    const a = document.createElement('a');
    a.href = this.qrCodeDataUrl;
    a.download = `QR_WalkIn_${this.qrModalLocation.locationCode || 'Hub'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toastr.success('QR code image downloaded.', 'Downloaded');
  }
}

