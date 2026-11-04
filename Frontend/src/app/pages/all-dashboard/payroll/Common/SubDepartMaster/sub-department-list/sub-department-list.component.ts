import { Component } from '@angular/core';
import { DepartmentService } from '../../../services/department.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sub-department-list',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],
  templateUrl: './sub-department-list.component.html',
  styleUrl: './sub-department-list.component.scss'
})
export class SubDepartmentListComponent {

  subDepartmentList: any[] = [];
  searchText:string='';
  Isedit:boolean=false;


  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;


  constructor(private subDeptService:DepartmentService,private route: ActivatedRoute,private toastrService:ToastrService,private router: Router,public encryptionService:EncryptionService) {}
  
 

  ngOnInit(): void {
    this.getList();
  }



  getList(): void {
    this.subDeptService.get_subdepartment(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.subDepartmentList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}
onPageChange(event: number):void {
    this.pageIndex = event;
    this.getList();
  }

filteredData() {
  if (!this.searchText) {
    return this.subDepartmentList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.subDepartmentList.filter(shift =>
    shift.department?.toLowerCase().includes(searchTextLower) ||
    shift.description?.toLowerCase().includes(searchTextLower) ||
    shift.activeAlias?.toLowerCase().includes(searchTextLower)

  );
}


 
delete(pk_shiftId: string) {
  if (confirm('Are you sure you want to delete this record?')) {
      this.subDeptService.delete_SubDepartment(pk_shiftId).subscribe(
          (response: any) => {
              if (response.isSuccess) {

                this.toastrService.success(response.message || 'Record deleted successfully');
                this.getList(); // Refresh the list
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


isUpdate(pk_subdeptid: string) {
  // Encrypt the ID before navigating
  // const encryptedId = this.encryptionService.encryptText(pk_shiftId.toString());
  this.router.navigate(["/dash/user/userdashboard/Sub-Department",pk_subdeptid]);
}

   exportToExcel(): void {
        this.subDeptService.DownloadExcel().subscribe(res => {
          if (res.isSuccess && res.data.length > 0) {
            //for exclude the column
            const excludedColumns = ['fk_LocID','isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
      //rename the column
            const columnMappings: Record<string, string> = {
              SubDepartment: 'description',
              activeAlias:'activeAlias',
              
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
            const fileName = 'SubDepartmentList.xlsx';
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

