import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SeparationRequestService } from '../../../all-employee/emp-exit/Services/Emp_resignation.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-resignation-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-resignation-list.component.html',
  styleUrl: './admin-resignation-list.component.scss'
})
export class AdminResignationListComponent implements OnInit {
  resignationList: any[] = [];
  originalResignationList: any[] = [];
  pageIndex = 1;
  pageSize = 6;
  totalCount = 0;
  searchText = '';

  pdfUrl!: SafeResourceUrl;
  private blobUrl = '';
  selectedPdfId = 0;
  previewTitle = '';

  currentLetter = '';

  dashboard = {
    totalResignations: 0,
    approved: 0,
    pending: 0,
    retained: 0,
    rejected: 0,
    withdraw: 0
  };

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private separationRequestService: SeparationRequestService,
    private sanitizer: DomSanitizer
  ) { }

  searchTimer: any;

  ngOnInit(): void {
    this.getDashboardCount();
    this.getResignations();
  }

  getDashboardCount() {

    this.separationRequestService
      .getDashboardCount()
      .subscribe({

        next: (res: any) => {

          if (res.isSuccess) {

            this.dashboard = res.data;

          }

        },
        error: () => {

          this.toastrService.error("Unable to load dashboard.");

        }

      });

  }

  getResignations() {
    this.separationRequestService
      .getAdminList(this.pageIndex, this.pageSize, this.searchText)
      .subscribe({
        next: (res: any) => {

          if (res.isSuccess) {

            this.resignationList = res.data;

            if (!this.searchText.trim()) {
              this.originalResignationList = [...res.data];
            }

            this.totalCount = res.totalCount;
          }

        },
        error: () => {
          this.toastrService.error('Failed to load resignation list.');
        }
      });
  }

  onSearch(): void {

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {

      const text = this.searchText.trim().toLowerCase();

      // Search empty -> original list dikhao
      if (text === '') {

        this.pageIndex = 1;
        this.getResignations();      // current page ka original data wapas load

        return;
      }

      // Pehle current list me search karo
      const localData = this.originalResignationList.filter(item => {

        const status =
          item.status === 1 ? 'pending' :
            item.status === 2 ? 'retain' :
              item.status === 3 ? 'withdraw' :
                item.status === 4 ? 'accepted' :
                  item.status === 5 ? 'rejected' : '';

        return (
          item.empcode?.toLowerCase().includes(text) ||
          item.empname?.toLowerCase().includes(text) ||
          item.department?.toLowerCase().includes(text) ||
          status.includes(text)
        );
      });

      // Agar local data mil gaya
      if (localData.length > 0) {
        this.resignationList = localData;
        return;
      }

      // Nahi mila to API call
      this.pageIndex = 1;
      this.getResignations();

    }, 500);
  }

  previewPdf(id: number): void {

    this.selectedPdfId = id;

    this.separationRequestService
      .downloadPdf(id)
      .subscribe({

        next: (response: Blob) => {

          const blob = new Blob([response], {
            type: response.type
          });

          this.blobUrl = URL.createObjectURL(blob);

          this.pdfUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.blobUrl +
              '#toolbar=0&navpanes=0&scrollbar=0'
            );

          const modalElement = document.getElementById('resignationPreviewModal');

          if (!modalElement) {
            this.toastrService.error('Preview modal not found.');
            return;
          }

          const modal = new bootstrap.Modal(modalElement);

          modal.show();

          modalElement.addEventListener(
            'hidden.bs.modal',
            () => {

              if (this.blobUrl) {

                URL.revokeObjectURL(this.blobUrl);

                this.blobUrl = '';

              }

            },
            { once: true }
          );

        },

        error: () => {

          this.toastrService.error(
            'Unable to load PDF.'
          );

        }

      });

  }

  downloadRelievingLetter(id: number) {

    this.separationRequestService
      .downloadRelievingLetter(id)
      .subscribe(/* same download code */);

  }

  downloadExperienceLetter(id: number) {

    this.separationRequestService
      .downloadExperienceLetter(id)
      .subscribe(/* same download code */);

  }


  downloadCurrentPdf() {

    switch (this.currentLetter) {

      case 'resignation':
        this.download(this.selectedPdfId);
        break;

      case 'relieving':
        this.downloadRelievingLetter(this.selectedPdfId);
        break;

      case 'experience':
        this.downloadExperienceLetter(this.selectedPdfId);
        break;

    }

  }


  download(id: number): void {

    this.separationRequestService
      .downloadPdf(id)
      .subscribe({

        next: (response: Blob) => {

          const fileURL =
            URL.createObjectURL(response);

          const link =
            document.createElement('a');

          link.href = fileURL;

          link.download =
            `Resignation_${id}.pdf`;

          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);

          URL.revokeObjectURL(fileURL);

        },

        error: () => {

          this.toastrService.error(
            'Unable to download PDF.'
          );

        }

      });

  }

  action(id: number): void {

    this.router.navigate([
      `/dash/exit/exitdashboard/admin_resignation_action/${id}`
    ]);

  }

  previewRelievingLetter(id: number): void {

    this.selectedPdfId = id;

    this.previewTitle = 'Relieving Letter';
    this.currentLetter = 'relieving';

    this.separationRequestService
      .downloadRelievingLetter(id)
      .subscribe({
        next: (response: Blob) => {

          this.blobUrl = URL.createObjectURL(response);

          this.pdfUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.blobUrl +
              '#toolbar=0&navpanes=0&scrollbar=0'
            );

          const modalElement =
            document.getElementById('resignationPreviewModal');

          if (!modalElement) return;

          const modal =
            new bootstrap.Modal(modalElement);

          modal.show();

        }
      });

  }

  previewExperienceLetter(id: number): void {

    this.selectedPdfId = id;

    this.previewTitle = 'Experience Letter';
    this.currentLetter = 'experience';

    this.separationRequestService
      .downloadExperienceLetter(id)
      .subscribe({
        next: (response: Blob) => {

          this.blobUrl = URL.createObjectURL(response);

          this.pdfUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.blobUrl +
              '#toolbar=0&navpanes=0&scrollbar=0'
            );

          const modalElement =
            document.getElementById('resignationPreviewModal');

          if (!modalElement) return;

          const modal =
            new bootstrap.Modal(modalElement);

          modal.show();

        }
      });

  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getResignations();
  }

  exportToExcel(): void {

    if (this.resignationList.length === 0) {
      this.toastrService.warning('No data available to export');
      return;
    }

    const formattedData = this.resignationList.map((item: any) => ({

      'Employee Code': item.empcode,

      'Employee Name': item.empname,

      'Department': item.department,

      'Resignation Date': item.resignationDate
        ? new Date(item.resignationDate)
          .toLocaleDateString('en-GB')
          .replace(/\//g, '-')
        : '',

      'Expected LWD': item.expectedLWD
        ? new Date(item.expectedLWD)
          .toLocaleDateString('en-GB')
          .replace(/\//g, '-')
        : '',

      'Notice Period (Days)': item.noticePeriod,

      'Notice Period Served': item.isNoticePeriodServed ? 'Yes' : 'No',

      'Reason for Leaving': item.reason,

      'Remarks': item.remarks,

      'Status':
        item.status === 1 ? 'Pending' :
          item.status === 2 ? 'Retain' :
            item.status === 3 ? 'Withdraw' :
              item.status === 4 ? 'Accepted' :
                item.status === 5 ? 'Rejected' : '',

      'Exit Interview': item.exitInterviewStatus || 'Pending',

      'Due Clearance': item.dueClearanceStatus || 'Pending',

      'No Due Declaration': item.noDueDeclarationStatus || 'Pending'

    }));

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(formattedData);

    const workbook: XLSX.WorkBook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'All Resignations'
    );

    const excelBuffer: any =
      XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

    const data: Blob = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    const fileName = 'AllResignations.xlsx';

    const url = URL.createObjectURL(data);

    const link = document.createElement('a');

    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    this.toastrService.success('Excel downloaded successfully.');

  }


}
