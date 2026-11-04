import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { AttendanceAdjustmentService } from '../../payroll/services/attendance-adjustment.service';
import { WorkflowNavigationService } from '../../../../shared/services/workflow-navigation.service';
import { WorkflowSidebarComponent } from '../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-attendance-adjustment',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent, WorkflowSidebarComponent],
  templateUrl: './attendance-adjustment.component.html',
  styleUrl: './attendance-adjustment.component.scss'
})
export class AttendanceAdjustmentComponent {
  EmployeeList: { name: string; value: string }[] = [];
  Month: { name: string, value: string }[] = [];
  Year: { name: string, value: string }[] = [];
  Contractor: { name: string, value: string | null }[] = [];
  selectedContractors: string[] = [];
  isContractApplicable = false;

  list: any[] = [];
  list1: any[] = [];
  Isedit = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  pageIndex1: number = 1;
  pageSize1: number = 10;
  totalCount1: number = 0;
  totalCount2: number = 0;
  searchText: string = '';
  EmployeeForm!: FormGroup;
  submitted = false;
  showEmployeeList: boolean = false;
  showError = false;
  id!: number;

  ngxUILoaderService = inject(NgxUiLoaderService);



  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private Service: AttendanceAdjustmentService,
    public workflowNav: WorkflowNavigationService
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;

    this.EmployeeForm = this.fb.group({
      fk_monthId: [null, [Validators.required]],
      fk_yearId: [null, [Validators.required]],
      fk_costcentreid: [[]],
      empCode: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [],
      selectedDesignation: [''],
      selectedLocations: [],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      userId: [''],
      empStatus: [''],
      employees: this.fb.array([])

    });

    this.ngxUILoaderService.start();
    forkJoin([
      this.Service.getMonthlist('Month'),
      this.Service.getYear('Year'),
      this.Service.getYear('CostCenter')
    ]).subscribe({
      next: ([monthRes, yearRes, contractorRes]) => {
        if (monthRes?.isSuccess && monthRes.data?.length) {
          this.Month = monthRes.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        }
        if (yearRes?.isSuccess && yearRes.data) {
          this.Year = yearRes.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        }
        if (contractorRes?.isSuccess && contractorRes.data) {
          this.Contractor = [
            { name: 'Select All', value: '__select_all__' },
            ...contractorRes.data.slice(1).map((con: any) => ({
              name: con.name,
              value: con.value
            }))
          ];
        }
        this.ngxUILoaderService.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        if (this.workflowNav.applyContextIfFromWorkflow(this.EmployeeForm, this.Month, this.Year, this.Contractor)) {
          const cc = this.EmployeeForm.get('fk_costcentreid')?.value;
          if (Array.isArray(cc)) {
            this.selectedContractors = [...cc];
          }
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error("Failed to load dropdown lists.");
      }
    });
  }

  /** Callback passed to app-workflow-sidebar so context is saved before navigation */
  getPayrollContext = () => ({
    month: this.EmployeeForm.get('fk_monthId')?.value,
    year: this.EmployeeForm.get('fk_yearId')?.value,
    costCentre: this.EmployeeForm.get('fk_costcentreid')?.value
  });

  public get employees(): FormArray {
    return this.EmployeeForm.get('employees') as FormArray;
  }


  onPaidDaysBlur(control: AbstractControl, index: number) {
    const group = control as FormGroup;

    const paid = parseFloat(group.get('paiddays')?.value);
    const total = parseFloat(group.get('totdays')?.value);

    if (isNaN(paid)) return;

    const validPaid = Math.min(paid, total);
    const lwp = total - validPaid;

    group.get('paiddays')?.setValue(validPaid.toFixed(2));
    group.get('lwp')?.setValue(lwp < 0 ? 0 : lwp.toFixed(2));
  }



  buildEmployeeRows(data: any[]) {
    this.employees.clear();

    data.forEach((emp, index) => {
      const group = this.fb.group({
        totdays: [{ value: emp.totdays, disabled: true }],
        paiddays: [
          emp.paiddays,
          [Validators.min(0), Validators.max(emp.totdays)] // <-- max paiddays = totdays
        ],
        lwp: [emp.lwp],
        incentiveDays: [emp.incentiveDays],
        otHrs: [emp.otHrs]
      });

      //Dynamic LWP Calculation when paiddays changes
      group.get('paiddays')?.valueChanges.subscribe((event) => {
        let paidDays = group.get('paiddays')?.value;
        const totalDays = emp.totdays ?? 0;

        if (paidDays > totalDays) {
          group.get('paiddays')?.setValue(totalDays);
          event?.preventDefault();

        }


      });




      this.employees.push(group);
    });
  }



  getMonthlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getMonthlist(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Month = res.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        } else {
          this.toastrService.error("Failed to load month list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching leave list:", err);
        this.toastrService.error("Error fetching month list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  //get year list 
  getYearList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call

    this.Service.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Year = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error("Failed to load HOD list.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastrService.error("Error fetching level list.");

      }
    });
  }


  getContractorList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call

    this.Service.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Contractor = [
            { name: 'Select All', value: '__select_all__' },
            ...res.data.slice(1).map((con: any) => ({
              name: con.name,
              value: con.value
            }))
          ];
        } else {
          this.toastrService.error("Failed to load HOD list.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastrService.error("Error fetching level list.");

      }
    });
  }

  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);
    //this.getEmployees(); // Refresh list with new filters
  }


  // Fetch Perquisite Details
  getList() {
    this.ngxUILoaderService.start();

    const formValues = { ...this.EmployeeForm.value };
    if (Array.isArray(formValues.fk_costcentreid)) {
      formValues.fk_costcentreid = formValues.fk_costcentreid.join(',');
    }


    this.Service.get_AttendanceAdjustment(formValues, this.pageIndex - 1, this.pageSize, this.pageIndex1 - 1, this.pageSize1).subscribe({
      next: (res) => {
        if (res.isSuccess) { // Ensure `res` is not undefined or null
          console.log('Data retrieved successfully:',
            res.data);
          this.list = res.data.attendanceAdjustmentMst;
          this.list1 = res.data.processedMst;
          this.totalCount1 = res.totalCount;
          this.totalCount2 = res.data.attendanceAdjustmentMstCount;
          this.buildEmployeeRows(this.list); // <--- Build form rows here


        } else {
          console.error('Failed to retrieve data:', res.message);
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }

    });
  }

  onPageChange(event: number) {
    this.pageIndex = event;
    this.getList();

  }
  onPageChange1(event: number) {
    this.pageIndex1 = event;
    this.getList();

  }

  filteredData() {
    if (!this.searchText) {
      return this.list1;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.list1.filter(res =>
      res.empcode?.toLowerCase().includes(searchTextLower) ||
      res.empname?.toLowerCase().includes(searchTextLower),


    );
  }
  onSave() {
    if (this.EmployeeForm.invalid) {
      this.toastrService.error("Form is invalid. Please check all fields.");
      return;
    }

    const formData = this.EmployeeForm.value;

    const attendanceData = formData.employees.map((emp: any, index: number) => {
      const base = this.list[index]; // Reference original data for non-form fields

      return {
        pk_attenid: base.pk_attenid,
        totdays: emp.totdays ?? 0,
        present: base.present ?? 0,  // <-- Added as per your payload
        sl: base.sl ?? 0,
        lwp: emp.lwp ?? 0,
        nh: base.nh ?? 0,
        incentiveDays: emp.incentiveDays ?? 0,
        doubleNH: base.doubleNH ?? 0,
        woff: base.woff ?? 0,
        otHrs: emp.otHrs ?? 0,
        presentBeforeIncrement: base.presentBeforeIncrement ?? 0,
        presentAfterIncrement: base.presentAfterIncrement ?? 0,
        paiddays: emp.paiddays ?? 0,
        spaDays: base.spaDays ?? 0,
        it: base.it ?? 0,
        csurCharge: base.csurCharge ?? 0,
        eCessCharge: base.eCessCharge ?? 0
      };
    });

    const requestBody = { attendanceDetail: attendanceData };

    this.ngxUILoaderService.start();

    this.Service.update_Attendance(requestBody).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success("Attendance updated successfully.");
        } else {
          this.toastrService.error("Failed to update attendance.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Update error:", err);
        this.toastrService.error("An error occurred during update.");
        this.ngxUILoaderService.stop();
      }
    });
  }



  OnVeiw() {
    this.submitted = true;
    if (this.EmployeeForm.invalid) {
      this.showError = true;
      return;
    }



    this.showError = false;
    this.getList(); // Fetch list using combined filters
  }

  toggleEmployeeList() {
    this.showEmployeeList = true; // Show Employee List
  }

  onContractorChange() {
    let selectedValues = this.EmployeeForm.controls['fk_costcentreid'].value || [];
    if (!Array.isArray(selectedValues)) {
      selectedValues = [selectedValues];
    }

    if (selectedValues.includes('__select_all__')) {
       if (this.isAllContractorsSelected()) {
          this.selectedContractors = [];
       } else {
          const realValues = this.Contractor
             .filter(c => c.value !== '__select_all__')
             .map(c => c.value);
          this.selectedContractors = realValues as string[];
       }
       this.EmployeeForm.controls['fk_costcentreid'].setValue(this.selectedContractors);
    } else {
       this.selectedContractors = selectedValues;
    }
  }

  isAllContractorsSelected(): boolean {
    const realContractors = this.Contractor.filter(item => item.value !== '__select_all__');
    return (
      this.selectedContractors.length === realContractors.length &&
      realContractors.every(c => this.selectedContractors.includes(c.value as string))
    );
  }

  getContractorDisplayText(): string {
    const realContractors = this.Contractor.filter(c => c.value !== '__select_all__');
    const selectedRealContractors = this.selectedContractors.filter(value => value !== '__select_all__');

    if (
      selectedRealContractors.length === realContractors.length &&
      realContractors.every(c => selectedRealContractors.includes(c.value as string))
    ) {
      return "All Selected";
    } else if (this.selectedContractors.length === 1) {
      return this.Contractor.find(item => item.value === this.selectedContractors[0])?.name || "--Select --";
    } else if (this.selectedContractors.length > 1) {
      const firstSelected = this.Contractor.find(item => item.value === this.selectedContractors[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select --";
    } else {
      return "--Select --";
    }
  }

  clearContractors() {
    this.selectedContractors = [];
    this.EmployeeForm.controls['fk_costcentreid'].setValue([]);
  }

  saveContext(): void {
    this.workflowNav.savePayrollContext(
      this.EmployeeForm.get('fk_monthId')?.value,
      this.EmployeeForm.get('fk_yearId')?.value,
      this.EmployeeForm.get('fk_costcentreid')?.value
    );
  }

  goToMonthlyAttendance(): void {
    this.saveContext();
    this.router.navigate([this.workflowNav.ROUTES.MONTHLY_ATTENDANCE]);
  }

  goToArrearProcess(): void {
    this.saveContext();
    this.router.navigate([this.workflowNav.ROUTES.ARREAR_PROCESS]);
  }

  goToAutoSalaryProcess(): void {
    this.saveContext();
    this.router.navigate([this.workflowNav.ROUTES.AUTO_SALARY_PROCESS]);
  }

  goToAttendanceReport(): void {
    this.saveContext();
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Attendance Adjustment');
  }

  goToLeaveReport(): void {
    this.saveContext();
    this.workflowNav.navigateToReport('leave', this.router.url, 'Attendance Adjustment');
  }

}



