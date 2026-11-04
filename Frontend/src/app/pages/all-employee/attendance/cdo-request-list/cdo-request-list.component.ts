import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceService } from '../Services/attendance.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cdo-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './cdo-request-list.component.html',
  styleUrl: './cdo-request-list.component.scss'
})
export class CdoRequestListComponent {

   allData: any[] = [];
  searchText: string = '';
  caption: string = 'CDO Request List';
showAddButton: boolean = true;

type: string = '';
// status: string = '';
month: number | null = null;
  year: number | null = null;

  constructor(
    private regularService: AttendanceService,
    private toastr: ToastrService,
    private route:ActivatedRoute
  ) {}

  ngOnInit(): void {

      this.route.queryParams.subscribe(params => {
   
   this.type = params['type'];
    
        // this.status = params['status'] ?? null;

    this.month = params['month'] ? Number(params['month']) : null;
    this.year  = params['year'] ? Number(params['year']) : null;


      
    // Change caption if coming from dashboard
    if (this.type === 'attendance') {
      this.caption = 'CDO Details';
      this.showAddButton = false;
    } else {
      this.caption = 'CDO Request List';
      this.showAddButton = true;
    }
  });

    this.getAllRequests();
  }

  // getAllRequests(): void {
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

  getAllRequests(): void {
  this.regularService.getAllRegulariseAttendance(this.month ?? null,this.year ?? null).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        // filter only Type = 'CDO'
        this.allData = res.data.filter((item: any) => item.description === 'CDO');
        
        if (this.allData.length === 0) {
          this.toastr.warning('No CDO records found.');
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
            this.toastr.success("CDO cancelled successfully");
            this.getAllRequests(); // ✅ Refresh after delete
          } else {
            this.toastr.error("CDO not cancelled");
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
