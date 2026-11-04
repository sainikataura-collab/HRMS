import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { PayrollService } from '../services/payroll.service';
import { ManualPunchBio } from '../services/manual-puch-bio.service';
import { MonthlyRentDetailService } from '../services/monthly-rent-detail.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-payroll-dash',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent],
  templateUrl: './payroll-dash.component.html',
  styleUrl: './payroll-dash.component.scss'
})
export class PayrollDashComponent {
  payrollform!: FormGroup
  months:any= [];
  monthId: string = '';
  yearId:string='';
  years :any= [];
  tableHeaders: string[] = [];
  totalEmployee: string = '';
  dashboardSummary: any = {};
  cyear : number = 0;
  constructor(
    private toastrService: ToastrService,
    private commanservice: ManualPunchBio,
    private httpservice: PayrollService,
    private Loader: NgxUiLoaderService,
    private fb: FormBuilder,
     private httpService: MonthlyRentDetailService,) {}

  ngOnInit() {
    const userId = localStorage.getItem('fk_UserID') || 'GU-1';
    this.cyear = new Date().getFullYear();
   
    this.payrollform = this.fb.group({
      month: [null],
      year: [null],
      userid: [userId]
    });

   

    forkJoin([
      this.httpService.getCommanList('Month'),
      this.httpService.getCommanList('Year')
    ]).subscribe({
      next: ([monthRes, yearRes]) => {
        monthRes.data = monthRes.data.slice(1);
        this.months = monthRes.data;
    
        yearRes.data = yearRes.data.slice(1);
        this.years = yearRes.data;
    
        // Get current month/year
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const currentYear = new Date().getFullYear();
    
        // Find matching values from API data
        const monthMatch = this.months.find((m: { value: string | number; }) => +m.value === currentMonth);
        const yearMatch = this.years.find((y: { value: string | number; }) => +y.value === currentYear);
    
        // Set default selection if matches found
        if (monthMatch && yearMatch) {
          this.payrollform.patchValue({
            month: monthMatch.value,
            year: yearMatch.value
          });
    
          // Optional: Load attendance data immediately
          // this.loadDashboard(monthMatch.value, yearMatch.value);
        }
      },
      error: () => {
        this.toastrService.error('Failed to load month/year data');
      }
    });
    
    
    
        // Subscribe to changes in month/year
        this.payrollform.valueChanges.subscribe(values => {
          const { month, year } = values;
          if (month && year) {
            this.loadDashboard(month, year);
          }
        });
    
    
    
   
  }

  


  loadDashboard(months:string,years:string) {
    const payload = {
      
      month:months,
      year:years
      // year:this.yearId
    };
    
    this.Loader.start();
    this.httpservice.Get_PayrollDashboardList(payload).subscribe({
      next: (res) => {
        this.dashboardSummary = res.data;
        this.tableHeaders = Object.keys(res.data[0] ?? {});
        this.Loader.stop();
      },
      error: (err) => {
        this.Loader.stop();
        this.toastrService.error('Failed to load dashboard');
      }
    });
  }

  getLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  // Method to get the value dynamically
  getValue(key: string): any {
    return this.dashboardSummary[0]?.[key] || '0'; // Default to '0' if not available
  }

 

}