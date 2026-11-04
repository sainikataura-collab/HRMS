import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { ImportAttendancePunchService } from '../../services/import-attendance-punch.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DarclFactBoxComponent } from '../../../vendor/shared/darcl-fact-box/darcl-fact-box.component';
import { UploadFileHistoryService } from '../../../vendor/Service/upload-file-history.service';

@Component({
  selector: 'app-attendace',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, DarclFactBoxComponent],
  templateUrl: './attendace.component.html',
  styleUrl: './attendace.component.scss'
})
export class AttendaceComponent {
  EmportAttendaceForm!: FormGroup;
  submitted = false;
  showError = false;
  messag: string = '';
  errormessag: string = '';
  filteredData: any[] = [];
  selectedFile: File | undefined;
  months: any[] = [];
  years: any[] = [];
  isViewLoading = false;
  isExporting = false;
  isImporting = false;
  AttendanceMarkedCount = 0;
  CostCenter: { name: string; value: string | null }[] = [];
  isContractApplicable = false;
  NotMarkedorLockAttendanceCount = 0;
  searchTextAttendanceMarked = '';
  searchTextAttendanceNotMarked = '';
  pageIndex1: number = 1;
  pageSize1: number = 10;
  pageIndex2: number = 1;
  pageSize2: number = 10;
  filteredAttendanceMarkedList: any[] = [];
  filteredAttendaceNotMarkedList: any[] = [];
  attendanceList: any = {};
  ExportattendanceList: any[] = [];
  showImportView: boolean = false;
  selectedCostCenters: string[] = [];

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
    private httpservice: MonthlyRentDetailService,
    private Loader: NgxUiLoaderService,
    private service: ImportAttendancePunchService,
    private dropdownService: DropdownService,
    private uploadHistoryService: UploadFileHistoryService
  ) {}

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;
    this.loadFactBoxFiles();
    this.filteredAttendaceNotMarkedList = this.attendanceList.attendanceNotmarked;
    this.filteredAttendanceMarkedList = this.attendanceList.attendancemarked;
    this.EmportAttendaceForm = this.fb.group({
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
      empCode: [''],
      empName: [''],
      fk_costcentreid: [[]],
      selectedLocations: [[]],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      empStatus: [''],
      Fk_FinId: [''],
      Fk_CompanyId: [''],
      fk_classid: [''],
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
    });

    this.Loader.start();
    forkJoin([
      this.httpservice.getCommanList('Month'),
      this.httpservice.getCommanList('Year'),
      this.httpservice.getCommanList('CostCenter'),
    ]).subscribe({
      next: ([monthsRes, yearsRes, CostCenter]) => {
        this.months = monthsRes.data;
        this.years = yearsRes.data;
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...CostCenter.data.slice(1)
        ];
        this.Loader.stop();
      },
      error: () => {
        this.toastrService.error("Failed to load data");
        this.Loader.stop();
      }
    });
  }

  toggleImportView(): void {
    this.messag = '';
    this.errormessag = '';
    this.showImportView = !this.showImportView;
    // Clear the file
    this.selectedFile = undefined;
    this.EmportAttendaceForm.get('file')?.reset();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.EmportAttendaceForm.get('file')?.setValue(file); // Set value to form control
    } else {
      this.EmportAttendaceForm.get('file')?.setErrors({ pattern: true });
    }
  }

  getAttendanceExportImportData() {
    this.filteredAttendanceMarkedList = [];
    this.filteredAttendaceNotMarkedList = [];
    const formData = { ...this.EmportAttendaceForm.value };

    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });

    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }

    const payload = {
      pageIndex1: this.pageIndex1 - 1,
      pageSize1: this.pageSize1,
      pageIndex2: this.pageIndex2 - 1,
      pageSize2: this.pageSize2,
      ...formData // spread form values into the request body
    };

    this.Loader.start();
    this.service.SAL_EmpAttendance_ForExportImport(payload).subscribe({
      next: (res: any) => {
        this.isViewLoading = false;
        this.Loader.stop();
        if (res.isSuccess) {
          this.attendanceList = res.data;
          console.log('sdfkjjfs', this.attendanceList);
          this.filteredAttendaceNotMarkedList = [];
          this.filteredAttendanceMarkedList = [];
          this.searchTextAttendanceMarked = '';
          this.searchTextAttendanceNotMarked = '';
          this.AttendanceMarkedCount = res.data.markedCount;

          this.NotMarkedorLockAttendanceCount = res.data.notMarkedCount;

          this.filterAttendance('Marked');
          this.filterAttendance('NotMarked');
        } else {
          this.toastrService.info(res.message);
          this.filteredAttendaceNotMarkedList = [];
          this.filteredAttendanceMarkedList = [];
          this.AttendanceMarkedCount = 0;
          this.NotMarkedorLockAttendanceCount = 0;
          this.attendanceList = {};
        }
      },
      error: (err) => {
        this.toastrService.error(err.message);
        this.isViewLoading = false;
        this.Loader.stop();
      }
    });
  }

  exportTemplate() {
    this.isExporting = true;
    const formData = { ...this.EmportAttendaceForm.value };

    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });

    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }

    this.service.SAL_EmpAttendance_ForExport(formData).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data && res.data.length > 0) {
          this.ExportattendanceList = res.data;
          this.downloadExcel();
        } else if (res && res.data && res.data.length === 0) {
          this.toastrService.info('No records found to export for the selected criteria.');
        } else {
          this.toastrService.error(res?.message || 'Failed to export attendance.');
        }
        this.isExporting = false;
      },
      error: (err) => {
        this.isExporting = false;
        this.toastrService.error(err?.message || 'Something went wrong while exporting.');
      }
    });
  }

  downloadExcel(): void {
    if (!this.ExportattendanceList || this.ExportattendanceList.length === 0) {
      return;
    }
    const filteredData = this.ExportattendanceList;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Exportattendance.xlsx');
  }

  handleFilters(filters: any) {
    this.EmportAttendaceForm.patchValue(filters);
  }

  onMarkedPageChange(event: number): void {
    this.pageIndex1 = event;
    this.getAttendanceExportImportData();
  }

  onNotMarkedPageChange(event: number): void {
    this.pageIndex2 = event;
    this.getAttendanceExportImportData();
  }

  filterAttendance(type: 'Marked' | 'NotMarked') {
    let list: any[] = [];
    let searchText = '';
    switch (type) {
      case 'Marked':
        list = this.attendanceList.attendancemarked || [];
        searchText = this.searchTextAttendanceMarked;
        this.filteredAttendanceMarkedList = this.applySearch(list, searchText);
        break;
      case 'NotMarked':
        list = this.attendanceList.attendanceNotmarked || [];
        searchText = this.searchTextAttendanceNotMarked;
        this.filteredAttendaceNotMarkedList = this.applySearch(list, searchText);
        break;
    }
  }

  applySearch(list: any[], searchText: string): any[] {
    if (!searchText) return list;
    const search = searchText.toLowerCase();
    return list.filter(emp =>
      (emp.empName?.toLowerCase().includes(search) || '') ||
      (emp.empCode?.toLowerCase().includes(search) || '') ||
      (emp.manualEmpCode?.toLowerCase().includes(search) || '') ||
      (emp.location?.toLowerCase().includes(search) || '') ||
      (emp.department?.toLowerCase().includes(search) || '') ||
      (emp.designation?.toLowerCase().includes(search) || '')
    );
  }

  onSubmit() {
    this.submitted = true;
    this.showError = true;
    this.EmportAttendaceForm.get('file')?.clearValidators();
    this.EmportAttendaceForm.get('file')?.updateValueAndValidity();
    if (this.EmportAttendaceForm.invalid) {
      return;
    }

    this.isViewLoading = true;
    this.getAttendanceExportImportData();

    this.EmportAttendaceForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
    this.EmportAttendaceForm.get('file')?.updateValueAndValidity();
  }

  Import() {
    if (this.isImporting) {
      return;
    }

    if (this.EmportAttendaceForm.invalid) {
      this.EmportAttendaceForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);
      formData.append('FkMonthId', this.EmportAttendaceForm.get('FkMonthId')?.value);
      formData.append('FkYearId', this.EmportAttendaceForm.get('FkYearId')?.value);

      this.Loader.start();
      this.isImporting = true;
      this.service.SAL_EmpAttendance_ForImport(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.messag = res.message;
            this.errormessag = '';
          } else {
            this.errormessag = res.message;
            this.messag = '';
          }
          this.Loader.stop();
          this.isImporting = false;

          // Save upload history and refresh Fact Box
          if (this.selectedFile) {
            const resultPayload = res?.data ? res.data : { isSuccess: res?.isSuccess, message: res?.message || this.errormessag };
            this.uploadHistoryService.saveUploadHistory(this.selectedFile, 'ATT_IMPORT', resultPayload).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording attendance upload history:', e)
            });
          }
        },
        error: (err) => {
          this.Loader.stop();
          this.isImporting = false;
          if (this.selectedFile) {
            this.uploadHistoryService.saveUploadHistory(this.selectedFile, 'ATT_IMPORT', { isSuccess: false, message: err?.message || 'Attendance import failed.' }).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording attendance upload history:', e)
            });
          }
        }
      });
    }
  }

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('ATT_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
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
    const fileName = file.file_name || file.fileName || 'Attendance_Import.xlsx';
    if (!fileId) return;

    this.Loader.start();
    this.uploadHistoryService.downloadFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.Loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: (err: any) => {
        this.Loader.stop();
        console.error('Error downloading file from Fact Box:', err);
        this.toastrService.error('Unable to download file.');
      }
    });
  }

  toggleSelectAllCostCenters(event: any) {
    const isChecked = event.target.checked;
    const realValues = this.CostCenter
      .filter(c => c.value !== '__select_all__')
      .map(c => c.value);
    this.selectedCostCenters = isChecked ? (realValues as string[]) : [];
    this.EmportAttendaceForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  toggleCostCenter(costCenter: string) {
    const index = this.selectedCostCenters.indexOf(costCenter);
    if (index === -1) {
      this.selectedCostCenters.push(costCenter);
    } else {
      this.selectedCostCenters.splice(index, 1);
    }
    this.EmportAttendaceForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
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
    this.EmportAttendaceForm.controls['fk_costcentreid'].setValue([]);
  }
}
