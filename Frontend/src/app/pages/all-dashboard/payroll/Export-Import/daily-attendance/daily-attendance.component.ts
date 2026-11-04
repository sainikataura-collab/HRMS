import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormControl,FormGroup,ReactiveFormsModule, Validators} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { LeaveTransactionService } from '../../services/leave-transaction.service';
import { DailyAttendanceService } from '../../services/daily-attendance.service';

@Component({
  selector: 'app-daily-attendance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonSearchComponent
  ],
  templateUrl: './daily-attendance.component.html',
  styleUrl: './daily-attendance.component.scss'
})
export class DailyAttendanceComponent implements OnInit {

  attendanceForm!: FormGroup;

  submitted = false;
  showError = false;
  showAttendance = false;
  isViewLoading = false;

  months: any[] = [];
  years: any[] = [];


  selectedEmployee: any;

  selectedMonth = '';
  employees: { name: string; value: string }[] = [];

loadingEmployees = false;

initialEmployeeList: any[] = [];

searchTimer: any;

pageNo = 1;

pageSizes = 100;

currentSearch = '';

firstHalfDays: number[] = [];
secondHalfDays: number[] = [];

employeeFilters = {
  empCode: '',
  empCodeManual: '',
  empName: '',
  selectedDepartments: [],
  selectedDesignation: '',
  selectedLocations: [],
  selectedNature: '',
  selectedCity: '',
  sortBy: '',
  userId: '',
  empStatus: '',
  search: '',
  pageNo: 1,
  pageSizes: 100
};




  constructor(
    private fb: FormBuilder,
    private httpservice: MonthlyRentDetailService,
    private leaveTransactionService: LeaveTransactionService,
    private dailyAttendanceService: DailyAttendanceService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.initializeForm();

    this.loadDropdowns();

    this.getEmployees();

  }


initializeForm(): void {

  this.attendanceForm = this.fb.group({

    FkMonthId: [null, Validators.required],

    FkYearId: [null,Validators.required],

    client: [null],

    employee: [null],

    // Common Search Filters

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

    fk_costcentreid: [null]

    

  });


  for (let i = 1; i <= 31; i++) {

    this.attendanceForm.addControl(

      'A' + i,

      new FormControl('')

    );

  }

}


loadDropdowns(): void {

  this.loader.start();

  forkJoin([

    this.httpservice.getCommanList('Month'),

    this.httpservice.getCommanList('Year')

  ]).subscribe({

    next: ([monthRes, yearRes]) => {

      this.months = monthRes.data;

      this.years = yearRes.data;

      this.loader.stop();

    },

    error: () => {

      this.loader.stop();

      this.toastr.error('Failed to load dropdown data.');

    }

  });

}

getEmployees(): void {

  this.loadingEmployees = true;

  this.employeeFilters = {

    ...this.employeeFilters,

    search: this.currentSearch,

    pageNo: this.pageNo,

    pageSizes: this.pageSizes

  };

  this.leaveTransactionService.getEmpList(this.employeeFilters).subscribe({

    next: (res: any) => {

      if (res.isSuccess) {

        this.employees = res.data.map((emp: any) => ({

          name: emp.name,

          value: emp.value

        }));

        if (!this.currentSearch) {

          this.initialEmployeeList = [...this.employees];

        }

      }

      this.loadingEmployees = false;

    },

    error: () => {

      this.loadingEmployees = false;

      this.employees = [];

    }

  });

}


onEmployeeSearch(event: any) {

  const search =
    (event.term || '').trim().toLowerCase();

  clearTimeout(this.searchTimer);

  if (!search) {

    this.employees = [...this.initialEmployeeList];

    this.loadingEmployees = false;

    return;

  }

  const local =
    this.initialEmployeeList.filter(x =>
      x.name.toLowerCase().includes(search)
    );

  if (local.length > 0) {

    this.employees = local;

    this.loadingEmployees = false;

    return;

  }

  this.loadingEmployees = true;

  this.searchTimer = setTimeout(() => {

    this.currentSearch = search;

    this.pageNo = 1;

    this.getEmployees();

  }, 500);

}



onMonthOrYearChange(): void {

  this.firstHalfDays = [];
  this.secondHalfDays = [];

  // Always show 1–15
  for (let i = 1; i <= 15; i++) {
    this.firstHalfDays.push(i);
  }

  // Always show 16–31
  for (let i = 16; i <= 31; i++) {
    this.secondHalfDays.push(i);
  }

  // Agar employee selected hai to attendance reload kar do
  if (this.attendanceForm.value.employee) {
    this.getAttendance();
  }

  // const month = this.attendanceForm.get('FkMonthId')?.value;
  // const year = this.attendanceForm.get('FkYearId')?.value;

  // this.firstHalfDays = [];
  // this.secondHalfDays = [];

  // if (!month || !year) {
  //   return;
  // }

  // const totalDays = new Date(year, month, 0).getDate();

  // for (let i = 1; i <= Math.min(15, totalDays); i++) {
  //   this.firstHalfDays.push(i);
  // }

  // for (let i = 16; i <= totalDays; i++) {
  //   this.secondHalfDays.push(i);
  // }
}


handleFilters(filters: any): void {
  this.attendanceForm.patchValue(filters);
}


 onEmployeeSelect(): void {

  const month = this.attendanceForm.get('FkMonthId')?.value;
  const year = this.attendanceForm.get('FkYearId')?.value;
  const employeeId = this.attendanceForm.get('employee')?.value;
 
  if (!month || !year || !employeeId) {
    this.showAttendance = false;
    return;
  }

  const employee = this.employees.find(
    (x: { name: string; value: string }) => x.value === employeeId
  );

  this.selectedEmployee = {
    code: employee?.value ?? '',
    name: employee?.name ?? ''
  };

  const monthObj = this.months.find((x: any) => x.value == month);
  this.selectedMonth = monthObj?.name ?? '';

  this.onMonthOrYearChange();

  this.showAttendance = true;

  this.getAttendance();
}

getAttendance(): void {

  // const payload = {

  //   empId: this.attendanceForm.value.employee,

  //   monthId: Number(this.attendanceForm.value.FkMonthId),

  //   yearId: Number(this.attendanceForm.value.FkYearId),

  //   finId: this.attendanceForm.value.Fk_FinId

  // };

  const empId = this.attendanceForm.value.employee;

const monthId = Number(this.attendanceForm.value.FkMonthId);

const yearId = Number(this.attendanceForm.value.FkYearId);

  this.loader.start();

  this.dailyAttendanceService
    .getAttendance(empId,monthId,yearId)
    .subscribe({

      next: (res: any) => {

  this.loader.stop();

  if (res.isSuccess && res.data) {

    const attendance = res.data;

    for (let i = 1; i <= 31; i++) {

      this.attendanceForm
        .get('A' + i)
        ?.setValue(attendance['a' + i] ?? '');

    }

  } else {

    this.clearAttendance();

  }
      },

      error: () => {

        this.loader.stop();

        this.clearAttendance();

      }

    });

}

resetForm(): void {

  this.attendanceForm.reset();


  this.selectedEmployee = null;

  this.selectedMonth = '';

  this.showAttendance = false;

}

//====================================
// View Attendance
//====================================

onView(): void {

  this.submitted = true;

  const month =
    this.attendanceForm.get('FkMonthId')?.value;

  const year =
    this.attendanceForm.get('FkYearId')?.value;

  const employeeId =
    this.attendanceForm.get('employee')?.value;

  if (!month || !year || !employeeId) {

    this.toastr.warning(
      'Please select Month, Year and Employee.'
    );

    return;

  }

  this.isViewLoading = true;

  const employee =
  this.employees.find((x: any) => x.value === employeeId);

this.selectedEmployee = {

  code: employee?.value ?? '',

  name: employee?.name ?? ''

};

  const monthObj =
    this.months.find(x => x.value == month);

  this.selectedMonth =
    monthObj ? monthObj.name : '';

  this.showAttendance = true;

  this.isViewLoading = false;


}


saveAttendance(): void {

  const attendance: Record<string, any> = {};

  [...this.firstHalfDays, ...this.secondHalfDays].forEach((day: number) => {

    attendance['A' + day] =
      this.attendanceForm.get('A' + day)?.value ?? '';

  });
  // for month days
  const totalDays = 31;

 const payload: any = {
  employee: this.attendanceForm.value.employee,
  month: Number(this.attendanceForm.value.FkMonthId),
  year: Number(this.attendanceForm.value.FkYearId),
  MonthDays: 31
};

for (let i = 1; i <= 31; i++) {
  payload['A' + i] = this.attendanceForm.get('A' + i)?.value ?? '';
}

console.log(payload);

this.dailyAttendanceService
  .saveAttendance(payload)
  .subscribe({

    next: (res: any) => {

      this.loader.stop();

      if (res) {

        this.toastr.success(
          'Attendance Saved Successfully.'
        );

        this.getAttendance();

      }

    },

    error: () => {

      this.loader.stop();

      this.toastr.error(
        'Failed to Save Attendance.'
      );

    }

  });

}


clearAttendance(): void {

  [...this.firstHalfDays, ...this.secondHalfDays].forEach((day: number) => {

    this.attendanceForm.get('A' + day)?.setValue('');

  });

}


fillDemoAttendance(): void {

  [...this.firstHalfDays, ...this.secondHalfDays].forEach((day: number) => {

    this.attendanceForm.get('A' + day)?.setValue('P');

  });

}

get employeeCode(): string {

  return this.selectedEmployee?.code ?? '';

}

get employeeName(): string {

  return this.selectedEmployee?.name ?? '';

}

get selectedYear(): string {

  return this.attendanceForm.get('FkYearId')?.value ?? '';

}

}