import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { HrChatService } from '../HRservices/hr-chat.service';
import { ToastrService } from 'ngx-toastr';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { PayrollService } from '../../payroll/services/payroll.service';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { HRchattingSystemService } from '../HRservices/hrchatting-system.service';


@Component({
  selector: 'app-hr-dash',
  standalone: true,
  imports: [CommonModule, RouterLink,NgSelectComponent,FormsModule,ReactiveFormsModule],
  templateUrl: './hr-dash.component.html',
  styleUrls: ['./hr-dash.component.scss']
})
export class HrDashComponent {
  private root!: am5.Root;
  private series!: am5percent.PieSeries;
private legend!: am5.Legend;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private ngxUILoaderService: NgxUiLoaderService,
    private router: Router,
    private service: HrChatService,
    private toastr: ToastrService,
       private httpService: MonthlyRentDetailService,  // For month/year list
    private payrollService: PayrollService,
     private fb: FormBuilder,
     private services:HRchattingSystemService
     
    
  ) {}
months: any[] = [];
  years: any[] = [];

  todayBirthdays: any[] = [];
  upcomingBirthdays: any[] = [];
  events: any[] = [];
    RecentActivity: any[] = [];
  anniversaries: any[] = [];
  form!: FormGroup;
 dashboardSummary: any = {};
 unreadCount: number = 0;
private unreadCountInterval: any;
 ngOnInit() {
    this.ngxUILoaderService.start();
    setTimeout(() => this.ngxUILoaderService.stop(), 1000);
 
    const userId = localStorage.getItem('fk_UserID') || 'GU-1';

    this.form = this.fb.group({
      month: [null],
      year: [null],
      userid: [userId]
    });

    this.loadDropdowns();
    this.RecentActivities();
    this.loadUnreadCount();
  this.startUnreadCountPolling();
  }

  // 💬 Open chatbot with employee ID and type
  openChatbot(empId: string, type: 'today' | 'upcoming' | 'anniversary' | 'event') {
    console.log('Opening chatbot for:', empId, type);
    this.router.navigate(['dash/hr/hrdashboard/hr-chatboat'], {
      queryParams: { 
        empId: empId,
        type: type 
      }
    });
  }

  loadTodayBirthdays(): void {
    this.service.GetTodayBirthday().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.todayBirthdays = res.data.map((emp: any) => ({
            pk_empid: emp.pk_empid,
            name: emp.EmpName,
            dept: emp.Department || 'Unknown Department',
            img: 'assets/Image/profile_images.png',
            type: 'birthday',
            date: 'Today'
          }));
        } else {
          this.todayBirthdays = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load today birthdays');
      }
    });
  }

  loadUpcomingBirthdays(): void {
    this.service.GetUpcomingBirthday().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.upcomingBirthdays = res.data.map((emp: any) => ({
            pk_empid: emp.pk_empid || emp.EmpId,
            name: emp.EmpName,
            dept: emp.Department || 'Unknown Department',
            img: 'assets/Image/profile_images.png',
            date: this.formatDate(emp.ThisYearBirthday),
            type: 'birthday'
          }));
        } else {
          this.upcomingBirthdays = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load upcoming birthdays');
      }
    });
  }

  loadEvents(): void {
    this.service.GetEvents().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.events = res.data.map((emp: any) => ({
            pk_empid: emp.eventId || emp.pk_eventId,
            name: emp.eventName,
            date: emp.eventDateDisplay || 'Unknown',
            eventVenue: emp.eventVenue || 'Unknown',
            img: 'assets/Image/event.jpeg',
            type: 'event',
            dept: emp.eventVenue
          }));
        } else {
          this.events = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load events');
      }
    });
  }

  loadAniversary(): void {
    this.service.GetAniversary().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.anniversaries = res.data.map((emp: any) => ({
            pk_empid: emp.pk_empid || emp.EmpId,
            name: emp.empname,
            dept: emp.Department || 'Unknown Department',
            years: emp.AnniversaryLabel || 'NA',
            AnniversaryDisplay: emp.AnniversaryDisplay || 'NA',
            img: 'assets/Image/profile_images.png',
            type: 'anniversary',
            date: emp.AnniversaryDisplay
          }));
        } else {
          this.anniversaries = [];
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load anniversary');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

   RecentActivities(): void {
    this.service.GetActivity().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.RecentActivity = res.data.map((emp: any) => ({
              DisplayText: emp.DisplayText,
              SentAt: emp.SentAt,
              MessageText:emp.MessageText
          
          }));
        } else {
          this.RecentActivity = [];
        }    
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load anniversary');
      }
    });
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => f());
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.checkScrollLists(), 0);
    this.browserOnly(() => {
      let chartDiv = document.getElementById('chartdiv');
      if (!chartDiv) return;

      this.root = am5.Root.new('chartdiv');
      this.root.setThemes([am5themes_Animated.new(this.root)]);

      let chart = this.root.container.children.push(
        am5percent.PieChart.new(this.root, {
          layout: this.root.verticalLayout,
          innerRadius: am5.percent(50)
        })
      );

      this.series = chart.series.push(
        am5percent.PieSeries.new(this.root, {
          valueField: 'value',
          categoryField: 'category',
          innerRadius: am5.percent(60),
          endAngle: 360
        })
  //     this.series = chart.series.push(
  // am5percent.PieSeries.new(this.root, {
  //   valueField: 'value',
  //   categoryField: 'category',
  //   innerRadius: am5.percent(60),
  //   endAngle: 360
  // })
);
    

      this.series.set(
        'colors',
        am5.ColorSet.new(this.root, {
          colors: [
            am5.color(0x3080e8),
            am5.color(0xe35b5d),
            am5.color(0x54ca68),
            am5.color(0xffa446)
          ]
        })
      );

      this.series.slices.template.setAll({
        strokeWidth: 5,
        stroke: am5.color(0xffffff),
        cornerRadius: 50,
        shadowOpacity: 0.3,
        shadowOffsetX: 5,
        shadowOffsetY: 5
      });

   
    setTimeout(() => {
      const  NewJoining= this.dashboardSummary.NewJoining;
     const leftemployee = this.dashboardSummary.leftemployee;
      this.series.data.setAll([
        { category: 'Join', value:NewJoining},
        { category: 'Left', value:leftemployee}
        // { category: 'Pending', value:Resignation }
      ]);

      this.series.labels.template.setAll({
        text: "{category} {value}",
        fontSize: 13,
        fontWeight: "500",
        fill: am5.color(0x2b2e41)
      });

      // this.legend = chart.children.push(
      //   am5.Legend.new(this.root, {
      //     centerX: am5.percent(50),
      //     x: am5.percent(50),
      //     marginTop: 20,
      //     marginBottom: 20
      //   })
      // );

      this.legend.data.setAll(this.series.dataItems);
      this.series.appear(1200, 100);
    }, 500); // 🕒 short delay to ensure API data arrives
  });
  }

  ngOnDestroy() {
      if (this.unreadCountInterval) clearInterval(this.unreadCountInterval);
    this.browserOnly(() => {
      if (this.root) this.root.dispose();
    });
  }

 

  checkScrollLists() {
    document.querySelectorAll('.scrollable-list').forEach((list: any) => {
      const items = list.querySelectorAll('li').length;
      if (items > 5) list.classList.add('scroll-enabled');
      else list.classList.remove('scroll-enabled');
    });

    this.loadTodayBirthdays();
    this.loadUpcomingBirthdays();
    this.loadEvents();
    this.loadAniversary();
    
  }

  // load dropdwon
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
          this.toastr.error('Failed to load month/year data');
        }
      });
    }
     loadDashboard(month: number, year: number): void {
    this.ngxUILoaderService.start();

    this.payrollService.HRdash(month, year).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        this.dashboardSummary = res.data || res;
       
       if (this.series) {
        const d = this.dashboardSummary || {};
        const NewJoining = Number(d.NewJoining || 0);
        const leftemployee = Number(d.leftemployee || 0);
        // const Pending = Number(d.PendingLetters || 0);

        // ✅ Clear old data
       
        // ✅ Set new month/year data
        this.series.data.setAll([
          { category: 'Join', value: NewJoining },
          { category: 'Left', value: leftemployee },
          // { category: 'Pending', value: Pending }
        ]);
  // 🔹 Recalculate chart
  // (this.series as any).markDirty();
  // (this.series.root as any)._markDirty();

  // 🔹 Rebind legend data
  // if (this.legend) {
  //   this.legend.data.setAll(this.series.dataItems);
  // }

  // 🔹 Optional smooth animation
  this.series.appear(500, 100);

  
      }
        // this.toastrService.success('Dashboard loaded successfully');
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        this.toastr.error('Failed to load dashboard data');
        console.error(err);
           this.dashboardSummary = {};
    
      }
    });
  }

 
  // ✅ Triggered when either dropdown changes
  onSelectionChange(): void {
    const { month, year } = this.form.value;
    if (month && year) {
      this.loadDashboard(month, year);
    }
  }
  loadUnreadCount(): void {
  this.services.getUnreadCount().subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.unreadCount = res.data || 0;
      }
    }
  });
}

private startUnreadCountPolling(): void {
  this.unreadCountInterval = setInterval(() => {
    this.loadUnreadCount();
  }, 10000);
}

// ngOnDestroy() {
//   if (this.unreadCountInterval) {
//     clearInterval(this.unreadCountInterval);
//   }
// }

}