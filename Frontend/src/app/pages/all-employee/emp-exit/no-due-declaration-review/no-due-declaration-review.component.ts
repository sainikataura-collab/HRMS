import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NoDueDeclarationService } from '../Services/no-due-declaration.service';

declare var bootstrap: any;

@Component({
    selector: 'app-no-due-declaration-review',
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './no-due-declaration-review.component.html',
    styleUrl: './no-due-declaration-review.component.scss'
})
export class NoDueDeclarationReviewComponent implements OnInit {

    noDueDeclarationReviewList: any[] = [];
    pageIndex = 1;
    pageSize = 10;
    totalCount = 0;
    searchText = '';

    selectedNoDueDeclaration: any = null;
    previewPdfUrl: SafeResourceUrl | null = null;
    previewBlobUrl = '';
    previewNoDueDeclarationId = 0;

    constructor(
        private router: Router,
        private toastrService: ToastrService,
        private noDueDeclarationService: NoDueDeclarationService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.getNoDueDeclarationReviews();
    }

    getNoDueDeclarationReviews(): void {
        this.noDueDeclarationService
            .getAllAdminHodNoDueDeclarations(this.pageIndex - 1, this.pageSize)
            .subscribe({
                next: (res: any) => {
                    if (res?.isSuccess || res?.IsSuccess) {
                        this.noDueDeclarationReviewList = res.data || res.Data || [];
                        this.totalCount =
                            res.totalCount || res.TotalCount || this.noDueDeclarationReviewList.length;
                    } else {
                        this.noDueDeclarationReviewList = [];
                        this.totalCount = 0;
                    }
                },
                error: () => {
                    this.noDueDeclarationReviewList = [];
                    this.totalCount = 0;
                    this.toastrService.error('Something went wrong while loading no due declaration reviews');
                }
            });
    }

    filteredData(): any[] {
        if (!this.searchText || this.searchText.trim() === '') {
            return this.noDueDeclarationReviewList;
        }

        const searchTextLower = this.searchText.toLowerCase().trim();

        return this.noDueDeclarationReviewList.filter(item => {
            const empCode = String(item.empcode || item.EmpCode || '').toLowerCase();
            const empName = String(item.empname || item.EmpName || '').toLowerCase();
            const department = String(item.department || item.Department || '').toLowerCase();
            const hodName = String(item.hodName || item.HodName || item.HODName || '').toLowerCase();
            const status = this.getNoDueStatusText(item).toLowerCase();

            const resignationDate = item.resignationDate || item.ResignationDate
                ? new Date(item.resignationDate || item.ResignationDate).toLocaleDateString('en-GB')
                : '';

            const submittedDate = item.insDate || item.InsDate
                ? new Date(item.insDate || item.InsDate).toLocaleDateString('en-GB')
                : '';

            return empCode.includes(searchTextLower)
                || empName.includes(searchTextLower)
                || department.includes(searchTextLower)
                || hodName.includes(searchTextLower)
                || resignationDate.includes(searchTextLower)
                || submittedDate.includes(searchTextLower)
                || status.includes(searchTextLower);
        });
    }

    viewNoDueDeclaration(item: any): void {
        const noDueDeclarationId =
            item.pk_noDueDeclarationId ||
            item.Pk_NoDueDeclarationId ||
            item.PK_NoDueDeclarationId;

        if (!noDueDeclarationId) {
            this.toastrService.error('No Due Declaration id not found.');
            return;
        }

        this.router.navigate(
            ['/dash/emp-exit/emp-exitdashboard/no_due_declaration_form', noDueDeclarationId],
            { queryParams: { mode: 'review' } }
        );
    }

    openNoDuePdfPreview(item: any): void {
        const noDueDeclarationId =
            item.pk_noDueDeclarationId ||
            item.Pk_NoDueDeclarationId ||
            item.PK_NoDueDeclarationId;

        if (!noDueDeclarationId) {
            this.toastrService.error('No Due Declaration id not found.');
            return;
        }

        this.selectedNoDueDeclaration = item;
        this.previewNoDueDeclarationId = noDueDeclarationId;

        this.noDueDeclarationService.downloadNoDueDeclarationReportPdf(noDueDeclarationId).subscribe({
            next: (blob: Blob) => {
                const pdfBlob = new Blob([blob], { type: 'application/pdf' });

                this.previewBlobUrl =
                    window.URL.createObjectURL(pdfBlob) +
                    '#toolbar=0&navpanes=0&scrollbar=0';

                this.previewPdfUrl =
                    this.sanitizer.bypassSecurityTrustResourceUrl(this.previewBlobUrl);

                const modalElement = document.getElementById('noDuePdfModal');

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
        if (!this.previewNoDueDeclarationId) {
            this.toastrService.error('No Due Declaration id not found.');
            return;
        }

        this.noDueDeclarationService.downloadNoDueDeclarationReportPdf(this.previewNoDueDeclarationId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = url;
                link.download = `NoDueDeclaration_${this.previewNoDueDeclarationId}.pdf`;

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
        const modalElement = document.getElementById('noDuePdfModal');

        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
        }

        this.previewPdfUrl = null;
        this.selectedNoDueDeclaration = null;
        this.previewNoDueDeclarationId = 0;

        if (this.previewBlobUrl) {
            const cleanUrl = this.previewBlobUrl.split('#')[0];
            window.URL.revokeObjectURL(cleanUrl);
            this.previewBlobUrl = '';
        }
    }

    onPageChange(event: number): void {
        this.pageIndex = event;
        this.getNoDueDeclarationReviews();
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
        const dataToExport = this.filteredData();

        if (dataToExport.length > 0) {
            const formattedData = dataToExport.map((item: any) => ({
                'Employee Code': item.empcode || item.EmpCode || '',
                'Employee Name': item.empname || item.EmpName || '',
                'Department': item.department || item.Department || '',
                'HOD Name': item.hodName || item.HodName || item.HODName || '',
                'Resignation Date': this.formatDate(item.resignationDate || item.ResignationDate),
                'Notice Period': item.noticePeriod || item.NoticePeriod || '',
                'Notice Period Served': (item.noticePeriodServed || item.NoticePeriodServed) ? 'Yes' : 'No',
                'Status': this.getNoDueStatusText(item),
                'Submitted On': this.formatDate(item.insDate || item.InsDate)
            }));

            const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(workbook, worksheet, 'NoDueDeclarations');

            const excelBuffer: any = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            const data: Blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const fileName = 'NoDueDeclarations.xlsx';
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

    getNoDueStatus(item: any): number {
        return Number(item.noDueStatus ?? item.NoDueStatus ?? 2);
    }

    getNoDueStatusText(item: any): string {
        const status = this.getNoDueStatus(item);

        if (status === 1) return 'Pending';
        if (status === 2) return 'Submitted';
        if (status === 3) return 'Reviewed';
        if (status === 4) return 'Approved';

        return 'Submitted';
    }

    getNoDueStatusClass(item: any): string {
        const status = this.getNoDueStatus(item);

        if (status === 1) return 'bg-warning';
        if (status === 2) return 'bg-info';
        if (status === 3) return 'bg-success';
        if (status === 4) return 'bg-danger';

        return 'bg-info';
    }
}