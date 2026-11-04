import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DueclearencemasterService } from '../Service/dueclearencemaster.service';

@Component({
  selector: 'app-dueclearencemaster-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './dueclearencemaster-list.component.html',
  styleUrl: './dueclearencemaster-list.component.scss'
})
export class DueclearencemasterListComponent {
  searchText: string = '';
  Dueclearencelist: any[] = [];

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private httpService: DueclearencemasterService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService,
    private loader: NgxUiLoaderService,
    public encryption: EncryptionService
  ) { }

  ngOnInit() {
    this.get_DeuClearence();
  }

  onPageChange(event: number): void {
    this.pageIndex = event;

    if (!this.searchText.trim()) {
      this.get_DeuClearence();
    }
  }

  filteredData() {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.Dueclearencelist;
    }

    const searchTextLower = this.searchText.toLowerCase().trim();

    return this.Dueclearencelist.filter(item => {
      const department = item.department ? String(item.department).toLowerCase() : '';
      const isActive = item.isActive !== undefined ? String(item.isActive).toLowerCase() : '';
      const pkId = item.pk_clsdeptId ? String(item.pk_clsdeptId).toLowerCase() : '';

      const assets = item.assets ? String(item.assets).toLowerCase() : '';
      const parameters = item.parameters ? String(item.parameters).toLowerCase() : '';
      const parameterNames = item.parameterNames ? String(item.parameterNames).toLowerCase() : '';

      return department.includes(searchTextLower) ||
        assets.includes(searchTextLower) ||
        parameters.includes(searchTextLower) ||
        parameterNames.includes(searchTextLower) ||
        isActive.includes(searchTextLower) ||
        pkId.includes(searchTextLower);
    });
  }

  get filteredCount(): number {
    return this.filteredData().length;
  }

  clearSearch(): void {
    this.searchText = '';
    this.pageIndex = 1;
  }

  isUpdate(pk_clsdeptId: string) {
    const encryptedId = this.encryption.encryptText(pk_clsdeptId.toString());

    this.router.navigate([
      '/dash/exit/exitdashboard/due_clearance',
      encryptedId
    ]);
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.loader.start();

      this.httpService.delete_ClaranceUser(id).subscribe({
        next: (res) => {
          this.loader.stop();

          if (res.isSuccess) {
            this.toastrService.success('Deleted successfully');
            this.get_DeuClearence();
          } else {
            this.toastrService.error(res.message || 'Delete failed');
            this.get_DeuClearence();
          }
        },
        error: (err) => {
          this.loader.stop();
          this.toastrService.error('Delete failed');
          console.error(err);
        }
      });
    }
  }

  exportToExcel(): void {
    this.httpService.DownloadExcel().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data.length > 0) {
          const formattedData = res.data.map((item: any) => ({
            'Department': item.department,
            'Assets / Parameters': item.assets || item.parameters || item.parameterNames || '',
            'Active': item.isActive
          }));

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
          const workbook: XLSX.WorkBook = XLSX.utils.book_new();

          XLSX.utils.book_append_sheet(workbook, worksheet, 'DueClearence');

          const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
          });

          const data: Blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });

          const fileName = 'DueClearence.xlsx';
          const link = document.createElement('a');

          link.href = URL.createObjectURL(data);
          link.setAttribute('download', fileName);

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          this.toastrService.warning('No data available to export');
        }
      },
      error: (err) => {
        this.toastrService.error('Excel download failed');
        console.error(err);
      }
    });
  }

  get_DeuClearence(): void {
    this.loader.start();

    this.httpService.GetAll(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        this.loader.stop();

        if (res.isSuccess) {
          this.Dueclearencelist = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.Dueclearencelist = [];
          this.totalItems = 0;
          this.toastrService.error(res.message || 'Failed to retrieve data');
        }
      },
      error: (err) => {
        this.loader.stop();
        this.Dueclearencelist = [];
        this.totalItems = 0;
        this.toastrService.error('Error retrieving data');
        console.error(err);
      }
    });
  }
}