import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { SpecializationMasterService } from '../../RecruitServices/specialization-master.service';

@Component({
  selector: 'app-specialization-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './specialization-master-list.component.html',
  styleUrl: './specialization-master-list.component.scss'
})
export class SpecializationMasterListComponent {

  specializationList: any[] = [];
  searchText: string = '';

  constructor(
    private specializationMasterService: SpecializationMasterService,
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
    this.getAllSpecializationDetails();
    this.loaderService.stop();
  }

  getAllSpecializationDetails(): void {
    this.specializationMasterService.getAllSpecialization(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.specializationList = response.data;
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
    this.getAllSpecializationDetails();
  }

  deleteSpecializationDetail(pk_SpecializationId: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.specializationMasterService.deleteSpecialization(pk_SpecializationId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Specialization deleted successfully!');
            this.getAllSpecializationDetails();
          } else {
            this.toastrService.error(response.message || 'Failed to delete specialization.');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete record.');
        }
      });
    }
  }

  editSpecializationDetail(pk_specializationId: any) {
    this.router.navigate(['/dash/recruitment/recruitmentdashboard/specialization-master', pk_specializationId]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.specializationList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.specializationList.filter(detail =>
      detail.name?.toLowerCase().includes(searchTextLower) ||
      detail.type?.toLowerCase().includes(searchTextLower) ||
      detail.description?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.specializationMasterService.DownloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        // Exclude unnecessary columns
        const excludedColumns = ['pk_SpecializationId', 'Active Status', 'fk_companyId', 'fk_updDateID','fk_insUserID','fk_updUserID','fk_insDateID',''];
        // Rename columns if needed
        const columnMappings: Record<string, string> = {
          name: 'Name',
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Specialization');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Direct Download (Without FileSaver)
        const fileName = 'SpecializationMasterList.xlsx';
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
  }}
