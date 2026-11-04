import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ProjectmasterService } from '../../RecruitServices/projectmaster.service';

@Component({
  selector: 'app-project-master-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    CommonModule,
  ],
  templateUrl: './project-master-list.component.html',
  styleUrl: './project-master-list.component.scss',
})
export class ProjectMasterListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  functionMasterList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;

  constructor(
    private ProjectService: ProjectmasterService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}
  ngOnInit(): void {
    this.get_functionMaster();
  }

  get_functionMaster(): void {
    this.ProjectService.get_ProjectMaster(
      this.pageIndex - 1,
      this.pageSize
    ).subscribe((res) => {
      if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.functionMasterList = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
      } else {
        console.error('Failed to retrieve data:', res.message);
        alert(res.message);
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.get_functionMaster(); // Fetch data for the selected page
  }

  filteredData() {
    if (!this.searchText) {
      return this.functionMasterList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.functionMasterList.filter(
      (functionMasterList) =>
        functionMasterList.projectcode?.toLowerCase().includes(searchTextLower) ||
        functionMasterList.projectname?.toLowerCase().includes(searchTextLower)
    );
  }

  // update functional master
  isUpdate(pk_ProjectId: string) {
    // console.log(addressId);
    this.router.navigateByUrl(
      '/dash/recruitment/recruitmentdashboard/ProjectMaster/' + pk_ProjectId
    );
  }

  // delete

  deleteFunctional(pk_ProjectId: string): void {
    if (confirm('Are you sure you want to delete this functional record?')) {
      console.log('Deleting Functional Record with ID:', pk_ProjectId); // Debugging log

      this.ProjectService.delete_ProjectMaster(pk_ProjectId).subscribe({
        next: (response) => {
          console.log('API Response:', response); // Log full response

          const success =
            response?.modelResponse?.isSuccess ?? response?.isSuccess; // Ensure it checks both cases
          const message =
            response?.modelResponse?.message ||
            response?.message ||
            'Delete failed!';

          if (success) {
            this.toastrService.success(message || 'Successfully deleted');
            this.get_functionMaster(); // Refresh table
          } else {
            this.toastrService.error(message); // Show API message
          }
        },
        error: (error) => {
          console.error('Error deleting functional record:', error);
          this.toastrService.error('Failed to delete account.');
        },
      });
    }
  }

  // download excel

  exportToExcel(): void {
    this.ProjectService.DownloadExcel().subscribe((res) => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['pk_ProjectId', 'fk_companyId'];

        const columnMappings: Record<string, string> = {
          code: 'code',
          description: 'description',
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter((key) => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet =
          XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorys');

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // *Direct Download (Without FileSaver)*
        const fileName = 'FunctionalMasterList.xlsx';
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
