import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as FileSaver from 'file-saver';
import { VendorService } from '../Service/vendor.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';

@Component({
  selector: 'app-vendor-opening-deficit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule, RouterModule],
  templateUrl: './vendor-opening-deficit.component.html',
  styleUrls: ['./vendor-opening-deficit.component.scss']
})
export class VendorOpeningDeficitComponent implements OnInit {
  activeTab: 'single' | 'bulk' = 'single';

  // Single Entry Form
  singleForm!: FormGroup;
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];
  linkedVendors: any[] = [];
  isLoadingVendors: boolean = false;
  isSavingSingle: boolean = false;

  // Bulk Upload State
  selectedBulkFile: File | null = null;
  isUploadingBulk: boolean = false;

  // List & Filter State
  filterForm!: FormGroup;
  filterModelList: any[] = [];
  deficitsList: any[] = [];
  filteredDeficits: any[] = [];
  isLoadingList: boolean = false;
  pageIndex: number = 1;
  pageSize: number = 15;
  searchTerm: string = '';
  statusFilter: string = 'ALL';

  // KPI Metrics
  totalCount: number = 0;
  totalOpeningAmount: number = 0;
  totalRecoveredAmount: number = 0;
  totalPendingBalance: number = 0;
  recoveryRate: number = 0;

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
    this.loadDeficitsList();
  }

  private initForms(): void {
    const today = new Date();
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const defaultCutoff = this.formatDate(prevMonthEnd);

    // Single Entry Form
    this.singleForm = this.fb.group({
      clientId: [null, Validators.required],
      modelId: [null, Validators.required],
      locationId: [''],
      fhrid: ['', Validators.required],
      vendorCode: [''],
      deficitAmount: [null, [Validators.required, Validators.min(0.01)]],
      cutoffDate: [defaultCutoff, Validators.required],
      remarks: ['Legacy system opening deficit balance']
    });

    this.singleForm.get('clientId')?.valueChanges.subscribe((cId: any) => {
      this.singleForm.get('modelId')?.setValue(null, { emitEvent: false });
      this.modelList = [];
      this.linkedVendors = [];
      if (cId) {
        const id = typeof cId === 'object' ? (cId?.value || cId?.id) : cId;
        this.clientService.getModelListByClient(id).subscribe({
          next: (res: any) => {
            this.modelList = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
          }
        });
      }
    });

    this.singleForm.get('modelId')?.valueChanges.subscribe(() => {
      this.loadLinkedVendors();
    });

    this.singleForm.get('locationId')?.valueChanges.subscribe(() => {
      this.loadLinkedVendors();
    });

    // List Filter Form
    this.filterForm = this.fb.group({
      clientId: [null],
      modelId: [null],
      locationId: [''],
      status: ['ALL']
    });

    this.filterForm.get('clientId')?.valueChanges.subscribe((cId: any) => {
      this.filterForm.get('modelId')?.setValue(null, { emitEvent: false });
      this.filterModelList = [];
      if (cId) {
        const id = typeof cId === 'object' ? (cId?.value || cId?.id) : cId;
        this.clientService.getModelListByClient(id).subscribe({
          next: (res: any) => {
            this.filterModelList = res?.isSuccess && Array.isArray(res.data) ? res.data : [];
          }
        });
      }
      this.applyFilter();
    });

    this.filterForm.get('modelId')?.valueChanges.subscribe(() => this.applyFilter());
    this.filterForm.get('locationId')?.valueChanges.subscribe(() => this.applyFilter());
    this.filterForm.get('status')?.valueChanges.subscribe((val) => {
      this.statusFilter = val || 'ALL';
      this.applyFilter();
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadClients(): void {
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.clientList = res.data.slice(1);
        }
      }
    });
  }

  loadLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        this.locationList = data || [];
      }
    });
  }

  loadLinkedVendors(): void {
    const cId = this.singleForm.get('clientId')?.value;
    const mId = this.singleForm.get('modelId')?.value;
    const locId = this.singleForm.get('locationId')?.value || '';
    if (!cId || !mId) {
      this.linkedVendors = [];
      return;
    }
    const clientId = typeof cId === 'object' ? (cId?.value || cId?.id) : cId;
    const modelId = typeof mId === 'object' ? (mId?.value || mId?.id) : mId;

    this.isLoadingVendors = true;
    this.vendorService.getLinkedVendors(clientId, modelId, locId).subscribe({
      next: (res: any) => {
        this.isLoadingVendors = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.linkedVendors = res.data.map((item: any) => ({
            ...item,
            displayName: `${item.vendorCode} - ${item.vendorName} (${item.fhrid})`
          }));
        } else {
          this.linkedVendors = [];
        }
      },
      error: () => {
        this.isLoadingVendors = false;
        this.linkedVendors = [];
      }
    });
  }

  onLinkedVendorSelect(selected: any): void {
    if (selected) {
      this.singleForm.patchValue({
        fhrid: selected.fhrid || '',
        vendorCode: selected.vendorCode || ''
      });
    }
  }

  saveSingleOpeningDeficit(): void {
    if (this.singleForm.invalid) {
      this.singleForm.markAllAsTouched();
      this.toastr.warning('Please fill in Client, Model, FHRID, Amount and Cutoff Date.', 'Validation Warning');
      return;
    }

    const v = this.singleForm.value;
    const clientId = typeof v.clientId === 'object' ? (v.clientId?.value || v.clientId?.id) : v.clientId;
    const modelId = typeof v.modelId === 'object' ? (v.modelId?.value || v.modelId?.id) : v.modelId;

    const payload = {
      clientId: Number(clientId),
      modelId: Number(modelId),
      locationId: v.locationId || '',
      fhrid: (v.fhrid || '').trim(),
      vendorCode: (v.vendorCode || '').trim(),
      deficitAmount: Number(v.deficitAmount),
      cutoffDate: v.cutoffDate,
      remarks: v.remarks || 'Legacy system opening deficit balance'
    };

    this.isSavingSingle = true;
    this.vendorService.saveOpeningDeficit(payload).subscribe({
      next: (res: any) => {
        this.isSavingSingle = false;
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Opening deficit saved successfully!', 'Success');
          this.resetSingleForm();
          this.loadDeficitsList();
        } else {
          this.toastr.error(res?.message || 'Failed to save opening deficit.', 'Error');
        }
      },
      error: (err: any) => {
        this.isSavingSingle = false;
        this.toastr.error(err?.error?.message || err?.message || 'Server error while saving opening deficit.', 'Error');
      }
    });
  }

  resetSingleForm(): void {
    const today = new Date();
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    this.singleForm.reset({
      clientId: null,
      modelId: null,
      locationId: '',
      fhrid: '',
      vendorCode: '',
      deficitAmount: null,
      cutoffDate: this.formatDate(prevMonthEnd),
      remarks: 'Legacy system opening deficit balance'
    });
    this.modelList = [];
    this.linkedVendors = [];
  }

  // Bulk Upload
  onBulkFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        this.toastr.warning('Please select a valid Excel file (.xlsx or .xls).', 'Invalid File');
        event.target.value = '';
        this.selectedBulkFile = null;
        return;
      }
      this.selectedBulkFile = file;
    }
  }

  downloadTemplate(): void {
    this.vendorService.downloadOpeningDeficitTemplate().subscribe({
      next: (blob: Blob) => {
        FileSaver.saveAs(blob, 'Vendor_Opening_Deficit_Template.xlsx');
        this.toastr.success('Opening deficit template downloaded successfully.', 'Downloaded');
      },
      error: () => {
        this.toastr.error('Failed to download Excel template.', 'Error');
      }
    });
  }

  uploadBulkFile(): void {
    if (!this.selectedBulkFile) {
      this.toastr.warning('Please select an Excel file to upload.', 'No File Selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedBulkFile);

    this.isUploadingBulk = true;
    this.vendorService.bulkUploadOpeningDeficit(formData).subscribe({
      next: (res: any) => {
        this.isUploadingBulk = false;
        if (res?.isSuccess) {
          const count = res?.data?.uploadedCount ?? res?.data?.UploadedCount ?? 'all';
          this.toastr.success(res.message || `${count} opening deficit record(s) imported into ledger successfully!`, 'Bulk Import Complete');
          this.selectedBulkFile = null;
          this.loadDeficitsList();
        } else {
          this.toastr.error(res?.message || 'Bulk upload failed.', 'Error');
        }
      },
      error: (err: any) => {
        this.isUploadingBulk = false;
        this.toastr.error(err?.error?.message || err?.message || 'Server error during bulk upload.', 'Error');
      }
    });
  }

  // List Management
  loadDeficitsList(): void {
    this.isLoadingList = true;
    this.vendorService.getOpeningDeficitsList().subscribe({
      next: (res: any) => {
        this.isLoadingList = false;
        if (res?.isSuccess && Array.isArray(res.data)) {
          this.deficitsList = res.data;
        } else {
          this.deficitsList = [];
        }
        this.applyFilter();
      },
      error: (err: any) => {
        this.isLoadingList = false;
        this.deficitsList = [];
        this.applyFilter();
        this.toastr.error(err?.message || 'Failed to load opening deficits list.', 'Error');
      }
    });
  }

  applyFilter(): void {
    const v = this.filterForm?.value || {};
    const clientId = v.clientId ? (typeof v.clientId === 'object' ? v.clientId.value || v.clientId.id : v.clientId) : null;
    const modelId = v.modelId ? (typeof v.modelId === 'object' ? v.modelId.value || v.modelId.id : v.modelId) : null;
    const rawLoc = v.locationId;
    const locationId = (typeof rawLoc === 'object' ? (rawLoc?.value || rawLoc?.name || '') : (rawLoc || '')).trim().toLowerCase();
    const status = this.statusFilter || 'ALL';
    const search = (this.searchTerm || '').trim().toLowerCase();

    this.filteredDeficits = this.deficitsList.filter((item: any) => {
      if (clientId && Number(item.clientID) !== Number(clientId)) return false;
      if (modelId && Number(item.modelID) !== Number(modelId)) return false;
      if (locationId && (item.locationId || '').toLowerCase().indexOf(locationId) === -1) return false;

      if (status !== 'ALL') {
        if (item.recoveryStatus !== status) return false;
      }

      if (search) {
        const fhrid = (item.fhrid || '').toLowerCase();
        const vcode = (item.vendorCode || '').toLowerCase();
        const vname = (item.vendorName || '').toLowerCase();
        const cname = (item.clientName || '').toLowerCase();
        const mname = (item.modelName || '').toLowerCase();
        const remarks = (item.remarks || '').toLowerCase();
        if (
          !fhrid.includes(search) &&
          !vcode.includes(search) &&
          !vname.includes(search) &&
          !cname.includes(search) &&
          !mname.includes(search) &&
          !remarks.includes(search)
        ) {
          return false;
        }
      }

      return true;
    });

    this.calculateKpis();
    this.pageIndex = 1;
  }

  private calculateKpis(): void {
    this.totalCount = this.filteredDeficits.length;
    this.totalOpeningAmount = this.filteredDeficits.reduce((sum, x) => sum + (Number(x.deficitAmount) || 0), 0);
    this.totalRecoveredAmount = this.filteredDeficits.reduce((sum, x) => sum + (Number(x.recoveredAmount) || 0), 0);
    this.totalPendingBalance = this.filteredDeficits.reduce((sum, x) => sum + (Number(x.pendingBalance) || 0), 0);
    this.recoveryRate = this.totalOpeningAmount > 0 ? Math.min(100, (this.totalRecoveredAmount / this.totalOpeningAmount) * 100) : 0;
  }

  resetListFilters(): void {
    this.filterForm.reset({
      clientId: null,
      modelId: null,
      locationId: '',
      status: 'ALL'
    });
    this.statusFilter = 'ALL';
    this.searchTerm = '';
    this.applyFilter();
  }

  deleteOpeningDeficit(item: any): void {
    if (!item?.carryForwardId) return;

    if (item.recoveryStatus !== 'Pending' || item.recoveredAmount > 0) {
      this.toastr.warning('Cannot delete an opening deficit that has already been partially or fully recovered.', 'Action Not Allowed');
      return;
    }

    if (!confirm(`Are you sure you want to delete the opening deficit of ₹${item.deficitAmount} for vendor "${item.vendorName || item.fhrid}"?`)) {
      return;
    }

    this.vendorService.deleteOpeningDeficit(item.carryForwardId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'Opening deficit deleted successfully.', 'Deleted');
          this.loadDeficitsList();
        } else {
          this.toastr.error(res?.message || 'Failed to delete opening deficit.', 'Error');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.message || 'Error deleting opening deficit.', 'Error');
      }
    });
  }

  copyForExcel(): void {
    if (!this.filteredDeficits.length) {
      this.toastr.info('No data to copy.', 'Empty');
      return;
    }

    const headers = [
      'ID', 'Cutoff Date', 'Client', 'Model', 'Location', 'FHR ID',
      'Vendor Code', 'Vendor Name', 'Opening Deficit', 'Recovered',
      'Pending Balance', 'Status', 'Remarks'
    ];

    const rows = this.filteredDeficits.map(e => [
      e.carryForwardId,
      e.cutoffDate ? new Date(e.cutoffDate).toISOString().split('T')[0] : '',
      e.clientName || '',
      e.modelName || '',
      e.locationId || '',
      e.fhrid || '',
      e.vendorCode || '',
      e.vendorName || '',
      e.deficitAmount || 0,
      e.recoveredAmount || 0,
      e.pendingBalance || 0,
      e.recoveryStatus || '',
      e.remarks || ''
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      this.toastr.success('TSV copied to clipboard! You can now paste directly into Excel.', 'Copied for Excel');
    }).catch(() => {
      this.toastr.error('Failed to copy to clipboard.', 'Error');
    });
  }
}
