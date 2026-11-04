import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RouterModule } from '@angular/router';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

import { VendorService } from '../Service/vendor.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';

@Component({
  selector: 'app-vendor-payment-settlement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule, RouterModule],
  templateUrl: './vendor-payment-settlement.component.html',
  styleUrls: ['./vendor-payment-settlement.component.scss']
})
export class VendorPaymentSettlementComponent implements OnInit {
  filterForm!: FormGroup;
  paymentForm!: FormGroup;

  // Filter Dropdown Lists (1:1 with Sync page)
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  allLinkedVendors: any[] = [];
  filteredVendors: any[] = [];
  transactionRanges: any[] = [];
  isVendorsLoading: boolean = false;

  // Status Tab Filter
  activeStatusTab: 'Pending' | 'Paid' | 'All' = 'Pending';

  // Grid Data & KPIs
  rows: any[] = [];
  totalRecords: number = 0;
  kpiTotalCount: number = 0;
  kpiPendingCount: number = 0;
  kpiPaidCount: number = 0;
  kpiTotalPendingAmount: number = 0;
  kpiTotalPaidAmount: number = 0;

  pageIndex: number = 1;
  pageSize: number = 20;
  searchTerm: string = '';
  isLoaded: boolean = false;
  isLoading: boolean = false;

  // Multi-Selection State (Cross-page Map & Cycle-wide mode)
  selectedItemsMap: Map<number, {
    id: number;
    netPayable: number;
    vendorName: string;
    vendorCode: string;
    fhrid: string;
    vehicleType?: string;
    route?: string;
    isDeductionsSynced: boolean;
  }> = new Map();
  selectAllChecked: boolean = false;
  isSelectAllCycle: boolean = false;

  // KPI Breakdown
  kpiSyncedCount: number = 0;
  kpiUnsyncedCount: number = 0;

  // Record Payment Modal State
  showPaymentModal: boolean = false;
  isSubmittingPayment: boolean = false;

  // Revert Confirmation Modal State
  showRevertModal: boolean = false;
  revertingTxn: any = null;
  revertRemarks: string = '';
  isSubmittingRevert: boolean = false;

  // Payment Modes & Banks
  paymentModes: string[] = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Corporate Netbanking', 'Cheque', 'Fund Transfer'];
  bankList: string[] = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda', 'Kotak Mahindra Bank', 'Canara Bank', 'Union Bank of India', 'Other'];

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
    this.initForms();
    this.loadClients();
    this.loadLocations();
    this.setupCascadingDropdowns();
  }

  private initForms(): void {
    this.filterForm = this.fb.group({
      clientId: [null, Validators.required],
      modelId: [null, Validators.required],
      locationId: [null],
      vendor: [null],
      transactionRange: [null, Validators.required],
      deductionsSynced: [''], // '' = All, '1' = Synced, '0' = Not Synced
      searchTerm: ['']
    });

    const todayStr = new Date().toISOString().substring(0, 10);
    this.paymentForm = this.fb.group({
      paymentDate: [todayStr, Validators.required],
      paymentTransactionNo: ['', [Validators.required, Validators.maxLength(100)]],
      paymentMode: ['NEFT', Validators.required],
      paymentBankName: [null],
      paymentAccountNo: [''],
      paymentRemarks: ['']
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
        vendor: null,
        deductionsSynced: ''
      }, { emitEvent: false });

      this.modelList = [];
      this.transactionRanges = [];
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.rows = [];
      this.isLoaded = false;
      this.clearSelection();

      if (clientId) {
        this.loadModels(clientId);
      }
    });

    // 2. Model Changes -> reset Range, Vendor, load ranges and vendors
    this.filterForm.get('modelId')?.valueChanges.subscribe((modelId: any) => {
      this.filterForm.patchValue({
        transactionRange: null,
        vendor: null,
        deductionsSynced: ''
      }, { emitEvent: false });

      this.transactionRanges = [];
      this.allLinkedVendors = [];
      this.filteredVendors = [];
      this.rows = [];
      this.isLoaded = false;
      this.clearSelection();

      const clientId = this.filterForm.get('clientId')?.value;
      if (clientId && modelId) {
        this.loadTransactionRanges(clientId, modelId);
        this.loadLinkedVendors(clientId, modelId, this.filterForm.get('locationId')?.value);
      }
    });

    // 3. Location Changes -> reload linked vendors
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
  // Search & Status Tabs
  // =========================================================================

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.toastr.warning('Please select Client, Model, and Transaction Range.', 'Missing Selection');
      return;
    }
    this.pageIndex = 1;
    this.clearSelection();
    this.loadSettlementList();
  }

  onReset(): void {
    this.filterForm.reset();
    this.searchTerm = '';
    this.activeStatusTab = 'Pending';
    this.rows = [];
    this.totalRecords = 0;
    this.kpiTotalCount = 0;
    this.kpiPendingCount = 0;
    this.kpiPaidCount = 0;
    this.kpiTotalPendingAmount = 0;
    this.kpiTotalPaidAmount = 0;
    this.isLoaded = false;
    this.clearSelection();
  }

  onStatusTabChange(tab: 'Pending' | 'Paid' | 'All'): void {
    if (this.activeStatusTab === tab) return;
    this.activeStatusTab = tab;
    this.pageIndex = 1;
    this.clearSelection();
    if (this.filterForm.valid) {
      this.loadSettlementList();
    }
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadSettlementList();
  }

  loadSettlementList(): void {
    const fv = this.filterForm.value;
    const clientId = Number(typeof fv.clientId === 'object' ? (fv.clientId?.value || fv.clientId?.id) : fv.clientId);
    const modelId = Number(typeof fv.modelId === 'object' ? (fv.modelId?.value || fv.modelId?.id) : fv.modelId);
    const locationId = typeof fv.locationId === 'object' ? (fv.locationId?.value || '') : (fv.locationId || '');
    const vendorCode = fv.vendor ? (fv.vendor.vendorCode || fv.vendor.fhrid || fv.vendor) : '';
    const transactionRange = typeof fv.transactionRange === 'object' ? (fv.transactionRange?.value || '') : (fv.transactionRange || '');
    const term = (this.searchTerm || fv.searchTerm || '').trim();

    this.isLoading = true;
    this.loader.start();

    const deductionsSynced = fv.deductionsSynced !== '' && fv.deductionsSynced != null ? fv.deductionsSynced : '';

    this.vendorService.getPaymentSettlementList(
      clientId,
      modelId,
      transactionRange,
      locationId,
      vendorCode,
      this.activeStatusTab,
      term,
      this.pageIndex,
      this.pageSize,
      deductionsSynced
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.loader.stop();
        this.isLoaded = true;

        if (res?.isSuccess && res.data) {
          const d = res.data;
          const rawRows = d.rows || d.Rows || [];
          this.rows = rawRows.map((r: any) => ({
            ...r,
            TransactionID: r.TransactionID || r.transactionID,
            VendorCode: r.VendorCode || r.vendorCode,
            VendorName: r.VendorName || r.vendorName,
            FHRID: r.FHRID || r.fhrid,
            LocationName: r.LocationName || r.locationName,
            HubCode: r.HubCode || r.hubCode,
            Gross_Payable: Number(r.Gross_Payable != null ? r.Gross_Payable : r.gross_Payable) || 0,
            GST_Percentage: Number(r.GST_Percentage != null ? r.GST_Percentage : r.gst_Percentage) || 0,
            GST_Amount: Number(r.GST_Amount != null ? r.GST_Amount : r.gst_Amount) || 0,
            Total_Payable_After_GST: Number(r.Total_Payable_After_GST != null ? r.Total_Payable_After_GST : r.total_Payable_After_GST) || 0,
            TDS_Percentage: Number(r.TDS_Percentage != null ? r.TDS_Percentage : r.tds_Percentage) || 1,
            TDS_Amount: Number(r.TDS_Amount != null ? r.TDS_Amount : r.tds_Amount) || 0,
            Earnings_Post_GST: Number(r.Earnings_Post_GST != null ? r.Earnings_Post_GST : r.earnings_Post_GST) || 0,
            Operational_Deductions: Number(r.Operational_Deductions != null ? r.Operational_Deductions : r.operational_Deductions) || 0,
            CarryForwardDeficit_In: Number(r.CarryForwardDeficit_In != null ? r.CarryForwardDeficit_In : r.carryForwardDeficit_In) || 0,
            CarryForwardDeficit_Out: Number(r.CarryForwardDeficit_Out != null ? r.CarryForwardDeficit_Out : r.carryForwardDeficit_Out) || 0,
            Total_Deductions: Number(r.Total_Deductions != null ? r.Total_Deductions : r.total_Deductions) || 0,
            Net_Payable: Number(r.Net_Payable != null ? r.Net_Payable : r.net_Payable) || 0,
            Payment_Status: r.Payment_Status || r.payment_Status || 'Pending',
            Vendor_BankName: r.Vendor_BankName || r.vendor_BankName,
            Vendor_AccountNo: r.Vendor_AccountNo || r.vendor_AccountNo,
            Vendor_IFSCCode: r.Vendor_IFSCCode || r.vendor_IFSCCode,
            Vendor_AccountHolderName: r.Vendor_AccountHolderName || r.vendor_AccountHolderName,
            Payment_TransactionNo: r.Payment_TransactionNo || r.payment_TransactionNo,
            Payment_Date: r.Payment_Date || r.payment_Date,
            Payment_Mode: r.Payment_Mode || r.payment_Mode,
            Payment_ProcessedByName: r.Payment_ProcessedByName || r.payment_ProcessedByName,
            IsDeductionsSynced: Boolean(r.IsDeductionsSynced != null ? r.IsDeductionsSynced : r.isDeductionsSynced),
            RecoveryPercent: r.RecoveryPercent != null ? Number(r.RecoveryPercent) : 100
          }));
          this.totalRecords = d.totalRecords != null ? d.totalRecords : (d.TotalRecords || this.rows.length);
          this.kpiTotalCount = d.kpiTotalCount != null ? d.kpiTotalCount : (d.KpiTotalCount || 0);
          this.kpiPendingCount = d.kpiPendingCount != null ? d.kpiPendingCount : (d.KpiPendingCount || 0);
          this.kpiPaidCount = d.kpiPaidCount != null ? d.kpiPaidCount : (d.KpiPaidCount || 0);
          this.kpiTotalPendingAmount = Number(d.kpiTotalPendingAmount != null ? d.kpiTotalPendingAmount : d.KpiTotalPendingAmount) || 0;
          this.kpiTotalPaidAmount = Number(d.kpiTotalPaidAmount != null ? d.kpiTotalPaidAmount : d.KpiTotalPaidAmount) || 0;
          this.kpiSyncedCount = d.kpiSyncedCount != null ? d.kpiSyncedCount : (d.KpiSyncedCount || 0);
          this.kpiUnsyncedCount = d.kpiUnsyncedCount != null ? d.kpiUnsyncedCount : (d.KpiUnsyncedCount || 0);
          this.updateSelectAllCheckboxState();
        } else {
          this.rows = [];
          this.totalRecords = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loader.stop();
        this.toastr.error(err?.error?.message || 'Failed to fetch payment settlement list.', 'Error');
      }
    });
  }

  // =========================================================================
  // Selection Logic (Cross-Page Map & Cycle-Wide Bulk Selection)
  // =========================================================================

  get selectedCount(): number {
    if (this.isSelectAllCycle) {
      return this.kpiPendingCount;
    }
    return this.selectedItemsMap.size;
  }

  get selectedTotalAmount(): number {
    if (this.isSelectAllCycle) {
      return this.kpiTotalPendingAmount;
    }
    let sum = 0;
    this.selectedItemsMap.forEach(item => sum += item.netPayable);
    return sum;
  }

  get selectedUnsyncedCount(): number {
    if (this.isSelectAllCycle) {
      return this.kpiUnsyncedCount;
    }
    let count = 0;
    this.selectedItemsMap.forEach(item => {
      if (!item.isDeductionsSynced) count++;
    });
    return count;
  }

  get isAllOnPageSelected(): boolean {
    const pendingPayableRows = this.rows.filter(r => r.Payment_Status === 'Pending' && Number(r.Net_Payable) > 0);
    return pendingPayableRows.length > 0 && pendingPayableRows.every(r => this.selectedItemsMap.has(r.TransactionID));
  }

  toggleSelectAll(): void {
    if (this.isSelectAllCycle) {
      this.clearSelection();
      return;
    }

    const pendingPayableRows = this.rows.filter(r => r.Payment_Status === 'Pending' && Number(r.Net_Payable) > 0);
    const allCurrentPageSelected = pendingPayableRows.length > 0 && pendingPayableRows.every(r => this.selectedItemsMap.has(r.TransactionID));

    if (allCurrentPageSelected) {
      // Deselect all on current page
      pendingPayableRows.forEach(r => this.selectedItemsMap.delete(r.TransactionID));
      this.selectAllChecked = false;
    } else {
      // Select all on current page (keeps existing selections on other pages intact!)
      pendingPayableRows.forEach(r => {
        this.selectedItemsMap.set(r.TransactionID, {
          id: r.TransactionID,
          netPayable: Number(r.Net_Payable) || 0,
          vendorName: r.VendorName,
          vendorCode: r.VendorCode,
          fhrid: r.FHRID,
          vehicleType: (r.Vehicle_Type === '0' || r.Vehicle_Type === 0) ? '' : r.Vehicle_Type,
          route: (r.Route === '0' || r.Route === '-') ? '' : r.Route,
          isDeductionsSynced: Boolean(r.IsDeductionsSynced)
        });
      });
      this.selectAllChecked = true;
    }
  }

  selectAllAcrossCycle(): void {
    this.isSelectAllCycle = true;
    this.selectAllChecked = true;
  }

  toggleRowSelection(row: any): void {
    if (row.Payment_Status !== 'Pending' || Number(row.Net_Payable) <= 0) return;

    if (this.isSelectAllCycle) {
      // If user unselects one row while in Cycle-wide mode, convert to page selection minus this row
      this.isSelectAllCycle = false;
      this.selectedItemsMap.clear();
      this.rows.filter(r => r.Payment_Status === 'Pending' && Number(r.Net_Payable) > 0).forEach(r => {
        if (r.TransactionID !== row.TransactionID) {
          this.selectedItemsMap.set(r.TransactionID, {
            id: r.TransactionID,
            netPayable: Number(r.Net_Payable) || 0,
            vendorName: r.VendorName,
            vendorCode: r.VendorCode,
            fhrid: r.FHRID,
            vehicleType: (r.Vehicle_Type === '0' || r.Vehicle_Type === 0) ? '' : r.Vehicle_Type,
            route: (r.Route === '0' || r.Route === '-') ? '' : r.Route,
            isDeductionsSynced: Boolean(r.IsDeductionsSynced)
          });
        }
      });
      this.updateSelectAllCheckboxState();
      return;
    }

    if (this.selectedItemsMap.has(row.TransactionID)) {
      this.selectedItemsMap.delete(row.TransactionID);
    } else {
      this.selectedItemsMap.set(row.TransactionID, {
        id: row.TransactionID,
        netPayable: Number(row.Net_Payable) || 0,
        vendorName: row.VendorName,
        vendorCode: row.VendorCode,
        fhrid: row.FHRID,
        vehicleType: (row.Vehicle_Type === '0' || row.Vehicle_Type === 0) ? '' : row.Vehicle_Type,
        route: (row.Route === '0' || row.Route === '-') ? '' : row.Route,
        isDeductionsSynced: Boolean(row.IsDeductionsSynced)
      });
    }
    this.updateSelectAllCheckboxState();
  }

  isRowSelected(row: any): boolean {
    if (this.isSelectAllCycle) {
      return row.Payment_Status === 'Pending' && Number(row.Net_Payable) > 0;
    }
    return this.selectedItemsMap.has(row.TransactionID);
  }

  clearSelection(): void {
    this.selectedItemsMap.clear();
    this.isSelectAllCycle = false;
    this.selectAllChecked = false;
  }

  get firstSelectedItem(): any {
    if (this.selectedItemsMap.size === 0) return null;
    return this.selectedItemsMap.values().next().value;
  }

  openSinglePaymentModal(row: any): void {
    if (row.Payment_Status !== 'Pending' || Number(row.Net_Payable) <= 0) return;
    this.clearSelection();
    this.selectedItemsMap.set(row.TransactionID, {
      id: row.TransactionID,
      netPayable: Number(row.Net_Payable) || 0,
      vendorName: row.VendorName,
      vendorCode: row.VendorCode,
      fhrid: row.FHRID,
      vehicleType: (row.Vehicle_Type === '0' || row.Vehicle_Type === 0) ? '' : row.Vehicle_Type,
      route: (row.Route === '0' || row.Route === '-') ? '' : row.Route,
      isDeductionsSynced: Boolean(row.IsDeductionsSynced)
    });
    this.openPaymentModal();
  }

  private updateSelectAllCheckboxState(): void {
    if (this.isSelectAllCycle) {
      this.selectAllChecked = true;
      return;
    }
    const pendingPayableRows = this.rows.filter(r => r.Payment_Status === 'Pending' && Number(r.Net_Payable) > 0);
    if (!pendingPayableRows.length) {
      this.selectAllChecked = false;
      return;
    }
    this.selectAllChecked = pendingPayableRows.every(r => this.selectedItemsMap.has(r.TransactionID));
  }

  // =========================================================================
  // Payment Modal & Submission
  // =========================================================================

  openPaymentModal(): void {
    if (!this.isSelectAllCycle && this.selectedItemsMap.size === 0) {
      this.toastr.warning('Please select at least one pending payment row.', 'Selection Required');
      return;
    }
    this.paymentForm.patchValue({
      paymentDate: new Date().toISOString().substring(0, 10),
      paymentTransactionNo: '',
      paymentMode: 'NEFT',
      paymentBankName: null,
      paymentAccountNo: '',
      paymentRemarks: ''
    });
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
  }

  setPaymentMode(mode: string): void {
    this.paymentForm.patchValue({ paymentMode: mode });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.toastr.warning('Please enter valid Payment Date and UTR / Transaction No.', 'Validation Error');
      return;
    }

    const pf = this.paymentForm.value;
    const fv = this.filterForm.value;
    const clientId = Number(typeof fv.clientId === 'object' ? (fv.clientId?.value || fv.clientId?.id) : fv.clientId);
    const modelId = Number(typeof fv.modelId === 'object' ? (fv.modelId?.value || fv.modelId?.id) : fv.modelId);
    const locationId = typeof fv.locationId === 'object' ? (fv.locationId?.value || '') : (fv.locationId || '');
    const transactionRange = typeof fv.transactionRange === 'object' ? (fv.transactionRange?.value || '') : (fv.transactionRange || '');
    const deductionsSynced = fv.deductionsSynced !== '' && fv.deductionsSynced != null ? Number(fv.deductionsSynced) : undefined;

    const payload: any = {
      isSelectAllCycle: this.isSelectAllCycle,
      clientId: clientId,
      modelId: modelId,
      transactionRange: transactionRange,
      locationId: locationId || undefined,
      deductionsSyncedFilter: deductionsSynced,
      transactionIds: this.isSelectAllCycle ? [] : Array.from(this.selectedItemsMap.keys()),
      paymentDate: pf.paymentDate,
      paymentTransactionNo: pf.paymentTransactionNo.trim(),
      paymentMode: pf.paymentMode,
      paymentBankName: pf.paymentBankName || '',
      paymentAccountNo: pf.paymentAccountNo ? pf.paymentAccountNo.trim() : '',
      paymentRemarks: pf.paymentRemarks ? pf.paymentRemarks.trim() : ''
    };

    this.isSubmittingPayment = true;
    this.loader.start();

    this.vendorService.recordPayment(payload).subscribe({
      next: (res: any) => {
        this.isSubmittingPayment = false;
        this.loader.stop();
        if (res?.isSuccess) {
          const count = res.data?.updatedCount || (this.isSelectAllCycle ? this.kpiPendingCount : this.selectedItemsMap.size);
          this.toastr.success(`Payment recorded successfully for ${count} vendor(s)!`, 'Settlement Completed');
          this.closePaymentModal();
          this.clearSelection();
          this.loadSettlementList();
        } else {
          this.toastr.error(res?.message || 'Failed to record payment.', 'Error');
        }
      },
      error: (err: any) => {
        this.isSubmittingPayment = false;
        this.loader.stop();
        this.toastr.error(err?.error?.message || 'Error occurred while recording payment.', 'Error');
      }
    });
  }

  // =========================================================================
  // Revert Payment Logic
  // =========================================================================

  openRevertModal(txn: any): void {
    this.revertingTxn = txn;
    this.revertRemarks = '';
    this.showRevertModal = true;
  }

  closeRevertModal(): void {
    this.showRevertModal = false;
    this.revertingTxn = null;
    this.revertRemarks = '';
  }

  submitRevert(): void {
    if (!this.revertingTxn) return;

    this.isSubmittingRevert = true;
    this.loader.start();

    this.vendorService.revertPayment({
      transactionId: this.revertingTxn.TransactionID,
      remarks: this.revertRemarks.trim()
    }).subscribe({
      next: (res: any) => {
        this.isSubmittingRevert = false;
        this.loader.stop();
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Payment reverted to Pending.', 'Reverted');
          this.closeRevertModal();
          this.loadSettlementList();
        } else {
          this.toastr.error(res?.message || 'Failed to revert payment.', 'Error');
        }
      },
      error: (err: any) => {
        this.isSubmittingRevert = false;
        this.loader.stop();
        this.toastr.error(err?.error?.message || 'Error reverting payment.', 'Error');
      }
    });
  }

  // =========================================================================
  // Export Bank Disbursal File (Genuine Microsoft Excel .xlsx)
  // =========================================================================

  async exportBankFile(): Promise<void> {
    const exportRows = this.selectedItemsMap.size > 0
      ? this.rows.filter(r => this.selectedItemsMap.has(r.TransactionID))
      : (this.activeStatusTab === 'Pending'
          ? this.rows.filter(r => r.Payment_Status === 'Pending' && Number(r.Net_Payable) > 0)
          : this.rows);

    if (!exportRows.length) {
      this.toastr.warning('No records found to export for current selection/filters.', 'Empty Data');
      return;
    }

    this.loader.start();
    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'HRBook Vendor System';
      wb.created = new Date();

      const ws = wb.addWorksheet('Bank_Payout_Settlement', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      // Columns definition with appropriate widths
      ws.columns = [
        { header: 'S.No', key: 'sno', width: 7 },
        { header: 'Vendor Code', key: 'vendorCode', width: 14 },
        { header: 'Vendor Name', key: 'vendorName', width: 28 },
        { header: 'FHR ID', key: 'fhrid', width: 14 },
        { header: 'Location / Hub', key: 'location', width: 18 },
        { header: 'Vehicle Type', key: 'vehicleType', width: 14 },
        { header: 'Route / Block', key: 'route', width: 14 },
        { header: 'Beneficiary Name', key: 'beneficiary', width: 26 },
        { header: 'Bank Name', key: 'bankName', width: 20 },
        { header: 'Account Number', key: 'accountNo', width: 22 },
        { header: 'IFSC Code', key: 'ifsc', width: 15 },
        { header: 'Gross Payable (₹)', key: 'grossPayable', width: 16 },
        { header: 'GST %', key: 'gstPct', width: 10 },
        { header: 'GST Amount (₹)', key: 'gstAmt', width: 15 },
        { header: 'Total Payable After GST (₹)', key: 'postGst', width: 22 },
        { header: 'TDS %', key: 'tdsPct', width: 10 },
        { header: 'TDS Amount (₹)', key: 'tdsAmt', width: 15 },
        { header: 'Earnings Post-TDS (₹)', key: 'postTds', width: 20 },
        { header: 'Brought Deficit (₹)', key: 'broughtDeficit', width: 18 },
        { header: 'Operational Deductions (₹)', key: 'opDeductions', width: 22 },
        { header: 'Total Deductions Logged (₹)', key: 'totalDeductions', width: 22 },
        { header: 'Recovery Cap %', key: 'recoveryCap', width: 14 },
        { header: 'Deductions Recovered (₹)', key: 'recovered', width: 22 },
        { header: 'Carry-Forward Deficit (₹)', key: 'carryFwd', width: 22 },
        { header: 'Net Disbursal Payable (₹)', key: 'netPayable', width: 22 },
        { header: 'Payment Status', key: 'status', width: 15 },
        { header: 'Transaction Range', key: 'range', width: 24 },
        { header: 'UTR / Transaction No', key: 'utr', width: 24 },
        { header: 'Payment Date', key: 'payDate', width: 15 },
        { header: 'Payment Mode', key: 'payMode', width: 15 }
      ];

      // Format Header Row (Navy Blue, White text, Bold)
      const headerRow = ws.getRow(1);
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF0D2357' } },
          bottom: { style: 'medium', color: { argb: 'FF0D2357' } },
          left: { style: 'thin', color: { argb: 'FF3B82F6' } },
          right: { style: 'thin', color: { argb: 'FF3B82F6' } }
        };
      });

      // Data Rows & Totals Calculation
      let sumGross = 0;
      let sumGst = 0;
      let sumTds = 0;
      let sumPostTds = 0;
      let sumBroughtDeficit = 0;
      let sumOpDeductions = 0;
      let sumTotalDeductions = 0;
      let sumRecovered = 0;
      let sumCarryFwd = 0;
      let sumNetPayable = 0;

      exportRows.forEach((r, idx) => {
        const gross = Number(r.Gross_Payable) || 0;
        const gstPct = Number(r.GST_Percentage) || 0;
        const gstAmt = Number(r.GST_Amount) || 0;
        const postGst = Number(r.Total_Payable_After_GST) || (gross + gstAmt);
        const tdsPct = Number(r.TDS_Percentage) || 1;
        const tdsAmt = Number(r.TDS_Amount) || 0;
        const postTds = Number(r.Earnings_Post_GST) || (postGst - tdsAmt);
        const broughtDeficit = Number(r.CarryForwardDeficit_In) || 0;
        const opDeductions = Number(r.Operational_Deductions) || 0;
        const totalDeductions = Number(r.Total_Deductions) || (opDeductions + broughtDeficit);
        const recoveryCap = r.RecoveryPercent != null ? Number(r.RecoveryPercent) : 100;
        const netPayable = Number(r.Net_Payable) || 0;
        const recovered = Math.max(0, postTds - netPayable);
        const carryFwd = Number(r.CarryForwardDeficit_Out) || Math.max(0, totalDeductions - recovered);

        sumGross += gross;
        sumGst += gstAmt;
        sumTds += tdsAmt;
        sumPostTds += postTds;
        sumBroughtDeficit += broughtDeficit;
        sumOpDeductions += opDeductions;
        sumTotalDeductions += totalDeductions;
        sumRecovered += recovered;
        sumCarryFwd += carryFwd;
        sumNetPayable += netPayable;

        const row = ws.addRow({
          sno: idx + 1,
          vendorCode: r.VendorCode || '',
          vendorName: r.VendorName || '',
          fhrid: r.FHRID || '',
          location: r.LocationName || r.HubCode || '',
          vehicleType: (r.Vehicle_Type === '0' || r.Vehicle_Type === 0) ? '' : (r.Vehicle_Type || ''),
          route: (r.Route === '0' || r.Route === '-') ? '' : (r.Route || ''),
          beneficiary: r.Vendor_AccountHolderName || r.VendorName || '',
          bankName: r.Vendor_BankName || '',
          accountNo: r.Vendor_AccountNo ? `'${r.Vendor_AccountNo}` : '',
          ifsc: r.Vendor_IFSCCode || '',
          grossPayable: gross,
          gstPct: gstPct,
          gstAmt: gstAmt,
          postGst: postGst,
          tdsPct: tdsPct,
          tdsAmt: tdsAmt,
          postTds: postTds,
          broughtDeficit: broughtDeficit,
          opDeductions: opDeductions,
          totalDeductions: totalDeductions,
          recoveryCap: recoveryCap,
          recovered: recovered,
          carryFwd: carryFwd,
          netPayable: netPayable,
          status: r.Payment_Status || 'Pending',
          range: r.TransactionRange || '',
          utr: r.Payment_TransactionNo || '',
          payDate: r.Payment_Date ? new Date(r.Payment_Date).toISOString().substring(0, 10) : '',
          payMode: r.Payment_Mode || ''
        });

        row.height = 20;

        // Apply cell styling & formats
        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Calibri', size: 9.5 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };

          // Currency columns
          if ([12, 14, 15, 17, 18, 19, 20, 21, 23, 24, 25].includes(colNumber)) {
            cell.numFmt = '#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          } else if ([1, 13, 16, 22].includes(colNumber)) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber === 10) {
            // Explicit text for Bank Account
            cell.numFmt = '@';
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else if (colNumber === 26) {
            // Status with highlight
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            if (r.Payment_Status === 'Paid') {
              cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF15803D' } };
            } else {
              cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FFD97706' } };
            }
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          }
        });

        // Alternating row styling
        if (idx % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          });
        }
      });

      // Total Summary Row
      const totalRow = ws.addRow({
        sno: '',
        vendorCode: '',
        vendorName: 'TOTAL',
        grossPayable: sumGross,
        gstAmt: sumGst,
        postGst: sumGross + sumGst,
        tdsAmt: sumTds,
        postTds: sumPostTds,
        broughtDeficit: sumBroughtDeficit,
        opDeductions: sumOpDeductions,
        totalDeductions: sumTotalDeductions,
        recovered: sumRecovered,
        carryFwd: sumCarryFwd,
        netPayable: sumNetPayable
      });

      totalRow.height = 24;
      totalRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
          bottom: { style: 'double', color: { argb: 'FF1E3A8A' } }
        };
        if ([12, 14, 15, 17, 18, 19, 20, 21, 23, 24, 25].includes(colNumber)) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fv = this.filterForm.value;
      const rangeSlug = (fv.transactionRange || 'payout').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Vendor_Bank_Payout_${rangeSlug}_${new Date().toISOString().substring(0, 10)}.xlsx`;
      FileSaver.saveAs(blob, filename);

      this.toastr.success(`Excel file "${filename}" downloaded successfully with ${exportRows.length} records!`, 'Excel Exported');
    } catch (err) {
      console.error('Error generating Excel file:', err);
      this.toastr.error('Failed to generate Excel file. Please try again.', 'Export Error');
    } finally {
      this.loader.stop();
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  formatCurrency(val: any): string {
    const num = Number(val);
    if (isNaN(num)) return '₹0.00';
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
