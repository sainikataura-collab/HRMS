import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ImportdaywiseAttendanceService } from '../../services/importdaywise-attendance.service';
import { DarclFactBoxComponent } from '../../../vendor/shared/darcl-fact-box/darcl-fact-box.component';
import { UploadFileHistoryService } from '../../../vendor/Service/upload-file-history.service';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';
import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-import-daywise-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, DarclFactBoxComponent, WorkflowSidebarComponent],
  templateUrl: './import-daywise-attendance.component.html',
  styleUrl: './import-daywise-attendance.component.scss'
})
export class ImportDaywiseAttendanceComponent {
  // for header 
  dayHeaders: string[] = [];
  EmportDailyAttendaceForm!: FormGroup;
  submitted = false;
  showError = false;
  messag: string = '';
  errormessag: string = '';
  filteredData: any[] = [];
  selectedFile: File | undefined;
  months: any[] = [];
  years: any[] = [];
  AttendanceMarkedCount = 0;
  NotMarkedorLockAttendanceCount = 0;
  searchTextAttendanceMarked = '';
  searchTextAttendanceNotMarked = '';
  pageIndex1: number = 1;
  pageSize1: number = 10;
  pageIndex2: number = 1;
  pageSize2: number = 10;
  filteredAttendanceMarkedList: any[] = []
  filteredAttendaceNotMarkedList: any[] = []
  attendanceList: any = {}
  ExportattendanceList: any[] = [];
  showImportView: boolean = false;
  CostCenter: { name: string; value: string | null }[] = [];
  isContractApplicable = false;

  // --- Fact Box Properties ---
  isFactBoxOpen: boolean = true;
  factBoxFiles: any[] = [];
  pageIndexFactBox: number = 1;
  pageSizeFactBox: number = 5;
  totalUploadedFiles: number = 0;
  isLoadingFactBox: boolean = false;

  successCount: number = 0;
  errorCount: number = 0;

  successList: any[] = [];
  errorList: any[] = [];

  isViewLoading = false;
  isExporting = false;
  isImporting = false;

  // activeTab: string = 'success';
  searchImportText = '';

  filteredSuccessList: any[] = [];
  filteredErrorList: any[] = [];
  allList: any[] = [];
  filteredAllList: any[] = [];
  selectedCostCenters: string[] = [];
  activeAttendanceTab: 'marked' | 'notMarked' | 'both' = 'marked';
  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;


  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: MonthlyRentDetailService,
    private Loader: NgxUiLoaderService,
    private service: ImportdaywiseAttendanceService,
    private uploadHistoryService: UploadFileHistoryService,
    public workflowNav: WorkflowNavigationService
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;
    this.loadFactBoxFiles();

    this.filteredAttendaceNotMarkedList = this.attendanceList.attendanceNotmarked;
    this.filteredAttendanceMarkedList = this.attendanceList.attendancemarked;
    this.EmportDailyAttendaceForm = this.fb.group({
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
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
      fk_classid: [''],
      fk_costcentreid: [[]],
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
      TemplateType: [1],
    })


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

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        if (this.workflowNav.applyContextIfFromWorkflow(this.EmportDailyAttendaceForm, this.months, this.years, this.CostCenter)) {
          const cc = this.EmportDailyAttendaceForm.get('fk_costcentreid')?.value;
          if (Array.isArray(cc)) {
            this.selectedCostCenters = [...cc];
          }
          this.onMonthOrYearChange();
        }
      },
      error: () => {
        this.toastrService.error("Failed to load data");
        this.Loader.stop();
      }
    });



  }


  get markedColumns(): string[] {
    const firstRow = this.filteredAttendanceMarkedList?.[0];
    return firstRow ? Object.keys(firstRow) : [];
  }
  // Add this new property
  isTabLoading = false;
  private _activeTab: string = 'success';

  get activeTab(): string {
    return this._activeTab;
  }

  set activeTab(value: string) {
    if (this._activeTab === value) return;
    this.isTabLoading = true;
    setTimeout(() => {
      this._activeTab = value;
      this.isTabLoading = false;
    }, 300); // small delay so spinner is visible
  }


  get currentData(): any[] {
    if (this.activeTab === 'all') {
      return this.filteredAllList;
    }
    return this.activeTab === 'success'
      ? this.filteredSuccessList
      : this.filteredErrorList;
  }

  get currentHeaders(): string[] {
    return this.currentData.length
      ? Object.keys(this.currentData[0])
      : [];
  }

  get totalCount(): number {
    return this.successCount + this.errorCount;
  }
  // header 
  onMonthOrYearChange() {
    const selectedMonth = this.EmportDailyAttendaceForm.get('FkMonthId')?.value;
    const selectedYear = this.EmportDailyAttendaceForm.get('FkYearId')?.value;

    if (selectedMonth && selectedYear) {
      //new Date(year, month, 0) gives the last day of previous month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

      // Generate headers A1, A2 ... dynamically
      this.dayHeaders = Array.from({ length: daysInMonth }, (_, i) => `A${i + 1}`);
    }
  }

  toggleImportView(): void {
    this.clearImportResults();
    this.resetFileInput();
    this.showImportView = !this.showImportView;
  }

  selectedFileHeadCount: number = 0;

  clearImportResults(): void {
    this.messag = '';
    this.errormessag = '';
    this.successCount = 0;
    this.errorCount = 0;
    this.successList = [];
    this.errorList = [];
    this.filteredSuccessList = [];
    this.filteredErrorList = [];
    this.allList = [];
    this.filteredAllList = [];
    this.searchImportText = '';
  }

  resetFileInput(): void {
    this.selectedFile = undefined;
    this.selectedFileHeadCount = 0;
    this.EmportDailyAttendaceForm.get('file')?.reset();
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileChange(event: any) {
    // Refresh/clear previous import messages and results when a new file is uploaded
    this.clearImportResults();

    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.EmportDailyAttendaceForm.get('file')?.setValue(file);

      // Read Excel to count employee rows (head count) immediately
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json: any[] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          const rows = json.slice(1).filter((r: any) => r && r.some((c: any) => c !== undefined && c !== null && String(c).trim() !== ''));
          this.selectedFileHeadCount = rows.length;
        } catch (err) {
          console.error('Error reading excel headcount:', err);
          this.selectedFileHeadCount = 0;
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.resetFileInput();
      this.EmportDailyAttendaceForm.get('file')?.setErrors({ pattern: true });
    }
  }
  // for show list
  getAttendanceExportImportData() {
    this.filteredAttendanceMarkedList = [];
    this.filteredAttendaceNotMarkedList = [];
    const formData = { ...this.EmportDailyAttendaceForm.value };

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
    this.service.SAL_EmpdaywiseAttendance_ForExportImport(payload).subscribe({
      next: (res: any) => {
        this.Loader.stop();
        this.isViewLoading = false;
        if (res.isSuccess) {
          this.attendanceList = res.data;
          console.log('sdfkjjfs', this.attendanceList)
          this.filteredAttendaceNotMarkedList = [];
          this.filteredAttendanceMarkedList = [];
          this.searchTextAttendanceMarked = '';
          this.searchTextAttendanceNotMarked = '';
          this.AttendanceMarkedCount = res.data.markedCount;

          this.NotMarkedorLockAttendanceCount = res.data.notMarkedCount;

          this.filterAttendance('Marked');
          this.filterAttendance('NotMarked');

          if (this.AttendanceMarkedCount === 0 && this.NotMarkedorLockAttendanceCount > 0) {
            this.activeAttendanceTab = 'notMarked';
          } else {
            this.activeAttendanceTab = 'marked';
          }


        } else {
          this.toastrService.info(res.message)
          this.filteredAttendaceNotMarkedList = [];
          this.filteredAttendanceMarkedList = [];
          this.AttendanceMarkedCount = 0;
          this.NotMarkedorLockAttendanceCount = 0;
          this.attendanceList = {};
        }


      },
      error: (err) => {
        this.toastrService.error(err.message);
        this.Loader.stop();
        this.isViewLoading = false;
      }
    });

  }


  getSelectedMonthName(): string {
    const selectedMonthId = this.EmportDailyAttendaceForm.get('FkMonthId')?.value;
    if (!selectedMonthId || !this.months || this.months.length === 0) return 'Selected Month';
    const monthObj = this.months.find(m => String(m.value) === String(selectedMonthId));
    return monthObj ? monthObj.name : 'Selected Month';
  }

  getPreviousMonthName(): string {
    const selectedMonthId = this.EmportDailyAttendaceForm.get('FkMonthId')?.value;
    if (!selectedMonthId || !this.months || this.months.length === 0) return 'Previous Month';

    // Try finding previous month by numeric value (1-12)
    const monthNum = parseInt(String(selectedMonthId), 10);
    if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
      const prevNum = monthNum === 1 ? 12 : monthNum - 1;
      const prevObj = this.months.find(m => parseInt(String(m.value), 10) === prevNum);
      if (prevObj) return prevObj.name;
    }

    // Fallback using list index
    const currentIndex = this.months.findIndex(m => String(m.value) === String(selectedMonthId));
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + this.months.length) % this.months.length;
      return this.months[prevIndex].name;
    }

    return 'Previous Month';
  }

  exportTemplate(templateType?: any) {
    this.isExporting = true;
    const formData = { ...this.EmportDailyAttendaceForm.value };

    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });

    if (Array.isArray(formData.fk_costcentreid)) {
      formData.fk_costcentreid = formData.fk_costcentreid.join(',');
    }

    // Default to 1 if not selected, undefined, null or invalid
    const type = (templateType === 2 || templateType === '2') ? 2 : 1;
    formData.TemplateType = type;
    formData.templateType = type;

    console.log('Export Template Request Payload:', formData);

    this.service.SAL_EmpdaywiseAttendance_ForExport(formData).subscribe({
      next: (res) => {
        this.ExportattendanceList = res.data;
        if (this.ExportattendanceList && this.ExportattendanceList.length > 0) {
          this.downloadExcel(type);
        } else {
          this.toastrService.info(res?.message || 'No data found to export');
        }
        this.isExporting = false;
      },
      error: () => {
        this.toastrService.error('Failed to export data');
        this.isExporting = false;
      }
    });
  }

  downloadExcel(templateType: number = 1): void {
    const filteredData = this.ExportattendanceList;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const fileName = templateType === 2
      ? `ExportDaywiseAttendance_${this.getPreviousMonthName()}_${this.getSelectedMonthName()}.xlsx`
      : `ExportDaywiseAttendance_${this.getSelectedMonthName()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }


  handleFilters(filters: any) {

    this.EmportDailyAttendaceForm.patchValue(filters);
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
      (emp.empname?.toLowerCase().includes(search) || '') ||
      (emp.empcode?.toLowerCase().includes(search) || '') ||
      (emp.manualEmpCode?.toLowerCase().includes(search) || '') ||
      (emp.location?.toLowerCase().includes(search) || '') ||
      (emp.department?.toLowerCase().includes(search) || '') ||
      (emp.designation?.toLowerCase().includes(search) || '')


    );
  }


  onSubmit() {

    this.submitted = true
    this.showError = true
    this.pageIndex1 = 1;
    this.pageSize1 = 10;
    this.pageIndex2 = 1;
    this.pageSize2 = 10;

    this.EmportDailyAttendaceForm.get('file')?.clearValidators();
    this.EmportDailyAttendaceForm.get('file')?.updateValueAndValidity();
    if (this.EmportDailyAttendaceForm.invalid) {
      return
    }

    this.isViewLoading = true;

    this.getAttendanceExportImportData()

    this.EmportDailyAttendaceForm.get('file')?.setValidators([Validators.required, Validators.pattern(/\.(xlsx)$/i)]);
    this.EmportDailyAttendaceForm.get('file')?.updateValueAndValidity();
  }




  Import() {
    if (this.EmportDailyAttendaceForm.invalid) {
      this.EmportDailyAttendaceForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const fileToSave = this.selectedFile;
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);
      formData.append('FkMonthId', this.EmportDailyAttendaceForm.get('FkMonthId')?.value);
      formData.append('FkYearId', this.EmportDailyAttendaceForm.get('FkYearId')?.value);
      
      // Clear previous results & activate loading state
      this.isImporting = true;
      this.successCount = 0;
      this.errorCount = 0;
      this.successList = [];
      this.errorList = [];
      this.filteredSuccessList = [];
      this.filteredErrorList = [];
      this.allList = [];
      this.filteredAllList = [];

      this.service.SAL_EmpdaywiseAttendance_ForImport(formData).subscribe({
        next: (res) => {
          this.isImporting = false;
          if (res.isSuccess) {
            this.messag = res.message;
            this.errormessag = '';

            if (res.data) {
              this.successCount = res.data.successCount ?? 0;
              this.errorCount = res.data.errorCount ?? 0;

              this.successList = res.data.successList ?? [];
              this.errorList = res.data.errorList ?? [];

              this.filteredSuccessList = [...this.successList];
              this.filteredErrorList = [...this.errorList];
              this.allList = [
                ...this.successList,
                ...this.errorList
              ];

              this.filteredAllList = [...this.allList];

              // Show loading briefly on error list / tab table then render
              this.isTabLoading = true;
              this._activeTab = this.errorCount > 0 ? 'error' : 'success';
              setTimeout(() => {
                this.isTabLoading = false;
              }, 250);

              this.resetFileInput();
            }
          } else {
            this.errormessag = res.message;
            this.messag = '';
            this.toastrService.error(res.message || 'Import failed.');
            this.resetFileInput();
          }

          // Save upload history and refresh Fact Box
          if (fileToSave) {
            const resultPayload = res?.data ? res.data : { isSuccess: res?.isSuccess, message: res?.message || this.errormessag };
            this.uploadHistoryService.saveUploadHistory(fileToSave, 'DAYWISE_ATT_IMPORT', resultPayload).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording daywise attendance upload history:', e)
            });
          }
        },
        error: (err) => {
          this.isImporting = false;
          const backendMsg = err?.error?.message || err?.error?.Message || (typeof err?.error === 'string' ? err.error : null);
          this.errormessag = backendMsg || err?.message || 'Daywise attendance import failed.';
          this.toastrService.error(this.errormessag);
          this.resetFileInput();

          if (fileToSave) {
            this.uploadHistoryService.saveUploadHistory(fileToSave, 'DAYWISE_ATT_IMPORT', { isSuccess: false, message: this.errormessag }).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording daywise attendance upload history:', e)
            });
          }
        }
      });
    }
  }

  filterImportData() {

    const search = this.searchImportText.toLowerCase();

    this.filteredSuccessList = this.successList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );

    this.filteredErrorList = this.errorList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
    this.filteredAllList = this.allList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );

  }

  exportImportResult() {

    // const exportData =
    //   this.activeTab === 'success'
    //     ? this.filteredSuccessList
    //     : this.filteredErrorList;

    let exportData: any[] = [];

    if (this.activeTab === 'all') {
      exportData = this.filteredAllList;
    }
    else if (this.activeTab === 'success') {
      exportData = this.filteredSuccessList;
    }
    else {
      exportData = this.filteredErrorList;
    }

    if (!exportData.length) {
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wb = XLSX.utils.book_new();

    let sheetName = '';

    if (this.activeTab === 'all') {
      sheetName = 'All Attendance';
    }
    else if (this.activeTab === 'success') {
      sheetName = 'Uploaded';
    }
    else {
      sheetName = 'Not Uploaded';
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    let fileName = '';

    if (this.activeTab === 'all') {
      fileName = 'AllAttendance.xlsx';
    }
    else if (this.activeTab === 'success') {
      fileName = 'UploadedAttendance.xlsx';
    }
    else {
      fileName = 'NotUploadedAttendance.xlsx';
    }

    XLSX.writeFile(wb, fileName);
  }

  resetFile() {
    this.resetFileInput();
    this.clearImportResults();
  }

  toggleSelectAllCostCenters(event: any) {
    const isChecked = event.target.checked;
    const realValues = this.CostCenter
      .filter(c => c.value !== '__select_all__')
      .map(c => c.value);
    this.selectedCostCenters = isChecked ? (realValues as string[]) : [];
    this.EmportDailyAttendaceForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  toggleCostCenter(costCenter: string) {
    const index = this.selectedCostCenters.indexOf(costCenter);
    if (index === -1) {
      this.selectedCostCenters.push(costCenter);
    } else {
      this.selectedCostCenters.splice(index, 1);
    }
    this.EmportDailyAttendaceForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
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
    this.EmportDailyAttendaceForm.controls['fk_costcentreid'].setValue([]);
  }

  // --- Fact Box Methods ---
  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
    this.workflowNav.isSidebarOpen = this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('DAYWISE_ATT_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
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
    const fileName = file.file_name || file.fileName || 'Daywise_Attendance_Import.xlsx';
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

  get nextActionHint(): { icon: string; color: string; title: string; text: string; navLabel?: string; navRoute?: string } {
    if (this.errorCount > 0) {
      return {
        icon: 'fa-exclamation-triangle',
        color: '#dc3545',
        title: 'Review Import Errors',
        text: `${this.errorCount} punch record(s) failed validation. Check error list or upload corrected sheet.`
      };
    }

    if (this.successCount > 0 || this.totalUploadedFiles > 0) {
      const hasMonthlyAccess = this.workflowNav.hasAccess(this.workflowNav.ROUTES.MONTHLY_ATTENDANCE, 'Monthly Attendance');
      return {
        icon: 'fa-arrow-circle-right',
        color: '#28a745',
        title: hasMonthlyAccess ? 'Next Step: Monthly Attendance' : 'Day-Wise Attendance Processed',
        text: hasMonthlyAccess
          ? 'Daily punches captured successfully. Process monthly attendance to compute present & paid days.'
          : 'Daily punches captured successfully.',
        navLabel: hasMonthlyAccess ? 'Go to Monthly Attendance' : undefined,
        navRoute: hasMonthlyAccess ? this.workflowNav.ROUTES.MONTHLY_ATTENDANCE : undefined
      };
    }

    return {
      icon: 'fa-upload',
      color: '#3080e8',
      title: 'Import Day-Wise Attendance',
      text: 'Select Month & Year, attach the template Excel file and click Import to record daily punches.'
    };
  }

  private saveContext(): void {
    this.workflowNav.prepareWorkflowNavigation(
      this.EmportDailyAttendaceForm.get('FkMonthId')?.value,
      this.EmportDailyAttendaceForm.get('FkYearId')?.value,
      this.EmportDailyAttendaceForm.get('fk_costcentreid')?.value
    );
  }

  goToMonthlyAttendance(): void {
    this.saveContext();
    this.router.navigate([this.workflowNav.ROUTES.MONTHLY_ATTENDANCE]);
  }

  goToAttendanceAdjustment(): void {
    this.saveContext();
    this.router.navigate([this.workflowNav.ROUTES.ATTENDANCE_ADJUSTMENT]);
  }

  goToAttendanceReport(): void {
    this.saveContext();
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Import Day-Wise Attendance');
  }

  goToLeaveReport(): void {
    this.saveContext();
    this.workflowNav.navigateToReport('leave', this.router.url, 'Import Day-Wise Attendance');
  }
}
