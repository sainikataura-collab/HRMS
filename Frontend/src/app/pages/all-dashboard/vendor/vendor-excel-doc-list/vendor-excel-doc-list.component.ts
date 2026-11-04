import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { VendorService } from '../Service/vendor.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-vendor-excel-doc-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './vendor-excel-doc-list.component.html',
  styleUrl: './vendor-excel-doc-list.component.scss'
})
export class VendorExcelDocListComponent implements OnInit {
  uploadedDocsList: any[] = [];
  allLoadedDocs: any[] = [];
  filteredDocsList: any[] = [];
  searchControl = new FormControl('');
  private searchSubject = new Subject<string>();

  isLoading: boolean = false;
  totalCount: number = 0;
  pageIndex: number = 1;
  pageSize: number = 10;

  constructor(
    private vendorService: VendorService,
    private loader: NgxUiLoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUploadedDocs('');

    // Debounce for remote API searches
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.pageIndex = 1;
        this.loadUploadedDocs(term);
      });

    // Listen to input changes for local tier 1 search
    this.searchControl.valueChanges.subscribe(() => {
      this.onSearch();
    });
  }

  onSearch(): void {
    const term = (this.searchControl.value || '').trim().toLowerCase();

    if (!term) {
      // Search cleared! Restore base loaded records instantly
      if (this.allLoadedDocs && this.allLoadedDocs.length > 0) {
        this.filteredDocsList = [...this.allLoadedDocs];
        this.uploadedDocsList = [...this.allLoadedDocs];
      }
      // Reload fresh page 1 from server
      this.pageIndex = 1;
      this.loadUploadedDocs('');
      return;
    }

    // Tier 1: Search locally in base 10 loaded records
    const localMatches = this.allLoadedDocs.filter(doc => {
      const client = (doc.clientName || '').toLowerCase();
      const model = (doc.modelName || '').toLowerCase();
      const originalFile = (doc.originalFileName || '').toLowerCase();
      const savedFile = (doc.savedFileName || '').toLowerCase();
      const uploadedBy = (doc.fk_userId || '').toLowerCase();

      return client.includes(term) ||
             model.includes(term) ||
             originalFile.includes(term) ||
             savedFile.includes(term) ||
             uploadedBy.includes(term);
    });

    if (localMatches.length > 0) {
      // Matches found locally => Display instantly without API call!
      this.filteredDocsList = localMatches;
    } else {
      // Not found locally in current page => Trigger backend API search!
      this.searchSubject.next(term);
    }
  }

  loadUploadedDocs(searchTerm: string = ''): void {
    this.isLoading = true;
    this.loader.start();

    this.vendorService.getVendorExcelDocList(this.pageIndex, this.pageSize, searchTerm).subscribe({
      next: (res: any) => {
        this.loader.stop();
        this.isLoading = false;

        let docs: any[] = [];
        if (res && res.isSuccess && res.data) {
          if (Array.isArray(res.data)) {
            docs = res.data;
            this.totalCount = res.data.length;
          } else if (res.data.list) {
            docs = res.data.list || [];
            this.totalCount = res.data.totalCount || docs.length;
          } else {
            docs = [];
            this.totalCount = 0;
          }
        } else if (Array.isArray(res)) {
          docs = res;
          this.totalCount = res.length;
        } else {
          docs = [];
          this.totalCount = 0;
        }

        this.uploadedDocsList = docs;
        this.filteredDocsList = [...docs];

        // Store base loaded records when search term is empty
        if (!searchTerm || !searchTerm.trim()) {
          this.allLoadedDocs = [...docs];
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.isLoading = false;
        console.error('Error loading uploaded docs list:', err);
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadUploadedDocs(this.searchControl.value || '');
  }

  downloadDoc(item: any): void {
    if (!item || !item.pk_id) return;

    this.loader.start();
    this.vendorService.downloadVendorExcelDoc(item.pk_id).subscribe({
      next: (blob: Blob) => {
        this.loader.stop();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = item.originalFileName || `Vendor_Upload_${item.pk_id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      },
      error: (err: any) => {
        this.loader.stop();
        console.error('Error downloading file:', err);
        alert('Failed to download file. Please check if the file exists on the server.');
      }
    });
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  navigateToUpload(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/vendor_excel_upload']);
  }
}
