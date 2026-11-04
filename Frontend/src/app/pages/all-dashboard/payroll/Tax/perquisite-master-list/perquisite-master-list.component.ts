import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PerquisiteMasterService } from '../../services/perquisite-master.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-perquisite-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './perquisite-master-list.component.html',
  styleUrl: './perquisite-master-list.component.scss'
})
export class PerquisiteMasterListComponent {

  searchText:string='';
     perquisite: any[] = [];
     Isedit:boolean=false;
     
     pageIndex:number=1;
     pageSize:number=10;
     totalItems :number= 0;
    
   
   constructor(private Service:PerquisiteMasterService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
     
     ngOnInit(): void {
      this. getPerquisiteDetails();
     }
     //for paginatiion
     onPageChange(event: number) {
       this.pageIndex = event;
       this. getPerquisiteDetails();
     }
   
     getPerquisiteDetails(): void {
       this.Service.get_Perquisite(this.pageIndex-1,this.pageSize).subscribe(res => {
           if (res.isSuccess) {
               console.log('Data retrieved successfully:', res.data);
               this.perquisite = res.data;
               this.totalItems = res.totalCount;
               console.log(this.totalItems, 'this is total items retrieved');
           } else {
               console.error('Failed to retrieve data:', res.message);
               alert(res.message);
           }
       });
   }
   
   //for filter the data 
   filteredData() {
    if (!this.searchText) {
      return this.perquisite;
    }
  
    const searchTextLower = this.searchText.toLowerCase();
    return this.perquisite.filter(res =>
      res.description?.toLowerCase().includes(searchTextLower)
     
    );
  }
   //for delete 
    deletePerquisite(pk_perkId: string) {
       if (confirm('Are you sure you want to delete this record?')) {
           this.Service.delete_Perquisite(pk_perkId).subscribe(
               (response: any) => {
                   if (response.isSuccess) {
   
                     this.toastrService.success(response.message || 'Record deleted successfully');
                       //alert('Record deleted successfully');
                       this.getPerquisiteDetails(); // Refresh the list
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
     
   //for update 
     isUpdate(pk_perkId: string){
       this.router.navigate(["/dash/payroll/payrolldashboard/perquisiteMaster",pk_perkId]);
     
     }
      //download excel
       exportToExcel(): void {
         this.Service.DownloadExcel().subscribe(res => {
           if (res.isSuccess && res.data.length > 0) {
             const excludedColumns = ['pk_perkId', 'active','timestamp', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_companyId',];
            const columnMappings: Record<string, string> = {
              description: 'Perquisite Name',
              
     
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
             const fileName = 'PerquisiteMasterList.xlsx';
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
