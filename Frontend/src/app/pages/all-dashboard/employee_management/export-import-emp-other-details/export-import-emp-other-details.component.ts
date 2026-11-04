import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx'
import { ImportAttendancePunchService } from '../../payroll/services/import-attendance-punch.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { DarclFactBoxComponent } from '../../vendor/shared/darcl-fact-box/darcl-fact-box.component';
import { UploadFileHistoryService } from '../../vendor/Service/upload-file-history.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-export-import-emp-other-details',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, DarclFactBoxComponent],

  templateUrl: './export-import-emp-other-details.component.html',
  styleUrl: './export-import-emp-other-details.component.scss'
})
export class ExportImportEmpOtherDetailsComponent {

  EmployeeForm!: FormGroup;
  submitted = false;
  showError = false;
  totalCount: number = 0
  pageIndex: number = 1;
  pageSize: number = 10;
  pagesize: number = 10000;
  messag: string = '';
  showImportView = false
  errormessag: string = '';
  isExporting = false;
  isImporting = false;

  empOtherDetlList: any[] = [];

  filteredData: any[] = [];
  searchtext: string = ''
  months: any[] = [];
  years: any[] = [];
  selectedFile: File | undefined | null = null;
  exportsalaryheadlist: any[] = [];
  searchControl = new FormControl('');
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];
  isContractApplicable = false;

  // --- Imported Excel Preview State ---
  importedData: any[] = [];
  filteredImportedData: any[] = [];
  importedColumns: string[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentImportFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';
  searchImportControl = new FormControl('');

  // --- Fact Box Properties ---
  isFactBoxOpen: boolean = true;
  factBoxFiles: any[] = [];
  pageIndexFactBox: number = 1;
  pageSizeFactBox: number = 5;
  totalUploadedFiles: number = 0;
  isLoadingFactBox: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: ImportAttendancePunchService, // Update service if required
    private loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private commanService: ManualPunchBio,
    private uploadHistoryService: UploadFileHistoryService
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.searchControl.valueChanges.subscribe(value => {
      this.searchtext = value?.toLowerCase() || '';
      this.filterData();
    });

    this.searchImportControl.valueChanges.subscribe(() => {
      this.filterImportedData();
    });

    this.EmployeeForm = this.fb.group({
      empCode: [''],
      empName: [''],
      selectedLocations: [[]],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      empStatus: [''],
      Fk_FinId: [''],
      Fk_CompanyId: [''],
      fk_costcentreid: [[]],
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
    });

    this.getCostCenterList();
    this.loadFactBoxFiles();
  }



  exportTemplate() {
    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const formData = { ...this.EmployeeForm.value };

    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });

    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      ...formData
    };

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }
    this.httpservice.GetEmpOtherDetailExportImport(payload).subscribe({
      next: (res) => {
        this.exportsalaryheadlist = res.data

        this.downloadExcel();
        this.isExporting = false;
      }
    })
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...res.data.slice(1)
        ];
      }
    });
  }

  downloadExcel(): void {
    const filteredData = this.exportsalaryheadlist;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'EmpOtherDetails.xlsx');
  }


  onSubmit() {
    this.submitted = true;
    this.showError = true;
    this.showImportView = false;
    this.EmployeeForm.get('file')?.clearValidators();
    this.EmployeeForm.get('file')?.updateValueAndValidity();
    if (this.EmployeeForm.invalid) return;

    const formValues = this.EmployeeForm.value;

    if (!formValues.sortBy) {
      this.toastrService.warning('Please select Sort By');
      return;
    }
    if (!formValues.selectedDepartments?.length) {
      this.toastrService.warning('Please select at least one Department');
      return;
    }
    if (!formValues.selectedLocations?.length) {
      this.toastrService.warning('Please select at least one Location');
      return;
    }
    this.pageIndex = 1;
    this.getEmpOtherData();
  }

  getEmpOtherData() {
    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });

    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pagesize,
      ...formData
    };

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }


    this.loader.start();
    // this.httpservice.GetEmpHeadExportImport(payload).subscribe({
    this.httpservice.GetEmpOtherDetailExportImport(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res.isSuccess) {

          this.empOtherDetlList = res.data || [];
          this.totalCount = res.totalCount
          this.filteredData = [...this.empOtherDetlList];
        } else {
          this.empOtherDetlList = [];
          this.toastrService.info(res.message || 'No data found');
        }
      },
      error: (err) => {
        this.loader.stop();
        this.toastrService.error(err.message || 'Failed to fetch data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getEmpOtherData();
  }

  filterData() {
    const lowerText = this.searchtext.toLowerCase();
    this.filteredData = this.empOtherDetlList.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      )
    );
  }

  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.EmployeeForm.get('file')?.setValue(file); // Set value to form control
    } else {
      this.EmployeeForm.get('file')?.setErrors({ pattern: true });
    }
  }


  Import() {
    if (this.isImporting) return;

    if (this.EmployeeForm.get('file')?.invalid || !this.selectedFile) {
      this.EmployeeForm.get('file')?.markAsTouched();
      this.toastrService.warning('Please select a valid .xlsx file to import.');
      return;
    }

    if (this.selectedFile) {
      const fileToSave = this.selectedFile;
      const formData = new FormData();
      formData.append('file', fileToSave, fileToSave.name);

      this.isImporting = true;
      this.messag = '';
      this.errormessag = '';
      this.importedData = [];
      this.importedColumns = [];
      this.filteredImportedData = [];

      this.httpservice.EmpOtherDetailImport(formData).subscribe({
        next: (res) => {
          this.isImporting = false;
          if (res.isSuccess) {
            this.messag = res.message;
            this.errormessag = '';
            this.toastrService.success(res.message || 'Employee other details imported successfully!');
          } else {
            this.errormessag = res.message;
            this.messag = '';
            this.toastrService.error(res.message || 'Import failed');
          }

          // Only show data if backend returned data
          if (Array.isArray(res.data) && res.data.length > 0) {
            this.importedData = res.data;
            this.importedColumns = Object.keys(res.data[0]);
          } else {
            this.importedData = [];
            this.importedColumns = [];
          }
          this.filterImportedData();

          // Save upload history and refresh Fact Box
          const resultPayload = res?.data ? res.data : { isSuccess: res?.isSuccess, message: res?.message || this.errormessag };
          this.uploadHistoryService.saveUploadHistory(fileToSave, 'EMP_OTHER_DETAILS_IMPORT', resultPayload).subscribe({
            next: () => {
              this.pageIndexFactBox = 1;
              this.loadFactBoxFiles();
            },
            error: (e) => console.error('Error recording employee other details upload history:', e)
          });

          // Reset file after import
          this.selectedFile = null;
          this.EmployeeForm.get('file')?.reset();
        },
        error: (error) => {
          this.isImporting = false;
          this.errormessag = error?.error?.message || error?.message || 'Error occurred during import.';
          this.messag = "";
          this.toastrService.error(this.errormessag);

          this.importedData = [];
          this.importedColumns = [];
          this.filterImportedData();

          this.uploadHistoryService.saveUploadHistory(fileToSave, 'EMP_OTHER_DETAILS_IMPORT', { isSuccess: false, message: this.errormessag }).subscribe({
            next: () => {
              this.pageIndexFactBox = 1;
              this.loadFactBoxFiles();
            },
            error: (e) => console.error('Error recording employee other details upload history:', e)
          });

          this.selectedFile = null;
          this.EmployeeForm.get('file')?.reset();
        }
      });
    }
  }

  setImportFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded') {
    this.currentImportFilter = filter;
    this.filterImportedData();
  }

  filterImportedData() {
    this.uploadedCount = this.importedData.filter(item => {
      const st = (item.status || item.Status || '').toString().toLowerCase();
      return st === 'updated' || st === 'uploaded' || st === 'success' || st === 'valid';
    }).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = (this.searchImportControl.value || '').toLowerCase().trim();
    this.filteredImportedData = this.importedData.filter(item => {
      const matchesSearch = !lowerText || Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      const st = (item.status || item.Status || '').toString().toLowerCase();
      const isSuccess = st === 'updated' || st === 'uploaded' || st === 'success' || st === 'valid';

      let matchesStatus = true;
      if (this.currentImportFilter === 'Uploaded') {
        matchesStatus = isSuccess;
      } else if (this.currentImportFilter === 'Not Uploaded') {
        matchesStatus = !isSuccess;
      }

      return matchesSearch && matchesStatus;
    });
  }

  exportImportedListExcel(): void {
    if (!this.filteredImportedData || this.filteredImportedData.length === 0) {
      this.toastrService.warning('No data to export.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(this.filteredImportedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Imported Results');
    XLSX.writeFile(wb, 'EmpOtherDetails_Import_Results.xlsx');
    this.toastrService.success('Excel downloaded successfully!');
  }

  toggleImportView(): void {
    this.messag = '';
    this.errormessag = '';
    this.isImporting = false;
    this.showImportView = !this.showImportView;
    // Clear the file
    this.selectedFile = undefined;
    this.EmployeeForm.get('file')?.reset();
    if (this.showImportView) {
      this.EmployeeForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
      this.EmployeeForm.get('file')?.updateValueAndValidity();
    }
  }

  resetImportForm(): void {
    this.selectedFile = null;
    this.EmployeeForm.get('file')?.reset();
    this.importedData = [];
    this.filteredImportedData = [];
    this.importedColumns = [];
    this.messag = '';
    this.errormessag = '';
    this.isImporting = false;
  }

  // --- Fact Box Methods ---
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('EMP_OTHER_DETAILS_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
      next: (res: any) => {
        this.isLoadingFactBox = false;
        if (res && res.data) {
          this.factBoxFiles = res.data.list || [];
          this.totalUploadedFiles = res.data.totalCount || 0;
        } else {
          this.factBoxFiles = [];
          this.totalUploadedFiles = 0;
        }
      },
      error: (err: any) => {
        this.isLoadingFactBox = false;
        console.error('Error loading Fact Box files:', err);
      }
    });
  }

  onFactBoxPageChange(page: number): void {
    this.pageIndexFactBox = page;
    this.loadFactBoxFiles();
  }

  downloadFactBoxFile(file: any): void {
    const fileId = file.id || file.pk_id || file.fileId;
    const fileName = file.file_name || file.fileName || 'EmpOtherDetails_Import.xlsx';
    if (!fileId) return;

    this.loader.start();
    this.uploadHistoryService.downloadFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading file from Fact Box:', err);
        this.toastrService.error('Unable to download file.');
      }
    });
  }

  onCostCenterChange() {
    let selectedValues = this.EmployeeForm.controls['fk_costcentreid'].value || [];
    if (!Array.isArray(selectedValues)) {
      selectedValues = [selectedValues];
    }

    if (selectedValues.includes('__select_all__')) {
       if (this.isAllCostCentersSelected()) {
          this.selectedCostCenters = [];
       } else {
          const realValues = this.CostCenter
             .filter(c => c.value !== '__select_all__')
             .map(c => c.value);
          this.selectedCostCenters = realValues as string[];
       }
       this.EmployeeForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
    } else {
       this.selectedCostCenters = selectedValues;
    }
  }

  isAllCostCentersSelected(): boolean {
    const realCostCenters = this.CostCenter.filter(item => item.value !== '__select_all__');
    return (
      this.selectedCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => this.selectedCostCenters.includes(c.value as string))
    );
  }

  getCostCenterDisplayText(): string {
    const realCostCenters = this.CostCenter.filter(c => c.value !== '__select_all__');
    const selectedRealCostCenters = this.selectedCostCenters.filter(value => value !== '__select_all__');

    if (
      selectedRealCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => selectedRealCostCenters.includes(c.value as string))
    ) {
      return "All Selected";
    } else if (this.selectedCostCenters.length === 1) {
      return this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name || "--Select --";
    } else if (this.selectedCostCenters.length > 1) {
      const firstSelected = this.CostCenter.find(item => item.value === this.selectedCostCenters[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select --";
    } else {
      return "--Select --";
    }
  }

  clearCostCenters() {
    this.selectedCostCenters = [];
    this.EmployeeForm.controls['fk_costcentreid'].setValue([]);
  }


}
