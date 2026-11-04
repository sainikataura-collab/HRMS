import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import { RosterMasterService } from '../service/roster-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-shift-roster-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './shift-roster-form.component.html',
  styleUrls: ['./shift-roster-form.component.scss']
})
export class ShiftRosterFormComponent implements OnInit {
  isEditMode: boolean = false;
  rosterId: number | string = 0;
  isLoading: boolean = false;
  showError: boolean = false;

  formData: any = {
    pk_rosterId: 0,
    effectiveFrom: '',
    fk_empId: null,
    fk_shiftId: null,
    weekOffDay: null
  };

  // Leave Transaction matching employee dropdown state
  employees: { name: string; value: string; code?: string }[] = [];
  initialEmployeeList: any[] = [];
  loadingEmployees: boolean = false;
  pageNo: number = 1;
  pageSizes: number = 100;
  currentSearch: string = '';
  searchTimer: any;
  employeeFilters: any = {};

  shifts: any[] = [];
  weekDays: any[] = [];

  constructor(
    private rosterService: RosterMasterService,
    private encryptionService: EncryptionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.checkEditMode();
  }

  loadDropdowns(): void {
    // 1. Employees using exact Leave Transaction API
    this.getEmployees();

    // 2. Shifts from Shift Master
    this.rosterService.getShifts().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res?.data)) {
          this.shifts = res.data;
        } else {
          this.shifts = [];
        }
      },
      error: (err) => {
        console.error('Error loading shifts:', err);
      }
    });

    // 3. Week Days from General Master (LSP_Master_General, CodeTypeId = 21)
    this.rosterService.getWeekDays().subscribe({
      next: (res: any) => {
        const list = res?.list ?? res?.data ?? (Array.isArray(res) ? res : []);
        this.weekDays = list.map((item: any) => ({
          name: item.name || item.codeDescription || item.CodeDescription,
          value: item.name || item.codeDescription || item.CodeDescription
        }));
      },
      error: (err) => {
        console.error('Error loading week days from General Master:', err);
      }
    });
  }

  getEmployees(): void {
    this.loadingEmployees = true;
    this.employeeFilters = {
      ...this.employeeFilters,
      search: this.currentSearch,
      pageNo: this.pageNo,
      pageSize: this.pageSizes
    };

    this.rosterService.getEmployees(this.employeeFilters).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res?.data)) {
          this.employees = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
            code: emp.name ? emp.name.split('|')[0].trim() : ''
          }));

          if (!this.currentSearch) {
            this.initialEmployeeList = [...this.employees];
          }
        } else {
          this.employees = [];
        }
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.employees = [];
      }
    });
  }

  onEmployeeSearch(event: any): void {
    const search = (event?.term || '').trim().toLowerCase();
    clearTimeout(this.searchTimer);

    if (!search) {
      this.employees = [...this.initialEmployeeList];
      this.loadingEmployees = false;
      return;
    }

    const local = this.initialEmployeeList.filter(x =>
      (x.name || '').toLowerCase().includes(search)
    );

    if (local.length > 0) {
      this.employees = local;
      this.loadingEmployees = false;
      return;
    }

    this.loadingEmployees = true;
    this.searchTimer = setTimeout(() => {
      this.currentSearch = search;
      this.pageNo = 1;
      this.getEmployees();
    }, 1000);
  }

  checkEditMode(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      try {
        const decrypted = this.encryptionService.decryptText(paramId);
        if (decrypted && !isNaN(Number(decrypted))) {
          this.isEditMode = true;
          this.rosterId = decrypted;
          this.loadRosterDetails(this.rosterId);
        }
      } catch (e) {
        console.error('Failed to decrypt ID:', e);
      }
    }
  }

  loadRosterDetails(id: number | string): void {
    this.isLoading = true;
    this.ngxService.start();
    this.rosterService.getById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.ngxService.stop();
        if (res?.isSuccess && res?.data) {
          const d = res.data;
          this.formData = {
            pk_rosterId: d.pk_rosterId,
            effectiveFrom: d.effectiveFrom ? d.effectiveFrom.substring(0, 10) : '',
            fk_empId: d.fk_empId,
            fk_shiftId: d.fk_shiftId,
            weekOffDay: d.weekOffDay
          };
        } else {
          this.toastr.error(res?.message || 'Failed to load roster details.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.ngxService.stop();
        this.toastr.error('Error fetching shift roster record.');
      }
    });
  }

  onSubmit(): void {
    if (!this.formData.effectiveFrom || !this.formData.fk_empId || !this.formData.fk_shiftId || !this.formData.weekOffDay) {
      this.showError = true;
      this.toastr.warning('Please fill all mandatory fields.');
      return;
    }

    this.ngxService.start();
    if (this.isEditMode) {
      this.rosterService.update(this.formData).subscribe({
        next: (res: any) => {
          this.ngxService.stop();
          if (res?.isSuccess) {
            this.toastr.success(res?.message || 'Shift Roster updated successfully.');
            this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/shift_roster_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to update Shift Roster.');
          }
        },
        error: (err) => {
          this.ngxService.stop();
          this.toastr.error(err?.error?.message || 'An error occurred while updating Shift Roster.');
        }
      });
    } else {
      this.rosterService.insert(this.formData).subscribe({
        next: (res: any) => {
          this.ngxService.stop();
          if (res?.isSuccess) {
            this.toastr.success(res?.message || 'Shift Roster added successfully.');
            this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/shift_roster_list']);
          } else {
            this.toastr.error(res?.message || 'Failed to add Shift Roster.');
          }
        },
        error: (err) => {
          this.ngxService.stop();
          this.toastr.error(err?.error?.message || 'An error occurred while adding Shift Roster.');
        }
      });
    }
  }

  exportTemplate(): void {
    const headers = ['Employee Code', 'Shift Name', 'Week Off Day', 'Effective From'];
    const sampleRow: any = {
      'Employee Code': this.employees.length > 0 ? (this.employees[0].code || 'EL0001') : 'EL0001',
      'Shift Name': this.shifts.length > 0 ? (this.shifts[0].shiftName || 'General Shift') : 'General Shift',
      'Week Off Day': 'Sunday',
      'Effective From': this.formData.effectiveFrom || new Date().toISOString().substring(0, 10)
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shift Roster Template');
    XLSX.writeFile(wb, 'Shift_Roster_Template.xlsx');
    this.toastr.info('Shift Roster blank template downloaded.');
  }
}
