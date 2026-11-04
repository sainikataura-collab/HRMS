import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { appraisalService } from '../appraisal.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
@Component({
  selector: 'app-appraisal-master-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule, NgxPaginationModule, CommonModule],
  templateUrl: './appraisal-master-list.component.html',
  styleUrl: './appraisal-master-list.component.scss'
})
export class AppraisalMasterListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  appraisalList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;

  constructor(
    private appraisalService: appraisalService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getAllAppraisals();
  }

  getAllAppraisals(): void {
    this.appraisalService.getAll_Appraisal(this.pageIndex - 1, this.pageSize).subscribe(res => {
      if (res.isSuccess) {
        this.appraisalList = res.data;
        this.totalItems = res.totalCount;
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllAppraisals();
  }

  filteredData() {
    if (!this.searchText) {
      return this.appraisalList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.appraisalList.filter(appraisal =>
      appraisal.description?.toLowerCase().includes(searchTextLower) ||
      appraisal.fk_finid?.toLowerCase().includes(searchTextLower) ||
      appraisal.active?.toLowerCase().includes(searchTextLower)
    );
  }

  isUpdate(pk_appId: string) {
    this.router.navigateByUrl("/dash/appraisal/appraisaldashboard/AppraisalMaster/" + pk_appId);
  }

  deleteAppraisal(pk_appId: string): void {
    if (confirm('Are you sure you want to delete this appraisal record?')) {
      this.appraisalService.delete_Appraisal(pk_appId).subscribe({
        next: (response) => {
          const success = response?.modelResponse?.isSuccess ?? response?.isSuccess;
          const message = response?.modelResponse?.message || response?.message || "Delete failed!";

          if (success) {
            this.toastrService.success(message || "Successfully deleted");
            this.getAllAppraisals();
          } else {
            this.toastrService.error(message);
          }
        },
        error: (error) => {
          console.error('Error deleting appraisal record:', error);
          this.toastrService.error('Failed to delete record.');
        }
      });
    }
  }

  exportToExcel(): void {
    this.appraisalService.downloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_appId', 'remarks', 'timestamp', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID','fk_finid'];

        const columnMappings: Record<string, string> = {
          description: 'Description',
          fYear: 'Financial Year',
          active: 'Active'
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Appraisals');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fileName = 'AppraisalMasterList.xlsx';
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
