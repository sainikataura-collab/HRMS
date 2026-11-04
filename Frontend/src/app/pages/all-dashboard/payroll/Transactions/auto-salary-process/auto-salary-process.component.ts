import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter, forkJoin } from 'rxjs';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { EmployeeService } from '../../services/employee.service';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';

import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-auto-salary-process',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, RouterLink, WorkflowSidebarComponent],
  templateUrl: './auto-salary-process.component.html',
  styleUrl: './auto-salary-process.component.scss'
})
export class AutoSalaryProcessComponent {
  EmployeeForm!: FormGroup;
  isExporting = false;
  isContractApplicable = false;
  submitted = false;
  salaryLockCount: number = 0;
  salaryProcessedCount: number = 0;
  salaryNotProcessedCount: number = 0;
  showError = false;
  isFactBoxOpen: boolean = true;
  fiterData = {}
  // For table 1
  pageIndex1: number = 1;
  pageSize1: number = 10;

  // For table 2
  pageIndex2: number = 1;
  pageSize2: number = 10;

  // For table 3
  pageIndex3: number = 1;
  pageSize3: number = 10;
  months: any[] = [];
  natureOptions: any[] = [];
  attendanceData: any = {};
  CostCenter: any[] = [];


  searchTextProcessed = '';
  searchTextLocked = '';
  searchTextUnprocessed = '';
  selectedempcodeUnProcessed: string[] = [];
  selectionSource: 'unprocessed' | 'processed' | 'none' = 'none';
  filteredProcessedList: any[] = [];
  filteredLockedList: any[] = [];
  filteredUnprocessedList: any[] = [];
  selectedCostCenters: string[] = [];


  years: any[] = [];
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: MonthlyRentDetailService,
    private Loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private httpService: EmployeeService,
    public workflowNav: WorkflowNavigationService

  ) { }




  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;

    this.filteredProcessedList = this.attendanceData.salaryProcessed || [];
    this.filteredLockedList = this.attendanceData.salaryLock || [];
    this.filteredUnprocessedList = this.attendanceData.salaryNotProcessed || [];

    this.EmployeeForm = this.fb.group({
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
      fk_costcentreid: [[]],
      selectedempcode: [''],
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
    })


    this.Loader.start();
    forkJoin([
      this.httpservice.getCommanList('Month'),
      this.httpservice.getCommanList('Year'),
      this.httpservice.getCommanList('CostCenter'),

    ]).subscribe({
      next: ([monthsRes, yearsRes, ContractorRes]) => {
        this.months = monthsRes.data;
        this.years = yearsRes.data;
        this.CostCenter = [
          { name: 'Select All', value: '__select_all__' },
          ...ContractorRes.data.slice(1)
        ];
        this.Loader.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        if (this.workflowNav.applyContextIfFromWorkflow(this.EmployeeForm, this.months, this.years, this.CostCenter)) {
          const cc = this.EmployeeForm.get('fk_costcentreid')?.value;
          if (Array.isArray(cc)) {
            this.selectedCostCenters = [...cc];
          }
        }
      },
      error: () => {
        this.toastrService.error("Failed to load data");
        this.Loader.stop();
      }
    });
  }

  getPayrollContext = () => ({
    month: this.EmployeeForm.get('FkMonthId')?.value,
    year: this.EmployeeForm.get('FkYearId')?.value,
    costCentre: this.EmployeeForm.get('fk_costcentreid')?.value
  });


  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);

  }
  autoProcessDataList() {


    // Clone and sanitize form data
    const formData = { ...this.EmployeeForm.value };

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
      pageIndex3: this.pageIndex3 - 1,
      pageSize3: this.pageSize3,
      ...formData // spread form values into the request body
    };
    this.Loader.start();
    this.httpservice.getSalaryProcess(payload).subscribe({

      next: (res: any) => {
        this.Loader.stop();
        if (res.isSuccess) {
          this.attendanceData = res.data;


          this.filteredProcessedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
          this.salaryLockCount = 0,
            this.salaryProcessedCount = 0
          this.salaryNotProcessedCount = 0
          this.searchTextLocked = '',
            this.searchTextProcessed = ''
          this.searchTextUnprocessed = ''
          setTimeout(() => {
            this.salaryLockCount = res.data.salaryLockCount;
            this.salaryProcessedCount = res.data.salaryProcessedCount;
            this.salaryNotProcessedCount = res.data.salaryNotProcessedCount;
          });
          this.filterAttendance('process');
          this.filterAttendance('locked');
          this.filterAttendance('unprocessed');

        } else {
          this.toastrService.info(res.message)
          this.filteredProcessedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
        }


      },
      error: (err) => {
        this.toastrService.error(err.message);
        this.Loader.stop();
      }
    });

  }

  EmpUnProcessed(empCode: string, event: any, source: 'unprocessed' | 'processed' = 'unprocessed') {
    if (event.target.checked) {
      if (!this.selectedempcodeUnProcessed.includes(empCode)) {
        this.selectedempcodeUnProcessed.push(empCode);
      }
      this.selectionSource = source;
    } else {
      this.selectedempcodeUnProcessed = this.selectedempcodeUnProcessed.filter(code => code !== empCode);
      if (this.selectedempcodeUnProcessed.length === 0) {
        this.selectionSource = 'none';
      }
    }
  }


  onNotMarkedPageChange(event: number): void {
    this.pageIndex1 = event;
    this.autoProcessDataList();
  }

  onMarkedPageChange(event: number): void {
    this.pageIndex2 = event;
    this.autoProcessDataList();
  }

  onLockedPageChange(event: number): void {
    this.pageIndex3 = event;
    this.autoProcessDataList();
  }





  onSubmit() {
    debugger
    this.submitted = true;
    this.showError = true;

    if (this.EmployeeForm.invalid) {

      return;
    }

    const empCode = this.EmployeeForm.get('sortBy')?.value;
    const selectedDepartments = this.EmployeeForm.get('selectedDepartments')?.value;
    const selectedLocations = this.EmployeeForm.get('selectedLocations')?.value;


    if (!empCode || empCode.trim() === '') {
      this.toastrService.warning('Please select sortBy', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }

    if (!selectedDepartments || selectedDepartments.length === 0) {
      this.toastrService.warning('Please select at least one Department', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }

    if (!selectedLocations || selectedLocations.length === 0) {
      this.toastrService.warning('Please select at least one Location', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }
    this.selectedempcodeUnProcessed = [];
    this.selectionSource = 'none';

    this.autoProcessDataList();
  }


  postSalaryData() {

    if (!this.filteredUnprocessedList || this.filteredUnprocessedList.length === 0) {
      this.toastrService.warning('You have not selected employee to process!.');
      return;
    }
    const selectempcode = this.selectedempcodeUnProcessed.join(',')

    //const postPayload = {...this.EmployeeForm.value,empcode:selectempcode}; //  send directly 

    const postPayload = { ...this.EmployeeForm.value, selectedempcode: selectempcode }; //  send directly 

    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }
    });

    if (Array.isArray(postPayload.fk_costcentreid)) {
      postPayload.fk_costcentreid = postPayload.fk_costcentreid.join(',');
    }

    this.Loader.start();

    this.httpservice.postSalaryProcess(postPayload).subscribe({
      next: (res) => {
        this.Loader.stop();
        if (res.isSuccess) {
          this.toastrService.success('salary has been processed successfully!');
          this.onSubmit();
        } else {
          this.toastrService.error(res.message || 'Failed salary has been processed successfull.');
        }
      },
      error: (err) => {
        this.Loader.stop();
        this.toastrService.error(err.message || 'Server error while posting data');
      }
    });
  }

  deleteSalaryData() {

    if (!this.filteredProcessedList || this.filteredProcessedList.length === 0) {
      this.toastrService.warning('You have not selected employee to un-process!.');
      return;
    }
    const selectempcode = this.selectedempcodeUnProcessed.join(',')
    // const postPayload = {...this.EmployeeForm.value,empcode:selectempcode}; //  send directly 

    const postPayload = { ...this.EmployeeForm.value, selectedempcode: selectempcode }; //  send directly 

    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }
    });

    if (Array.isArray(postPayload.fk_costcentreid)) {
      postPayload.fk_costcentreid = postPayload.fk_costcentreid.join(',');
    }

    this.Loader.start();
    this.httpservice.DeleteSalaryProcess(postPayload).subscribe({
      next: (res) => {
        this.Loader.stop();
        if (res.isSuccess) {
          this.onSubmit();
          this.toastrService.success('Salary Process has been Un processed successfull');

        } else {
          this.toastrService.error(res.message);
        }
      },
      error: (err) => {
        this.Loader.stop();
        this.toastrService.error(err.message);
      }
    });
  }



  filterAttendance(type: 'process' | 'locked' | 'unprocessed') {


    let list: any[] = [];
    let searchText = '';

    switch (type) {
      case 'process':
        list = this.attendanceData.salaryProcessed || [];
        searchText = this.searchTextProcessed;
        this.filteredProcessedList = this.applySearch(list, searchText);
        break;
      case 'locked':
        list = this.attendanceData.salaryLock || [];
        searchText = this.searchTextLocked;
        this.filteredLockedList = this.applySearch(list, searchText);
        break;
      case 'unprocessed':
        list = this.attendanceData.salaryNotProcessed || [];
        searchText = this.searchTextUnprocessed;
        this.filteredUnprocessedList = this.applySearch(list, searchText);
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
      (emp.designation?.toLowerCase().includes(search) || '') ||
      (emp.totaldays?.toString().toLowerCase().includes(search) || '') ||
      (emp.present?.toString().toLowerCase().includes(search) || '') ||
      (emp.lwp?.toString().toLowerCase().includes(search) || '') ||
      (emp.holidays?.toString().toLowerCase().includes(search) || '') ||
      (emp.otHrs?.toString().toLowerCase().includes(search) || '') ||
      (emp.wOff?.toString().toLowerCase().includes(search) || '') ||
      (emp.paidDays?.toString().toLowerCase().includes(search) || '')
    );
  }

  toggleSelectAllCostCenters(event: any) {
    const isChecked = event.target.checked;
    const realValues = this.CostCenter
      .filter(c => c.value !== '__select_all__')
      .map(c => c.value);
    this.selectedCostCenters = isChecked ? realValues : [];
    this.EmployeeForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  toggleCostCenter(costCenter: string) {
    const index = this.selectedCostCenters.indexOf(costCenter);
    if (index === -1) {
      this.selectedCostCenters.push(costCenter);
    } else {
      this.selectedCostCenters.splice(index, 1);
    }
    this.EmployeeForm.controls['fk_costcentreid'].setValue(this.selectedCostCenters);
  }

  isAllCostCentersSelected(): boolean {
    const realCostCenters = this.CostCenter.filter(item => item.value !== '__select_all__');
    return (
      this.selectedCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => this.selectedCostCenters.includes(c.value))
    );
  }

  getCostCenterDisplayText(): string {
    const realCostCenters = this.CostCenter.filter(c => c.value !== '__select_all__');
    const selectedRealCostCenters = this.selectedCostCenters.filter(value => value !== '__select_all__');

    if (
      selectedRealCostCenters.length === realCostCenters.length &&
      realCostCenters.every(c => selectedRealCostCenters.includes(c.value))
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
  Exceldownload() {
    const ExportType = 2;

    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = {
      ...this.EmployeeForm.value,
      fk_monthId: this.EmployeeForm.get('FkMonthId')?.value,
      fk_yearId: this.EmployeeForm.get('FkYearId')?.value,
      pageIndex: 0,
      pageSize: 10000,
      ExportType: 2
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });
    let selectedMonthId = this.EmployeeForm.get('FkMonthId')?.value;
    let selectedMonth: { name: string, value: string } | undefined = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    let { name: month, value } = { ...selectedMonth! }

    let selectedYearId = this.EmployeeForm.get('FkYearId')?.value;
    let selectedYear: { name: string, value: string } | undefined = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    let { name: Year, value: Yearvalue } = { ...selectedYear! }

    //== let selectedReportId = this.ExportExcel.get('ExportType')?.value;
    // let selectedReport: { name: string, value: number } | undefined = this.ExportTypelist.find((m: { name: string, value: number }) => m.value === selectedReportId);
    // let { name: Report, value: Reportvalue } = { ...selectedReport! }

    let ReportName = month + '_' + Year + '.xlsx';


    payload.ReportName = 'Employees Salary';

    if (Array.isArray(payload.fk_costcentreid)) {
      payload.fk_costcentreid = payload.fk_costcentreid.join(',');
    }

    this.httpService.downloadViewSalaryReportlistforexportype1(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
        a.download = ReportName;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.isExporting = false; // reset after download
      },
      error: (err) => {
        console.error('Download failed', err);
        this.isExporting = false; // reset even on error
      }
    });
  }

  toggleFactBox() {
    this.isFactBoxOpen = !this.isFactBoxOpen;
    this.workflowNav.isSidebarOpen = this.isFactBoxOpen;
  }

  get totalEmployees(): number {
    return this.salaryProcessedCount + this.salaryNotProcessedCount + this.salaryLockCount;
  }

  get completionPercent(): number {
    if (this.totalEmployees === 0) return 0;
    return Math.round(((this.salaryProcessedCount + this.salaryLockCount) / this.totalEmployees) * 100);
  }

  get progressColor(): string {
    const p = this.completionPercent;
    if (p === 0) return '#adb5bd'; // grey — no data
    if (p < 30) return '#dc3545'; // red — very low
    if (p < 70) return '#f59e0b'; // amber — in progress
    if (p < 100) return '#3080e8'; // blue — nearly done
    return '#28a745';                // green — all done
  }

  get totalNetPay(): number {
    const list = (this.filteredProcessedList && this.filteredProcessedList.length > 0)
      ? this.filteredProcessedList
      : (this.attendanceData?.salaryProcessed || []);
    return list.reduce((sum: number, e: any) => {
      const val = parseFloat(e.netPay ?? e.net_pay ?? e.netPayable ?? e.netAmount ?? 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }

  get totalGross(): number {
    const list = (this.filteredProcessedList && this.filteredProcessedList.length > 0)
      ? this.filteredProcessedList
      : (this.attendanceData?.salaryProcessed || []);
    return list.reduce((sum: number, e: any) => {
      const val = parseFloat(e.grossTotal ?? e.gross_total ?? e.gross ?? e.totalGross ?? 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }

  get totalDeductions(): number {
    const list = (this.filteredProcessedList && this.filteredProcessedList.length > 0)
      ? this.filteredProcessedList
      : (this.attendanceData?.salaryProcessed || []);
    return list.reduce((sum: number, e: any) => {
      const val = parseFloat(e.totalDeductions ?? e.totalDeduction ?? e.total_deductions ?? e.deductions ?? 0);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }

  get avgPaidDays(): number {
    const list = this.filteredUnprocessedList || [];
    if (list.length === 0) return 0;
    const total = list.reduce((sum: number, e: any) => sum + (e.paidDays || 0), 0);
    return Math.round((total / list.length) * 10) / 10;
  }

  get nextActionHint(): { icon: string; color: string; title: string; text: string; navLabel?: string; navRoute?: string } {
    const total = this.totalEmployees;

    // No data loaded yet
    if (total === 0) {
      return { icon: 'fa-filter', color: '#6c757d', title: 'Load Data', text: 'Select Month, Year and click View to load salary data.' };
    }

    // User selected from Processed list → wants to Un-Process
    if (this.selectionSource === 'processed' && this.selectedempcodeUnProcessed.length > 0) {
      return { icon: 'fa-undo', color: '#dc3545', title: 'Un-Process Salary', text: `You\'ve selected ${this.selectedempcodeUnProcessed.length} processed emp(s). Click the Un-Process button below to reverse salary.` };
    }

    // User selected from Unprocessed list → wants to Process
    if (this.selectionSource === 'unprocessed' && this.selectedempcodeUnProcessed.length > 0) {
      return { icon: 'fa-play-circle', color: '#3080e8', title: 'Process Salary', text: `${this.selectedempcodeUnProcessed.length} emp(s) ready. Click the Process button below to calculate salary.` };
    }

    //  No unprocessed left AND processed exists → tell user to go Lock
    if (this.salaryNotProcessedCount === 0 && this.salaryProcessedCount > 0) {
      return { icon: 'fa-lock', color: '#28a745', title: 'Lock Salary', text: 'No pending employees! Go to Salary Lock/Unlock to lock the payroll.', navLabel: 'Go to Salary Lock / Unlock', navRoute: '/dash/payroll/payrolldashboard/salaryLock' };
    }

    // Some still pending → guide to process them
    if (this.salaryProcessedCount > 0 && this.salaryNotProcessedCount > 0) {
      return { icon: 'fa-hand-o-up', color: '#f59e0b', title: 'Select to Process', text: `${this.salaryNotProcessedCount} emp(s) still pending. Select them from the Unprocessed table and click Process.` };
    }

    // Everything locked, nothing to process
    if (this.salaryLockCount > 0 && this.salaryNotProcessedCount === 0 && this.salaryProcessedCount === 0) {
      return { icon: 'fa-file-text', color: '#6f42c1', title: 'View Report', text: 'Salary is fully locked. Go to View Salary Report to check payslips.', navLabel: 'View Salary Report', navRoute: '/dash/payroll/payrolldashboard/exportexcel' };
    }

    // Default: nothing processed yet
    return { icon: 'fa-hand-o-up', color: '#f59e0b', title: 'Select Employees', text: 'Select employees from the Unprocessed table below to begin salary processing.' };
  }

  goToArrearProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.ARREAR_PROCESS]);
  }

  goToMonthlyAttendance(): void {
    this.router.navigate([this.workflowNav.ROUTES.MONTHLY_ATTENDANCE]);
  }

  goToManualIncomeTax(): void {
    this.router.navigate([this.workflowNav.ROUTES.MANUAL_INCOME_TAX]);
  }

  goToSalaryLock(): void {
    this.router.navigate([this.workflowNav.ROUTES.SALARY_LOCK]);
  }

  goToSalaryReport(): void {
    this.workflowNav.navigateToReport('salary', this.router.url, 'Auto Salary Process');
  }

  goToAttendanceReport(): void {
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Auto Salary Process');
  }

  goToLeaveReport(): void {
    this.workflowNav.navigateToReport('leave', this.router.url, 'Auto Salary Process');
  }

}


