import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { UserMasterService } from '../../services/user-master.service';
import { UsermasterService } from '../../services/usermaster.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-user-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './user-master-list.component.html',
  styleUrl: './user-master-list.component.scss'
})
export class UserMasterListComponent {
  UserList: any[] = [];
searchText: string = '';

  constructor(
    private userMasterService: UserMasterService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  companyCode: string = '';

  ngOnInit(): void {
    this.companyCode = (sessionStorage.getItem('companyCode') || localStorage.getItem('companyCode') || '').toLowerCase();
    this.loaderService.start();
    this.getAllUsers();
    this.loaderService.stop();
  }

 


  getAllUsers(): void {
    this.userMasterService.get_User(this.pageIndex - 1, this.pageSize, this.searchText).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.UserList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve user data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching user data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllUsers();
  }

  onSearchChange(): void {
    this.pageIndex = 1; // Reset to first page
    this.getAllUsers();
  }

  deleteUser(pk_userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userMasterService.delete_User(pk_userId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'User deleted successfully');
            this.getAllUsers();
          } else {
            this.toastrService.error(response.message || 'Failed to delete user');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete user record');
        }
      });
    }
  }

  editUser(pk_userId: string): void {
    this.router.navigate(['/dash/user/userdashboard/user-master', pk_userId]);
  }

  filteredData() {
    return this.UserList;
  }

  exportToExcel(): void {
    this.userMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        //for exclude the column
        const excludedColumns = ['fk_companyId','cid','pk_userId','fk_roleId','fk_empId','roleLevel','oldPassword','name','fathername','department','designation','fk_insUserID','fk_updUserID','fk_insDateID','fk_updDateID','timestamp','password','active'];
  //rename the column
        const columnMappings: Record<string, string> = {
         
        };
  
        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });
  
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'State');
  
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // **Direct Download (Without FileSaver)**
        const fileName = 'UserMasterList.xlsx';
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

  // added by shiv
  sendingType: string | null = null;
  sendingUserId: string | null = null;

  sendEmails(type: string, user: any = null): void {
    const payload = {
      Type: type, // 'CREDENTIALS' or 'REMINDER'
      Users: user ? [user] : [], // Single user or empty for all
      SendToAll: user ? false : true // Flag for backend to fetch all users
    };

    if (!payload.SendToAll && (!payload.Users || payload.Users.length === 0)) {
      this.toastrService.warning('No users found to send email.');
      return;
    }

    if (!confirm(`Are you sure you want to send ${type === 'CREDENTIALS' ? 'Credentials' : 'Reminder'} to ${user ? 'this user' : 'all users'}?`)) {
      return;
    }

    this.sendingType = type;
    this.sendingUserId = user ? user.pk_userId : 'ALL';

    this.userMasterService.sendUserEmails(payload).subscribe({
      next: (res) => {
        this.sendingType = null;
        this.sendingUserId = null;
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Emails queued successfully.');
        } else {
          this.toastrService.error(res.message || 'Failed to send emails.');
        }
      },
      error: (err) => {
        this.sendingType = null;
        this.sendingUserId = null;
        this.toastrService.error('An error occurred while sending emails.');
        console.error(err);
      }
    });
  }

}
