import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CustomerRateCardService } from '../../services/customer-rate-card.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-customer-rate-card-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './customer-rate-card-list.component.html',
  styleUrl: './customer-rate-card-list.component.scss'
})
export class CustomerRateCardListComponent implements OnInit {
  searchText: string = '';
  searchTerm: string = '';
  list: any[] = [];
  filteredMaster: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private service: CustomerRateCardService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.getList();
  }

  onPageChange(event: number): void {
    this.page = event;
    this.getList();
  }

  getList() {
    this.ngxUILoaderService.start();
    this.service.getAll(this.page - 1, this.pageSize, this.searchText).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // If the list is directly inside data
          this.list = res.data.list || res.data || [];
          this.totalItems = res.data.totalCount || this.list.length;
          this.applyFilter();
        } else {
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("An error occurred while loading rate card list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredMaster = this.list;
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.filteredMaster = this.list.filter(req =>
      req.CustomerName?.toString().toLowerCase().includes(searchLower) ||
      req.LocationName?.toString().toLowerCase().includes(searchLower) ||
      req.CategoryName?.toString().toLowerCase().includes(searchLower) ||
      req.ServiceTypeName?.toString().toLowerCase().includes(searchLower) ||
      req.WorkDuration?.toString().toLowerCase().includes(searchLower)
    );
  }

  onSearchTextChanged(): void {
    this.applyFilter();
    if (this.filteredMaster.length === 0 && this.searchText.trim()) {
      this.searchTerm = this.searchText.trim();
      this.page = 1;
      this.getList();
    } else if (!this.searchText.trim()) {
      this.searchTerm = '';
      this.getList();
    }
  }

  edit(id: any) {
    this.router.navigate(["/dash/user/userdashboard/customerRateCard", id]);
  }

  deleteRecord(rateCardId: any) {
    if (confirm("Are you sure you want to delete this Rate Card record?")) {
      this.ngxUILoaderService.start();
      this.service.delete(rateCardId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || "Deleted successfully!");
            this.getList();
          } else {
            this.toastrService.error(res.message || "Failed to delete.");
            this.ngxUILoaderService.stop();
          }
        },
        error: () => {
          this.toastrService.error("An error occurred while deleting.");
          this.ngxUILoaderService.stop();
        }
      });
    }
  }

  exportToExcel(): void {
    this.ngxUILoaderService.start();
    this.service.DownloadExcel().subscribe({
      next: (res) => {
        const listData = res.data?.list || res.data;
        if (res.isSuccess && listData && listData.length > 0) {
          const excludedColumns = ['RateCardId', 'rateCardId', 'fk_CompanyId', 'isActive', 'entryBy'];

          const columnMappings: Record<string, string> = {
            rateCardId: 'Rate Card ID',
            customerId: 'Customer ID',
            locationId: 'Location ID',
            serviceTypeId: 'Service Type ID',
            categoryId: 'Category ID',
            workDuration: 'Work Duration',
            entryBy: 'Entry By',
            entryDate: 'Entry Date'
          };

          const filteredData = listData.map((item: Record<string, any>) => {
            return Object.keys(item)
              .filter(key => !excludedColumns.includes(key))
              .reduce((obj: Record<string, any>, key: string) => {
                obj[columnMappings[key] || key] = item[key];
                return obj;
              }, {});
          });

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'RateCards');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          const fileName = 'CustomerRateCardList.xlsx';
          const link = document.createElement('a');
          link.href = URL.createObjectURL(data);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.ngxUILoaderService.stop();
        } else {
          this.toastrService.warning('No data available to export');
          this.ngxUILoaderService.stop();
        }
      },
      error: () => {
        this.toastrService.error('Failed to download excel');
        this.ngxUILoaderService.stop();
      }
    });
  }
}
