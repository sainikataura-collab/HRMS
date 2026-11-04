import { FactBoxComponent } from '../shared/fact-box/fact-box.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as FileSaver from 'file-saver';
import { AmazonDspRateCardService, AmazonDspBlockRateCard } from '../Service/amazon-dsp-rate-card.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-amazon-dsp-block-ratecard',
  standalone: true,
  imports: [FactBoxComponent, ReactiveFormsModule, CommonModule, RouterLink, NgxPaginationModule],
  templateUrl: './amazon-dsp-block-ratecard.component.html',
  styleUrl: './amazon-dsp-block-ratecard.component.scss'
})

export class AmazonDSPBlockRatecardComponent implements OnInit {
  importedData: any[] = [];
  searchControl = new FormControl('');
  searchText = '';
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  blockRateCardImportForm!: FormGroup;
  selectedFile: File | undefined;

  fileFormatError: string = '';
  expectedHeaders: string[] = ['Location', 'Block', 'VehicleType', 'Rate', 'EffectiveDate'];
  isFileValid: boolean = false;
  isValidatingFile: boolean = false;
  fileTouched: boolean = false;

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
    private rateCardService: AmazonDspRateCardService,
    private loader: NgxUiLoaderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });

    this.blockRateCardImportForm = this.fb.group({
      file: [null, Validators.required]
    });

    this.loadFactBoxFiles();
  }

  // Toggle Fact Box sidebar open/close
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  // Load Paginated Uploaded Files for Fact Box (Dedicated Amazon DSP endpoint)
  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.rateCardService.getExcelDocumentList(this.pageIndex, this.pageSize).subscribe({
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

  // Download uploaded file directly from Fact Box (Dedicated Amazon DSP endpoint)
  downloadFactBoxFile(file: any): void {
    const fileId = file.File_Id || file.file_Id || file.fileId || file.pk_id || file.id;
    const fileName = file.originalFileName || file.savedFileName || file.filePath || file.FilePath || file.Name || 'BlockRateCard_Upload.xlsx';
    if (!fileId) return;

    this.loader.start();
    this.rateCardService.downloadExcelDocument(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading Fact Box file:', err);
      }
    });
  }

  resetForm(): void {
    this.blockRateCardImportForm.reset();
    this.selectedFile = undefined;
    this.fileFormatError = '';
    this.isFileValid = false;
    this.fileTouched = false;
    this.importedData = [];
    this.filteredData = [];
    this.uploadedCount = 0;
    this.notUploadedCount = 0;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  resetFileOnly(): void {
    this.selectedFile = undefined;
    this.fileFormatError = '';
    this.isFileValid = false;
    this.fileTouched = false;
    this.blockRateCardImportForm.get('file')?.reset();
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

   exportTemplate(): void {
    const headers = ['Location', 'Block', 'VehicleType', 'Rate', 'EffectiveDate'];

    const sampleRow = {
      Location: 'Gurgaon',
      Block: 'A',
      VehicleType: 'Bike',
      Rate: '100',
      EffectiveDate: '2026-06-24'
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });

const effectiveDateColIndex = headers.indexOf('EffectiveDate');
if (effectiveDateColIndex > -1) {
  const colLetter = XLSX.utils.encode_col(effectiveDateColIndex);
  for (let r = 2; r <= 1000; r++) {
    const cellRef = `${colLetter}${r}`;
    if (!ws[cellRef]) {
      ws[cellRef] = { t: 's', v: '' };
    }
    ws[cellRef].z = '@'; // '@' = Text format
    ws[cellRef].t = 's'; // string type
  }
}    ws['!cols'] = headers.map(key => {
      const headerLen = key.length;
      const valueLen = (sampleRow[key as keyof typeof sampleRow] ?? '').toString().length;
      return { wch: Math.max(headerLen, valueLen) + 2 };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BlockRateCard Template');

    XLSX.writeFile(wb, 'BlockRateCard_Import_Template.xlsx');
  }
  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(item => item.status === 'Uploaded' || item.isSuccess === true).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccessStatus = item.status === 'Uploaded' || item.isSuccess === true;
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = isSuccessStatus;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = !isSuccessStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.fileTouched = true;
    this.fileFormatError = '';
    this.isFileValid = false;

    if (file && file.name.toLowerCase().endsWith('.xlsx')) {
      this.selectedFile = file;
      this.validateExcelFormat(file);
    } else {
      this.selectedFile = undefined;
      this.isFileValid = false;
      this.fileFormatError = 'Please upload a valid file (only .xlsx files allowed).';
    }
  }

  validateExcelFormat(file: File): void {
    this.isValidatingFile = true;
    this.isFileValid = false;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rows || rows.length === 0) {
          this.fileFormatError = 'Uploaded file is empty.';
          this.selectedFile = undefined;
          this.isFileValid = false;
          this.isValidatingFile = false;
          return;
        }

        const actualHeaders = (rows[0] as string[]).map(h =>
          (h || '').toString().trim().replace(/\s+/g, '').replace(/_/g, '').toLowerCase()
        );
        const expected = this.expectedHeaders.map(h =>
          h.replace(/\s+/g, '').replace(/_/g, '').toLowerCase()
        );

                const isValid = expected.every(h => actualHeaders.includes(h));

        if (!isValid) {
          this.fileFormatError = `Invalid file format. Expected columns: ${this.expectedHeaders.join(', ')}`;
          this.selectedFile = undefined;
          this.isFileValid = false;
        } else {
          this.fileFormatError = '';
          this.isFileValid = true;
        }
      } catch (err) {
        this.fileFormatError = 'Unable to read the uploaded file. Please upload a valid Excel file.';
        this.selectedFile = undefined;
        this.isFileValid = false;
      } finally {
        this.isValidatingFile = false;
      }
    };
    reader.onerror = () => {
      this.fileFormatError = 'Unable to read the uploaded file. Please upload a valid Excel file.';
      this.selectedFile = undefined;
      this.isFileValid = false;
      this.isValidatingFile = false;
    };
    reader.readAsArrayBuffer(file);
  }

  onSubmit(): void {
    this.fileTouched = true;

    if (this.isValidatingFile) {
      return;
    }

    if (!this.selectedFile) {
      if (!this.fileFormatError) {
        this.fileFormatError = 'File is required.';
      }
      return;
    }

    if (!this.isFileValid || this.fileFormatError) {
      return;
    }

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
    }

    this.loader.start();
    this.rateCardService.uploadBlockRateCardExcel(formData).subscribe({
      next: (res: any) => {
        this.loader.stop();
        this.importedData = res.data || res || [];
        this.filterData();
        // Always refresh Fact Box on every upload attempt
        this.pageIndex = 1;
        this.loadFactBoxFiles();
      },
      error: (err: any) => {
        console.error('Error uploading block ratecard file:', err);
        this.loader.stop();
        alert(err.message || 'Error occurred while uploading Block Ratecard Excel file.');
      }
    });
  }

  downloadExcel(): void {
    const exportData = this.filteredData.map((row: any) => ({
      Status: (row.isSuccess === true || row.status === 'Uploaded') ? 'Uploaded' : (row.message || row.status || 'Failed'),
      Location: row.location || '',
      Block: row.block || '',
      VehicleType: row.vehicleType || '',
      Rate: row.rate || '',
      EffectiveDate: row.effectiveDate || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns based on max content length (header + all row values)
    const headers = ['Status', 'Location', 'Block', 'VehicleType', 'Rate', 'EffectiveDate'];
    worksheet['!cols'] = headers.map(key => {
      const headerLen = key.length;
      const maxDataLen = exportData.reduce((max, row: any) => {
        const len = (row[key] ?? '').toString().length;
        return len > max ? len : max;
      }, 0);
      return { wch: Math.max(headerLen, maxDataLen) + 2 };
    });

    const workbook: XLSX.WorkBook = {
      Sheets: { 'BlockRateCard': worksheet },
      SheetNames: ['BlockRateCard']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, 'BlockRateCard_Import_Result.xlsx');
  }

   goBack(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/amazon_dsp_rate_card_list']);
  }
}



