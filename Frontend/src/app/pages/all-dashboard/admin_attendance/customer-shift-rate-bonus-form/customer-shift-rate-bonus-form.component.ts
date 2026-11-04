import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerShiftRateBonusService } from '../service/customer-shift-rate-bonus.service';

@Component({
  selector: 'app-customer-shift-rate-bonus-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgSelectModule],
  templateUrl: './customer-shift-rate-bonus-form.component.html',
  styleUrls: ['./customer-shift-rate-bonus-form.component.scss']
})
export class CustomerShiftRateBonusFormComponent implements OnInit {
  isEditMode: boolean = false;
  editId: number = 0;
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Dropdown data
  allClients: any[] = [];
  allLocations: any[] = [];
  clients: any[] = [];
  locations: any[] = [];

  // Payout type options
  payoutTypeOptions = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' }
  ];

  // Form model
  formData: any = {
    pk_id: 0,
    fk_clientId: null,
    fk_locId: null,
    shiftTypeA: null,
    shiftTypeB: null,
    shiftTypeC: null,
    attendanceBonus: null,
    isBonusApplicable: false,
    bonusPayoutType: null,
    attendanceApplicableDays: null,
    quarterlyIncentive: 0,
    isPeakIncentiveApplicable: false,
    peakIncentives: [],
    isActive: true
  };

  // Temp state for Peak Incentive inline entry
  tempPeakIncentive: any = {
    pk_peakIncentiveId: 0,
    fromDate: '',
    toDate: '',
    incentiveAmount: null
  };
  editingPeakIndex: number | null = null;

  constructor(
    private service: CustomerShiftRateBonusService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadDropdowns();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editId = +params['id'];
        this.isEditMode = true;
        this.loadRecordForEdit(this.editId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/customer_shift_rate_bonus_list']);
  }

  loadDropdowns(): void {
    // 1. Clients (Company-wise from General/dropdownList/Client)
    this.service.getClients().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.allClients = list
          .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
          .map((c: any) => ({
            value: (c.value ?? c.Value ?? '').toString(),
            text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
          }));
        this.clients = [...this.allClients];
      },
      error: (err: any) => console.error('Error fetching clients dropdown:', err)
    });

    // 2. Locations (Company-wise from General/dropdownList/Location)
    this.service.getLocations().subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        this.allLocations = list
          .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
          .map((l: any) => ({
            value: (l.value ?? l.Value ?? '').toString(),
            text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.locname ?? l.value
          }));
        this.locations = [...this.allLocations];
      },
      error: (err: any) => console.error('Error fetching locations dropdown:', err)
    });
  }

  onCustomerChange(clientId: any): void {
    if (clientId) {
      this.service.getLocationsByClient(clientId.toString()).subscribe({
        next: (res: any) => {
          const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
          this.locations = list
            .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
            .map((l: any) => ({
              value: (l.value ?? l.Value ?? '').toString(),
              text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.value
            }));

          // If current location is not in filtered list, reset location selection
          if (this.formData.fk_locId && !this.locations.some(l => l.value === this.formData.fk_locId.toString())) {
            this.formData.fk_locId = null;
          }
        },
        error: (err: any) => console.error('Error filtering locations by client:', err)
      });
    } else {
      if (this.formData.fk_locId) {
        this.service.getClientsByLocation(this.formData.fk_locId.toString()).subscribe({
          next: (res: any) => {
            const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
            this.clients = list
              .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
              .map((c: any) => ({
                value: (c.value ?? c.Value ?? '').toString(),
                text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
              }));
          }
        });
        this.locations = [...this.allLocations];
      } else {
        this.clients = [...this.allClients];
        this.locations = [...this.allLocations];
      }
    }
  }

  onLocationChange(locationId: any): void {
    if (locationId) {
      this.service.getClientsByLocation(locationId.toString()).subscribe({
        next: (res: any) => {
          const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
          this.clients = list
            .filter((c: any) => c.value != null && c.value !== '' && c.value !== 'null')
            .map((c: any) => ({
              value: (c.value ?? c.Value ?? '').toString(),
              text: c.name ?? c.Name ?? c.text ?? c.Text ?? c.value
            }));

          // If current client is not in filtered list, reset client selection
          if (this.formData.fk_clientId && !this.clients.some(c => c.value === this.formData.fk_clientId.toString())) {
            this.formData.fk_clientId = null;
          }
        },
        error: (err: any) => console.error('Error filtering clients by location:', err)
      });
    } else {
      if (this.formData.fk_clientId) {
        this.service.getLocationsByClient(this.formData.fk_clientId.toString()).subscribe({
          next: (res: any) => {
            const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
            this.locations = list
              .filter((l: any) => l.value != null && l.value !== '' && l.value !== 'null')
              .map((l: any) => ({
                value: (l.value ?? l.Value ?? '').toString(),
                text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.value
              }));
          }
        });
        this.clients = [...this.allClients];
      } else {
        this.clients = [...this.allClients];
        this.locations = [...this.allLocations];
      }
    }
  }

  onlyWholeNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow only digits 0-9
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onBonusApplicableChange(): void {
    if (!this.formData.isBonusApplicable) {
      this.formData.bonusPayoutType = null;
    }
  }

  onPeakIncentiveApplicableChange(): void {
    if (!this.formData.isPeakIncentiveApplicable) {
      this.cancelEditPeakIncentive();
    }
  }

  addPeakIncentiveEntry(): void {
    const { fromDate, toDate, incentiveAmount } = this.tempPeakIncentive;
    if (!fromDate) {
      this.toastr.warning('Please select From Date for Peak Incentive.');
      return;
    }
    if (!toDate) {
      this.toastr.warning('Please select To Date for Peak Incentive.');
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      this.toastr.warning('To Date cannot be earlier than From Date.');
      return;
    }
    const parsedAmount = Math.floor(Number(incentiveAmount));
    if (incentiveAmount == null || incentiveAmount === '' || isNaN(incentiveAmount) || parsedAmount <= 0) {
      this.toastr.warning('Please enter a valid Incentive Amount greater than 0.');
      return;
    }

    if (!Array.isArray(this.formData.peakIncentives)) {
      this.formData.peakIncentives = [];
    }

    const itemToSave = {
      pk_peakIncentiveId: this.tempPeakIncentive.pk_peakIncentiveId || 0,
      fromDate: fromDate,
      toDate: toDate,
      incentiveAmount: parsedAmount
    };

    if (this.editingPeakIndex !== null && this.editingPeakIndex >= 0) {
      this.formData.peakIncentives[this.editingPeakIndex] = itemToSave;
      this.toastr.info('Peak incentive updated.');
    } else {
      this.formData.peakIncentives.push(itemToSave);
      this.toastr.info('Peak incentive added.');
    }

    this.cancelEditPeakIncentive();
  }

  editPeakIncentiveEntry(index: number): void {
    if (this.formData.peakIncentives && this.formData.peakIncentives[index]) {
      const item = this.formData.peakIncentives[index];
      const formatToDateInput = (val: any) => {
        if (!val) return '';
        if (typeof val === 'string' && val.length >= 10) return val.substring(0, 10);
        const d = new Date(val);
        return !isNaN(d.getTime()) ? d.toISOString().substring(0, 10) : '';
      };

      this.tempPeakIncentive = {
        pk_peakIncentiveId: item.pk_peakIncentiveId || 0,
        fromDate: formatToDateInput(item.fromDate),
        toDate: formatToDateInput(item.toDate),
        incentiveAmount: Math.floor(Number(item.incentiveAmount))
      };
      this.editingPeakIndex = index;
    }
  }

  removePeakIncentiveEntry(index: number): void {
    if (confirm('Are you sure you want to remove this peak incentive period?')) {
      this.formData.peakIncentives.splice(index, 1);
      if (this.editingPeakIndex === index) {
        this.cancelEditPeakIncentive();
      }
    }
  }

  cancelEditPeakIncentive(): void {
    this.tempPeakIncentive = {
      pk_peakIncentiveId: 0,
      fromDate: '',
      toDate: '',
      incentiveAmount: null
    };
    this.editingPeakIndex = null;
  }

  loadRecordForEdit(id: number): void {
    this.isLoading = true;
    this.service.getById(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = res?.data ?? res?.Data ?? res;
        if (data) {
          const peakList = Array.isArray(data.peakIncentives) ? data.peakIncentives.map((p: any) => {
            const formatToDateInput = (val: any) => {
              if (!val) return '';
              if (typeof val === 'string' && val.length >= 10) return val.substring(0, 10);
              const d = new Date(val);
              return !isNaN(d.getTime()) ? d.toISOString().substring(0, 10) : '';
            };
            return {
              pk_peakIncentiveId: p.pk_peakIncentiveId || 0,
              fromDate: formatToDateInput(p.fromDate),
              toDate: formatToDateInput(p.toDate),
              incentiveAmount: p.incentiveAmount != null ? Math.floor(Number(p.incentiveAmount)) : 0
            };
          }) : [];

          this.formData = {
            pk_id: data.pk_id,
            fk_clientId: data.fk_clientId ? data.fk_clientId.toString() : null,
            fk_locId: data.fk_locId ? data.fk_locId.toString() : null,
            shiftTypeA: data.shiftTypeA != null ? data.shiftTypeA : 0,
            shiftTypeB: data.shiftTypeB != null ? data.shiftTypeB : 0,
            shiftTypeC: data.shiftTypeC != null ? data.shiftTypeC : 0,
            attendanceBonus: data.attendanceBonus != null ? data.attendanceBonus : 0,
            isBonusApplicable: !!data.isBonusApplicable,
            bonusPayoutType: data.bonusPayoutType || null,
            attendanceApplicableDays: data.attendanceApplicableDays != null
              ? data.attendanceApplicableDays
              : (data.AttendanceApplicableDays != null ? data.AttendanceApplicableDays : null),
            quarterlyIncentive: data.quarterlyIncentive != null ? Math.floor(Number(data.quarterlyIncentive)) : 0,
            isPeakIncentiveApplicable: !!data.isPeakIncentiveApplicable,
            peakIncentives: peakList,
            isActive: data.isActive !== false
          };

          if (this.formData.fk_clientId) {
            this.service.getLocationsByClient(this.formData.fk_clientId).subscribe({
              next: (locRes: any) => {
                const list = locRes?.data ?? locRes?.Data ?? (Array.isArray(locRes) ? locRes : []);
                if (list && list.length > 0) {
                  this.locations = list.map((l: any) => ({
                    value: (l.value ?? l.Value ?? '').toString(),
                    text: l.name ?? l.Name ?? l.text ?? l.Text ?? l.value
                  }));
                }
              }
            });
          }
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('Failed to load record details.');
        console.error('Error loading record:', err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.fk_clientId) {
      this.toastr.warning('Please select a Customer.');
      return false;
    }
    if (!this.formData.fk_locId) {
      this.toastr.warning('Please select a Location.');
      return false;
    }
    if (this.formData.shiftTypeA == null || this.formData.shiftTypeA === '' || isNaN(this.formData.shiftTypeA)) {
      this.toastr.warning('Please enter a valid numeric value for Shift Type A.');
      return false;
    }
    if (this.formData.shiftTypeB == null || this.formData.shiftTypeB === '' || isNaN(this.formData.shiftTypeB)) {
      this.toastr.warning('Please enter a valid numeric value for Shift Type B.');
      return false;
    }
    if (this.formData.shiftTypeC == null || this.formData.shiftTypeC === '' || isNaN(this.formData.shiftTypeC)) {
      this.toastr.warning('Please enter a valid numeric value for Shift Type C.');
      return false;
    }
    if (this.formData.attendanceBonus == null || this.formData.attendanceBonus === '' || isNaN(this.formData.attendanceBonus)) {
      this.toastr.warning('Please enter a valid numeric value for Attendance Bonus.');
      return false;
    }
    if (this.formData.isBonusApplicable && !this.formData.bonusPayoutType) {
      this.toastr.warning('Please select a Bonus Payout Type (Monthly/Yearly).');
      return false;
    }
    return true;
  }

  onSave(): void {
    if (!this.validateForm()) return;

    this.isSaving = true;

    // Quarterly Incentive: whole number, default 0 even if left empty
    const quarterlyIncentiveValue = (this.formData.quarterlyIncentive !== null && this.formData.quarterlyIncentive !== '' && !isNaN(this.formData.quarterlyIncentive))
      ? Math.floor(Number(this.formData.quarterlyIncentive))
      : 0;

    const payload = {
      pk_id: this.isEditMode ? this.editId : 0,
      fk_clientId: this.formData.fk_clientId,
      fk_locId: this.formData.fk_locId,
      shiftTypeA: Number(this.formData.shiftTypeA),
      shiftTypeB: Number(this.formData.shiftTypeB),
      shiftTypeC: Number(this.formData.shiftTypeC),
      attendanceBonus: Number(this.formData.attendanceBonus),
      isBonusApplicable: !!this.formData.isBonusApplicable,
      bonusPayoutType: this.formData.isBonusApplicable ? this.formData.bonusPayoutType : null,
      attendanceApplicableDays: Number(this.formData.attendanceApplicableDays || 0),
      quarterlyIncentive: quarterlyIncentiveValue,
      isPeakIncentiveApplicable: !!this.formData.isPeakIncentiveApplicable,
      peakIncentives: this.formData.isPeakIncentiveApplicable ? (this.formData.peakIncentives || []).map((p: any) => ({
        pk_peakIncentiveId: p.pk_peakIncentiveId || 0,
        fromDate: p.fromDate,
        toDate: p.toDate,
        incentiveAmount: Math.floor(Number(p.incentiveAmount) || 0)
      })) : [],
      isActive: true
    };

    const request$ = this.isEditMode
      ? this.service.update(payload)
      : this.service.insert(payload);

    request$.subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.isSuccess || res?.IsSuccess || res?.statusCode === 200) {
          this.toastr.success(res?.message || (this.isEditMode ? 'Updated successfully!' : 'Saved successfully!'));
          this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/customer_shift_rate_bonus_list']);
        } else {
          this.toastr.error(res?.message || 'Operation failed. Please try again.');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        const msg = err?.error?.message || err?.message || 'Server error occurred.';
        this.toastr.error(msg);
        console.error('Error saving record:', err);
      }
    });
  }

  resetForm(): void {
    this.formData = {
      pk_id: this.isEditMode ? this.editId : 0,
      fk_clientId: null,
      fk_locId: null,
      shiftTypeA: null,
      shiftTypeB: null,
      shiftTypeC: null,
      attendanceBonus: null,
      isBonusApplicable: false,
      bonusPayoutType: null,
      attendanceApplicableDays: null,
      quarterlyIncentive: 0,
      isPeakIncentiveApplicable: false,
      peakIncentives: [],
      isActive: true
    };
    this.cancelEditPeakIncentive();
    this.clients = [...this.allClients];
    this.locations = [...this.allLocations];
  }

  onCancel(): void {
    this.goBack();
  }
}
