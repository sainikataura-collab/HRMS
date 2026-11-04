import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainingInstituteService } from '../services/training-institute.service';

@Component({
  selector: 'app-training-institute-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './training-institute-list.component.html',
  styleUrl: './training-institute-list.component.scss'
})
export class TrainingInstituteListComponent {


   searchText:string='';
           list: any[] = [];
           Isedit:boolean=false;
           
           pageindex:number=1;
           pagesize:number=10;
           totalItems :number= 0;
          
         
         constructor(private Service:TrainingInstituteService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService, private ngxService: NgxUiLoaderService) {}
           
           ngOnInit(): void {
            this. getlist();
           }
           //for paginatiion
           onPageChange(event: number) {
             this.pageindex = event;
             this. getlist();
           }
         
      
         getlist(): void {
  this.ngxService.start(); // 👉 Start the loader

  this.Service.get_TrainingInstitute(this.pageindex - 1, this.pagesize).subscribe(res => {
    if (res.isSuccess) {
     // this.toastrService.success(res.message || 'Data retrieved successfully');
      this.list = res.data;
      this.totalItems = res.totalCount;
    } else {
    //  this.toastrService.info(res.message);
    }

    this.ngxService.stop(); //  Stop the loader on success or failure
  }, error => {
    this.toastrService.error('Something went wrong');
    this.ngxService.stop(); //Stop the loader on error
  });
}

         
         //for filter the data 
         filteredData() {
          if (!this.searchText) {
            return this.list;
          }
        
          const searchTextLower = this.searchText.toLowerCase();
          return this.list.filter(res =>
            res.description?.toLowerCase().includes(searchTextLower)||
             res.type?.toLowerCase().includes(searchTextLower) ||
              res.active?.toLowerCase().includes(searchTextLower)||
               res.remarks?.toLowerCase().includes(searchTextLower)
           
          );
        }
         //for delete 
          delete(pk_instituteId: number) {
             if (confirm('Are you sure you want to delete this record?')) {
                this.ngxService.start();
                 this.Service.delete_TrainingInstitute(pk_instituteId).subscribe(
                     (response: any) => {
                         if (response.isSuccess) {
         
                           this.toastrService.success(response.message || 'Record deleted successfully');
                          
                             this.getlist(); // Refresh the list
                         } 
                         else {
                           this.toastrService.error(response.message, 'Error');
                         }
                          this.ngxService.stop();
                     },
                     (errorMessage) => {
                         console.error('Error deleting record', errorMessage);
                         this.toastrService.error(errorMessage, 'Error');
                         this.ngxService.stop(); 
                     }
                 );
             }
         }
           
         //for update 
           isUpdate(pk_instituteId: number){
            const encryptedId = this.encryption.encryptText(pk_instituteId.toString());
             this.router.navigate(["/dash/training/trainingdashboard/TrainingInstitute",encryptedId]);
           
           }
            //download excel
             exportToExcel(): void {
               this.Service.DownloadExcel().subscribe(res => {
                 if (res.isSuccess && res.data.length > 0) {
                   const excludedColumns = ['pk_instituteId'];
                  const columnMappings: Record<string, string> = {
                    description: 'Institute',
                    type:'Type',
                    active:'Active',
                    remarks:'Remark',
                   
                    				

                    
                 
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
                   const fileName = 'Training Institute list.xlsx';
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
