import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../../services/account.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-all-account-master',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],
  templateUrl: './all-account-master.component.html',
  styleUrl: './all-account-master.component.scss'
})
export class AllAccountMasterComponent {
  accountList:any[]=[]; 
  searchText: string = '';
  constructor(private accountService : AccountService,private toastrService:ToastrService,public encryptionService:EncryptionService ){}

   router=inject(Router)
   page: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   ngOnInit(): void {
    debugger

    this.getAllAccounts();  
   }
 
   getAllAccounts(): void {
    this.accountService.getAllAccounts(0, 1000).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          console.log('Data retrieved successfully:', response.data);
          this.accountList = response.data;
          this.totalItems = this.accountList.length;
          console.log(this.totalItems,'this is total items retrieved '); 
        } else {
          console.error('Failed to retrieve data:', response.message);
          alert(response.message);
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        alert('Error fetching data. Please try again.');
      },
      complete: () => {
        console.log('Data retrieval completed.');
      }
    });
  }
  onPageChange(event: number): void {
    this.page = event; // Update current page
    this.getAllAccounts(); // Fetch data for the selected page
  }

  deleteAccount(account_id: number): void {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(account_id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.getAllAccounts(); // Refresh list after deletion
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account.');
        }
      });
    }
  }
  

  editMode: boolean = false;
  selectedAccount: any = {};
  
  
  editAccount(account_id: any) {
    this.router.navigate(['/dash/payroll/payrolldashboard/AccountMaster/', account_id]);
  }

  
  
  filteredData() {
    if (!this.searchText) {
      return this.accountList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.accountList.filter(accountList =>
      (accountList.code?.toLowerCase().includes(searchTextLower)) ||  
      (accountList.name?.toLowerCase().includes(searchTextLower))
    );
  }


  exportToExcel(): void {
     this.accountService.DownloadExcel().subscribe(res => {
       if (res.isSuccess && res.data.length > 0) {
         //for exclude the column
         const excludedColumns = ['pk_account_id'];
   //rename the column
         const columnMappings: Record<string, string> = {
            code: 'Code',
            name: 'Name',
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
         XLSX.utils.book_append_sheet(workbook, worksheet, 'Account');
   
         const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
         const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   
         // **Direct Download (Without FileSaver)**
         const fileName = 'AccountMasterList.xlsx';
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

