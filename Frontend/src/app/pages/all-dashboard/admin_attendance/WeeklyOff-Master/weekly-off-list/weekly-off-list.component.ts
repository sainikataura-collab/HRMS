import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WeeklyOffService } from '../../../payroll/services/weekly-off.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';


@Component({
  selector: 'app-weekly-off-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './weekly-off-list.component.html',
  styleUrl: './weekly-off-list.component.scss'
})
export class WeeklyOffListComponent {
  weekOffData: any[] = [];
  searchText: string = '';

  constructor(
    private weeklyOffService: WeeklyOffService,
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
    this.getAllWeeklyOff();
    this.loaderService.stop();
  }

  getAllWeeklyOff(): void {
    this.weeklyOffService.getAllWeeklyOff(this.pageIndex - 1, this.pageSize).subscribe({
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
        this.toastrService.error('Error fetching weekly off data. Please try again.');
      },
      complete: () => {
        console.log('Data retrieval completed.');
        this.loaderService.stop(); // Ensure loader stops even on error
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event; // Update current page
    this.getAllWeeklyOff(); // Fetch data for the selected page
  }

  deleteWeekOff(woffId: string): void {
    if (confirm('Are you sure you want to delete this weekly off entry?')) {
      this.weeklyOffService.deleteWeeklyOff(woffId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Weekly Off deleted successfully');
            this.getAllWeeklyOff(); // Refresh list after deletion
          } else {
            this.toastrService.error(response.message || 'Failed to delete Weekly Off');
          }
        },
        error: (error) => {
          console.error('Error deleting weekly off:', error);
          this.toastrService.error('Failed to delete weekly off.');
        }
      });
    }
  }

  editWeeklyOff(woffId: any) {
    console.log("woofid",woffId);
    this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/WeeklyOff-Master-data', woffId]);
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
      (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'WeeklyOffData');

      // Write the workbook to an Excel file buffer
      const excelBuffer: any = (window as any).XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Create a blob from the buffer
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      // Save the Excel file with a custom name
      (window as any).saveAs(blob, 'WeeklyOffData.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  }

  
}
