import { Component, inject } from '@angular/core';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { FormsModule,  } from '@angular/forms';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-training-need-identification-list',
  standalone: true,
   imports: [CommonModule,RouterLink,NgxPaginationModule,FormsModule],

  templateUrl: './training-need-identification-list.component.html',
  styleUrl: './training-need-identification-list.component.scss'
})
export class TrainingNeedIdentificationListComponent {
 ngxUILoaderService = inject(NgxUiLoaderService);
searchText:string='';
 programData: any[] = [];
  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
  
  Isedit:boolean=false;
  
  constructor(private Service:ProgramService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,
    public encryptionService:EncryptionService,private encriptService:EncryptionService) {}
 

  ngOnInit(): void {

  this.getList();
  
  }


  onPageChange(event: number):void {
    this.pageIndex = event;
    this.getList();
  }

 // 🔹 Fetch List with Filters + Pagination
getList(): void {
     this.ngxUILoaderService.start(); // Start loader before API call

      this.Service.getTNI_list(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
               this.ngxUILoaderService.stop(); // Start loader before API call

            this.programData = res.data;
            this.totalItems = res.totalCount;
        } else {
               this.ngxUILoaderService.stop(); // Start loader before API call

            console.error('Failed to retrieve data:', res.message);
        
        }
    });
}
 
filteredData() {
    if (!this.searchText) {
      return this.programData;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.programData.filter(program =>
      program.description?.toLowerCase().includes(searchTextLower)
    );
  }

//   delete(pk_programId: number){
//     debugger
//     if (confirm('Are you sure you want to delete this record?')) {
//         this.Service.delete_Program(pk_programId).subscribe(
//             (response: any) => {
//                 if (response.isSuccess) {

//                   this.toastrService.success(response.message || 'Record deleted successfully');

//                     //alert('Record deleted successfully');
//                     this.getList(); // Refresh the list
//                 } else {
//                   this.toastrService.error(response.message, 'Error');
//                 }
//             },
//             (errorMessage) => {
//                 console.error('Error deleting record', errorMessage);
//                 this.toastrService.error(errorMessage, 'Error');
               
//             }
//         );
//     }
// }


isUpdate(programid: number){
  // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(programid.toString());
  this.router.navigate(["/dash/training/trainingdashboard/program_master", encryptedId]);

}



  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['active','remarks','pk_programId'];

        const columnMappings: Record<string, string> = {
        
          description: 'Program',
          isactive: 'Active',
         
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
        const fileName = 'Program_List.xlsx';
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


//  openCalendarView(item: any) {
//   this.router.navigate(['/dash/emp-training/emp-trainingdashboard/TNI_View_Form_for_Employee'],
//      {
//       queryParams:
//       { 
//         tniId: item.pk_TNIId, 
//         programId: item.fk_programId, 
//         subProgramId: item.fk_subprogramId 
//       }
//   });

openCalendarView(item: any) {

   const encryptedTniId = this.encriptService.encryptText(item.pk_TNIId.toString());
  const encryptedProgramId = this.encriptService.encryptText(item.fk_programId.toString());
  const encryptedSubProgramId = this.encriptService.encryptText(item.fk_subprogramId.toString());

  this.router.navigate(
    ['/dash/emp-training/emp-trainingdashboard/TNI_View_Form_for_Employee'],
    {
      queryParams: {
        tniId: encryptedTniId,
        programId: encryptedProgramId,
        subProgramId: encryptedSubProgramId
      }
    }
  );
}

}     


