import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { DueClearanceService } from '../Services/due-clearance.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { DomSanitizer } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
    selector: 'app-due-clearance-list',
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule
    ],
    templateUrl: './due-clearance-list.component.html',
    styleUrl: './due-clearance-list.component.scss'
})
export class DueClearanceListComponent implements OnInit {

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
    ) { }

    ngOnInit(): void {
        this.getDueClearanceList();
    }

    getDueClearanceList(): void {

        this.dueClearanceService
            .getDueClearanceList(this.pageIndex - 1, this.pageSize)
            .subscribe({

                next: (res: any) => {

                    if (!(res?.isSuccess || res?.IsSuccess)) {

                        this.clearanceList = [];
                        this.totalCount = 0;
                        return;
                    }

                    this.clearanceList = res.data || res.Data || [];

                    this.totalCount =
                        res.totalCount ||
                        res.TotalCount ||
                        this.clearanceList.length;

                },

                error: () => {

                    this.clearanceList = [];
                    this.totalCount = 0;

                    this.toastrService.error(
                        'Unable to load due clearance list.'
                    );

                }

            });

    }

    filteredData(): any[] {

        if (!this.searchText.trim())
            return this.clearanceList;

        const search = this.searchText.toLowerCase();

        return this.clearanceList.filter((x: any) =>

            String(x.empcode || '').toLowerCase().includes(search) ||

            String(x.empname || '').toLowerCase().includes(search) ||

            String(x.department || '').toLowerCase().includes(search) ||

            String(x.designation || '').toLowerCase().includes(search) ||

            String(x.hodName || '').toLowerCase().includes(search) ||

            String(x.status || '').toLowerCase().includes(search)

        );

    }

    viewClearance(item: any): void {
        this.router.navigate([
            '/dash/emp-exit/emp-exitdashboard/due_clearance_form',
        ]);
    }

    onPageChange(event: number): void {

        this.pageIndex = event;

        this.getDueClearanceList();

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