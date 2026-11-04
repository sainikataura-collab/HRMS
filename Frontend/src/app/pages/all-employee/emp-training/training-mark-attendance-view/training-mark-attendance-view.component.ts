import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TrainingCalendarService } from '../../../all-dashboard/training/services/training-calendar.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-training-mark-attendance-view',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './training-mark-attendance-view.component.html',
  styleUrl: './training-mark-attendance-view.component.scss'
})
export class TrainingMarkAttendanceViewComponent {
  // Static data as per your format
 searchText: string = '';
  showAll: boolean = false;
  data: any;   // will hold API data
  loading = true;
  error: string | null = null;

  constructor(
    private trainingService: TrainingCalendarService,
    private route: ActivatedRoute,
    private encryptionservice:EncryptionService
  ) { }

  ngOnInit(): void {
  // ✅ get calendarId from query params
  this.route.queryParams.subscribe(params => {


    const encryptedplanningId = params['pk_planningId'];  // matches what you passed

    const pk_planningId = Number(this.encryptionservice.decryptText(encryptedplanningId));

    if (pk_planningId) {
      this.trainingService.ViewAttndforemployee(pk_planningId).subscribe({
        next: (res) => {
          this.data = res.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load attendance data';
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.error = 'No Attendance provided';
      this.loading = false;
    }
  });
}


   

  

  // ✅ Attendance Summary Getters
get presentCount(): number {
  return this.data?.empAttendetails.filter((x: any) => x.attendanceStatus === 'P').length || 0;
}

get absentCount(): number {
  return this.data?.empAttendetails.filter((x: any) => x.attendanceStatus === 'A').length || 0;
}

get totalDays(): number {
  return this.data?.empAttendetails.length || 0;
}


  get attendancePercentage(): number {
    return this.totalDays > 0 ? (this.presentCount / this.totalDays) * 100 : 0;
  }

  // ✅ Helpers for Badge
  getStatusText(status: string): string {
    switch (status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'P': return 'bg-success';
      case 'A': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

get filteredAttendances() {
  if (!this.data?.empAttendetails) return [];

  const search = this.searchText.toLowerCase();

  // Filter based on searchText
  const filtered = this.data.empAttendetails.filter((record: any) =>
    // (record.empName || '')?.toLowerCase().includes(search) ||
    // (record.position || '')?.toLowerCase().includes(search) ||
    (record.attendanceDate ? new Date(record.attendanceDate).toLocaleDateString().includes(search) : false) ||
    (record.attendanceStatus ? this.getStatusText(record.attendanceStatus).toLowerCase().includes(search) : false)
  );

  // If showAll is false, show only first 3 records
  return this.showAll ? filtered : filtered.slice(0, 3);
}

toggleViewAll() {
  this.showAll = !this.showAll;
}

}