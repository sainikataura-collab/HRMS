
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RouterLink, Router } from '@angular/router';
import { PrograssionDetailService } from '../../performance/Service/prograssion-detail.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-rent-details-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './rent-details-list.component.html',
  styleUrl: './rent-details-list.component.scss'
})
export class RentDetailsListComponent {

  searchText: string = "";
  rentDetailsList: any[] = [];
  ExportExcel!: FormGroup;
  page: number = 1;
  pageSize: number = 2;
  totalItems: number = 0;
  isAdded: boolean = true;
  //  Add this variable to track first load
  private isFirstLoad: boolean = true;


  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpService: PrograssionDetailService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.ExportExcel = this.fb.group({
      searchTerm: ['']
    });

    this.GetAllList();

    this.loadRentDetailsData();
    //this.getAttendanceData();
  }



  restfrom() {
    this.rentDetailsList = [];
  }


  filteredData() {
  if (!this.searchText) return this.rentDetailsList;

  const searchTextLower = this.searchText.toLowerCase();

  return this.rentDetailsList.filter(res =>
   
    res.dated?.toLowerCase().includes(searchTextLower) ||
    res.finDescription?.toLowerCase().includes(searchTextLower) ||
    res.totalAmount?.toString().toLowerCase().includes(searchTextLower) ||
    res.docsub_status?.toLowerCase().includes(searchTextLower) 
  );
}



  GetAllList() {

    this.loader.start();



    const payload = this.ExportExcel.value;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.page = 1; // Reset to first page
    this.isFirstLoad = true;
    this.getAttendanceData();
  }



  // 🔹 API CALL (same pattern as KRA)
  getAttendanceData() {
    this.loader.start();

    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.getALL(this.page - 1, this.pageSize, searchTerm).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.rentDetailsList = res.data || [];
          this.totalItems = res.totalCount || 0;

          if (this.isFirstLoad) {
            this.toastr.success(res.message);
            this.isFirstLoad = false;
          }
        } else {
          this.rentDetailsList = [];
          this.totalItems = 0;
          this.toastr.info(res.message);
        }
        this.loader.stop();
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load rent details');
      }
    });
  }


  loadRentDetailsData(): void {
      this.httpService.getRentDetailsById('').subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
  
           
            const master = res.data.masterData;
        
            /* ---------------- MASTER DATA ---------------- */
            if (master) {

              this.isAdded = false;
            }
  
            
          } 
        },
       
      });
    }

  /// Pagination page change
  onPageChange(pageNumber: number) {
    this.page = pageNumber;
    this.getAttendanceData(); // or fetch API with updated page number
  }



  // 🔹 SEARCH HANDLER (KRA LOGIC)
  onSearchTextChanged() {
    const localFilteredData = this.filteredData();
    if (!this.searchText) {
      // Search cleared → reload fresh data
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue('');
      this.getAttendanceData();
    }
    else if (localFilteredData.length === 0) {
      // No local match → call API
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue(this.searchText);
      this.getAttendanceData();
    }
  }



  // 🔹 FILE DOWNLOAD
 // for download the image
  // for download the image
  download(filename: string) {
    this.httpService.getImage(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Set the filename for download
        a.click();
        window.URL.revokeObjectURL(url); // Clean up
      },
      error: (err) => {

      }
    });
  }
  // 🔹 VIEW RENT DETAILS
  viewRent(pk_shortLeaveId: number) {
    this.router.navigate([
      '/dash/reimbursement/reimbursementdashboard/RentDetails',
      pk_shortLeaveId
    ]);
  }
}
