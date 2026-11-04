import { Component, inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { ExperienceDetailService } from '../../../payroll/services/experience-details.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { EmployeeService } from '../../../payroll/services/employee.service';

@Component({
  selector: 'app-experience-detail-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,NgxPaginationModule,CommonModule,],

  templateUrl: './experience-detail-list.component.html',
  styleUrl: './experience-detail-list.component.scss'
})
export class ExperienceDetailListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);
  searchText: string = '';
  EmployeeExperienceList: any[] = [];

  page: number = 1;
  pk_empid!: string|null;
  pageSize: number = 10;

  totalItems: number = 0;
  constructor(    private employeeService: EmployeeService,private experienceDetailsService:ExperienceDetailService,private router:Router,private toastrService: ToastrService,private route: ActivatedRoute,public encryptionService:EncryptionService) { }
  
  ngOnInit(): void {
     this. get_ExperienceDetailsList(this.pk_empid);


  }



  get_ExperienceDetailsList(fk_empid: string | null): void {
   const qualification = fk_empid ?? null; 
       this.experienceDetailsService.getExperienceListBasedOnSelectedEmployee(qualification, this.page - 1, this.pageSize).subscribe(
     res => {
       if (res?.isSuccess) {  // Ensure `res` is not undefined
         this.EmployeeExperienceList = res.data;
         this.totalItems = res.totalCount;
         console.log('Total Items:', this.totalItems);
       } else {
         console.error('API Response Error:', res?.message);
       }
     },
     error => {
       console.error('HTTP Error:', error);
     }
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
 onPageChange(event: number): void {
   this.page = event; // Update current page
    this.get_ExperienceDetailsList(this.pk_empid);
  }

 

  filteredData() {
    if (!this.searchText) {
      return this.EmployeeExperienceList;
    }
  
    const searchTextLower = this.searchText.toLowerCase();
    return this.EmployeeExperienceList.filter(item =>
      (item.compname && item.compname.toLowerCase().includes(searchTextLower)) ||
      (item.designation && item.designation.toLowerCase().includes(searchTextLower)) ||
      (item.department && item.department.toLowerCase().includes(searchTextLower)) ||
      (item.fromdate && item.fromdate.toLowerCase().includes(searchTextLower)) ||
      (item.todate && item.todate.toLowerCase().includes(searchTextLower)) 
    );
  }


  
  isUpdate(pk_pjobid: number) {
    // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(pk_pjobid.toString());
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
      queryParams: { from: 'experience_list' }
    });
  }

  deleteExperience(pk_pjobid: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.experienceDetailsService.delete_experience(pk_pjobid).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Record EmpExperienceDetails deleted successfully');
             this. get_ExperienceDetailsList(this.pk_empid);
          } else {
            this.toastrService.error(response.message || 'Failed to delete EmpExperienceDetails  record', 'Error');
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
  this.experienceDetailsService.DownloadExcel().subscribe(res => {
    if (res.isSuccess && res.data.length > 0) {
      const excludedColumns = ['pk_pjobid','fk_empid','uploadFile','documentupload','Timestamp'];
    
        const columnMappings: Record<string, string> = {
        compname: 'CompanyName',
        designation: 'Designtion',
        Department: 'department',
        fromdate: 'FromDate',
        todate:'Todate',
        leavingreason:'Leave Reason',
        ctc:'CTC',
        profile:'Profile'
       
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
      const fileName = 'ExperinceData.xlsx';
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