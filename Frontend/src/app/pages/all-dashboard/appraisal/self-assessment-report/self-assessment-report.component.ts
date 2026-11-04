import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { appraisalService } from '../appraisal.service';
@Component({
  selector: 'app-self-assessment-report',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgxPaginationModule],

  templateUrl: './self-assessment-report.component.html',
  styleUrl: './self-assessment-report.component.scss'
})
export class SelfAssessmentReportComponent {

  ExportExcel!: FormGroup;
  searchText: string = "";
  selfAssessmentList: any[] = []
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  // 👇 Add this variable to track first load
  private isFirstLoad: boolean = true;


  tableHeaders: string[] = []

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private httpService: appraisalService,
    private ngxUILoaderService: NgxUiLoaderService,
  ) { }
  ngOnInit() {
    this.ExportExcel = this.fb.group({
      searchTerm: ['']
    });

    this.GetAllList();

  }



  restfrom() {
    this.selfAssessmentList = [];
  }
  // Handle filter updates from common search
  handleFilters(filters: any) {

    this.ExportExcel.patchValue(filters);
  }




  filteredData() {
    if (!this.searchText) return this.selfAssessmentList;

    const searchTextLower = this.searchText.toLowerCase();

    const stripHtml = (html: string | null | undefined): string =>
      html?.replace(/<[^>]+>/g, '').toLowerCase() || '';

    return this.selfAssessmentList.filter(res =>

      res.SrNo?.toString().toLowerCase().includes(searchTextLower) ||
    res.Status?.toLowerCase().includes(searchTextLower) ||
    res.Period?.toLowerCase().includes(searchTextLower) ||
    res.EmpCode?.toLowerCase().includes(searchTextLower) ||
    res.EmpName?.toLowerCase().includes(searchTextLower) ||
    res.Location?.toLowerCase().includes(searchTextLower)


    );
  }





  GetAllList() {

    this.ngxUILoaderService.start();



    const payload = this.ExportExcel.value;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.page = 1; // Reset to first page
    this.isFirstLoad = true;
    this.getSelfAssessment();
  }

  getSelfAssessment() {

    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.getSelfAssessmentReport(this.page - 1, this.pageSize, searchTerm).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.selfAssessmentList = res.data;

this.tableHeaders = Object.keys(res.data[0] ?? {}).filter(
  key => !['krapPeriodId', 'fk_empid', 'KRAId', 'pk_kraassId', 'pk_kraassTrnId'].includes(key)
);

          this.totalItems = res.totalCount;
          // this.toastrService.success(res.message);
          // ✅ Show success toast only once (on first load)
          if (this.isFirstLoad) {
            this.toastrService.success(res.message);
            this.isFirstLoad = false;
          }

        } else {
          this.selfAssessmentList = [];
          this.tableHeaders = [];
          this.totalItems = 0;
          this.toastrService.info(res.message);
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {
        this.toastrService.error('Failed to retrieve employees', error?.message || '');
        this.ngxUILoaderService.stop();
      }
    });
  }
  /// Pagination page change
  onPageChange(pageNumber: number) {
    this.page = pageNumber;
    this.getSelfAssessment(); // or fetch API with updated page number
  }
  //Fro removing Tag
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }


  //DownloadExcel Section

  downloadExcel(): void {
    this.ngxUILoaderService.start();

    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.getSelfAssessmentReport(this.page - 1, 10000, searchTerm).subscribe(res => {
      this.ngxUILoaderService.stop();

      if (res.isSuccess) {
        const data = res.data;

        const filteredData = data.map((item: any) => ({

          SrNo: item.SrNo,
           Status: item.Status,
           Period: item.Period,
          EmpCode: item.EmpCode,
          EmpName: item.EmpName,
          Location: item.Location


        }));

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SelfAssessmentReport');
        XLSX.writeFile(wb, 'SelfAssessmentReport.xlsx');
      }
    });
  }


  onSearchTextChanged() {
    const localFilteredData = this.filteredData();
    if (!this.searchText) {
      //  If search is cleared, fetch fresh records
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue('');
      this.getSelfAssessment();
    } else if (localFilteredData.length === 0) {
      //  If no matching records in current list, reset to page 1 and fetch from API
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue(this.searchText);
      this.getSelfAssessment();
    }
  }


}
