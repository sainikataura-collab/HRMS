import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router, RouterLink } from '@angular/router';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmpEventService } from '../emp-event.service';
import { HRchattingSystemService } from '../../../all-dashboard/hr/HRservices/hrchatting-system.service';

@Component({
  selector: 'app-event-dash',
  standalone: true,
  imports: [CommonModule, RouterLink,NgSelectComponent,ReactiveFormsModule],
  templateUrl: './event-dash.component.html',
  styleUrl: './event-dash.component.scss'
})
export class EventDashComponent {
dashboard: any = {};
  todayBirthdays: any[] = [];
  upcomingBirthdays: any[] = [];
  upcomingEvents: any[] = [];
  Anniversaries: any[] = [];
  RecentActivity: any[] = [];
  
  //currentYear = new Date().getFullYear();
  unreadCount: number = 0;
private unreadCountInterval: any;


  Month: { name: string, value: string }[] = [];
  Year: { name: string, value: string }[] = [];
   filterForm!: FormGroup;

  constructor(private eventDashboard:EmpEventService, private Loader: NgxUiLoaderService, 
    private router:Router,private Service: ProgramService,private toastr:ToastrService,private fb:FormBuilder,private services:HRchattingSystemService) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      fk_monthId: [null],
      fk_yearId: [null]
    });
       this.loadDashboard();
    this.loadRecentActivity()
    this.getMonthList('Month');
    this.getyearList('Year');
 this.loadUnreadCount();
  this.startUnreadCountPolling();

      // Watch for dropdown changes
    this.filterForm.valueChanges.subscribe((val) => {
      this.loadDashboard(val.fk_yearId, val.fk_monthId);
    });

  }


  loadDashboard(year?: number | null, month?: number | null): void {
    this.Loader.start();
    this.eventDashboard.getDashboardData(year, month).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.Loader.stop();
          this.dashboard = res.data.dashboard;
          this.todayBirthdays = res.data.todayBirthdays || [];
          this.upcomingBirthdays = res.data.upcomingBirthdays || [];
          this.upcomingEvents = res.data.upcomingEvents || [];
          this.Anniversaries = res.data.anniversaries || [];

        
        }
      },
      error: (err) => {
        this.Loader.stop();
        console.error('Error loading dashboard', err);
      }
    });
  }

 loadRecentActivity(): void {
  this.Loader.start();
  this.eventDashboard.getRecentActivity().subscribe({
    next: (res: any) => {
      this.Loader.stop();

      if (res.isSuccess) {
        this.RecentActivity = res.data ?? [];
      }
    },
    error: (err) => {
      this.Loader.stop();
      console.error('Error loading dashboard', err);
    }
  });
}






  openChatbot(pk_empid: string,type: 'today' | 'upcoming' | 'anniversary' | 'event')  {
  this.router.navigate(['dash/event/eventdashboard/emp-chatboat'], {
    queryParams: {
       empId: pk_empid,
       type: type 
     }
  });
}




    getyearList(fieldName: string) {

    this.Loader.start(); // Start loader before API call
  
    this.Service.getCommonList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.Year = res.data.map((fk_yearid: any) => ({
                    name: fk_yearid.name,
                    value: fk_yearid.value
                }));
            } else {
                this.toastr.error("Failed to load HOD list.");
            }
            this.Loader.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastr.error("Error fetching level list.");
            
        }
    });
  }


  getMonthList(fieldName: string) {
    this.Loader.start(); // Start loader before API call

     this.Service.getCommonList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
              //  this.Location = res.data.slice(1).map((fk_locid: any) => ({
              this.Month = res.data.map((fk_monthid: any) => ({
                    name: fk_monthid.name,
                    value: fk_monthid.value
                }));
            } else {
                this.toastr.error("Failed to load HOD list.");
            }
            this.Loader.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastr.error("Error fetching level list.");
            
        }
    });
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

ngOnDestroy() {
  if (this.unreadCountInterval) {
    clearInterval(this.unreadCountInterval);
  }
}

}