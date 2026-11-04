import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { FlexiSalaryService } from '../Service/flexi-head-bills.service';


@Component({
  selector: 'app-flexi-head-bills-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './flexi-head-bills-list.component.html',
  styleUrl: './flexi-head-bills-list.component.scss'
})
export class FlexiHeadBillsListComponent {
flexiBillList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private flexiSalaryService: FlexiSalaryService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.getFlexiBills();
    this.loader.stop();
  }

  getFlexiBills(): void {
    this.flexiSalaryService.getFlexiBills().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.flexiBillList = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.toastr.warning(res.message || 'No records found.');
        }
      },
      error: () => {
        this.toastr.error('Failed to load flexi head bills');
      }
    });
  }

  deleteBill(id: number): void {
    if (confirm('Are you sure you want to delete this flexi bill?')) {
      this.flexiSalaryService.deleteFlexiBill(id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message || 'Deleted successfully');
            this.getFlexiBills();
          } else {
            this.toastr.error(res.message || 'Failed to delete');
          }
        },
        error: () => {
          this.toastr.error('Delete operation failed');
        }
      });
    }
  }

  download(filename: string): void {
  this.flexiSalaryService.getImage(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Failed to download file:', err);
      this.toastr.error('Failed to download file');
    }
  });
}


  onPageChange(event: number): void {
    this.pageIndex = event;
  }

filteredData(): any[] {
  if (!this.searchText) return this.flexiBillList;
  const keyword = this.searchText.toString().toLowerCase();
  return this.flexiBillList.filter((bill: any) =>
    (bill.dated || '').toString().toLowerCase().includes(keyword) ||
    (bill.billDate || '').toString().toLowerCase().includes(keyword) ||
    (bill.amount || '').toString().toLowerCase().includes(keyword) ||
    (bill.description || '').toString().toLowerCase().includes(keyword) ||
    (bill.remarks || '').toString().toLowerCase().includes(keyword) ||
    (bill.status || '').toString().toLowerCase().includes(keyword)
  );
}


  exportToExcel(): void {
    if (!this.flexiBillList || this.flexiBillList.length === 0) {
      this.toastr.warning('No data available to export');
      return;
    }

    const filtered = this.flexiBillList.map(item => ({
      Date: item.dated,
      'Bill Date': item.billDate,
      Description: item.description,
      Amount: item.amount,
      Remarks: item.remarks,
      Status: item.status
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filtered);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flexi Bills');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = 'FlexiHeadBillList.xlsx';
    link.click();
  }
}
