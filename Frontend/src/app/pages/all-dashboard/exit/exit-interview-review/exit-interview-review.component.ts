import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExitFormAutorityService } from '../Service/exit-form-autority.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
    selector: 'app-exit-interview-review',
    standalone: true,
    imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule],
    templateUrl: './exit-interview-review.component.html',
    styleUrl: './exit-interview-review.component.scss'
})
export class ExitInterviewReviewComponent implements OnInit {
    interviewList: any[] = [];
    pageIndex = 1;
    pageSize = 10;
    totalCount = 0;
    searchText = '';
    previewPdfUrl: SafeResourceUrl | null = null;
    previewBlobUrl = '';
    previewExitInterviewId = 0;

    constructor(
        private router: Router,
        private toastrService: ToastrService,
        private exitInterviewService: ExitFormAutorityService,
        private sanitizer: DomSanitizer,
    ) { }

    ngOnInit(): void {
        this.getInterviews();
    }

    getInterviews(): void {
        this.exitInterviewService
            .getAllAdminHodExitInterviews(this.pageIndex - 1, this.pageSize)
            .subscribe({
                next: (res: any) => {
                    if (res?.isSuccess || res?.IsSuccess) {
                        this.interviewList = res.data || res.Data || [];
                        this.totalCount =
                            res.totalCount || res.TotalCount || this.interviewList.length;
                    } else {
                        this.interviewList = [];
                        this.totalCount = 0;
                    }
                },
                error: () => {
                    this.interviewList = [];
                    this.totalCount = 0;
                    this.toastrService.error('Something went wrong while loading exit interviews');
                }
            });
    }

    filteredData(): any[] {
        if (!this.searchText || this.searchText.trim() === '') {
            return this.interviewList;
        }

        const searchTextLower = this.searchText.toLowerCase().trim();

        return this.interviewList.filter(item => {
            const empCode = String(item.empcode || item.EmpCode || '').toLowerCase();
            const empName = String(item.empname || item.EmpName || '').toLowerCase();
            const department = String(item.department || item.Department || '').toLowerCase();
            const hodName = String(item.hodName || item.HodName || item.HODName || '').toLowerCase();
            const resDateVal = item.resignationDate || item.ResignationDate;
            const resignationDate = resDateVal ? new Date(resDateVal).toLocaleDateString('en-GB') : '';
            const subDateVal = item.insDate || item.InsDate;
            const SubmittedDate = subDateVal ? new Date(subDateVal).toLocaleDateString('en-GB') : '';

            return empCode.includes(searchTextLower)
                || empName.includes(searchTextLower)
                || department.includes(searchTextLower)
                || hodName.includes(searchTextLower)
                || resignationDate.includes(searchTextLower)
                || SubmittedDate.includes(searchTextLower);
        });
    }

    view(item: any): void {
        const empId = item.fk_empid || item.Fk_Empid || item.FK_Empid;

        if (!empId) {
            this.toastrService.error('Employee id not found.');
            return;
        }

        this.router.navigate(
            ['/dash/exit/exitdashboard/exit_interviewReview', empId],
            { queryParams: { mode: 'review' } }
        );
    }

    onPageChange(event: number): void {
        this.pageIndex = event;
        this.getInterviews();
    }

    formatDate(dateValue: any): string {
        if (!dateValue) return '';

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    exportToExcel(): void {
        if (this.interviewList.length > 0) {
            const formattedData = this.interviewList.map((item: any) => ({
                'Employee Code': item.empcode || item.EmpCode || '',
                'Employee Name': item.empname || item.EmpName || '',
                'Department': item.department || item.Department || '',
                'HOD Name': item.hodName || item.HodName || item.HODName || '',
                'Resignation Date': this.formatDate(item.resignationDate || item.ResignationDate),
                'Notice Period': item.noticePeriod || item.NoticePeriod || '',
                'Notice Period Served': (item.noticePeriodServed || item.NoticePeriodServed) ? 'Yes' : 'No',
                'Submitted On': this.formatDate(item.insDate || item.InsDate)
            }));

            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ExitInterviews');

            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data: Blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const fileName = 'ExitInterviews.xlsx';
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
    openExitInterviewPdfPreview(item: any): void {
        const exitInterviewId =
            item.pk_exitInterviewId ||
            item.Pk_ExitInterviewId ||
            item.PK_ExitInterviewId;

        if (!exitInterviewId) {
            this.toastrService.error('Exit Interview id not found.');
            return;
        }

        this.previewExitInterviewId = exitInterviewId;

        this.exitInterviewService.downloadExitInterviewReportPdf(exitInterviewId).subscribe({
            next: (blob: Blob) => {
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
        this.previewExitInterviewId = 0;

        if (this.previewBlobUrl) {
            const cleanUrl = this.previewBlobUrl.split('#')[0];
            window.URL.revokeObjectURL(cleanUrl);
            this.previewBlobUrl = '';
        }
    }
}