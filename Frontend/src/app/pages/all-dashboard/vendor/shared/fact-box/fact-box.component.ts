import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-fact-box',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, NgxPaginationModule],
  templateUrl: './fact-box.component.html',
  styleUrls: ['./fact-box.component.scss']
})
export class FactBoxComponent {
  @Input() title: string = 'Fact Box';
  @Input() files: any[] = [];
  @Input() isLoading: boolean = false;
  @Input() isOpen: boolean = false;

  // Pagination inputs (can be overridden by parent for server-side pagination)
  @Input() totalItems?: number;
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 5;

  @Output() onToggle = new EventEmitter<void>();
  @Output() onDownload = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<number>();

  toggleFactBox(): void {
    this.onToggle.emit();
  }

  downloadUploadedFile(item: any): void {
    this.onDownload.emit(item);
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.onPageChange.emit(page);
  }

  getUploaderDisplayName(item: any): string {
    const uploaderStr = item.uploadedByName || item.uploadedBy || item.UploadedBy || item.uploadedby || item.fk_userId || item.fk_InsUserID || 'Unknown';
    if (!uploaderStr || uploaderStr === 'Unknown') return 'Unknown';
    if (uploaderStr.includes('-')) {
      const parts = uploaderStr.split('-');
      return parts.slice(1).join('-').trim();
    }
    return uploaderStr;
  }
}
