import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmpweekoffmasterService } from '../../../payroll/services/empweekoffmaster.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-empweekoffmasterlist',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule,FormsModule],
  templateUrl: './empweekoffmasterlist.component.html',
  styleUrl: './empweekoffmasterlist.component.scss'
})
export class EmpweekoffmasterlistComponent {
  weekOffData: any[] = [];
  searchText: string = '';

  constructor(
    private empweekoffmasterService: EmpweekoffmasterService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    public encryptionService: EncryptionService
  ) {}

  router = inject(Router);
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllEmpWeeklyOff();
    this.loaderService.stop();
  }

  getAllEmpWeeklyOff(): void {
    this.empweekoffmasterService.getAllEmpWeeklyOff(this.pageIndex - 1, this.pageSize).subscribe({
      next: (response) => {
        console.log('Data retrieved successfully:', response);
        if (response.isSuccess) {
          console.log('Data retrieved successfully:', response.data);
          this.weekOffData = response.data;
          this.totalItems = response.totalCount;
          console.log(this.totalItems, 'this is total items retrieved');
        } else {
          console.error('Failed to retrieve data:', response.message);
          this.toastrService.error(response.message);
        }
      },
      error: (error) => {
        console.error('Error retrieving data:', error);
        this.toastrService.error('Error fetching employee weekly off data. Please try again.');
      },
      complete: () => {
        console.log('Data retrieval completed.');
        this.loaderService.stop(); // Ensure loader stops even on error
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.getAllEmpWeeklyOff(); // Fetch data for the selected page
  }

  deleteWeekOff(woffId: string): void {
    if (confirm('Are you sure you want to delete this employee weekly off entry?')) {
      this.empweekoffmasterService.deleteEmpWeeklyOff(woffId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Employee Weekly Off deleted successfully');
            this.getAllEmpWeeklyOff(); // Refresh list after deletion
          } else {
            this.toastrService.error(response.message || 'Failed to delete Employee Weekly Off');
          }
        },
        error: (error) => {
          console.error('Error deleting employee weekly off:', error);
          this.toastrService.error('Failed to delete employee weekly off.');
        }
      });
    }
  }

  editWeeklyOff(woffId: any) {
    console.log("woffId", woffId);
    this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/EmployeeWeeklyOffMaster', woffId]);
  }

  filteredData(): any[] {
    if (!this.searchText) {
      return this.weekOffData;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.weekOffData.filter(data =>
      (data.location?.toLowerCase().includes(searchTextLower))
    );
  }

  downloadExcel(): void {
    const tableElement = document.getElementById('exportTable');

    if (!tableElement) {
      console.error('Table element not found!');
      return;
    }

    try {
      // Convert the HTML table to a worksheet
      const worksheet = (window as any).XLSX.utils.table_to_sheet(tableElement);

      // Create a new workbook and append the worksheet
      const workbook = (window as any).XLSX.utils.book_new();
      (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'EmpWeeklyOffData');

      // Write the workbook to an Excel file buffer
      const excelBuffer: any = (window as any).XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Create a blob from the buffer
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Save the Excel file with a custom name
      (window as any).saveAs(blob, 'EmpWeeklyOffData.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  }
}