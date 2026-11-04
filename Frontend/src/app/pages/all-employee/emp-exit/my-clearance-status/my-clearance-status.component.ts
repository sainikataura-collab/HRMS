import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-clearance-status',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './my-clearance-status.component.html',
  styleUrl: './my-clearance-status.component.scss'
})
export class MyClearanceStatusComponent implements OnInit {
  clearanceList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = ''; 

  constructor(private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.getClearanceStatus();
  }

  getClearanceStatus() {
    // Mocking data for now
    this.clearanceList = [
      { id: 1, department: 'IT Department', status: 'Cleared', clearedBy: 'Admin', clearedDate: '2024-05-18', remarks: 'All assets returned' },
      { id: 2, department: 'Finance', status: 'Pending', clearedBy: null, clearedDate: null, remarks: 'Waiting for final approval' },
      { id: 3, department: 'HR', status: 'Cleared', clearedBy: 'HR Manager', clearedDate: '2024-05-18', remarks: 'Exit interview done' }
    ];
    this.totalCount = this.clearanceList.length;
  }

  filteredData() {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.clearanceList;
    }

    const searchTextLower = this.searchText.toLowerCase().trim();

    return this.clearanceList.filter(item => {
      const department = item.department ? String(item.department).toLowerCase() : '';
      const status = item.status ? String(item.status).toLowerCase() : '';
      
      return department.includes(searchTextLower) || status.includes(searchTextLower);
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getClearanceStatus();
  }

  exportToExcel(): void {
    if (this.clearanceList.length > 0) {
      const formattedData = this.clearanceList.map((item: any) => ({
        'Department': item.department,
        'Clearance Status': item.status,
        'Cleared By': item.clearedBy || 'N/A',
        'Cleared Date': item.clearedDate || 'N/A',
        'Remarks': item.remarks || 'N/A'
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ClearanceStatus');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileName = 'MyClearanceStatus.xlsx';
      const link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      this.toastrService.warning('No data available to export');
    }
  }
}
