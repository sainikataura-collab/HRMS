import { FactBoxComponent } from '../shared/fact-box/fact-box.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx-js-style';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as FileSaver from 'file-saver';
import { VendorService } from '../Service/vendor.service';
import { ToastrService } from 'ngx-toastr';

import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-vendor-upload',
  standalone: true,
  imports: [FactBoxComponent, ReactiveFormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './vendor-upload.component.html',
  styleUrl: './vendor-upload.component.scss'
})
export class VendorUploadComponent implements OnInit {
  importedData: any[] = [];
  searchControl = new FormControl('');
  searchText = '';
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  vendorImportForm!: FormGroup;
  selectedFile: File | undefined;
  isUploading: boolean = false;
  isFiltering: boolean = false;
  fileErrorMessage: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // --- Fact Box Properties ---
  isFactBoxOpen: boolean = true;
  factBoxFiles: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 5;
  totalUploadedFiles: number = 0;
  totalPages: number = 1;
  isLoadingFactBox: boolean = false;

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });

    this.vendorImportForm = this.fb.group({
      file: [null, Validators.required]
    });

    this.loadFactBoxFiles();
  }

  // Toggle Fact Box sidebar open/close
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  // Load Paginated Uploaded Files for Fact Box
  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.vendorService.getVendorExcelDocList(this.pageIndex, this.pageSize).subscribe({
      next: (res: any) => {
        this.isLoadingFactBox = false;
        if (res && res.data) {
          const list = res.data.list || (Array.isArray(res.data) ? res.data : []);
          this.factBoxFiles = list;
          this.totalUploadedFiles = res.data.totalCount !== undefined ? res.data.totalCount : (res.totalCount || list.length);
        } else if (Array.isArray(res)) {
          this.factBoxFiles = res;
          this.totalUploadedFiles = res.length;
        } else {
          this.factBoxFiles = [];
          this.totalUploadedFiles = 0;
        }
        this.totalPages = Math.ceil(this.totalUploadedFiles / this.pageSize) || 1;
      },
      error: (err: any) => {
        this.isLoadingFactBox = false;
        console.error('Error loading Fact Box files:', err);
      }
    });
  }

  // Pagination Change
  onPageChange(newPage: number): void {
    if (newPage >= 1) {
      this.pageIndex = newPage;
      this.loadFactBoxFiles();
    }
  }

  // Download uploaded file directly from Fact Box
  downloadFactBoxFile(file: any): void {
    const fileId = file.File_Id || file.file_Id || file.fileId || file.pk_id || file.id;
    const fileName = file.savedFileName || file.originalFileName || file.name || file.Name || 'Vendor_Upload.xlsx';
    if (!fileId) return;

    this.loader.start();
    this.vendorService.downloadVendorExcelDoc(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading file from Fact Box:', err);
        alert('Unable to download file.');
      }
    });
  }

  // Export blank sample template Excel with AutoFit & Blue/Red styling
  exportTemplate(): void {
    const headers = [
      'VendorName *',
      'FatherName',
      'ContactNo',
      'Gender *',
      'DOB',
      'Address',
      'State *',
      'City',
      'BankName',
      'AccountNo',
      'IFSCCode',
      'PANNo',
      'AadhaarNo',
      'GSTNo',
      'GSTPercentage',
      'TDSPercentage *',
      'Agent Code',
      'LegalName',
      'EmergencyContactNo',
      'EmailID',
      'EShramCardNo',
      // 'AyushmanCard',
      'AyushmanCardNo',
      'AccountHolderName *',
      'PermanentPinCode',
      'CurrentPinCode'
    ];

    const sampleRow: any = {
      'VendorName *': 'ABC Enterprises',
      'FatherName': 'John Doe Sr',
      'ContactNo': '9876543210',
      'Gender *': 'Male',
      'DOB': '15-08-1990',
      'Address': '123 Business Park, MG Road',
      'State *': 'Haryana',
      'City': 'Gurgaon',
      'BankName': 'HDFC Bank',
      'AccountNo': '50100234567890',
      'IFSCCode': 'HDFC0001234',
      'PANNo': 'ABCDE1234F',
      'AadhaarNo': '123456789012',
      'GSTNo': '09ABCDE1234F1Z5',
      'GSTPercentage': '18',
      'TDSPercentage *': '2',
      'Agent Code': 'V001',
      'LegalName': 'ABC Enterprises Pvt Ltd',
      'EmergencyContactNo': '9876543211',
      'EmailID': 'contact@abcenterprises.com',
      'EShramCardNo': '1234567890123456',
      // AyushmanCard: 'Yes',
      'AyushmanCardNo': 'AYUSH123456',
      'AccountHolderName *': 'John Doe Sr',
      'PermanentPinCode': '122001',
      'CurrentPinCode': '122001'
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

    // Apply Styles to Header Row (Row 1)
    // Blue for general headers, Red for mandatory fields
    headers.forEach((header, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        const isMandatory = header.includes('*');
        ws[cellRef].s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: isMandatory ? 'DC3545' : '0D6EFD' } // Red for mandatory, Blue for others
          },
          font: {
            bold: true,
            color: { rgb: 'FFFFFF' },
            sz: 11,
            name: 'Calibri'
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
          }
        };
      }
    });

    // Enable AutoFit for columns with extra comfortable padding
    ws['!cols'] = headers.map((header) => {
      const headerLen = header ? header.toString().length : 12;
      const sampleVal = sampleRow[header] ? sampleRow[header].toString().length : 0;
      const maxLen = Math.max(headerLen, sampleVal, 10);
      return { wch: maxLen + 5 };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendor Template');

    XLSX.writeFile(wb, 'Vendor_Import_Template.xlsx');
    this.toastr.success('Vendor Excel template downloaded successfully with AutoFit and mandatory highlights.');
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    if (this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.isFiltering = true;

    setTimeout(() => {
      this.filterData();
      this.isFiltering = false;
    }, 10);
  }

  resetForm(): void {
    this.vendorImportForm.reset();
    this.selectedFile = undefined;
    this.fileErrorMessage = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.importedData = [];
    this.filteredData = [];
    this.uploadedCount = 0;
    this.notUploadedCount = 0;
    this.currentFilter = 'All';
  }

  resetFileOnly(): void {
    this.selectedFile = undefined;
    this.fileErrorMessage = '';
    this.vendorImportForm.get('file')?.setValue(null);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(item => item.status === 'Uploaded' || item.status === 'Updated' || item.status === 'Success' || item.isSuccess === true).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccessStatus = item.status === 'Uploaded' || item.status === 'Updated' || item.status === 'Success' || item.isSuccess === true;
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = isSuccessStatus;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = !isSuccessStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }

  onFileChange(event: any): void {
    this.fileErrorMessage = '';
    const file = event.target.files[0];
    if (!file) {
      this.resetFileOnly();
      return;
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      this.fileErrorMessage = 'Please upload a valid Excel file (.xlsx, .xls allowed).';
      this.toastr.error(this.fileErrorMessage, 'Invalid File');
      this.resetFileOnly();
      this.vendorImportForm.get('file')?.setErrors({ pattern: true });
      return;
    }

    // Client-side verification of mandatory columns using FileReader
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!json || json.length === 0) {
          this.fileErrorMessage = 'The uploaded Excel file is empty.';
          this.toastr.error(this.fileErrorMessage, 'Empty File');
          this.resetFileOnly();
          return;
        }

        const rawHeaderRow: any[] = json[0] || [];
        const normalizedHeaders = rawHeaderRow.map((h: any) =>
          (h || '').toString().trim().replace(/[\s_*%]+/g, '').toLowerCase()
        );

        // Check the mandatory fields
        const missing: string[] = [];
        const hasVendorName = normalizedHeaders.some(h => ['vendorname', 'vendor', 'name'].includes(h));
        const hasGender = normalizedHeaders.some(h => ['gender', 'sex'].includes(h));
        const hasState = normalizedHeaders.some(h => ['state', 'statename'].includes(h));
        const hasTdsPercentage = normalizedHeaders.some(h => ['tdspercentage', 'tds', 'tdspercent'].includes(h));
        const hasAccountHolderName = normalizedHeaders.some(h => ['accountholdername', 'accountholder', 'holdername'].includes(h));

        if (!hasVendorName) missing.push('Vendor Name');
        if (!hasGender) missing.push('Gender');
        if (!hasState) missing.push('State');
        if (!hasTdsPercentage) missing.push('TDS Percentage');
        if (!hasAccountHolderName) missing.push('Account Holder Name');

        if (missing.length > 0) {
          this.fileErrorMessage = `Missing mandatory column(s): ${missing.join(', ')}. Please check your Excel template.`;
          this.toastr.error(this.fileErrorMessage, 'Missing Mandatory Columns');
          this.resetFileOnly();
          return;
        }

        // Successfully verified
        this.selectedFile = file;
        this.vendorImportForm.get('file')?.setValue(file);
        this.vendorImportForm.get('file')?.setErrors(null);
        this.toastr.info('Excel file verified successfully. Ready to import.');
      } catch (err: any) {
        console.error('Error verifying Excel headers:', err);
        // Fallback: accept file for server processing
        this.selectedFile = file;
        this.vendorImportForm.get('file')?.setValue(file);
        this.vendorImportForm.get('file')?.setErrors(null);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  onSubmit(): void {
    if (this.vendorImportForm.invalid) {
      this.vendorImportForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      const compId = sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '';
      if (compId) {
        formData.append('companyId', compId);
        formData.append('fk_companyId', compId);
      }

      const currentUserId = sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || sessionStorage.getItem('USERID') || localStorage.getItem('UserId') || '';
      if (currentUserId) {
        formData.append('userId', currentUserId);
        formData.append('fk_insUserID', currentUserId);
        formData.append('fk_updUserID', currentUserId);
      }

      this.isUploading = true;
      this.loader.start();
      this.vendorService.uploadVendorExcel(formData).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          this.loader.stop();
          this.importedData = res.data || res || [];
          this.filterData();

          const total = this.importedData.length;
          const successCount = this.uploadedCount;
          const failCount = this.notUploadedCount;

          if (total > 0 && failCount === 0) {
            this.toastr.success(`All ${successCount} vendor(s) uploaded successfully!`);
          } else if (total > 0 && successCount > 0 && failCount > 0) {
            this.toastr.warning(`${successCount} uploaded successfully, ${failCount} failed validation. Check status column.`);
          } else if (total > 0 && successCount === 0) {
            this.toastr.error(`All ${failCount} record(s) failed validation. Please fix mandatory fields.`);
          } else {
            this.toastr.info(res.message || 'Vendor import completed.');
          }

          // Always refresh Fact Box on every upload attempt
          this.pageIndex = 1;
          this.loadFactBoxFiles();
        },
        error: (err: any) => {
          this.isUploading = false;
          console.error('Error uploading vendor file:', err);
          this.loader.stop();
          this.toastr.error(err.message || 'Error occurred while uploading vendor Excel file.');
        }
      });
    }
  }

  downloadExcel(): void {
    const exportData = this.filteredData.map((row: any) => ({
      Status: (row.isSuccess === true || row.status === 'Uploaded' || row.status === 'Updated' || row.status === 'Success') ? 'Uploaded' : (row.message || row.isMessage || row.status || 'Failed'),
      VendorName: row.vendor_Name || row.vendorName || '',
      FatherName: row.vendor_FatherName || row.fatherName || '',
      ContactNo: row.vendor_ContactNo || row.contactNo || '',
      Gender: row.vendor_Gender || row.gender || '',
      DOB: row.vendor_DOB || row.dob || '',
      Address: row.vendor_Address || row.address || '',
      State: row.vendor_State || row.state || '',
      City: row.vendor_City || row.city || '',
      BankName: row.vendor_BankName || row.bankName || '',
      AccountNo: row.vendor_AccountNo || row.accountNo || '',
      IFSCCode: row.vendor_IFSCCode || row.ifscCode || '',
      PANNo: row.vendor_PanNo || row.panNo || '',
      AadhaarNo: row.vendor_AaddharNo || row.aadhaarNo || '',
      GSTNo: row.vendor_GSTNo || row.gstNo || '',
      GSTPercentage: row.vendor_GstPercentage || row.gstPercentage || '',
      TDSPercentage: row.vendor_TdsPercentage || row.tdsPercentage || '',
      'Agent Code': row.agentName || row.AgentName || row.agentCode || row.AgentCode || '',
      LegalName: row.legalName || row.LegalName || '',
      EmergencyContactNo: row.emergencyContactNo || row.EmergencyContactNo || '',
      EmailID: row.emailID || row.EmailID || '',
      EShramCardNo: row.eShramCardNo || row.EShramCardNo || '',
      AyushmanCard: row.ayushmanCard || row.AyushmanCard || '',
      AyushmanCardNo: row.ayushmanCardNo || row.AyushmanCardNo || '',
      AccountHolderName: row.accountHolderName || row.AccountHolderName || '',
      PermanentPinCode: row.permanentPinCode || row.PermanentPinCode || '',
      CurrentPinCode: row.currentPinCode || row.CurrentPinCode || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Vendors': worksheet },
      SheetNames: ['Vendors']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, 'Vendor_Import_Result.xlsx');
  }
}


