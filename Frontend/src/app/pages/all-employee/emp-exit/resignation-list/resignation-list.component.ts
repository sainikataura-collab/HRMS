import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SeparationRequestService } from '../Services/Emp_resignation.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { DateTime } from 'luxon';


@Component({
  selector: 'app-resignation-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule],
  templateUrl: './resignation-list.component.html',
  styleUrl: './resignation-list.component.scss'
})
export class ResignationListComponent implements OnInit {
  resignationList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private separationRequestService: SeparationRequestService,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.getResignations();
  }

  getResignations() {

    this.separationRequestService
      .getAll(this.pageIndex, this.pageSize)
      .subscribe({
        next: (res: any) => {

          console.log('API Response =>', res);

          if (res.isSuccess) {

            this.resignationList = res.data;
            this.totalCount = res.totalCount;

            console.log('List =>', this.resignationList);
          }
        }
      });
  }

  filteredData() {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.resignationList;
    }

    const searchTextLower = this.searchText.toLowerCase().trim();

    return this.resignationList.filter(item => {
      const reason = item.reason ? String(item.reason).toLowerCase() : '';

      let statusStr = '';
      if (item.status == 1 || String(item.status).toLowerCase() === 'pending') {
        statusStr = 'pending';
      } else if (item.status == 2 || String(item.status).toLowerCase() === 'approved') {
        statusStr = 'approved';
      } else if (item.status == 3 || String(item.status).toLowerCase() === 'rejected') {
        statusStr = 'rejected';
      } else if (item.status == 4 || String(item.status).toLowerCase() === 'withdrawn') {
        statusStr = 'withdrawn';
      } else if (item.status == 5 || String(item.status).toLowerCase() === 'retained') {
        statusStr = 'retained';
      } else {
        statusStr = item.status ? String(item.status).toLowerCase() : '';
      }

      const remarks = item.remarks ? String(item.remarks).toLocaleLowerCase() : '';
      const resignationDate = item.resignationDate ? new Date(item.resignationDate).toLocaleDateString('en-GB') : '';
      const expectedLWD = item.expectedLWD ? new Date(item.expectedLWD).toLocaleDateString('en-GB').toLowerCase() : '';

      return reason.includes(searchTextLower) || statusStr.includes(searchTextLower) || remarks.includes(searchTextLower) || resignationDate.includes(searchTextLower) ||
        expectedLWD.includes(searchTextLower);
    });
  }

  edit(id: number) {

    const encryptedId =
      this.encryptionService.encryptText(id.toString());

    this.router.navigate([
      '/dash/emp-exit/emp-exitdashboard/resignation_form',
      encryptedId
    ]);
  }

  downloadPdf(id: number): void {

    this.separationRequestService
      .downloadPdf(id)
      .subscribe({

        next: (response: Blob) => {

          const file = new Blob(
            [response],
            {
              type: 'application/pdf'
            });

          const url = window.URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Resignation_Report.pdf';
          link.click();
          window.URL.revokeObjectURL(url);
        },

        error: () => {
          this.toastrService.error(
            'Failed to download PDF.'
          );
        }
      });

  }

  withdraw(id: number): void {
    if (!confirm('Are you sure you want to withdraw this resignation?')) {
      return;
    }
    this.separationRequestService
      .withdraw(id)
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.getResignations();
          }
          else {
            this.toastrService.error(res.message);
          }
        }
      });
  }

  delete(id: number): void {
    if (confirm('Are you sure?')) {

      this.separationRequestService.delete(id)
        .subscribe({
          next: (res: any) => {

            if (res.isSuccess) {
              this.toastrService.success(res.message);
              this.getResignations();
            }
          }
        });
    }
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getResignations();
  }

  exportToExcel(): void {
    if (this.resignationList.length > 0) {
      const formattedData = this.resignationList.map((item: any) => ({
        'Resignation Date': item.resignationDate
          ? new Date(item.resignationDate)
            .toLocaleDateString('en-GB')
            .replace(/\//g, '-')
          : '',
        'Expected LWD': item.expectedLWD
          ? new Date(item.expectedLWD)
            .toLocaleDateString('en-GB')
            .replace(/\//g, '-')
          : '',
        'Reason': item.reason,
        'Notice Period': item.noticePeriod,
        'Notice Period Served': item.isNoticePeriodServed ? 'Yes' : 'No',
        'Remarks': item.remarks,
        'Status': item.status,
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Resignations');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileName = 'MyResignations.xlsx';
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
}
