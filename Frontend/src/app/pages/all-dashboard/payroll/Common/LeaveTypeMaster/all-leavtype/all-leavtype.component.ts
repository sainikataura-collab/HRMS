import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { LeaveTypeMasterService } from '../../../services/leavetype.service';
import { ToastrService } from 'ngx-toastr';

import * as XLSX from 'xlsx'
import { FormsModule } from '@angular/forms';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
// import * as XLSX from 'xlsx';

@Component({
  selector: 'app-all-leavtype',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,RouterLink,FormsModule,NgxPaginationModule],
  templateUrl: './all-leavtype.component.html',
  styleUrl: './all-leavtype.component.scss'
})
export class AllLeavtypeComponent {

constructor(private leavetypeService:LeaveTypeMasterService,private toastrService:ToastrService,private router:Router, public encryptionService:EncryptionService){}


  
pageIndex:number=1;
pageSize:number=10;
totalItems :number= 0;
  LeaveTypeList:any[]=[];
  Isedit=false;

  searchText:string='';

  ngOnInit(): void {
    this.getLeaveType();
  }




  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getLeaveType(); // Fetch new page data
  }



getLeaveType(): void {
  this.leavetypeService.get_LeaveTypeList(this.pageIndex - 1, this.pageSize).subscribe({
    next: (response) => {
      console.log('Data retrieved successfully:', response);
      if (response.isSuccess) {
        this.LeaveTypeList = response.data;
        this.totalItems = response.totalCount;
      } else {
        console.error('Failed to retrieve data:', response.message);
        this.toastrService.error(response.message || 'Failed to retrieve state data');
      }
    },
    error: (error) => {
      console.error('Error retrieving data:', error);
      this.toastrService.error('Error fetching state data');
    }
  });
}


deleteLeaveType(leaveid:string) {

if (confirm('Are you sure you want to delete this record?')) {
    this.leavetypeService.delete_LeaveType(leaveid ).subscribe(
      (response: any) => {
        if (response.isSuccess) {

          this.toastrService.success(response.message || 'Record deleted successfully');

            //alert('Record deleted successfully');
            this.getLeaveType(); // Refresh the list
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



filteredData(){
  if (!this.searchText) {
    return this.LeaveTypeList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.LeaveTypeList.filter(item =>
    (item.leavetype && item.leavetype.toLowerCase().includes(searchTextLower)) ||
    (item.shortdesc && item.shortdesc.toLowerCase().includes(searchTextLower)) ||
    (item.remark && item.remark.toLowerCase().includes(searchTextLower)) 
  );
}

 exportToExcel(): void {
        this.leavetypeService.DownloadExcel().subscribe(res => {
          if (res.isSuccess && res.data.length > 0) {
            //for exclude the column
            const excludedColumns = ['fk_LocID','pk_leaveid', 'fk_companyId', 'fk_UserID','leavenature', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
      //rename the column
            const columnMappings: Record<string, string> = {
              leavetype: 'LeaveType',
              shortdesc: 'ShortDesc',
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
            const fileName = 'LeaveTypeMasterList.xlsx';
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


// isUpdate(pk_leaveid:string){
//   this.router.navigateByUrl("/dash/payroll/payrolldashboard/Leave-Master-List",pk_leaveid)
// }
isUpdate(pk_leaveid: String) {
  // Encrypt the ID before navigating
   const encryptedId = this.encryptionService.encryptText(pk_leaveid.toString());
  this.router.navigate(["/dash/user/userdashboard/Leave-Master", encryptedId]);
}

     


}
