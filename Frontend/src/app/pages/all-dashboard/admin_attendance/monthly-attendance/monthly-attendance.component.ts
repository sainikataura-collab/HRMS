import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';

import { WorkflowNavigationService } from '../../../../shared/services/workflow-navigation.service';

import { WorkflowSidebarComponent } from '../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-monthly-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule, RouterLink, WorkflowSidebarComponent],
  templateUrl: './monthly-attendance.component.html',
  styleUrl: './monthly-attendance.component.scss'
})
export class MonthlyAttendanceComponent {
EmployeeForm!: FormGroup;
  submitted=false;
  isContractApplicable= false;
  lockedAttendanceCount: number = 0;
  markedAttendanceCount: number = 0;
  notMarkedAttendanceCount: number = 0;
  showError = false;
  isFactBoxOpen: boolean = true;
// For table 1
pageIndex1: number = 1;
pageSize1: number = 10;

// For table 2
pageIndex2: number = 1;
pageSize2: number = 10;

// For table 3
pageIndex3: number = 1;
pageSize3: number = 10;
months:any[]=[];
natureOptions: any[] = [];
attendanceData: any = {};


searchTextMarked = '';
searchTextLocked = '';
searchTextUnprocessed = '';
selectedEmpCodes: string[] = [];
selectedEmpUprocessed: string[] = [];
filteredMarkedList: any[] = [];
filteredLockedList: any[] = [];
filteredUnprocessedList: any[] = [];
CostCenter:any[]=[];
selectedCostCenters: string[] = [];


years:any[]=[];
  constructor(private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private httpservice :MonthlyRentDetailService,
    private Loader:NgxUiLoaderService,
    private dropdownService: DropdownService,
    public workflowNav: WorkflowNavigationService

  ) {}
  

  ngOnInit() {
this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;
       
    this.filteredMarkedList = this.attendanceData.markedAttendance || [];
    this.filteredLockedList = this.attendanceData.lockedAttendance || [];
    this.filteredUnprocessedList = this.attendanceData.unprocessedAttendance || [];
    this.EmployeeForm = this.fb.group({
      FkMonthId: [null,Validators.required],
      FkYearId: [null,Validators.required],
      fk_costcentreid:[[]],
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
      next: ([monthsRes, yearsRes,ContractorRes]) => {
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

  toggleEmpCodeSelection(empCode: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedEmpCodes.includes(empCode)) {
        this.selectedEmpCodes.push(empCode);
      }
    } else {
      this.selectedEmpCodes = this.selectedEmpCodes.filter(code => code !== empCode);
    }

    // this.EmployeeForm.get('empCode')?.setValue(this.selectedEmpCodes.join(',')); // store as comma-separated
  }


  EmpCodeSelectionforUnprocess(empCode: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedEmpUprocessed.includes(empCode)) {
        this.selectedEmpUprocessed.push(empCode);
      }
    } else {
      this.selectedEmpUprocessed = this.selectedEmpUprocessed.filter(code => code !== empCode);
    }

    // this.EmployeeForm.get('empCode')?.setValue(this.selectedEmpCodes.join(',')); // store as comma-separated
  }

  handleFilters(filters: any) {

    this.EmployeeForm.patchValue(filters);

    
  }
  getAttendanceData() {
    // this.EmployeeForm.get('empCode')?.patchValue(null);
    this.filteredMarkedList = [];
    this.filteredLockedList = [];
    this.filteredUnprocessedList = [];

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
    this.httpservice.getAttendance(payload).subscribe({
    
      next: (res: any) => {
        this.Loader.stop();
        if (res.isSuccess) {
          this.attendanceData = res.data;

          this.filteredMarkedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
          this.searchTextLocked='';
          this.searchTextMarked='';
          this.searchTextUnprocessed='';

          this.lockedAttendanceCount = res.data.lockedAttendanceCount;
          this.markedAttendanceCount = res.data.markedAttendanceCount;
          this.notMarkedAttendanceCount = res.data.notMarkedAttendanceCount;
          this.filterAttendance('marked');
          this.filterAttendance('locked');
          this.filterAttendance('unprocessed');

        }else{
          this.toastrService.info(res.message)
          this.filteredMarkedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
          this.lockedAttendanceCount=0;
          this.markedAttendanceCount=0;
          this.notMarkedAttendanceCount=0;
          this.attendanceData={};
        }
       

      },
      error: (err) => {
        this.toastrService.error(err.message);
        this.Loader.stop();
      }
    });
    
  }
  
onNotMarkedPageChange(event: number): void {
  this.pageIndex1 = event;
  this.getAttendanceData();
}

onMarkedPageChange(event: number): void {
  this.pageIndex2 = event;
  this.getAttendanceData();
}

onLockedPageChange(event: number): void {
  debugger
  this.pageIndex3 = event;
  this.getAttendanceData();
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
    this.selectedEmpCodes=[];
    this.selectedEmpUprocessed=[];
    this.getAttendanceData();
  }
   

  postAllAttendanceData() {
    
    if (!this.filteredUnprocessedList || this.filteredUnprocessedList.length === 0) {
      this.toastrService.warning('You have not selected employee to un-process monthly attendace!.');
      return;
    }
   const allepmcode=this.selectedEmpCodes.join(',');
    const postPayload = {...this.EmployeeForm.value}; // ✔ send directly
          

  
    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }
    });

    if (Array.isArray(postPayload.fk_costcentreid)) {
      postPayload.fk_costcentreid = postPayload.fk_costcentreid.join(',');
    }

    this.Loader.start()
    this.httpservice.postAttendance(postPayload).subscribe({
      next: (res) => {
        this.Loader.stop()
        if (res.isSuccess) {
          this.toastrService.success('Attendance has been processed successfully!');
          this.getAttendanceData();
        } else {
          this.toastrService.error(res.message || 'Failed Attendance has been processed successfull.');
        }
      },
      error: (err) => {
        this.toastrService.error(err.message || 'Server error while posting data');
      }
    });
  }
  
  deleteAllAttendanceData() {

    if (!this.filteredMarkedList || this.filteredMarkedList.length === 0) {
      this.toastrService.warning('You have not selected employee to un-process monthly attendance!.');
      return;
    }

    const selectedEmpUprocessed=this.selectedEmpUprocessed.join(',');
    // const postPayload = {...this.EmployeeForm.value,empcode:selectedEmpUprocessed}; // ✔ send directly
    const postPayload = {...this.EmployeeForm.value}; // ✔ send directly
  
    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }
    });

    if (Array.isArray(postPayload.fk_costcentreid)) {
      postPayload.fk_costcentreid = postPayload.fk_costcentreid.join(',');
    }

    this.httpservice.DeleteAttendance(postPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.getAttendanceData();
          this.toastrService.success('Attendance has been Un processed successfull');
       
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: (err) => {
        this.toastrService.error(err.message);
      }
    });
  }
  


  filterAttendance(type: 'marked' | 'locked' | 'unprocessed') {
    debugger
    let list: any[] = [];
    let searchText = '';
  
    switch (type) {
      case 'marked':
        list = this.attendanceData.markedAttendance || [];
        searchText = this.searchTextMarked;
        this.filteredMarkedList = this.applySearch(list, searchText);
        break;
      case 'locked':
        list = this.attendanceData.lockedAttendance || [];
        searchText = this.searchTextLocked;
        this.filteredLockedList = this.applySearch(list, searchText);
        break;
      case 'unprocessed':
        list = this.attendanceData.notMarkedAttendance || [];
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

  // ── Fact Box Insights ────────────────────────────────────

  toggleFactBox() {
    this.isFactBoxOpen = !this.isFactBoxOpen;
    this.workflowNav.isSidebarOpen = this.isFactBoxOpen;
  }

  get totalEmployees(): number {
    return (this.notMarkedAttendanceCount || 0) + (this.markedAttendanceCount || 0) + (this.lockedAttendanceCount || 0);
  }

  get completionPercent(): number {
    if (this.totalEmployees === 0) return 0;
    return Math.round((((this.markedAttendanceCount || 0) + (this.lockedAttendanceCount || 0)) / this.totalEmployees) * 100);
  }

  get progressColor(): string {
    const p = this.completionPercent;
    if (p === 0) return '#adb5bd';
    if (p < 30) return '#dc3545';
    if (p < 70) return '#f59e0b';
    if (p < 100) return '#3080e8';
    return '#28a745';
  }

  get totalPresentDays(): number {
    const list = (this.filteredMarkedList && this.filteredMarkedList.length > 0)
      ? this.filteredMarkedList
      : (this.attendanceData?.markedAttendance || []);
    return list.reduce((sum: number, e: any) => sum + (parseFloat(e.present) || 0), 0);
  }

  get totalPaidDays(): number {
    const list = (this.filteredMarkedList && this.filteredMarkedList.length > 0)
      ? this.filteredMarkedList
      : (this.attendanceData?.markedAttendance || []);
    return list.reduce((sum: number, e: any) => sum + (parseFloat(e.paidDays) || 0), 0);
  }

  get totalLwpDays(): number {
    const list = (this.filteredMarkedList && this.filteredMarkedList.length > 0)
      ? this.filteredMarkedList
      : (this.attendanceData?.markedAttendance || []);
    return list.reduce((sum: number, e: any) => sum + (parseFloat(e.lwp) || 0), 0);
  }

  get totalOtHrs(): number {
    const list = (this.filteredMarkedList && this.filteredMarkedList.length > 0)
      ? this.filteredMarkedList
      : (this.attendanceData?.markedAttendance || []);
    return list.reduce((sum: number, e: any) => sum + (parseFloat(e.otHrs ?? e.otWorked ?? 0) || 0), 0);
  }

  get nextActionHint(): { icon: string; color: string; title: string; text: string; navLabel?: string; navRoute?: string } {
    const total = this.totalEmployees;

    if (total === 0) {
      return { icon: 'fa-filter', color: '#6c757d', title: 'Load Data', text: 'Select Month, Year and click View to load monthly attendance data.' };
    }

    if (this.selectedEmpUprocessed.length > 0) {
      return { icon: 'fa-undo', color: '#dc3545', title: 'Un-Process Attendance', text: `You've selected ${this.selectedEmpUprocessed.length} processed emp(s). Click Un-Process button below to revert.` };
    }

    if (this.selectedEmpCodes.length > 0) {
      return { icon: 'fa-play-circle', color: '#3080e8', title: 'Process Attendance', text: `${this.selectedEmpCodes.length} emp(s) selected. Click Process button below to calculate attendance.` };
    }

    if (this.notMarkedAttendanceCount === 0 && this.markedAttendanceCount > 0) {
      return { icon: 'fa-arrow-circle-right', color: '#28a745', title: 'Auto Salary Process', text: 'All monthly attendance processed! Next step: Auto Salary Process.', navLabel: 'Go to Auto Salary Process', navRoute: '/dash/payroll/payrolldashboard/autoSalaryProcess' };
    }

    if (this.markedAttendanceCount > 0 && this.notMarkedAttendanceCount > 0) {
      return { icon: 'fa-hand-o-up', color: '#f59e0b', title: 'Select to Process', text: `${this.notMarkedAttendanceCount} emp(s) pending. Select them from Un Process Attendance table and click Process.` };
    }

    if (this.lockedAttendanceCount > 0 && this.notMarkedAttendanceCount === 0 && this.markedAttendanceCount === 0) {
      return { icon: 'fa-lock', color: '#6f42c1', title: 'Attendance Locked', text: 'Attendance is fully locked for this period.' };
    }

    return { icon: 'fa-hand-o-up', color: '#f59e0b', title: 'Select Employees', text: 'Select employees from the Un Process Attendance table below to process attendance.' };
  }

  goToDailyAttendance(): void {
    this.router.navigate([this.workflowNav.ROUTES.DAILY_ATTENDANCE]);
  }

  goToAttendanceAdjustment(): void {
    this.router.navigate([this.workflowNav.ROUTES.ATTENDANCE_ADJUSTMENT]);
  }

  goToArrearProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.ARREAR_PROCESS]);
  }

  goToAutoSalaryProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.AUTO_SALARY_PROCESS]);
  }

  goToAttendanceReport(): void {
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Monthly Attendance');
  }

  goToLeaveReport(): void {
    this.workflowNav.navigateToReport('leave', this.router.url, 'Monthly Attendance');
  }

}

