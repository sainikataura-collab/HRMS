import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { RegligionMasterService } from '../../../services/regligion-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';



@Component({
  selector: 'app-religion-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: "./regligion-master-list.component.html",
  styleUrl: './regligion-master-list.component.scss'
})
export class ReligionMasterListComponent {
  religionList: any[] = []; 
  searchText: string = '';
  
  constructor(private regligionMasterService : RegligionMasterService,private toastrService:ToastrService, private loaderservice:NgxUiLoaderService,public encryptionService:EncryptionService) {}

  router = inject(Router);
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
   this.loaderservice.start();
    this.getAllReligions();
    this.loaderservice.stop();
  }

  getAllReligions(): void {
    this.regligionMasterService.getAllRegligion(this.pageIndex-1,this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          console.log('Data retrieved successfully:', response.data);
          this.religionList = response.data;
          this.totalItems = response.totalCount;
          console.log(this.totalItems, 'this is total items retrieved'); 
        } else {
          console.error('Failed to retrieve data:', response.message);
          //alert(response.message);
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
    debugger
    this.pageIndex = event; // Update current page
    this.getAllReligions(); // Fetch data for the selected page
  }

  deleteReligion(religionid: string): void {
    debugger
    if (confirm('Are you sure you want to delete this religion?')) {
      this.regligionMasterService.deleteRegligion(religionid).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.getAllReligions(); // Refresh list after deletion
          } else  {
            this.toastrService.success(response.message);

            
          }
        },
        error: (error) => {
          console.error('Error deleting religion:', error);
          alert('Failed to delete religion.');
        }
      });
    }
  }

  editReligion(religionid: any) {
    this.router.navigate(['/dash/user/userdashboard/regligionMaster', religionid]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.religionList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.religionList.filter(religion =>
      (religion.religiontype?.toLowerCase().includes(searchTextLower))
    );
  }

 exportToExcel(): void {
     this.regligionMasterService.DownloadExcel().subscribe(res => {
       if (res.isSuccess && res.data.length > 0) {
         //for exclude the column
         const excludedColumns = ['pk_religionid','fk_UserID','fk_LocID','fk_CompanyId','timestamp'];
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
         XLSX.utils.book_append_sheet(workbook, worksheet, 'Regligion');
   
         const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
         const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
   
         // **Direct Download (Without FileSaver)**
         const fileName = 'RegligionMasterList.xlsx';
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
