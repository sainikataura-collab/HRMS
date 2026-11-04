import { Component } from '@angular/core';
import { VideoUrlUploadService } from '../TraningService/video-url-upload.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-traning-video-url-upload-list',
  standalone: true,
  imports: [RouterLink,CommonModule,NgxPaginationModule,FormsModule],

  templateUrl: './traning-video-url-upload-list.component.html',
  styleUrl: './traning-video-url-upload-list.component.scss'
})
export class TraningVideoUrlUploadListComponent {

  VideoUrlUploadList: any[] = [];
  searchText:string='';
  Isedit:boolean=false;


  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;


  constructor(private VideoUrlSerivce:VideoUrlUploadService,private route: ActivatedRoute,private toastrService:ToastrService,private router: Router,public encryptionService:EncryptionService) {}
  
 

  ngOnInit(): void {
    this.getList();
  }



  getList(): void {
    this.VideoUrlSerivce.get_All(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.VideoUrlUploadList = res.data;
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
    return this.VideoUrlUploadList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.VideoUrlUploadList.filter(upload =>
    upload.application?.toLowerCase().includes(searchTextLower) ||
    upload.topic?.toLowerCase().includes(searchTextLower) ||
    upload.url?.toLowerCase().includes(searchTextLower)

  );
}


 
delete(pk_shiftId: string) {
  if (confirm('Are you sure you want to delete this record?')) {
      this.VideoUrlSerivce.delete(pk_shiftId).subscribe(
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


isUpdate(pk_TrainingId: number) {
  // Encrypt the ID before navigating
  this.router.navigate(["/dash/payroll/payrolldashboard/video-url-upload",pk_TrainingId]);
}

  //  exportToExcel(): void {
  //       this.subDeptService.DownloadExcel().subscribe(res => {
  //         if (res.isSuccess && res.data.length > 0) {
  //           //for exclude the column
  //           const excludedColumns = ['fk_LocID','isMetro', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp','fk_locId',	'fk_InsuserId',	'fk_updUserId','isCActive','fk_stateid',	'pk_stateid'];
  //     //rename the column
  //           const columnMappings: Record<string, string> = {
  //             SubDepartment: 'description',
  //             activeAlias:'activeAlias',
              
  //           };
      
  //           const filteredData = res.data.map((item: Record<string, any>) => {
  //             return Object.keys(item)
  //               .filter(key => !excludedColumns.includes(key))
  //               .reduce((obj: Record<string, any>, key: string) => {
  //                 obj[columnMappings[key] || key] = item[key];
  //                 return obj;
  //               }, {});
  //           });
      
  //           const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  //           const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //           XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
      
  //           const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //           const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
  //           // **Direct Download (Without FileSaver)**
  //           const fileName = 'SubDepartmentList.xlsx';
  //           const link = document.createElement('a');
  //           link.href = URL.createObjectURL(data);
  //           link.setAttribute('download', fileName);
  //           document.body.appendChild(link);
  //           link.click();
  //           document.body.removeChild(link);
  //         } else {
  //           this.toastrService.warning('No data available to export');
  //         }
  //       });
  //     }

}


