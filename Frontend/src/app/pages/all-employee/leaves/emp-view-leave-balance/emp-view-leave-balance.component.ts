import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-emp-view-leave-balance',
  standalone: true,
     imports: [RouterLink, CommonModule,FormsModule,NgxPaginationModule],
 
  templateUrl: './emp-view-leave-balance.component.html',
  styleUrl: './emp-view-leave-balance.component.scss'
})

export class EmpViewLeaveBalanceComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  leavetakenList: any[] = [];
  // searchText: string = '';
  // pageIndex: number = 1;
  // pageSize: number = 10;
  // totalItems: number = 0;
  // fk_finid:string='GU-1';
  // fk_empid:string='GU-1';
  constructor(
   public LeavereqService:LeavereqService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

    ngOnInit() {
    this.getLeavetakendata();
  }
    

  getLeavetakendata(): void {
    this.ngxUILoaderService.start(); 
    this.LeavereqService.getViewLeaveBalance().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop(); 
         //  const leave = res.data.leaveBalance;

        this.leavetakenList = [res.data.leaveBalance][0];
        console.log('leave', this.leavetakenList);
        } else {
          this.leavetakenList = [];
          this.toastrService.error(res.message, 'Error');
          this.ngxUILoaderService.stop(); 

        }
      },
      error: (error) => {
        this.leavetakenList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }



}