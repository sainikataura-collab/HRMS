import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SectionDocService } from '../../../payroll/services/sectiondoc.service';
import { AccidentDetailService } from '../../HRservices/accident-detail.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-accident-details-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule,NgSelectComponent],
  templateUrl: './accident-details-list.component.html',
  styleUrl: './accident-details-list.component.scss'
})
export class AccidentDetailsListComponent {


  searchText:string='';
    list: any[] = [];
    Isedit=false;
    pageIndex:number=1;
    pageSize:number=10;
     totalItems :number= 0;
    fk_empid: string | null = null;
    EmployeeList: { name: string; value: string }[] = [];
    
       
       ngxUILoaderService = inject(NgxUiLoaderService);
  
    constructor(private Service:SectionDocService,private serivce2:AccidentDetailService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
       
    ngOnInit(): void {
      this.getEmployeeList('Employee'); // Load employee list
      this.fk_empid = null;  // Ensure fk_empid is initially null
      this.getList(); // Fetch all data on load
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
      this.getList();
    }
     //for paginatiion
     onPageChange(event: number) {
       this.pageIndex = event;
       this.getList();
      
     }
  //for filter the data 
    filteredData() {
      if (!this.searchText) {
        return this.list;
      }
      const searchTextLower = this.searchText.toLowerCase();
      return this.list.filter(res =>
        res.empcode?.toLowerCase().includes(searchTextLower)||
        res.empname?.toLowerCase().includes(searchTextLower),
        
       
      );
    }
      
      
      // Fetch Perquisite Details
    getList() {
      this.ngxUILoaderService.start();
       // If fk_empid is null or empty, do not filter by employee
       const employeeId = this.fk_empid ?? null; // Send null if no employee is selected
      this.serivce2.get_accidentDetail(employeeId, this.pageIndex-1,this.pageSize).subscribe({
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
  
    download(filename: string) {
      this.serivce2.getImage(filename).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename; // Set the filename for download
          a.click();
          window.URL.revokeObjectURL(url); // Clean up
        },
        error: (err) => {
          console.error('Failed to load image:', err);
        }
      });
    }
     //download excel
           exportToExcel(): void {
             this.serivce2.DownloadExcel().subscribe(res => {
               if (res.isSuccess && res.data.length > 0) {
                 const excludedColumns = ['claimdate','fk_empid','pk_accidentId','remarks','expenceamt','ifilename','timestamp','receivedamt','claimamt','receivedate'];
                const columnMappings: Record<string, string> = {
  
                 
                  empcode:'Code',
                  empname:'Name',
                  description:'Description',
                  location:'Location',
                  accidentdate:'Accident Date',
                  expenceamt:'Expence ammount',
                  filename:'Filename'
                  
                 
         
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
                 const fileName = 'Accident list.xlsx';
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
     edit(pk_accidentId:string) {
      this.router.navigate(["/dash/hr/hrdashboard/AccidentDetail", pk_accidentId]);
    }
  
   //for delete 
    delete(pk_accidentId: string) {
      if (confirm('Are you sure you want to delete this record?')) {
          this.serivce2.delete_accidentDetail(pk_accidentId).subscribe(
              (response: any) => {
                  if (response.isSuccess) {
  
                    this.toastrService.success(response.message || 'Record deleted successfully');
                    
                                        // Remove deleted item from list
                                        this.list = this.list.filter(item => item.pk_accidentId !== pk_accidentId);
  
                                        // Decrease total count
                                        this.totalItems--;
                    
                                        // ✅ If no items are left on the current page, refresh the list
                                        if (this.list.length === 0) {
                                            this.getList();
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
