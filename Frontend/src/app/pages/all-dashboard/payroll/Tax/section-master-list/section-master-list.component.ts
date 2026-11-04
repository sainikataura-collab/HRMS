import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SectionMasterService } from '../../services/section-master.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-section-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './section-master-list.component.html',
  styleUrl: './section-master-list.component.scss'
})
export class SectionMasterListComponent {
 searchText:string='';
   sections: any[] = [];
   Isedit:boolean=false;
   
   pageIndex:number=1;
   pageSize:number=10;
   totalItems :number= 0;
  
 
 constructor(private Service:SectionMasterService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
   
   ngOnInit(): void {
    this. getSectionDetails();
   }
   //for paginatiion
   onPageChange(event: number) {
     this.pageIndex = event;
     this. getSectionDetails();
   }
 
   getSectionDetails(): void {
     this.Service.get_section(this.pageIndex-1,this.pageSize).subscribe(res => {
         if (res.isSuccess) {
             console.log('Data retrieved successfully:', res.data);
             this.sections = res.data;
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
     return this.sections;
   }
 
   const searchTextLower = this.searchText.toLowerCase();
   return this.sections.filter(res =>
     res.description?.toLowerCase().includes(searchTextLower) ||
     res.code?.toLowerCase().includes(searchTextLower)
 
   );
 }
 //for delete 
  deleteSection(pk_sectionId: string) {
     if (confirm('Are you sure you want to delete this record?')) {
         this.Service.delete_section(pk_sectionId).subscribe(
             (response: any) => {
                 if (response.isSuccess) {
 
                   this.toastrService.success(response.message || 'Record deleted successfully');
                     //alert('Record deleted successfully');
                     this.getSectionDetails(); // Refresh the list
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
   isUpdate(pk_sectionId: string){
     this.router.navigate(["/dash/payroll/payrolldashboard/sectionMaster",pk_sectionId]);
   
   }
    //download excel
     exportToExcel(): void {
       this.Service.DownloadExcel().subscribe(res => {
         if (res.isSuccess && res.data.length > 0) {
           const excludedColumns = ['pk_secid', 'partof', 'active', 'isNPS', 'timestamp', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_companyId',];
          const columnMappings: Record<string, string> = {
          description: 'Description',
            code: 'Code',
            maxlimit:'Max Limit',
            partofStatus:'Part',
            activeStatus:'Active',
   
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
           const fileName = 'SectionMasterList.xlsx';
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
