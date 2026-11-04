import { Component, Inject } from '@angular/core';
import { Idepartment } from '../../../Interface/icommon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../services/department.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-department-master-list',
  standalone: true,
  imports: [CommonModule,RouterLink,NgxPaginationModule,FormsModule],
  templateUrl: './department-master-list.component.html',
  styleUrl: './department-master-list.component.scss'
})
export class DepartmentMasterListComponent {

  // router=Inject(Router)

  searchText: string = '';
  searchTerm: string = '';
  DepartmentData: any[] = [];
  // departmentId: string='';

  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
  
  Isedit:boolean=false;
  
  constructor(private departmentService:DepartmentService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryptionService:EncryptionService) {}
 
  ngOnInit(): void {

  this.getDepartments();
  
  }


  onPageChange(event: number):void {
    this.pageIndex = event;
    this.getDepartments();
  }


  
getDepartments(): void {

    this.departmentService.getDepartment(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.DepartmentData = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}

 
filteredData() {
    if (!this.searchText) {
      return this.DepartmentData;
    }
    const searchTextLower = this.searchText.toLowerCase();
    const local = this.DepartmentData.filter(d =>
      d.description?.toLowerCase().includes(searchTextLower) ||
      d.activeAlias?.toLowerCase().includes(searchTextLower)
    );
    return local;
  }

  onSearchTextChanged(): void {
    const local = this.filteredData();
    if (local.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.pageIndex = 1;
      this.getDepartments();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getDepartments();
    }
  }

  deleteDepartment(departmentId: string) {
    if (confirm('Are you sure you want to delete this record?')) {
        this.departmentService.deleteDepartment(departmentId).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');

                    //alert('Record deleted successfully');
                    this.getDepartments(); // Refresh the list
                } else {
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


isUpdate(pk_DeptId: string){
  // console.log(addressId);
  this.router.navigate(["/dash/user/userdashboard/DepartmentForm", pk_DeptId]);

}


  exportToExcel(): void {
    this.departmentService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['fk_LocID', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_CompanyId','remarks'];

        const columnMappings: Record<string, string> = {
        
          description: 'Department',
          activeAlias: 'Active',
         
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
  
        // *Direct Download (Without FileSaver)*
        const fileName = 'DepartmentMasterList.xlsx';
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
