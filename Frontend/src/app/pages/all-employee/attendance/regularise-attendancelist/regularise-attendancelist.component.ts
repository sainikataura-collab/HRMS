import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceService } from '../Services/attendance.service';



@Component({
  selector: 'app-regularise-attendancelist',
  standalone: true,
   imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './regularise-attendancelist.component.html',
  styleUrl: './regularise-attendancelist.component.scss'
})
export class RegulariseAttendancelistComponent {
 allData: any[] = [];
  searchText: string = '';

  constructor(
    private regularService: AttendanceService,
    private toastr: ToastrService
  ) {}
  

  ngOnInit(): void {
    this.getAllAttendanceRequests();
  }

  // getAllAttendanceRequests(): void {
  //   this.regularService.getAllRegulariseAttendance().subscribe({
  //     next: (res) => {
  //       if (res.isSuccess && res.data) {
  //         this.allData = res.data;
  //       } else {
  //         this.toastr.warning(res.message || 'No data found.');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       this.toastr.error('Failed to fetch attendance data.');
  //     }
  //   });
  // }

  
getAllAttendanceRequests(): void {
  this.regularService.getAllRegulariseAttendance().subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        // keep only Late Coming & Missed Punch
        this.allData = res.data.filter(
          (item: any) => item.description === 'Late Coming' || item.description === 'Missed Punch'
        );

        if (this.allData.length === 0) {
          this.toastr.warning('No Late Coming or Missed Punch records found.');
        }
      } else {
        this.toastr.warning(res.message || 'No data found.');
      }
    },
    error: (err) => {
      console.error('Error:', err);
      this.toastr.error('Failed to fetch attendance data.');
    }
  });
}

  filteredData(): any[] {
    if (!this.searchText) return this.allData;
    const search = this.searchText.toLowerCase();
    return this.allData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }

  // downloadExcel(): void {
  //   this.regularService.DownloadExcel().subscribe({
  //     next: (res) => {
  //       this.toastr.success('Excel downloaded successfully (mocked)');
  //       // Yahan actual blob download logic lagana hoga agar backend Excel de raha ho
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to download Excel');
  //     }
  //   });
  // }


   Delete(pk_inoutid: number) {
    if (confirm("Are you sure you want to delete this?")) {
      this.regularService.Delete(pk_inoutid).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getAllAttendanceRequests(); // ✅ Refresh after delete
          } else {
            this.toastr.error(res.message);
          }
        },
        error: (err) => {
          this.toastr.error("Error deleting");
          console.error(err);
        }
      });
    }
}
}
