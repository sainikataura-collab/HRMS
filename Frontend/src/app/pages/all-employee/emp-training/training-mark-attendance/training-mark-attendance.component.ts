import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { TrainingCalendarService } from '../../../all-dashboard/training/services/training-calendar.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-training-mark-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgxPaginationModule,],
  templateUrl: './training-mark-attendance.component.html',
  styleUrl: './training-mark-attendance.component.scss'
})
export class TrainingMarkAttendanceComponent {


  
  isProcessing = false;
  trainingList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 5;
  totalItems: number = 0;

  constructor(private toastr: ToastrService, private router: Router, 
              private trainingService: TrainingCalendarService, private encryptionService:EncryptionService) {}

  ngOnInit(): void {

    this.getTrainingForAttandance();


  }

  getTrainingForAttandance(): void {
    this.trainingService.getforemployee().subscribe(res => {
      if (res.isSuccess) {
        this.trainingList = res.data;
        this.totalItems = res.totalCount;
      } else {
        console.error('Failed to retrieve data:', res.message);

      }
    });
  }

  checkAndMarkAttendance(pk_calendarId: number) {
    this.isProcessing = true;

    this.trainingService.CheckAttndforemployee(pk_calendarId).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // If the message says "Attendance not marked yet" → call markAttendance
          if (res.message.includes('not marked')) {
            this.markAttendance(pk_calendarId);
          } else {
            // Already marked
            this.toastr.warning(res.message);
            this.isProcessing = false;
          }
        } else {
          this.toastr.error('Failed to check attendance: ' + res.message);
          this.isProcessing = false;
        }
      },
      error: err => {
        this.toastr.error('Error checking attendance.');
        console.error(err);
        this.isProcessing = false;
      }
    });
  }

  markAttendance(calendarId: number) {
    const payload = {
      pk_planningId: calendarId,
      attendanceStatus:'P'

    };

    this.trainingService.Attendance_TrainingCalendar(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          // Update list in memory instead of reload
          const training = this.trainingList.find(t => t.calendarId === calendarId);
          if (training) training.attendance = 'P';

          this.toastr.success(res.message);
          this.getTrainingForAttandance();
         
        } else {
          this.toastr.warning(res.message);
        }
      },
      error: err => {
        this.toastr.error('Error marking attendance.');
        console.error(err);
      }
    });
  }

  filteredData() {
    if (!this.searchText) return this.trainingList;
    const search = this.searchText.toLowerCase();
    return this.trainingList.filter(t =>
      t.programName.toLowerCase().includes(search) ||
      t.location.toLowerCase().includes(search)
    );
  }


  onPageChange(event: number) {
    this.pageIndex = event;
  }


// viewAttendance(item: any) {
//   // Encrypt the calendarId
//   const encryptedCalendarId = this.encryptionService.encryptText(item.pk_calendarId.toString());

//   this.router.navigate(
//     ['/dash/emp-recruitment/emp-recruitmentdashboard/Mark_Attendance_View', encryptedCalendarId],
//     {
//       queryParams: {
//          calendarId: item.pk_calendarId,   // pass calendarId

//        // empId: item.fk_empId  // optional
//       }
//     }
//   );
// }


viewAttendance(item: any) {


const encryptedCalendarId = this.encryptionService.encryptText(item.pk_planningId.toString());



  this.router.navigate(
    ['/dash/emp-training/emp-trainingdashboard/Mark_Attendance_View'],
    {
      queryParams: {
        pk_planningId: encryptedCalendarId,   // pass calendarId
        empId: item.fk_empId              // optional if you want employee-specific
      }
    }
  );
}


  exportToExcel() {
    if (!this.trainingList || this.trainingList.length === 0) {
      this.toastr.warning('No data available to export');
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.trainingList);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TrainingAttendance');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.setAttribute('download', 'Training_Attendance.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}