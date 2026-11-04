import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, Observable, of, concat } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { VendorService } from '../Service/vendor.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { environment } from '../../../../../environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-vendor-transaction-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule, RouterModule],
  templateUrl: './vendor-transaction-list.component.html',
  styleUrls: ['./vendor-transaction-list.component.scss']
})
export class VendorTransactionListComponent implements OnInit {
  filterForm!: FormGroup;

  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  transactionRanges: any[] = [];

  vendorCodes$: Observable<any[]>;
  vendorCodeInput$ = new Subject<string>();
  isVendorsLoading = false;

  transactions: any[] = [];
  previewKeys: string[] = [];
  formulaMap: any = {};
  totalItems: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private commonMasterService: ManualPunchBio,
    private clientService: ClientMasterService,
    private dropdownService: DropdownService,
    private toastrService: ToastrService,
    private ngxService: NgxUiLoaderService
  ) {
    this.vendorCodes$ = concat(
      of([]), // default empty list
      this.vendorCodeInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.isVendorsLoading = true)),
        switchMap((term) => {
          if (!term || term.length < 3) {
            this.isVendorsLoading = false;
            return of([]);
          }
          return this.vendorService.searchVendors(term).pipe(
            catchError(() => of({ data: [] })),
            switchMap(res => {
              this.isVendorsLoading = false;
              return of(res?.data || []);
            })
          );
        })
      )
    );
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      client: [null],
      model: [null],
      location: [null],
      transactionRange: [null],
      vendorCode: [null]
    });

    this.getCostCenterList();
    this.loadLocations();

    this.filterForm.get('client')?.valueChanges.subscribe(clientId => {
      this.filterForm.get('model')?.setValue(null);
      this.filterForm.get('transactionRange')?.setValue(null);
      this.modelList = [];
      this.transactionRanges = [];
      this.filterModelsByClient(clientId || 0);
    });

    this.filterForm.get('model')?.valueChanges.subscribe(modelId => {
      this.filterForm.get('transactionRange')?.setValue(null);
      this.transactionRanges = [];
      const clientId = this.filterForm.get('client')?.value;
      if (clientId && modelId) {
        this.loadTransactionRanges(clientId, modelId);
      }
    });
  }

  getCostCenterList(): void {
    this.commonMasterService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.clientList = res.data;
        } else {
          this.clientList = [];
        }
      },
      error: () => {
        this.clientList = [];
      }
    });
  }

  loadLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = data || [];
      },
      error: () => {
        this.locationList = [];
      }
    });
  }

  filterModelsByClient(clientId: any = 0): void {
    const costCentreId = clientId ? (typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId) : 0;
    if (costCentreId === 0) return;

    this.clientService.getModelListByClient(costCentreId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.modelList = res.data;
        } else {
          this.modelList = [];
        }
      },
      error: () => {
        this.modelList = [];
      }
    });
  }

  loadTransactionRanges(clientId: any, modelId: any): void {
    const cId = typeof clientId === 'object' ? (clientId?.value || clientId?.id) : clientId;
    const mId = typeof modelId === 'object' ? (modelId?.value || modelId?.id) : modelId;
    
    this.vendorService.getVendorTransactionRanges(cId, mId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.transactionRanges = res.data.map((item: any) => ({
            name: item.TransactionRange || item.transactionRange,
            value: item.TransactionRange || item.transactionRange
          }));
        }
      }
    });
  }

  searchTransactions(): void {
    const client = this.filterForm.get('client')?.value;
    const model = this.filterForm.get('model')?.value;

    if (!client || !model) {
      this.toastrService.warning('Client and Model are mandatory for filtering.');
      return;
    }

    this.pageIndex = 1;
    this.loadTransactions();
  }

  onGlobalSearch(): void {
    this.pageIndex = 1;
    this.loadTransactions();
  }

  loadTransactions(): void {
    const client = this.filterForm.get('client')?.value;
    const model = this.filterForm.get('model')?.value;
    
    if (!client || !model) {
      return; // Handled by search validation
    }

    const cId = typeof client === 'object' ? (client?.value || client?.id) : client;
    const mId = typeof model === 'object' ? (model?.value || model?.id) : model;
    const locId = this.filterForm.get('location')?.value || '';
    const transRange = this.filterForm.get('transactionRange')?.value?.TransactionRange || this.filterForm.get('transactionRange')?.value || '';
    const vendorCode = this.filterForm.get('vendorCode')?.value || '';

    this.ngxService.start();
    this.vendorService.getVendorTransactionList(cId, mId, locId, transRange, vendorCode, this.searchTerm, this.pageIndex, this.pageSize).subscribe({
      next: (res: any) => {
        this.ngxService.stop();
        if (res?.success) {
          this.transactions = (res.data || []).map((t: any) => {
            // Guard: If no payment activity was performed, Payment Processed By should not be displayed
            const paymentStatus = t['Payment Status'] || t['Payment_Status'];
            const hasPaymentActivity = (paymentStatus === 'Paid' || paymentStatus === 'Payment Done') ||
              (t['Payment Date'] && t['Payment Date'] !== '-') ||
              (t['Payment_Date'] && t['Payment_Date'] !== '-') ||
              (t['Payment Transaction No'] && t['Payment Transaction No'] !== '-') ||
              (t['Payment_TransactionNo'] && t['Payment_TransactionNo'] !== '-') ||
              (t['Payment Batch No'] && t['Payment Batch No'] !== '-') ||
              (t['Payment_BatchNo'] && t['Payment_BatchNo'] !== '-');

            if (!hasPaymentActivity) {
              t['Payment Processed By'] = null;
              t['Payment_ProcessedByName'] = null;
            } else {
              if (t['Payment Processed By'] === 'GU-21' || t['Payment_ProcessedByName'] === 'GU-21') {
                t['Payment Processed By'] = 'Admin1';
                t['Payment_ProcessedByName'] = 'Admin1';
              }
            }

            const isSynced = t['Deductions Synced'] === true || t['Deductions Synced'] === 1 || t['IsDeductionsSynced'] === true || t['IsDeductionsSynced'] === 1;
            if (!isSynced) {
              t['Synced By'] = null;
              t['SyncedByName'] = null;
            } else {
              if (t['Synced By'] === 'GU-21' || t['SyncedByName'] === 'GU-21') {
                t['Synced By'] = 'Admin1';
                t['SyncedByName'] = 'Admin1';
              }
            }
            return t;
          });
          this.totalItems = res.totalCount;
          this.formulaMap = res.formulas || {};
          
          if (this.transactions.length > 0) {
            const rawKeys: string[] = Object.keys(this.transactions[0]);
            const excludeKeys = [
              'TotalRows', 'TransactionID', 'transactionId', 'UploadBatchID', 'fk_cost_centre_id', 'fk_model_id', 'fk_rec_id',
              'ClientID', 'ModelID', 'LocationID', 'CreatedBy', 'CreatedDate', 'IsProcessed', 'Vendor_IFSCCode', 'Vendor_PanNo',
              'Vendor_AaddharNo', 'Vendor_BankName', 'Vendor_AccountNo', 'fk_File_Id', 'FHRID', 'fhrid', 'FromDate', 'ToDate',
              'CycleName', 'BudgetaryCode', 'StateName', 'HR_Remark', 'HR Remark', 'Central_Remark', 'Central Remark',
              'SyncedBy', 'Synced_By', 'Payment_ProcessedBy', 'PaymentProcessedBy',
              'ResolvedSyncedByName', 'ResolvedPaymentProcessedByName', 'ResolvedRecoveryPolicyApplied'
            ];
            let filteredKeys = rawKeys.filter((k: string) => !excludeKeys.includes(k) && !k.toLowerCase().includes('id'));

            // Ensure Deduction Sync Date, Synced By, Sync Remarks, and Resolved Gross Payable come immediately after Deductions Synced
            const syncIdx = filteredKeys.indexOf('Deductions Synced');
            if (syncIdx !== -1) {
              const postSyncCandidates = [
                'Deduction Sync Date',
                'Synced By',
                'Sync Remarks',
                'Recovery Policy Applied',
                'Resolved Gross Payable',
                'Resolved_Gross_Payable'
              ];
              const toMove = postSyncCandidates.filter(k => filteredKeys.includes(k));
              filteredKeys = filteredKeys.filter(k => !toMove.includes(k));
              const newSyncIdx = filteredKeys.indexOf('Deductions Synced');
              filteredKeys.splice(newSyncIdx + 1, 0, ...toMove);
            }
            this.previewKeys = filteredKeys;
          } else {
            this.previewKeys = [];
          }
        } else {
          this.transactions = [];
          this.totalItems = 0;
          this.toastrService.error('Failed to load transactions.');
        }
      },
      error: () => {
        this.ngxService.stop();
        this.transactions = [];
        this.totalItems = 0;
        this.toastrService.error('Server error while loading transactions.');
      }
    });
  }

  downloadExcel(): void {
    const client = this.filterForm.get('client')?.value;
    const model = this.filterForm.get('model')?.value;
    if (!client || !model) {
      this.toastrService.warning('Client and Model are mandatory for export.');
      return;
    }
    const cId = typeof client === 'object' ? (client?.value || client?.id) : client;
    const mId = typeof model === 'object' ? (model?.value || model?.id) : model;
    const locId = this.filterForm.get('location')?.value || '';
    const transRange = this.filterForm.get('transactionRange')?.value?.TransactionRange || this.filterForm.get('transactionRange')?.value || '';
    const vendorCode = this.filterForm.get('vendorCode')?.value || '';

    this.ngxService.start();
    this.vendorService.exportTransactionList(cId, mId, locId, transRange, vendorCode, this.searchTerm).subscribe({
      next: (blob: Blob) => {
        this.ngxService.stop();

        const clientObj = this.clientList?.find((c: any) => c.value == cId || c.id == cId);
        const modelObj = this.modelList?.find((m: any) => m.value == mId || m.id == mId);
        const cName = (clientObj?.name || clientObj?.text || cId || 'Client').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
        const mName = (modelObj?.name || modelObj?.text || mId || 'Model').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `TransactionList_${cName}_${mName}_${timestamp}.xlsx`;

        this.triggerBlobDownload(blob, fileName);
        this.toastrService.success(`Export downloaded successfully as ${fileName}`);
      },
      error: (err: any) => {
        this.ngxService.stop();
        console.error('Export failed:', err);
        this.toastrService.error('Failed to download export. Please try again.');
      }
    });
  }

  private triggerBlobDownload(blob: Blob, fileName: string): void {
    // Explicitly set the MIME type for Excel OpenXML spreadsheet
    const excelBlob = new Blob([blob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const nav = window.navigator as any;
    if (nav && nav.msSaveOrOpenBlob) {
      nav.msSaveOrOpenBlob(excelBlob, fileName);
      return;
    }

    const url = window.URL.createObjectURL(excelBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    // Crucial: Chromium ignores download attribute on detached nodes; appending to DOM guarantees adherence
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 250);
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadTransactions();
  }

  resetForm(): void {
    this.filterForm.reset();
    this.modelList = [];
    this.transactionRanges = [];
    this.transactions = [];
    this.totalItems = 0;
    this.pageIndex = 1;
    this.searchTerm = '';
    this.toastrService.info('Filters cleared.');
  }

  // =========================================================================
  // Deduction Sync & Drill-Down Modal Logic
  // =========================================================================

  isBreakdownModalOpen: boolean = false;
  isBreakdownLoading: boolean = false;
  selectedTxn: any = null;
  selectedDeductionKey: string = '';
  breakdownEntries: any[] = [];

  onSyncDeductions(): void {
    const cId = Number(this.filterForm.get('client')?.value);
    const mId = Number(this.filterForm.get('model')?.value);
    const locId = this.filterForm.get('location')?.value || '';
    const transRange = this.filterForm.get('transactionRange')?.value?.TransactionRange || this.filterForm.get('transactionRange')?.value || '';

    if (!cId || !mId) {
      this.toastrService.warning('Please select Client and Model to sync deductions.', 'Selection Required');
      return;
    }

    if (!transRange) {
      this.toastrService.warning('Please select a Transaction Range to sync deductions.', 'Range Required');
      return;
    }

    let fromDate = '';
    let toDate = '';
    if (transRange.toLowerCase().includes('to')) {
      const parts = transRange.split(/to/i);
      fromDate = parts[0].trim();
      toDate = parts[1].trim();
    }

    if (!confirm(`Are you sure you want to sync operational deductions for range "${transRange}"?\nThis will aggregate all daily deduction entries into Payment Transactions and recalculate Net Payables.`)) {
      return;
    }

    this.ngxService.start();
    this.vendorService.syncDeductions({
      clientId: cId,
      modelId: mId,
      locationId: locId,
      fromDate: fromDate,
      toDate: toDate
    }).subscribe({
      next: (res: any) => {
        this.ngxService.stop();
        if (res?.isSuccess) {
          this.toastrService.success(res?.message || 'Deductions synchronized and Net Payables recalculated!', 'Sync Complete');
          this.loadTransactions();
        } else {
          this.toastrService.error(res?.message || 'Failed to sync deductions.', 'Sync Error');
        }
      },
      error: (err: any) => {
        this.ngxService.stop();
        this.toastrService.error(err?.error?.message || err?.message || 'Server error while syncing deductions.', 'Error');
      }
    });
  }

  isBooleanSyncedKey(key: string): boolean {
    if (!key) return false;
    const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return k === 'isdeductionssynced' || k === 'issynced' || k === 'deductionssynced' || k === 'deductionsync';
  }

  isSyncedValue(val: any): boolean {
    if (val === true || val === 1 || val === '1' || val === 'true' || val === 'True' || val === 'Yes' || val === 'yes') return true;
    return false;
  }

  isPercentKey(key: string): boolean {
    if (!key) return false;
    const k = key.toLowerCase();
    return k.includes('cap %') || k.includes('cap percent') || k.includes('recoverypercent') || k.includes('recovery percent') || k.includes('recovery cap');
  }

  formatPercent(val: any): string {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (isNaN(num)) return String(val).includes('%') ? val : `${val}%`;
    return `${num}%`;
  }

  isArrearKey(key: string): boolean {
    if (!key) return false;
    return key.toLowerCase().includes('arrear');
  }

  formatHeaderKey(key: string): string {
    if (!key) return '';
    const map: { [k: string]: string } = {
      'CarryForwardDeficit_In': 'Brought-Fwd Deficit',
      'CarryForwardDeficit_Out': 'Carry-Fwd Deficit',
      'Carry Forward Deficit In': 'Brought-Fwd Deficit',
      'Carry Forward Deficit Out': 'Carry-Fwd Deficit',
      'RecoveryPercent': 'Recovery Cap %',
      'Recovery Cap %': 'Recovery Cap %',
      'Capped Recovery Amount': 'Capped Recovery Amount',
      'Incentive_Applied_Rate': 'Incentive Applied Rate',
      'Incentive_Payable': 'Incentive Payable',
      'IncentiveRate': 'Incentive Rate',
      'IncentiveRateType': 'Incentive Rate Type',
      'IncentivePackets': 'Incentive Packets',
      'IsDeductionsSynced': 'Deductions Synced',
      'Deductions Synced': 'Deductions Synced',
      'DeductionSyncDate': 'Deduction Sync Date',
      'SyncedBy': 'Synced By',
      'SyncedByName': 'Synced By',
      'Synced By Name': 'Synced By',
      'SyncRemarks': 'Sync Remarks',
      'RecoveryPolicyApplied': 'Recovery Policy Applied',
      'Recovery Policy Applied': 'Recovery Policy Applied',
      'Payment_ProcessedBy': 'Payment Processed By',
      'Payment_ProcessedByName': 'Payment Processed By',
      'Payment Processed By Name': 'Payment Processed By',
      'Payment_Date': 'Payment Date',
      'Payment_Mode': 'Payment Mode',
      'Payment_TransactionNo': 'Payment Transaction No',
      'Payment_BankName': 'Payment Bank Name',
      'Payment_AccountNo': 'Payment Account No',
      'Payment_Remarks': 'Payment Remarks',
      'Payment_BatchNo': 'Payment Batch No',
      'Payment_ProcessedDate': 'Payment Processed Date'
    };
    if (map[key]) return map[key];
    return key.replace(/_/g, ' ');
  }

  isRecoveryPolicyKey(key: string): boolean {
    if (!key) return false;
    const k = key.toLowerCase().replace(/[^a-z]/g, '');
    return k === 'recoverypolicyapplied' || k === 'recoverypolicy';
  }

  isDateKey(key: string): boolean {
    if (!key) return false;
    const k = key.toLowerCase();
    return k.includes('date') || k.includes('synced on') || k.includes('synced date');
  }

  formatDateValue(val: any): string {
    if (val === null || val === undefined || val === '') return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const strVal = String(val);
      if (strVal.includes('T') || (strVal.includes(':') && (d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0))) {
        const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${datePart} ${timePart}`;
      }
      return datePart;
    } catch {
      return val;
    }
  }

  isCurrencyKey(key: string): boolean {
    if (!key) return false;
    if (this.isPercentKey(key) || this.isBooleanSyncedKey(key)) return false;
    const k = key.toLowerCase();
    return k.includes('payable') || k.includes('base payable') || k.includes('gross payable') ||
           k.includes('incentive_payable') || k.includes('incentive payable') ||
           k.includes('gst amount') || k.includes('tds amount') || k.includes('total payable') ||
           k.includes('deficit') || k.includes('capped recovery') || k.includes('cap amount');
  }

  isDeficitKey(key: string): boolean {
    if (!key) return false;
    return key.toLowerCase().includes('deficit');
  }

  isNetPayableKey(key: string): boolean {
    if (!key) return false;
    const k = key.toLowerCase();
    return k === 'net payable' || k === 'net_payable';
  }

  isDeductionKey(key: string): boolean {
    if (!key) return false;
    if (this.isBooleanSyncedKey(key) || this.isPercentKey(key) || this.isCurrencyKey(key)) return false;
    const k = key.toLowerCase();
    if (k.includes('date') || k.includes('remark') || k.includes('by') || k.includes('status')) return false;
    return k.includes('deduction') || k.includes('ded_') || k.includes('hold') || 
           k.includes('arrear') || k.includes('advance') || k.includes('rent') || 
           k.includes('insurance') || k.includes('welfare') || k.includes('sd') || 
           k.includes('karma') || k.includes('cod') || k.includes('tnt') || 
           k.includes('penalty') || k.includes('other');
  }

  hasDeductionAmount(val: any): boolean {
    if (val === null || val === undefined || typeof val === 'boolean') return false;
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }

  getStandardDbColumnForKey(key: string): string {
    if (!key) return '';
    const k = key.toLowerCase().trim();
    if (k === 'ded_shipment') return 'Ded_Shipment';
    if (k === 'ded_cod') return 'Ded_COD';
    if (k === 'ded_rent') return 'Ded_Rent';
    if (k === 'ded_advance') return 'Ded_Advance';
    if (k === 'ded_hold') return 'Ded_Hold';
    if (k === 'ded_karmalife') return 'Ded_KarmaLife';
    if (k === 'ded_arrear') return 'Ded_Arrear';
    if (k === 'ded_sd') return 'Ded_SD';
    if (k === 'ded_tnt') return 'Ded_TNT';
    if (k === 'ded_welfare') return 'Ded_Welfare';
    if (k === 'ded_insurance') return 'Ded_Insurance';
    if (k === 'ded_other') return 'Ded_Other';

    if (k.includes('cod')) return 'Ded_COD';
    if (k.includes('rent')) return 'Ded_Rent';
    if (k.includes('advance')) return 'Ded_Advance';
    if (k.includes('hold')) return 'Ded_Hold';
    if (k.includes('karma')) return 'Ded_KarmaLife';
    if (k.includes('arrear')) return 'Ded_Arrear';
    if (k.includes('sd')) return 'Ded_SD';
    if (k.includes('tnt')) return 'Ded_TNT';
    if (k.includes('welfare')) return 'Ded_Welfare';
    if (k.includes('insurance')) return 'Ded_Insurance';
    if (k.includes('other')) return 'Ded_Other';
    if (k.includes('shipment') || k === 'deduction' || k.includes('penalty')) return 'Ded_Shipment';
    return '';
  }

  openDeductionBreakdown(txn: any, key: string): void {
    const txnId = txn.TransactionID || txn.transactionId || txn.pk_TransactionID || txn.pk_transactionId;
    if (!txnId) {
      this.toastrService.warning('Transaction ID is not available on this record. Please rebuild the backend to enable breakdown details.', 'Notice');
      return;
    }

    this.selectedTxn = txn;
    this.selectedDeductionKey = key;
    this.isBreakdownLoading = true;
    this.isBreakdownModalOpen = true;

    const stdCol = this.getStandardDbColumnForKey(key);
    this.vendorService.getDeductionBreakdown(txnId, stdCol).subscribe({
      next: (res: any) => {
        this.isBreakdownLoading = false;
        this.breakdownEntries = res?.data || [];
      },
      error: (err: any) => {
        this.isBreakdownLoading = false;
        this.breakdownEntries = [];
        this.toastrService.error(err?.error?.message || 'Error loading deduction breakdown details.', 'Error');
      }
    });
  }


  closeBreakdownModal(): void {
    this.isBreakdownModalOpen = false;
    this.selectedTxn = null;
    this.breakdownEntries = [];
  }

  get totalBreakdownAmount(): number {
    return (this.breakdownEntries || []).reduce((sum, item) => sum + (Number(item.Amount) || 0), 0);
  }
}














