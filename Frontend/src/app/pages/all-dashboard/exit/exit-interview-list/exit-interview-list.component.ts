import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-exit-interview-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exit-interview-list.component.html',
  styleUrl: './exit-interview-list.component.scss'
})
export class ExitInterviewListComponent implements OnInit {
  interviewList: any[] = [];
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';

  constructor(
    private router: Router,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getInterviews();
  }

  getInterviews() {
    // Mocking data for now
    this.interviewList = [
      { id: 'GU-1', empCode: 'EMP01', empName: 'Deepak Kumar Upreti', department: 'IT', submittedDate: '2023-10-31' },
      { id: 2, empCode: 'EMP004', empName: 'Bob Williams', department: 'Sales', submittedDate: '2024-05-18' }
    ];
    this.totalCount = this.interviewList.length;
  }

  filteredData(): any[] {
    if (!this.searchText || this.searchText.trim() === '') {
      return this.interviewList;
    }

    const searchTextLower = this.searchText.toLowerCase().trim();

    return this.interviewList.filter(item => {
      const empCode = String(item.empcode || '').toLowerCase();
      const empName = String(item.empname || '').toLowerCase();
      const department = String(item.department || '').toLowerCase();
      const hodName = String(item.hodName || '').toLowerCase();
      const resignationDate = item.resignationDate ? new Date(item.resignationDate).toLocaleDateString('en-GB') : '';
      const SubmittedDate = item.resignationDate ? new Date(item.resignationDate).toLocaleDateString('en-GB') : '';

      return empCode.includes(searchTextLower)
        || empName.includes(searchTextLower)
        || department.includes(searchTextLower)
        || hodName.includes(searchTextLower)
        || resignationDate.includes(searchTextLower)
        || SubmittedDate.includes(searchTextLower);
    });
  }

  view(id: number) {
    this.router.navigate([`/dash/exit/exitdashboard/exit_interview_view/${id}`]);
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getInterviews();
  }

  formatDate(dateValue: any): string {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  exportToExcel(): void {
    if (this.interviewList.length > 0) {
      const formattedData = this.interviewList.map((item: any) => ({
        'Employee Code': item.empCode,
        'Employee Name': item.empName,
        'Department': item.department,
        'Resignation Date': this.formatDate(item.resignationDate),
        'Submitted On': this.formatDate(item.insDate),
      }));

      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ExitInterviews');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileName = 'ExitInterviews.xlsx';
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
