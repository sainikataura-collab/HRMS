import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

import * as XLSX from 'xlsx';
import { GradeMasterService } from '../../../services/grade-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
//import saveAs from 'file-saver';

@Component({
  selector: 'app-grade-master-list',
  standalone: true,
  imports: [NgxPaginationModule,RouterLink,CommonModule,FormsModule],
  templateUrl: './grade-master-list.component.html',
  styleUrl: './grade-master-list.component.scss'
})
export class GradeMasterListComponent {
  pageIndex:number=1;
  pageSize:number=10;//Default item per page
  totalItems :number= 0;// Default page number
  GradeList:any[]=[];
  searchText:string='';
  Isedit:boolean=false;

  constructor(private GradeService:GradeMasterService,private route: ActivatedRoute,private router: Router,private toastrService:ToastrService,public encryptionService:EncryptionService) {}
  

  ngOnInit(): void {
    this.getGrade();
  }

  encodeID(id: any): string {
    return btoa(id.toString()); // Convert to string before encoding
  }
  
  decodeID(id: string): string {
    return atob(id);
  }
  //get all grade
  getGrade(): void {
    this.GradeService.get_Grade(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            console.log('Data retrieved successfully:', res.data);
            this.GradeList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
            alert(res.message);
        }
    });
}


exportToExcel(): void {
  this.GradeService.get_Grade_Excel().subscribe(res => {
    if (res.isSuccess && res.data.length > 0) {
      //for exclude the column
      const excludedColumns = ['fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];
//rename the column
      const columnMappings: Record<string, string> = {
        pk_classid: 'Class ID',
        classname: 'Class Name',
        noticePeriod: 'Notice Period'
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
      const fileName = 'GradeMasterList.xlsx';
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

  // // **Excel Download Function**
  // exportToExcel(): void {
  //   this.GradeService.get_Grade_Excel().subscribe(res => {
  //     if (res.isSuccess && res.data.length > 0) {

  //       const excludedColumns = ['fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];

  //       // **Define Column Name Mapping (Only for selected fields)**
  //     const columnMappings: Record<string, string> = {
  //       pk_classid: 'Class ID',
  //      // classname: 'Class Name',
  //      // noticePeriod: 'Notice Period'
  //     };

  //     // **Filter and Rename Columns Dynamically**
  //     const filteredData = res.data.map((item: Record<string, any>) => {
  //       return Object.keys(item)
  //         .filter((key: string) => !excludedColumns.includes(key)) // Exclude unwanted columns
  //         .reduce((obj: Record<string, any>, key: string) => {
  //           obj[columnMappings[key] || key] = item[key]; // Use new name if mapped, else keep original
  //           return obj;
  //         }, {} as Record<string, any>);
  //     });
     

  //       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
  //       const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

  //       const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  //       saveAs(data, 'GradeMasterList.xlsx');
  //     } else {
  //       this.toastrService.warning('No data available to export');
  //     }
  //   });
  // }
//for search
filteredData() {
  if (!this.searchText) {
    return this.GradeList;
  }
  const searchTextLower = this.searchText.toLowerCase();
  return this.GradeList.filter(grade =>
    grade.classname?.toLowerCase().includes(searchTextLower)
    
  );
}

    // for pagination
    onPageChange(event: number):void {
      this.pageIndex = event;
      this.getGrade();
    }
  
//for delete

deleteGrade(gradeId :string) {

  if (confirm('Are you sure you want to delete this record?')) {
      this.GradeService.delete_Grade(gradeId ).subscribe(
        (response: any) => {
          if (response.isSuccess) {

            this.toastrService.success(response.message || 'Record deleted successfully');

              //alert('Record deleted successfully');
              this.getGrade(); // Refresh the list
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
//for update
isUpdate(gradeId: string){
  debugger
   // console.log(addressId);
this.router.navigate(["/dash/user/userdashboard/gradeMaster",gradeId]);

}
}
