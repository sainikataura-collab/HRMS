import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { OperationalMasterService } from '../../../services/operational-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-operational-details',
  standalone: true,
  imports: [RouterLink,CommonModule, ReactiveFormsModule, FormsModule,NgxPaginationModule],
  templateUrl: './operational-details.component.html',
  styleUrl: './operational-details.component.scss'
})
export class OperationalDetailsComponent {
  operationalList: any[] = [];
 searchText: string = '';

  constructor(
    private operationalMasterService : OperationalMasterService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService:EncryptionService
  ) {}

 
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllOperationalDetails();
    this.loaderService.stop();
  }

  getAllOperationalDetails(): void {
    this.operationalMasterService.getAllOperational(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.operationalList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        alert('Error fetching data. Please try again.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllOperationalDetails();
  }
  
  deleteOperationalDetail(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.operationalMasterService.deleteOperational(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.getAllOperationalDetails();
          } else {
            this.toastrService.error(response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          alert('Failed to delete record.');
        }
      });
    }
  }

  editOperationalDetail(id: any) {
    this.router.navigate(['/dash/user/userdashboard/operationalMaster',id]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.operationalList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.operationalList.filter(detail =>
      detail.operationalCode?.toLowerCase().includes(searchTextLower) ||
      detail.operationalDescription?.toLowerCase().includes(searchTextLower)
    );
  }

   exportToExcel(): void {
       this.operationalMasterService.DownloadExcel().subscribe(res => {
         if (res.isSuccess && res.data.length > 0) {
           //for exclude the column
           const excludedColumns = ['pk_OperationalId','fkInsuserId','fkLocId','fkCompanyId',];
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
           XLSX.utils.book_append_sheet(workbook, worksheet, 'Operational');
     
           const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
           const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
     
           // **Direct Download (Without FileSaver)**
           const fileName = 'OperationalMasterList.xlsx';
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
