import { Component, AfterViewInit, OnDestroy, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-employee-management-dash',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule,ReactiveFormsModule,NgSelectComponent],
  templateUrl: './employee-management-dash.component.html',
  styleUrl: './employee-management-dash.component.scss'
})
export class EmployeeManagementDashComponent implements OnInit, AfterViewInit, OnDestroy {

 form!: FormGroup;
    months: any[] = [];
    years: any[] = [];
      dashboardSummary: any = {};
  leftEmployees: any;
  newJoinings: any;
 Employees: any[] = [];
  get totalEmployee() {
  return this.dashboardSummary?.TotalEmployee || 0;
}

get newJoiner() {
  return this.dashboardSummary?.NewJoining || 0;
}

get leftJoiner() {
  return this.dashboardSummary?.leftemployee || 0;
}

  searchText = '';
  showAll    = false;

  // 👥 Recent Joiners
  recentJoiners: any[] = [];

  private chart!: Chart;
  private avatarColors = [
    'avatar-blue', 'avatar-green', 'avatar-orange',
    'avatar-purple', 'avatar-teal', 'avatar-red'
  ];


  constructor(@Inject(PLATFORM_ID) private platformId: Object,   private httpService: MonthlyRentDetailService,  // For month/year list
      private payrollService: PayrollService, private toastrService: ToastrService,private Loader: NgxUiLoaderService,   private fb: FormBuilder) {}

  ngOnInit(): void {
     this.form = this.fb.group({
        month: [null],
        year: [null]
      });
     this.loadDropdowns();
    
  }

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

  ngAfterViewInit(): void { 
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 300);
    }
  }

   //  Load dropdowns for Month & Year
     
 loadDashboard(month: number, year: number): void {
      this.Loader.start();
  
      this.payrollService.EmployeeManangementdash(month, year).subscribe({
        next: (res) => {
          this.Loader.stop();
            this.dashboardSummary = res.data?.summary || {};
             // Map API response fields to match your table's expected fields
      this.Employees = (res.data?.employees || []).map((emp: { empname: any; empcode: any; Department: any; Designation: any; dateofjoining: any; leftdate: any; employeeleftstatus: string; }) => ({
        name: emp.empname,
        empCode: emp.empcode,
        department: emp.Department,
        designation: emp.Designation,
        joiningDate: emp.dateofjoining,
        leftDate: emp.leftdate,
        status: emp.employeeleftstatus === 'Y' ? 'Left' : 'Active'
      }));
           
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.initChart();
        }
      }, 100);
    },
        error: (err) => {
          this.Loader.stop();
          this.toastrService.error('Failed to load dashboard data');
          console.error(err);
             this.dashboardSummary = {};
       
        
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

  
  //  Filtered + paginated — 
  get filteredJoiners(): any[] {
    const s = this.searchText.toLowerCase();
    const filtered = this.Employees.filter((emp: { name: string; empCode: string; department: string; designation: string; }) =>
      emp.name.toLowerCase().includes(s)        ||
      emp.empCode.toLowerCase().includes(s)     ||
      emp.department.toLowerCase().includes(s)  ||
      emp.designation.toLowerCase().includes(s)
    );
    return this.showAll ? filtered : filtered.slice(0, 3);
  }

  toggleViewAll(): void {
    this.showAll = !this.showAll;
  }

  getDaysAgo(joiningDate: Date | string): number {
    return Math.floor((new Date().getTime() - new Date(joiningDate).getTime()) / 86400000);
  }

  getAvatarColor(index: number): string {
    return this.avatarColors[index % this.avatarColors.length];
  }


  // Chart.js Donut — unchanged dont change 

  initChart(): void {
    const canvas = document.getElementById('empChartdiv') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const data  = [this.totalEmployee, this.newJoiner, this.leftJoiner];
    const total = data.reduce((s, v) => s + v, 0);
    const THRESHOLD = 0.05;

    const datalabelsPlugin = {
      id: 'customDatalabels',
      afterDatasetDraw(chart: any) {
        const { ctx, data: chartData } = chart;
        const meta   = chart.getDatasetMeta(0);
        const values: number[] = chartData.datasets[0].data;
        const sum    = values.reduce((a: number, b: number) => a + b, 0);
        meta.data.forEach((arc: any, i: number) => {
          const pct = sum > 0 ? values[i] / sum : 0;
          if (pct < THRESHOLD) return;
          const { x, y } = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle    = '#ffffff';
          ctx.font         = 'bold 11px sans-serif';
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor  = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur   = 3;
          ctx.fillText(`${Math.round(pct * 100)}%`, x, y);
          ctx.restore();
        });
      }
    };

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Total Employees', 'New Joiner', 'Left Joiner'],
        datasets: [{
          data,
          backgroundColor: ['#3080e8', '#54ca68', '#ffa446'],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              }
            }
          }
        },
        animation: { animateRotate: true, duration: 1000 }
      },
      plugins: [datalabelsPlugin]
    });
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}