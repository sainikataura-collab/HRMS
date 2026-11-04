import { Component, inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { QualificationDetailService } from '../../payroll/services/employeeQualification.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { EmployeeService } from '../../payroll/services/employee.service';

@Component({
  selector: 'app-hr-qualification-list',
  standalone: true,
  

  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],


  templateUrl: './hr-qualification-list.component.html',
  styleUrl: './hr-qualification-list.component.scss'
})
export class HrQualificationListComponent {
 ngxUILoaderService = inject(NgxUiLoaderService);

 searchText:string='';

qualificationDetailsList: any[] = [];

 
  pk_empid!: string|null;

  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
 
  constructor( private employeeService: EmployeeService,private qualificationService:QualificationDetailService,private router:Router,private toastrService: ToastrService,private route: ActivatedRoute,public encryptionService:EncryptionService) { }
  
  ngOnInit(): void {
    this. get_QualificationList(this.pk_empid);
    



  }



  get_QualificationList(fk_empid: string | null): void {
   const qualification = fk_empid ?? null; 
       this.qualificationService.getQualificationListBasedOnSelectedEmployee(qualification, this.pageIndex - 1, this.pageSize).subscribe(
     res => {
       if (res?.isSuccess) {  // Ensure `res` is not undefined
         this.qualificationDetailsList = res.data;
         this.totalItems = res.totalCount;
         console.log('Total Items:', this.totalItems);
       } else {
         console.error('API Response Error:', res?.message);
       }
     },
     error => {
       console.error('HTTP Error:', error); // 🔍 Check if HTTP request fails
     }
   );
 }
 

 
 onPageChange(event: number): void {
   this.pageIndex = event; // Update current page
   this.get_QualificationList(this.pk_empid); // Fetch data for the selected page
 }



filteredData() {
  if (!this.searchText) {
    return this.qualificationDetailsList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.qualificationDetailsList.filter(item =>
    (item.qualification && item.qualification.toLowerCase().includes(searchTextLower)) ||
    (item.subject && item.subject.toLowerCase().includes(searchTextLower)) ||
    (item.subject && item.subject.toLowerCase().includes(searchTextLower)) ||
    (item.institute && item.institute.toLowerCase().includes(searchTextLower)) 
  );
}


 downloadFile(fileName: string): void {

  if (!fileName) {
    return;
  }

  this.employeeService.getImage(fileName).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      // document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },

    error: (err) => {
      console.error('File download error:', err);
      this.toastrService.error('Unable to download file');
    }
  });
}

  
  isUpdate(pk_empqualid: number) {
    // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(pk_empqualid.toString());
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
      queryParams: { from: 'qualification_list' }
    });
  }

  // isUpdate(pk_empqualid: number) {


  deleteQualification(pk_empqualid: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.qualificationService.delete_QualificationDetails(pk_empqualid).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Record Qualification deleted successfully');
            this.get_QualificationList(this.pk_empid);
          } else {
            this.toastrService.error(response.message || 'Failed to delete Qualification  record', 'Error');
          }
        },
        (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('An error occurred while deleting the record', 'Error');
        }
      );
    }
  }
  
 exportToExcel(): void {
  this.qualificationService.DownloadExcel().subscribe(res => {
    if (res.isSuccess && res.data.length > 0) {
      const excludedColumns = ['pk_empqualid','fk_empid','uploadFile','documentupload','Timestamp','fk_qualiId','fk_subjectid', 'fk_insid', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];
    
        const columnMappings: Record<string, string> = {
        qualification: 'Qualification',
        subject: 'Subject',
        institute: 'Institute',
        passyear: 'Passyear',
        marks:'Marks',
        division:'Division'
       
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Direct Download (Without FileSaver)
      const fileName = 'QualificationData.xlsx';
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
