import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../Services/attendance.service';
import { LeavereqService } from '../../leaves/Service/leavereq.service';

@Component({
  selector: 'app-emp-od-request-list',
  standalone: true,
    imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],

  templateUrl: './emp-od-request-list.component.html',
  styleUrl: './emp-od-request-list.component.scss'
})


export class EmpODRequestListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  ODList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_finid:string='GU-1';
  fk_empid:string='GU-1';
  month: number | null = null;
year: number | null = null;

caption: string = 'List Of Request';
showAddButton: boolean = true;

type: string = '';


  constructor(
   public AttendanceService: AttendanceService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService,
    public LeavereqService:LeavereqService,
    private route:ActivatedRoute

  ) {}

    ngOnInit() {
      
    this.route.queryParams.subscribe(params => {
   
   this.type = params['type'];
    
       

    this.month = params['month'] ? Number(params['month']) : null;
    this.year  = params['year'] ? Number(params['year']) : null;


      
    // Change caption if coming from dashboard
    if (this.type === 'attendance') {
      this.caption = 'OD Details';
      this.showAddButton = false;
    } else {
      this.caption = 'List Of Request';
      this.showAddButton = true;
    }
  });
    this.getLeavetakendata();
  }
    
    filteredData(): any[] {
    if (!this.searchText) return this.ODList;
    const search = this.searchText.toLowerCase();
    return this.ODList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }

  getLeavetakendata(): void {
    this.ngxUILoaderService.start(); 
    this.AttendanceService.get_LeaveDetailsList(this.pageIndex - 1, this.pageSize,this.fk_empid,this.fk_finid,this.month,this.year).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
          this.ODList = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.ODList = [];
          this.totalItems = 0;
          this.ngxUILoaderService.stop(); 

        }
      },
      error: (error) => {
        this.ODList = [];
          this.totalItems = 0;
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }

    onPageChange(event: number): void {
    this.pageIndex = event;
    this.getLeavetakendata();
  }

  onDeleteLeave(leaveId: string) {
    if (confirm("Are you sure you want to delete this application?")) {
      
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