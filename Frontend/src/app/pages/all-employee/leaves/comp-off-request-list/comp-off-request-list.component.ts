import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { LeavereqService } from '../Service/leavereq.service';



@Component({
  selector: 'app-comp-off-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './comp-off-request-list.component.html',
  styleUrl: './comp-off-request-list.component.scss'
})
export class CompOffRequestListComponent {
compOffList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private compOffService : LeavereqService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllCompOffRequests();
    this.loaderService.stop();
  }

getAllCompOffRequests(): void {
  this.compOffService.getAllCompOffRequests().subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.compOffList = res.data;
        this.totalItems = res.totalCount || res.data.length; // Fallback if totalCount is missing
      } else {
        this.toastrService.warning(res.message || 'No data found.');
      }
    },
    error: () => {
      this.toastrService.error('Failed to load Comp Off Requests.');
    }
  });
}


  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllCompOffRequests();
  }

  filteredData(): any[] {
    if (!this.searchText) return this.compOffList;
    const text = this.searchText.toLowerCase();
    return this.compOffList.filter(req =>
      req.dated?.toLowerCase().includes(text) ||
      req.compoffdate?.toLowerCase().includes(text) ||
      req.intime?.toLowerCase().includes(text) ||
      req.totalhours?.toLowerCase().includes(text) ||
      req.compoffdays?.toLowerCase().includes(text) ||
      req.reason?.toLowerCase().includes(text) ||
      req.status?.toLowerCase().includes(text) ||
      req.outtime?.toLowerCase().includes(text)
    );
  }

  editCompOffRequest(pk_compOffId: number): void {
    this.router.navigate(['/dash/user/userdashboard/comp-off-request', pk_compOffId]);
  }

  // deleteCompOffRequest(pk_compOffId: number): void {
  //   if (confirm('Are you sure you want to delete this record?')) {
  //     this.compOffService.deleteCompOffRequest(pk_compOffId).subscribe({
  //       next: (res) => {
  //         if (res.isSuccess) {
  //           this.toastrService.success(res.message || 'Deleted successfully!');
  //           this.getAllCompOffRequests();
  //         } else {
  //           this.toastrService.error(res.message || 'Delete failed.');
  //         }
  //       },
  //       error: () => {
  //         this.toastrService.error('Something went wrong.');
  //       }
  //     });
  //   }
  // }

  exportToExcel(): void {
    this.compOffService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedKeys = ['pk_compOffId', 'createdBy', 'updatedBy'];
        const columnMap: Record<string, string> = {
          requestDate: 'Request Date',
          compOffDate: 'Comp Off Date',
          timeFrom: 'Time From',
          timeTo: 'Time To',
          totalHours: 'Total Hour',
          totalDays: 'Comp Off Days',
          remarks: 'Reason',
          status: 'Status'
        };

        const data = res.data.map((item: any) => {
          return Object.keys(item)
            .filter(k => !excludedKeys.includes(k))
            .reduce((obj: any, key: string) => {
              obj[columnMap[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CompOffRequests');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });

        const fileName = 'CompOffRequests.xlsx';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(fileData);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }

  DeleteCompoffLeave(pk_applycompoffId: string) {
    if (confirm("Are you sure you want to delete this Compoff leave application?")) {
      this.compOffService.DeleteCompoffLeave(pk_applycompoffId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.getAllCompOffRequests(); // ✅ Refresh after delete
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: (err) => {
          this.toastrService.error("Error deleting leave application");
          console.error(err);
        }
      });
    }
}
}