import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { RosterMasterService } from '../service/roster-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-shift-roster-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './shift-roster-list.component.html',
  styleUrls: ['./shift-roster-list.component.scss']
})
export class ShiftRosterListComponent implements OnInit {
  list: any[] = [];
  isLoading: boolean = false;

  // Pagination & Search
  searchTerm: string = '';
  pageIndex: number = 1; // 1-based for ngx-pagination
  pageSize: number = 10;
  totalItems: number = 0;

  private searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private rosterService: RosterMasterService,
    private encryptionService: EncryptionService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadData();
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  loadData(): void {
    this.isLoading = true;
    const backendPageIndex = this.pageIndex - 1; // Backend is 0-based
    this.rosterService.getAll(backendPageIndex, this.pageSize, (this.searchTerm || '').trim()).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.isSuccess) {
          this.list = res?.data || [];
          this.totalItems = res?.totalCount || 0;
        } else {
          this.list = [];
          this.totalItems = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading Shift Roster data:', err);
        this.toastr.error('Failed to load Shift Roster list.');
      }
    });
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadData();
  }

  editRecord(item: any): void {
    if (!item?.pk_rosterId) return;
    const encryptedId = this.encryptionService.encryptText(item.pk_rosterId.toString());
    this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/shift_roster', encryptedId]);
  }

  deleteRecord(item: any): void {
    if (confirm(`Are you sure you want to delete the shift roster for "${item.empName || item.empCode}" effective from ${item.effectiveFrom}?`)) {
      this.rosterService.delete(item.pk_rosterId).subscribe({
        next: (res: any) => {
          if (res?.isSuccess) {
            this.toastr.success(res?.message || 'Deleted successfully.');
            this.loadData();
          } else {
            this.toastr.error(res?.message || 'Failed to delete record.');
          }
        },
        error: (err: any) => {
          this.toastr.error('Failed to delete record.');
          console.error(err);
        }
      });
    }
  }

  exportToExcel(): void {
    if (!this.list || this.list.length === 0) {
      this.toastr.warning('No data available to export.');
      return;
    }

    this.rosterService.getAll(0, 100000, (this.searchTerm || '').trim()).subscribe({
      next: (res: any) => {
        const items = res?.data || this.list;
        const dataToExport = items.map((item: any, index: number) => ({
          'Sr. No': index + 1,
          'Effective From': item.effectiveFrom ? item.effectiveFrom.substring(0, 10) : '',
          'Employee Code': item.empCode || '',
          'Employee Name': item.empName || '',
          'Shift Name': item.shiftName || '',
          'Week Off Day': item.weekOffDay || '',
          'Created Date': item.createdDate || ''
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Shift Roster');
        XLSX.writeFile(wb, 'Shift_Roster_List.xlsx');
        this.toastr.success('Export completed successfully.');
      },
      error: () => {
        this.toastr.error('Failed to export Shift Roster list.');
      }
    });
  }
}
