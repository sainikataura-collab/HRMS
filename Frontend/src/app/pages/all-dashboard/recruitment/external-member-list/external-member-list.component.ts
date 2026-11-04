import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { ExternalMemberService } from '../RecruitServices/external-member.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-external-member-list',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,FormsModule,NgxPaginationModule],
  templateUrl: './external-member-list.component.html',
  styleUrl: './external-member-list.component.scss'
})
export class ExternalMemberListComponent {

    pageIndex:number=1;
     pageSize:number=10;
     totalItems :number= 0;
    
       searchText: string = '';
       list: any[] = [];
       sedit:boolean=false;
     
     constructor(private service:ExternalMemberService, private fb:FormBuilder, public router:Router,private toastrService:ToastrService,private cdRef:ChangeDetectorRef,public encryption:EncryptionService) { }
        ngOnInit(): void {
          this. getlist();
         }
         //for paginatiion
         onPageChange(event: number) {
           this.pageIndex = event;
           this. getlist();
         }
       
         getlist(): void {
           this.service.get_externalMember(this.pageIndex-1,this.pageSize).subscribe(res => {
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
       res.member_name?.toLowerCase().includes(searchTextLower)||
       res.designation?.toLowerCase().includes(searchTextLower)||
       res.designation?.toLowerCase().includes(searchTextLower)

      
     );
    }
       //for delete 
       delete(pk_exMemberId: string) {
           if (confirm('Are you sure you want to delete this record?')) {
               this.service.delete_externalMember(pk_exMemberId).subscribe(
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
         isUpdate(pk_exMemberId: string){
            this.router.navigate(["/dash/recruitment/recruitmentdashboard/externalMember",pk_exMemberId]);
         
         }
          //download excel
           exportToExcel(): void {
             this.service.DownloadExcel().subscribe(res => {
               if (res.isSuccess && res.data.length > 0) {
                 const excludedColumns = ['pk_exMemberId','timestamp','fk_LocID','fk_UserID','fk_companyId'];
                const columnMappings: Record<string, string> = {
               
                 member_name:'Name',
                 department:'Department',
                 designation:'Designation',
               
       
                 
         
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
                 const fileName = 'External Member list.xlsx';
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
