import { Component, inject, Inject, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SectionDocService } from '../../../services/sectiondoc.service';

@Component({
  selector: 'app-section-doc-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule,NgSelectComponent],
  templateUrl: './section-doc-list.component.html',
  styleUrl: './section-doc-list.component.scss'
})
export class SectionDocListComponent {
searchText:string='';
  list: any[] = [];
  Isedit=false;
  pageIndex:number=1;
  pageSize:number=10;
   totalItems :number= 0;
  fk_empid: string | null = null;
  EmployeeList: { name: string; value: string }[] = [];
  
     
     ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(private Service:SectionDocService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
     
  ngOnInit(): void {
    this.getEmployeeList('Employee'); // Load employee list
    this.fk_empid = null;  // Ensure fk_empid is initially null
    this.getSectiondocStatusList(); // Fetch all data on load
   }

    // Fetch employee list
  getEmployeeList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data);
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));
        } else {
          this.toastrService.error('Failed to load employee list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching employee list:', err);
        this.toastrService.error('Error fetching employee list. Please try again.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  // Handle Employee ID Change
  onEmpidChange(fk_empid: string | null): void {
    this.fk_empid = fk_empid;
    console.log('Employee selected:', this.fk_empid ?? 'All Employees');
    this.list = [];
    this.getSectiondocStatusList();
  }
   //for paginatiion
   onPageChange(event: number) {
     this.pageIndex = event;
     this.getSectiondocStatusList();
    
   }
//for filter the data 
  filteredData() {
    if (!this.searchText) {
      return this.list;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(res =>
      res.docsub_status?.toLowerCase().includes(searchTextLower)||
      res.subsecname?.toLowerCase().includes(searchTextLower),
      
     
    );
  }
    
    
    // Fetch Perquisite Details
  getSectiondocStatusList() {
    this.ngxUILoaderService.start();
     // If fk_empid is null or empty, do not filter by employee
     const employeeId = this.fk_empid ?? null; // Send null if no employee is selected
    this.Service.get_All_Sectiondoc(employeeId, this.pageIndex-1,this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) { // Ensure `res` is not undefined or null
          console.log('Data retrieved successfully:', res.data);
         this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          console.error('Failed to retrieve data:', res.message);
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }
    
    });
  }

   //download excel
         exportToExcel(): void {
           this.Service.DownloadExcel().subscribe(res => {
             if (res.isSuccess && res.data.length > 0) {
               const excludedColumns = ['status','approved_Amt','cid','pk_docid','fk_empid','isActive','underTaking_Amt','isApproved','contenttype','fk_finid','Code','remarks','attachment','MaxCode','Approved_Amt','timestamp', 'UnderTaking_Amt', 'fk_updUserID', 'fk_subsecid', 'fk_secid', 'billno','billdate','submitted_Amt'];
              const columnMappings: Record<string, string> = {

               
                secname:'Section name',
                subsecname:'Sub section name',
                docsub_status:'Status',
                docsub_Amt:'Amount',
                submitdate:'Submited Date',
                filename:'File name',
                
               
       
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
         
               // **Direct Download (Without FileSaver)**
               const fileName = 'Section doc status.xlsx';
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
    
   // Navigate to Edit Page
   edit(pk_docid:string) {
    this.router.navigate(["/dash/payroll/payrolldashboard/Section-DocStatus", pk_docid]);
  }

 //for delete 
  delete(pk_docid: string) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.Service.delete_Sectiondoc(pk_docid).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');
                  
                                      // Remove deleted item from list
                                      this.list = this.list.filter(item => item.pk_docid !== pk_docid);

                                      // Decrease total count
                                      this.totalItems--;
                  
                                      // ✅ If no items are left on the current page, refresh the list
                                      if (this.list.length === 0) {
                                          this.getSectiondocStatusList();
                                      }
                  
                } 
                else {
                  this.toastrService.error(response.message, 'Error');
                }
            },
            (errorMessage) => {
                console.error('Error deleting record', errorMessage);
                this.toastrService.error(errorMessage, 'Error');
               
            }
        );
    }
}



}

