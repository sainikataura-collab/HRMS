


import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent, } from '@ng-select/ng-select';
import { ILeaveType } from '../../../Interface/icommon';
import { CommonModule } from '@angular/common';
import { LeaveTypeMasterService } from '../../../services/leavetype.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-leave-type',
  standalone: true,
  imports: [NgSelectComponent, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './leave-type.component.html',
  styleUrl: './leave-type.component.scss'
})
export class LeaveTypeComponent {

  EmpNature: { name: string, value: string }[] = [];
  LeaveTypeNatureWiseList: { name: string, value: string }[] = [];

  Formula = [{ name: '-- Select Formula --', value: '' }];

  LeaveBasedOn = [
    { name: '-- Leave Based On --', value: 'S' },
    { name: 'Calendar', value: 'C' },
    { name: 'Financial Year', value: 'F' }
  ];

  earnedBasedOn = [
    { name: '-- Select Earn Based On --', value: '' },
    { name: 'Present', value: 1 },
    { name: 'Paid Days', value: 2 },
    { name: 'Full Day', value: 3 }
  ];

  LeaveNatureType = [
    { name: '-- Select Leave Nature Type --', value: '' },
    { name: 'Normal', value: 'N' },
    { name: 'OD', value: 'D' },
    { name: 'Travel Requisition', value: 'T' },
    { name: 'Leave Without Pay', value: 'L' },
    { name: 'Weekly Off', value: 'O' },
    { name: 'National Holiday', value: 'H' },
    { name: 'Short Leave', value: 'S' },
  ];

  LeaveProcessingType = [
    { name: '-- Leave Processing --', value: '0' },
    { name: 'Monthly', value: 'M' },
    { name: 'Quarterly', value: 'Q' },
    { name: 'Half Yearly', value: 'H' },
    { name: 'Yearly', value: 'Y' }
  ];

  editingIndex: number | null = null;
  LeaveTypeMasterForm!: FormGroup;
  LeaveTypeDetailsform!: FormGroup;
  LeaveId: number | null = null;
  isselectedDetail = false;
  Isedit = false;
  leaveTypeList: any[] = [];
  showError = false;
  isEditClick: boolean = false;
  isButtonVisible = true;

  constructor(
    private fb: FormBuilder,
    private leavetypeService: LeaveTypeMasterService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private encrytionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.LeaveTypeMasterForm = this.fb.group({
      pk_leaveid: [null],
      leavetype: [null, Validators.required],
      leavenature: ['', [Validators.required]],
      shortdesc: [null, [Validators.required]],
      remarks: [null],
      LeaveTypeDetails: this.fb.array([])
    });

    this.LeaveTypeDetailsform = this.fb.group({
      fk_leaveid: [null,],
      fk_natureid: [null, [Validators.required]],
      leaveid: [{ value: null, disabled: true }],
      maxlimitinmonth: [0, [Validators.required, Validators.maxLength(2)]],
      maxperyear: [0, [Validators.required]],

      // ✅ Cashable and its children
      cashable: [false],
      maxcashable: [{ value: 0, disabled: true }],
      fk_formulaid: [{ value: '', disabled: true }],
      amount: [{ value: 0, disabled: true }],
      maxhold: [0],

      // ✅ Carry Forward and its children
      cf: [false],
      cf_max: [{ value: 0, disabled: true }],
      totalleavelimit: [{ value: 0, disabled: true }],

      leaveLimitPerInstance: [null, [Validators.required]],

      // ✅ Fixed Times Issue and its children
      fixedtimesissue: [false],
      totaltimesissue: [{ value: 0, disabled: true }],

      negbalallowed: [null],
      pfded: [null],
      weeklyOff: ['None'],
      nationalHoliday: ['None'],
      club_woff: [null],
      cover_woff: [null],
      club_nh: [null],
      cover_nh: [null],
      basedon: [null, Validators.required],
      shortleave: [null],
      isconvertible: [false],
      lvprocessingtype: [null, Validators.required],
      onearnedbasis: [null],
      earnedBasedOn: [{ value: null, disabled: true }],
      creditleavemonthly: [false],
      sandwichapplicable: [false],
      onprodatabasis: [null],
      minlvbaltoencash: [null, Validators.required],
    })

    // Weekly Off and National Holiday listeners
    this.LeaveTypeDetailsform.get('weeklyOff')?.valueChanges.subscribe((value) => {
      this.updateClubCoverValues(value, 'weeklyOff');
    });

    this.LeaveTypeDetailsform.get('nationalHoliday')?.valueChanges.subscribe((value) => {
      this.updateClubCoverValues(value, 'nationalHoliday');
    });

    this.getEmpNature('Nature');
    this.getLeaveTypeNatureWise('LeaveTypeNatureWise');

    // // ✅ Enable/Disable leaveid based on isconvertible checkbox
    // this.LeaveTypeDetailsform.get('isconvertible')?.valueChanges.subscribe(isChecked => {
    //   const leaveIdCtrl = this.LeaveTypeDetailsform.get('leaveid');

    //   if (isChecked) {
    //     leaveIdCtrl?.enable();
    //     leaveIdCtrl?.setValidators([Validators.required]);
    //   } else {
    //     leaveIdCtrl?.reset(null);
    //     leaveIdCtrl?.clearValidators();
    //     leaveIdCtrl?.disable();
    //   }
    //   leaveIdCtrl?.updateValueAndValidity();
    // });



    // ✅ Enable/Disable leaveid based on isconvertible checkbox
    this.LeaveTypeDetailsform.get('isconvertible')?.valueChanges.subscribe(isChecked => {
      const leaveIdCtrl = this.LeaveTypeDetailsform.get('leaveid');

      if (isChecked) {
        leaveIdCtrl?.enable();
        leaveIdCtrl?.setValidators([Validators.required]);
      } else {
        leaveIdCtrl?.reset(null);
        leaveIdCtrl?.clearValidators();
        leaveIdCtrl?.disable();
      }
      leaveIdCtrl?.updateValueAndValidity();
    });

    // ✅ Enable/Disable earnedBasedOn based on onearnedbasis checkbox
    this.LeaveTypeDetailsform.get('onearnedbasis')?.valueChanges.subscribe(isChecked => {
      const earnedCtrl = this.LeaveTypeDetailsform.get('earnedBasedOn');

      if (isChecked) {
        earnedCtrl?.enable();
        earnedCtrl?.setValidators([Validators.required]);
      } else {
        earnedCtrl?.reset(null);
        earnedCtrl?.clearValidators();
        earnedCtrl?.disable();
      }
      earnedCtrl?.updateValueAndValidity();
    });

    // ✅ Enable/Disable cashable children (maxcashable, fk_formulaid, amount)
    this.LeaveTypeDetailsform.get('cashable')?.valueChanges.subscribe((isChecked) => {
      const maxcashableControl = this.LeaveTypeDetailsform.get('maxcashable');
      const formulaControl = this.LeaveTypeDetailsform.get('fk_formulaid');
      const amountControl = this.LeaveTypeDetailsform.get('amount');

      if (isChecked) {
        maxcashableControl?.enable();
        formulaControl?.enable();
        amountControl?.enable();


        // ✅ Only maxcashable is required
        maxcashableControl?.setValidators([Validators.required]);

        maxcashableControl?.updateValueAndValidity();

        maxcashableControl?.markAsTouched();
      } else {
        maxcashableControl?.reset(null);
        formulaControl?.reset(null);
        amountControl?.reset(null);


        maxcashableControl?.clearValidators();

        maxcashableControl?.updateValueAndValidity();

        maxcashableControl?.disable();
        formulaControl?.disable();
        amountControl?.disable();

      }
    });

    // ✅ Enable/Disable cf children (cf_max, totalleavelimit)
    this.LeaveTypeDetailsform.get('cf')?.valueChanges.subscribe((isChecked) => {
      const cfMaxControl = this.LeaveTypeDetailsform.get('cf_max');
      const totalLeaveLimitControl = this.LeaveTypeDetailsform.get('totalleavelimit');

      if (isChecked) {
        cfMaxControl?.enable();
        totalLeaveLimitControl?.enable();

        cfMaxControl?.setValidators([Validators.required]);
        totalLeaveLimitControl?.setValidators([Validators.required]);

        cfMaxControl?.updateValueAndValidity();
        totalLeaveLimitControl?.updateValueAndValidity();
      } else {
        cfMaxControl?.reset(null);
        totalLeaveLimitControl?.reset(null);

        cfMaxControl?.clearValidators();
        totalLeaveLimitControl?.clearValidators();

        cfMaxControl?.updateValueAndValidity();
        totalLeaveLimitControl?.updateValueAndValidity();

        cfMaxControl?.disable();
        totalLeaveLimitControl?.disable();
      }
    });

    // ✅ Enable/Disable fixedtimesissue children (totaltimesissue)
    this.LeaveTypeDetailsform.get('fixedtimesissue')?.valueChanges.subscribe((isChecked) => {
      const totalTimesIssueControl = this.LeaveTypeDetailsform.get('totaltimesissue');

      if (isChecked) {
        totalTimesIssueControl?.enable();
        totalTimesIssueControl?.setValidators([Validators.required]);
        totalTimesIssueControl?.updateValueAndValidity();
      } else {
        totalTimesIssueControl?.reset(null);
        totalTimesIssueControl?.clearValidators();
        totalTimesIssueControl?.updateValueAndValidity();
        totalTimesIssueControl?.disable();
      }
    });

    this.LeaveId = Number(this.encrytionService.decryptText(this.route.snapshot.params['pk_leaveid']).toString());
    if (this.LeaveId) {
      this.patchLeaveTypeData(this.LeaveId);
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    const inputChar = String.fromCharCode(event.keyCode || event.which);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length >= 2) {
      event.preventDefault();
    }
  }

  updateClubCoverValues(value: string, type: 'weeklyOff' | 'nationalHoliday'): void {
    if (type === 'weeklyOff') {
      this.LeaveTypeDetailsform.patchValue({
        club_woff: value === 'Club',
        cover_woff: value === 'Cover',
      });
    } else if (type === 'nationalHoliday') {
      this.LeaveTypeDetailsform.patchValue({
        club_nh: value === 'Club',
        cover_nh: value === 'Cover',
      });
    }
  }

  parseBoolean(value: any): boolean {
    return value === true || value === "true";
  }

  patchLeaveTypeData(pk_leaveid: number, fk_natureid?: string) {
    this.leavetypeService.getLeaveTypedetailsById(pk_leaveid, fk_natureid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          let leaveType = res.data.leaveType || {};
          let leaveTypeDetails = res.data.leaveTypeDetails || [];

          if (leaveType) {
            this.LeaveTypeMasterForm.patchValue({
              pk_leaveid: leaveType.pk_leaveid,
              leavetype: leaveType.leavetype ?? '',
              shortdesc: leaveType.shortdesc ?? '',
              leavenature: leaveType.leavenature ? leaveType.leavenature.toString() : '',
              remarks: leaveType.remarks ?? '',
            });
          }

          if (res.data.leaveTypeDetails && res.data.leaveTypeDetails.length > 0) {
            const details = res.data.leaveTypeDetails[0];

            this.LeaveTypeDetailsform.patchValue({
              fk_leaveid: details.fk_leaveid,
              fk_natureid: details.fk_natureid,
              maxlimitinmonth: details.maxlimitinmonth,
              maxperyear: details.maxperyear,

              cashable: details.cashable,
              maxcashable: details.maxcashable ?? 0,
              fk_formulaid: details.fk_formulaid,
              amount: details.amount ?? 0,
              maxhold: details.maxhold ?? 0,

              cf: details.cf,
              cf_max: details.cf_max,
              totalleavelimit: details.totalleavelimit,

              leaveLimitPerInstance: details.leaveLimitPerInstance,

              fixedtimesissue: details.fixedtimesissue,
              totaltimesissue: details.totaltimesissue,

              negbalallowed: details.negbalallowed,
              pfded: details.pfded,

              weeklyOff: details.club_woff ? 'Club' : details.cover_woff ? 'Cover' : 'None',
              nationalHoliday: details.club_nh ? 'Club' : details.cover_nh ? 'Cover' : 'None',
              club_woff: details.club_woff,
              cover_woff: details.cover_woff,
              club_nh: details.club_nh,
              cover_nh: details.cover_nh,

              basedon: details.basedon,
              isconvertible: details.isconvertible,
              leaveid: details.leaveid,
              lvprocessingtype: details.lvprocessingtype,

              onearnedbasis: details.onearnedbasis,
              earnedBasedOn: details.earnedBasedOn,

              creditleavemonthly: details.creditleavemonthly,
              sandwichapplicable: details.sandwichapplicable,
              onprodatabasis: details.onprodatabasis,
              minlvbaltoencash: details.minlvbaltoencash,
            });

            // ✅ Enable/disable earnedBasedOn based on onearnedbasis
            if (details.onearnedbasis) {
              const ctrl = this.LeaveTypeDetailsform.get('earnedBasedOn');
              ctrl?.enable();
              ctrl?.setValidators([Validators.required]);
              ctrl?.updateValueAndValidity();
            } else {
              const ctrl = this.LeaveTypeDetailsform.get('earnedBasedOn');
              ctrl?.reset(null);
              ctrl?.clearValidators();
              ctrl?.disable();
              ctrl?.updateValueAndValidity();
            }

            // ✅ Enable/disable leaveid based on isconvertible
            if (details.isconvertible) {
              this.LeaveTypeDetailsform.get('leaveid')?.enable();
              this.LeaveTypeDetailsform.get('leaveid')?.setValidators([Validators.required]);
            } else {
              this.LeaveTypeDetailsform.get('leaveid')?.reset(null);
              this.LeaveTypeDetailsform.get('leaveid')?.clearValidators();
              this.LeaveTypeDetailsform.get('leaveid')?.disable();
            }
            this.LeaveTypeDetailsform.get('leaveid')?.updateValueAndValidity();

            // ✅ Enable/disable cashable children
            if (details.cashable) {
              this.LeaveTypeDetailsform.get('maxcashable')?.enable();
              this.LeaveTypeDetailsform.get('fk_formulaid')?.enable();
              this.LeaveTypeDetailsform.get('amount')?.enable();

            }

            // ✅ Enable/disable cf children
            if (details.cf) {
              this.LeaveTypeDetailsform.get('cf_max')?.enable();
              this.LeaveTypeDetailsform.get('totalleavelimit')?.enable();
            }

            // ✅ Enable/disable fixedtimesissue children
            if (details.fixedtimesissue) {
              this.LeaveTypeDetailsform.get('totaltimesissue')?.enable();
            }
          }

          let leaveDetailsArray = this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;

          if (Array.isArray(leaveTypeDetails) && leaveTypeDetails.length > 0) {
            leaveTypeDetails.forEach((details: any) => {
              let leaveDetailForm = this.fb.group({
                fk_leaveid: [details.fk_leaveid?.toString() ?? ''],
                fk_natureid: [details.fk_natureid, Validators.required],
                maxperyear: [details.maxperyear ?? 0, Validators.required],
                cf: [this.parseBoolean(details.cf)],
                leaveLimitPerInstance: [details.leaveLimitPerInstance ?? 0, Validators.required],
                fixedtimesissue: [this.parseBoolean(details.fixedtimesissue)],
                totaltimesissue: [details.totaltimesissue ?? 0],
                cashable: [this.parseBoolean(details.cashable)],
                maxcashable: [details.maxcashable ?? 0],
                minlvbaltoencash: [details.minlvbaltoencash ?? 0],
                isconvertible: [this.parseBoolean(details.isconvertible)],
                leaveid: [details.leaveid ?? null],
                lvprocessingtype: [details.lvprocessingtype, Validators.required],
                amount: [details.amount ?? 0],
                totalleavelimit: [details.totalleavelimit ?? 0],
                fk_formulaid: [details.fk_formulaid],
                shortleave: [details.shortleave],
                weeklyOff: details.club_woff ? 'Club' : details.cover_woff ? 'Cover' : 'None',
                nationalHoliday: details.club_nh ? 'Club' : details.cover_nh ? 'Cover' : 'None',
                club_woff: [this.parseBoolean(details.club_woff)],
                cover_woff: [this.parseBoolean(details.cover_woff)],
                club_nh: [this.parseBoolean(details.club_nh)],
                cover_nh: [this.parseBoolean(details.cover_nh)],
                negbalallowed: [this.parseBoolean(details.negbalallowed)],
                pfded: [this.parseBoolean(details.pfded)],
                maxhold: [details.maxhold ?? 0],
                maxlimitinmonth: [details.maxlimitinmonth ?? 0],
                basedon: [details.basedon.toString(), Validators.required],
                cf_max: [details.cf_max ?? 0],
                onearnedbasis: [this.parseBoolean(details.onearnedbasis)],
                earnedBasedOn: [details.earnedBasedOn ?? null],
                creditleavemonthly: [this.parseBoolean(details.creditleavemonthly)],
                sandwichapplicable: [this.parseBoolean(details.sandwichapplicable)],
                onprodatabasis: [this.parseBoolean(details.onprodatabasis)],
              });

              leaveDetailsArray.push(leaveDetailForm);
              this.LeaveTypeDetailsform.reset();
            });
          }

          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Leave Type details.");
        }
      },
      error: (err) => {
        console.error("Error loading Leave Type data:", err);
        this.toastrService.error("Error loading Leave Type data.");
      }
    });
  }

  get LeaveTypeDetailsArray(): FormArray {
    return this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;
  }

  getEmpNatureName(value: any): string {
    const emp = this.EmpNature.find(e => e.value === value);
    return emp ? emp.name : '';
  }

  onBlurCheckAvailability(field: string): void {
    const leaveType = this.LeaveTypeMasterForm.get('leavetype')?.value || '';
    const shortDesc = this.LeaveTypeMasterForm.get('shortdesc')?.value || '';
    const fk_natureid = this.LeaveTypeMasterForm.get('fk_natureid')?.value || '';

    if (field === 'LeaveType' && leaveType) {
      this.checkDesignationAvailability(leaveType, '', '');
    } else if (field === 'ShortDesc' && shortDesc) {
      this.checkDesignationAvailability('', shortDesc, '');
    } else if (field === 'Nature' && fk_natureid) {
      this.checkDesignationAvailability('', '', fk_natureid);
    }
  }

  checkDesignationAvailability(leavetype: string, shortdesc: string, fk_natureid: string): void {
    const generalId = this.LeaveId ?? 0;

    if (leavetype) {
      this.leavetypeService.CheckDuplicateValue('LeaveType', leavetype, generalId).subscribe({
        next: (response) => {
          if (response && response.isSuccess === false) {
            this.LeaveTypeMasterForm.get('leavetype')?.setErrors({ duplicate: response.message });
          } else {
            this.LeaveTypeMasterForm.get('leavetype')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Duplicate Check API Error:', err);
          this.LeaveTypeMasterForm.get('leavetype')?.setErrors({ duplicate: 'Error checking LeaveType availability.' });
        }
      });
    }

    if (shortdesc) {
      this.leavetypeService.CheckDuplicateValue('ShortDesc', shortdesc, generalId).subscribe({
        next: (response) => {
          if (response && response.isSuccess === false) {
            this.LeaveTypeMasterForm.get('shortdesc')?.setErrors({ duplicate: response.message });
          } else {
            this.LeaveTypeMasterForm.get('shortdesc')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Duplicate Check API Error:', err);
          this.LeaveTypeMasterForm.get('shortdesc')?.setErrors({ duplicate: 'Error checking ShortDesc availability.' });
        }
      });
    }

    if (fk_natureid) {
      this.leavetypeService.CheckDuplicateValue('Nature', fk_natureid, generalId).subscribe({
        next: (response) => {
          if (response && response.isSuccess === false) {
            this.LeaveTypeMasterForm.get('fk_natureid')?.setErrors({ duplicate: response.message });
          } else {
            this.LeaveTypeMasterForm.get('fk_natureid')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Duplicate Check API Error:', err);
          this.LeaveTypeMasterForm.get('fk_natureid')?.setErrors({ duplicate: 'Error checking ShortDesc availability.' });
        }
      });
    }
  }

  getLeaveTypeNatureWise(fieldName: string) {
    this.leavetypeService.getEmployeeNature(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.LeaveTypeNatureWiseList = res.data.map((pk_leaveid: any) => ({
            name: pk_leaveid.name,
            value: pk_leaveid.value
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

  getEmpNature(fieldName: string) {
    this.leavetypeService.getEmployeeNature(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.EmpNature = res.data.map((fk_natureid: any) => ({
            name: fk_natureid.name,
            value: fk_natureid.value
          }));
        } else {
          this.toastrService.error("Failed to load EmpNature list.");
        }
      },
      error: (err) => {
        console.error("Error fetching EmpNature list:", err);
        this.toastrService.error("Error fetching EmpNature.");
      }
    });
  }

  setWeeklyOff(type: string) {
    this.LeaveTypeMasterForm.patchValue({ weeklyOff: type });
    this.LeaveTypeMasterForm.patchValue({ nationalHoliday: type });
  }

  get LeaveTypeDetails(): FormArray {
    return this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;
  }

  addLeavetypeDetails(): void {
    const formValue = this.LeaveTypeDetailsform.value;
    console.log("Leave Type Details :" + formValue);

    if (this.LeaveTypeDetailsform.valid) {
      const isDuplicate = this.LeaveTypeDetails.controls.some((group, idx) => {
        return group.get('fk_natureid')?.value === formValue.fk_natureid && idx !== this.editingIndex;
      });

      if (isDuplicate) {
        this.toastrService.warning('This Employee Nature already exists in the table!');
        return;
      }

      // ✅ Sanitize all conditional fields based on their parent checkboxes
      const sanitizedValue = {
        ...formValue,
        // Only keep earnedBasedOn if onearnedbasis is checked
        earnedBasedOn: formValue.onearnedbasis ? formValue.earnedBasedOn : null,

        // Only keep leaveid if isconvertible is checked
        leaveid: formValue.isconvertible ? formValue.leaveid : null,

        // Only keep cashable children if cashable is checked
        maxcashable: formValue.cashable ? formValue.maxcashable : 0,
        fk_formulaid: formValue.cashable ? formValue.fk_formulaid : null,
        amount: formValue.cashable ? formValue.amount : 0,
        maxhold: formValue.maxhold,

        // Only keep cf children if cf is checked
        cf_max: formValue.cf ? formValue.cf_max : 0,
        totalleavelimit: formValue.cf ? formValue.totalleavelimit : 0,

        // Only keep fixedtimesissue children if fixedtimesissue is checked
        totaltimesissue: formValue.fixedtimesissue ? formValue.totaltimesissue : 0,
      };

      if (this.editingIndex !== null) {
        this.LeaveTypeDetails.at(this.editingIndex).patchValue(sanitizedValue);
        this.toastrService.success('Updated record in table!');
        this.isselectedDetail = false;
        this.editingIndex = null;
      } else {
        this.LeaveTypeDetails.push(this.fb.group(sanitizedValue));
        this.toastrService.success('Added record in table!');
      }

      this.LeaveTypeDetailsform.reset();
      this.showError = false;
    } else {
      this.showError = true;
    }
  }

  removeLeavetype(index: number): void {
    this.LeaveTypeDetails.removeAt(index);
    this.editingIndex = null;
  }

  Submit(): void {
    const leaveTypeDetailsFormArray = this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;

    console.log(leaveTypeDetailsFormArray);

    if (!leaveTypeDetailsFormArray || leaveTypeDetailsFormArray.length === 0) {
      this.toastrService.warning('Please add at least one record');
      return;
    }

    const selectedLeaveBasedOnValue = this.LeaveTypeDetailsform.get('basedon')?.value;
    const selectedLeaveBasedOnObject = this.LeaveBasedOn.find(item => item.value === selectedLeaveBasedOnValue);
    const weeklyOffValue = this.LeaveTypeDetailsform.get('weeklyOff')?.value;
    const NHValue = this.LeaveTypeDetailsform.get('nationalHoliday')?.value;

    const club_woff = weeklyOffValue === 'Club';
    const cover_woff = weeklyOffValue === 'Cover';
    const club_nh = NHValue === 'Club';
    const cover_nh = NHValue === 'Cover';

    const newNatureId = this.LeaveTypeDetailsform.get('fk_natureid')?.value;
    const existingNatureId = leaveTypeDetailsFormArray.controls.some(
      (ctrl) => ctrl.get('fk_natureid')?.value === newNatureId
    );

    if (existingNatureId) {
      this.toastrService.warning('This Nature ID already exists in the table.');
      return;
    }

    console.log("this.LeaveTypeDetailsform.value", this.LeaveTypeDetailsform.value)

    if (this.LeaveTypeDetailsform.valid) {
      const formVal = this.LeaveTypeDetailsform.value;

      const detailGroup = this.fb.group({
        ...formVal,
        fixedtimesissue: !!formVal.fixedtimesissue,
        cashable: !!formVal.cashable,
        cf: !!formVal.cf,
        isconvertible: !!formVal.isconvertible,

        // ✅ Conditional sanitization
        leaveid: formVal.isconvertible ? formVal.leaveid : null,
        earnedBasedOn: formVal.onearnedbasis ? formVal.earnedBasedOn : null,
        maxcashable: formVal.cashable ? formVal.maxcashable : 0,
        fk_formulaid: formVal.cashable ? formVal.fk_formulaid : null,
        amount: formVal.cashable ? formVal.amount : 0,
        maxhold: formVal.maxhold,
        cf_max: formVal.cf ? formVal.cf_max : 0,
        totalleavelimit: formVal.cf ? formVal.totalleavelimit : 0,
        totaltimesissue: formVal.fixedtimesissue ? formVal.totaltimesissue : 0,

        onearnedbasis: !!formVal.onearnedbasis,
        creditleavemonthly: !!formVal.creditleavemonthly,
        sandwichapplicable: !!formVal.sandwichapplicable,
        onprodatabasis: !!formVal.onprodatabasis,
        pfded: !!formVal.pfded,
        negbalallowed: !!formVal.negbalallowed,

        selectedLeaveBasedOnObject,
        club_woff,
        cover_woff,
        club_nh,
        cover_nh
      });

      leaveTypeDetailsFormArray.push(detailGroup);
    }

    const { LeaveTypeDetails, ...LeaveTypeMasterWithoutDetails } = this.LeaveTypeMasterForm.value;

    const formData = {
      LeaveTypeMaster: LeaveTypeMasterWithoutDetails,
      LeaveTypeDetails: leaveTypeDetailsFormArray.value
    };

    // ✅ Sanitize all checkbox fields and conditional fields
    formData.LeaveTypeDetails = formData.LeaveTypeDetails.map((detail: any) => ({
      ...detail,
      maxhold: detail.maxhold == null ? 0 : detail.maxhold,

      fixedtimesissue: !!detail.fixedtimesissue,
      cashable: !!detail.cashable,
      cf: !!detail.cf,
      isconvertible: !!detail.isconvertible,

      // ✅ Conditional sanitization in final data
      leaveid: detail.isconvertible ? detail.leaveid : null,
      earnedBasedOn: detail.onearnedbasis ? detail.earnedBasedOn : null,
      maxcashable: detail.cashable ? detail.maxcashable : 0,
      fk_formulaid: detail.cashable ? detail.fk_formulaid : null,
      amount: detail.cashable ? detail.amount : 0,
      cf_max: detail.cf ? detail.cf_max : 0,
      totalleavelimit: detail.cf ? detail.totalleavelimit : 0,
      totaltimesissue: detail.fixedtimesissue ? detail.totaltimesissue : 0,

      onearnedbasis: !!detail.onearnedbasis,
      creditleavemonthly: !!detail.creditleavemonthly,
      sandwichapplicable: !!detail.sandwichapplicable,
      onprodatabasis: !!detail.onprodatabasis,
      pfded: !!detail.pfded,
      negbalallowed: !!detail.negbalallowed
    }));

    console.log("full formData final", formData);

    if (this.LeaveId) {
      this.leavetypeService.update_LeaveType({
        ...formData,
        LeaveTypeMaster: {
          ...formData.LeaveTypeMaster,
          pk_leaveid: this.LeaveId
        }
      }).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'LeaveType updated successfully!');
            this.router.navigate(['/dash/user/userdashboard/Leave-Master_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to update LeaveType.');
          }
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
        }
      });
    } else {
      this.leavetypeService.add_LeaveType(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'LeaveType added successfully!');
            this.router.navigate(['/dash/user/userdashboard/Leave-Master_list']);
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: (err) => {
          console.error('Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
        }
      });
    }
  }

  editLeaveType(pk_leaveid: number, fk_natureid: string, index: number): void {
    this.isselectedDetail = true
    window.scrollTo(0, 0);

    const leaveDetailsArray = this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;
    const selectedDetail = leaveDetailsArray.at(index) as FormGroup;

    console.log("selectedDetail", selectedDetail);

    if (selectedDetail) {
      const club_woff = selectedDetail.get('club_woff')?.value;
      const cover_woff = selectedDetail.get('cover_woff')?.value;
      const club_nh = selectedDetail.get('club_nh')?.value;
      const cover_nh = selectedDetail.get('cover_nh')?.value;
      const onearnedbasis = selectedDetail.get('onearnedbasis')?.value;
      const isconvertible = selectedDetail.get('isconvertible')?.value;
      const cashable = selectedDetail.get('cashable')?.value;
      const cf = selectedDetail.get('cf')?.value;
      const fixedtimesissue = selectedDetail.get('fixedtimesissue')?.value;

      this.LeaveTypeDetailsform.patchValue({
        fk_leaveid: selectedDetail.get('fk_leaveid')?.value,
        fk_natureid: selectedDetail.get('fk_natureid')?.value,
        maxlimitinmonth: selectedDetail.get('maxlimitinmonth')?.value,
        maxperyear: selectedDetail.get('maxperyear')?.value,

        cashable: selectedDetail.get('cashable')?.value,
        maxcashable: cashable ? selectedDetail.get('maxcashable')?.value : null,
        fk_formulaid: cashable ? selectedDetail.get('fk_formulaid')?.value : null,
        amount: cashable ? selectedDetail.get('amount')?.value : null,
        maxhold: selectedDetail.get('maxhold')?.value,

        cf: selectedDetail.get('cf')?.value,
        cf_max: cf ? selectedDetail.get('cf_max')?.value : null,
        totalleavelimit: cf ? selectedDetail.get('totalleavelimit')?.value : null,

        leaveLimitPerInstance: selectedDetail.get('leaveLimitPerInstance')?.value,

        fixedtimesissue: selectedDetail.get('fixedtimesissue')?.value,
        totaltimesissue: fixedtimesissue ? selectedDetail.get('totaltimesissue')?.value : 0,

        negbalallowed: selectedDetail.get('negbalallowed')?.value,
        pfded: selectedDetail.get('pfded')?.value,
        club_woff: selectedDetail.get('club_woff')?.value,
        cover_woff: selectedDetail.get('cover_woff')?.value,
        club_nh: selectedDetail.get('club_nh')?.value,
        cover_nh: selectedDetail.get('cover_nh')?.value,
        basedon: selectedDetail.get('basedon')?.value,
        shortleave: selectedDetail.get('shortleave')?.value,

        isconvertible: selectedDetail.get('isconvertible')?.value,
        leaveid: isconvertible ? selectedDetail.get('leaveid')?.value : null,

        lvprocessingtype: selectedDetail.get('lvprocessingtype')?.value,

        onearnedbasis: selectedDetail.get('onearnedbasis')?.value,
        earnedBasedOn: onearnedbasis ? selectedDetail.get('earnedBasedOn')?.value : null,

        creditleavemonthly: selectedDetail.get('creditleavemonthly')?.value,
        sandwichapplicable: selectedDetail.get('sandwichapplicable')?.value,
        onprodatabasis: selectedDetail.get('onprodatabasis')?.value,
        minlvbaltoencash: selectedDetail.get('minlvbaltoencash')?.value,

        weeklyOff: club_woff ? 'Club' : cover_woff ? 'Cover' : 'None',
        nationalHoliday: club_nh ? 'Club' : cover_nh ? 'Cover' : 'None'
      });

      // ✅ Enable/disable leaveid based on isconvertible
      if (isconvertible) {
        this.LeaveTypeDetailsform.get('leaveid')?.enable();
        this.LeaveTypeDetailsform.get('leaveid')?.setValidators([Validators.required]);
      } else {
        this.LeaveTypeDetailsform.get('leaveid')?.reset(null);
        this.LeaveTypeDetailsform.get('leaveid')?.clearValidators();
        this.LeaveTypeDetailsform.get('leaveid')?.disable();
      }
      this.LeaveTypeDetailsform.get('leaveid')?.updateValueAndValidity();

      // ✅ Enable/disable earnedBasedOn based on onearnedbasis
      if (onearnedbasis) {
        this.LeaveTypeDetailsform.get('earnedBasedOn')?.enable();
        this.LeaveTypeDetailsform.get('earnedBasedOn')?.setValidators([Validators.required]);
      } else {
        this.LeaveTypeDetailsform.get('earnedBasedOn')?.reset(null);
        this.LeaveTypeDetailsform.get('earnedBasedOn')?.clearValidators();
        this.LeaveTypeDetailsform.get('earnedBasedOn')?.disable();
      }
      this.LeaveTypeDetailsform.get('earnedBasedOn')?.updateValueAndValidity();

      // ✅ Enable/disable cashable children
      if (cashable) {
        this.LeaveTypeDetailsform.get('maxcashable')?.enable();
        this.LeaveTypeDetailsform.get('fk_formulaid')?.enable();
        this.LeaveTypeDetailsform.get('amount')?.enable();
        // this.LeaveTypeDetailsform.get('maxhold')?.enable();
      }

      // ✅ Enable/disable cf children
      if (cf) {
        this.LeaveTypeDetailsform.get('cf_max')?.enable();
        this.LeaveTypeDetailsform.get('totalleavelimit')?.enable();
      }

      // ✅ Enable/disable fixedtimesissue children
      if (fixedtimesissue) {
        this.LeaveTypeDetailsform.get('totaltimesissue')?.enable();
      }

      this.isButtonVisible = true;
      this.editingIndex = index;
    }
  }

  updateTableRow(): void {
    if (this.editingIndex === null) return;

    const leaveDetailsArray = this.LeaveTypeMasterForm.get('LeaveTypeDetails') as FormArray;
    const rowToUpdate = leaveDetailsArray.at(this.editingIndex) as FormGroup;
    const formVal = this.LeaveTypeDetailsform.value;

    if (rowToUpdate) {
      rowToUpdate.patchValue({
        fk_leaveid: formVal.fk_leaveid,
        fk_natureid: formVal.fk_natureid,
        maxlimitinmonth: formVal.maxlimitinmonth,
        maxperyear: formVal.maxperyear,

        cashable: formVal.cashable,
        maxcashable: formVal.cashable ? formVal.maxcashable : 0,
        fk_formulaid: formVal.cashable ? formVal.fk_formulaid : null,
        amount: formVal.cashable ? formVal.amount : 0,
        maxhold: formVal.maxhold,

        cf: formVal.cf,
        cf_max: formVal.cf ? formVal.cf_max : 0,
        totalleavelimit: formVal.cf ? formVal.totalleavelimit : 0,

        leaveLimitPerInstance: formVal.leaveLimitPerInstance,

        fixedtimesissue: formVal.fixedtimesissue,
        totaltimesissue: formVal.fixedtimesissue ? formVal.totaltimesissue : 0,

        negbalallowed: formVal.negbalallowed,
        pfded: formVal.pfded,
        club_woff: formVal.club_woff,
        cover_woff: formVal.cover_woff,
        club_nh: formVal.club_nh,
        cover_nh: formVal.cover_nh,
        basedon: formVal.basedon,

        isconvertible: formVal.isconvertible,
        leaveid: formVal.isconvertible ? formVal.leaveid : null,

        lvprocessingtype: formVal.lvprocessingtype,

        onearnedbasis: formVal.onearnedbasis,
        earnedBasedOn: formVal.onearnedbasis ? formVal.earnedBasedOn : null,

        creditleavemonthly: formVal.creditleavemonthly,
        sandwichapplicable: formVal.sandwichapplicable,
        onprodatabasis: formVal.onprodatabasis,
        minlvbaltoencash: formVal.minlvbaltoencash,
      });

      this.editingIndex = null;
      this.LeaveTypeDetailsform.reset();
    }
  }

  leaveDetailsReset() {
    this.LeaveTypeDetailsform.reset();
  }

  reset() {
    this.LeaveTypeMasterForm.reset();
    this.LeaveTypeDetailsform.reset();
  }
}