import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TrainingCalendarService } from '../../services/training-calendar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-traning-calendar-admin-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule],

  templateUrl: './traning-calendar-admin-list.component.html',
  styleUrl: './traning-calendar-admin-list.component.scss'
})
export class TraningCalendarAdminListComponent {
 filterForm: FormGroup;

  calendarData: any[] = [];
  filteredProgramData: any[] = [];

  // Pagination vars
  pageIndex = 1;
  pageSize = 5;
  totalItems = 0;

  constructor(private fb: FormBuilder,private Service:TrainingCalendarService,private router: Router) {
    // Build filter form
    this.filterForm = this.fb.group({
      searchText: [''],
      showUpcoming: [false],
      showCompleted: [false],
      showCancelled: [false],
      showAll: [true]
    });

    // Load static data
    this.loadStaticData();

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // loadStaticData() {
  //   this.programData = [
  //     {
  //       id: 1,
  //       programName: 'Leadership Skills',
  //       programCode: 'PRG001',
  //       subProgramName: 'Team Management',
  //       subProgramCode: 'SP001',
  //       reason: 'Improve leadership',
  //       priority: 'High',
  //       status: 'Scheduled',
  //       trainer: 'John Doe',
  //       mode: 'Online',
  //       location: 'Delhi',
  //       calendarStatus: 'S',
  //       calendarDateTime: new Date(),
  //       createdDate: new Date(),
  //       adminComment: 'Important training',
  //       calendarTrainer: 'John Doe',
  //       calendarMode: 'Online',
  //       calendarLocation: 'Delhi'
  //     },
  //     {
  //       id: 2,
  //       programName: 'Technical Skills',
  //       programCode: 'PRG002',
  //       subProgramName: 'Advanced C#',
  //       subProgramCode: 'SP002',
  //       reason: 'Enhance coding',
  //       priority: 'Medium',
  //       status: 'Upcoming',
  //       trainer: 'Jane Smith',
  //       mode: 'Offline',
  //       location: 'Mumbai',
  //       calendarStatus: 'S',
  //       calendarDateTime: new Date(new Date().setDate(new Date().getDate() + 5)),
  //       createdDate: new Date(),
  //       adminComment: '',
  //       calendarTrainer: 'Jane Smith',
  //       calendarMode: 'Offline',
  //       calendarLocation: 'Mumbai'
  //     },
  //     {
  //       id: 3,
  //       programName: 'Communication Workshop',
  //       programCode: 'PRG003',
  //       subProgramName: 'Effective Speaking',
  //       subProgramCode: 'SP003',
  //       reason: 'Improve soft skills',
  //       priority: 'Low',
  //       status: 'Completed',
  //       trainer: 'Rahul Verma',
  //       mode: 'Hybrid',
  //       location: 'Pune',
  //       calendarStatus: 'S',
  //       calendarDateTime: new Date(new Date().setDate(new Date().getDate() - 10)),
  //       createdDate: new Date(),
  //       adminComment: 'Well received',
  //       calendarTrainer: 'Rahul Verma',
  //       calendarMode: 'online',
  //       calendarLocation: 'Pune'
  //     }
  //   ];

  //   this.totalItems = this.programData.length;
  //   this.filteredProgramData = [...this.programData];
  // }

   // 🔹 Fetch List with Filters + Pagination
loadStaticData(): void {
      this.Service.getAdminCalendar_list().subscribe(res => {
        if (res.isSuccess) {
            this.calendarData = res.data;
            this.totalItems = res.totalCount;
        } else {
            console.error('Failed to retrieve data:', res.message);
        
        }
    });
}
  






  applyFilters() {
    let data = [...this.calendarData];
    const { searchText, showUpcoming, showCompleted, showCancelled, showAll } = this.filterForm.value;

    if (searchText) {
      data = data.filter(item =>
        item.programName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.subProgramName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.trainer.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (!showAll) {
      if (showUpcoming) {
        data = data.filter(item => item.status === 'Upcoming' || item.status === 'Scheduled');
      }
      if (showCompleted) {
        data = data.filter(item => item.status === 'Completed');
      }
      if (showCancelled) {
        data = data.filter(item => item.status === 'Cancelled');
      }
    }

    this.filteredProgramData = data;
    this.totalItems = data.length;
    this.pageIndex = 1;
  }

  // Actions
  viewDetails(item: any) {
    console.log('Viewing details', item);
  }

  // editItem(item: any) {
  //   console.log('Editing item', item);
  // }

  editItem(item: any) {
  // Prepare query params
  const queryParams = {
    pk_calendarId: item.pk_calendarId, // ya jo planning id ho
  };

  // Navigate to Admin_Training_Calendar page with query params
  this.router.navigate(['/dash/training/trainingdashboard/Admin_Training_Calendar'], { queryParams });
}

 
  deleteItem(item: any) {
    console.log('Deleting item', item);
  }

  exportToExcel() {
    console.log('Exporting to Excel...');
  }

  onPageChange(page: number) {
    this.pageIndex = page;
  }
}