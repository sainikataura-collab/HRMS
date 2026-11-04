import { Component } from '@angular/core';
import { GenerateLettersService } from '../../HRservices/generate-letters.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-generate-letters-list',
  standalone: true,
  imports: [CommonModule,NgxPaginationModule,ReactiveFormsModule,FormsModule,RouterLink],
  templateUrl: './generate-letters-list.component.html',
  styleUrl: './generate-letters-list.component.scss'
})
export class GenerateLettersListComponent {

  pageIndex:number=1;
    pageSize:number=10;//Default item per page
    totalItems :number= 0;// Default page number
    List:any[]=[];
    searchText:string='';
    // Isedit:boolean=false;
    formatId: number | null = null;
  
    constructor(private Service:GenerateLettersService,private route: ActivatedRoute,private router: Router,private toastrService:ToastrService,public encryptionService:EncryptionService) {}
    
  
    ngOnInit(): void {
      this.getdata();
    }
  
    
    //get all grade
getdata(): void {
  this.Service.getCandidateLetterGrid(this.pageIndex - 1, this.pageSize, this.formatId ||null)
    .subscribe(res => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.List = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        this.toastrService.error(res.message || 'Failed to retrieve data', 'Error');
      }
    },
    error => {
      console.error('API Error:', error);
      this.toastrService.error('Something went wrong while fetching data', 'Error');
    });
}

  
  
  // exportToExcel(): void {
  //   this.Service.get_Grade_Excel().subscribe(res => {
  //     if (res.isSuccess && res.data.length > 0) {
  //       //for exclude the column
  //       const excludedColumns = ['fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];
  // //rename the column
  //       const columnMappings: Record<string, string> = {
  //         pk_classid: 'Class ID',
  //         classname: 'Class Name',
  //         noticePeriod: 'Notice Period'
  //       };
  
  //       const filteredData = res.data.map((item: Record<string, any>) => {
  //         return Object.keys(item)
  //           .filter(key => !excludedColumns.includes(key))
  //           .reduce((obj: Record<string, any>, key: string) => {
  //             obj[columnMappings[key] || key] = item[key];
  //             return obj;
  //           }, {});
  //       });
  
  //       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  //       const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
  
  //       const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  //       // **Direct Download (Without FileSaver)**
  //       const fileName = 'GradeMasterList.xlsx';
  //       const link = document.createElement('a');
  //       link.href = URL.createObjectURL(data);
  //       link.setAttribute('download', fileName);
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     } else {
  //       this.toastrService.warning('No data available to export');
  //     }
  //   });
  // }
  
   
 
  filteredData() {
    if (!this.searchText) {
      return this.List;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.List.filter(list =>
      list.name?.toLowerCase().includes(searchTextLower)
      
    );
  }
  
      // for pagination
      onPageChange(event: number):void {
        this.pageIndex = event;
        this.getdata();
      }
    
  //for delete
  
 delete(pk_trnid: number) {

  if (confirm('Are you sure you want to delete this record?')) {

    this.Service.delete(pk_trnid).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {

          this.toastrService.success(response.message || 'Record deleted successfully');

          this.getdata(); // refresh list
        } else {
          this.toastrService.error(response.message || 'Failed to delete', 'Error');
        }
      },
      error: (error) => {
        console.error('Error deleting record', error);
        this.toastrService.error('Something went wrong while deleting record', 'Error');
      }
    });

  }
}

//  downloadLetter(pk_trnid: number) {
//     this.Service.downloadFormat(pk_trnid).subscribe({
//       next: (response: Blob) => {

//         if (!response) {
//           this.toastrService.error("File not received from server");
//           return;
//         }

//         // Detect PDF or DOCX
//         const fileType = response.type;
//         const extension = fileType.includes('pdf') ? 'pdf' : 'docx';

//         const blob = new Blob([response], { type: fileType });
//         const url = window.URL.createObjectURL(blob);

//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `Letter.${extension}`;
//         a.click();

//         window.URL.revokeObjectURL(url);

//         this.toastrService.success("Letter downloaded successfully");
//       },
//       error: (err) => {
//         console.error(err);
//         this.toastrService.error("Failed to download letter");
//       }
//     });
//   }
   

     downloadLetter(pk_trnid: number) {
    this.Service.downloadFormat(pk_trnid).subscribe({
      next: (response: Blob) => {

        if (!response) {
          this.toastrService.error("File not received from server");
          return;
        }

        // Detect PDF or DOCX
        const fileType = response.type;
        const extension = fileType.includes('pdf') ? 'pdf' : 'docx';

        const blob = new Blob([response], { type: fileType });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `Letter.${extension}`;
        a.click();

        window.URL.revokeObjectURL(url);

        this.toastrService.success("Letter downloaded successfully");
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error("Failed to download letter");
      }
    });
  }



// NEW METHOD: Publish letter
  publishLetter(pk_trnid: number) {
    if (confirm('Are you sure you want to publish this letter?')) {
      this.Service.publishLetter(pk_trnid).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Letter published successfully');
            this.getdata(); // Refresh list to update the status
          } else {
            this.toastrService.error(response.message || 'Failed to publish', 'Error');
          }
        },
        error: (error) => {
          console.error('Error publishing letter', error);
          this.toastrService.error('Something went wrong while publishing letter', 'Error');
        }
      });
    }
  }





}
