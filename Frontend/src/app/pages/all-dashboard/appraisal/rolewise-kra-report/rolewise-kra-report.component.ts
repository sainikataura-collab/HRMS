import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { NgxUiLoaderService } from 'ngx-ui-loader';

import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { appraisalService } from '../appraisal.service';
@Component({
  selector: 'app-rolewise-kra-report',
  standalone: true,
   imports: [FormsModule,ReactiveFormsModule,CommonModule,NgSelectComponent,NgxPaginationModule],
  templateUrl: './rolewise-kra-report.component.html',
  styleUrl: './rolewise-kra-report.component.scss'
})
export class RolewiseKraReportComponent  {

   ExportExcel!:FormGroup;
    searchText:string="";
    submitted=false;
    showError=false;
    showEmployeeList: boolean = false;
    EmployeeList:any[]=[]
   RoleName=[]
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  // 👇 Add this variable to track first load
private isFirstLoad: boolean = true;


    tableHeaders:string[]=[]

    constructor(
      private fb: FormBuilder,
      private  toastrService: ToastrService,
      private router: Router,
      private httpService: appraisalService,
       private ngxUILoaderService:NgxUiLoaderService,
     ) {}
    ngOnInit() {
     this.ExportExcel = this.fb.group({
  role_id: [null],
  searchTerm: ['']
});

      this.getemployeeList();

    }

    getemployeeList() {
      this.httpService.get_DropdownList('RoleName').subscribe({
        next: (res) => {
          res.data = res.data.slice(1);
          this.RoleName = res.data

        }
      })
    }


    restfrom(){
      this.EmployeeList=[];
    }
      // Handle filter updates from common search
      handleFilters(filters: any) {

        this.ExportExcel.patchValue(filters);
      }




filteredData() {
  if (!this.searchText) return this.EmployeeList;

  const searchTextLower = this.searchText.toLowerCase();
  return this.EmployeeList.filter(res =>
    res.RoleName?.toLowerCase().includes(searchTextLower) ||
    res.TargetValue?.toLowerCase().includes(searchTextLower)||
     res.KPA?.toLowerCase().includes(searchTextLower)||
       res.KPI?.toLowerCase().includes(searchTextLower)||
         res.KRA?.toLowerCase().includes(searchTextLower)||
         res.Weightage?.toLowerCase().includes(searchTextLower)

  );
}



 OnView() {
    this.submitted = true;
    this.ngxUILoaderService.start();

    if (this.ExportExcel.invalid) {
      this.showError = true;
      this.ngxUILoaderService.stop();
      return;
    }

    const payload = this.ExportExcel.value;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.page = 1; // Reset to first page
     this.isFirstLoad = true;
    this.getKRAData();
  }

  getKRAData() {
    const role_id = this.ExportExcel.get('role_id')?.value || null;
    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.getRolewiseKRAReport(role_id, this.page - 1, this.pageSize, searchTerm).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data;
          this.tableHeaders = Object.keys(res.data[0] ?? {});
          this.showEmployeeList = true;
          this.totalItems = res.totalCount;
          // this.toastrService.success(res.message);
            // ✅ Show success toast only once (on first load)
       if (this.isFirstLoad) {
            this.toastrService.success(res.message);
            this.isFirstLoad = false;
          }

        } else {
          this.EmployeeList = [];
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

onPageChange(pageNumber: number) {
  this.page = pageNumber;
   this.getKRAData(); // or fetch API with updated page number
}
//Fro removing Tag
 stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }


//DownloadExcel Section

downloadExcel(): void {

      const role_id = this.ExportExcel.get('role_id')?.value || '';
       const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;
      this.httpService.getRolewiseKRAReport(role_id, this.page - 1,10000, searchTerm).subscribe(res => {
        if (res.isSuccess) {
          const data = res.data;

          const filteredData = data.map((item: any) => ({
            SrNo:item.SrNo,
            RoleName: item.RoleName,
            KPA: this.stripHtmlTags(item.KPA),
            KRA:this.stripHtmlTags(item.KRA),
            KPI:this.stripHtmlTags(item.KPI),
            TargetValue:this.stripHtmlTags(item.TargetValue),
            Weightage: this.stripHtmlTags(item.Weightage),

          }));

          const ws = XLSX.utils.json_to_sheet(filteredData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'RolewiseRpt');
          XLSX.writeFile(wb, 'RolewiseRpt.xlsx');
        }
      });
    }


onSearchTextChanged() {
  const localFilteredData = this.filteredData();
  if (!this.searchText) {
    //  If search is cleared, fetch fresh records
    this.page = 1;
    this.ExportExcel.get('searchTerm')?.setValue('');
    this.getKRAData();
  } else if (localFilteredData.length === 0) {
    //  If no matching records in current list, reset to page 1 and fetch from API
    this.page = 1;
    this.ExportExcel.get('searchTerm')?.setValue(this.searchText);
    this.getKRAData();
  }
}


}
