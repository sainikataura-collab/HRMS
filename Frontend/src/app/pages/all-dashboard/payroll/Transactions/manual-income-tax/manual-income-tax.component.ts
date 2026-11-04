import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ManualIncomeTaxService } from '../../services/manual-income-tax.service';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';
import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-manual-income-tax',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectComponent,
    CommonSearchComponent,
    WorkflowSidebarComponent,
  ],
  templateUrl: './manual-income-tax.component.html',
  styleUrl: './manual-income-tax.component.scss'
})
export class ManualIncomeTaxComponent {
  ManualTaxForm!: FormGroup;
  submitted = false;
  showEmployeeList = false;
  showError = false;
  id!: number;
  Isedit = false;
  Month: { name: string; value: string }[] = [];
  Year: { name: string; value: string }[] = [];
  list: any[] = [];
  searchText: string = '';

  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private ManualIncomeTaxService: ManualIncomeTaxService,
    private cdr: ChangeDetectorRef,
    public workflowNav: WorkflowNavigationService
  ) {}

  ngOnInit() {
    this.ManualTaxForm = this.fb.group({
      officeType: [''],
      fk_monthId: [null, [Validators.required]],
      fk_yearId: [null, [Validators.required]],
      personalMobileNo: [''],
      officialMobileNo: [false],
      empCode: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      empStatus: [''],
      employees: this.fb.array([])
    });

    this.ngxUILoaderService.start();
    forkJoin([
      this.ManualIncomeTaxService.getMonthlist('Month'),
      this.ManualIncomeTaxService.getYear('Year')
    ]).subscribe({
      next: ([monthRes, yearRes]) => {
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
        this.ngxUILoaderService.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        this.workflowNav.applyContextIfFromWorkflow(this.ManualTaxForm, this.Month, this.Year);
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Failed to load dropdown lists.');
      }
    });
  }

  getPayrollContext = () => ({
    month: this.ManualTaxForm.get('fk_monthId')?.value,
    year: this.ManualTaxForm.get('fk_yearId')?.value,
    costCentre: null
  });

  get employees(): FormArray {
    return this.ManualTaxForm.get('employees') as FormArray;
  }

  patchEmployeeForm(data: any[]) {
    this.employees.clear(); // Clear existing controls
    data.forEach(emp => {
      this.employees.push(this.fb.group({
        pk_empid: [emp.pk_empid || 0],
        pk_salid: [emp.pk_salid || ''],
        empcode: [emp.empcode || ''],
        manualempcode: [emp.manualempcode || ''],
        empname: [emp.empname || ''],
        location: [emp.location || ''], // Map fk_locid or location
        department:[emp.department || ''], // Map fk_deptid or department
        it: [emp.it || 0],
        csurCharge: [emp.csurCharge || 0],
        eCessCharge: [emp.eCessCharge || 0],
        totdays: [emp.totdays || 0],
        paiddays: [emp.paiddays || 0],
        lwp: [emp.lwp || 0],
        incentiveDays: [emp.incentiveDays || 0],
        otHrs: [emp.otHrs || 0]
      }));
    });
    console.log('FormArray:', this.employees.value); // Debug
    this.cdr.detectChanges(); // Trigger change detection
  }
  
  getMonthlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.ManualIncomeTaxService.getMonthlist(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Month = res.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        } else {
          this.toastrService.error('Failed to load month list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching month list:', err);
        this.toastrService.error('Error fetching month list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  getYearList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.ManualIncomeTaxService.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Year = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error('Failed to load year list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching year list:', err);
        this.toastrService.error('Error fetching year list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  handleFilters(filters: any) {
    this.ManualTaxForm.patchValue(filters);
  }

  getList() {
    this.ngxUILoaderService.start();
    const formValues = this.ManualTaxForm.value;
    this.ManualIncomeTaxService.get_ManualIncomeTaxList(formValues).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data?.length) {
          console.log('API Response:', res.data); // Debug
          this.list = res.data;
          this.patchEmployeeForm(this.list);
          this.showEmployeeList = true; // Show the employee list table
        } else {
          this.list = [];
          this.employees.clear();
          this.showEmployeeList = false;
          this.toastrService.error(res.message || 'No data found.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.toastrService.error('An error occurred while fetching data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  filteredData() {
    if (!this.searchText) {
      return this.employees.controls;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.employees.controls.filter((ctrl: any) =>
      ctrl.get('empcode')?.value.toLowerCase().includes(searchTextLower) ||
      ctrl.get('empname')?.value.toLowerCase().includes(searchTextLower)
    );
  }
  OnVeiw() {
    this.submitted = true;
    if (this.ManualTaxForm.invalid) {
      this.showError = true;
      return;
    }
    this.showError = false;
    this.getList();
  }

  toggleEmployeeList() {
    this.showEmployeeList = true;
  }

  resetForm(): void {
    this.ManualTaxForm.reset();
    this.submitted = false;
    this.employees.clear();
  }

  onSubmit() {
    if (this.ManualTaxForm.invalid) {
      this.toastrService.error('Please fill all required fields.');
      return;
    }
  debugger
    const formValues = this.ManualTaxForm.value;
  
    const payload = formValues.employees.map((emp: any) => ({
      pk_empid: emp.pk_empid,
      empcode: emp.empcode,
      manualempcode: emp.manualempcode,
      empname: emp.empname,
      fk_locid: emp.fk_locid,
      fk_deptid: emp.fk_deptid,
      fk_desgid: emp.fk_desgid,
      fk_natureid: emp.fk_natureid,
      fk_cityid: emp.fk_cityid,
      location: emp.location,
      department: emp.department,
      designation: emp.designation,
      nature: emp.nature,
      cityname: emp.cityname,
      doj: emp.doj,
      pk_salid: emp.pk_salid,
      it: emp.it,
      csurCharge: emp.csurCharge,
      eCessCharge: emp.eCessCharge,
      otherSCharge: emp.otherSCharge || 0
    }));
  
    this.ngxUILoaderService.start();
  
    this.ManualIncomeTaxService.updateManualIncomeTax(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('Data saved successfully.');
          this.getList();
        } else {
          this.toastrService.error(res.message || 'Failed to save data.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error saving data:', err);
        this.toastrService.error('An error occurred while saving data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  goToAutoSalaryProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.AUTO_SALARY_PROCESS]);
  }

  goToArrearProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.ARREAR_PROCESS]);
  }

  goToMonthlyAttendance(): void {
    this.router.navigate([this.workflowNav.ROUTES.MONTHLY_ATTENDANCE]);
  }

  goToSalaryLock(): void {
    this.router.navigate([this.workflowNav.ROUTES.SALARY_LOCK]);
  }

  goToSalaryReport(): void {
    this.workflowNav.navigateToReport('salary', this.router.url, 'Manual Income Tax');
  }

  goToAttendanceReport(): void {
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Manual Income Tax');
  }

  goToLeaveReport(): void {
    this.workflowNav.navigateToReport('leave', this.router.url, 'Manual Income Tax');
  }
    
}

