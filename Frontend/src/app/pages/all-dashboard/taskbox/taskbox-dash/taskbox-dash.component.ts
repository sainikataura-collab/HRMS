import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-taskbox-dash',
  standalone: true,
  imports: [NgSelectComponent,RouterLink,FormsModule,ReactiveFormsModule],
  templateUrl: './taskbox-dash.component.html',
  styleUrl: './taskbox-dash.component.scss'
})
export class TaskboxDashComponent {
 
  
     form!: FormGroup;
    months: any[] = [];
    years: any[] = [];
    dashboardSummary: any = {};
  
  
    activeUserList: string[] = [];
  inactiveUserList: string[] = [];
  
    constructor(
      private toastrService: ToastrService,
      private httpService: MonthlyRentDetailService,  // For month/year list
      private payrollService: PayrollService,         // For Userdash() API
      private Loader: NgxUiLoaderService,
      private fb: FormBuilder
    ) {}
  
    ngOnInit(): void {
   
  
      this.form = this.fb.group({
        month: [null],
        year: [null]
      });
  
      this.loadDropdowns();
    }
  
    // ✅ Load dropdowns for Month & Year
    loadDropdowns(): void {
      forkJoin([
        this.httpService.getCommanList('Month'),
        this.httpService.getCommanList('Year')
      ]).subscribe({
        next: ([monthRes, yearRes]) => {
          // Assuming API returns fields like { name, value }
          this.months = monthRes.data.slice(1);
          this.years = yearRes.data.slice(1);
  
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
  
          const monthMatch = this.months.find((m: any) => +m.value === currentMonth);
          const yearMatch = this.years.find((y: any) => +y.value === currentYear);
  
          if (monthMatch && yearMatch) {
            this.form.patchValue({
              month: monthMatch.value,
              year: yearMatch.value
            });
            this.loadDashboard(monthMatch.value, yearMatch.value);
          }
        },
        error: () => {
          this.toastrService.error('Failed to load month/year data');
        }
      });
    }
  
   // Load Dashboard data
    loadDashboard(month: number, year: number): void {
      this.Loader.start();
  
      this.payrollService.Taskboxdash(month, year).subscribe({
        next: (res) => {
          this.Loader.stop();
          this.dashboardSummary = res.data || res;
         
        },
        error: (err) => {
          this.Loader.stop();
          this.toastrService.error('Failed to load dashboard data');
          console.error(err);
             this.dashboardSummary = {};
        this.activeUserList = [];
        this.inactiveUserList = [];
        
        }
      });
    }
  
   
    // Triggered when either dropdown changes
    onSelectionChange(): void {
      const { month, year } = this.form.value;
      if (month && year) {
        this.loadDashboard(month, year);
      }
    }
}
