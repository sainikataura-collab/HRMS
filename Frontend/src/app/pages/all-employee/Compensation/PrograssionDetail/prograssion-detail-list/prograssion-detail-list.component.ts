import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { PrograssionDetailService } from '../../../performance/Service/prograssion-detail.service';


@Component({
  selector: 'app-prograssion-detail-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './prograssion-detail-list.component.html',
  styleUrl: './prograssion-detail-list.component.scss'
})
export class PrograssionDetailListComponent {
 progressionList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private prograssionService: PrograssionDetailService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllProgressionDetails();
    this.loaderService.stop();
  }

  getAllProgressionDetails(): void {
    this.prograssionService.getAllPrograssionDetails().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.progressionList = res.data;
          this.totalItems = res.totalCount || res.data.length;
        } else {
          this.toastrService.warning(res.message || 'No data found.');
        }
      },
      error: () => {
        this.toastrService.error('Failed to load progression details.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllProgressionDetails();
  }

  filteredData(): any[] {
    if (!this.searchText) return this.progressionList;
    const text = this.searchText.toLowerCase();
    return this.progressionList.filter(item =>
      item.type?.toLowerCase().includes(text) ||
      item.date?.toLowerCase().includes(text) ||
      item.effectiveDate?.toLowerCase().includes(text) ||
      item.ctc?.toString().includes(text) ||
      item.percentage?.toString().includes(text) ||
      item.incrementAmount?.toString().includes(text) ||
      item.newCtc?.toString().includes(text)
    );
  }

  exportToExcel(): void {
    if (!this.progressionList || this.progressionList.length === 0) {
      this.toastrService.warning('No data available to export');
      return;
    }

    const excludedKeys = ['pk_progressionId', 'createdBy', 'updatedBy'];
    const columnMap: Record<string, string> = {
      type: 'Type',
      date: 'Date',
      effectiveDate: 'Effective Date',
      ctc: 'CTC',
      percentage: 'Percentage',
      incrementAmount: 'Increment Amount',
      newCtc: 'New CTC'
    };

    const data = this.progressionList.map((item: any) => {
      return Object.keys(item)
        .filter(k => !excludedKeys.includes(k))
        .reduce((obj: any, key: string) => {
          obj[columnMap[key] || key] = item[key];
          return obj;
        }, {});
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ProgressionDetails');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });

    const fileName = 'ProgressionDetails.xlsx';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileData);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
