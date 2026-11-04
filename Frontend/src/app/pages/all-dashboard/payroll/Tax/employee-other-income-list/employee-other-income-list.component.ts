import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmployeeOtherIncomeService } from '../../services/employee-other-income.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-employee-other-income-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule,NgSelectComponent],
  templateUrl: './employee-other-income-list.component.html',
  styleUrl: './employee-other-income-list.component.scss'
})
export class EmployeeOtherIncomeListComponent {

 searchText: string = '';
  list: any[] = [];
  isEdit: boolean = false;
  pageIndex:number=1;
   pageSize:number=10;
   totalItems :number= 0;
  fk_findid: string | null = null;
 
  
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private router: Router,
    private service: EmployeeOtherIncomeService,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    public encryption:EncryptionService
  ) {}

  ngOnInit(): void {
   
    this.getIncomelist(); // Fetch all data on load
   
  }

  
// Handle Pagination Change
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getIncomelist();
  }

 

  filteredData() {
    if (!this.searchText) return this.list;
    const searchTextLower = this.searchText.toLowerCase();

    return this.list.filter((res) =>
      res.houseproperty?.toString().toLowerCase().includes(searchTextLower) || 
       res.empname?.toLowerCase().includes(searchTextLower)
      //res.dated?.toLowerCase().includes(searchTextLower)
      // res.dated ? new Date(res.dated).toLocaleDateString().toLowerCase().includes(searchTextLower) : false // Convert date to string
    
    );
}


  // Fetch income list Details
  getIncomelist() {
    this.ngxUILoaderService.start();
     // If fk_empid is null or empty, do not filter by employee
    const findid = this.fk_findid ?? null; // Send null if no employee is selected
    this.service.get_All_Income(findid, this.pageIndex-1,this.pageSize).subscribe({
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
  edit(pk_incomeid:string) {
    this.router.navigate(["/dash/payroll/payrolldashboard/employeeOtherIncome", pk_incomeid]);
  }

 //for delete 
  delete(pk_incomeid: string) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.service.delete_Income(pk_incomeid).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');
                  
                                      // Remove deleted item from list
                                      this.list = this.list.filter(item => item.pk_incomeid !== pk_incomeid);

                                      // Decrease total count
                                      this.totalItems--;
                  
                                      // ✅ If no items are left on the current page, refresh the list
                                      if (this.list.length === 0) {
                                          this.getIncomelist();
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
             const excludedColumns = ['pk_incomeid', 'fk_empid','fk_finid','fk_insUserID', 'fk_updUserID', 'fk_updDateID','fk_insDateID', 'timestamp'];
            const columnMappings: Record<string, string> = {
               dated:'Dated',
               houseproperty:'From Property',
               interest:'From Interest',
               anyotherincome:'Other Income',
               anyloss:'Any Loss'
    
             
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
             const fileName = 'OtherIncomeList.xlsx';
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
