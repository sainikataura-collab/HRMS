import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-emp-gazetted-holiday',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule, NgSelectComponent],
  templateUrl: './emp-gazetted-holiday.component.html',
  styleUrl: './emp-gazetted-holiday.component.scss'
})

export class EmpGazettedHolidayComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  yearid!: number|null;
  fk_yearid: { label: string, value: string }[] = [];
  searchText: string = '';
  holydayGazettedList: any[] = [];
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
        this.get_HolidayGazetted(this.yearid);
      }
    });

  }




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
   this.get_HolidayGazetted(this.yearid);  // Year change hote hi data fetch karein
 }


  get_HolidayGazetted(yearid: number | null): void {
debugger
    const yearIdToSend = yearid ?? null;
    this.leaveReqService.get_HolidayGazetted(yearIdToSend).subscribe(
      res => {
        if (res?.isSuccess) {  // Ensure `res` is not undefined
          this.holydayGazettedList = res.data;
         // this.totalItems = res.totalCount;
          console.log('Total Items:', this.totalItems);
        } else {
          this.holydayGazettedList = [];
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
    this.get_HolidayGazetted; // Fetch data for the selected page
  }






  
filteredData() {
  if (!this.searchText) {
    return this.holydayGazettedList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.holydayGazettedList.filter(item =>
    item.dated?.toLowerCase().includes(searchTextLower) ||
    item.holidaytype?.toLowerCase().includes(searchTextLower) ||
    item.day_Name?.toLowerCase().includes(searchTextLower)
  );
}


}