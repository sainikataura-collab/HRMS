
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AttendanceConfigService } from '../../payroll/services/attendance-config.service';
@Component({
  selector: 'app-attendance-config',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './attendance-config.component.html',
  styleUrl: './attendance-config.component.scss'
})
export class AttendanceConfigComponent {
  AttendanceconfigurationForm!: FormGroup;
  showError = false;
  isEditMode = false;
  Month: { name: string; value: string }[] = [];
  LeaveTypeNatureWiseList: { name: string, value: string }[] = [];
  Year: { name: string; value: string }[] = [];
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private ConfigService: AttendanceConfigService
  ) { }

  jdate_propationate = [
    { name: '0', value: '0' },
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' }
  ];

  AttendanceProcessTypes = [
    { name: 'Manual', value: 1 },
    { name: 'Biometric', value: 2 }
  ];

  penaltyOnList = [
    { name: 'Leave', value: 1 },
    { name: 'LWP', value: 2 }
  ];

  sandwichOnList = [
    { name: 'WO', value: 'WO' },
    { name: 'HLD', value: 'HLD' }
  ];

  ngOnInit() {
    this.AttendanceconfigurationForm = this.fb.group({
      fk_monthId: [null, Validators.required],
      fk_yearId: [null, Validators.required],
      isLockedForApply: [false],
      isLockedForApproval: [false],
      AttendanceProcessType: [null, Validators.required],

      //  Monthly Setup
      lateAllow: [null, [Validators.required, Validators.min(0)]],
      lateTime: [null],

      //  Late Penalty
      isLatePenalty: [false],
      penaltyOn: [{ value: null, disabled: true }],
      penaltyLeaveType: [{ value: null, disabled: true }],
      lateCount: [{ value: 0, disabled: true }, [Validators.min(0)]],
      deduction: [{ value: 0, disabled: true }, [Validators.min(0)]],

      //  Sandwich
      isSandwichApplicable: [false],
      sandwichOn: [{ value: null, disabled: true }]
    });

    // Add value change listeners for checkboxes
    this.setupCheckboxListeners();

    this.loadLeaveConfig();
    this.getMonthlist('Month');
    this.getYearList('Year');
    this.getLeaveTypeNatureWise('LeaveTypeNatureWise');
  }

  setupCheckboxListeners() {
    // Listen to isLatePenalty checkbox
    this.AttendanceconfigurationForm.get('isLatePenalty')?.valueChanges.subscribe(checked => {
      const penaltyOnControl = this.AttendanceconfigurationForm.get('penaltyOn');
      const penaltyLeaveTypeControl = this.AttendanceconfigurationForm.get('penaltyLeaveType');
      const lateCountControl = this.AttendanceconfigurationForm.get('lateCount');
      const deductionControl = this.AttendanceconfigurationForm.get('deduction');

      if (checked) {
        // Enable and make penaltyOn required
        penaltyOnControl?.enable();
        penaltyOnControl?.setValidators([Validators.required]);
        penaltyOnControl?.updateValueAndValidity();
      } else {
        // Disable and remove validators
        penaltyOnControl?.disable();
        penaltyOnControl?.clearValidators();
        penaltyOnControl?.setValue(null);
        penaltyOnControl?.updateValueAndValidity();

        penaltyLeaveTypeControl?.disable();
        penaltyLeaveTypeControl?.clearValidators();
        penaltyLeaveTypeControl?.setValue(null);
        penaltyLeaveTypeControl?.updateValueAndValidity();

        lateCountControl?.disable();
        lateCountControl?.setValue(null);
        
        deductionControl?.disable();
        deductionControl?.setValue(null);
      }
    });

    // Listen to penaltyOn dropdown
    this.AttendanceconfigurationForm.get('penaltyOn')?.valueChanges.subscribe(value => {
      const penaltyLeaveTypeControl = this.AttendanceconfigurationForm.get('penaltyLeaveType');
      const lateCountControl = this.AttendanceconfigurationForm.get('lateCount');
      const deductionControl = this.AttendanceconfigurationForm.get('deduction');

      if (value) {
        // Enable lateCount and deduction when any penaltyOn option is selected
        lateCountControl?.enable();
        deductionControl?.enable();
        
        // Enable penaltyLeaveType only when value is 1 (Leave) and make it required
        if (value == 1) {
          penaltyLeaveTypeControl?.enable();
          penaltyLeaveTypeControl?.setValidators([Validators.required]);
          penaltyLeaveTypeControl?.updateValueAndValidity();
        } else {
          penaltyLeaveTypeControl?.disable();
          penaltyLeaveTypeControl?.clearValidators();
          penaltyLeaveTypeControl?.setValue(null);
          penaltyLeaveTypeControl?.updateValueAndValidity();
        }
      } else {
        // Disable lateCount and deduction when penaltyOn is cleared
        lateCountControl?.disable();
        lateCountControl?.setValue(null);
        
        deductionControl?.disable();
        deductionControl?.setValue(null);
        
        penaltyLeaveTypeControl?.disable();
        penaltyLeaveTypeControl?.clearValidators();
        penaltyLeaveTypeControl?.setValue(null);
        penaltyLeaveTypeControl?.updateValueAndValidity();
      }
    });

    // Listen to isSandwichApplicable checkbox
    this.AttendanceconfigurationForm.get('isSandwichApplicable')?.valueChanges.subscribe(checked => {
      const sandwichOnControl = this.AttendanceconfigurationForm.get('sandwichOn');

      if (checked) {
        // Enable and make sandwichOn required
        sandwichOnControl?.enable();
        sandwichOnControl?.setValidators([Validators.required]);
        sandwichOnControl?.updateValueAndValidity();
      } else {
        // Disable and remove validators
        sandwichOnControl?.disable();
        sandwichOnControl?.clearValidators();
        sandwichOnControl?.setValue(null);
        sandwichOnControl?.updateValueAndValidity();
      }
    });
  }

  get f() {
    return this.AttendanceconfigurationForm.controls;
  }

  getLeaveTypeNatureWise(fieldName: string) {
    this.ConfigService.getLeaveTypeNatureWise(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.LeaveTypeNatureWiseList = res.data.map((e: any) => ({
            name: e.name,
            value: e.value
          }));
        } else {
          this.toastrService.error("Failed to load Leave Type list.");
        }
      },
      error: (err) => {
        console.error("Error fetching Leave Type list:", err);
        this.toastrService.error("Error fetching Leave Type.");
      }
    });
  }

  getMonthlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.ConfigService.getMonthlist(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Month = res.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        } else {
          this.toastrService.error('Failed to load month list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching month list:', err);
        this.toastrService.error('Error fetching month list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  getYearList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.ConfigService.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Year = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error('Failed to load year list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching year list:', err);
        this.toastrService.error('Error fetching year list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  loadLeaveConfig() {
    this.ngxUILoaderService.start();
    this.ConfigService.getConfigList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data?.length > 0) {
          this.isEditMode = true;
          const data = res.data[0];
          this.AttendanceconfigurationForm.patchValue({
            fk_monthId: String(data.fk_monthId),
            fk_yearId: String(data.fk_yearId),
            isLockedForApply: data.isLockedForApply,
            isLockedForApproval: data.isLockedForApproval,
            AttendanceProcessType: data.attendanceProcessType,

            lateAllow: data.lateAllow,
            lateTime: data.lateTime,

            isLatePenalty: data.isLatePenalty,
            penaltyOn: data.penaltyOn,
            penaltyLeaveType: data.penaltyLeaveType == 0 ? null : data.penaltyLeaveType,
            lateCount: data.lateCount,
            deduction: data.deduction,

            isSandwichApplicable: data.isSandwichApplicable,
            sandwichOn: data.sandwichOn
          });
        } else {
          this.isEditMode = false;
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error loading leave config:', err);
        this.toastrService.error('Something went wrong while loading data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  fixNegative(controlName: string) {
    const ctrl = this.AttendanceconfigurationForm.get(controlName);
    if (ctrl && ctrl.value < 0) {
      ctrl.setValue(null);
    }
  }

  resetForm() {
    this.AttendanceconfigurationForm.reset();
    // Reset disabled states
    this.AttendanceconfigurationForm.get('penaltyOn')?.disable();
    this.AttendanceconfigurationForm.get('penaltyLeaveType')?.disable();
    this.AttendanceconfigurationForm.get('lateCount')?.disable();
    this.AttendanceconfigurationForm.get('deduction')?.disable();
    this.AttendanceconfigurationForm.get('sandwichOn')?.disable();
    this.isEditMode = false;
  }

  onSubmit() {
      this.showError = true;
    if (!this.AttendanceconfigurationForm.valid) {
      this.toastrService.error('Please fill all required fields.');
      return;
    }

    const formValue = this.AttendanceconfigurationForm.getRawValue(); // Use getRawValue to get disabled fields

    const payload = {
      leaveConfig: {
        fk_monthId: formValue.fk_monthId,
        fk_yearId: formValue.fk_yearId,
        AttendanceProcessType: formValue.AttendanceProcessType,
        IsLockedForApply: formValue.isLockedForApply ?? false,
        IsLockedForApproval: formValue.isLockedForApproval ?? false,

        LateAllow: formValue.lateAllow,
        LateTime: formValue.lateTime,

        IsLatePenalty: formValue.isLatePenalty ?? false,
        PenaltyOn: formValue.penaltyOn,  // Allow null
        PenaltyLeaveType: formValue.penaltyLeaveType,  // Allow null
        LateCount: formValue.lateCount ?? 0,  // Allow null
        Deduction: formValue.deduction ?? 0,  // Allow null

        IsSandwichApplicable: formValue.isSandwichApplicable ?? false,
        SandwichOn: formValue.sandwichOn
      }
    };

    if (this.isEditMode) {
      this.updateConfig(payload);
          this.showError = false;
    } else {
      this.insertConfig(payload);
        this.showError = false;

    }
  }

  insertConfig(payload: any) {
    this.ngxUILoaderService.start();
    this.ConfigService.insertConfig(payload).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        if (res?.isSuccess) {
          this.toastrService.success('Configuration inserted successfully.');
          this.isEditMode = true;
          this.loadLeaveConfig(); // Reload to get the saved data
        } else {
          this.toastrService.error(res.message || 'Insert failed.');
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        console.error('Insert failed:', err);
        this.toastrService.error('An error occurred while inserting.');
      }
    });
  }

  updateConfig(payload: any) {
    this.ngxUILoaderService.start();
    this.ConfigService.updateConfig(payload).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        if (res?.isSuccess) {
          this.toastrService.success('Configuration updated successfully.');
          this.loadLeaveConfig(); // Reload to get the updated data
        } else {
          this.toastrService.error(res.message || 'Update failed.');
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        console.error('Update failed:', err);
        this.toastrService.error('An error occurred while updating.');
      }
    });
  }
}