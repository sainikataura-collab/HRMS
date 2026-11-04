import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PerquisiteAssignmentService } from '../../services/perquisite-assignment.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-assign-perquisite-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule,NgSelectComponent],
  templateUrl: './assign-perquisite-list.component.html',
  styleUrl: './assign-perquisite-list.component.scss'
})
export class AssignPerquisiteListComponent implements OnInit {
  searchText: string = '';
  list: any[] = [];
  isEdit: boolean = false;
  pageIndex:number=1;
   pageSize:number=10;
   totalItems :number= 0;
  fk_empid: string | null = null;
  EmployeeList: { name: string; value: string }[] = [];
  
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private router: Router,
    private service: PerquisiteAssignmentService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    public encryption:EncryptionService
  ) {}

  ngOnInit(): void {
    this.getEmployeeList('Employee'); // Load employee list
    this.fk_empid = null;  // Ensure fk_empid is initially null
    this.getPerquisiteDetails(); // Fetch all data on load
   
  }

  // Fetch employee list
  getEmployeeList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.service.getEmployee(fieldName).subscribe({
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
    this.getPerquisiteDetails();
  }
// Handle Pagination Change
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getPerquisiteDetails();
  }

  // Filter the Data
  filteredData() {
    if (!this.searchText) return this.list;
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter((res) =>
      res.description?.toLowerCase().includes(searchTextLower)
    );
  }

  // Fetch Perquisite Details
  getPerquisiteDetails() {
    this.ngxUILoaderService.start();
     // If fk_empid is null or empty, do not filter by employee
     const employeeId = this.fk_empid ?? null; // Send null if no employee is selected
    this.service.get_All_perquisite(employeeId, this.pageIndex-1,this.pageSize).subscribe({
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
 

  // Navigate to Edit Page
  edit(pk_perktrnId:string) {
    this.router.navigate(["/dash/payroll/payrolldashboard/assignPerquisite", pk_perktrnId]);
  }

 //for delete 
  deletePerquisite(pk_perktrnId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.service.delete_perquisite(pk_perktrnId).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');
                  
                                      // Remove deleted item from list
                                      this.list = this.list.filter(item => item.pk_perktrnId !== pk_perktrnId);

                                      // Decrease total count
                                      this.totalItems--;
                  
                                      // ✅ If no items are left on the current page, refresh the list
                                      if (this.list.length === 0) {
                                          this.getPerquisiteDetails();
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


 //download excel
       exportToExcel(): void {
         this.service.DownloadExcel().subscribe(res => {
           if (res.isSuccess && res.data.length > 0) {
             const excludedColumns = ['pk_perktrnId', 'fk_empid','fk_perkId','fk_insUserID', 'fk_updUserID', 'fk_updDateID', 'timestamp'];
            const columnMappings: Record<string, string> = {
             
              cid :'Sr No.',
              fk_perkId: 'Perquisite Name',
              trndate:'Date',
              totvalue:'Total Value',
              amtreceived:'Ammount Received',
              taxableamt:'Taxable Ammount'
             
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
             const fileName = 'PerquisiteAssignmentList.xlsx';
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
