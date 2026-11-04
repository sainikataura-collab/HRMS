import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { CustomerShiftRateBonusService } from '../service/customer-shift-rate-bonus.service';

@Component({
  selector: 'app-customer-shift-rate-bonus-upload',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './customer-shift-rate-bonus-upload.component.html',
  styleUrl: './customer-shift-rate-bonus-upload.component.scss'
})
export class CustomerShiftRateBonusUploadComponent implements OnInit {
  importedData: any[] = [];
  searchControl = new FormControl('');
  searchText = '';
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  uploadForm!: FormGroup;
  selectedFile: File | undefined;

  clients: any[] = [];
  locations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CustomerShiftRateBonusService,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]]
    });

    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });

    this.loadDropdowns();
  }

  loadDropdowns(): void {
    // 1. Clients
    this.service.getClients().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.clients = list
          .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
          .map((c: any) => ({
            value: (c.value ?? c.Value ?? '').toString(),
            text: (c.name ?? c.Name ?? c.text ?? c.Text ?? c.value).toString().trim()
          }));
      },
      error: (err: any) => console.error('Error loading clients:', err)
    });

    // 2. Locations
    this.service.getLocations().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.locations = list
          .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
          .map((l: any) => ({
            value: (l.value ?? l.Value ?? '').toString(),
            text: (l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value).toString().trim()
          }));
      },
      error: (err: any) => console.error('Error loading locations:', err)
    });
  }

  // Export blank sample template Excel
  exportTemplate(): void {
    const headers = [
      'Customer',
      'Location',
      'Shift Type A',
      'Shift Type B',
      'Shift Type C',
      'Attendance Bonus',
      'Attendance Applicable Days',
      'Bonus Applicable',
      'Bonus Payout Type',
      'Quarterly Incentive',
      'Peak Incentive Applicable',
      'Peak From Date',
      'Peak To Date',
      'Peak Incentive Amount'
    ];

    const sampleRow = {
      'Customer': this.clients.length > 0 ? this.clients[0].text : 'Sample Customer',
      'Location': this.locations.length > 0 ? this.locations[0].text : 'Sample Location',
      'Shift Type A': 500,
      'Shift Type B': 550,
      'Shift Type C': 600,
      'Attendance Bonus': 1000,
      'Attendance Applicable Days': 26,
      'Bonus Applicable': 'Yes',
      'Bonus Payout Type': 'Monthly',
      'Quarterly Incentive': 1500,
      'Peak Incentive Applicable': 'Yes',
      'Peak From Date': '2026-11-01',
      'Peak To Date': '2026-11-15',
      'Peak Incentive Amount': 500
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ShiftRateBonus Template');

    XLSX.writeFile(wb, 'Customer_Shift_Rate_Bonus_Template.xlsx');
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(item =>
      item.status === 'Uploaded' || item.status === 'Success' || item.isSuccess === true
    ).length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = !this.searchText || Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccessStatus = item.status === 'Uploaded' || item.status === 'Success' || item.isSuccess === true;
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = isSuccessStatus;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = !isSuccessStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      this.selectedFile = file;
      this.uploadForm.get('file')?.setValue(file);
    } else {
      this.uploadForm.get('file')?.setErrors({ pattern: true });
    }
  }

  private getCaseInsensitiveProp(obj: any, keys: string[]): any {
    const objKeys = Object.keys(obj);
    for (const targetKey of keys) {
      const match = objKeys.find(k => k.trim().toLowerCase() === targetKey.toLowerCase());
      if (match !== undefined) {
        return obj[match];
      }
    }
    return '';
  }

  private parseExcelDate(raw: any): string | null {
    if (raw === null || raw === undefined || raw === '') return null;
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const d = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof raw === 'number' && raw > 10000 && raw < 100000) {
      // Excel serial number
      const date = new Date(Math.round((raw - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
    const str = raw.toString().trim();
    if (!str) return null;
    // YYYY-MM-DD or YYYY/MM/DD
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
      const parts = str.split(/[-/.]/);
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    // DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(str)) {
      const parts = str.split(/[-/.]/);
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return null;
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.toastr.warning('Please select an Excel file to import.', 'File Required');
      return;
    }

    const reader = new FileReader();
    this.loader.start();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          this.loader.stop();
          this.toastr.warning('The uploaded Excel file contains no data rows.', 'Empty File');
          return;
        }

        const parsedRows: any[] = [];
        const validPayloadRows: any[] = [];

        rawJson.forEach((row, index) => {
          const rowErrors: string[] = [];

          // 1. Customer
          const rawCustomer = this.getCaseInsensitiveProp(row, [
            'Customer', 'Customer Name', 'CustomerName', 'Client', 'Client Name'
          ]).toString().trim();

          let matchedClient: any = null;
          if (!rawCustomer) {
            rowErrors.push('Customer is required');
          } else {
            matchedClient = this.clients.find(c =>
              c.text.toLowerCase() === rawCustomer.toLowerCase() ||
              c.value === rawCustomer
            );
            if (!matchedClient) {
              rowErrors.push(`Customer "${rawCustomer}" not found`);
            }
          }

          // 2. Location
          const rawLocation = this.getCaseInsensitiveProp(row, [
            'Location', 'Location Name', 'LocationName'
          ]).toString().trim();

          let matchedLocation: any = null;
          if (!rawLocation) {
            rowErrors.push('Location is required');
          } else {
            matchedLocation = this.locations.find(l =>
              l.text.toLowerCase() === rawLocation.toLowerCase() ||
              l.value === rawLocation
            );
            if (!matchedLocation) {
              rowErrors.push(`Location "${rawLocation}" not found`);
            }
          }

          // 3. Shift Rates
          const rawShiftA = this.getCaseInsensitiveProp(row, ['Shift Type A', 'ShiftTypeA', 'Shift A']);
          const shiftTypeA = rawShiftA !== '' && !isNaN(Number(rawShiftA)) ? Number(rawShiftA) : null;

          const rawShiftB = this.getCaseInsensitiveProp(row, ['Shift Type B', 'ShiftTypeB', 'Shift B']);
          const shiftTypeB = rawShiftB !== '' && !isNaN(Number(rawShiftB)) ? Number(rawShiftB) : null;

          const rawShiftC = this.getCaseInsensitiveProp(row, ['Shift Type C', 'ShiftTypeC', 'Shift C']);
          const shiftTypeC = rawShiftC !== '' && !isNaN(Number(rawShiftC)) ? Number(rawShiftC) : null;

          // 4. Attendance Bonus
          const rawAttendanceBonus = this.getCaseInsensitiveProp(row, ['Attendance Bonus', 'AttendanceBonus']);
          const attendanceBonus = rawAttendanceBonus !== '' && !isNaN(Number(rawAttendanceBonus)) ? Number(rawAttendanceBonus) : null;

          // 5. Attendance Applicable Days
          const rawApplicableDays = this.getCaseInsensitiveProp(row, [
            'Attendance Applicable Days', 'AttendanceApplicableDays', 'Applicable Days', 'Attendance Days'
          ]);
          const attendanceApplicableDays = rawApplicableDays !== '' && !isNaN(Number(rawApplicableDays)) ? parseInt(rawApplicableDays, 10) : null;

          // 6. Bonus Applicable
          const rawBonusApplicable = this.getCaseInsensitiveProp(row, [
            'Bonus Applicable', 'BonusApplicable', 'IsBonusApplicable'
          ]).toString().trim().toLowerCase();
          const isBonusApplicable = ['yes', 'true', '1', 'y'].includes(rawBonusApplicable);

          // 7. Bonus Payout Type
          const rawPayoutType = this.getCaseInsensitiveProp(row, [
            'Bonus Payout Type', 'BonusPayoutType', 'Payout Type'
          ]).toString().trim();
          let bonusPayoutType: string | null = null;

          if (isBonusApplicable) {
            if (!rawPayoutType) {
              rowErrors.push('Bonus Payout Type is required when Bonus is Applicable');
            } else if (rawPayoutType.toLowerCase() === 'monthly') {
              bonusPayoutType = 'Monthly';
            } else if (rawPayoutType.toLowerCase() === 'yearly') {
              bonusPayoutType = 'Yearly';
            } else {
              rowErrors.push(`Invalid Bonus Payout Type "${rawPayoutType}"`);
            }
          }

          // 8. Quarterly Incentive (Whole number, default 0)
          const rawQuarterly = this.getCaseInsensitiveProp(row, [
            'Quarterly Incentive', 'QuarterlyIncentive', 'Quarterly bonus', 'QuarterlyBonus'
          ]);
          let quarterlyIncentive = 0;
          if (rawQuarterly !== '' && rawQuarterly !== null && rawQuarterly !== undefined) {
            const qNum = Number(rawQuarterly);
            if (isNaN(qNum)) {
              rowErrors.push(`Invalid Quarterly Incentive "${rawQuarterly}"`);
            } else {
              quarterlyIncentive = Math.floor(Math.abs(qNum));
            }
          }

          // 9. Peak Incentive Fields
          const rawPeakApplicable = this.getCaseInsensitiveProp(row, [
            'Peak Incentive Applicable', 'PeakIncentiveApplicable', 'Peak Applicable', 'IsPeakIncentiveApplicable'
          ]).toString().trim().toLowerCase();
          const isPeakIncentiveApplicable = ['yes', 'true', '1', 'y'].includes(rawPeakApplicable);

          const rawPeakFrom = this.getCaseInsensitiveProp(row, [
            'Peak From Date', 'PeakFromDate', 'Peak From', 'PeakFrom'
          ]);
          const rawPeakTo = this.getCaseInsensitiveProp(row, [
            'Peak To Date', 'PeakToDate', 'Peak To', 'PeakTo'
          ]);
          const rawPeakAmount = this.getCaseInsensitiveProp(row, [
            'Peak Incentive Amount', 'PeakIncentiveAmount', 'Peak Amount', 'PeakAmount'
          ]);

          let peakFromDate: string | null = null;
          let peakToDate: string | null = null;
          let peakIncentiveAmount = 0;

          if (isPeakIncentiveApplicable) {
            peakFromDate = this.parseExcelDate(rawPeakFrom);
            peakToDate = this.parseExcelDate(rawPeakTo);

            if (rawPeakAmount !== '' && rawPeakAmount !== null && rawPeakAmount !== undefined) {
              const pNum = Number(rawPeakAmount);
              if (isNaN(pNum)) {
                rowErrors.push(`Invalid Peak Incentive Amount "${rawPeakAmount}"`);
              } else {
                peakIncentiveAmount = Math.floor(Math.abs(pNum));
              }
            }

            if (!peakFromDate && rawPeakFrom) {
              rowErrors.push(`Invalid Peak From Date "${rawPeakFrom}"`);
            }
            if (!peakToDate && rawPeakTo) {
              rowErrors.push(`Invalid Peak To Date "${rawPeakTo}"`);
            }

            if (peakFromDate && peakToDate && peakFromDate > peakToDate) {
              rowErrors.push('Peak To Date cannot be earlier than Peak From Date');
            }

            if ((peakFromDate || peakToDate) && peakIncentiveAmount <= 0) {
              rowErrors.push('Peak Incentive Amount must be greater than 0 when peak dates are provided');
            }
          }

          const isValid = rowErrors.length === 0;

          const item = {
            rowNumber: index + 1,
            customerDisplay: matchedClient ? matchedClient.text : rawCustomer,
            locationDisplay: matchedLocation ? matchedLocation.text : rawLocation,
            fk_clientId: matchedClient ? matchedClient.value.toString() : null,
            fk_locId: matchedLocation ? matchedLocation.value.toString() : null,
            shiftTypeA,
            shiftTypeB,
            shiftTypeC,
            attendanceBonus,
            attendanceApplicableDays,
            isBonusApplicable,
            bonusPayoutType,
            quarterlyIncentive,
            isPeakIncentiveApplicable,
            peakFromDate,
            peakToDate,
            peakIncentiveAmount,
            isValid,
            errors: rowErrors,
            status: isValid ? 'Pending' : rowErrors.join('; '),
            isSuccess: false
          };

          parsedRows.push(item);

          if (isValid) {
            const peakIncentives = (isPeakIncentiveApplicable && peakFromDate && peakToDate) ? [{
              pk_peakIncentiveId: 0,
              fk_shiftRateBonusId: 0,
              fromDate: peakFromDate,
              toDate: peakToDate,
              incentiveAmount: peakIncentiveAmount,
              isActive: true
            }] : [];

            validPayloadRows.push({
              pk_id: 0,
              fk_clientId: item.fk_clientId?.toString() || '',
              fk_locId: item.fk_locId?.toString() || '',
              shiftTypeA: item.shiftTypeA,
              shiftTypeB: item.shiftTypeB,
              shiftTypeC: item.shiftTypeC,
              attendanceBonus: item.attendanceBonus,
              attendanceApplicableDays: item.attendanceApplicableDays,
              isBonusApplicable: item.isBonusApplicable,
              bonusPayoutType: item.bonusPayoutType,
              quarterlyIncentive: item.quarterlyIncentive,
              isPeakIncentiveApplicable: item.isPeakIncentiveApplicable,
              peakIncentives: peakIncentives,
              fk_companyId: parseInt(sessionStorage.getItem('companyId') || localStorage.getItem('companyId') || '0', 10),
              fk_userId: parseInt(sessionStorage.getItem('UserId') || sessionStorage.getItem('userId') || sessionStorage.getItem('USERID') || localStorage.getItem('UserId') || '0', 10),
              isActive: true,
              rowIndex: index
            });
          }
        });

        this.importedData = parsedRows;

        if (validPayloadRows.length === 0) {
          this.loader.stop();
          this.filterData();
          this.toastr.error('No valid rows found to import. Please review the errors.', 'Validation Error');
          return;
        }

        // Call bulk insert API
        this.service.bulkInsert(validPayloadRows).subscribe({
          next: (res: any) => {
            this.loader.stop();
            if (res && (res.isSuccessfull || res.isSuccess || res.statusCode === 200)) {
              validPayloadRows.forEach(v => {
                const target = this.importedData[v.rowIndex];
                if (target) {
                  target.status = 'Uploaded';
                  target.isSuccess = true;
                }
              });

              const inserted = res.data?.insertedCount ?? 0;
              const updated = res.data?.updatedCount ?? 0;
              this.toastr.success(`Successfully imported records! (Inserted: ${inserted}, Updated: ${updated})`, 'Import Success');
            } else {
              validPayloadRows.forEach(v => {
                const target = this.importedData[v.rowIndex];
                if (target) {
                  target.status = res?.message || 'Failed';
                }
              });
              this.toastr.error(res?.message || 'Import failed.', 'Error');
            }
            this.filterData();
          },
          error: (err: any) => {
            this.loader.stop();
            console.error('Error during bulk import:', err);
            validPayloadRows.forEach(v => {
              const target = this.importedData[v.rowIndex];
              if (target) {
                target.status = err?.error?.message || 'Failed';
              }
            });
            this.toastr.error(err?.error?.message || err?.message || 'Error occurred while importing.', 'Import Failed');
            this.filterData();
          }
        });

      } catch (err: any) {
        this.loader.stop();
        console.error('Error reading Excel:', err);
        this.toastr.error('Failed to parse the Excel file: ' + err.message, 'Parse Error');
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  downloadExcel(): void {
    const exportData = this.filteredData.map(row => ({
      Status: (row.isSuccess === true || row.status === 'Uploaded' || row.status === 'Success') ? 'Uploaded' : (row.errors?.join('; ') || row.status || 'Failed'),
      Customer: row.customerDisplay,
      Location: row.locationDisplay,
      ShiftTypeA: row.shiftTypeA ?? '',
      ShiftTypeB: row.shiftTypeB ?? '',
      ShiftTypeC: row.shiftTypeC ?? '',
      AttendanceBonus: row.attendanceBonus ?? '',
      AttendanceApplicableDays: row.attendanceApplicableDays ?? '',
      BonusApplicable: row.isBonusApplicable ? 'Yes' : 'No',
      BonusPayoutType: row.bonusPayoutType ?? '',
      QuarterlyIncentive: row.quarterlyIncentive ?? 0,
      PeakIncentiveApplicable: row.isPeakIncentiveApplicable ? 'Yes' : 'No',
      PeakFromDate: row.peakFromDate ?? '',
      PeakToDate: row.peakToDate ?? '',
      PeakIncentiveAmount: row.peakIncentiveAmount ?? ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Import_Result': worksheet },
      SheetNames: ['Import_Result']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, 'Customer_Shift_Rate_Bonus_Import_Result.xlsx');
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile = undefined;
    this.importedData = [];
    this.filteredData = [];
    this.searchControl.setValue('');
    this.currentFilter = 'All';
  }
}
