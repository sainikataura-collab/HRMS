import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style';

import { FactBoxComponent } from '../shared/fact-box/fact-box.component';
import { VendorService } from '../Service/vendor.service';
import { ClientMasterService } from '../../payroll/services/client-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';

@Component({
  selector: 'app-vendor-deduction-upload',
  standalone: true,
  imports: [FactBoxComponent, CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule, NgxPaginationModule],
  templateUrl: './vendor-deduction-upload.component.html',
  styleUrls: ['./vendor-deduction-upload.component.scss']
})
export class VendorDeductionUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;

  // Search & Filtering
  searchControl = new FormControl('');
  searchText = '';
  importedData: any[] = [];
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  // Dropdown lists
  clientList: any[] = [];
  modelList: any[] = [];
  locationList: any[] = [];

  // Loading flags
  isUploading: boolean = false;
  isFiltering: boolean = false;
  isDownloadingTemplate: boolean = false;
  isLocationsLoading: boolean = false;

  // Fact Box Sidebar state (Matching Screenshot 3)
  isFactBoxOpen: boolean = true;
  uploadedFiles: any[] = [];
  isLoadingFiles: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private vendorService: VendorService,
    private clientService: ClientMasterService,
    private commanService: ManualPunchBio,
    private dropdownService: DropdownService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadUploadHistory();

    this.searchControl.valueChanges.subscribe(val => {
      this.searchText = val?.toLowerCase() || '';
      this.filterData();
    });
  }

  initForm(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    let fromDate = '';
    let toDate = '';

    if (day <= 15) {
      fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      toDate = `${year}-${String(month + 1).padStart(2, '0')}-15`;
    } else {
      fromDate = `${year}-${String(month + 1).padStart(2, '0')}-16`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      toDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    }

    this.uploadForm = this.fb.group({
      client: [null, [Validators.required]],
      model: [null, [Validators.required]],
      location: [null, [Validators.required]],
      fromDate: [fromDate, [Validators.required]],
      toDate: [toDate, [Validators.required]],
      file: [null, [Validators.required]]
    });
  }

  get isTemplateDownloadReady(): boolean {
    const f = this.uploadForm?.value;
    const hasClient = !!f?.client;
    const hasModel = !!f?.model;
    const hasLocation = f?.location !== null && f?.location !== undefined && f?.location !== '';
    const hasFromDate = !!f?.fromDate;
    const hasToDate = !!f?.toDate;
    return hasClient && hasModel && hasLocation && hasFromDate && hasToDate;
  }

  get isAmazonDspSelected(): boolean {
    const clientName = this.getClientName().toLowerCase();
    const modelName = this.getModelName().toLowerCase();
    const modelId = Number(this.uploadForm?.get('model')?.value || 0);
    return clientName.includes('amazon') || modelName.includes('dsp') || modelId === 4 || modelId === 5;
  }

  loadClients(): void {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res: any) => {
        const rawList = res?.data || res || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          this.clientList = rawList.map((c: any) => ({
            value: Number(c.client_id || c.id || c.clientId || c.value),
            name: String(c.client_name || c.name || c.clientName || '').trim()
          })).filter((c: any) => c.name && !isNaN(c.value) && c.value > 0);
        }
      },
      error: () => {
        this.clientList = [];
      }
    });
  }

  onClientChange(clientVal: any): void {
    this.uploadForm.get('model')?.setValue(null);
    this.uploadForm.get('location')?.setValue(null);
    this.modelList = [];
    this.locationList = [];
    this.resetResults();

    const clientId = clientVal?.value !== undefined ? clientVal.value : clientVal;
    if (!clientId) return;

    this.clientService.getModelListByClient(clientId).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res : (res?.data || []);
        this.modelList = raw.map((m: any) => ({
          value: Number(m.value || m.id || m.modelId),
          name: String(m.name || m.text || m.modelName || '').trim()
        })).filter((m: any) => m.name && !isNaN(m.value));
      },
      error: () => {
        this.vendorService.getModelListByClient(clientId).subscribe({
          next: (resFallback: any) => {
            const rawFallback = Array.isArray(resFallback) ? resFallback : (resFallback?.data || []);
            this.modelList = rawFallback.map((m: any) => ({
              value: Number(m.value || m.id || m.modelId),
              name: String(m.name || m.text || m.modelName || '').trim()
            })).filter((m: any) => m.name && !isNaN(m.value));
          },
          error: () => {
            this.modelList = [];
          }
        });
      }
    });
  }

  onModelChange(modelVal: any): void {
    this.uploadForm.get('location')?.setValue(null);
    this.locationList = [];
    this.resetResults();

    const clientId = this.uploadForm.get('client')?.value;
    const modelId = modelVal?.value !== undefined ? modelVal.value : modelVal;
    if (!clientId || !modelId) return;

    this.isLocationsLoading = true;
    this.vendorService.getLinkedLocations(clientId, modelId).subscribe({
      next: (res: any) => {
        this.isLocationsLoading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const locs = res.data.map((x: any) => ({
            value: String(x.value || x.Value || ''),
            name: String(x.name || x.Name || x.value || '')
          })).filter((x: any) => x.value !== '');

          this.locationList = [
            { value: 'All', name: 'All Locations / Hubs' },
            ...locs
          ];
        } else {
          this.fallbackToGlobalLocations();
        }
      },
      error: () => {
        this.isLocationsLoading = false;
        this.fallbackToGlobalLocations();
      }
    });
  }

  private fallbackToGlobalLocations(): void {
    this.dropdownService.getLocations().subscribe({
      next: (data: any[]) => {
        const locs = (data || []).map((l: any) => ({
          value: String(l.value || l.id || ''),
          name: String(l.name || l.text || '')
        })).filter(l => l.value !== '');

        this.locationList = [
          { value: 'All', name: 'All Locations / Hubs' },
          ...locs
        ];
      },
      error: () => {
        this.locationList = [{ value: 'All', name: 'All Locations / Hubs' }];
      }
    });
  }

  getClientName(): string {
    const val = this.uploadForm.get('client')?.value;
    const found = this.clientList.find(c => c.value == val);
    return found?.name || 'Client';
  }

  getModelName(): string {
    const val = this.uploadForm.get('model')?.value;
    const found = this.modelList.find(m => m.value == val);
    return found?.name || 'Model';
  }

  getLocationName(): string {
    const val = this.uploadForm.get('location')?.value;
    if (!val || val === 'All' || val === '0') return 'All Locations / Hubs';
    const found = this.locationList.find(l => String(l.value) === String(val));
    return found?.name || String(val);
  }

  downloadTemplate(): void {
    if (!this.isTemplateDownloadReady) {
      this.toastr.warning('Please select Client, Model, Location, From Date, and To Date before downloading the template.', 'Selection Required');
      return;
    }

    const clientId = Number(this.uploadForm.get('client')?.value);
    const modelId = Number(this.uploadForm.get('model')?.value);
    const fromDate = this.uploadForm.get('fromDate')?.value;
    const toDate = this.uploadForm.get('toDate')?.value;
    const locVal = this.uploadForm.get('location')?.value;
    const locationId = (!locVal || locVal === 'All' || locVal === '0') ? '' : String(locVal);

    const clientName = this.getClientName();
    const modelName = this.getModelName();

    this.isDownloadingTemplate = true;
    this.vendorService.downloadDeductionExcelTemplate(clientId, modelId, fromDate, toDate, locationId, clientName, modelName).subscribe({
      next: (blob: Blob) => {
        this.isDownloadingTemplate = false;
        const safeClient = clientName.replace(/\s+/g, '_');
        const safeModel = modelName.replace(/\s+/g, '_');
        const filename = `Deductions_Template_${safeClient}_${safeModel}_${fromDate}_${toDate}.xlsx`;
        FileSaver.saveAs(blob, filename);
        this.toastr.success('Pre-populated deduction Excel template downloaded successfully.', 'Template Ready');
      },
      error: (err: any) => {
        this.isDownloadingTemplate = false;
        this.toastr.error(err?.message || 'Failed to download deduction template.', 'Download Error');
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
        this.toastr.error('Please select an Excel file (.xlsx or .xls).', 'Invalid File');
        this.resetFileOnly();
        return;
      }
      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file });
      this.uploadForm.get('file')?.updateValueAndValidity();
    }
  }

  resetFileOnly(): void {
    this.selectedFile = null;
    this.uploadForm.patchValue({ file: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.initForm();
    this.resetFileOnly();
    this.resetResults();
  }

  resetResults(): void {
    this.importedData = [];
    this.filteredData = [];
    this.uploadedCount = 0;
    this.notUploadedCount = 0;
    this.currentFilter = 'All';
    this.searchText = '';
    this.searchControl.setValue('', { emitEvent: false });
  }

  uploadDeductions(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      this.toastr.error('Please complete all required fields and select an Excel file.', 'Validation Error');
      return;
    }

    if (!this.selectedFile) {
      this.toastr.warning('Please choose an Excel file to upload.', 'No File Selected');
      return;
    }

    const clientId = this.uploadForm.get('client')?.value;
    const modelId = this.uploadForm.get('model')?.value;
    const fromDate = this.uploadForm.get('fromDate')?.value;
    const toDate = this.uploadForm.get('toDate')?.value;
    const locVal = this.uploadForm.get('location')?.value;
    const locationId = (!locVal || locVal === 'All' || locVal === '0') ? '' : String(locVal);

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('clientId', String(clientId));
    formData.append('modelId', String(modelId));
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    formData.append('locationId', locationId);
    formData.append('clientName', this.getClientName());
    formData.append('modelName', this.getModelName());
    formData.append('locationName', this.getLocationName());

    this.isUploading = true;
    this.vendorService.uploadDeductionExcel(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        const data = res?.data || {};
        const rows = data.Rows || data.rows || [];

        this.importedData = rows;
        this.uploadedCount = Number(data.UploadedCount ?? data.uploadedCount ?? 0);
        this.notUploadedCount = Number(data.NotUploadedCount ?? data.notUploadedCount ?? (rows.length - this.uploadedCount));

        if (res?.isSuccess) {
          if (this.notUploadedCount > 0) {
            this.toastr.warning(res.message || `Imported ${this.uploadedCount} entries. ${this.notUploadedCount} row(s) had errors.`, 'Partial Import Completed');
          } else {
            this.toastr.success(res.message || `Successfully imported all ${this.uploadedCount} deduction entries!`, 'Import Complete');
          }
        } else {
          this.toastr.error(res?.message || 'None of the deduction rows could be uploaded. Review details below.', 'Upload Failed');
        }

        this.loadUploadHistory();
        this.setFilter('All');
      },
      error: (err: any) => {
        this.isUploading = false;
        const msg = err?.error?.message || err?.message || 'Server error during deduction upload.';
        this.toastr.error(msg, 'Upload Failed');

        const data = err?.error?.data || {};
        if (data.Rows && Array.isArray(data.Rows)) {
          this.importedData = data.Rows;
          this.uploadedCount = 0;
          this.notUploadedCount = data.Rows.length;
          this.setFilter('All');
        }
        this.loadUploadHistory();
      }
    });
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.isFiltering = true;
    setTimeout(() => {
      this.filterData();
      this.isFiltering = false;
    }, 10);
  }

  filterData(): void {
    let rows = [...this.importedData];

    if (this.currentFilter === 'Uploaded') {
      rows = rows.filter(r => r.Status === 'Uploaded' || r.status === 'Uploaded');
    } else if (this.currentFilter === 'Not Uploaded') {
      rows = rows.filter(r => r.Status !== 'Uploaded' && r.status !== 'Uploaded');
    }

    if (this.searchText) {
      const q = this.searchText.toLowerCase();
      rows = rows.filter(r => Object.values(r).some(val => String(val || '').toLowerCase().includes(q)));
    }

    this.filteredData = rows;
  }

  downloadExcelList(): void {
    if (this.filteredData.length === 0) {
      this.toastr.info('No data available to export.', 'Empty List');
      return;
    }

    const exportRows = this.filteredData.map((item, idx) => ({
      '#': idx + 1,
      'Status': item.Status || item.status || 'Uploaded',
      'Reason / Note': item.Reason || item.reason || '',
      'Vendor Code': item.VendorCode || item.vendorCode || '',
      'FHRID': item.FHRID || item.fhrid || '',
      'Vendor Name': item.VendorName || item.vendorName || '',
      'Location / Hub': item.Location || item.location || '',
      'Vehicle Type': item.VehicleType || item.vehicleType || '',
      'Route / Block': item.Route || item.route || '',
      'Deduction Type': item.DeductionType || item.deductionType || '',
      'Amount (₹)': item.Amount || item.amount || 0,
      'Shipment / Waybill ID': item.ShipmentId || item.shipmentId || '',
      'Is Split Shipment?': item.IsSplit || item.isSplit || 'NO',
      'Remarks': item.Remarks || item.remarks || ''
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportRows);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deductions_Import_Results');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `Deduction_Import_Summary_${this.getClientName()}_${this.getModelName()}_${new Date().getTime()}.xlsx`;
    FileSaver.saveAs(dataBlob, filename);
    this.toastr.success('Import summary list exported successfully.', 'Exported');
  }

  // ==========================================
  // FACT BOX / HISTORY SIDEBAR LOGIC
  // ==========================================
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadUploadHistory(): void {
    this.isLoadingFiles = true;
    this.vendorService.getDeductionUploadedFiles().subscribe({
      next: (res: any) => {
        this.isLoadingFiles = false;
        const list = res?.data || res?.Data || [];
        if (Array.isArray(list) && list.length > 0) {
          this.uploadedFiles = list;
        } else {
          const raw = localStorage.getItem('VENDOR_DEDUCTION_UPLOAD_HISTORY');
          this.uploadedFiles = raw ? JSON.parse(raw) : [];
        }
      },
      error: () => {
        this.isLoadingFiles = false;
        const raw = localStorage.getItem('VENDOR_DEDUCTION_UPLOAD_HISTORY');
        this.uploadedFiles = raw ? JSON.parse(raw) : [];
      }
    });
  }

  addHistoryEntry(fileName: string, success: number, failed: number): void {
    const entry = {
      fileName: fileName,
      totalCount: success + failed,
      successCount: success,
      failedCount: failed,
      uploadedByName: 'Current Admin',
      date: new Date().toISOString()
    };
    this.uploadedFiles.unshift(entry);
    if (this.uploadedFiles.length > 20) {
      this.uploadedFiles = this.uploadedFiles.slice(0, 20);
    }
    localStorage.setItem('VENDOR_DEDUCTION_UPLOAD_HISTORY', JSON.stringify(this.uploadedFiles));
  }

  downloadUploadedFile(item: any): void {
    const fileName = item.savedFileName || item.SavedFileName || item.fileName || item.FileName;
    if (!fileName) {
      this.toastr.warning('No file name found for download.', 'Download Warning');
      return;
    }
    this.toastr.info(`Downloading ${item.fileName || fileName}...`, 'Download');
    this.vendorService.downloadDeductionUploadedFile(fileName).subscribe({
      next: (blob: Blob) => {
        FileSaver.saveAs(blob, item.fileName || fileName);
        this.toastr.success('File downloaded successfully.', 'Download Complete');
      },
      error: () => {
        this.downloadExcelList();
      }
    });
  }

  navigateToSingleEntry(): void {
    this.router.navigate(['dash/vendor_management/vendor_managementdashboard/vendor_deduction_entry']);
  }
}
