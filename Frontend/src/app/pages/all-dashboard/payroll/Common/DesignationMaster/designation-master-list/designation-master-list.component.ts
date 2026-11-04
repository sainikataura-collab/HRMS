import { Component, Inject } from '@angular/core';
import { Idesignation } from '../../../Interface/icommon';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DesignationService } from '../../../services/designation.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-designation-master-list',
  standalone: true,
  imports: [NgxPaginationModule,RouterLink,CommonModule,FormsModule],
  templateUrl: './designation-master-list.component.html',
  styleUrl: './designation-master-list.component.scss'
})
export class DesignationMasterListComponent {



  // store list data static 
    // designationList= [
    //   { id: 1, srNo: 1, designation: 'Manager', seniorityLevel: 'High', level: 'L1', qualification: 'MBA', remark: 'Senior Role', active: true },
    //   { id: 2, srNo: 2, designation: 'Software Engineer', seniorityLevel: 'Medium', level: 'L2', qualification: 'B.Tech', remark: 'Technical Role', active: true },
    //   { id: 3, srNo: 3, designation: 'HR Executive', seniorityLevel: 'Low', level: 'L3', qualification: 'MBA', remark: 'HR Role', active: false },
    //   { id: 4, srNo: 4, designation: 'Sales Executive', seniorityLevel: 'Medium', level: 'L2', qualification: 'BBA', remark: 'Sales Role', active: true },
    //   { id: 5, srNo: 5, designation: 'Admin Officer', seniorityLevel: 'Low', level: 'L3', qualification: 'B.Com', remark: 'Admin Role', active: false }
    // ];

    pageIndex: number = 1;
    pageSize: number = 10;
    totalItems: number = 0;

    designationList: any[] = [];
    searchText: string = '';
    searchTerm: string = '';


    Isedit:boolean=false;

   constructor(private designationService:DesignationService,private route: ActivatedRoute,private router: Router,private toastrService:ToastrService,public encryptionService:EncryptionService) {}

    ngOnInit(){
    this.getDesignation();
    }


  getDesignation(): void {
      this.designationService.get_Designation(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe(res => {
          if (res.isSuccess) {
              console.log('Data retrieved successfully:', res.data);
              this.designationList = res.data;
              this.totalItems = res.totalCount;
              console.log(this.totalItems, 'this is total items retrieved');
          } else {
              console.error('Failed to retrieve data:', res.message);
              alert(res.message);
          }
      });
  }


 



  deleteDesignation(designationId :string) {
    debugger
    if (confirm('Are you sure you want to delete this record?')) {
        this.designationService.delete_Designation(designationId ).subscribe(
          (response: any) => {
            if (response.isSuccess) {

              this.toastrService.success(response.message || 'Record deleted successfully');

                //alert('Record deleted successfully');
                this.getDesignation(); // Refresh the list
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





isUpdate(designationId: string){
  // console.log(addressId);
  this.router.navigate(["/dash/user/userdashboard/DesignationForm", designationId]);

}

filteredData() {
  if (!this.searchText) {
    return this.designationList;
  }
  const searchTextLower = this.searchText.toLowerCase();
  const local = this.designationList.filter(d =>
    d.designation?.toLowerCase().includes(searchTextLower) ||
    d.level?.toLowerCase().includes(searchTextLower) ||
    d.qualification?.toLowerCase().includes(searchTextLower) ||
    d.remarks?.toLowerCase().includes(searchTextLower) ||
    d.senioritylevel?.toLowerCase().includes(searchTextLower) ||
    d.isActive?.toString().toLowerCase().includes(searchTextLower) ||
    d.nHApply?.toLowerCase().includes(searchTextLower) ||
    d.nhApply?.toLowerCase().includes(searchTextLower)
  );
  return local;
}

onSearchTextChanged(): void {
  const local = this.filteredData();
  if (local.length === 0 && this.searchText.trim()) {
    this.searchTerm = this.searchText.trim();
    this.pageIndex = 1;
    this.getDesignation();
  } else if (!this.searchText.trim()) {
    this.searchTerm = '';
    this.getDesignation();
  }
}

    // for pagination
    onPageChange(event: number):void {
      this.pageIndex = event;
      this.getDesignation();
    }




     exportToExcel(): void {
        this.designationService.DownloadExcel().subscribe(res => {
          if (res.isSuccess && res.data.length > 0) {
            //for exclude the column
            const excludedColumns = ['fk_LocID','isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
      //rename the column
            const columnMappings: Record<string, string> = {
              designation: 'Designation',
              seniorityLevel: 'SLevel',
              level: 'Level',
              qualification:'qualification',
              remarks:'remarks',
              isActive:'isActive'

              
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
            const fileName = 'DesignationMasterList.xlsx';
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
