import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { HremployeeComplaintService } from '../../HRservices/hremployee-complaint.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-complaintmaster-list',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './complaintmaster-list.component.html',
  styleUrl: './complaintmaster-list.component.scss'
})
export class ComplaintmasterListComponent {
  ComplaintmasterList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private hremployeeComplaintService: HremployeeComplaintService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllComplaints();
    this.loaderService.stop();
  }

  getAllComplaints(): void {
    this.hremployeeComplaintService.getAllEmployeeComplaints(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          this.ComplaintmasterList = response.data;
          this.totalItems = response.totalCount;
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message || 'Failed to fetch complaints');
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching complaints');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllComplaints();
  }

  delete(pk_complaintId: string): void {
    if (confirm('Are you sure you want to delete this complaint?')) {
      this.hremployeeComplaintService.deleteEmployeeComplaint(pk_complaintId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Complaint deleted successfully');
            this.getAllComplaints();
          } else {
            this.toastrService.error(response.message || 'Failed to delete complaint');
          }
        },
        error: (error) => {
          console.error('Error deleting complaint:', error);
          this.toastrService.error('Failed to delete complaint');
        }
      });
    }
  }

  edit(pk_complaintId: string): void {
    this.router.navigate(['/dash/hr/hrdashboard/HR_Employee_Complaint_Mst',pk_complaintId]);
  }

  filteredData(): any[] {
    if (!this.searchText) {
      return this.ComplaintmasterList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.ComplaintmasterList.filter(item =>
      item.empname?.toLowerCase().includes(searchTextLower) ||
      item.complaintDate?.toLowerCase().includes(searchTextLower) ||
      item.complaintDetails?.toLowerCase().includes(searchTextLower) ||
      item.fk_empRaisedid?.toLowerCase().includes(searchTextLower)
    );
  }

  exportToExcel(): void {
    this.hremployeeComplaintService.downloadExcel().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data.length > 0) {
          // Exclude unnecessary columns
          const excludedColumns = ['pk_complaintId', 'fk_userId', 'fk_locId'];
          // Rename columns if needed
          const columnMappings: Record<string, string> = {
            empname: 'Employee Name',
            complaintDate: 'Complaint Date',
            complaintDetails: 'Complaint Details',
            fk_empRaisedid: 'Complaint Raised By'
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
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints');

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

          // Direct Download
          const fileName = 'ComplaintMasterList.xlsx';
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
  }}
