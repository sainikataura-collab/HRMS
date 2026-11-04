import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { QualificationMasterService } from '../../RecruitServices/qualification-master.service';

@Component({
  selector: 'app-qualification-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './qualification-master-list.component.html',
  styleUrl: './qualification-master-list.component.scss'
})
export class QualificationMasterListComponent {

  qualificationList: any[] = [];
  searchText: string = '';

  constructor(
    private qualificationMasterService: QualificationMasterService,
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
    this.getAllQualificationDetails();
    this.loaderService.stop();
  }

  getAllQualificationDetails(): void {
    this.qualificationMasterService.getAllQualification(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.qualificationList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching data. Please try again.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllQualificationDetails();
  }

  deleteQualificationDetail(pk_qualiId: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.qualificationMasterService.deleteQualification(pk_qualiId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Qualification deleted successfully!');
            this.getAllQualificationDetails();
          } else {
            this.toastrService.error(response.message || 'Failed to delete qualification.');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete record.');
        }
      });
    }
  }

  editQualificationDetail(pk_qualiId: any) {
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/qualification-master', pk_qualiId]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.qualificationList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.qualificationList.filter(detail =>
      detail.qualification?.toLowerCase().includes(searchTextLower) ||
      detail.type?.toLowerCase().includes(searchTextLower) ||
      detail.description?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.qualificationMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        // Exclude unnecessary columns
        const excludedColumns = ['pk_qualiId', 'fk_companyId', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'Timestamp'];
        // Rename columns if needed
        const columnMappings: Record<string, string> = {
          qualification: 'Qualification',
          type: 'Type',
          description: 'Description',
          isActive: 'Active Status'
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Qualification');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Direct Download (Without FileSaver)
        const fileName = 'QualificationMasterList.xlsx';
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
