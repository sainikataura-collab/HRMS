import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { CommonModule } from '@angular/common';

import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { TaxDeductorService } from '../../services/tax-deductor.service';

@Component({
  selector: 'app-tax-deductor-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule,RouterLink],
  templateUrl: './tax-deductor-list.component.html',
  styleUrl: './tax-deductor-list.component.scss'
})
export class TaxDeductorListComponent {
  TaxDeductorList: any[] = [];
  searchText: string = '';

  constructor(
    private taxDeductorService: TaxDeductorService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllTaxDeductors();
    this.loaderService.stop();
  }

  getAllTaxDeductors(): void {
    this.taxDeductorService.get_TaxDeductor(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.TaxDeductorList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve tax deductor data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching tax deductor data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllTaxDeductors();
  }

  deleteTaxDeductor(id: number): void {
    if (confirm('Are you sure you want to delete this tax deductor?')) {
      this.taxDeductorService.delete_TaxDeductor(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Tax Deductor deleted successfully');
            this.getAllTaxDeductors();
          } else {
            this.toastrService.error(response.message || 'Failed to delete tax deductor');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete tax deductor record');
        }
      });
    }
  }

  editTaxDeductor(pk_dedId: any) {
    this.router.navigate(['/dash/payroll/payrolldashboard/taxDeductor', pk_dedId]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.TaxDeductorList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.TaxDeductorList.filter(taxDeductor =>
      taxDeductor.DeductorName?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.taxDeductorService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_taxdeductorid', 'code', 'fk_companyId'];
        const columnMappings: Record<string, string> = {};

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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TaxDeductor');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const fileName = 'TaxDeductorList.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }
}
