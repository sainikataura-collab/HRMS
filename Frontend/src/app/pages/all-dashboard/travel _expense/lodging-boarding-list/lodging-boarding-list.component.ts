import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { LodgingBoardingService } from '../TravelService/lodging-boarding.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-lodging-boarding-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './lodging-boarding-list.component.html',
  styleUrl: './lodging-boarding-list.component.scss'
})
export class LodgingBoardingListComponent {

  searchText:string='';
       list: any[] = [];
       Isedit:boolean=false;
       
       pageIndex:number=1;
       pageSize:number=10;
       totalItems :number= 0;
      
     
     constructor(private Service:LodgingBoardingService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryption:EncryptionService) {}
       
       ngOnInit(): void {
        this.getlist();
       }
       //for paginatiion
       onPageChange(event: number) {
         this.pageIndex = event;
         this. getlist();
       }
     
       getlist(): void {
         this.Service.get_lodging_Boarding().subscribe(res => {
             if (res.isSuccess) {
                 console.log('Data retrieved successfully:', res.data);
                 this.list = res.data;
                 this.totalItems = res.totalCount;
                 console.log(this.totalItems, 'this is total items retrieved');
             } else {
                   this.toastrService.info(res.message);
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
        res.classname?.toLowerCase().includes(searchTextLower)
       
      );
    }
     //for delete 
      delete(pk_lodgingboardingId: number) {
         if (confirm('Are you sure you want to delete this record?')) {
             this.Service.delete_lodging_Boarding(pk_lodgingboardingId).subscribe(
                 (response: any) => {
                  
                     if (response.isSuccess) {
                        this.getlist(); // Refresh the list
                       this.toastrService.success(response.message || 'Record deleted successfully');
                         //alert('Record deleted successfully');
                     
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
       isUpdate(pk_lodgingboardingId: number){
        const encryptedId = this.encryption.encryptText(pk_lodgingboardingId.toString());
         this.router.navigate(["/dash/travel_expense/travel_expensedashboard/lodging_Boarding",encryptedId]);
       
       }
        //download excel
         exportToExcel(): void {
           this.Service.DownloadExcel().subscribe(res => {
             if (res.isSuccess && res.data.length > 0) {
               const excludedColumns = ['fk_userid','fk_locid','fk_classid','fk_classTvlId', 'fk_updUserID','timestamp', 'fk_insDateID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_companyId','pk_lodgingboardingId',];
              const columnMappings: Record<string, string> = {
                grade: 'Grade',
                classname:'Class',
                lodgingboarding:'Lodging Boarding',
                fixedFda:'Fixed FDA',
                fixedLta:'Fixed LTA',
                effectivedate:'Effective Date',
                isActive:'Is Active',
                
             
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
               const fileName = 'lodging boarding list.xlsx';
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
