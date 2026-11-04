import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { HrConfirmationEmailService } from '../../HRservices/hr-confirmation-email.service';

@Component({
  selector: 'app-hr-confirmation-emailsetting-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './hr-confirmation-emailsetting-list.component.html',
  styleUrl: './hr-confirmation-emailsetting-list.component.scss'
})
export class HrConfirmationEmailsettingListComponent {
  hrEmailSettingList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private hrConfirmationEmailSettingService: HrConfirmationEmailService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.getAllEmailSettings();
    this.loader.stop();
  }

  getAllEmailSettings(): void {
    this.hrConfirmationEmailSettingService.getAllConfirmationEmails(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.hrEmailSettingList = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to fetch records.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllEmailSettings();
  }

  edit(id: number): void {
    this.router.navigate(['/dash/hr/hrdashboard/HR_Confirmation_EmailSetting', id]);
  }

  delete(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.hrConfirmationEmailSettingService.deleteConfirmationEmail(id).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getAllEmailSettings();
          } else {
            this.toastr.error(res.message);
          }
        },
        error: () => {
          this.toastr.error('Error deleting record.');
        }
      });
    }
  }

  filteredData() {
    if (!this.searchText) return this.hrEmailSettingList;
    const search = this.searchText.toLowerCase();
    return this.hrEmailSettingList.filter(
      item =>
        item.ordernodes?.toLowerCase().includes(search) ||
        item.days?.toString().includes(search)
    );
  }

  exportToExcel(): void {
    this.hrConfirmationEmailSettingService.downloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['id'];
        const columnMappings: Record<string, string> = {
          ordernodes: 'Description',
          days: 'Days'
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'HR Confirmation Email Settings');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileName = 'HRConfirmationEmailSettingList.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastr.warning('No data available to export');
      }
    });
  }
}
