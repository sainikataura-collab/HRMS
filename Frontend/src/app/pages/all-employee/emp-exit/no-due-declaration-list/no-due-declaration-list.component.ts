import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NoDueDeclarationService } from '../Services/no-due-declaration.service';

declare var bootstrap: any;

@Component({
    selector: 'app-no-due-declaration-list',
    standalone: true,
    imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule],
    templateUrl: './no-due-declaration-list.component.html',
    styleUrl: './no-due-declaration-list.component.scss'
})
export class NoDueDeclarationListComponent implements OnInit {

    noDueDeclarationList: any[] = [];
    pageIndex = 1;
    pageSize = 10;
    totalCount = 0;
    searchText = '';
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
        this.getNoDueDeclarations();
    }

    getNoDueDeclarations(): void {
        this.noDueDeclarationService.getAllNoDueDeclarations(this.pageIndex - 1, this.pageSize).subscribe({
            next: (res: any) => {
                if (res?.isSuccess || res?.IsSuccess) {
                    this.noDueDeclarationList = res.data || res.Data || [];
                    this.totalCount = res.totalCount || res.TotalCount || this.noDueDeclarationList.length;
                } else {
                    this.noDueDeclarationList = [];
                    this.totalCount = 0;
                }
            },
            error: () => {
                this.noDueDeclarationList = [];
                this.totalCount = 0;
                this.toastrService.error('Something went wrong while loading no due declarations');
            }
        });
    }

    filteredData(): any[] {
        if (!this.searchText || this.searchText.trim() === '') {
            return this.noDueDeclarationList;
        }

        const searchTextLower = this.searchText.toLowerCase().trim();

        return this.noDueDeclarationList.filter(item => {
            const empCode = String(item.empcode || item.EmpCode || '').toLowerCase();
            const empName = String(item.empname || item.EmpName || '').toLowerCase();
            const department = String(item.department || item.Department || '').toLowerCase();
            const hodName = String(item.hodName || item.HodName || item.HODName || '').toLowerCase();

            const resignationDate = item.resignationDate || item.ResignationDate
                ? new Date(item.resignationDate || item.ResignationDate).toLocaleDateString('en-GB')
                : '';

            const status = this.getNoDueStatusText(item).toLowerCase();

            return empCode.includes(searchTextLower)
                || empName.includes(searchTextLower)
                || department.includes(searchTextLower)
                || hodName.includes(searchTextLower)
                || resignationDate.includes(searchTextLower)
                || status.includes(searchTextLower);
        });
    }

    openNoDueDeclaration(item: any): void {
        const noDueDeclarationId =
            item.pk_noDueDeclarationId ||
            item.Pk_NoDueDeclarationId ||
            item.PK_NoDueDeclarationId ||
            0;

        if (noDueDeclarationId > 0) {
            this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration_form', noDueDeclarationId]);
        } else {
            this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration_form']);
        }
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
            { queryParams: { mode: 'view' } }
        );
    }

    downloadNoDueDeclarationPdf(item: any): void {
        const noDueDeclarationId =
            item.pk_noDueDeclarationId ||
            item.Pk_NoDueDeclarationId ||
            item.PK_NoDueDeclarationId;

        if (!noDueDeclarationId) {
            this.toastrService.error('No Due Declaration id not found.');
            return;
        }

        this.noDueDeclarationService.downloadNoDueDeclarationReportPdf(noDueDeclarationId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');

                link.href = url;
                link.download = `NoDueDeclaration_${noDueDeclarationId}.pdf`;

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

    getNoDueStatus(item: any): number {
        const status = item.noDueStatus ?? item.NoDueStatus;

        if (status !== null && status !== undefined && status !== '') {
            return Number(status);
        }

        const noDueDeclarationId =
            item.pk_noDueDeclarationId ||
            item.Pk_NoDueDeclarationId ||
            item.PK_NoDueDeclarationId;

        return noDueDeclarationId ? 2 : 1;
    }

    getNoDueStatusText(item: any): string {
        const status = this.getNoDueStatus(item);

        if (status === 1) return 'Pending';
        if (status === 2) return 'Submitted';
        if (status === 3) return 'Reviewed';
        if (status === 4) return 'Approved';

        return 'Pending';
    }

    getNoDueStatusClass(item: any): string {
        const status = this.getNoDueStatus(item);

        if (status === 1) return 'bg-warning';
        if (status === 2) return 'bg-info';
        if (status === 3) return 'bg-success';
        if (status === 4) return 'bg-danger';

        return 'bg-danger';
    }

    delete(id: number): void {
        if (confirm('Are you sure you want to delete this declaration?')) {
            this.noDueDeclarationService.deleteNoDueDeclaration(id).subscribe({
                next: (res: any) => {
                    if (res?.isSuccess || res?.IsSuccess) {
                        this.toastrService.success(res?.message || res?.Message || 'Deleted successfully');
                        this.getNoDueDeclarations();
                    } else {
                        this.toastrService.error(res?.message || res?.Message || 'Failed to delete declaration');
                    }
                },
                error: () => {
                    this.toastrService.error('Something went wrong while deleting declaration');
                }
            });
        }
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
        this.previewNoDueDeclarationId = 0;

        if (this.previewBlobUrl) {
            const cleanUrl = this.previewBlobUrl.split('#')[0];
            window.URL.revokeObjectURL(cleanUrl);
            this.previewBlobUrl = '';
        }
    }

    onPageChange(event: number): void {
        this.pageIndex = event;
        this.getNoDueDeclarations();
    }
}