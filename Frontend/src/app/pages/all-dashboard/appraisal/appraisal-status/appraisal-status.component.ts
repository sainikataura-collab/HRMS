declare const html2pdf: any;
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EmpwiseRptService } from '../empwise-rpt.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { appraisalService } from '../appraisal.service';
@Component({
  selector: 'app-appraisal-status',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectComponent, NgxPaginationModule,],
  templateUrl: './appraisal-status.component.html',
  styleUrl: './appraisal-status.component.scss'
})
export class AppraisalStatusComponent {

showStatus: boolean = false;

employeePDFData: any = null;
  ExportExcel!: FormGroup;
  searchText: string = "";
  submitted = false;
  StatusList: any[] = []
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  // 👇 Add this variable to track first load
  private isFirstLoad: boolean = true;


  tableHeaders: string[] = []

  constructor(

    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: appraisalService,
    private ngxUILoaderService: NgxUiLoaderService,
  ) { }
  ngOnInit() {
    this.ExportExcel = this.fb.group({

      searchTerm: ['']
    });
    this.OnView();
  }







  // filteredData() {
  //   if (!this.searchText) return this.StatusList;
  //   const searchTextLower = this.searchText.toLowerCase();
  //   return this.StatusList.filter(res =>
  //     res.description?.toLowerCase().includes(searchTextLower) ||
  //     res.remarks?.toLowerCase().includes(searchTextLower) ||
  //     res.emocode?.toLowerCase().includes(searchTextLower) ||
  //     res.empname?.toLowerCase().includes(searchTextLower)


  //   );
  // }

  filteredData() {
  if (!this.searchText) return this.StatusList;

  const searchTextLower = this.searchText.toLowerCase();
  return this.StatusList.filter(res =>
    res.empcode?.toLowerCase().includes(searchTextLower) ||
    res.empname?.toLowerCase().includes(searchTextLower) ||
    res.dated?.toLowerCase().includes(searchTextLower) ||
    res.kraScore?.toString().toLowerCase().includes(searchTextLower) ||
    res.behavioralScore?.toString().toLowerCase().includes(searchTextLower) ||
    res.finalScore?.toString().toLowerCase().includes(searchTextLower) ||
    res.managerComments?.toLowerCase().includes(searchTextLower) ||
    res.employeeComments?.toLowerCase().includes(searchTextLower) ||
    res.status?.toLowerCase().includes(searchTextLower) ||
    res.AppraisalYear?.toLowerCase().includes(searchTextLower) ||
    res.remarks?.toLowerCase().includes(searchTextLower)
  );
}



  OnView() {

    this.ngxUILoaderService.start();
   const payload = this.ExportExcel.value;
   Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.page = 1; // Reset to first page
    this.isFirstLoad = true;
    this.getData();
  }

  getData() {

    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;

    this.httpService.getAppraisalStatusList(this.page - 1, this.pageSize, searchTerm).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.StatusList = res.data;
          this.tableHeaders = Object.keys(res.data[0] ?? {});

          this.totalItems = res.totalCount;
          // this.toastrService.success(res.message);
          // ✅ Show success toast only once (on first load)
          if (this.isFirstLoad) {
            this.toastrService.success(res.message);
            this.isFirstLoad = false;
          }

        } else {
          this.StatusList = [];
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
    this.getData();
  }

  onSearchTextChanged() {
    const localFilteredData = this.filteredData();
    if (!this.searchText) {
      // ✅ If search is cleared, fetch fresh records
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue('');
      this.getData();
    } else if (localFilteredData.length === 0) {
      // ✅ If no matching records in current list, reset to page 1 and fetch from API
      this.page = 1;
      this.ExportExcel.get('searchTerm')?.setValue(this.searchText);
      this.getData();
    }
  }



  downloadExcel(): void {


    const searchTerm = this.ExportExcel.get('searchTerm')?.value || null;
    this.httpService.getAppraisalStatusList(this.page - 1, 10000, searchTerm).subscribe(res => {
      if (res.isSuccess) {
        const data = res.data;

        const filteredData = data.map((item: any) => ({
          SrNo: item.SrNo,
          empcode: this.stripHtmlTags(item.empcode),
          empname: this.stripHtmlTags(item.empname),
          dated: this.stripHtmlTags(item.dated),
          kraScore: this.stripHtmlTags(item.kraScore),
          behavioralScore: this.stripHtmlTags(item.behavioralScore),
          finalScore: this.stripHtmlTags(item.finalScore),
          managerComments: this.stripHtmlTags(item.managerComments),
          employeeComments: this.stripHtmlTags(item.employeeComments),
          status: this.stripHtmlTags(item.status),
          AppraisalYear: this.stripHtmlTags(item.AppraisalYear),
        
        
          remarks: this.stripHtmlTags(item.remarks),



        }));

        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'AppraisalStatus');
        XLSX.writeFile(wb, 'AppraisalStatus.xlsx');
      }
    });
  }
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }


//   downloadEmployeeData(empcode: string): void {
//   this.ngxUILoaderService.start();

//   this.httpService.getAppraisalPdfData(empcode).subscribe({
//     next: (res) => {
//       if (res.isSuccess && res.data && res.data.length > 0) {
//         const data = res.data;

//         const cleanedData = data.map((item: any) => ({
//           SrNo: item.SrNo,
//           empcode: this.stripHtmlTags(item.empcode),
//           empname: this.stripHtmlTags(item.empname),
//           dated: this.stripHtmlTags(item.dated),
//           kraScore: this.stripHtmlTags(item.kraScore),
//           behavioralScore: this.stripHtmlTags(item.behavioralScore),
//           finalScore: this.stripHtmlTags(item.finalScore),
//           managerComments: this.stripHtmlTags(item.managerComments),
//           employeeComments: this.stripHtmlTags(item.employeeComments),
//           status: this.stripHtmlTags(item.status),
//           AppraisalYear: this.stripHtmlTags(item.AppraisalYear),
//           remarks: this.stripHtmlTags(item.remarks),
//         }));

//         const ws = XLSX.utils.json_to_sheet(cleanedData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, 'EmployeeAppraisal');
//         XLSX.writeFile(wb, `${empcode}_Appraisal.xlsx`);
//       } else {
//         this.toastrService.warning('No data found for this employee.');
//       }
//       this.ngxUILoaderService.stop();
//     },
//     error: () => {
//       this.toastrService.error('Something went wrong while downloading.');
//       this.ngxUILoaderService.stop();
//     }
//   });
// }


viewEmployeePDFData(empcode: string): void {
  this.ngxUILoaderService.start();

  this.httpService.getAppraisalPdfData(empcode).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data && res.data.length > 0) {
        this.employeePDFData = res.data[0]; // store single record

        setTimeout(() => this.generatePDF(), 300); // generate PDF silently
      } else {
        this.toastrService.warning('No appraisal data found for this employee.');
      }
      this.ngxUILoaderService.stop();
    },
    error: () => {
      this.toastrService.error('Something went wrong while generating PDF.');
      this.ngxUILoaderService.stop();
    }
  });
}


 generatePDF(): void {
      this.showStatus=true
      const element = document.getElementById('pdf-content') as HTMLElement;
    
      // Ensure the page scrolls to the top before rendering
      window.scrollTo(0, 0);
    
      const opt = {
        margin: [0, 0, 0, 0], // top, left, bottom, right
        filename: 'AppraisalStatus.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          scrollY: 0 // Prevent scroll-based displacement
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { avoid: 'tr' } // Optional: prevents breaks inside rows
      };
    
      if (element) {
        html2pdf().from(element).set(opt).save();
      } else {
        console.error("Element not found for PDF generation");
      }
    }

}


