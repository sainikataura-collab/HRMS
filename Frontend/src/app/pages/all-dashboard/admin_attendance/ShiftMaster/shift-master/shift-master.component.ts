import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ShiftMasterService } from '../../../payroll/services/shift-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { EmployeeMasterService } from '../../../payroll/services/employee-master.service';



@Component({
  selector: 'app-shift-master',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './shift-master.component.html',
  styleUrl: './shift-master.component.scss'
})
export class ShiftMasterComponent {

  ShiftForm!: FormGroup;

  // ShiftId: number=0;
  ShiftId: number | null = null;

  Isedit = false;
  showError = false;

  Category: { label: string, value: string }[] = [];
  ShiftType: { name: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private ngxUILoaderService: NgxUiLoaderService,
    private shiftmasterService: ShiftMasterService,
    public encryptionService: EncryptionService,
    public employeeMasterService: EmployeeMasterService
  ) { }

  ngOnInit(): void {
    this.ShiftForm = this.fb.group({
      pk_shiftId: [null],
      shiftName: [null, Validators.required],
      startHrs: [null, Validators.required],
      endHrs: [null, Validators.required],
      duration: [null],
      graceTime: [null],
      compenstationTime: [null],
      isActive: [true],
      fk_catid: [null],
      fk_shifttype: [null],
    });

    this.ShiftForm.get('startHrs')?.valueChanges.subscribe(() => this.calculateDuration());
    this.ShiftForm.get('endHrs')?.valueChanges.subscribe(() => this.calculateDuration());

    // this.ShiftId=Number.parseInt(this.route.snapshot.params['pk_shiftId'])
    this.ShiftId = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['pk_shiftId']));



    if (this.ShiftId && this.ShiftId) {
      this.getShiftDetailsByid(this.ShiftId);
      this.Isedit = true;
    }

    this.getCategoryList('Category');
    this.getShiftTypeList();
  }

  calculateDuration(): void {
    const start = this.ShiftForm.get('startHrs')?.value;
    const end = this.ShiftForm.get('endHrs')?.value;

    if (start && end) {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);

      if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
        let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Handles overnight shifts
        }
        const h = Math.floor(diffMinutes / 60);
        const m = diffMinutes % 60;
        const durationStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        this.ShiftForm.patchValue({ duration: durationStr }, { emitEvent: false });
      }
    }
  }

  restrictTimeInput(event: KeyboardEvent): void {
    const allowed = /[0-9:]/;
    if (!allowed.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
      event.preventDefault();
    }
  }

  formatTimeOnBlur(controlName: string): void {
    const control = this.ShiftForm.get(controlName);
    let val = control?.value?.toString()?.trim();
    if (!val) return;

    val = val.replace(/\s*(AM|PM|am|pm)/gi, '').trim();

    if (/^\d+$/.test(val)) {
      const num = parseInt(val, 10);
      if (num < 60) {
        val = `00:${String(num).padStart(2, '0')}`;
      } else {
        const h = Math.floor(num / 60);
        const m = num % 60;
        val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    } else if (val.includes(':')) {
      const parts = val.split(':');
      const h = String(parseInt(parts[0] || '0', 10)).padStart(2, '0');
      const m = String(parseInt(parts[1] || '0', 10)).padStart(2, '0');
      val = `${h}:${m}`;
    }

    control?.setValue(val);
  }

  formatHHmm(val: any): string {
    if (!val) return '';
    return val.toString().replace(/\s*(AM|PM|am|pm)/gi, '').trim();
  }





  checkDesignationAvailability(shiftName: string): void {
    const fieldName = 'ShiftName';
    const fieldValue = shiftName;
    // const generalId = this.ShiftId; 
    const generalId = this.ShiftId ?? 0;


    this.shiftmasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ShiftForm.get('shiftName')?.setErrors({ duplicate: response.message });
        } else {
          this.ShiftForm.get('shiftName')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.ShiftForm.get('shiftName')?.setErrors({ duplicate: 'Error checking designation availability.' });
      }
    });
  }

  getCategoryList(fieldName: string) {

    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {

          this.Category = res.data.map((fk_catid: any) => ({
            name: fk_catid.name,
            value: fk_catid.value
          }));
        } else {
          this.toastrService.error("Failed to load Category list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Category list.");
      }
    });
  }

  getShiftTypeList(fieldName: string = 'ShiftType') {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data && res.data.length > 0) {
          this.ShiftType = res.data.map((item: any) => ({
            name: item.name ?? item.Name ?? item.codeDescription ?? item.text ?? item.Text ?? '',
            value: (item.value ?? item.Value ?? item.codeId ?? item.CodeId)?.toString()
          }));
        } else {
          this.loadShiftTypeFromCodeType();
        }
      },
      error: () => {
        this.loadShiftTypeFromCodeType();
      }
    });
  }

  loadShiftTypeFromCodeType() {
    const compId = sessionStorage.getItem('companyId') || 'GU-1';
    this.employeeMasterService.getDdlListBasedOnCodeType('16', compId).subscribe({
      next: (res) => {
        const list = res?.data ?? res?.Data ?? (Array.isArray(res) ? res : []);
        if (list && list.length > 0) {
          this.ShiftType = list.map((item: any) => ({
            name: item.name ?? item.Name ?? item.codeDescription ?? item.description ?? item.text ?? '',
            value: (item.value ?? item.Value ?? item.codeId ?? item.CodeId ?? item.id)?.toString()
          }));
        } else {
          this.toastrService.error("Failed to load Shift Type list.");
        }
      },
      error: () => {
        this.toastrService.error("Error fetching Shift Type list.");
      }
    });
  }

  getShiftDetailsByid(pk_shiftId: number) {

    this.ngxUILoaderService.start(); // Start loader before API call

    this.shiftmasterService.get_ShiftById(pk_shiftId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Department Data:", res.data);  // Debugging ke liye

          let shiftTypeVal = res.data.fk_shifttype?.toString();
          if (shiftTypeVal && isNaN(Number(shiftTypeVal))) {
            const matched = this.ShiftType.find(st => st.name?.toLowerCase() === shiftTypeVal.toLowerCase());
            if (matched) {
              shiftTypeVal = matched.value;
            }
          }

          this.ShiftForm.patchValue({
            pk_shiftId: res.data.pk_shiftId,
            shiftName: res.data.shiftName,
            startHrs: res.data.startTime,
            endHrs: res.data.endTime,
            duration: this.formatHHmm(res.data.duration),
            graceTime: this.formatHHmm(res.data.graceTime),
            compenstationTime: this.formatHHmm(res.data.compenstationTime),
            isActive: res.data.isActive,
            fk_catid: res.data.fk_catid,
            fk_shifttype: shiftTypeVal
          });

          if (!res.data.duration) {
            this.calculateDuration();
          }

          this.Isedit = true;

        }
        else {
          this.toastrService.error("Failed to load Category details.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response

      },
      error: () => {
        this.toastrService.error("Error loading Category data.");
        this.ngxUILoaderService.stop(); // Stop loader on error

      }
    });
  }



  submitForm(): void {
    if (this.ShiftForm.invalid) {
      this.toastrService.error('Please fill all required fields.');
      this.showError = true;
      return;
    }

    const rawValue = this.ShiftForm.value;
    const formData = {
      ...rawValue,
      duration: this.formatHHmm(rawValue.duration),
      graceTime: this.formatHHmm(rawValue.graceTime),
      compenstationTime: this.formatHHmm(rawValue.compenstationTime),
      companyId: sessionStorage.getItem('companyId'),
      locId: sessionStorage.getItem('locationID'),
      userId: sessionStorage.getItem('fk_UserID')
    };


    if (this.ShiftId) {
      // **UPDATE existing shift**
      const updateData = { ...formData, pk_shiftId: (this.ShiftId) };


      this.shiftmasterService.update_Shift(updateData).subscribe({
        next: (res) => {
          console.log("✅ Update Response:", res);
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/shiftmaster_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to update shift.');
          }
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
        }
      });

    } else {
      // **INSERT new shift**
      this.shiftmasterService.insert_Shift(formData).subscribe({
        next: (res) => {
          console.log("✅ Insert Response:", res);
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Shift added successfully!');
            this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/shiftmaster_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to add shift.');
          }
        },
        error: (err) => {
          console.error(' Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
        }
      });
    }
  }


  resetForm(): void {
    this.ShiftForm.reset({
      isActive: true
    });
  }
}
