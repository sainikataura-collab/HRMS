import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';// adjust path as per your project
import { FNFserviceService } from '../Service/fnfservice.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-fnf-settlement-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule,CommonSearchComponent,NgxPaginationModule],
  templateUrl: './fnf-settlement-list.component.html',
  styleUrl: './fnf-settlement-list.component.scss'
})
export class FnfSettlementListComponent implements OnInit {

  // Grid 1: Pending
  fnfListPending: any[] = [];
  pageIndex1 = 1;
  pageSize1 = 10;
  totalCount1 = 0;
  searchText1 = '';

  // Grid 2: Processed
  fnfListProcessed: any[] = [];
  pageIndex2 = 1;
  pageSize2 = 10;
  totalCount2 = 0;
  searchText2 = '';

  // Values coming from the common filter bar (app-common-search)
  commonFilters: any = {};

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private fnfService: FNFserviceService,
        private Loader:NgxUiLoaderService,
        public encryptionService:EncryptionService 
  ) {}

  ngOnInit(): void {
   // this.getFnFList();
  //    this.router.events.pipe(
  //   filter(event => event instanceof NavigationEnd)
  // ).subscribe(() => {
  //   this.getFnFList(); // navigate hone par bhi list refresh
  // });
  }

  // fired by app-common-search whenever the filter bar is applied
  handleFilters(filters: any): void {
    this.commonFilters = filters || {};
    this.pageIndex1 = 1;
    this.pageIndex2 = 1;
    this.getFnFList();
  }

  getFnFList(): void {
     this.Loader.start();
    const requestBody = {
      pageIndex1: this.pageIndex1 - 1,   // API is 0-based
      pageSize1: this.pageSize1,
      pageIndex2: this.pageIndex2 - 1,   // API is 0-based
      pageSize2: this.pageSize2,
      empCode: this.commonFilters.empCode || '',
      empCodeManual: this.commonFilters.empCodeManual || '',
      empName: this.commonFilters.empName || '',
      selectedDepartments: this.commonFilters.selectedDepartments || [],
      selectedDesignation: this.commonFilters.selectedDesignation || '',
      selectedLocations: this.commonFilters.selectedLocations || [],
      selectedNature: this.commonFilters.selectedNature || '',
      selectedCity: this.commonFilters.selectedCity || '',
      sortBy: this.commonFilters.sortBy || 'empcode',
      empStatus: this.commonFilters.empStatus || 'B',
      searchTerm1: this.commonFilters.searchTerm1 || '',
      searchTerm2: this.commonFilters.searchTerm2 || ''
    };

    this.fnfService.getFnfList(requestBody).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          const data = res.data || {};

          this.fnfListPending = data.pendingGrid?.data || [];
          this.totalCount1 = data.pendingGrid?.totalCount || 0;

          this.fnfListProcessed = data.processedGrid?.data || [];
          this.totalCount2 = data.processedGrid?.totalCount || 0;
           this.Loader.stop();
        } else {
          this.fnfListPending = [];
          this.fnfListProcessed = [];
          this.totalCount1 = 0;
          this.totalCount2 = 0;
          this.Loader.stop();
          // this.toastrService.warning(res?.message || 'No records found.');
        }
      },
      error: () => {
        this.Loader.stop();
        this.toastrService.error('Failed to fetch F&F list');
      }
    });
  }

  // local search over the currently loaded page - Pending grid
  filteredPending() {
    if (!this.searchText1 || this.searchText1.trim() === '') {
      return this.fnfListPending;
    }
    const s = this.searchText1.toLowerCase().trim();
    return this.fnfListPending.filter(item => {
      const empCode = item.empcode ? String(item.empcode).toLowerCase() : '';
      const empName = item.empname ? String(item.empname).toLowerCase() : '';
      return empCode.includes(s) || empName.includes(s);
    });
  }

  // local search over the currently loaded page - Processed grid
  filteredProcessed() {
    if (!this.searchText2 || this.searchText2.trim() === '') {
      return this.fnfListProcessed;
    }
    const s = this.searchText2.toLowerCase().trim();
    return this.fnfListProcessed.filter(item => {
      const empCode = item.empcode ? String(item.empcode).toLowerCase() : '';
      const empName = item.empname ? String(item.empname).toLowerCase() : '';
      return empCode.includes(s) || empName.includes(s);
    });
  }

  onPageChange1(event: number): void {
    this.pageIndex1 = event;
    this.getFnFList();
  }

  onPageChange2(event: number): void {
    this.pageIndex2 = event;
    this.getFnFList();
  }

  processFnF(id: string) {
    this.router.navigate([`/dash/exit/exitdashboard/fnf_settlement_form/${id}`]);
  }

  exportToExcel(list: any[], fileNamePrefix: string): void {
    if (list.length > 0) {
      const formattedData = list.map((item: any) => ({
        'Employee Code': item.empCode,
        'Employee Name': item.empName,
        'Department': item.department,
        'Location': item.locname,
        'Date Of Joining': item.dateofjoining,
        'Left Date': item.leftdate
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FnFSettlements');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileName = `${fileNamePrefix}_FnFSettlements.xlsx`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.toastrService.warning('No data available to export');
    }
  }

  onSearchBlurPending(): void {
    if (!this.searchText1 || this.searchText1.trim() === '') {
      if (this.commonFilters.searchTerm1) {
        this.commonFilters.searchTerm1 = '';
        this.pageIndex1 = 1;
        this.getFnFList();
      }
      return;
    }

    const localMatch = this.filteredPending();
    if (localMatch.length > 0 && !this.commonFilters.searchTerm1) return;

    if (this.commonFilters.searchTerm1 !== this.searchText1) {
      this.commonFilters.searchTerm1 = this.searchText1;
      this.pageIndex1 = 1;
      this.getFnFList();
    }
  }

  onSearchBlurProcessed(): void {
    if (!this.searchText2 || this.searchText2.trim() === '') {
      if (this.commonFilters.searchTerm2) {
        this.commonFilters.searchTerm2 = '';
        this.pageIndex2 = 1;
        this.getFnFList();
      }
      return;
    }

    const localMatch = this.filteredProcessed();
    if (localMatch.length > 0 && !this.commonFilters.searchTerm2) return;

    if (this.commonFilters.searchTerm2 !== this.searchText2) {
      this.commonFilters.searchTerm2 = this.searchText2;
      this.pageIndex2 = 1;
      this.getFnFList();
    }
  }

downloadPdf(empId: string, empCode: string): void {
  this.fnfService.downloadPdf(empId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FullAndFinalSettlement_${empCode}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('PDF download failed', err);
      this.toastrService.error('PDF download failed. Please try again.');
    }
  });
}
}