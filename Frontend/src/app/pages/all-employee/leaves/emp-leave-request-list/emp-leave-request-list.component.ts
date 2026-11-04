import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { LeavereqService } from '../Service/leavereq.service';

@Component({
  selector: 'app-emp-leave-request-list',
  standalone: true,
    imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],

  templateUrl: './emp-leave-request-list.component.html',
  styleUrl: './emp-leave-request-list.component.scss'
})

export class EmpLeaveRequestListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  leavetakenList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_finid:string='GU-1';
  fk_empid:string='GU-1';

  caption: string = 'Leave Request';
showAddButton: boolean = true;

type: string = '';
status: string = '';
month: number | null = null;
  year: number | null = null;

  constructor(
   public LeavereqService:LeavereqService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService,
    private route:ActivatedRoute
  ) {}

    ngOnInit() {
    

    this.route.queryParams.subscribe(params => {
   
   this.type = params['type'];
    
        this.status = params['status'] ?? null;

    this.month = params['month'] ? Number(params['month']) : null;
    this.year  = params['year'] ? Number(params['year']) : null;


      
    // Change caption if coming from dashboard
    if (this.type === 'leaves') {
      this.caption = 'Leave Details';
      this.showAddButton = false;
    } else {
      this.caption = 'Leave Request';
      this.showAddButton = true;
    }
  });

 this.getLeavetakendata();
  }
    

// getLeavetakendata(): void {
//   this.ngxUILoaderService.start();
//   this.LeavereqService.get_LeaveReqList(this.pageIndex - 1, this.pageSize, this.fk_empid, this.fk_finid).subscribe({
//     next: (res) => {
//       this.ngxUILoaderService.stop();
//       if (res.isSuccess) {
//         this.leavetakenList = res.data ?? [];
//         this.totalItems = res.totalCount ?? 0;
//       } else {
//         this.leavetakenList = [];
//         this.totalItems = 0;
//       }
//     },
//     error: () => {
//       this.ngxUILoaderService.stop();
//       this.leavetakenList = [];
//       this.totalItems = 0;
//       this.toastrService.error('Failed to retrieve leave data', 'Error');
//     }
//   });
// }

convertStatus(status: string | null | undefined): string | undefined {
  if (!status || status.trim() === "") return undefined;

  const map: any = {
    pending: 'P',
    approved: 'A',
    saved: 'S',
    disapproved: 'C',
    rejected: 'C'
  };

  return map[status.toLowerCase()] ?? undefined;
}


getLeavetakendata() {
  this.ngxUILoaderService.start();
const dbStatus = this.convertStatus(this.status);

  this.LeavereqService.get_LeaveReqList(
     this.pageIndex - 1,
  this.pageSize,
  this.fk_empid,
  this.fk_finid,
  dbStatus ?? null,
  this.month ?? null,
  this.year ?? null    // 👈 nullable
  )
  .subscribe({
    next: (res) => {
      this.ngxUILoaderService.stop();
      if (res.isSuccess) {
        this.leavetakenList = res.data ?? [];
        this.totalItems = res.totalCount ?? 0;
      } else {
        this.leavetakenList = [];
        this.totalItems = 0;
      }
    },
    error: () => {
      this.ngxUILoaderService.stop();
      this.leavetakenList = [];
      this.totalItems = 0;
      this.toastrService.error("Failed to retrieve leave data","Error");
    }
  });
}




 filteredData(): any[] {
  if (!this.searchText || this.searchText.trim() === '') {
    return this.leavetakenList;
  }
  return this.leavetakenList.filter(item =>
    item.leavetype?.toLowerCase().includes(this.searchText.toLowerCase()) ||
    item.statusname?.toLowerCase().includes(this.searchText.toLowerCase()) ||
    item.remarks?.toLowerCase().includes(this.searchText.toLowerCase())
  );
}


    onPageChange(event: number): void {
    this.pageIndex = event;
    this.getLeavetakendata();
  }



  onDeleteLeave(leaveId: string) {
    if (confirm("Are you sure you want to delete this leave application?")) {
      this.LeavereqService.DeleteLeave(leaveId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.getLeavetakendata(); // ✅ Refresh after delete
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