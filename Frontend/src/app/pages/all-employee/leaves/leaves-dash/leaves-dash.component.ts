import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MonthlyRentDetailService } from '../../../all-dashboard/payroll/services/monthly-rent-detail.service';
import { forkJoin } from 'rxjs';
import { LeavereqService } from '../Service/leavereq.service';
import { request } from 'http';

@Component({
  selector: 'app-leaves-dash',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './leaves-dash.component.html',
  styleUrls: ['./leaves-dash.component.scss']
})
export class LeavesDashComponent implements OnInit {

  filterForm!: FormGroup;
  months: any[] = [];
  years: any[] = [];
  submitted = false;

  // Leave balance (summary)
  leavetakenList: any[] = [];

  // Holidays
  leaveSummary: any[] = [];

  // Leave trend counts
  pendingCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;
  totalLeaveRequests: number = 0;

  // Fixed leave types
  leaveAL: number = 0;
  leaveCL: number = 0;
  leaveSL: number = 0;
  leaveEL: number = 0;

   MonthlypendingCount: number = 0;
  MonthlyapprovedCount: number = 0;
  MonthlyrejectedCount: number = 0;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpService: MonthlyRentDetailService,
    private leaveReqService: LeavereqService,
    private route: ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    console.log("this.route.snapshot",this.route.snapshot);
    //  form initialize
    this.filterForm = this.fb.group({
      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],
    });

    // month/year API parallel call
    forkJoin([
      this.httpService.getCommanList('Month'),
      this.httpService.getCommanList('Year')
    ]).subscribe({
      next: ([monthRes, yearRes]) => {
        // month list
        this.months = monthRes.data?.slice(1) ?? [];

        // year list
        this.years = yearRes.data?.slice(1) ?? [];

        // ✅ current month/year (string me convert)
        const currentMonth = (new Date().getMonth() + 1).toString();
        const currentYear = new Date().getFullYear().toString();

        // ✅ patch form
        this.filterForm.patchValue({
          FkMonthId: currentMonth,
          FkYearId: currentYear
        });

        console.log("Patched Values 👉", this.filterForm.value);

        // ✅ initial dashboard call (number me bhejna)
        this.getLeaveDashboard(Number(currentMonth), Number(currentYear));

        // ✅ filter change listener
        this.filterForm.valueChanges.subscribe(val => {
          if (val.FkMonthId && val.FkYearId) {
            this.getLeaveDashboard(Number(val.FkMonthId), Number(val.FkYearId));
          }
        });
      },
      error: () => {
        this.toastr.error('Failed to load month/year data');
      }
    });
  }

  goToLeaveList(status: string,isMonthYearAllowed:boolean=true) {

  const month = this.filterForm.get('FkMonthId')?.value;
  const year = this.filterForm.get('FkYearId')?.value;

  const queryParams = {
        type: 'leaves',
        status: status,
        month: month || '',
        year: year || ''
      };

      if(!isMonthYearAllowed){
        delete queryParams['month'];
        delete queryParams['year'];
      }

  this.router.navigate(
    ['/dash/leaves/leavesdashboard/leavereqlist'],
    {
      queryParams: queryParams
    }
  );
}

  // ✅ API call for dashboard
  getLeaveDashboard(month: number, year: number): void {
    this.loader.start();

    this.leaveReqService.LeaveDash(month, year).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          // ✅ Holidays
          this.leaveSummary = res.data.leaveSummary ?? [];

          // ✅ Trend
          const trend = res.data.leaveTrend?.length ? res.data.leaveTrend[0] : null;
          const Monthly = res.data.monthly?.length ? res.data.monthly[0] : null;
          if (trend) {
            this.pendingCount = trend.PendingCount ?? 0;
            this.approvedCount = trend.ApprovedCount ?? 0;
            this.rejectedCount = trend.RejectedCount ?? 0;
            this.totalLeaveRequests =
              this.pendingCount + this.approvedCount + this.rejectedCount;
          }
           if (Monthly) {
            this.MonthlypendingCount = Monthly.MonthlyPendingCount ?? 0;
            this.MonthlyapprovedCount = Monthly.MonthlyApprovedCount ?? 0;
            this.MonthlyrejectedCount = Monthly.MonthlyRejectedCount ?? 0;
            // this.totalLeaveRequests =
            //   // this.pendingCount + this.approvedCount + this.rejectedCount;
          }
          
          else {
            this.pendingCount = this.approvedCount = this.rejectedCount = this.totalLeaveRequests = 0;
          }

          // ✅ Leave Balance (from elclal)
          this.leavetakenList = res.data.elclal ?? [];

console.log(this.leavetakenList);

          this.leaveAL = this.leavetakenList.find(x => x.leavetype === 'AL')?.totalleave ?? 0;
          this.leaveCL = this.leavetakenList.find(x => x.leavetype === 'CL')?.totalleave ?? 0;
          this.leaveSL = this.leavetakenList.find(x => x.leavetype === 'SL')?.totalleave ?? 0;
          this.leaveEL = this.leavetakenList.find(x => x.leavetype === 'EL')?.totalleave ?? 0;

        } else {
          this.toastr.error(res.message, 'Error');
          this.resetData();
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to retrieve leave dashboard', 'Error');
        this.resetData();
      },
    });
  }

  // ✅ Reset method
  resetData(): void {
    this.leaveSummary = [];
    this.leavetakenList = [];
    this.pendingCount = this.approvedCount = this.rejectedCount = this.totalLeaveRequests = 0;
    this.leaveAL = this.leaveCL = this.leaveSL = this.leaveEL = 0;
  }
}