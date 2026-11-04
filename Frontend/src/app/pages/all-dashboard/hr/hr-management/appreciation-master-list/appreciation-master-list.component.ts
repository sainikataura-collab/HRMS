import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { HrAppreciationMasterService } from '../../HRservices/hr-appreciation-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';


@Component({
  selector: 'app-appreciation-master-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './appreciation-master-list.component.html',
  styleUrl: './appreciation-master-list.component.scss'
})
export class AppreciationMasterListComponent {
  AppreciationMasterList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private hrAppreciationMasterService: HrAppreciationMasterService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllAppreciations();
    this.loaderService.stop();
  }

  getAllAppreciations(): void {
    this.hrAppreciationMasterService.getAllAppreciations(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.AppreciationMasterList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to fetch appreciations');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching appreciations');
      }
    });
  }


  download(filename: string) {
    this.hrAppreciationMasterService.getImage(filename).subscribe({
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
      }
    });
  }
  

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllAppreciations();
  }

  delete(pk_appreciationId: string): void {
    if (confirm('Are you sure you want to delete this appreciation?')) {
      this.hrAppreciationMasterService.deleteAppreciation(pk_appreciationId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Appreciation deleted successfully');
            this.getAllAppreciations();
          } else {
            this.toastrService.error(response.message || 'Failed to delete appreciation');
          }
        },
        error: (error) => {
          console.error('Error deleting appreciation:', error);
          this.toastrService.error('Failed to delete appreciation');
        }
      });
    }
  }

  edit(pk_appreciationId: number): void {
    const encryptedId = this.encryptionService.encryptText(pk_appreciationId.toString());
    this.router.navigate(['/dash/hr/hrdashboard/Appreciation_Mst', encryptedId]);
  }

  filteredData(): any[] {
    if (!this.searchText) {
      return this.AppreciationMasterList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.AppreciationMasterList.filter(item =>
      item.empname?.toLowerCase().includes(searchTextLower) ||
      item.incidentDate?.toLowerCase().includes(searchTextLower) ||
      item.incidentDetails?.toLowerCase().includes(searchTextLower) ||
      item.type?.toLowerCase().includes(searchTextLower) ||
      item.filename?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.hrAppreciationMasterService.downloadExcel().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data.length > 0) {
          // Exclude unnecessary columns
          const excludedColumns = ['pk_appreciationId', 'fk_userId', 'fk_locId', 'fk_InsuserId', 'fk_UpduserId', 'fk_InsdateId', 'fk_UpddateId', 'contenttype', 'fileContentType', 'attachment','fk_empid','Appreciation Date','fk_empApreid','incidentDate'];
          // Rename columns if needed
          const columnMappings: Record<string, string> = {
            type: 'Type',
            empName: 'Employee Name',
            apprId: 'Appreciator Name',
            date: 'Appreciation Date',
            incidentDetails: 'Incident Details',
            filename: 'Filename',
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
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Appreciations');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          // Direct Download
          const fileName = 'AppreciationMasterList.xlsx';
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
      error: (error) => {
        console.error('Error downloading Excel:', error);
        this.toastrService.error('Failed to download Excel');
      }
    });
  }
}
