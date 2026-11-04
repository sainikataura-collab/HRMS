import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { VendorService } from '../Service/vendor.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { RouterModule } from '@angular/router';
import { DeductionTypeConfig, MODEL_ID_DEDUCTION_MAP } from '../vendor-deduction-entry/deduction-config';

@Component({
  selector: 'app-vendor-transaction-sync',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule, RouterModule],
  templateUrl: './vendor-transaction-sync.component.html',
  styleUrls: ['./vendor-transaction-sync.component.scss']
})
export class VendorTransactionSyncComponent implements OnInit {
  filterForm!: FormGroup;

  // Filter Dropdown Lists
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  allLinkedVendors: any[] = [];
  filteredVendors: any[] = [];
  transactionRanges: any[] = [];
  isVendorsLoading: boolean = false;

  // Model-specific Active Deduction Columns
  activeDeductionColumns: DeductionTypeConfig[] = [];

  // Grid Data & KPI State
  rows: any[] = [];
  totalVendors: number = 0;
  syncedCount: number = 0;
  pendingCount: number = 0;
  totalNetPayable: number = 0;
  totalRows: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  isLoaded: boolean = false;

  // Selection State (Persists across pagination)
  selectAll: boolean = false;
  selectedIds: Set<number> = new Set();
  selectedRowsMap: Map<number, any> = new Map();
  customRecoveryPercentMap: Map<number, number> = new Map();

  // Sync Confirmation Modal State
  showConfirmModal: boolean = false;
  syncAllPending: boolean = false;
  syncRemarks: string = '';

  // Deduction Itemized Drill-down Modal State
  isBreakdownModalOpen: boolean = false;
  isBreakdownLoading: boolean = false;
  selectedTxn: any = null;
  selectedColumnKey: string = '';
  selectedColumnLabel: string = '';
  breakdownEntries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commonService: ManualPunchBio,
    private dropdownService: DropdownService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadLocations();
    this.setupCascadingDropdowns();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      clientId: [null, Validators.required],
      modelId: [null, Validators.required],
      locationId: [null],
      vendor: [null],
      transactionRange: [null, Validators.required]
    });
  }

  private loadClients(): void {
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        this.clientList = res?.data || res || [];
      },
      error: () => this.toastr.error('Failed to load clients list.')
    });
  }

  private loadLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = data || [];
      },
      error: () => {
        this.locationList = [];
      }
    });
  }

  private setupCascadingDropdowns(): void {
    // 1. Client Changes -> reset Model, Range, Vendor
    this.filterForm.get('clientId')?.valueChanges.subscribe((clientId: any) => {
      this.filterForm.patchValue({
        modelId: null,
        transactionRange: null,
        vendor: null
      }, { emitEvent: false });

      this.modelList = [];
      this.transactionRanges = [];
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.activeDeductionColumns = [];
      this.rows = [];
      this.isLoaded = false;
      this.clearSelection();

      if (clientId) {
        this.loadModels(clientId);
      }
    });

    // 2. Model Changes -> reset Range, Vendor, load ranges, vendors, and dynamic deduction columns
    this.filterForm.get('modelId')?.valueChanges.subscribe((modelId: any) => {
      this.filterForm.patchValue({
        transactionRange: null,
        vendor: null
      }, { emitEvent: false });

      this.transactionRanges = [];
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.rows = [];
      this.isLoaded = false;
      this.clearSelection();

      const clientId = this.filterForm.get('clientId')?.value;
      if (clientId && modelId) {
        this.activeDeductionColumns = MODEL_ID_DEDUCTION_MAP[Number(modelId)] || [];
        this.loadTransactionRanges(clientId, modelId);
        this.loadLinkedVendors(clientId, modelId, this.filterForm.get('locationId')?.value);
      } else {
        this.activeDeductionColumns = [];
      }
    });

    // 3. Location Changes -> filter linked vendors
    this.filterForm.get('locationId')?.valueChanges.subscribe((locId: any) => {
      this.filterForm.patchValue({ vendor: null }, { emitEvent: false });
      const clientId = this.filterForm.get('clientId')?.value;
      const modelId = this.filterForm.get('modelId')?.value;
      if (clientId && modelId) {
        this.loadLinkedVendors(clientId, modelId, locId);
      }
    });
  }

  private loadModels(clientId: any): void {
    const cId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    this.clientService.getModelListByClient(cId || 0).subscribe({
      next: (res: any) => {
        this.modelList = res?.data || res || [];
      },
      error: () => this.toastr.error('Failed to load models list.')
    });
  }

  private loadTransactionRanges(clientId: any, modelId: any): void {
    const cId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    const mId = typeof modelId === 'object' ? (modelId?.value || modelId?.id) : modelId;
    this.vendorService.getVendorTransactionRanges(cId, mId).subscribe({
      next: (res: any) => {
        const raw = res?.data || res || [];
        this.transactionRanges = raw.map((r: any) => ({
          label: r.TransactionRange || r.transactionRange || r,
          value: r.TransactionRange || r.transactionRange || r
        }));
      },
      error: () => this.toastr.error('Failed to load transaction ranges.')
    });
  }

  private loadLinkedVendors(clientId: any, modelId: any, locationId?: string): void {
    const cId = Number(typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId);
    const mId = Number(typeof modelId === 'object' ? (modelId?.value || modelId?.id) : modelId);
    if (!cId || !mId) return;

    this.isVendorsLoading = true;
    this.vendorService.getLinkedVendors(cId, mId, locationId || '').subscribe({
      next: (res: any) => {
        this.isVendorsLoading = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.allLinkedVendors = res.data.map((item: any) => ({
            ...item,
            displayName: `${item.vendorCode} - ${item.vendorName} (${item.fhrid})`
          }));
          this.filteredVendors = [...this.allLinkedVendors];
        } else {
          this.allLinkedVendors = [];
          this.filteredVendors = [];
        }
      },
      error: () => {
        this.isVendorsLoading = false;
        this.allLinkedVendors = [];
        this.filteredVendors = [];
      }
    });
  }

  // =========================================================================
  // Grid Search & Pagination Logic
  // =========================================================================

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.toastr.warning('Please select Client, Model, and Transaction Range.', 'Missing Selection');
      return;
    }
    this.pageIndex = 1;
    this.loadSyncList(true); // fresh search resets selection
  }

  onReset(): void {
    this.filterForm.reset();
    this.modelList = [];
    this.transactionRanges = [];
    this.allLinkedVendors = [];
    this.filteredVendors = [];
    this.activeDeductionColumns = [];
    this.rows = [];
    this.isLoaded = false;
    this.clearSelection();
    this.totalVendors = 0;
    this.syncedCount = 0;
    this.pendingCount = 0;
    this.totalNetPayable = 0;
    this.totalRows = 0;
    this.searchTerm = '';
    this.toastr.info('Filters cleared.');
  }

  loadSyncList(resetSelection: boolean = false): void {
    if (resetSelection) {
      this.clearSelection();
    }

    const { clientId, modelId, locationId, vendor, transactionRange } = this.filterForm.value;
    const cId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    const mId = typeof modelId === 'object' ? (modelId?.value || modelId?.id) : modelId;
    const vCode = vendor ? (vendor.vendorCode || vendor.fhrid || vendor) : '';

    this.loader.start();
    this.vendorService.getTransactionSyncList(
      Number(cId),
      Number(mId),
      transactionRange,
      locationId || '',
      vCode,
      this.searchTerm,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess) {
          const d = res.data;
          this.rows = (d.rows || []).map((r: any) => {
            const customCap = this.customRecoveryPercentMap.get(r.TransactionID);
            const cap = customCap != null ? customCap : (r.RecoveryPercent != null ? Number(r.RecoveryPercent) : 100.00);
            return {
              ...r,
              RecoveryPercent: cap
            };
          });

          // Restore any custom RecoveryPercent edits on rows already selected or edited across pages
          this.rows.forEach(r => {
            if (this.customRecoveryPercentMap.has(r.TransactionID)) {
              this.recalculateRow(r);
            }
            if (this.selectedRowsMap.has(r.TransactionID)) {
              const saved = this.selectedRowsMap.get(r.TransactionID);
              if (saved && saved.RecoveryPercent != null) {
                r.RecoveryPercent = saved.RecoveryPercent;
                this.recalculateRow(r);
              }
              this.selectedRowsMap.set(r.TransactionID, r);
            }
          });

          this.totalVendors = d.totalVendors || 0;
          this.syncedCount = d.syncedCount || 0;
          this.pendingCount = d.pendingCount || 0;
          this.totalNetPayable = d.totalNetPayable || 0;
          this.totalRows = d.totalRows || 0;
          this.isLoaded = true;
          this.selectAll = this.isCurrentPageAllSelected;
        } else {
          this.rows = [];
          this.toastr.error(res?.message || 'Failed to fetch transaction sync list.');
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.rows = [];
        this.toastr.error(err?.error?.message || err?.message || 'Server error while fetching sync list.');
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadSyncList(false); // Preserve selections across pages!
  }

  onTableFilter(): void {
    this.pageIndex = 1;
    this.loadSyncList(false); // Preserve selections
  }

  // =========================================================================
  // Row Selection Logic (Multi-Page Persistent)
  // =========================================================================

  get pendingRows(): any[] {
    return (this.rows || []).filter(r => !this.isSynced(r));
  }

  get isCurrentPageAllSelected(): boolean {
    const pending = this.pendingRows;
    if (!pending || pending.length === 0) return false;
    return pending.every(r => this.selectedIds.has(r.TransactionID));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAll = checked;
    if (checked) {
      // Add all pending rows on current page to selection (preserves other pages)
      this.pendingRows.forEach(r => {
        this.selectedIds.add(r.TransactionID);
        this.selectedRowsMap.set(r.TransactionID, r);
      });
    } else {
      // Remove only current page pending rows from selection (preserves other pages)
      this.pendingRows.forEach(r => {
        this.selectedIds.delete(r.TransactionID);
        this.selectedRowsMap.delete(r.TransactionID);
      });
    }
  }

  toggleRow(row: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.add(row.TransactionID);
      this.selectedRowsMap.set(row.TransactionID, row);
    } else {
      this.selectedIds.delete(row.TransactionID);
      this.selectedRowsMap.delete(row.TransactionID);
    }
    this.selectAll = this.isCurrentPageAllSelected;
  }

  isSelected(row: any): boolean {
    return this.selectedIds.has(row.TransactionID);
  }

  clearSelection(): void {
    this.selectedIds.clear();
    this.selectedRowsMap.clear();
    this.selectAll = false;
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  isSynced(row: any): boolean {
    return row.IsDeductionsSynced === true || row.IsDeductionsSynced === 1;
  }

  // =========================================================================
  // Per-Row Recovery Cap % Recalculation
  // =========================================================================

  onRecoveryCapKeydown(event: KeyboardEvent): void {
    // Prevent '-', '+', 'e', 'E', and decimal point '.'
    if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onRecoveryCapInput(row: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // Strip non-digits and leading zeros
    let clean = input.value.replace(/\D/g, '').replace(/^0+/, '');

    if (clean === '') {
      input.value = '';
      return;
    }

    let val = parseInt(clean, 10);
    if (val > 100) val = 100;
    if (val < 1) val = 1;

    input.value = val.toString();
    row.RecoveryPercent = val;
    this.customRecoveryPercentMap.set(row.TransactionID, val);
    this.recalculateRow(row);

    if (this.selectedRowsMap.has(row.TransactionID)) {
      this.selectedRowsMap.set(row.TransactionID, row);
    }
  }

  onRecoveryCapPaste(row: any, event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digitsOnly = pasted.replace(/\D/g, '').replace(/^0+/, '');
    const input = event.target as HTMLInputElement;

    let num = parseInt(digitsOnly, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 100) num = 100;

    if (input) input.value = num.toString();
    row.RecoveryPercent = num;
    this.customRecoveryPercentMap.set(row.TransactionID, num);
    this.recalculateRow(row);

    if (this.selectedRowsMap.has(row.TransactionID)) {
      this.selectedRowsMap.set(row.TransactionID, row);
    }
  }

  onRecoveryCapBlur(row: any, event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    let val = parseInt(input.value, 10);
    if (isNaN(val) || val < 1) {
      val = 100; // Reset to 100 if user leaves empty or invalid
    } else if (val > 100) {
      val = 100;
    }

    input.value = val.toString();
    row.RecoveryPercent = val;
    this.customRecoveryPercentMap.set(row.TransactionID, val);
    this.recalculateRow(row);

    if (this.selectedRowsMap.has(row.TransactionID)) {
      this.selectedRowsMap.set(row.TransactionID, row);
    }

    // Auto-persist directly to database table Vendor_PaymentTransactions
    this.persistRowRecoveryCap(row);
  }

  persistRowRecoveryCap(row: any): void {
    if (!row || !row.TransactionID) return;
    const cap = Number(row.RecoveryPercent) || 100;
    this.vendorService.updateTransactionRecoveryPercent(row.TransactionID, cap).subscribe({
      next: () => {
        // Successfully persisted in database table Vendor_PaymentTransactions
      },
      error: () => {
        // Silently handled; custom cap is preserved in customRecoveryPercentMap and sync payload
      }
    });
  }

  onRecoveryPercentChange(row: any): void {
    if (row.RecoveryPercent == null || isNaN(row.RecoveryPercent)) {
      row.RecoveryPercent = 100;
    }
    if (row.RecoveryPercent < 1) row.RecoveryPercent = 1;
    if (row.RecoveryPercent > 100) row.RecoveryPercent = 100;
    this.customRecoveryPercentMap.set(row.TransactionID, row.RecoveryPercent);
    this.recalculateRow(row);
    if (this.selectedRowsMap.has(row.TransactionID)) {
      this.selectedRowsMap.set(row.TransactionID, row);
    }
    this.persistRowRecoveryCap(row);
  }

  recalculateRow(row: any): void {
    const earnings = row.Earnings_Post_GST != null 
      ? Number(row.Earnings_Post_GST) 
      : ((Number(row.Total_Payable_After_GST) || 0) - (Number(row.TDS_Amount) || 0));

    // Calculate sum of operational deductions (excluding Arrears)
    let operationalDeductions = 0;
    const opFields = ['Ded_Shipment', 'Ded_COD', 'Ded_Other', 'Ded_Insurance', 'Ded_SD', 'Ded_Welfare', 'Ded_Hold', 'Ded_KarmaLife', 'Ded_Rent', 'Ded_Advance', 'Ded_TNT'];
    let hasExplicitDed = false;
    for (const f of opFields) {
      if (row[f] != null && row[f] > 0) {
        operationalDeductions += Number(row[f]) || 0;
        hasExplicitDed = true;
      }
    }
    if (!hasExplicitDed && row.Total_Deductions != null) {
      operationalDeductions = Number(row.Total_Deductions) || 0;
    }

    const arrearsCredit = Number(row.Ded_Arrear) || 0;
    const broughtFwd = Number(row.CarryForwardDeficit_In) || 0;
    const netDeductionsOwed = operationalDeductions + broughtFwd - arrearsCredit;

    const recoveryPct = Number(row.RecoveryPercent) != null ? Number(row.RecoveryPercent) : 100.00;
    const maxAllowedRecovery = earnings <= 0 ? 0 : earnings * (recoveryPct / 100.0);

    if (netDeductionsOwed <= 0) {
      row.Net_Payable = earnings - netDeductionsOwed;
      row.CarryForwardDeficit_Out = 0;
    } else {
      const actualRecovered = Math.min(netDeductionsOwed, maxAllowedRecovery);
      row.Net_Payable = earnings - actualRecovered;
      row.CarryForwardDeficit_Out = netDeductionsOwed > maxAllowedRecovery ? (netDeductionsOwed - maxAllowedRecovery) : 0;
    }
  }

  // =========================================================================
  // Sync Confirmation & Execution
  // =========================================================================

  openSyncModal(syncAll: boolean): void {
    if (!syncAll && this.selectedIds.size === 0) {
      this.toastr.warning('Please select at least one vendor row to sync.', 'No Vendors Selected');
      return;
    }
    this.syncAllPending = syncAll;
    this.syncRemarks = '';
    this.showConfirmModal = true;
  }

  cancelSyncModal(): void {
    this.showConfirmModal = false;
    this.syncRemarks = '';
  }

  confirmSync(): void {
    this.showConfirmModal = false;
    const { clientId, modelId, locationId, transactionRange } = this.filterForm.value;
    const cId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    const mId = typeof modelId === 'object' ? (modelId?.value || modelId?.id) : modelId;

    const toIsoDateString = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
          return trimmed.substring(0, 10);
        }
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth() + 1).padStart(2, '0');
          const d = String(parsed.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } else if (val instanceof Date && !isNaN(val.getTime())) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, '0');
        const d = String(val.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return null;
    };

    let rawFrom: any = null;
    let rawTo: any = null;

    if (this.rows && this.rows.length > 0) {
      const targetRow = this.rows.find(r => this.selectedIds.has(r.TransactionID)) || this.rows[0];
      if (targetRow) {
        rawFrom = targetRow.FromDate;
        rawTo = targetRow.ToDate;
      }
    }

    if (!rawFrom || !rawTo) {
      if (transactionRange) {
        if (transactionRange.toLowerCase().includes('to')) {
          const parts = transactionRange.split(/to/i);
          rawFrom = parts[0]?.trim();
          rawTo = parts[1]?.trim();
        } else if (transactionRange.includes('-')) {
          const parts = transactionRange.split('-');
          rawFrom = parts[0]?.trim();
          rawTo = parts[1]?.trim();
        }
      }
    }

    const fromDate = toIsoDateString(rawFrom);
    const toDate = toIsoDateString(rawTo);

    let syncItems: any[] = [];
    if (this.syncAllPending) {
      const itemMap = new Map<number, number>();
      this.pendingRows.forEach(r => itemMap.set(Number(r.TransactionID), Number(r.RecoveryPercent) || 100));
      this.customRecoveryPercentMap.forEach((cap, tid) => itemMap.set(Number(tid), cap));
      syncItems = Array.from(itemMap.entries()).map(([transactionId, recoveryPercent]) => ({
        transactionId,
        recoveryPercent: Number(recoveryPercent) > 0 ? Number(recoveryPercent) : 100.00
      }));
    } else {
      syncItems = Array.from(this.selectedRowsMap.values()).map(r => ({
        transactionId: Number(r.TransactionID),
        recoveryPercent: Number(r.RecoveryPercent) > 0 ? Number(r.RecoveryPercent) : 100.00
      }));
    }

    const payload = {
      clientId: Number(cId),
      modelId: Number(mId),
      locationId: locationId || '',
      transactionRange: transactionRange,
      fromDate: fromDate,
      toDate: toDate,
      transactionIds: this.syncAllPending ? '' : Array.from(this.selectedIds).join(','),
      syncAll: this.syncAllPending,
      remarks: this.syncRemarks,
      syncItems: syncItems
    };

    this.loader.start();
    this.vendorService.syncVendorTransactions(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res?.isSuccess) {
          const updated = res?.data?.updatedCount ?? res?.data?.UpdatedCount ?? this.selectedCount;
          this.toastr.success(res?.message || `${updated} vendor transaction(s) synchronized successfully!`, 'Sync Complete');
          this.clearSelection();
          this.loadSyncList(true);
        } else {
          this.toastr.error(res?.message || 'Sync failed. Please try again.');
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.toastr.error(err?.error?.message || err?.message || 'Server error during transaction sync.');
      }
    });
  }

  // =========================================================================
  // Deduction Breakdown Drill-down Modal
  // =========================================================================

  openDeductionBreakdown(txn: any, columnKey: string = '', columnLabel: string = ''): void {
    const txnId = txn.TransactionID || txn.transactionId;
    if (!txnId) return;

    this.selectedTxn = txn;
    this.selectedColumnKey = columnKey;
    this.selectedColumnLabel = columnLabel || columnKey || 'Deductions';
    this.isBreakdownLoading = true;
    this.isBreakdownModalOpen = true;

    this.vendorService.getDeductionBreakdown(txnId, columnKey).subscribe({
      next: (res: any) => {
        this.isBreakdownLoading = false;
        this.breakdownEntries = res?.data || [];
      },
      error: () => {
        this.isBreakdownLoading = false;
        this.breakdownEntries = [];
      }
    });
  }

  closeBreakdownModal(): void {
    this.isBreakdownModalOpen = false;
    this.selectedTxn = null;
    this.selectedColumnKey = '';
    this.selectedColumnLabel = '';
    this.breakdownEntries = [];
  }

  get totalBreakdownAmount(): number {
    return (this.breakdownEntries || []).reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  }

  isPositiveColumn(columnKey: string): boolean {
    if (!columnKey) return false;
    const k = columnKey.toLowerCase();
    if (k.includes('arrear')) return true;
    const col = this.activeDeductionColumns.find(c => c.column.toLowerCase() === k);
    return !!col?.isPositive;
  }

  // =========================================================================
  // Formatting Helpers
  // =========================================================================

  get totalCarryForwardDeficit(): number {
    return (this.rows || []).reduce((sum, r) => sum + (Number(r.CarryForwardDeficit_Out) || 0), 0);
  }

  isDeductionExceeded(row: any): boolean {
    if (!row) return false;
    const earnings = row.Earnings_Post_GST != null 
      ? Number(row.Earnings_Post_GST) 
      : ((Number(row.Total_Payable_After_GST) || 0) - (Number(row.TDS_Amount) || 0));
    const deductions = Number(row.Total_Deductions) || 0;
    return deductions > 0 && deductions >= earnings;
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '-';
    return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dt: any): string {
    if (!dt) return '-';
    try {
      const d = new Date(dt);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
             d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dt;
    }
  }

  get isAmazonDsp(): boolean {
    const val = this.filterForm?.get('modelId')?.value;
    const mId = Number(typeof val === 'object' ? (val?.value || val?.id) : val);
    if (mId === 4) return true;
    const model = this.modelList.find(m => (m.value || m.id) == mId);
    const mName = (model?.name || model?.description || '').toLowerCase();
    return mName.includes('dsp') && !mName.includes('edsp');
  }

  get isAmazonEdsp(): boolean {
    const val = this.filterForm?.get('modelId')?.value;
    const mId = Number(typeof val === 'object' ? (val?.value || val?.id) : val);
    if (mId === 5) return true;
    const model = this.modelList.find(m => (m.value || m.id) == mId);
    const mName = (model?.name || model?.description || '').toLowerCase();
    return mName.includes('edsp');
  }

  get isVehicleTypeApplicable(): boolean {
    if (this.isAmazonDsp || this.isAmazonEdsp) return true;
    return (this.rows || []).some(r => this.isValidVehicleType(r.Vehicle_Type));
  }

  get isRouteApplicable(): boolean {
    if (this.isAmazonDsp) return true;
    return (this.rows || []).some(r => this.isValidRoute(r.Route));
  }

  isValidVehicleType(v: any): boolean {
    if (!v) return false;
    const s = String(v).trim().toLowerCase();
    return s !== '' && s !== '0' && s !== '-' && s !== 'null' && s !== 'undefined';
  }

  isValidRoute(r: any): boolean {
    if (!r) return false;
    const s = String(r).trim().toLowerCase();
    return s !== '' && s !== '0' && s !== '-' && s !== 'null' && s !== 'undefined';
  }
}
