import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DueClearanceService } from '../../../all-employee/emp-exit/Services/due-clearance.service';

declare var bootstrap: any;

@Component({
  selector: 'app-due-clearance-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule
  ],
  templateUrl: './due-clearance-review.component.html',
  styleUrl: './due-clearance-review.component.scss'
})
export class DueClearanceReviewComponent implements OnInit {
  clearanceList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';

  previewPdfUrl: any = null;
  previewBlobUrl: string = '';
  previewEmpId: string = '';

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private dueClearanceService: DueClearanceService,
    private encryptionService: EncryptionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getAdminClearanceStatusList();
  }

  getAdminClearanceStatusList(): void {
    this.dueClearanceService
      .getAdminClearanceStatusList(this.pageIndex - 1, this.pageSize)
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.IsSuccess) {
            this.clearanceList = res.data || [];
            this.totalCount = res.totalCount || 0;
          } else {
            this.clearanceList = [];
            this.totalCount = 0;
          }
        },
        error: () => {
          this.clearanceList = [];
          this.totalCount = 0;
        }
      });
  }

  filteredData(): any[] {
    const search = (this.searchText || '').trim().toLowerCase();
    if (!search) {
      return this.clearanceList;
    }
    return this.clearanceList.filter(
      (x) =>
        String(x.empcode || '').toLowerCase().includes(search) ||
        String(x.empname || '').toLowerCase().includes(search) ||
        String(x.department || '').toLowerCase().includes(search) ||
        String(x.designation || '').toLowerCase().includes(search) ||
        String(x.hodName || '').toLowerCase().includes(search) ||
        String(x.status || '').toLowerCase().includes(search)
    );
  }

  viewClearance(item: any): void {
    const encryptedEmpId = this.encryptionService.encryptText(item.fk_empid);
    this.router.navigate(
      ['/dash/emp-exit/emp-exitdashboard/due_clearance_form'],
      { queryParams: { empId: encryptedEmpId } }
    );
  }

  skipClearance(item: any): void {
    if (confirm(`Are you sure you want to skip clearance for ${item.empname}?`)) {
      this.dueClearanceService.skipClearance(item.pk_seprequestId).subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.IsSuccess) {
            this.toastrService.success(res?.message || 'Clearance skipped successfully.');
            this.getAdminClearanceStatusList();
          } else {
            this.toastrService.error(res?.message || 'Failed to skip clearance.');
          }
        },
        error: () => {
          this.toastrService.error('An error occurred while skipping clearance.');
        }
      });
    }
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAdminClearanceStatusList();
  }

  previewPdf(item: any): void {
    const empId = item.fk_empid;
    if (!empId) {
      this.toastrService.error('Employee ID not found.');
      return;
    }

    this.previewEmpId = empId;

    this.dueClearanceService.downloadDueClearanceReportPdf(empId).subscribe({
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

    this.dueClearanceService.downloadDueClearanceReportPdf(this.previewEmpId).subscribe({
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
