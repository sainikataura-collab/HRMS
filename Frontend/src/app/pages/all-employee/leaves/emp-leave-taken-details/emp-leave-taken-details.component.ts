import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';
import { LeavereqService } from '../Service/leavereq.service';

@Component({
  selector: 'app-emp-leave-taken-details',
  standalone: true,
   imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],

  templateUrl: './emp-leave-taken-details.component.html',
  styleUrl: './emp-leave-taken-details.component.scss'
})
export class EmpLeaveTakenDetailsComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  leavetakenList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_finid:string='GU-1';
  fk_empid:string='GU-1';
  constructor(
   public LeavereqService: LeavereqService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

    ngOnInit() {
    this.getLeavetakendata();
  }
    

  getLeavetakendata(): void {
    this.ngxUILoaderService.start(); 
    this.LeavereqService.get_LeaveDetailsList(this.pageIndex - 1, this.pageSize,this.fk_empid,this.fk_finid).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
          this.leavetakenList = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.leavetakenList = [];
          this.totalItems = 0;
          this.toastrService.error(res.message, 'Error');
          this.ngxUILoaderService.stop(); 

        }
      },
      error: (error) => {
        this.leavetakenList = [];
          this.totalItems = 0;
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }
    filteredData(): any[] {
    if (!this.searchText) return this.leavetakenList;
    const search = this.searchText.toLowerCase();
    return this.leavetakenList.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    );
  }

    onPageChange(event: number): void {
    this.pageIndex = event;
    this.getLeavetakendata();
  }


}
