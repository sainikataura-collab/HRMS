import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { SubsectionService } from '../../services/subsection.service';

@Component({
  selector: 'app-sub-section-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],  templateUrl: './sub-section-master-list.component.html',
  styleUrl: './sub-section-master-list.component.scss'
})
export class SubSectionMasterListComponent {
  subSectionList: any[] = [];
  searchText: string = '';

  constructor(
    private subsectionService : SubsectionService,
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
    this.getAllSubsectionDetails();
    this.loaderService.stop();
  }

  getAllSubsectionDetails(): void {
    this.subsectionService.getAllSubsections(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.subSectionList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to retrieve subsection data');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching subsection data');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllSubsectionDetails();
  }

  deleteSubsectionDetail(id: string): void {
    if (confirm('Are you sure you want to delete this subsection record?')) {
      this.subsectionService.deleteSubsection(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Subsection deleted successfully');
            this.getAllSubsectionDetails();
          } else {
            this.toastrService.error(response.message || 'Failed to delete subsection');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete subsection record');
        }
      });
    }
  }

  editSubsectionDetail(id: any) {
    this.router.navigate(['/dash/payroll/payrolldashboard/subSectionMaster', id]);
  }

  filteredData() {
    if (!this.searchText) {
      return this.subSectionList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.subSectionList.filter(subsection =>
      subsection.description?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.subsectionService.downloadExcel().subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        // Exclude unnecessary columns
        const excludedColumns = ['pk_subsecid', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'Timestamp', 'isPF'];
        // Rename columns if needed
        const columnMappings: Record<string, string> = {
          'fk_secid': 'UnderSection',
          'description': 'SectionCode',
          'maxlimit': 'MaxLimit',
          'active': 'Active'
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Subsection');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Direct Download (Without FileSaver)
        const fileName = 'SubsectionMasterList.xlsx';
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
