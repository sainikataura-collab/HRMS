

// }
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';
import { MonthlyRentDetailService } from '../../../all-dashboard/payroll/services/monthly-rent-detail.service';
import { CompensationService } from '../Service/compensation.service';
import { SalaryDashboardService } from '../Service/salary-dashboard.service';


@Component({
  selector: 'app-reimbursement-dash',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './reimbursement-dash.component.html',
  styleUrls: ['./reimbursement-dash.component.scss']
})
export class ReimbursementDashComponent implements OnInit {




  salaryForm!: FormGroup;
  months: any[] = [];
  years: any[] = [];


  submitted = false;
  monthId: number = 0;
  yearId: number = 0;
  salaryList: any[] = [];

  salaryOverview: any = {};
  annualTrend: any = {};
  totalCount:number=0;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpService: MonthlyRentDetailService,
    private salaryService: SalaryDashboardService,
     public compensationService:CompensationService

  ) { }

  ngOnInit(): void {
    this.salaryForm = this.fb.group({

      FkMonthId: [null, Validators.required],
      FkYearId: [null, Validators.required],

    });




    // forkJoin([
    //   this.httpService.getCommanList('Month'),
    //   this.httpService.getCommanList('Year')
    // ]).subscribe({
    //   next: ([monthRes, yearRes]) => {
    //     monthRes.data = monthRes.data.slice(1);
    //     this.months = monthRes.data;
    //     yearRes.data = yearRes.data.slice(1);
    //     this.years = yearRes.data;
    //   },
    //   error: () => {
    //     this.toastr.error('Failed to load month/year data');
    //   }
    // });


    // Subscribe to changes in month/year
  


    forkJoin([
      this.httpService.getCommanList('Month'),
      this.httpService.getCommanList('Year')
    ]).subscribe({
      next: ([monthRes, yearRes]) => {
        monthRes.data = monthRes.data.slice(1);
        this.months = monthRes.data;
        yearRes.data = yearRes.data.slice(1);
        this.years = yearRes.data;

         const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();

    // Find matching values from API data
    const monthMatch = this.months.find(m => +m.value === currentMonth);
    const yearMatch = this.years.find(y => +y.value === currentYear);

    if (monthMatch && yearMatch) {
      this.salaryForm.patchValue({
        FkMonthId: monthMatch.value,
        FkYearId: yearMatch.value
      });
        this.getsalaryData(monthMatch.value, yearMatch.value);
    }
      },
      error: () => {
        this.toastr.error('Failed to load month/year data');
      }
    });



  
  
  
    this.salaryForm.valueChanges.subscribe(values => {
      const { FkMonthId, FkYearId } = values;
      if (FkMonthId && FkYearId) {
        this.getsalaryData(FkMonthId, FkYearId);
        this.getrebateDocdata();
      }
    });
  }


   getrebateDocdata(): void {
    
    this.compensationService.get_RebateDocList().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          
          this.totalCount=Number(res.totalCount);
          // console.log(this.totalCount);
        } else {

        }
      },
      error: (error) => {
        
        this.toastr.error('Failed to retrieve', 'Error');
      }
    });
  }


  getsalaryData(monthId: number, yearId: number) {
    this.loader.start();

    this.salaryService.viewSalaryDashboardDetails(monthId, yearId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.salaryList = res?.data || [];
          

          this.salaryOverview = res.data.salaryDistributionOverview || {};
       
          this.annualTrend = res.data.annualCompensationTrend || {};
          
          this.loader.stop();
        }
        else {
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

    if (this.salaryForm.invalid) {
      return;
    }

    const { FkMonthId, FkYearId } = this.salaryForm.value;
    this.getsalaryData(FkMonthId, FkYearId);
  }


}