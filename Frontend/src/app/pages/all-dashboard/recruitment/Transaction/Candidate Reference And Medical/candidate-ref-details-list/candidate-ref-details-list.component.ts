import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { CandidateRefAndMedService } from '../../../RecruitServices/candidate-ref-and-med.service';

@Component({
  selector: 'app-candidate-ref-details-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './candidate-ref-details-list.component.html',
  styleUrl: './candidate-ref-details-list.component.scss',
})
export class CandidateRefDetailsListComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  refList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;


 

  constructor(
    private service: CandidateRefAndMedService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.getAllRefDetails();
  }


 

  getAllRefDetails(): void {
    this.service.getAllReferences().subscribe((res) => {
      if (res?.isSuccess && res?.data?.length > 0) {
        this.refList = res.data;
        this.totalItems = res.data.length;
      } else {
        this.toastrService.warning(res?.message || 'No records found.');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllRefDetails();
  }

  filteredData() {
    if (!this.searchText) {
      return this.refList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.refList.filter(
      (x) =>
        x.refname?.toLowerCase().includes(searchTextLower) ||
        x.compname?.toLowerCase().includes(searchTextLower) ||
        x.designation?.toLowerCase().includes(searchTextLower)
    );
  }

  download(filename: string) {
    this.service.getImage(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // Set the filename for download
        a.click();
        window.URL.revokeObjectURL(url); // Clean up
      },
      error: (err) => {
        console.error('Failed to load image:', err);
      },
    });
  }

  isUpdate(pk_rtrnid: string): void {
    this.router.navigateByUrl(
      '/dash/recruitment/recruitmentdashboard/CandidateRefrenceDetails/' +
        pk_rtrnid
    );
  }

  deleteReference(pk_rtrnid: number): void {
    if (confirm('Are you sure you want to delete this reference record?')) {
      this.service.deleteReference(pk_rtrnid).subscribe({
        next: (response) => {
          const success = response?.isSuccess;
          const message = response?.message || 'Operation failed';

          if (success) {
            this.toastrService.success(message || 'Successfully deleted');
            this.getAllRefDetails();
          } else {
            this.toastrService.error(message);
          }
        },
        error: (error) => {
          console.error('Error deleting reference record:', error);
          this.toastrService.error('Failed to delete record.');
        },
      });
    }
  }

  exportToExcel(): void {
    debugger;
    this.service.DownloadExcel().subscribe((res) => {
      if (res?.length > 0) {
        const excludedColumns = ['pk_rtrnid'];
        const columnMappings: Record<string, string> = {
          refname: 'Candidate Name',
          compname: 'Reference Name',
          designation: 'Mobile Number',
          mobile: 'Remarks',
          email: 'Email',
          phone: 'phone',
          address: 'Address',
        };

        const filteredData = res.map((item: Record<string, any>) => {
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ReferenceDetails');

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fileName = 'CandidateReferenceDetailsList.xlsx';
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
