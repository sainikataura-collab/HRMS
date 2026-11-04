import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { VisitorService } from '../../visitor.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
    imports: [
      RouterLink,
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      NgxPaginationModule
    ],
  templateUrl: './visitor-list.component.html',
  styleUrl: './visitor-list.component.scss'
})
export class VisitorListComponent {
visitorList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private visitorService: VisitorService,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.getAllVisitors();
    this.loader.stop();
  }

  getAllVisitors(): void {
    this.visitorService.getAllVisitors(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.visitorList = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.toastr.warning(res.message || 'No records found.');
        }
      },
      error: () => {
        this.toastr.error('Error fetching visitor records');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllVisitors();
  }

  filteredData(): any[] {
    if (!this.searchText) return this.visitorList;

    const keyword = this.searchText.toLowerCase();
    return this.visitorList.filter((item) =>
      item.visitorName?.toLowerCase().includes(keyword) ||
      item.visitorMobileNo?.toLowerCase().includes(keyword) ||
      item.visitorEmail?.toLowerCase().includes(keyword) ||
      item.whomtoMeet?.toLowerCase().includes(keyword) ||
      item.visitPurpose?.toLowerCase().includes(keyword)
    );
  }

  edit(visitorId: number): void {
    const encryptedId = this.encryptionService.encryptText(visitorId.toString());
    this.router.navigate(['/dash/visitor/visitorentry', encryptedId]);
  }

  viewDetails(visitor: any): void {
    alert(`Visitor Details:\n\n${JSON.stringify(visitor, null, 2)}`);
  }

  download(photoName: string): void {
    this.toastr.info(`Download not implemented for: ${photoName}`);
  }
}
