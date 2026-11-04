

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MonthlyRentDetailService } from '../../../all-dashboard/payroll/services/monthly-rent-detail.service';
import { AttendanceService } from '../Services/attendance.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-attendance-dash',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectComponent, RouterModule],
  templateUrl: './attendance-dash.component.html',
  styleUrls: ['./attendance-dash.component.scss']
})
export class AttendanceDashComponent {
  filteredAttendanceList: any[] = [];
  topFiveData: any[] = [];
  EmpAttendance!: FormGroup;
  submitted = false;
  showError = false;
  FirstCOunt = 0;
  months: any[] = [];
  years: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;

  attendanceData = {
    present: 0,
    absent: 0,
    leave: 0,
    missedPunch: 0,
    lateComing: 0,
    weekOff: 0,
    holiday: 0,
    od: 0,
    totalWorkingHrs: '00:00',
    totalOTHrs: '00:00',
    ODCount: 0,
    ShortLeave: 0,
    CDO: 0,
    YearlyODCount: 0,
    YearlyShortLeave: 0,
    YearlyCDO: 0

  };

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpService: MonthlyRentDetailService,
    private httpAttendanceService: AttendanceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }



  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    this.EmpAttendance = this.fb.group({

      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
    });

    let isInitialLoad = true; // Flag to prevent double call

    forkJoin([
      this.httpService.getCommanList('Month'),
      this.httpService.getCommanList('Year')
    ]).subscribe({
      next: ([monthRes, yearRes]) => {
        monthRes.data = monthRes.data.slice(1);
        yearRes.data = yearRes.data.slice(1);
        this.months = monthRes.data;
        this.years = yearRes.data;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthMatch = this.months.find(m => +m.value === currentMonth);
        const yearMatch = this.years.find(y => +y.value === currentYear);

        if (monthMatch && yearMatch) {
          // Patch default values
          this.EmpAttendance.patchValue({
            FkMonthId: monthMatch.value,
            FkYearId: yearMatch.value
          });

          // Call API once on initial load
          this.getAttendanceData(monthMatch.value, yearMatch.value);
        }
      },
      error: () => this.toastr.error('Failed to load month/year data')
    });

    // Subscribe to changes
    this.EmpAttendance.valueChanges.subscribe(values => {
      const { FkMonthId, FkYearId } = values;

      // Skip API call on initial patchValue
      if (!FkMonthId || !FkYearId) return;

      if (!isInitialLoad) {
        this.getAttendanceData(FkMonthId, FkYearId);
      } else {
        // Initial load done, now future changes trigger API
        isInitialLoad = false;
      }
    });
  }


  getAttendanceData(monthId: number, yearId: number) {
    this.loader.start();

    this.httpAttendanceService.EMPAttendanceDash(monthId, yearId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const data = res.data;

          this.attendanceData = {
            present: data.summary.Present,
            absent: data.summary.Absent,
            leave: data.summary.Leave,
            missedPunch: data.summary['M Punch'],
            lateComing: data.summary.Late,
            weekOff: data.summary.WeekOff,
            holiday: data.summary.Holiday,
            od: data.summary.ODCount,
            totalWorkingHrs: data.summary.WrkHours,
            totalOTHrs: data.summary.OTHours,
            ODCount: data.summary.ODCount,
            ShortLeave: data.summary.ShortLeave,
            CDO: data.summary.CDO,
            YearlyCDO: data.summary.YearlyCDO,
            YearlyShortLeave: data.summary.YearlyShortLeave,
            YearlyODCount: data.summary.YearlyODCount

          };

          this.topFiveData = data.logs.map((log: any) => ({
            dated: log.dated ? new Date(log.dated).toLocaleDateString() : '',
            InTime: log.InTime,
            OutTime: log.OutTime,
            dayDescription: log.dayDescription
          }));

          this.loader.stop();
        } else {
          this.loader.stop();
          this.toastr.error(res.message || 'Failed to load attendance data');
        }
      },
      error: (err) => {
        console.error('Attendance fetch error:', err);
        this.loader.stop();
        this.toastr.error('Failed to load attendance data');
      }
    });
  }

  goshortList(isMonthYearAllowed: boolean = true) {

    const month = this.EmpAttendance.get('FkMonthId')?.value;
    const year = this.EmpAttendance.get('FkYearId')?.value;

    const queryParams = {
      type: 'attendance',
      // status: status,
      month: month || '',
      year: year || ''
    };

    if (!isMonthYearAllowed) {
      delete queryParams['month'];
      delete queryParams['year'];
    }

    this.router.navigate(
      ['/dash/leaves/leavesdashboard/shortLeaveList'],
      {
        queryParams: queryParams
      }
    );
  }

  goOdList(isMonthYearAllowed: boolean = true) {

    const month = this.EmpAttendance.get('FkMonthId')?.value;
    const year = this.EmpAttendance.get('FkYearId')?.value;

    const queryParams = {
      type: 'attendance',
      // status: status,
      month: month || '',
      year: year || ''
    };

    if (!isMonthYearAllowed) {
      delete queryParams['month'];
      delete queryParams['year'];
    }

    this.router.navigate(
      ['/dash/attendance/attendancedashboard/OD-request-list'],
      {
        queryParams: queryParams
      }
    );
  }

  goCDOList(isMonthYearAllowed: boolean = true) {

    const month = this.EmpAttendance.get('FkMonthId')?.value;
    const year = this.EmpAttendance.get('FkYearId')?.value;

    const queryParams = {
      type: 'attendance',
      month: month || '',
      year: year || ''
    };

    if (!isMonthYearAllowed) {
      delete queryParams['month'];
      delete queryParams['year'];
    }

    this.router.navigate(
      ['/dash/attendance/attendancedashboard/cdoRequest-list'],
      {
        queryParams: queryParams
      }
    );
  }



}
