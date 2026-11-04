import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { LeavereqService } from '../Service/leavereq.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-restricted-holidays',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule, NgSelectComponent],
  templateUrl: './restricted-holidays.component.html',
  styleUrl: './restricted-holidays.component.scss'
})
export class RestrictedHolidaysComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
 yearid!: number|null;
  fk_yearid: { label: string, value: string }[] = [];

  searchText: string = '';
  holydayRestrictedList: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
     private leaveReqService: LeavereqService, private fb: FormBuilder, 
     public router: Router, private toastrService: ToastrService, 
     public encryptionService: EncryptionService,private route: ActivatedRoute
) { }
  ngOnInit(): void {
  //  this.get_HolidayRestricted(this.yearid);

    this.getYearList('Year');
    this.route.queryParams.subscribe(params => {
      if (params['yearid']) {
        this.yearid = params['yearid'];
        this.get_HolidayRestricted(this.yearid);
      }
    });

  }

//    onYearChange(fk_yearid: number | null) {
//    this.fk_yearid = fk_yearid;  // Selected Year ko store karein
//    this.get_HolidaysMaster(fk_yearid);  // Year change hote hi data fetch karein
//  }



  getYearList(fieldName: string) {
    this.leaveReqService.getCommonDropdown(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data=res.data.slice(1);
          this.fk_yearid = res.data.map((leaveType: any) => ({
            name: leaveType.name,
            value: leaveType.value
          }));
        } else {
          this.toastrService.error("Failed to load EmpNature list.");
        }
      },
      error: (err) => {
        console.error("Error fetching EmpNature list:", err);
        this.toastrService.error("Error fetching EmpNature.");

      }
    });
  }

 
    onYearChange(yearid: number | null) {
   this.yearid = yearid;  // Selected Year ko store karein
   this.get_HolidayRestricted(this.yearid);  // Year change hote hi data fetch karein
 }


  get_HolidayRestricted(yearid: number | null): void {
debugger
    const yearIdToSend = yearid ?? null;
    this.leaveReqService.get_HolidayRestricted(yearIdToSend).subscribe(
      res => {
        if (res?.isSuccess) {  // Ensure `res` is not undefined
          this.holydayRestrictedList = res.data;
         // this.totalItems = res.totalCount;
          console.log('Total Items:', this.totalItems);
        } else {
          this.holydayRestrictedList = [];
          this.totalItems = 0;
        }
      },
      error => {
        console.error('HTTP Error:', error); // 🔍 Check if HTTP request fails
      }
    );
  }




  onPageChange(event: number): void {
    this.page = event; // Update current page
    this.get_HolidayRestricted; // Fetch data for the selected page
  }






  
filteredData() {
  if (!this.searchText) {
    return this.holydayRestrictedList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.holydayRestrictedList.filter(item =>
    item.dated?.toLowerCase().includes(searchTextLower) ||
    item.holidaytype?.toLowerCase().includes(searchTextLower) ||
    item.day_Name?.toLowerCase().includes(searchTextLower)
  );
}


//  exportToExcel(): void {
//   this.leaveReqService.DownloadExcel().subscribe(res => {
//     if (res.isSuccess && res.data.length > 0) {
//       const excludedColumns = ['fk_yearid','','isNH','fk_locid','datedString','fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'orderno'];

//       const columnMappings: Record<string, string> = {
//         locname: 'Location',
//         holidaytype: 'Holiday Name',
//         dated: 'Holiday Date',
//         isNHName: 'Is NH.'

       
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

//       // Direct Download (Without FileSaver)
//       const fileName = 'Restricted Holydays List.xlsx';
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(data);
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } else {
//       this.toastrService.warning('No data available to export');
//     }
//       });
// }

}
