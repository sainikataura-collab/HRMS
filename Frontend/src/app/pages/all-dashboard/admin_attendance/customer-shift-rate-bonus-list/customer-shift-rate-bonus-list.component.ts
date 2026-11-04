import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerShiftRateBonusService } from '../service/customer-shift-rate-bonus.service';

@Component({
  selector: 'app-customer-shift-rate-bonus-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule, NgSelectModule],
  templateUrl: './customer-shift-rate-bonus-list.component.html',
  styleUrls: ['./customer-shift-rate-bonus-list.component.scss']
})
export class CustomerShiftRateBonusListComponent implements OnInit {
  list: any[] = [];
  isLoading: boolean = false;

  // Pagination & Search
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  // Filters
  selectedClientId: string | null = null;
  selectedLocationId: string | null = null;

  // Dropdown data
  clients: any[] = [];
  locations: any[] = [];

  private searchSubject: Subject<string> = new Subject<string>();

  constructor(
    private service: CustomerShiftRateBonusService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadData();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadData();
    });
  }

  loadDropdowns(): void {
    // 1. Clients
    this.service.getClients().subscribe({
      next: (res: any) => {
        const items = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.clients = items
          .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
          .map((c: any) => ({
            value: (c.value ?? c.Value ?? '').toString(),
            text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
          }));
      },
      error: (err: any) => console.error('Error fetching clients dropdown:', err)
    });

    // 2. Locations
    this.service.getLocations().subscribe({
      next: (res: any) => {
        const items = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.locations = items
          .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
          .map((l: any) => ({
            value: (l.value ?? l.Value ?? '').toString(),
            text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value
          }));
      },
      error: (err: any) => console.error('Error fetching locations dropdown:', err)
    });
  }

  loadData(): void {
    this.isLoading = true;
    const filter = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      searchTerm: (this.searchTerm || '').trim(),
      clientId: this.selectedClientId || undefined,
      locationId: this.selectedLocationId || undefined
    };

    this.service.getAll(filter).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.data ?? res?.Data ?? {};
        this.list = data.list ?? [];
        this.totalItems = data.totalCount ?? this.list.length;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('Failed to load records.');
        console.error('Error loading list:', err);
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedClientId = null;
    this.selectedLocationId = null;
    this.pageIndex = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadData();
  }

  editRecord(item: any): void {
    this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/customer_shift_rate_bonus', item.pk_id]);
  }

  deleteRecord(item: any): void {
    if (confirm(`Are you sure you want to delete the configuration for "${item.customerName || 'Customer'}" at "${item.locationName || 'Location'}"?`)) {
      this.service.delete(item.pk_id).subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.IsSuccess || res?.statusCode === 200) {
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

    const exportFilter = {
      pageIndex: 1,
      pageSize: 100000,
      searchTerm: (this.searchTerm || '').trim(),
      clientId: this.selectedClientId || undefined,
      locationId: this.selectedLocationId || undefined
    };

    this.service.getAll(exportFilter).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.Data ?? {};
        const items = data.list ?? this.list;

        const dataToExport = items.map((item: any, index: number) => ({
          'Sr. No': index + 1,
          'Customer': item.customerName || item.fk_clientId || '',
          'Location': item.locationName || item.fk_locId || '',
          'Shift Type A': item.shiftTypeA != null ? item.shiftTypeA : 0,
          'Shift Type B': item.shiftTypeB != null ? item.shiftTypeB : 0,
          'Shift Type C': item.shiftTypeC != null ? item.shiftTypeC : 0,
          'Attendance Bonus': item.attendanceBonus != null ? item.attendanceBonus : 0,
          'Bonus Applicable': item.isBonusApplicable ? 'Yes' : 'No',
          'Bonus Payout Type': item.isBonusApplicable ? (item.bonusPayoutType || '-') : '-',
          'Attendance Applicable Days': item.attendanceApplicableDays != null ? item.attendanceApplicableDays : 0,
          'Quarterly Incentive': item.quarterlyIncentive != null ? item.quarterlyIncentive : 0,
          'Peak Incentive Applicable': item.isPeakIncentiveApplicable ? 'Yes' : 'No',
          'Peak Periods Count': item.peakIncentivesCount || (item.peakIncentives ? item.peakIncentives.length : 0),
          'Created By': item.createdBy || '-',
          'Created Date': item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '-'
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook: XLSX.WorkBook = {
          Sheets: { 'Customer_Shift_Rate_Bonus': worksheet },
          SheetNames: ['Customer_Shift_Rate_Bonus']
        };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blobData: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        const fileName = `Customer_Shift_Rate_Bonus_${new Date().toISOString().slice(0, 10)}.xlsx`;
        FileSaver.saveAs(blobData, fileName);
        this.toastr.success('Excel exported successfully.');
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error('Failed to export Excel.');
      }
    });
  }
}
