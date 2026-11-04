import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination'; 
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { RestrictedService } from '../../payroll/services/restricted.service';
@Component({
  selector: 'app-all-restricted-holiday',
  standalone: true,
  imports: [NgxPaginationModule,CommonModule,RouterLink,FormsModule,NgSelectModule],
  templateUrl: './all-restricted-holiday.component.html',
  styleUrl: './all-restricted-holiday.component.scss'
})
export class AllRestrictedHolidayComponent {

  ngxUILoaderService = inject(NgxUiLoaderService);
   searchText: string = '';
   holidayMasterList: any[] = [];
   page: number = 1;
   fk_yearid!: number;
   pageSize: number = 10;
   years: { label: string, value: string }[]  = []; 
   

   totalItems: number = 0;
   constructor(private reHolidaysMasterService:RestrictedService,  public router: Router,private toastrService: ToastrService,private route: ActivatedRoute,public encryptionService:EncryptionService) { }
   ngOnInit(): void {
     this.get_resHolidaysMaster(this.fk_yearid);
     this.getYearList('Year');
     this.route.queryParams.subscribe(params => {
      if (params['fk_yearid']) {
        this.fk_yearid = params['fk_yearid'];
        this.get_resHolidaysMaster(this.fk_yearid);
      }
    });
    

   }

   getYearList(fieldName: string) {
   
    // this.ngxUILoaderService.start(); // Start loader before API call
  
    this.reHolidaysMasterService.getYear(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.years = res.data.map((fk_yearid: any) => ({
                    name: fk_yearid.name,
                    value: fk_yearid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
            this.ngxUILoaderService.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");
            
        }
    });
  }
   onYearChange(fk_yearid: number) {
     this.fk_yearid = fk_yearid;  // Selected Year ko store karein
     this.get_resHolidaysMaster(fk_yearid);  // Year change hote hi data fetch karein
   }

   get_resHolidaysMaster(fk_yearid: number | null): void {
    const yearIdToSend = fk_yearid ?? null; 
        this.reHolidaysMasterService.get_ResHolidayMaster(yearIdToSend, this.page - 1, this.pageSize).subscribe(
      res => {
        if (res?.isSuccess) {  // Ensure `res` is not undefined
          this.holidayMasterList = res.data;
          this.totalItems = res.totalCount;

        } else {
          this.holidayMasterList = [];
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
    this.get_resHolidaysMaster(this.fk_yearid); // Fetch data for the selected page
  }

  

  filteredData() {
    if (!this.searchText) {
      return this.holidayMasterList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.holidayMasterList.filter(holidayMasterList =>
      (holidayMasterList.fk_locid?.toLowerCase().includes(searchTextLower)) ||  
      (holidayMasterList.holidaytype?.toLowerCase().includes(searchTextLower))||
      (holidayMasterList.dated?.toLowerCase().includes(searchTextLower))  

    );
  }


   
   isUpdate(pk_holidayid: string) {
     // console.log(addressId);
     this.router.navigateByUrl("/dash/adminLeave/adminLeavedashboard/RestrictedMaster/" + pk_holidayid);
   }
     
  deleteHoliday(pk_holidayid: string): void {
  
    if (confirm('Are you sure you want to delete this nature record?')) {
      this.reHolidaysMasterService.delete_ResHolidayMaster(pk_holidayid).subscribe({
        next: (response) => {
          console.log("API Response:", response);
  
          const success = response?.modelResponse?.isSuccess || response?.isSuccess;
  
          if (success) {
            this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");
            
            this.get_resHolidaysMaster(this.fk_yearid);  // 👈 Corrected
          } else {
            this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
          }
        },
        error: (error) => {
          console.error('Error deleting bank record:', error);
          this.toastrService.error('Failed to delete account.');
        }
      });
    }
  }
  //download excel
  exportToExcel(): void {
    this.reHolidaysMasterService.downloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['fk_yearid', 'fk_locid', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_companyId','datedString','isNH',];
      
        // ,[fk_locid]
        
        
        const columnMappings: Record<string, string> = {
         
          holidaytype: 'Holiday Type',
          dated: 'Date',
          isNHName:'IS NATIONAL',
          locname:'Location Name',
          pk_holidayid:'Holiday ID',

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
        const fileName = 'RestrictedMasterList.xlsx';
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
