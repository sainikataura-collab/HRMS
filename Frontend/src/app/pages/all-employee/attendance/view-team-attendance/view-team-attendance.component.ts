import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MonthlyRentDetailService } from '../../../all-dashboard/payroll/services/monthly-rent-detail.service';
import { forkJoin } from 'rxjs';


import { AttendanceService } from '../Services/attendance.service';




@Component({
  selector: 'app-view-team-attendance',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,],
  templateUrl: './view-team-attendance.component.html',
  styleUrl: './view-team-attendance.component.scss'
})
export class ViewTeamAttendanceComponent {
  filteredAttendanceList: any[] = []; 
  EmpAttendance!: FormGroup;
  submitted = false;
  showError = false;
  months: any[] = [];
  years: any[] = [];
  EmployeeNameList: any[] = [];

attendanceData = {
  present: 0,
  absent: 0,
  leave: 0,
  missedPunch: 0,
  lateComing: 0,
  weekOff: 0,
  holiday: 0,
  totalWorkingHrs: '00:00',
  totalOTHrs: '00:00'
};

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpService: MonthlyRentDetailService,
    private httpAttendanceService: AttendanceService
  ) {}

    ngOnInit(): void {
    this.EmpAttendance = this.fb.group({
      EmpId: [null, Validators.required],
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
    });
      
    forkJoin([
      this.httpService.getCommanList('Month'),
      this.httpService.getCommanList('Year'),
      this.httpAttendanceService.getEmployeeNameList() // Assuming this method exists to fetch employee names
    ]).subscribe({

      next: ([monthRes, yearRes ,employeList]) => {
          monthRes.data=monthRes.data.slice(1);
        this.months = monthRes.data;
           yearRes.data=yearRes.data.slice(1);
        this.years = yearRes.data;
        this.EmployeeNameList = employeList.data;
      },
      error: () => {
        this.toastr.error('Failed to load month/year data');
      }
    });

      // ✅ current month/year (string me convert)
      const currentMonth = (new Date().getMonth() + 1).toString();
      const currentYear = new Date().getFullYear().toString();
      
      // ✅ patch form
      this.EmpAttendance.patchValue({
        FkMonthId: currentMonth,
        FkYearId: currentYear
      });
     // Subscribe to changes in month/year
  this.EmpAttendance.valueChanges.subscribe(values => {
    const { FkMonthId, FkYearId ,EmpId} = values;
    if (FkMonthId && FkYearId && EmpId) {
      this.getAttendanceData(FkMonthId, FkYearId,EmpId );
    }
  });
    }
   
   


getAttendanceData(monthId: number, yearId: number ,empid:string) {
  this.loader.start();

  this.httpAttendanceService.viewTeamAttendanceDettails(monthId, yearId, empid).subscribe({
    next: (res) => {
      if(res.isSuccess) {

      this.filteredAttendanceList = res?.data || [];
       //this.calculateSummary();
this.attendanceData = {
        present: 0,
        absent: 0,
        leave: 0,
        missedPunch: 0,
        lateComing: 0,
        weekOff: 0,
        holiday: 0,
        totalWorkingHrs: '00:00',
        totalOTHrs: '00:00'
      };

      this.attendanceData.present = res?.dataObj.present;
      this.attendanceData.absent = res?.dataObj.absent;
      this.attendanceData.leave = res?.dataObj.leave;
      this.attendanceData.missedPunch = res?.dataObj.mPunch;
      this.attendanceData.lateComing = res?.dataObj.late;
      this.attendanceData.weekOff = res?.dataObj.weekOff;
      this.attendanceData.holiday = res?.dataObj.holiday;
      this.attendanceData.totalWorkingHrs = res?.dataObj.wrkHours;
      this.attendanceData.totalOTHrs = res?.dataObj.otHours;

      this.loader.stop();
      }
      else{
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

onView() {
  this.submitted = true;
  if (this.EmpAttendance.invalid) {
    this.showError = true;
    return;
  }

  const { FkMonthId, FkYearId , EmpId} = this.EmpAttendance.value;
  this.getAttendanceData(FkMonthId, FkYearId, EmpId);
}
calculateSummary() {

  this.attendanceData = {
    present: 0,
    absent: 0,
    leave: 0,
    missedPunch: 0,
    lateComing: 0,
    weekOff: 0,
    holiday: 0,
    totalWorkingHrs: '00:00',
    totalOTHrs: '00:00'
  };


  let totalWorkMins = 0;
  let totalOTMins = 0;

  this.filteredAttendanceList.forEach(row => {
    const status = (row.dayStatus || '').toUpperCase();

    switch (status) {
      case 'P': this.attendanceData.present++; break;
      case 'A': this.attendanceData.absent++; break;
      case 'HD': this.attendanceData.leave++; break;
      case 'MP': this.attendanceData.missedPunch++; break;
      case 'WO': this.attendanceData.weekOff++; break;
      case 'H': this.attendanceData.holiday++; break;
    }

    if (row.lateComing) this.attendanceData.lateComing++;

    // Work Hours
    if (row.workHour) {
      const [h, m] = row.workHour.split(':').map(Number);
      totalWorkMins += (h * 60 + m);
    }
    console.log('Work Hours:', row.workHour, 'Total Work Mins:', totalWorkMins);

    // OT Hours
    if (row.otHour) {
      const [h, m] = row.otHour.split(':').map(Number);
      totalOTMins += (h * 60 + m);
    }
  });

  this.attendanceData.totalWorkingHrs = this.convertMinutesToHHMM(totalWorkMins);
  this.attendanceData.totalOTHrs = this.convertMinutesToHHMM(totalOTMins);

}   

convertMinutesToHHMM(totalMins: number): string {
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}`;

}





  }