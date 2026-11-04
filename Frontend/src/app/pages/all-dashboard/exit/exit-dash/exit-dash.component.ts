import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';

import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { ExitFormAutorityService } from '../Service/exit-form-autority.service';

@Component({
  selector: 'app-exit-dash',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './exit-dash.component.html',
  styleUrl: './exit-dash.component.scss'
})
export class ExitDashComponent implements OnInit {

  exitForm!: FormGroup;

  months: any[] = [];
  years: any[] = [];

  dashboardData: any = {};

  kpiCards: any[] = [];
  processOverview: any[] = [];
  recentExitList: any[] = [];
  latestTimeline: any[] = [];
  attentionList: any[] = [];
  exitReasonSummary: any[] = [];

  totalExit = 0;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private commonService: MonthlyRentDetailService,
    private exitService: ExitFormAutorityService
  ) { }

  ngOnInit(): void {

    const userId = localStorage.getItem('fk_UserID') || 'GU-1';

    this.exitForm = this.fb.group({
      month: [null],
      year: [null],
      userid: [userId]
    });

    this.loadDropdown();

    this.exitForm.valueChanges.subscribe(res => {

      if (res.month && res.year) {
        this.loadDashboard(res.month, res.year);
      }

    });

  }

  loadDropdown() {

    forkJoin([
      this.commonService.getCommanList('Month'),
      this.commonService.getCommanList('Year')
    ]).subscribe({

      next: ([monthRes, yearRes]) => {

        monthRes.data = monthRes.data.slice(1);
        this.months = monthRes.data;

        yearRes.data = yearRes.data.slice(1);
        this.years = yearRes.data;

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const month = this.months.find((x: any) => +x.value === currentMonth);
        const year = this.years.find((x: any) => +x.value === currentYear);

        if (month && year) {

          this.exitForm.patchValue({
            month: month.value,
            year: year.value
          });

        }

      },

      error: () => {

        this.toastr.error('Unable to load Month/Year.');

      }

    });

  }

  loadDashboard(month: string, year: string) {

    const payload = {
      month: month,
      year: year
    };

    this.loader.start();

    this.exitService.GetExitDashboard(payload).subscribe({

      next: (res: any) => {

        this.dashboardData = res.data || {};

        this.totalExit = res.data?.totalExit ?? 0;

        this.processOverview = res.data?.processOverview || [];

        this.recentExitList = res.data?.recentExitList || [];

        this.latestTimeline = res.data?.latestTimeline || [];

        this.attentionList = res.data?.attentionList || [];

        this.exitReasonSummary = res.data?.exitReasonSummary || [];

        this.loader.stop();

      },

      error: () => {

        this.loader.stop();

        this.toastr.error('Unable to load dashboard.');

      }

    });

  }

  getValue(key: string): any {

    return this.dashboardData?.[key] ?? 0;

  }

  getStageCount(stageName: string): number {
    if (!this.processOverview) return 0;
    const stage = this.processOverview.find(x => x.StageName === stageName);
    return stage ? stage.EmployeeCount : 0;
  }

  getStagePercent(stageName: string): number {
    if (!this.totalExit) return 0;
    return (this.getStageCount(stageName) / this.totalExit) * 100;
  }

  getInProgressCount(): number {
    return this.getValue('inProgress');
  }

  getInProgressPercent(): number {
    if (!this.totalExit) return 0;
    return (this.getInProgressCount() / this.totalExit) * 100;
  }

}