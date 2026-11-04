import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { SkpAttributeService } from '../../HRservices/skp-attribute.service';
@Component({
  selector: 'app-skpattributemaster-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './skpattributemaster-list.component.html',
  styleUrl: './skpattributemaster-list.component.scss'
})
export class SKPattributemasterListComponent {
  searchText:string='';
       list: any[] = [];
       Isedit:boolean=false;
       
       pageIndex:number=1;
       pageSize:number=10;
       totalItems :number= 0;
      
     
     constructor(private Service:SkpAttributeService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
       
       ngOnInit(): void {
        this. getlist();
       }
       //for paginatiion
       onPageChange(event: number) {
         this.pageIndex = event;
         this. getlist();
       }
     
       getlist(): void {
         this.Service.get_skipAttribute(this.pageIndex-1,this.pageSize).subscribe(res => {
             if (res.isSuccess) {
                 console.log('Data retrieved successfully:', res.data);
                 this.list = res.data;
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
        return this.list;
      }
    
      const searchTextLower = this.searchText.toLowerCase();
      return this.list.filter(res =>
        res.description?.toLowerCase().includes(searchTextLower)
       
      );
    }
     //for delete 
      delete(pk_attributeId: string) {
         if (confirm('Are you sure you want to delete this record?')) {
             this.Service.delete_skipAttribute(pk_attributeId).subscribe(
                 (response: any) => {
                     if (response.isSuccess) {
     
                       this.toastrService.success(response.message || 'Record deleted successfully');
                         //alert('Record deleted successfully');
                         this.getlist(); // Refresh the list
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
       isUpdate(pk_attributeId: string){
       
         this.router.navigate(["/dash/hr/hrdashboard/SKP_Attribute_Mst",pk_attributeId]);
       
       }
        //download excel
         exportToExcel(): void {
           this.Service.DownloadExcel().subscribe(res => {
             if (res.isSuccess && res.data.length > 0) {
               const excludedColumns = ['pk_attributeId','fk_companyId','fk_insUserID','fk_updUserID','isActive','fk_locid','fk_userid','fk_insDateID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_companyId',];
              const columnMappings: Record<string, string> = {
                description: 'Name',
                orderNo:'Order NUmber',
                isActiveAlias:'Active'
                
             
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
               const fileName = 'Skip Attributelist.xlsx';
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
