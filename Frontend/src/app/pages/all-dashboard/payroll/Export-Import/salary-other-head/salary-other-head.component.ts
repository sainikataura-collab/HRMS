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

@Component({
  selector: 'app-export-import-salary-other-head',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, DarclFactBoxComponent],
  templateUrl: './salary-other-head.component.html',
  styleUrl: './salary-other-head.component.scss'
})
export class ExportImportSalaryOtherHeadComponent {

  EmployeeForm!: FormGroup;
  submitted = false;
  showError = false;
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;
  messag: string = '';
  isExporting = false;
  showImportView = false;
  isImporting = false;
  errormessag: string = '';
  salaryHeadList: any[] = [];
  filteredData: any[] = [];
  searchtext: string = '';
  months: any[] = [];
  years: any[] = [];
  selectedFile: File | undefined;
  exportsalaryheadlist: any[] = [];
  searchControl = new FormControl('');
  CostCenter: { name: string; value: string | null }[] = [];
  selectedCostCenters: string[] = [];

  isContractApplicable = false;
  headlist = [];
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
      sortBy: [''],
      empStatus: [''],
      Fk_FinId: [''],
      Fk_CompanyId: [''],
      EffectiveDate: [''],
      importEffectiveDate: [''],
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
      headType: ['E,R'],
      fk_costcentreid: [[]],
      heads: [[]]
    });

    this.getCostCenterList();
    this.getheadList();
  }



  exportTemplate() {

    if (this.isExporting) return; // prevent double click
    const formData = { ...this.EmployeeForm.value };
    // validate heads selection
    if (!formData.heads || formData.heads.length === 0) {
      this.toastrService.warning('Please select a head', 'Warning');
      return;
    }

    this.isExporting = true;


    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }
    this.httpservice.ExportSalaryOtherHead(formData).subscribe({
      next: (res) => {
        this.isExporting = false;
        this.exportsalaryheadlist = res.data

        this.downloadExcel();
      }
    })
  }
  downloadExcel(): void {
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

  onCostCenterSearch(event: { term: string }) {
    if (event.term && event.term.trim().length > 0) {
      const term = event.term.toLowerCase();
      const filtered = this.CostCenter.filter(c =>
        c.value !== '__select_all__' &&
        c.name.toLowerCase().includes(term)
      );
      this.selectedCostCenters = filtered.map(c => c.value as string);
      this.EmployeeForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
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

  getheadList() {
    this.commanService.getCommanList('Head_allowImportMonthly').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.headlist = res.data

      }
    })
  }

  onSubmit() {
    debugger
    if (this.isViewing) return;
    this.submitted = true;
    this.showError = true;
    this.EmployeeForm.get('file')?.clearValidators();
    this.EmployeeForm.get('file')?.updateValueAndValidity();
    if (this.EmployeeForm.invalid) return;

    const formValues = this.EmployeeForm.value;

    if (!formValues.sortBy) {
      this.toastrService.warning('Please select Sort By');
      return;
    }
    if (!formValues.selectedDepartments.length) {
      this.toastrService.warning('Please select at least one Department');
      return;
    }
    if (!formValues.selectedLocations.length) {
      this.toastrService.warning('Please select at least one Location');
      return;
    }
    this.isViewing = true;

    this.getSalaryHeadData();
    this.EmployeeForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
    this.EmployeeForm.get('file')?.updateValueAndValidity();
  }

  getSalaryHeadData() {
    const formData = { ...this.EmployeeForm.value };
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) formData[key] = '';
    });
    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }

    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      ...formData
    };

    this.loader.start();
    this.httpservice.GetEmpOtherHeadExportImport(payload).subscribe({
      next: (res: any) => {
        this.isViewing = false;
        this.loader.stop();
        if (res.isSuccess) {

          this.salaryHeadList = res.data || [];
          this.totalCount = res.totalCount
          this.filteredData = [...this.salaryHeadList];
        } else {
          this.salaryHeadList = [];
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

          const empCodeKey = rawKeys.find(k => k.toLowerCase().replace(/[\s_]/g, '') === 'empcode' || k.toLowerCase() === 'code');
          const hasEmpCode = !!empCodeKey;
          const hasGrade = rawKeys.some(k => k.toLowerCase() === 'grade');

          let formatValidationError = '';
          if (!hasEmpCode && !hasGrade) {
            formatValidationError = "Missing required 'EmpCode' and 'Grade' columns.";
          } else if (!hasEmpCode) {
            formatValidationError = "Missing required 'EmpCode' column.";
          } else if (!hasGrade) {
            formatValidationError = "Missing required 'Grade' column (salary heads must follow Grade).";
          }

          if (formatValidationError) {
            this.errormessag = formatValidationError;
            this.toastrService.error(formatValidationError);
            this.importedData = rawJson.map((r: any) => ({
              status: 'Failed',
              remarks: formatValidationError,
              ...r
            }));
            this.filterImportedData();
            return;
          }

          const hasAnyValidRow = rawJson.some(row => {
            const empVal = empCodeKey ? String(row[empCodeKey] || '').trim() : '';
            return empVal !== '' && empVal !== '0';
          });

          if (!hasAnyValidRow) {
            const emptyRowErr = "Import failed: The uploaded Excel file has empty row(s) or missing 'EmpCode'. Please provide valid employee records.";
            this.errormessag = emptyRowErr;
            this.toastrService.error(emptyRowErr);
            this.importedData = rawJson.map((r: any) => ({
              status: 'Failed',
              remarks: 'Missing or empty EmpCode',
              ...r
            }));
            this.filterImportedData();
            return;
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

          this.executeImport(formData, rawJson, fileToSave, formatValidationError, empCodeKey);
        } catch (err) {
          console.error('Error reading Excel file:', err);
        }
      };

      reader.readAsArrayBuffer(fileToSave);
    }
  }

  executeImport(formData: FormData, rawJson: any[], fileToSave: File, formatValidationError: string, empCodeKey?: string): void {
    this.httpservice.SalaryOtherHead_ForImport(formData).subscribe({
      next: (res) => {
        this.isImporting = false;
        this.loader.stop();
        if (res.isSuccess) {
          this.messag = res.message || 'Salary other heads imported successfully!';
          this.errormessag = '';
          this.toastrService.success(this.messag);

          if (Array.isArray(res.data) && res.data.length > 0) {
            this.importedData = res.data.map((r: any) => {
              const rowEmp = empCodeKey ? String(r[empCodeKey] || '').trim() : '';
              const isEmpEmpty = !rowEmp || rowEmp === '0';
              return {
                status: isEmpEmpty ? 'Failed' : (r.status || 'Updated'),
                remarks: isEmpEmpty ? 'Missing or empty EmpCode' : (r.remarks || 'Imported successfully'),
                ...r
              };
            });
          } else {
            this.importedData = rawJson.map((r: any) => {
              const rowEmp = empCodeKey ? String(r[empCodeKey] || '').trim() : '';
              const isEmpEmpty = !rowEmp || rowEmp === '0';
              return {
                status: isEmpEmpty ? 'Failed' : 'Updated',
                remarks: isEmpEmpty ? 'Missing or empty EmpCode' : 'Imported successfully',
                ...r
              };
            });
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
          this.importedData = rawJson.map((r: any) => {
            const rowEmp = empCodeKey ? String(r[empCodeKey] || '').trim() : '';
            const isEmpEmpty = !rowEmp || rowEmp === '0';
            return {
              status: 'Failed',
              remarks: isEmpEmpty ? 'Missing or empty EmpCode' : failureReason,
              ...r
            };
          });
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
        this.uploadHistoryService.saveUploadHistory(fileToSave, 'SALARY_OTHER_HEAD_IMPORT', resultPayload).subscribe({
          next: () => {
            this.pageIndexFactBox = 1;
            this.loadFactBoxFiles();
          },
          error: (e) => console.error('Error recording salary other head upload history:', e)
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

        this.uploadHistoryService.saveUploadHistory(fileToSave, 'SALARY_OTHER_HEAD_IMPORT', { isSuccess: false, message: this.errormessag }).subscribe({
          next: () => {
            this.pageIndexFactBox = 1;
            this.loadFactBoxFiles();
          },
          error: (e) => console.error('Error recording salary other head upload history:', e)
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

    const companyName = sessionStorage.getItem('companyname') || sessionStorage.getItem('companyName') || 'CJ Darcl Logistics Limited';
    const reportTitle = 'Salary Other Head Rate Comparison Report (Master vs Imported Rates)';
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
    const effDateVal = this.EmployeeForm.get('EffectiveDate')?.value || this.EmployeeForm.get('effectiveDate')?.value;
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
    FileSaver.saveAs(blob, `SalaryOtherHead_Rate_Comparison_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
    XLSX.writeFile(wb, 'SalaryOtherHead_Import_Results.xlsx');
    this.toastrService.success('Excel downloaded successfully!');
  }

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('SALARY_OTHER_HEAD_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
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
    const fileName = file.file_name || file.fileName || 'SalaryOtherHead_Import.xlsx';
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
    this.importedData = [];
    this.filteredImportedData = [];
    this.importedHeaders = [];
    this.comparisonData = [];
    this.filteredComparisonData = [];
    this.comparisonHeadKeys = [];
    this.selectedFile = undefined;
    this.EmployeeForm.get('file')?.reset();
  }


}
