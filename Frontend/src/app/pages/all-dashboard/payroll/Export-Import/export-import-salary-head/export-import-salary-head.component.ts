import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service'; // Update service if different
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ImportAttendancePunchService } from '../../services/import-attendance-punch.service';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-js-style';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { DarclFactBoxComponent } from '../../../vendor/shared/darcl-fact-box/darcl-fact-box.component';
import { UploadFileHistoryService } from '../../../vendor/Service/upload-file-history.service';
import { CTCService } from '../../../../all-employee/performance/Service/ctc.service';

@Component({
  selector: 'app-export-import-salary-head',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, DarclFactBoxComponent],
  templateUrl: './export-import-salary-head.component.html',
  styleUrl: './export-import-salary-head.component.scss'
})
export class ExportImportSalaryHeadComponent {

  EmployeeForm!: FormGroup;
  isExporting = false;
  isImporting = false;
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];
  isContractApplicable = false;
  submitted = false;
  showError = false;
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  messag: string = '';
  showImportView = false;
  errormessag: string = '';
  salaryHeadList: any[] = [];
  filteredData: any[] = [];
  searchtext: string = '';
  months: any[] = [];
  years: any[] = [];
  selectedFile: File | undefined;
  exportsalaryheadlist: any[] = [];
  searchControl = new FormControl('');
  isViewing = false;

  // --- Imported Excel Preview State ---
  importedData: any[] = [];
  filteredImportedData: any[] = [];
  importedHeaders: string[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentImportFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';
  searchImportControl = new FormControl('');

  // --- Comparison / Rate Difference State ---
  activeImportTab: 'raw' | 'comparison' = 'raw';
  comparisonHeadKeys: string[] = [];
  comparisonData: any[] = [];
  filteredComparisonData: any[] = [];
  comparisonFilter: 'All' | 'Changed' | 'Increased' | 'Decreased' | 'Unchanged' = 'All';
  searchComparisonControl = new FormControl('');
  totalIncreasedCount: number = 0;
  totalDecreasedCount: number = 0;
  totalUnchangedCount: number = 0;
  totalNetVariance: number = 0;
  get totalChangedCount(): number {
    return this.comparisonData.filter(x => x.status !== 'Unchanged').length;
  }
  pageIndexComparison: number = 1;
  pageSizeComparison: number = 10;
  isGeneratingComparison: boolean = false;

  // --- Fact Box Properties ---
  isFactBoxOpen: boolean = true;
  factBoxFiles: any[] = [];
  pageIndexFactBox: number = 1;
  pageSizeFactBox: number = 5;
  totalUploadedFiles: number = 0;
  isLoadingFactBox: boolean = false;

  // --- CTC Preview Properties ---
  showCtcPreview: boolean = false;
  isLoadingCtc: boolean = false;
  ctcList: any[] = [];
  groupedEmployees: any[] = [];
  ctcGross: any[] = [];
  ctcSearchText: string = '';
  pageIndexCtc: number = 1;
  pageSizeCtc: number = 10;
  totalCountCtc: number = 0;
  isExportingCtc: boolean = false;
  isDownloadingCtc: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: ImportAttendancePunchService, // Update service if required
    private loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private commanService: ManualPunchBio,
    private uploadHistoryService: UploadFileHistoryService,
    private ctcService: CTCService
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;
    this.loadFactBoxFiles();

    this.searchControl.valueChanges.subscribe(value => {
      this.searchtext = value?.toLowerCase() || '';
      this.filterData();
    });

    this.searchImportControl.valueChanges.subscribe(() => {
      this.filterImportedData();
    });

    this.searchComparisonControl.valueChanges.subscribe(() => {
      this.filterComparisonData();
    });
    this.EmployeeForm = this.fb.group({
      empCode: [''],
      empName: [''],
      selectedLocations: [[]],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: ['empcode'],
      empStatus: ['N'],
      Fk_FinId: [''],
      Fk_CompanyId: [''],
      EffectiveDate: [''],
      importEffectiveDate: [''],
      file: [null],
      headType: ['E,R'],
      fk_costcentreid: [[]],
    });

    this.getCostCenterList();
  }



  exportTemplate() {
    if (this.isExporting) return; // prevent double click
    this.isExporting = true;
    debugger
    const formData = { ...this.EmployeeForm.value };

    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }
    this.httpservice.ExportSalaryHead(formData).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data && res.data.length > 0) {
          this.exportsalaryheadlist = res.data;
          this.downloadExcel();
        } else if (res && res.data && res.data.length === 0) {
          this.toastrService.info('No records found to export for the selected criteria.');
        } else {
          this.toastrService.error(res?.message || 'Failed to export salary head data.');
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
    if (!this.exportsalaryheadlist || this.exportsalaryheadlist.length === 0) {
      return;
    }
    const filteredData = this.exportsalaryheadlist;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary List');
    XLSX.writeFile(wb, 'SalaryHeadData.xlsx');
  }


  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...res.data.slice(1)
        ];
      }
    })
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

  onSubmit() {
    if (this.isViewing) return; // prevent double click

    this.submitted = true;
    this.showError = true;
    this.showCtcPreview = false;
    this.showImportView = false;
    this.pageIndex = 1;
    this.EmployeeForm.get('file')?.clearValidators();
    this.EmployeeForm.get('file')?.updateValueAndValidity();
    if (this.EmployeeForm.invalid) return;

    this.isViewing = true;
    this.getSalaryHeadData();
  }

  getSalaryHeadData() {
    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }
    if (!formData.sortBy) {
      formData.sortBy = 'empcode';
    }

    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      ...formData
    };

    this.loader.start();
    this.httpservice.GetEmpHeadExportImport(payload).subscribe({
      next: (res: any) => {
        this.isViewing = false;
        this.loader.stop();
        if (res.isSuccess) {
          this.salaryHeadList = res.data || [];
          this.totalCount = res.totalCount || 0;
          this.filteredData = [...this.salaryHeadList];
        } else {
          this.salaryHeadList = [];
          this.totalCount = 0;
          this.filteredData = [];
          this.toastrService.info(res.message || 'No data found');
        }
      },
      error: (err) => {
        this.isViewing = false;
        this.loader.stop();
        this.toastrService.error(err.message || 'Failed to fetch data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getSalaryHeadData();
  }

  filterData() {
    const lowerText = this.searchtext.toLowerCase();
    this.filteredData = this.salaryHeadList.filter(item =>
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

    if (!this.selectedFile) {
      this.EmployeeForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
      this.EmployeeForm.get('file')?.updateValueAndValidity();
      this.EmployeeForm.get('file')?.markAsTouched();
      this.toastrService.warning('Please select an Excel file to import.', 'Warning');
      return;
    }

    const effDate = this.EmployeeForm.get('importEffectiveDate')?.value;
    const isInvalidDate = !effDate ||
      typeof effDate === 'function' ||
      effDate === Date ||
      !effDate.toString().trim() ||
      (typeof effDate === 'string' && effDate.trim() === '') ||
      isNaN(new Date(effDate).getTime());

    if (isInvalidDate) {
      this.EmployeeForm.get('importEffectiveDate')?.setErrors({ required: true });
      this.EmployeeForm.get('importEffectiveDate')?.markAsTouched();
      this.toastrService.warning('Effective Date is mandatory when importing.', 'Warning');
      return;
    }

    if (this.selectedFile) {
      const fileToSave = this.selectedFile;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawJson: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

          if (rawJson.length === 0) {
            this.errormessag = 'The uploaded Excel file contains no data.';
            this.toastrService.error(this.errormessag);
            return;
          }

          const rawKeys = Object.keys(rawJson[0]);
          this.importedHeaders = rawKeys.filter(k => k && !k.startsWith('__EMPTY') && k.toLowerCase() !== 'status' && k.toLowerCase() !== 'remarks' && k.toLowerCase() !== 'reason');

          const hasEmpCode = rawKeys.some(k => k.toLowerCase().replace(/[\s_]/g, '') === 'empcode' || k.toLowerCase() === 'code');
          const hasGrade = rawKeys.some(k => k.toLowerCase() === 'grade');

          let formatValidationError = '';
          if (!hasEmpCode && !hasGrade) {
            formatValidationError = "Missing required 'EmpCode' and 'Grade' columns.";
          } else if (!hasEmpCode) {
            formatValidationError = "Missing required 'EmpCode' column.";
          } else if (!hasGrade) {
            formatValidationError = "Missing required 'Grade' column (salary heads must follow Grade).";
          }

          // Extract emp codes from rawJson for targeted pre-import snapshot
          const empCodes = rawJson
            .map(r => {
              const k = Object.keys(r).find(key => key && (key.toLowerCase().replace(/[\s_]/g, '') === 'empcode' || key.toLowerCase() === 'code'));
              return k ? String(r[k] || '').trim() : '';
            })
            .filter(c => c && c !== '0');

          const exportPayload = { ...this.EmployeeForm.value };
          Object.keys(exportPayload).forEach(key => {
            if (exportPayload[key] === null) exportPayload[key] = '';
          });
          if (Array.isArray(exportPayload.fk_costcentreid)) {
            exportPayload.fk_costcentreid = exportPayload.fk_costcentreid.join(',');
          }
          if (empCodes.length > 0) {
            exportPayload.empCode = empCodes.join(',');
          }

          this.isImporting = true;
          this.loader.start();

          const formData = new FormData();
          formData.append('file', fileToSave, fileToSave.name);
          formData.append('EffectiveDate', effDate);

          this.executeImport(formData, rawJson, fileToSave, formatValidationError);
        } catch (err) {
          console.error('Error reading Excel file:', err);
        }
      };

      reader.readAsArrayBuffer(fileToSave);
    }
  }

  executeImport(formData: FormData, rawJson: any[], fileToSave: File, formatValidationError: string): void {
    this.httpservice.salartHead_ForImport(formData).subscribe({
      next: (res) => {
        this.isImporting = false;
        this.loader.stop();
        if (res.isSuccess) {
          this.messag = res.message || 'Salary heads imported successfully!';
          this.errormessag = '';
          this.toastrService.success(this.messag);

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.importedData = res.data.map((r: any) => ({
              status: r.status || 'Updated',
              remarks: r.remarks || 'Imported successfully',
              ...r
            }));
          } else {
            this.importedData = rawJson.map((r: any) => ({
              status: 'Updated',
              remarks: 'Imported successfully',
              ...r
            }));
          }
          this.filterImportedData();

          // Process DB-calculated comparison result
          this.processDbComparison(res.data?.summary, res.data?.details);
          this.activeImportTab = 'raw';
        } else {
          const failureReason = res.message || formatValidationError || 'Import failed';
          this.errormessag = failureReason;
          this.messag = '';
          this.toastrService.error(failureReason);
          this.importedData = rawJson.map((r: any) => ({
            status: 'Failed',
            remarks: failureReason,
            ...r
          }));
          this.filterImportedData();

          // Clear comparison data on failure
          this.comparisonData = [];
          this.filteredComparisonData = [];
          this.totalIncreasedCount = 0;
          this.totalDecreasedCount = 0;
          this.totalUnchangedCount = 0;
          this.totalNetVariance = 0;
          this.activeImportTab = 'raw';
        }

        // Save upload history and refresh Fact Box
        const resultPayload = res?.data ? res.data : { isSuccess: res?.isSuccess, message: res?.message || this.errormessag };
        this.uploadHistoryService.saveUploadHistory(fileToSave, 'SALARY_HEAD_IMPORT', resultPayload).subscribe({
          next: () => {
            this.pageIndexFactBox = 1;
            this.loadFactBoxFiles();
          },
          error: (e) => console.error('Error recording salary head upload history:', e)
        });

        // Reset file after import
        this.selectedFile = undefined;
        this.EmployeeForm.get('file')?.reset();
      },
      error: (err) => {
        this.isImporting = false;
        this.loader.stop();
        const failureReason = err?.error?.message || err?.message || formatValidationError || 'Error occurred during import.';
        this.errormessag = failureReason;
        this.messag = '';
        this.toastrService.error(failureReason);

        this.importedData = rawJson.map((r: any) => ({
          status: 'Failed',
          remarks: failureReason,
          ...r
        }));
        this.filterImportedData();

        this.comparisonData = [];
        this.filteredComparisonData = [];
        this.totalIncreasedCount = 0;
        this.totalDecreasedCount = 0;
        this.totalUnchangedCount = 0;
        this.totalNetVariance = 0;
        this.activeImportTab = 'raw';

        this.uploadHistoryService.saveUploadHistory(fileToSave, 'SALARY_HEAD_IMPORT', { isSuccess: false, message: this.errormessag }).subscribe({
          next: () => {
            this.pageIndexFactBox = 1;
            this.loadFactBoxFiles();
          },
          error: (e) => console.error('Error recording salary head upload history:', e)
        });

        this.selectedFile = undefined;
        this.EmployeeForm.get('file')?.reset();
      }
    });
  }

  processDbComparison(summary: any, details: any[]): void {
    if (!details || details.length === 0) {
      this.comparisonData = [];
      this.filteredComparisonData = [];
      this.comparisonHeadKeys = [];
      this.totalIncreasedCount = 0;
      this.totalDecreasedCount = 0;
      this.totalUnchangedCount = 0;
      this.totalNetVariance = 0;
      return;
    }

    const headKeysSet = new Set<string>();
    const empMap = new Map<string, any>();

    details.forEach((row: any) => {
      const headName = (row.headName || row.HeadName || '').trim();
      if (headName) headKeysSet.add(headName);

      const empCode = String(row.empCode || row.EmpCode || '').trim();
      if (!empCode) return;

      if (!empMap.has(empCode)) {
        empMap.set(empCode, {
          empCode: empCode,
          empName: row.empName || row.EmpName || '—',
          department: row.department || row.Department || '',
          location: row.location || row.Location || '',
          designation: row.designation || row.Designation || '',
          grade: row.grade || row.Grade || '',
          heads: {},
          totalOld: Number(row.totalOld ?? row.TotalOld ?? 0),
          totalNew: Number(row.totalNew ?? row.TotalNew ?? 0),
          netDiff: Number(row.netDiff ?? row.NetDiff ?? 0),
          status: row.status || row.Status || 'Unchanged'
        });
      }

      const emp = empMap.get(empCode);
      if (headName) {
        const oldR = Number(row.oldRate ?? row.OldRate ?? 0);
        const newR = Number(row.newRate ?? row.NewRate ?? 0);
        // const diffR = Number(row.diff ?? row.Diff ?? (newR - oldR));

        // let hStatus: 'Increased' | 'Decreased' | 'Unchanged' | 'New' = 'Unchanged';
        const diffR = Number(row.diff ?? row.Diff ?? 0);
        let hStatus: string = row.status || row.Status || 'Unchanged';
        if (!row.status && !row.Status) {
        if (oldR === 0 && newR > 0) hStatus = 'New';
        else if (diffR > 0) hStatus = 'Increased';
        else if (diffR < 0) hStatus = 'Decreased';
        }
        emp.heads[headName] = {
          old: oldR,
          new: newR,
          diff: diffR,
          status: hStatus
        };
      }
    });

    this.comparisonHeadKeys = Array.from(headKeysSet);
    this.comparisonData = Array.from(empMap.values());

    if (summary) {
      this.totalIncreasedCount = Number(summary.increasedCount ?? summary.IncreasedCount ?? 0);
      this.totalDecreasedCount = Number(summary.decreasedCount ?? summary.DecreasedCount ?? 0);
      this.totalUnchangedCount = Number(summary.unchangedCount ?? summary.UnchangedCount ?? 0);
      this.totalNetVariance = Number(summary.totalNetVariance ?? summary.TotalNetVariance ?? 0);
    } else {
      this.totalIncreasedCount = this.comparisonData.filter(x => x.status === 'Increased' || x.status === 'New').length;
      this.totalDecreasedCount = this.comparisonData.filter(x => x.status === 'Decreased').length;
      this.totalUnchangedCount = this.comparisonData.filter(x => x.status === 'Unchanged').length;
      this.totalNetVariance = Math.round(this.comparisonData.reduce((acc, x) => acc + x.netDiff, 0) * 100) / 100;
    }

    this.filterComparisonData();
  }

  setActiveImportTab(tab: 'comparison' | 'raw'): void {
    this.activeImportTab = tab;
  }

  setComparisonFilter(filter: 'All' | 'Changed' | 'Increased' | 'Decreased' | 'Unchanged'): void {
    this.comparisonFilter = filter;
    this.filterComparisonData();
  }

  filterComparisonData(): void {
    const lowerSearch = (this.searchComparisonControl.value || '').toLowerCase().trim();
    this.filteredComparisonData = this.comparisonData.filter(item => {
      let matchesFilter = true;
      if (this.comparisonFilter === 'Changed') {
        matchesFilter = item.status === 'Increased' || item.status === 'Decreased' || item.status === 'New' || item.status === 'Changed';
      } else if (this.comparisonFilter === 'Increased') {
        matchesFilter = item.status === 'Increased' || item.status === 'New';
      } else if (this.comparisonFilter === 'Decreased') {
        matchesFilter = item.status === 'Decreased';
      } else if (this.comparisonFilter === 'Unchanged') {
        matchesFilter = item.status === 'Unchanged';
      }

      const matchesSearch = !lowerSearch ||
        (item.empCode && item.empCode.toLowerCase().includes(lowerSearch)) ||
        (item.empName && item.empName.toLowerCase().includes(lowerSearch)) ||
        (item.department && item.department.toLowerCase().includes(lowerSearch)) ||
        (item.location && item.location.toLowerCase().includes(lowerSearch)) ||
        (item.designation && item.designation.toLowerCase().includes(lowerSearch));

      return matchesFilter && matchesSearch;
    });
    this.pageIndexComparison = 1;
  }

  hasDiff(item: any, col: string): boolean {
    if (!item) return false;
    if (item.heads && item.heads[col]) {
      return item.heads[col].diff !== undefined && item.heads[col].diff !== 0;
    }
    if (item['Diff_' + col] !== undefined) {
      return Number(item['Diff_' + col]) !== 0;
    }
    return false;
  }

  getDiffValue(item: any, col: string): number {
    if (!item) return 0;
    if (item.heads && item.heads[col]) {
      return Number(item.heads[col].diff || 0);
    }
    if (item['Diff_' + col] !== undefined) {
      return Number(item['Diff_' + col] || 0);
    }
    return 0;
  }

  getHeadNewValue(item: any, col: string): number {
    if (!item) return 0;
    if (item.heads && item.heads[col]) {
      return Number(item.heads[col].new || 0);
    }
    if (item[col] !== undefined) {
      return Number(item[col] || 0);
    }
    return 0;
  }

  isAmountColumn(col: string): boolean {
    if (!col) return false;
    const nonAmountCols = ['sr', 'srno', 'sr.', 'empcode', 'emp_code', 'code', 'empname', 'emp_name', 'name', 'location', 'department', 'designation', 'grade', 'status', 'remarks', 'reason'];
    return !nonAmountCols.includes(col.toLowerCase().replace(/[\s_]/g, ''));
  }

  
  async exportComparisonExcel(): Promise<void> {
    const dataToExport = (this.filteredComparisonData && this.filteredComparisonData.length > 0)
      ? this.filteredComparisonData
      : this.comparisonData;

    if (!dataToExport || dataToExport.length === 0) {
      this.toastrService.warning('No comparison records available to export.');
      return;
    }

    const companyName = sessionStorage.getItem('companyName') || 'Company Payroll';
    const reportTitle = 'Salary Head Rate Comparison Report (Master vs Imported Rates)';
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const headKeys = this.comparisonHeadKeys || [];
    const totalCols = 6 + headKeys.length + 2; // Sr, Code, Name, Loc, Dept, Desig + 1 per head + Rate Total, Status
    const summaryStartCol = 7 + headKeys.length; // 1-based index for Rate Total

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Rate Comparison', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }]
    });

    // ── Row 1: Company Name (CJ Darcl Standard - Simple Bold Text) ──
    const r1Cell = ws.getCell(1, 1);
    r1Cell.value = companyName;
    r1Cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
    r1Cell.alignment = { horizontal: 'left', vertical: 'middle' };

    // ── Row 2: Report Title (CJ Darcl Standard - Simple Bold Text) ──
    const r2Cell = ws.getCell(2, 1);
    r2Cell.value = reportTitle;
    r2Cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
    r2Cell.alignment = { horizontal: 'left', vertical: 'middle' };

    // ── Row 3: Subtitle / Month / Effective Date ──
    const effDateVal = this.EmployeeForm.get('importEffectiveDate')?.value || this.EmployeeForm.get('EffectiveDate')?.value;
    let monthYearSubtitle = '';
    if (effDateVal) {
      const d = new Date(effDateVal);
      if (!isNaN(d.getTime())) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearSubtitle = `For the month of ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      }
    }
    if (!monthYearSubtitle) {
      monthYearSubtitle = `Generated: ${dateFormatted} ${timeFormatted}`;
    }
    const r3Cell = ws.getCell(3, 1);
    r3Cell.value = monthYearSubtitle;
    r3Cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
    r3Cell.alignment = { horizontal: 'left', vertical: 'middle' };

    // ── Row 4: Blank separator (normal height) ──

    // ── Row 5: Column Headers (CJ Darcl Light Blue #BDD7EE & Thin Black Border) ──
    const headers = ['Sr. No.', 'EmpCode', 'EmpName', 'Location', 'Department', 'Designation'];
    headKeys.forEach(h => headers.push(h));
    headers.push('Rate Total', 'Status');

    const headerBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    const headerRow = ws.getRow(5);
    headers.forEach((hText, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = hText;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } }; // CJ Darcl table header blue
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = headerBorder;
    });

    // ── Data Rows (Row 6 onwards) ──
    const headSums: { [key: string]: { old: number; new: number; diff: number } } = {};
    headKeys.forEach(h => { headSums[h] = { old: 0, new: 0, diff: 0 }; });

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    dataToExport.forEach((item, i) => {
      const rowNum = 6 + i;
      const row = ws.getRow(rowNum);

      // 1. Sr. No.
      const c1 = row.getCell(1);
      c1.value = i + 1;
      c1.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c1.alignment = { horizontal: 'center', vertical: 'middle' };
      c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c1.border = thinBorder;

      // 2. Emp Code
      const c2 = row.getCell(2);
      c2.value = item.empCode || '';
      c2.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c2.alignment = { horizontal: 'center', vertical: 'middle' };
      c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c2.border = thinBorder;

      // 3. Name
      const c3 = row.getCell(3);
      c3.value = item.empName || '';
      c3.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c3.alignment = { horizontal: 'left', vertical: 'middle' };
      c3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c3.border = thinBorder;

      // 4. Location
      const c4 = row.getCell(4);
      c4.value = item.location || '';
      c4.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c4.alignment = { horizontal: 'left', vertical: 'middle' };
      c4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c4.border = thinBorder;

      // 5. Department
      const c5 = row.getCell(5);
      c5.value = item.department || '';
      c5.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c5.alignment = { horizontal: 'left', vertical: 'middle' };
      c5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c5.border = thinBorder;

      // 6. Designation
      const c6 = row.getCell(6);
      c6.value = item.designation || '';
      c6.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      c6.alignment = { horizontal: 'left', vertical: 'middle' };
      c6.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      c6.border = thinBorder;

      // Heads
      headKeys.forEach((head, hIdx) => {
        const colIdx = 7 + hIdx;
        const cell = row.getCell(colIdx);
        const hData = item.heads ? item.heads[head] : null;
        const nVal = Number(hData ? hData.new : 0) || 0;
        const dVal = Number(hData ? hData.diff : 0) || 0;

        headSums[head].old += Number(hData ? hData.old : 0) || 0;
        headSums[head].new += nVal;
        headSums[head].diff += dVal;

        if (dVal !== 0) {
          const sign = dVal > 0 ? '↑ +' : '↓ -';
          const diffArgb = dVal > 0 ? 'FF15803D' : 'FFB91C1C';
          cell.value = {
            richText: [
              { text: `₹ ${nVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`, font: { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } } },
              { text: `${sign}₹${Math.abs(dVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, font: { name: 'Calibri', size: 8.5, bold: true, color: { argb: diffArgb } } }
            ]
          };
        } else if (nVal !== 0) {
          cell.value = `₹ ${nVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF000000' } };
        } else {
          cell.value = '₹ 0.00';
          cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF64748B' } };
        }

        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.border = thinBorder;
      });

      // Rate Total
      const cRateTotal = row.getCell(summaryStartCol);
      const tNew = Number(item.totalNew) || 0;
      const tDiff = Number(item.netDiff) || 0;
      if (tDiff !== 0) {
        const sign = tDiff > 0 ? '↑ +' : '↓ -';
        const diffArgb = tDiff > 0 ? 'FF15803D' : 'FFB91C1C';
        cRateTotal.value = {
          richText: [
            { text: `₹ ${tNew.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`, font: { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } } },
            { text: `${sign}₹${Math.abs(tDiff).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, font: { name: 'Calibri', size: 8.5, bold: true, color: { argb: diffArgb } } }
          ]
        };
      } else {
        cRateTotal.value = `₹ ${tNew.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        cRateTotal.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } };
      }
      cRateTotal.alignment = { horizontal: 'right', vertical: 'middle' };
      cRateTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cRateTotal.border = thinBorder;

      // Status
      const cStatus = row.getCell(summaryStartCol + 1);
      cStatus.value = item.status || 'Unchanged';
      let statusBgArgb = 'FFFFFFFF';
      let statusColorArgb = 'FF475569';
      if (item.status === 'Increased' || item.status === 'New') {
        statusBgArgb = 'FFDCFCE7';
        statusColorArgb = 'FF15803D';
      } else if (item.status === 'Decreased') {
        statusBgArgb = 'FFFEE2E2';
        statusColorArgb = 'FFB91C1C';
      }
      cStatus.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: statusColorArgb } };
      cStatus.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusBgArgb } };
      cStatus.alignment = { horizontal: 'center', vertical: 'middle' };
      cStatus.border = thinBorder;
    });

    // ── Total / Summary Row ──
    const totalRowIdx = 6 + dataToExport.length;
    const totalRow = ws.getRow(totalRowIdx);

    ws.mergeCells(totalRowIdx, 1, totalRowIdx, 6);
    const totalLabelCell = totalRow.getCell(1);
    totalLabelCell.value = 'TOTAL';

    const totalBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    for (let c = 1; c <= 6; c++) {
      const cell = totalRow.getCell(c);
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = totalBorder;
    }

    headKeys.forEach((head, hIdx) => {
      const colIdx = 7 + hIdx;
      const cell = totalRow.getCell(colIdx);
      const sumN = Math.round(headSums[head].new * 100) / 100;
      const sumD = Math.round(headSums[head].diff * 100) / 100;

      if (sumD !== 0) {
        const sign = sumD > 0 ? '↑ +' : '↓ -';
        const diffArgb = sumD > 0 ? 'FF15803D' : 'FFB91C1C';
        cell.value = {
          richText: [
            { text: `₹ ${sumN.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`, font: { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } } },
            { text: `${sign}₹${Math.abs(sumD).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, font: { name: 'Calibri', size: 8.5, bold: true, color: { argb: diffArgb } } }
          ]
        };
      } else {
        cell.value = `₹ ${sumN.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } };
      }

      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      cell.border = totalBorder;
    });

    // Total for Rate Total col
    const totalNewSum = dataToExport.reduce((s, x) => s + (x.totalNew || 0), 0);
    const totalNetDiff = dataToExport.reduce((s, x) => s + (x.netDiff || 0), 0);
    const changedCount = dataToExport.filter(x => x.status !== 'Unchanged').length;

    const totalRateTotalCell = totalRow.getCell(summaryStartCol);
    if (totalNetDiff !== 0) {
      const sign = totalNetDiff > 0 ? '↑ +' : '↓ -';
      const diffArgb = totalNetDiff > 0 ? 'FF15803D' : 'FFB91C1C';
      totalRateTotalCell.value = {
        richText: [
          { text: `₹ ${totalNewSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`, font: { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } } },
          { text: `${sign}₹${Math.abs(totalNetDiff).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, font: { name: 'Calibri', size: 8.5, bold: true, color: { argb: diffArgb } } }
        ]
      };
    } else {
      totalRateTotalCell.value = `₹ ${totalNewSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      totalRateTotalCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF000000' } };
    }
    totalRateTotalCell.alignment = { horizontal: 'right', vertical: 'middle' };
    totalRateTotalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    totalRateTotalCell.border = totalBorder;

    // Total Status col
    const totalStatusCell = totalRow.getCell(summaryStartCol + 1);
    totalStatusCell.value = `${changedCount} Changed`;
    totalStatusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF1E3A8A' } };
    totalStatusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    totalStatusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    totalStatusCell.border = totalBorder;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, `SalaryHead_Rate_Comparison_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.toastrService.success('Comparison Sheet downloaded successfully!');
  }

  setImportFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded') {
    this.currentImportFilter = filter;
    this.filterImportedData();
  }

  filterImportedData() {
    this.uploadedCount = this.importedData.filter(item => item.status === 'Updated' || item.status === 'Uploaded' || item.status === 'Success').length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = (this.searchImportControl.value || '').toLowerCase().trim();
    this.filteredImportedData = this.importedData.filter(item => {
      const matchesSearch = !lowerText || Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccess = item.status === 'Updated' || item.status === 'Uploaded' || item.status === 'Success';
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
    XLSX.writeFile(wb, 'SalaryHead_Import_Results.xlsx');
    this.toastrService.success('Excel downloaded successfully!');
  }

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('SALARY_HEAD_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
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
    const fileName = file.file_name || file.fileName || 'SalaryHead_Import.xlsx';
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

  toggleImportView(): void {
    this.messag = '';
    this.errormessag = '';
    this.showImportView = !this.showImportView;
    this.showCtcPreview = false;
    this.importedData = [];
    this.filteredImportedData = [];
    this.importedHeaders = [];
    this.comparisonData = [];
    this.filteredComparisonData = [];
    this.comparisonHeadKeys = [];
    this.selectedFile = undefined;
    this.EmployeeForm.get('file')?.reset();
  }

  // --- CTC Preview Methods ---
  previewCtcDetails(pageIndex: number = 1): void {
    this.pageIndexCtc = pageIndex;
    this.submitted = true;
    this.showError = true;
    this.EmployeeForm.get('file')?.clearValidators();
    this.EmployeeForm.get('file')?.updateValueAndValidity();

    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }
    if (!formData.sortBy) {
      formData.sortBy = 'empcode';
    }

    this.isLoadingCtc = true;
    this.loader.start();
    this.ctcService.getAllCTCforAdmin(formData, this.pageIndexCtc, this.pageSizeCtc).subscribe({
      next: (res: any) => {
        this.isLoadingCtc = false;
        this.loader.stop();
        if (res && res.isSuccess) {
          this.ctcList = res.data?.ctcList || res.data?.CTCList || [];
          this.ctcGross = res.data?.ctcGross || res.data?.CTCGross || [];
          this.groupedEmployees = this.buildGroupedEmployees();
          this.totalCountCtc = res.totalCount || this.ctcGross[0]?.TotalCount || this.ctcGross[0]?.totalCount || this.groupedEmployees.length;
          this.showCtcPreview = true;
          this.showImportView = false;
        } else {
          this.ctcList = [];
          this.ctcGross = [];
          this.groupedEmployees = [];
          this.totalCountCtc = 0;
          this.toastrService.warning(res?.message || 'No CTC data found.');
        }
      },
      error: () => {
        this.isLoadingCtc = false;
        this.loader.stop();
        this.toastrService.error('Failed to load CTC preview.');
      }
    });
  }

  onCtcPageChange(event: number): void {
    this.pageIndexCtc = event;
    this.previewCtcDetails(event);
  }

  closeCtcPreview(): void {
    this.showCtcPreview = false;
    this.pageIndexCtc = 1;
  }

  buildGroupedEmployees(): any[] {
    const map = new Map<string, any>();
    for (const item of this.ctcList) {
      if (!map.has(item.fk_empid)) {
        map.set(item.fk_empid, {
          fk_empid: item.fk_empid,
          emp_code: item.emp_code,
          emp_name: item.emp_name,
          expanded: false,
          components: []
        });
      }
      map.get(item.fk_empid).components.push(item);
    }
    for (const gross of this.ctcGross) {
      const emp = map.get(gross.fk_empid);
      if (emp) {
        emp.total_Month = gross.Total_Month;
        emp.total_Year = gross.Total_Year;
      }
    }
    return Array.from(map.values());
  }

  filteredGrouped(): any[] {
    if (!this.ctcSearchText) return this.groupedEmployees;
    const q = this.ctcSearchText.toLowerCase();
    return this.groupedEmployees.filter(e =>
      e.emp_name?.toLowerCase().includes(q) ||
      e.emp_code?.toLowerCase().includes(q) ||
      e.fk_empid?.toString().toLowerCase().includes(q)
    );
  }

  getInitials(name: string): string {
    return (name || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getTotalMonthlyAll(): number {
    return this.ctcGross.reduce((s, g) => s + (g.Total_Month ?? 0), 0);
  }

  getTotalYearlyAll(): number {
    return this.ctcGross.reduce((s, g) => s + (g.Total_Year ?? 0), 0);
  }

  getAllCtcDataForExport(callback: (employees: any[]) => void, onError?: () => void): void {
    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }
    if (!formData.sortBy) {
      formData.sortBy = 'empcode';
    }

    this.ctcService.getAllCTCforAdmin(formData, 0, 0).subscribe({
      next: (res: any) => {
        if (res && res.isSuccess) {
          const allCtcList = res.data?.ctcList || res.data?.CTCList || [];
          const allCtcGross = res.data?.ctcGross || res.data?.CTCGross || [];
          const allGrouped = this.buildGroupedEmployeesFromData(allCtcList, allCtcGross);
          if (allGrouped.length > 0) {
            callback(allGrouped);
          } else {
            callback(this.groupedEmployees);
          }
        } else {
          if (onError) onError();
          this.toastrService.error('Failed to fetch full data for export');
        }
      },
      error: () => {
        if (onError) onError();
        this.toastrService.error('Failed to fetch full data for export');
      }
    });
  }

  buildGroupedEmployeesFromData(ctcList: any[], ctcGross: any[]): any[] {
    const map = new Map<string, any>();
    for (const item of ctcList) {
      if (!map.has(item.fk_empid)) {
        map.set(item.fk_empid, {
          fk_empid: item.fk_empid,
          emp_code: item.emp_code,
          emp_name: item.emp_name,
          expanded: false,
          components: []
        });
      }
      map.get(item.fk_empid).components.push(item);
    }
    for (const gross of ctcGross) {
      const emp = map.get(gross.fk_empid);
      if (emp) {
        emp.total_Month = gross.Total_Month;
        emp.total_Year = gross.Total_Year;
      }
    }
    return Array.from(map.values());
  }

  exportCtcToExcel(): void {
    if (!this.groupedEmployees || this.groupedEmployees.length === 0) {
      this.toastrService.warning('No CTC data available to export');
      return;
    }

    this.isExportingCtc = true;
    this.getAllCtcDataForExport(
      (allEmployees) => {
        try {
          this.generateCtcExcel(allEmployees);
        } finally {
          this.isExportingCtc = false;
        }
      },
      () => {
        this.isExportingCtc = false;
      }
    );
  }

  generateCtcExcel(employees: any[]): void {
    const wsData: any[][] = [];
    const styleMap: { [cellRef: string]: any } = {};

    const styleRow = (rowIdx: number, colCount: number, style: any) => {
      for (let c = 0; c < colCount; c++) {
        const cellRef = XLSXStyle.utils.encode_cell({ r: rowIdx, c });
        styleMap[cellRef] = style;
      }
    };

    wsData.push(['Emp Code', 'Employee Name', 'Component', 'Monthly (₹)', 'Yearly (₹)']);
    styleRow(0, 5, {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'CCCCCC' } } }
    });

    let currentRow = 1;
    for (const emp of employees) {
      wsData.push([emp.emp_code, emp.emp_name, '', '', '']);
      styleRow(currentRow, 5, {
        font: { bold: true, color: { rgb: '1e3a5f' } },
        fill: { fgColor: { rgb: 'DBEAFE' } },
        alignment: { vertical: 'center' }
      });
      currentRow++;

      for (const c of emp.components) {
        wsData.push(['', '', c.shortdesc, c.amount ?? 0, c.amount_yearly ?? 0]);
        styleRow(currentRow, 5, {
          font: { color: { rgb: '374151' } },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center' },
          border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
        });
        [3, 4].forEach(ci => {
          const cellRef = XLSXStyle.utils.encode_cell({ r: currentRow, c: ci });
          styleMap[cellRef] = {
            font: { color: { rgb: '374151' } },
            fill: { fgColor: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: '#,##0.00'
          };
        });
        currentRow++;
      }

      wsData.push(['', '', 'Total CTC', emp.total_Month ?? 0, emp.total_Year ?? 0]);
      styleRow(currentRow, 5, {
        font: { bold: true, color: { rgb: '14532d' } },
        fill: { fgColor: { rgb: 'D1FAE5' } },
        alignment: { vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '6EE7B7' } },
          bottom: { style: 'thin', color: { rgb: '6EE7B7' } }
        }
      });
      [3, 4].forEach(ci => {
        const cellRef = XLSXStyle.utils.encode_cell({ r: currentRow, c: ci });
        styleMap[cellRef] = {
          font: { bold: true, color: { rgb: '14532d' } },
          fill: { fgColor: { rgb: 'D1FAE5' } },
          alignment: { horizontal: 'right', vertical: 'center' },
          numFmt: '#,##0.00',
          border: {
            top: { style: 'thin', color: { rgb: '6EE7B7' } },
            bottom: { style: 'thin', color: { rgb: '6EE7B7' } }
          }
        };
      });
      currentRow++;

      wsData.push(['', '', '', '', '']);
      currentRow++;
    }

    const worksheet: XLSXStyle.WorkSheet = XLSXStyle.utils.aoa_to_sheet(wsData);
    for (const cellRef of Object.keys(styleMap)) {
      if (!worksheet[cellRef]) worksheet[cellRef] = { v: '', t: 's' };
      worksheet[cellRef].s = styleMap[cellRef];
    }
    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 24 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
    ];
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };
    const workbook: XLSXStyle.WorkBook = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'CTC Details');
    XLSXStyle.writeFile(workbook, 'CTC_Details_All_Employees.xlsx');
    this.toastrService.success('Excel exported successfully with all employees!');
  }

  downloadCtcSimple(): void {
    if (!this.groupedEmployees || this.groupedEmployees.length === 0) {
      this.toastrService.warning('No CTC data available to export');
      return;
    }

    this.isDownloadingCtc = true;
    this.getAllCtcDataForExport(
      (allEmployees) => {
        try {
          this.generateSimpleCtcExcel(allEmployees);
        } finally {
          this.isDownloadingCtc = false;
        }
      },
      () => {
        this.isDownloadingCtc = false;
      }
    );
  }

  generateSimpleCtcExcel(employees: any[]): void {
    const allComponents = new Set<string>();
    for (const emp of employees) {
      for (const c of emp.components) {
        allComponents.add(c.shortdesc);
      }
    }
    const componentCols = Array.from(allComponents);

    const headers = ['Emp Code', 'Emp Name', ...componentCols, 'Per Month (₹)', 'Per Year (₹)'];
    const wsData: any[][] = [headers];
    const styleMap: { [cellRef: string]: any } = {};

    const totalCols = headers.length;
    for (let c = 0; c < totalCols; c++) {
      const cellRef = XLSXStyle.utils.encode_cell({ r: 0, c });
      styleMap[cellRef] = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1D4ED8' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { bottom: { style: 'thin', color: { rgb: '93C5FD' } } }
      };
    }

    for (let ri = 0; ri < employees.length; ri++) {
      const emp = employees[ri];
      const compMap: { [key: string]: number } = {};
      for (const c of emp.components) {
        compMap[c.shortdesc] = c.amount ?? 0;
      }

      const row: any[] = [
        emp.emp_code,
        emp.emp_name,
        ...componentCols.map(col => compMap[col] ?? 0),
        emp.total_Month ?? 0,
        emp.total_Year ?? 0
      ];
      wsData.push(row);

      const excelRow = ri + 1;
      const isAlt = ri % 2 === 1;

      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSXStyle.utils.encode_cell({ r: excelRow, c });
        styleMap[cellRef] = {
          font: { color: { rgb: '1F2937' } },
          fill: { fgColor: { rgb: isAlt ? 'F9FAFB' : 'FFFFFF' } },
          alignment: { vertical: 'center' },
          border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
        };
      }

      const moCol = 2 + componentCols.length;
      const yrCol = moCol + 1;

      const moRef = XLSXStyle.utils.encode_cell({ r: excelRow, c: moCol });
      styleMap[moRef] = {
        font: { bold: true, color: { rgb: '14532D' } },
        fill: { fgColor: { rgb: 'D1FAE5' } },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: '#,##0.00',
        border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
      };

      const yrRef = XLSXStyle.utils.encode_cell({ r: excelRow, c: yrCol });
      styleMap[yrRef] = {
        font: { bold: true, color: { rgb: '78350F' } },
        fill: { fgColor: { rgb: 'FEF9C3' } },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: '#,##0.00',
        border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
      };

      for (let c = 2; c < moCol; c++) {
        const cellRef = XLSXStyle.utils.encode_cell({ r: excelRow, c });
        styleMap[cellRef] = {
          ...styleMap[cellRef],
          alignment: { horizontal: 'right', vertical: 'center' },
          numFmt: '#,##0.00'
        };
      }
    }

    const worksheet: XLSXStyle.WorkSheet = XLSXStyle.utils.aoa_to_sheet(wsData);
    for (const cellRef of Object.keys(styleMap)) {
      if (!worksheet[cellRef]) worksheet[cellRef] = { v: '', t: 's' };
      worksheet[cellRef].s = styleMap[cellRef];
    }

    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 24 },
      ...componentCols.map(() => ({ wch: 16 })),
      { wch: 16 },
      { wch: 16 },
    ];
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };

    const workbook: XLSXStyle.WorkBook = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'CTC Simple');
    XLSXStyle.writeFile(workbook, 'CTC__Summary.xlsx');
    this.toastrService.success('Excel downloaded successfully with all employees!');
  }
}
