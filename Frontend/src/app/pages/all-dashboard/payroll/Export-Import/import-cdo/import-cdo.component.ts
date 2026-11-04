



import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import * as XLSX from 'xlsx';

import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { EmployeeService } from '../../services/employee.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';

@Component({
  selector: 'app-import-cdo',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectComponent,
    NgSelectModule,
    NgxPaginationModule,
    CommonSearchComponent,
  ],
  templateUrl: './import-cdo.component.html',
  styleUrl: './import-cdo.component.scss',
})
export class ImportCDOComponent implements OnInit {

  // ─── Form ─────────────────────────────────────────────────────────────────
  cdoForm!: FormGroup;

  // ─── UI State ─────────────────────────────────────────────────────────────
  showError = false;
  showList = false;
  isExporting = false;
  isContractApplicable = false;
  showImportView = false;   // ✅ same as Import Attendance toggleImportView
  // Add these properties
  importResultDetails: any[] = [];
  importSummary: any = null;
  showImportResult = false;

  // Import messages (same as messag/errormessag in Import Attendance)
  successMessage = '';
  errorMessage = '';

  // Selected file 
  selectedFile: File | null = null;

  //  Pagination 
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  //  Data 
  employeeList: any[] = [];
  filteredList: any[] = [];
  searchText = '';

  months: { name: string; value: string }[] = [];
  years: { name: string; value: string }[] = [];
  costCenterList: { name: string; value: string | null }[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private httpService: EmployeeService,
    private ngxLoader: NgxUiLoaderService,
    private commonService: ManualPunchBio
  ) { }

  ngOnInit(): void {
    this.isContractApplicable =
      sessionStorage.getItem('ContractApplicable') !== 'false';
    this.buildForm();
    this.loadDropdowns();
  }

  private buildForm(): void {
    this.cdoForm = this.fb.group({
      empCode: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      fk_monthId: [null, Validators.required],
      fk_yearId: [null, Validators.required],
      fk_costcentreid: [null],
      file: [''],   //  for import file input
    });
  }

  private loadDropdowns(): void {
    this.commonService.getCommanList('month').subscribe({
      next: (res) => (this.months = res.data.slice(1)),
    });
    this.commonService.getCommanList('Year').subscribe({
      next: (res) => (this.years = res.data.slice(1)),
    });
    this.commonService.getCommanList('CostCenter').subscribe({
      next: (res) => (this.costCenterList = res.data.slice(1)),
    });
  }

  handleFilters(filters: any): void {
    this.cdoForm.patchValue(filters);
  }

  toggleImportView(): void {
    this.showImportView = !this.showImportView;
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedFile = null;
    this.cdoForm.patchValue({ file: '' });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  importCDO(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to import.';
      this.successMessage = '';
      return;
    }

    //  Month and Year required before import
    const monthId = this.cdoForm.get('fk_monthId')?.value;
    const yearId = this.cdoForm.get('fk_yearId')?.value;

    if (!monthId || !yearId) {
      this.errorMessage = 'Please select Month and Year before importing.';
      this.successMessage = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('fk_monthId', monthId.toString());
    formData.append('fk_yearId', yearId.toString());

    this.ngxLoader.start();
    this.httpService.ImportCDOExcel(formData).subscribe({
      
      next: (res: any) => {
        this.ngxLoader.stop();
        if (res.isSuccess) {
          this.successMessage = res.message ?? 'CDO data imported successfully.';
          this.errorMessage = '';
          this.selectedFile = null;
          this.cdoForm.patchValue({ file: '' });

          // ✅ Store detail rows and summary
          this.importResultDetails = res.data?.details ?? [];
          this.importSummary = res.data;
          this.showImportResult = true;

          this.toastr.success(this.successMessage);
          this.getCDOData();
        } else {
          this.errorMessage = res.message ?? 'Import failed.';
          this.successMessage = '';
          this.showImportResult = false;
          this.toastr.error(this.errorMessage);
        }
      }, error: () => {
        this.ngxLoader.stop();
        this.errorMessage = 'Server error during import.';
        this.successMessage = '';
        this.toastr.error(this.errorMessage);
      },
    });
  }
 
  onView(): void {
    if (this.cdoForm.invalid) {
      this.showError = true;
      return;
    }
    this.pageIndex = 1;
    this.showImportView = false;   // close import view on fresh search
    this.getCDOData();
  }

  // ─── Core Data Fetch ──────────────────────────────────────────────────────
  getCDOData(): void {
    this.ngxLoader.start();

    const payload = {
      pageIndex1: this.pageIndex - 1,  //  matches SP @pageindex1 (0-based)
      pageSize1: this.pageSize,        // matches SP @pagesize1
      ...this.buildPayload(),
    };

    this.httpService.GetCDOList(payload).subscribe({
      next: (res) => {
        this.ngxLoader.stop();
        if (res.isSuccess && res.data?.data?.length) {
          this.employeeList = res.data.data;        //  nested data array
          this.totalCount = res.data.totalCount;
          
          this.showList = true;
          this.searchText = '';
          this.applySearch();
          this.toastr.success(res.message);
        } else {
          this.employeeList = [];
          this.filteredList = [];
          this.totalCount = 0;
          this.showList = false;
          this.toastr.info(res.message ?? 'No records found.');
        }
      },
      error: () => {
        this.ngxLoader.stop();
        this.toastr.error('Failed to load CDO data.');
      },
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.getCDOData();
  }

  applySearch(): void {
    if (!this.searchText?.trim()) {
      this.filteredList = [...this.employeeList];
      return;
    }
    const term = this.searchText.toLowerCase();
    this.filteredList = this.employeeList.filter(item =>
      item.EmpCode?.toLowerCase().includes(term) ||
      item.EmpName?.toLowerCase().includes(term) ||
      item.MonthName?.toLowerCase().includes(term)
    );
  }

  // Total hours for tfoot
  getTotalHours(): string {
    const total = this.filteredList.reduce(
      (sum, item) => sum + (parseFloat(item.TotalHours) || 0), 0
    );
    return total.toFixed(2);
  }


downloadExcel(): void {

  const payload = {
    pageIndex1: 0,          // full data
    pageSize1: 1000000,     // large size for full export
    ...this.buildPayload(),
  };

  this.ngxLoader.start();

  this.httpService.GetCDOList(payload).subscribe({
    next: (res: any) => {
      this.ngxLoader.stop();

      if (res.isSuccess && res.data?.data?.length) {

        const rows = res.data.data.map((item: any) => ({
          EmpCode: item.EmpCode,
          EmpName: item.EmpName,
          Month: item.MonthName,
          Hours: item.TotalHours
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CDO Report');

        const fileName = this.buildFileName();
        XLSX.writeFile(wb, fileName);

      } else {
        this.toastr.info('No data available to export.');
      }
    },
    error: () => {
      this.ngxLoader.stop();
      this.toastr.error('Failed to load data for export.');
    }
  });
}


  resetForm(): void {
    this.showError = false;
    this.showList = false;
    this.showImportView = false;
    this.employeeList = [];
    this.filteredList = [];
    this.totalCount = 0;
    this.pageIndex = 1;
    this.searchText = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.importResultDetails = [];
    this.importSummary = null;
    this.showImportResult = false;
    this.selectedFile = null;
    this.cdoForm.reset({
      selectedDepartments: [],
      selectedLocations: [],
    });
  }

  private buildPayload(): any {
    const raw = { ...this.cdoForm.value };
    Object.keys(raw).forEach(k => { if (raw[k] === null) raw[k] = ''; });
    if (raw.fk_costcentreid) {
      const match = this.costCenterList.find(c => c.value === raw.fk_costcentreid);
      raw.contractorName = match?.name ?? '';
    }
    // Remove file from payload — only used for import FormData
    delete raw.file;
    return raw;
  }

  private buildFileName(): string {
    const month = this.months.find(m => m.value === this.cdoForm.get('fk_monthId')?.value)?.name ?? 'Month';
    const year = this.years.find(y => y.value === this.cdoForm.get('fk_yearId')?.value)?.name ?? 'Year';
    return `CDO_Report_${month}_${year}.xlsx`;
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const file = new Blob([blob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  exportTemplate() {
    const headers = [
      "Empcode", "EmpName", "hours"
    ];

    const sampleRow = {
      Empcode: "E001",
      EmpName: "XYZ",
      Hours: 0.00,


    };

    // ✅ filter contractor column
    const finalHeaders = this.isContractApplicable
      ? headers
      : headers.filter(h => h !== "ContractorName");

    // ✅ build row based on finalHeaders
    const orderedRow = finalHeaders.reduce((acc: any, key: string) => {
      acc[key] = (sampleRow as any)[key] || '';
      return acc;
    }, {});

    // ✅ also use finalHeaders here
    const ws = XLSX.utils.json_to_sheet([orderedRow], { header: finalHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CDO Template');

    XLSX.writeFile(wb, 'CDO_Template.xlsx');
  }
  // ✅ CHANGE TO — col A = fk_empId, col B = hours (matches ImportCDOAsync)
  // ── CHANGE: use current filteredList data instead of dummy sample ─────────
  // exportTemplate(): void {



  //   // ✅ Build rows from current list — EmpCode + EmpName + Hours
  //   const rows = this.filteredList.map(item => ({
  //     EmpCode : item.EmpCode  ?? '',
  //     EmpName : item.EmpName  ?? '',
  //     hours   : item.TotalHours ?? 0,   // pre-fill existing hours — user can edit
  //   }));

  //   const headers = ['EmpCode', 'EmpName', 'hours'];

  //   const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

  //   // ✅ Style header row bold (optional but clean)
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'CDO Template');

  //   // // ✅ File name includes month/year
  //   // const fileName = this.buildFileName().replace('CDO_Report', 'CDO_Template');
  //   // XLSX.writeFile(wb, fileName);
  //    XLSX.writeFile(wb, 'CDO_Template.xlsx');
  // }

}