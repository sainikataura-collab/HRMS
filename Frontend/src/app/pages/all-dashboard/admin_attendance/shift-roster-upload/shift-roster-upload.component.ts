import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { RosterMasterService } from '../service/roster-master.service';

@Component({
  selector: 'app-shift-roster-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './shift-roster-upload.component.html',
  styleUrls: ['./shift-roster-upload.component.scss']
})
export class ShiftRosterUploadComponent implements OnInit {
  uploadForm!: FormGroup;
  searchControl: FormControl = new FormControl('');
  selectedFile: File | null = null;

  importedData: any[] = [];
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  employees: any[] = [];
  shifts: any[] = [];
  weekDays: any[] = [];

  constructor(
    private fb: FormBuilder,
    private rosterService: RosterMasterService,
    private toastr: ToastrService,
    private ngxService: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      file: [null, [Validators.required]]
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.filterData();
    });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    this.rosterService.getEmployees().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res?.data)) {
          this.employees = res.data;
        }
      }
    });

    this.rosterService.getShifts().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && Array.isArray(res?.data)) {
          this.shifts = res.data;
        }
      }
    });

    this.rosterService.getWeekDays().subscribe({
      next: (res: any) => {
        const list = res?.list ?? res?.data ?? (Array.isArray(res) ? res : []);
        this.weekDays = list.map((item: any) => ({
          name: item.name || item.codeDescription || item.CodeDescription,
          value: item.name || item.codeDescription || item.CodeDescription
        }));
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        this.toastr.error('Please upload an Excel file (.xlsx or .xls).');
        this.resetForm();
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please select a file to import.');
      return;
    }

    this.ngxService.start();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        if (!jsonData || jsonData.length === 0) {
          this.ngxService.stop();
          this.toastr.warning('Uploaded Excel file is empty.');
          return;
        }

        // Map columns to payload
        const mappedItems: any[] = jsonData.map((row: any) => {
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find(x => x.trim().toLowerCase() === k.toLowerCase());
              if (foundKey && row[foundKey] != null) return row[foundKey].toString().trim();
            }
            return '';
          };

          return {
            effectiveFrom: getVal(['Effective From', 'EffectiveFrom', 'Effective_From', 'Date']),
            empCode: getVal(['Employee Code', 'EmployeeCode', 'EmpCode', 'Emp Code']),
            shiftName: getVal(['Shift Name', 'ShiftName', 'Shift']),
            weekOffDay: getVal(['Week Off Day', 'WeekOffDay', 'WeekOff', 'Week Off', 'WeekOff_Day'])
          };
        });

        // Send to backend for DB verification and insert
        this.rosterService.bulkInsert(mappedItems).subscribe({
          next: (res: any) => {
            this.ngxService.stop();
            if (res?.isSuccess && Array.isArray(res?.data)) {
              this.importedData = res.data;
              this.filterData();
              if (this.uploadedCount > 0) {
                this.toastr.success(`Successfully validated and imported ${this.uploadedCount} record(s).`);
              }
              if (this.notUploadedCount > 0) {
                this.toastr.warning(`${this.notUploadedCount} record(s) failed validation.`);
              }
            } else {
              this.toastr.error(res?.message || 'Failed to process bulk upload.');
            }
          },
          error: (err: any) => {
            this.ngxService.stop();
            this.toastr.error(err?.error?.message || 'Server error occurred during bulk upload.');
            console.error(err);
          }
        });

      } catch (ex: any) {
        this.ngxService.stop();
        this.toastr.error('Failed to parse Excel file.');
        console.error(ex);
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(x => x.isValid === true).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const query = (this.searchControl.value || '').toLowerCase().trim();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = !query ||
        (item.empCode && item.empCode.toLowerCase().includes(query)) ||
        (item.shiftName && item.shiftName.toLowerCase().includes(query)) ||
        (item.weekOffDay && item.weekOffDay.toLowerCase().includes(query)) ||
        (item.remarks && item.remarks.toLowerCase().includes(query)) ||
        (item.effectiveFrom && item.effectiveFrom.toLowerCase().includes(query));

      let matchesFilter = true;
      if (this.currentFilter === 'Uploaded') {
        matchesFilter = item.isValid === true;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesFilter = item.isValid === false;
      }

      return matchesSearch && matchesFilter;
    });
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.searchControl.setValue('');
    this.selectedFile = null;
    this.importedData = [];
    this.filteredData = [];
    this.uploadedCount = 0;
    this.notUploadedCount = 0;
    this.currentFilter = 'All';
  }

  exportTemplate(): void {
    const headers = ['Employee Code', 'Shift Name', 'Week Off Day', 'Effective From'];
    const sampleRow: any = {
      'Employee Code': this.employees.length > 0 ? (this.employees[0].code || 'EL0001') : 'EL0001',
      'Shift Name': this.shifts.length > 0 ? (this.shifts[0].shiftName || 'General Shift') : 'General Shift',
      'Week Off Day': this.weekDays.length > 0 ? (this.weekDays[0].name || 'Sunday') : 'Sunday',
      'Effective From': new Date().toISOString().substring(0, 10)
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shift Roster Template');
    XLSX.writeFile(wb, 'Shift_Roster_Template.xlsx');
    this.toastr.info('Shift Roster blank template downloaded.');
  }

  downloadExcel(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      this.toastr.warning('No data available to export.');
      return;
    }

    const exportRows = this.filteredData.map((row: any, idx: number) => ({
      'Sr. No': idx + 1,
      'Status': row.isValid ? 'Uploaded' : 'Failed',
      'Employee Code': row.empCode,
      'Shift Name': row.shiftName,
      'Week Off Day': row.weekOffDay,
      'Effective From': row.effectiveFrom,
      'Remarks': row.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Import Result');
    XLSX.writeFile(wb, 'Shift_Roster_Import_Result.xlsx');
    this.toastr.success('Export list downloaded.');
  }
}
