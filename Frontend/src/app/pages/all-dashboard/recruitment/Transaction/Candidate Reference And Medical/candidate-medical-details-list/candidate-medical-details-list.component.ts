import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { CandidateRefAndMedService } from '../../../RecruitServices/candidate-ref-and-med.service';


@Component({
  selector: 'app-candidate-medical-details-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    CommonModule,
  ], 
  templateUrl: './candidate-medical-details-list.component.html',
  styleUrl: './candidate-medical-details-list.component.scss'
})
export class CandidateMedicalDetailsListComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

  searchText: string = '';
  medicalList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;

  constructor(
    private service: CandidateRefAndMedService,
    private fb: FormBuilder,
    public router: Router,
    private toastrService: ToastrService,
    public encryptionService:EncryptionService
  ) {}

  ngOnInit(): void {
    this.getAllMedicalDetails();
  }

getAllMedicalDetails(): void {
  this.service.getAllMedical().subscribe((res) => {
    if (res?.isSuccess && res?.data?.length > 0) {
      this.medicalList = res.data;
      this.totalItems = res.data.length;
    } else {
      this.toastrService.warning(res?.message || 'No records found.');
    }
  });
}


   onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.getAllMedicalDetails(); // Fetch data for the selected page
  }

  filteredData() {
    if (!this.searchText) {
      return this.medicalList;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.medicalList.filter(
      (x) =>
        x.description?.toLowerCase().includes(searchTextLower) ||
        x.dated?.toLowerCase().includes(searchTextLower) ||
        x.report?.toLowerCase().includes(searchTextLower) 
    );
  }

  isUpdate(pk_mtrnid: string): void {
    this.router.navigateByUrl(
      '/dash/recruitment/recruitmentdashboard/CandidateMedicalDetails/' + pk_mtrnid
    );
  }

  deleteMedical(pk_mtrnid: number): void {
    if (confirm('Are you sure you want to delete this medical record?')) {
      this.service.deleteMedical(pk_mtrnid).subscribe({
        next: (response) => {
          const success = response?.isSuccess ?? false;
          const message = response?.message || 'Operation failed';

          if (success) {
            this.toastrService.success(message || 'Successfully deleted');
            this.getAllMedicalDetails();
          } else {
            this.toastrService.error(message);
          }
        },
        error: (error) => {
          console.error('Error deleting medical record:', error);
          this.toastrService.error('Failed to delete record.');
        },
      });
    }
  }

  exportToExcel(): void {
    this.service.getAllMedical().subscribe((res) => {
      if (res?.length > 0) {
        const excludedColumns = ['pk_MedicalId'];
        const columnMappings: Record<string, string> = {
          candidateName: 'Candidate Name',
          medicalStatus: 'Medical Status',
          remarks: 'Remarks',
        };

        const filteredData = res.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter((key) => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MedicalDetails');

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fileName = 'CandidateMedicalDetailsList.xlsx';
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
