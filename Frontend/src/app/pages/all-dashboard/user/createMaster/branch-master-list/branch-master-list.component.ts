import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BranchMstService } from '../../services/branch-mst.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-branch-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './branch-master-list.component.html',
  styleUrl: './branch-master-list.component.scss'
})
export class BranchMasterListComponent {

   searchText: string = '';
  list: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private service: BranchMstService,
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getList();
  }

  // ===================== PAGINATION =====================
  onPageChange(event: number) {
    this.pageIndex = event;
    this.getList();
  }

  // ===================== SEARCH =====================
  filteredData() {
    if (!this.searchText) return this.list;

    const search = this.searchText.toLowerCase();

    return this.list.filter(res =>
      res.BranchName?.toLowerCase().includes(search) ||
      res.CityName?.toLowerCase().includes(search) ||
      res.PhoneNumber?.toLowerCase().includes(search)
    );
  }

  // ===================== GET LIST =====================
  getList() {
    this.ngxUILoaderService.start();

    this.service.get_All(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.toastrService.error(res.message);
        }
        this.ngxUILoaderService.stop();
      }
    });
  }

  // ===================== EXPORT =====================
  exportToExcel(): void {
    this.service.downloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {

        const excludedColumns = ['pk_branchId'];

        const filteredData = res.data.map((item: any) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: any, key: string) => {
              obj[key] = item[key];
              return obj;
            }, {});
        });

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Branch');

        const buffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        const blob: Blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Branch_List.xlsx';
        link.click();
      } else {
        this.toastrService.warning('No data available');
      }
    });
  }

  // ===================== EDIT =====================
  edit(id: number) {
    const encryptedId = this.encryption.encryptText(id.toString());

    this.router.navigate([
      '/dash/user/userdashboard/BranchMaster',
      encryptedId
    ]);
  }

  // ===================== DELETE =====================
  delete(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {

      this.service.delete(id).subscribe((res: any) => {

        if (res.isSuccess) {

          this.toastrService.success(res.message || 'Deleted successfully');

          this.list = this.list.filter(x => x.pk_branchId !== id);
          this.totalItems--;

          if (this.list.length === 0) {
            this.getList();
          }

        } else {
          this.toastrService.error(res.message);
        }
      });
    }
  }
}
