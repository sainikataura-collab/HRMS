// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-due-claranc-user-list',
//   standalone: true,
//   imports: [],
//   templateUrl: './due-claranc-user-list.component.html',
//   styleUrl: './due-claranc-user-list.component.scss'
// })
// export class DueClarancUserListComponent {

// }

import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';  
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../shared/services/encryption.service';

import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DueckaranceServiceService } from '../Service/dueckarance-service.service';


@Component({
  selector: 'app-due-claranc-user-list',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule,ReactiveFormsModule],
  templateUrl: './due-claranc-user-list.component.html',
  styleUrl: './due-claranc-user-list.component.scss'
})
export class  DueClarancUserListComponent implements OnInit {

  DueclearencemasterList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount=0;
    searchText = ''; 
  //fk_companyId ='' // 🔹 Later you can fetch from session/login

  constructor(
    private dueClearenceService:DueckaranceServiceService,
    private router: Router,
    private toastrService: ToastrService,
    public encryption:EncryptionService

  ) {}

  ngOnInit(): void {
   // this.fk_companyId = localStorage.getItem('companyId') || sessionStorage.getItem('companyId') || '';

    this.getDueClearence();
  }

  // Load paginated list
  getDueClearence() {
    this.dueClearenceService.GetAll(this.pageIndex-1, this.pageSize).subscribe({

      next: (res: any) => {

        // if API returns { data: [], totalCount: N }
        if (res && res.data) {
          this.DueclearencemasterList = res.data;
         this.totalCount = res.totalCount || res.data.length;  // ✅ store total count for pagination

          console.log((this.DueclearencemasterList))
        } else {
        this.DueclearencemasterList = res;
        this.totalCount = res.length; // ✅ for array response
      }
      },
      error: (err) => {
        console.error('Error fetching DueClearence list:', err);
      }
    });
  }
    // ✅ Filtering function
  filteredData() {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.DueclearencemasterList;
    }

    const searchTextLower = this.searchText.toLowerCase().trim();

    return this.DueclearencemasterList.filter(item => {
      const department = item.department ? String(item.department).toLowerCase() : '';
      const empCode = item.empCode ? String(item.empCode).toLowerCase() : '';
      const empName = item.empName ? String(item.empName).toLowerCase() : '';
      const remarks = item.remarks ? String(item.remarks).toLowerCase() : '';
      const isActive = item.isActive !== undefined ? String(item.isActive).toLowerCase() : '';

      return department.includes(searchTextLower) ||
             empCode.includes(searchTextLower) ||
             empName.includes(searchTextLower) ||
             remarks.includes(searchTextLower) ||
             isActive.includes(searchTextLower);
    });
    
  }


  // Edit
  edit(pk_DeptUserId: number) {
     const encryptedId = this.encryption.encryptText(pk_DeptUserId.toString());

    this.router.navigate([`/dash/exit/exitdashboard/Due_Clearence_User_Master/${encryptedId}`]);
  }


// for delete
  delete(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.dueClearenceService.delete_ClaranceUser(id).subscribe({
      
        next: (res) => {
          this.toastrService.success('Deleted successfully');
          this.getDueClearence(); // Refresh the list
        },
        error: (err) => {
          this.toastrService.error('Delete failed');
          console.error(err);
        }
      });
    }
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getDueClearence();
  }




  exportToExcel(): void {
      this.dueClearenceService.DownloadExcel().subscribe(res => {
        if (res.isSuccess && res.data.length > 0) {
          // Only include relevant fields, excluding Sr.No.
          const formattedData = res.data.map((item: any) => ({
            'Department': item.department,
            'EmployeeName':item.empName,
            'Employeecode': item.empcode,
                        'Remark': item.remarks,

            'Active': item.isActive
          }));

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'DueClearrence');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          const fileName = 'DueClearrence.xlsx';
          const link = document.createElement('a');
          link.href = URL.createObjectURL(data);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.toastrService.warning('No data available to export');
        }
      });
    }

}
