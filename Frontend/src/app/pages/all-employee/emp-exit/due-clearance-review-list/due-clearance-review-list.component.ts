import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { DueClearanceService } from '../Services/due-clearance.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
  selector: 'app-due-clearance-review-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './due-clearance-review-list.component.html',
  styleUrl: './due-clearance-review-list.component.scss'
})
export class DueClearanceReviewListComponent {
  searchText: string = '';
  clearanceList: any[] = [];

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  previewPdfUrl: any = null;
  previewBlobUrl: string = '';
  previewEmpId: string = '';

  constructor(
    private dueClearanceService: DueClearanceService,
    private toastrService: ToastrService,
    private loader: NgxUiLoaderService,
    private router: Router,
    private encryptionService: EncryptionService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getHODClearanceList();
  }

  getHODClearanceList(): void {
    this.loader.start();

    this.dueClearanceService
      .getHODClearanceList(this.pageIndex - 1, this.pageSize)
      .subscribe({
        next: (res) => {
          this.loader.stop();

          if (res.isSuccess) {
            this.clearanceList = res.data || [];
            this.totalItems = res.totalCount || 0;
          } else {
            this.clearanceList = [];
            this.totalItems = 0;
          }
        },
        error: (err) => {
          this.loader.stop();
          this.clearanceList = [];
          this.totalItems = 0;
          console.error(err);
        }
      });
  }

  filteredData(): any[] {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.clearanceList;
    }

    const search = this.searchText.toLowerCase().trim();

    return this.clearanceList.filter((item: any) => {
      const empcode = item.empcode ? String(item.empcode).toLowerCase() : '';
      const empname = item.empname ? String(item.empname).toLowerCase() : '';
      const hodName = item.hodName ? String(item.hodName).toLowerCase() : '';
      const department = item.department ? String(item.department).toLowerCase() : '';
      const designation = item.designation ? String(item.designation).toLowerCase() : '';
      const status = item.status ? String(item.status).toLowerCase() : '';

      return empcode.includes(search) ||
        empname.includes(search) ||
        hodName.includes(search) ||
        department.includes(search) ||
        designation.includes(search) ||
        status.includes(search);
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;

    if (!this.searchText.trim()) {
      this.getHODClearanceList();
    }
  }

  review(empId: string): void {
    const encryptedEmpId = this.encryptionService.encryptText(empId);

    this.router.navigate([
      '/dash/emp-exit/emp-exitdashboard/due_clearance_review_form',
      encryptedEmpId
    ]);
  }

  viewDetail(empId: string): void {
    const encryptedEmpId = this.encryptionService.encryptText(empId);

    this.router.navigate([
      '/dash/emp-exit/emp-exitdashboard/due_clearance_review_form',
      encryptedEmpId
    ], { queryParams: { viewMode: true } });
  }

  previewPdf(item: any): void {
    const empId = item.fk_empid;
    if (!empId) {
      this.toastrService.error('Employee ID not found.');
      return;
    }

    this.previewEmpId = empId;

    this.dueClearanceService.downloadDueClearanceReportPdf(empId, true).subscribe({
      next: (blob: Blob) => {
        if (!blob) {
          this.toastrService.error('PDF not received from server');
          return;
        }

        const pdfBlob = new Blob([blob], { type: 'application/pdf' });

        this.previewBlobUrl =
          window.URL.createObjectURL(pdfBlob) +
          '#toolbar=0&navpanes=0&scrollbar=0';

        this.previewPdfUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(this.previewBlobUrl);

        const modalElement = document.getElementById('dueClearancePdfModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: () => {
        this.toastrService.error('Something went wrong while loading PDF preview');
      }
    });
  }

  downloadPreviewPdf(): void {
    if (!this.previewEmpId) {
      this.toastrService.error('Employee ID not found.');
      return;
    }

    this.dueClearanceService.downloadDueClearanceReportPdf(this.previewEmpId, true).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `DueClearance_${this.previewEmpId}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastrService.error('Something went wrong while downloading PDF');
      }
    });
  }

  closePreviewModal(): void {
    const modalElement = document.getElementById('dueClearancePdfModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.previewPdfUrl = null;
    if (this.previewBlobUrl) {
      window.URL.revokeObjectURL(this.previewBlobUrl);
      this.previewBlobUrl = '';
    }
    this.previewEmpId = '';
  }
}