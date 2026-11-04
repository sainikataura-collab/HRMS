import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { CTCService } from '../../../performance/Service/ctc.service';

@Component({
  selector: 'app-ctc',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './ctc.component.html',
  styleUrl: './ctc.component.scss'
})
export class CTCComponent {
ctcList: any[] = [];
  ctcGross: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private ctcService: CTCService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllCTC();
    this.loaderService.stop();
  }

  getAllCTC(): void {
    this.ctcService.getAllCTC().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ctcList = res.data.ctcList || [];
          this.ctcGross = res.data.ctcGross || [];
          this.totalItems = this.ctcList.length;
        } else {
          this.toastrService.warning(res.message || 'No CTC data found.');
        }
      },
      error: () => {
        this.toastrService.error('Failed to load CTC details.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
  }

  filteredData(): any[] {
    if (!this.searchText) return this.ctcList;
    const text = this.searchText.toLowerCase();
    return this.ctcList.filter(item =>
      item.shortdesc?.toLowerCase().includes(text) ||
      item.amount?.toString().includes(text) ||
      item.amount_yearly?.toString().includes(text)
    );
  }

  exportToExcel(): void {
    if (!this.ctcList || this.ctcList.length === 0) {
      this.toastrService.warning('No CTC data available to export');
      return;
    }

    const columnMap: Record<string, string> = {
      shortdesc: 'Description',
      amount: 'Amount (Monthly)',
      amount_yearly: 'Amount (Yearly)'
    };

    const data = this.ctcList.map((item: any) => {
      return {
        [columnMap['shortdesc']]: item.shortdesc,
        [columnMap['amount']]: item.amount,
        [columnMap['amount_yearly']]: item.amount_yearly
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CTCDetails');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const fileName = 'CTCDetails.xlsx';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileData);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
