import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExitInterviewService } from '../Services/exit-interview.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var bootstrap: any;

@Component({
    selector: 'app-exit-interview-list',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './exit-interview-list.component.html',
    styleUrl: './exit-interview-list.component.scss'
})
export class ExitInterviewListComponent implements OnInit {

    exitInterviewList: any[] = [];
    pageIndex = 1;
    pageSize = 100000;
    totalCount = 0;
    searchText = '';
    selectedExitInterview: any = null;
    previewPdfUrl: SafeResourceUrl | null = null;
    previewBlobUrl: string = '';
    previewExitInterviewId: number = 0;

    constructor(
        private router: Router,
        private toastrService: ToastrService,
        private exitInterviewService: ExitInterviewService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.getExitInterviews();
    }

    getExitInterviews(): void {
        this.exitInterviewService.getAllExitInterviews(0, this.pageSize).subscribe({
            next: (res: any) => {
                if (res?.isSuccess || res?.IsSuccess) {
                    this.exitInterviewList = res.data || res.Data || [];
                    this.totalCount = this.exitInterviewList.length;
                } else {
                    this.exitInterviewList = [];
                    this.totalCount = 0;
                }
            },
            error: () => {
                this.exitInterviewList = [];
                this.totalCount = 0;
                this.toastrService.error('Something went wrong while loading exit interviews');
            }
        });
    }

    filteredData(): any[] {
        if (!this.searchText || this.searchText.trim() === '') {
            return this.exitInterviewList;
        }

        const searchTextLower = this.searchText.toLowerCase().trim();

        return this.exitInterviewList.filter(item => {
            const empCode = String(item.empcode || item.EmpCode || '').toLowerCase();
            const empName = String(item.empname || item.EmpName || '').toLowerCase();
            const department = String(item.department || item.Department || '').toLowerCase();
            const resignationDate = item.resignationDate || item.ResignationDate
                ? new Date(item.resignationDate || item.ResignationDate).toLocaleDateString('en-GB')
                : '';
            const expectedLastWorkingDate = item.expectedLastWorkingDate || item.ExpectedLastWorkingDate
                ? new Date(item.expectedLastWorkingDate || item.ExpectedLastWorkingDate).toLocaleDateString('en-GB')
                : '';

            return empCode.includes(searchTextLower)
                || empName.includes(searchTextLower)
                || department.includes(searchTextLower)
                || resignationDate.includes(searchTextLower)
                || expectedLastWorkingDate.includes(searchTextLower);
        });
    }

    openExitInterview(item: any): void {
        const exitInterviewId =
            item.pk_exitInterviewId ||
            item.Pk_ExitInterviewId ||
            item.PK_ExitInterviewId ||
            0;

        if (exitInterviewId > 0) {
            this.router.navigate(['/dash/emp-exit/emp-exitdashboard/exit_interview_apply', exitInterviewId]);
        } else {
            this.router.navigate(['/dash/emp-exit/emp-exitdashboard/exit_interview_apply']);
        }
    }

    viewExitInterview(item: any): void {
        const exitInterviewId =
            item.pk_exitInterviewId ||
            item.Pk_ExitInterviewId ||
            item.PK_ExitInterviewId;

        if (!exitInterviewId) {
            this.toastrService.error('Exit Interview id not found.');
            return;
        }

        this.router.navigate(
            ['/dash/emp-exit/emp-exitdashboard/exit_interview_apply', exitInterviewId],
            { queryParams: { mode: 'view' } }
        );
    }

    downloadExitInterviewPdf(item: any): void {
        const exitInterviewId =
            item.pk_exitInterviewId ||
            item.Pk_ExitInterviewId ||
            item.PK_ExitInterviewId;

        if (!exitInterviewId) {
            this.toastrService.error('Exit Interview id not found.');
            return;
        }

        this.selectedExitInterview = item;
        this.previewExitInterviewId = exitInterviewId;

        this.exitInterviewService.downloadExitInterviewReportPdf(exitInterviewId).subscribe({
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

                const modalElement = document.getElementById('exitInterviewPdfModal');
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
        if (!this.previewExitInterviewId) {
            this.toastrService.error('Exit Interview id not found.');
            return;
        }

        this.exitInterviewService.downloadExitInterviewReportPdf(this.previewExitInterviewId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = url;
                link.download = `ExitInterview_${this.previewExitInterviewId}.pdf`;

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
        const modalElement = document.getElementById('exitInterviewPdfModal');

        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
        }

        this.previewPdfUrl = null;
        this.selectedExitInterview = null;
        this.previewExitInterviewId = 0;

        if (this.previewBlobUrl) {
            const cleanUrl = this.previewBlobUrl.split('#')[0];
            window.URL.revokeObjectURL(cleanUrl);
            this.previewBlobUrl = '';
        }
    }

    getInterviewStatus(item: any): number {
        const status = item.interviewStatus ?? item.InterviewStatus;

        if (status !== null && status !== undefined && status !== '') {
            return Number(status);
        }

        return 2; // Submitted fallback for review page
    }

    getInterviewStatusText(item: any): string {
        const status = this.getInterviewStatus(item);

        if (status === 1) return 'Pending';
        if (status === 2) return 'Submitted';
        if (status === 3) return 'Reviewed';

        return 'Submitted';
    }

    getInterviewStatusClass(item: any): string {
        const status = this.getInterviewStatus(item);

        if (status === 1) return 'bg-danger';
        if (status === 2) return 'bg-info';
        if (status === 3) return 'bg-success';

        return 'bg-info';
    }
}