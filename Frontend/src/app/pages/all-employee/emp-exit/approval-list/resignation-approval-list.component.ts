import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { SeparationRequestService }
from '../Services/Emp_resignation.service';

import { EncryptionService }
from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-resignation-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './resignation-approval-list.component.html',
  styleUrl: './resignation-approval-list.component.scss',
})
export class ResignationApprovalListComponent
implements OnInit {

  approvalList: any[] = [];

  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;

  searchText = '';

  constructor(
    private separationRequestService:
      SeparationRequestService,
    private router: Router,
    public encryptionService:
      EncryptionService
  ) {}

  ngOnInit(): void {
    this.getApprovalList();
  }

  getApprovalList() {

    this.separationRequestService
      .getApprovalList()
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            this.approvalList =
              res.data || [];

            this.totalCount =
              this.approvalList.length;
          }
        }
      });
  }

  filteredData() {

    if (!this.searchText?.trim()) {
      return this.approvalList;
    }
  
    const text =
      this.searchText.toLowerCase().trim();
  
    return this.approvalList.filter(x =>
  
      x.empname?.toLowerCase().includes(text) ||
  
      x.empcode?.toLowerCase().includes(text) ||
  
      x.reason?.toLowerCase().includes(text) ||
  
      x.resignationDate?.includes(text) ||
  
      x.expectedLWD?.includes(text)
  
    );
  }

  view(id: number) {

    const encryptedId =
      this.encryptionService
      .encryptText(id.toString());

    this.router.navigate([
      '/dash/emp-exit/emp-exitdashboard/resignation_approval',
      encryptedId
    ]);
  }
}