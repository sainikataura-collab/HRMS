import { CommonModule } from '@angular/common';
import { FactBoxComponent } from '../shared/fact-box/fact-box.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { VendorService } from '../Service/vendor.service';

@Component({
  selector: 'app-vendor-fhrid-mapping-upload',
  standalone: true,
  imports: [FactBoxComponent, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './vendor-fhrid-mapping-upload.component.html',
  styleUrls: ['./vendor-fhrid-mapping-upload.component.scss']
})
export class VendorFhridMappingUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isUploading: boolean = false;
  headerError: string = '';

  // Fact Box
  isFactBoxOpen: boolean = true;
  uploadedFiles: any[] = [];
  isLoadingFiles: boolean = false;
  factBoxPageIndex: number = 1;
  factBoxPageSize: number = 5;

  // Data & Filtering
  importedData: any[] = [];
  filteredData: any[] = [];
  searchControl = new FormControl('');
  searchText: string = '';
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  // Metrics
  uploadedCount: number = 0;
  notUploadedCount: number = 0;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private vendorService: VendorService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUploadedFiles();

    this.searchControl.valueChanges.subscribe(val => {
      this.searchText = val?.toLowerCase() || '';
      this.filterData();
    });
  }

  private initForm(): void {
    this.uploadForm = this.fb.group({
      file: [null, [Validators.required]]
    });
  }

  /**
   * Export Blank Excel Template with exactly the 4 required columns and sample rows
   */
  exportTemplate(): void {
    const headers = ['Vendor Code', 'Client', 'Model', 'FHR ID'];
    const sampleRows = [
      {
        'Vendor Code': 'V001',
        'Client': 'Amazon',
        'Model': 'DSP',
        'FHR ID': 'FHR1002'
      },
      {
        'Vendor Code': 'V002',
        'Client': 'Ebees',
        'Model': 'Variable(E)',
        'FHR ID': 'FHR1001012'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // Set column widths
    worksheet['!cols'] = [
      { wch: 18 }, // Vendor Code
      { wch: 15 }, // Client
      { wch: 15 }, // Model
      { wch: 20 }  // FHR ID
    ];

    // Style Header Row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:D3');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '3080E8' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor_FHRID_Mapping');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(blob, 'Vendor_FHRID_Mapping_Template.xlsx');
    this.toastr.info('Blank template downloaded successfully.');
  }

  /**
   * File selection and strict header validation
   */
  onFileChange(event: any): void {
    this.headerError = '';
    const file = event.target.files?.[0];

    if (!file) {
      this.resetFileOnly();
      return;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      this.headerError = 'Only .xlsx and .xls Excel files are supported.';
      this.resetFileOnly();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!json || json.length === 0) {
          this.headerError = 'The selected file is empty.';
          this.resetFileOnly();
          return;
        }

        const headerRow: string[] = (json[0] || []).map((h: any) =>
          h?.toString().trim().replace(/[\s_]+/g, '').toLowerCase() || ''
        );

        const hasVendor = headerRow.some(h => ['vendorcode', 'code', 'pkrecid', 'vendor'].includes(h));
        const hasClient = headerRow.some(h => ['client', 'clientid', 'fkclientid', 'vendorfkclientid', 'costcentre'].includes(h));
        const hasModel = headerRow.some(h => ['model', 'modelid', 'fkmodelid', 'vendorfkmodelid'].includes(h));
        const hasFhr = headerRow.some(h => ['fhrid', 'vendorfhrid', 'vendorhfrid', 'hfrid'].includes(h));

        const missing: string[] = [];
        if (!hasVendor) missing.push('Vendor Code');
        if (!hasClient) missing.push('Client');
        if (!hasModel) missing.push('Model');
        if (!hasFhr) missing.push('FHR ID');

        if (missing.length > 0) {
          this.headerError = `Missing mandatory column(s): ${missing.join(', ')}.`;
          this.resetFileOnly();
          this.toastr.error(this.headerError, 'Invalid Excel Columns');
          return;
        }

        // Valid file
        this.selectedFile = file;
        this.uploadForm.patchValue({ file: file });
        this.uploadForm.get('file')?.setErrors(null);
      } catch (err: any) {
        this.headerError = 'Could not read Excel headers: ' + (err.message || err);
        this.resetFileOnly();
      }
    };
    reader.readAsArrayBuffer(file);
  }

  resetFileOnly(): void {
    this.selectedFile = null;
    this.uploadForm.patchValue({ file: null });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  resetForm(): void {
    this.resetFileOnly();
    this.headerError = '';
    this.importedData = [];
    this.filteredData = [];
    this.searchControl.setValue('');
    this.currentFilter = 'All';
    this.uploadedCount = 0;
    this.notUploadedCount = 0;
  }

  /**
   * Submit to backend endpoint
   */
  onSubmit(): void {
    if (!this.selectedFile) {
      this.uploadForm.get('file')?.markAsTouched();
      this.toastr.warning('Please select an Excel file to import.');
      return;
    }

    if (this.headerError) {
      this.toastr.error(this.headerError);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.isUploading = true;
    this.loader.start();

    this.vendorService.uploadVendorFHRIDMappingExcel(formData).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        this.loader.stop();

        if (res && res.isSuccess) {
          const data = res.data || [];
          this.importedData = data;
          this.calculateMetrics();
          this.filterData();
          this.loadUploadedFiles();

          if (this.notUploadedCount === 0) {
            this.toastr.success(res.message || 'All records imported successfully!');
          } else if (this.uploadedCount > 0) {
            this.toastr.warning(res.message || 'Imported with some errors.');
          } else {
            this.toastr.error(res.message || 'Failed to import records.');
          }
        } else {
          this.toastr.error(res?.message || 'Error processing Excel file.');
        }
      },
      error: (err: any) => {
        this.isUploading = false;
        this.loader.stop();
        this.toastr.error(err?.error?.message || err?.message || 'Server error occurred during import.');
      }
    });
  }

  private calculateMetrics(): void {
    this.uploadedCount = this.importedData.filter(d => {
      const status = d.status || d.Status;
      return status === 'Inserted' || status === 'Updated' || status === 'Uploaded' || status === 'Success' || status === 'Already Exists';
    }).length;

    this.notUploadedCount = this.importedData.length - this.uploadedCount;
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData(): void {
    const term = this.searchText;
    this.filteredData = this.importedData.filter(item => {
      const vCode = (item.vendorCode || item.VendorCode || '').toLowerCase();
      const vName = (item.vendorName || item.VendorName || '').toLowerCase();
      const client = (item.client || item.Client || '').toLowerCase();
      const model = (item.model || item.Model || '').toLowerCase();
      const fhr = (item.fhrid || item.fhrId || item.FHRID || '').toLowerCase();
      const msg = (item.message || item.Message || item.remarks || item.Remarks || '').toLowerCase();

      const matchesSearch = !term || vCode.includes(term) || vName.includes(term) || client.includes(term) || model.includes(term) || fhr.includes(term) || msg.includes(term);

      const status = item.status || item.Status;
      const isSuccess = status === 'Inserted' || status === 'Updated' || status === 'Uploaded' || status === 'Success' || status === 'Already Exists';
      const isFailed = !isSuccess;

      let matchesFilter = true;
      if (this.currentFilter === 'Uploaded') matchesFilter = isSuccess;
      if (this.currentFilter === 'Not Uploaded') matchesFilter = isFailed;

      return matchesSearch && matchesFilter;
    });
  }

  /**
   * Export imported results to Excel
   */
  exportResults(): void {
    if (!this.importedData.length) return;

    const exportRows = this.importedData.map((item, index) => {
      let statusDisplay = 'Uploaded';
      const st = item.status || item.Status;
      if (st === 'Failed' || st === 'Error') {
        statusDisplay = `Failed - ${item.message || item.Message || item.remarks || item.Remarks || 'Validation error'}`;
      } else if (st === 'Already Exists' || st === 'Skipped') {
        statusDisplay = 'Already Exists';
      } else {
        statusDisplay = 'Uploaded';
      }

      return {
        'Sr. No': index + 1,
        'Status / Remarks': statusDisplay,
        'Vendor Code': item.vendorCode || item.VendorCode || '',
        'Vendor Name': item.vendorName || item.VendorName || '',
        'Client': item.client || item.Client || '',
        'Model': item.model || item.Model || '',
        'FHR ID': item.fhrid || item.fhrId || item.FHRID || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import_Results');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(blob, `Vendor_FHRID_Mapping_Results_${new Date().getTime()}.xlsx`);
    this.toastr.info('Results exported successfully.');
  }

  /**
   * Fact Box: Toggle visibility
   */
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  /**
   * Fact Box: Load uploaded file history sorted descending by date
   */
  loadUploadedFiles(): void {
    this.isLoadingFiles = true;
    this.vendorService.getVendorFHRIDFiles().subscribe({
      next: (res: any) => {
        this.isLoadingFiles = false;
        if (res && res.isSuccess && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
          this.uploadedFiles = list.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.Date).getTime();
            const dateB = new Date(b.date || b.Date).getTime();
            return dateB - dateA;
          });
        } else if (Array.isArray(res)) {
          this.uploadedFiles = res.sort((a: any, b: any) => {
            const dateA = new Date(a.date || a.Date).getTime();
            const dateB = new Date(b.date || b.Date).getTime();
            return dateB - dateA;
          });
        } else {
          this.uploadedFiles = [];
        }
      },
      error: (err: any) => {
        this.isLoadingFiles = false;
        console.error('Error loading uploaded files for fact box:', err);
      }
    });
  }

  /**
   * Fact Box: Download uploaded original file
   */
  downloadUploadedFile(fileItem: any): void {
    const fileId = fileItem?.file_Id ?? fileItem?.File_Id ?? fileItem?.id ?? fileItem?.Id;
    if (!fileId) return;

    this.loader.start();
    this.vendorService.downloadVendorFHRIDFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        const fileName = fileItem.name || `Vendor_FHRID_Mapping_${fileId}.xlsx`;
        FileSaver.saveAs(blob, fileName);
        this.toastr.success(`Downloaded ${fileName}`);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading file:', err);
        this.toastr.error('Failed to download file. Please check if the file exists on the server.');
      }
    });
  }

  /**
   * Fact Box: Resolve uploader display name
   */
  getUploaderDisplayName(fileItem: any): string {
    const raw = fileItem?.uploadedBy || fileItem?.UploadedBy;
    if (!raw) return '';

    const currentUserName = sessionStorage.getItem('username') || localStorage.getItem('username') || '';
    const currentUserId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || localStorage.getItem('userId') || '';

    // If ID was stored (e.g. GU-20) and matches current user or is a code, display the known full user name
    if (currentUserName && (raw === currentUserId || raw.startsWith('GU-') || raw.startsWith('USR-'))) {
      return currentUserName;
    }
    return raw;
  }
}

