import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ShiftMasterService } from '../../payroll/services/shift-master.service';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { EmployeeFactBoxComponent } from '../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonModule, FormsModule, RouterLink, EmployeeFactBoxComponent],
  templateUrl: './employee-attendance.component.html',
  styleUrl: './employee-attendance.component.scss'
})
export class EmployeeAttendanceComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  ngxUILoaderService = inject(NgxUiLoaderService);
  currentStep: number = 2;


  goToStep(step: number, route: string): void {
    this.currentStep = step;
    this.router.navigate([route]);
  }
  EmployeeForm!: FormGroup;
  EmployeeShiftForm!: FormGroup;
  // EmpAttdanceForm!:FormGroup;
  TempShiftData: any[] = []; // Temporary table data

  DefaultShift: { name: string, value: string }[] = [];
  Location: { name: string, value: string }[] = [];


  AttendanceSource = [
    { name: '--Select AttendanceSource--', value: '' },
    { "name": "Biometric", "value": "B" },
    { "name": "Mobile Attendence", "value": "M" },
    { "name": "Both", "value": "A" },
  ];


  outtime: string = '';
  showError = false;
  submitted = false;
  pk_empid!: string;
  Isedit = false;
  fromSource: string = '';
  constructor(private fb: FormBuilder, private employeeMasterService: EmployeeMasterService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, public encryptionService: EncryptionService, private shiftmasterService: ShiftMasterService,
  ) { }

  ngOnInit() {

    this.EmployeeForm = this.fb.group({
      pk_empid: [''],
      intimeHour: [''],
      intimeMinute: [''],
      Intime: [''],
      outtimeHour: [''],
      outtimeMinute: [''],
      Outtime: [''],
      gracetime: [null],
      OTApp: [false],
      empcode: [''],
      empname: [''],
      fk_shiftId: [null],
      attendanceSource: [null],
      geofence: [''],
      attendancelocation: [[]],
    });
    this.EmployeeShiftForm = this.fb.group({
      fk_shiftId: [null, Validators.required],
      fromdate: [null, Validators.required],
      todate: [null, Validators.required],
      isactive: [false] // default true

    });
    // this.EmpAttdanceForm = this.fb.group({ 
    //    attendanceSource: [null],
    //    geofence: [null],
    //    attendancelocation:[[]],

    //  });

    this.EmployeeForm.valueChanges.subscribe(() => {
      this.updateTime('outtime');
      this.updateTime('intime');

    });

    this.getShiftList('Shift');
    this.getLocationList('location');



    this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';

    this.route.paramMap.subscribe(params => {
      const encryptedId = params.get('pk_empid');
      if (encryptedId) {
        this.pk_empid = this.encryptionService.decryptText(encryptedId);
        this.EmployeeForm.patchValue({ pk_empid: this.pk_empid });

        if (this.pk_empid && this.pk_empid !== 'undefined') {
          this.loadEmployeeAttendanceData(this.pk_empid);
          this.Isedit = true;
        }
      }
    });


  }


  //--Start


  getShiftList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.DefaultShift = res.data.map((shift: any) => ({
            name: shift.name,
            value: shift.value
          }));
        } else {
          this.toastrService.error("Failed to load Location list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Location list.");
      }
    });
  }

  getLocationList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Location = res.data.map((shift: any) => ({
            name: shift.name,
            value: shift.value
          }));
        } else {
          this.toastrService.error("Failed to load Location list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Location list.");
      }
    });
  }

  getShiftDetailsByid(fk_shiftId: number) {
    this.shiftmasterService.get_ShiftById(fk_shiftId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Department Data:", res.data); // Debug

          // Format the times
          const intime = `${res.data.startHrs.padStart(2, '0')}:${res.data.startMinute.padStart(2, '0')}`;
          const outtime = `${res.data.endHrs.padStart(2, '0')}:${res.data.endMinute.padStart(2, '0')}`;

          this.EmployeeForm.patchValue({
            //fk_shiftId: res.data.fk_shiftId.toString(),
            shiftName: res.data.shiftName,
            Intime: intime,
            Outtime: outtime,
            gracetime: res.data.graceTime,
            OTApp: res.data.otApp,


          });

          this.Isedit = true;
        } else {
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

  onShiftChange(event: any) {
    const selectedShiftId = event?.value ?? event;
    if (selectedShiftId) {
      this.getShiftDetailsByid(selectedShiftId);
    }
  }




  addShiftEntry() {
    if (this.EmployeeShiftForm.valid) {
      const formValue = this.EmployeeShiftForm.value;

      const hasEmptyFields = Object.values(formValue).some(value =>
        value === null || value === '' || value === undefined
      );

      if (hasEmptyFields) {
        this.showError = true;
        return;
      }

      const newFrom = new Date(formValue.fromdate);
      const newTo = new Date(formValue.todate);

      const isOverlapping = this.TempShiftData.some((item, index) => {
        if (this.editIndex !== null && index === this.editIndex) return false;

        const existingFrom = new Date(item.fromdate);
        const existingTo = new Date(item.todate);

        return newFrom <= existingTo && newTo >= existingFrom;
      });

      if (isOverlapping) {
        alert("A shift already exists during this date range. Please choose different dates.");
        return;
      }

      if (this.editIndex !== null) {
        this.TempShiftData[this.editIndex] = formValue;
        this.editIndex = null;
      } else {
        this.TempShiftData.push(formValue);
      }

      this.EmployeeShiftForm.reset();
      this.EmployeeShiftForm.get('isactive')?.setValue(false);
      this.showError = false;
    } else {
      this.showError = true;
    }
  }


  // onSave() {
  //   const empFormValue = this.EmployeeForm.value;

  //   // Prepare payload from TempShiftData
  //   const SaveData = this.TempShiftData.map(item => ({
  //     fk_empid: empFormValue.pk_empid,
  //     fk_shiftId: Number(item.fk_shiftId),
  //     fromdate: item.fromdate,
  //     todate: item.todate,
  //     IsActive: item.isactive,
  //   }));

  //   console.log('Submitting Shift List:', SaveData);

  //   // API call to submit the entire list
  //   this.employeeMasterService.add_employee_Shift(SaveData).subscribe({
  //     next: (res) => {
  //       console.log('API Response:', res);
  //       if (res?.isSuccess) {
  //         this.toastrService.success(res.message);
  //         this.showSaveButton = false;
  //       } else {
  //         this.toastrService.error(res?.message || 'Failed to save shift data');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('API Error:', err);
  //       this.toastrService.error(err?.error?.message || 'Failed to save shift data', 'Error');
  //     }
  //   });
  // }

  handleClick() {
    this.onUpdate();
    this.onSubmit();
  }

  onUpdate() {

    debugger
    const empFormValue = this.EmployeeForm.value;

    console.log("this.tempShiftData", this.TempShiftData)
    if (this.TempShiftData.length == 0) {
      return;
    }
    // Prepare payload from TempShiftData
    const UpdateData = this.TempShiftData.map(item => ({
      fk_empid: empFormValue.pk_empid,
      fk_shiftId: Number(item.fk_shiftId),
      fromdate: item.fromdate,
      todate: item.todate,
      IsActive: item.isactive,
    }));

    console.log('Submitting Shift List:', UpdateData);


    // API call to submit the entire list
    this.employeeMasterService.update_employee_Shift(UpdateData).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        if (res?.isSuccess) {
          this.toastrService.success(res.message);
          this.loadEmployeeAttendanceData(empFormValue.pk_empid);
        } else {
          this.toastrService.error(res?.message || 'Failed to save shift data');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastrService.error(err?.error?.message || 'Failed to save shift data', 'Error');
      }
    });
  }








  getShiftLabelByValue(value: string): string {
    const shift = this.DefaultShift.find(s => s.value === value);
    return shift ? shift.name : 'Unknown';
  }

  editIndex: number | null = null;

  onEdit(index: number) {
    this.editIndex = index;
    const item = this.TempShiftData[index];
    this.EmployeeShiftForm.patchValue({
      fromdate: item.fromdate,
      todate: item.todate,
      fk_shiftId: item.fk_shiftId,
      isactive: item.isactive
    });


  }




  //--
  updateTime(field: string) {
    if (field === 'intime') {
      const hour = this.EmployeeForm.get('intimeHour')?.value;
      const minute = this.EmployeeForm.get('intimeMinute')?.value;
      if (hour && minute) {
        this.EmployeeForm.patchValue({ intime: `${hour}:${minute}` }, { emitEvent: false });
      }
    } else if (field === 'outtime') {
      const hour = this.EmployeeForm.get('outtimeHour')?.value;
      const minute = this.EmployeeForm.get('outtimeMinute')?.value;
      if (hour && minute) {
        this.EmployeeForm.patchValue({ outtime: `${hour}:${minute}` }, { emitEvent: false });
      }
    }
  }

  loadEmployeeAttendanceData(pk_empid: string) {
    debugger
    this.employeeMasterService.getById_employeeattendance(pk_empid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched EmployeeAttendance Data:", res.data);  // Debugging ke liye

          const [intimeHour, intimeMinute] = res.data.intime?.split(':') ?? ['', ''];
          const [outtimeHour, outtimeMinute] = res.data.outtime?.split(':') ?? ['', ''];

          const empShift = res.data.empShift;
          const attendanceLocations = res.data.attendanceLocations || [];


          this.EmployeeForm.patchValue({
            pk_empid: empShift.pk_empid,
            Intime: empShift.intime,
            Outtime: empShift.outtime,
            gracetime: empShift.gracetime,
            OTApp: empShift.otApp,
            empcode: empShift.empcode,
            empname: empShift.empname,
            attendanceSource: empShift.attendanceSource,
            geofence: empShift['geofence'], //

            attendancelocation: (attendanceLocations || []).map((loc: { attendancelocation: any; }) => loc.attendancelocation),
            fk_shiftId: empShift.fk_shiftId ? empShift.fk_shiftId.toString() : null

          });


          // Patch shiftDateWise data to table
          this.TempShiftData = (res.data.shiftDateWise || []).map((item: any) => ({
            ...item,
            fromdate: this.formatDateForInput(item.fromdate),
            todate: this.formatDateForInput(item.todate),
            fk_shiftId: item.fk_shiftId.toString(),
            isactive: item.isActive
          }));

          this.Isedit = true;
          // this.EmployeeShiftForm.patchValue({
          //   fk_empid: res.data.pk_empid,
          //   fk_shiftId: res.data.fk_shiftId.toString(),
          //   fromdate: this.formatDateForInput(res.data.fromdate),
          //   todate: this.formatDateForInput(res.data.todate)
          // });

        } else {
          this.toastrService.error("Failed to load EmployeeAttendance details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading EmployeeAttendance data.");
      }
    });
  }


  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }


  onSubmit(): void {
    if (this.EmployeeForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Ensure the correct form values are used
    const updatedData = this.EmployeeForm.value;
    const empId = this.pk_empid || updatedData.pk_empid;

    console.log('Submitting Data:', updatedData);

    this.employeeMasterService.update_employeeattendance(updatedData).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        if (res?.isSuccess) {
          if (this.TempShiftData && this.TempShiftData.length > 0) {
            const shiftPayload = this.TempShiftData.map(item => ({
              fk_empid: empId,
              fk_shiftId: Number(item.fk_shiftId),
              fromdate: item.fromdate,
              todate: item.todate,
              IsActive: item.isactive,
            }));

            this.employeeMasterService.update_employee_Shift(shiftPayload).subscribe({
              next: () => {
                if (this.factBox) {
                  this.factBox.refresh();
                }
              },
              error: (shiftErr) => {
                console.error('Failed to update employee shift:', shiftErr);
                if (this.factBox) {
                  this.factBox.refresh();
                }
              }
            });
          } else {
            if (this.factBox) {
              this.factBox.refresh();
            }
          }

          this.toastrService.success('Employee Attendance updated successfully!', 'Success');
        } else {
          this.toastrService.error(res?.message || 'Update Failed', 'Error');
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastrService.error(err?.error?.message || 'Failed to update employee attendance', 'Error');
      }
    });
  }





  resetForm(): void {
    this.EmployeeForm.reset();
  }


  goToAttendance() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToEmployeeMst() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToOtherDetails() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Shift Details first');
    }
  }

  goTohead() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Compliance Details first');
    }
  }

  goToDemographic() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToQualification() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToExperience() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  onBack(): void {
    if (this.fromSource === 'demographic_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails_list']);
    } else if (this.fromSource === 'qualification_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst_list']);
    } else if (this.fromSource === 'experience_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_list']);
    } else {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list']);
    }
  }


  selectedLocations: string[] = [];



  //use form multi location
  //Selects/deselects all locations.
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedLocations = [];
    } else {
      this.selectedLocations = this.Location.map(loc => loc.value);
    }
    this.EmployeeForm.patchValue({ fk_locid: this.selectedLocations });
  }
  //for check all location selected or not return true if checked all otherwise false
  isAllSelected(): boolean {
    return this.selectedLocations.length === this.Location.length;
  }
  //Returns appropriate display text based on selection.
  getLocationDisplayText(): string {
    if (this.isAllSelected()) {
      return "All Selected";
    }
    else if (this.selectedLocations.length === 1) {
      // Sirf ek value select ho tab uska naam dikhana hai
      return this.Location.find(item => item.value === this.selectedLocations[0])?.name || "--Select Locations--";
    }
    else if (this.selectedLocations.length > 1) {
      // Multiple values select ho to pehla naam + "..."
      const firstSelected = this.Location.find(item => item.value === this.selectedLocations[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select Locations--";
    }
    else {
      return "--Select Locations--";
    }
  }

  //Adds/removes a location from the selection.
  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
    this.EmployeeForm.patchValue({ attendancelocation: this.selectedLocations });
  }


  // 


  onGeoToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.EmployeeForm.get('geofence')?.setValue(isChecked ? '1' : '0');
  }

}