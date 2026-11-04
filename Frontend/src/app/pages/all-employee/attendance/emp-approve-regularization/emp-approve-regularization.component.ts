import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceService } from '../Services/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-emp-approve-regularization',
  standalone: true,
   imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
 templateUrl: './emp-approve-regularization.component.html',
  styleUrl: './emp-approve-regularization.component.scss'
})
export class EmpApproveRegularizationComponent {
 ApproveRegularizationlist: any[] = [];
  searchText: string = '';

  constructor(
    private regularService: AttendanceService,
    private toastr: ToastrService,
        private router: Router,  public encryptionService:EncryptionService
  ) {}

  ngOnInit(): void {
    this.getAllAttendanceRequests();
  }

  getAllAttendanceRequests(): void {
    this.regularService.get_ApproveRegularizationList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.ApproveRegularizationlist = res.data;
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
    if (!this.searchText) return this.ApproveRegularizationlist;
    const search = this.searchText.toLowerCase();
    return this.ApproveRegularizationlist.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }

  update(pk_inoutid: string) {
 const encryptedId = this.encryptionService.encryptText(pk_inoutid.toString());
  this.router.navigateByUrl("/dash/attendance/attendancedashboard/Approve-Regularization/"+encryptedId);
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
  //   });
  // }
}
