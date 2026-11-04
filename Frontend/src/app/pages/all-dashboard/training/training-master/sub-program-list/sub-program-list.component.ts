import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ProgramService } from '../../services/program.service';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sub-program-list',
  standalone: true,
   imports: [CommonModule,RouterLink,NgxPaginationModule,FormsModule],
 
  templateUrl: './sub-program-list.component.html',
  styleUrl: './sub-program-list.component.scss'
})
export class SubProgramListComponent {

  searchText:string='';
 programData: any[] = [];

  pageIndex:number=1;
  pageSize:number=10;
  
  totalItems :number= 0;
  
  Isedit:boolean=false;
  
  constructor(private Service:ProgramService,private toastrService:ToastrService,private route: ActivatedRoute,private router: Router,public encryptionService:EncryptionService) {}
 
  ngOnInit(): void {

  this.getprograms();
  
  }


  onPageChange(event: number):void {
    this.pageIndex = event;
    this.getprograms();
  }


  
getprograms(): void {
    this.Service.get_subprogram(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.programData = res.data;
            this.totalItems = res.totalCount;
        } else {
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
      program.subProgramName?.toLowerCase().includes(searchTextLower) ||
      program.program?.toLowerCase().includes(searchTextLower) 

    );
  }





  delete(pk_subprogramId: number){
   debugger
    if (confirm('Are you sure you want to delete this record?')) {
      
        this.Service.delete_Subprogram(pk_subprogramId).subscribe(
            (response: any) => {
                if (response.isSuccess) {

                  this.toastrService.success(response.message || 'Record deleted successfully');

                    //alert('Record deleted successfully');
                    this.getprograms(); // Refresh the list
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

isUpdate(programid: number){
  // console.log(addressId);
    const encryptedId = this.encryptionService.encryptText(programid.toString());
  this.router.navigate(["/dash/training/trainingdashboard/subprogram_master", encryptedId]);

}



  exportToExcel(): void {
    this.Service.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['active','remarks','pk_programId','pk_subProgramId'];

        const columnMappings: Record<string, string> = {
        
          subProgramName: 'Sub Program',
          isActive: 'Active',
         
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
        const fileName = 'Sub_Program_List.xlsx';
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

