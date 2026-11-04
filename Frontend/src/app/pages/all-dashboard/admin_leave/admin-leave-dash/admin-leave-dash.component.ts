import {
  Component, AfterViewInit, OnDestroy, OnInit,
  PLATFORM_ID, Inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-admin-leave-dash',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule,ReactiveFormsModule,NgSelectComponent],
  templateUrl: './admin-leave-dash.component.html',
  styleUrl: './admin-leave-dash.component.scss'
})
export class AdminLeaveDashComponent implements OnInit, AfterViewInit, OnDestroy {
        form!: FormGroup;
        months: any[] = [];
        years: any[] = [];
         dashboardSummary: any = {};
          LeaveList: any[] = [];

  // ── Stat cards ────────────────────────────────────────────────────
  //totalApplied = 120;
  //approved     = 75;
  // pending      = 30;
  // rejected     = 15;

   get totalEmployee() {
  return this.dashboardSummary?.TotalEmployee || 0;
}
 get totalApplied() {
  return this.dashboardSummary?.TotalAppliedleave || 0;
}

get approved() {
  return this.dashboardSummary?.Approved || 0;
}

get pending() {
  return this.dashboardSummary?.Pending || 0;
}

get rejected() {
  return this.dashboardSummary?.Rejected || 0;
}

  // ── UI state ──────────────────────────────────────────────────────
leaveTypeMap: any = {
  CL: 'Casual Leave',
  EL: 'Earned Leave',
  SL:'Sick Leave',
  'Comp Off':'Comp Off',
  'Paternity Leave':'Maternity Leave'
};

statusTypeMap: any = {
  Approved: 'Approved',
 Rejected : 'Rejected',
 Pending: 'Pending'
};
  selectedMonth   = '';
  selectedYear    = '';
  searchText      = '';
  filterLeaveType = '';
  filterStatus    = '';
  showAll         = false;
  activeTab: 'requests' | 'balance' | 'upcoming' = 'requests';

  private chart!: Chart;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,private fb: FormBuilder, private toastrService: ToastrService,private httpService: MonthlyRentDetailService,private payrollService: PayrollService,private Loader: NgxUiLoaderService) {}

  // ─────────────────────────────────────────────────────────────────
  // Data
  // ─────────────────────────────────────────────────────────────────
  leaveRequests: any[] = [];
  leaveBalances: any[]  = [];
  upcomingLeaves: any[] = [];

  // leaveTypeSummary = [
  //   { type: 'Casual Leave',    approved: 30, pending: 10, rejected: 5  },
  //   { type: 'Sick Leave',      approved: 25, pending: 8,  rejected: 2  },
  //   { type: 'Earned Leave',    approved: 15, pending: 10, rejected: 3  },
  //   { type: 'Maternity Leave', approved: 5,  pending: 2,  rejected: 5  },
  // ];

  // ─────────────────────────────────────────────────────────────────
  ngOnInit(): void { 
     this.form = this.fb.group({
        month: [null],
        year: [null]
      });
     
    this.loadDropdowns();

    //this.loadData(); 
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 300);
    }
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
              this.loadAttendanceData(monthMatch.value, yearMatch.value);
            }
          },
          error: () => {
            this.toastrService.error('Failed to load month/year data');
          }
        });
      }

loadAttendanceData(month: number, year: number): void {
      this.Loader.start();
  
      this.payrollService.GetleaveDashboard(month, year).subscribe({
        next: (res) => {
          this.Loader.stop();
            this.dashboardSummary = res.data?.summary || {};
             // Map API response fields to match your table's expected fields
          this.leaveRequests = (res.data?.leave || []).map((emp: any) => ({
            name: emp.empname,
            empCode: emp.empcode,
            department: emp.description,
            leaveType: this.leaveTypeMap[emp.leavetype] || emp.leavetype,
            fromDate: emp.fromdate,
            toDate: emp.todate,
            days: emp.totdays,
            reason: emp.remarks,
           // status: emp.status
             status: this.statusTypeMap[emp.status] || emp.status,

          }));
   

    this.leaveBalances =this.leaveBalances = (res.data?.leavebalance || []).map((emp: any) => ({
            name: emp.empname,
            empCode: emp.empcode,
            department: emp.department,
               leavetype: emp.leavetype,
           currentyearleaves:emp.currentyearleaves,
           leaveavailed:emp.leaveavailed,
           balanceleave:emp.balanceleave
         
             

          }));

    this.upcomingLeaves = this.leaveRequests = (res.data?.leave || []).map((emp: any) => ({
            name: emp.empname,
            empCode: emp.empcode,
            department: emp.description,
            leaveType: this.leaveTypeMap[emp.leavetype] || emp.leavetype,
            fromDate: emp.fromdate,
            toDate: emp.todate,
            days: emp.totdays,
            reason: emp.remarks,
         
             status: this.statusTypeMap[emp.status] || emp.status,

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

  
  // ─────────────────────────────────────────────────────────────────
  // Filtered getters
  // ─────────────────────────────────────────────────────────────────

  get filteredRequests(): any[] {
    const s = this.searchText.toLowerCase();
    const list = this.leaveRequests.filter(r =>
      (r.name.toLowerCase().includes(s) || r.empCode.toLowerCase().includes(s) ||
       r.department.toLowerCase().includes(s) || r.leaveType.toLowerCase().includes(s)) &&
      (this.filterLeaveType ? r.leaveType === this.filterLeaveType : true) &&
      (this.filterStatus    ? r.status    === this.filterStatus    : true)
    );
    return this.showAll ? list : list.slice(0, 4);
  }

  get filteredBalance(): any[] {
    const s = this.searchText.toLowerCase();
    const list = this.leaveBalances.filter(b =>
      b.name.toLowerCase().includes(s) ||
      b.empCode.toLowerCase().includes(s) ||
      b.department.toLowerCase().includes(s)
    );
    return this.showAll ? list : list.slice(0, 4);
  }

  get filteredUpcoming(): any[] {
    const s = this.searchText.toLowerCase();
    const list = this.upcomingLeaves.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.empCode.toLowerCase().includes(s) ||
      u.department.toLowerCase().includes(s) ||
      u.leaveType.toLowerCase().includes(s)
    );
    return this.showAll ? list : list.slice(0, 4);
  }

  toggleViewAll(): void { this.showAll = !this.showAll; }

  // ─────────────────────────────────────────────────────────────────
  // Action: Approve / Reject from table
  // ─────────────────────────────────────────────────────────────────
  // updateStatus(req: any, newStatus: 'Approved' | 'Rejected'): void {
  //   req.status = newStatus;
  //   // TODO: call API → this.leaveService.updateStatus(req.id, newStatus).subscribe(...)
  //   this.approved = this.leaveRequests.filter(r => r.status === 'Approved').length;
  //   this.rejected = this.leaveRequests.filter(r => r.status === 'Rejected').length;
  //   this.pending  = this.leaveRequests.filter(r => r.status === 'Pending').length;
  //   this.updateChart();
  // }

  // ─────────────────────────────────────────────────────────────────
  // Helper: badge CSS classes
  // ─────────────────────────────────────────────────────────────────
  leaveTypeBadge(type: string): object {
    return {
      'bg-info-subtle text-info'          : type === 'Casual Leave',
      'bg-purple-subtle text-purple'      : type === 'Sick Leave',
      'bg-warning-subtle text-warning'    : type === 'Earned Leave',
      'bg-secondary-subtle text-secondary': type === 'Maternity Leave',
       'bg-secondary-subtle text-primary': type === 'Comp Off',
    };
  }

  statusBadge(status: string): object {
    return {
      'bg-success-subtle text-success': status === 'Approved',
      'bg-warning-subtle text-warning': status === 'Pending',
      'bg-danger-subtle text-danger'  : status === 'Rejected',
    };
  }

  // Avatar colour cycling based on first char
  avatarColor(name: string): string {
    const colors = [
      'avatar-blue', 'avatar-green', 'avatar-orange',
      'avatar-purple', 'avatar-teal', 'avatar-red'
    ];
    return colors[name.charCodeAt(0) % colors.length];
  }

  // ─────────────────────────────────────────────────────────────────
  // Donut chart
  // ─────────────────────────────────────────────────────────────────
  initChart(): void {
    const canvas = document.getElementById('leaveChartDiv') as HTMLCanvasElement;
    if (!canvas) return;
    if (this.chart) this.chart.destroy();

    const data  = [this.approved, this.pending, this.rejected];
    const total = data.reduce((s, v) => s + v, 0);
    const THRESHOLD = 0.04;

    const datalabelsPlugin = {
      id: 'customDatalabels',
      afterDatasetDraw(chart: any) {
        const { ctx, data: chartData } = chart;
        const meta   = chart.getDatasetMeta(0);
        const values: number[] = chartData.datasets[0].data;
        const sum    = values.reduce((a: number, b: number) => a + b, 0);
        meta.data.forEach((arc: any, idx: number) => {
          const pct = sum > 0 ? values[idx] / sum : 0;
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
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
          data,
          backgroundColor: ['#54ca68', '#ffa446', '#e35b5d'],
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

  updateChart(): void {
    if (!this.chart) return;
    this.chart.data.datasets[0].data = [this.approved, this.pending, this.rejected];
    this.chart.update();
  }


   onSelectionChange(): void {
      const { month, year } = this.form.value;
      if (month && year) {
        this.loadAttendanceData(month, year);
      }
    }
  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}