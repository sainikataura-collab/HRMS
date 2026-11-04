import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ClientMasterService } from '../../services/client-master.service';
import { FormArray } from '@angular/forms';
@Component({
  selector: 'app-client-master',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './client-master.component.html',
  styleUrl: './client-master.component.scss'
})
export class ClientMasterComponent {
  ClientForm!: FormGroup;
  submited = false;
  Isedit = false;
  pk_cost_centre_id: any = 0;

  ZoneList: { name: string; value: string }[] = [];
  CityList: { name: string; value: string }[] = [];
  StateList: { name: string; value: string }[] = [];
  LocationList: { name: string; value: string }[] = [];
  ServiceTypeList: { name: string; value: string }[] = [];
  Pay_cycle: { name: string; value: string }[] = [];
  LeavePolicyList: { name: string; value: string }[] = [];

  ClientCodeList: { name: string; value: string }[] = [];


  // added new for chnage ui

  ExtraDayStatus: string = '';
  DayConsider: string | null = null;

  ExtraDayList: any[] = [];

  ExtraDayEditIndex: number = -1;
  IsExtraDayEdit: boolean = false;
  modelList: any[] = [];
  DayConsiderList = [
    { name: 'Half Day', value: 'H' },
    { name: 'Full Day', value: 'F' }
  ];

  HolidayWageTypeList = [
    { name: 'On Gross', value: 'On Gross' },
    { name: 'On Heads', value: 'On Heads' }
  ];
  EarningHeadList: { name: string; value: string }[] = [];
  serviceTypeMonthList: { name: string; value: string }[] = [];
  pendingMonthDaysList: any[] | null = null;


  //




  editIndex: number = -1;



  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private clientMasterService: ClientMasterService,
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.ClientForm = this.fb.group({
      ClientCode: ['', [Validators.required]],
      ClientName: ['', [Validators.required]],
      EmpCodePrefix: [''],
      Grouping: [''],
      ContactPerson: [''],
      EmailID: [''],
      CINNo: [''],
      TAN: [''],
      GST: [''],
      gst_state: [null],
      PAN: [''],
      Address: [''],
      fk_cityId: [null],
      fk_stateId: [null],
      fk_zoneId: [null],
      Location: [[]],
      Pay_cycle: [null],
      Pincode: [''],
      Phone: ['', [Validators.pattern('^[0-9]{10}$')]],
      StartDate: [null],
      EndDate: [null],
      LeavePolicy: [null],
      CommissionPercent: [0],
      ServiceTypeIds: [[]],
      ModelTypeIds: [[]],
      gst_rate: [0],

      // Holiday Wages
      isHolidayHead: [false],
      holidayWageTypeHead: [null],
      HolidaySalaryHeadIds: [[]],
      HolidayMultiple: [0],
      addWeekOffInPaidDays: [false],
      daysDivideInMonth: [0],
      PresentDaysforWeekOff: [0],
      ShowDetailsOnSlalrySlip: [false],

      // NEW
      ExtraDayDetails: this.fb.array([]), // ADD THIS
      ServiceMonthDaysDetails: this.fb.array([])
    });



    this.getZone();
    this.getState();
    this.getCity();
    this.getLocation();
    this.ServiceTypeDDL();
    this.ClientCodeTypeDDL();
    this.loadModelTypes();
    this.getLeavePolicy();
    this.getEarningHeads();
    this.addExtraDay();
    this.Paycycle();
    this.loadServiceTypeMonthList();
    this.addServiceMonthDays();

    const encryptedId = this.route.snapshot.paramMap.get('pk_cost_centre_id');

    debugger
    if (encryptedId) {
      this.pk_cost_centre_id = this.encryption.decryptText(encryptedId);
      this.Isedit = true;
      this.patchFormForEdit(this.pk_cost_centre_id);
    }
  }
  get ExtraDayDetails(): FormArray {
    return this.ClientForm.get('ExtraDayDetails') as FormArray;
  }

  get ServiceMonthDaysDetails(): FormArray {
    return this.ClientForm.get('ServiceMonthDaysDetails') as FormArray;
  }

  private loadServiceTypeMonthList(): void {
    this.clientMasterService.GetDdlListBasedOnCodeType(14).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res?.Data ?? res?.list ?? res?.List ?? (Array.isArray(res) ? res : []);
        if (list && list.length > 0) {
          this.serviceTypeMonthList = list.map((item: any) => ({
            name: (item.name ?? item.Name ?? item.codeDescription ?? item.text ?? '').trim(),
            value: (item.value ?? item.Value ?? item.codeId ?? item.CodeId ?? '').toString().trim()
          }));
          if (this.pendingMonthDaysList !== null) {
            this.populateServiceMonthDays(this.pendingMonthDaysList);
            this.pendingMonthDaysList = null;
          }
        }
      }
    });
  }

  populateServiceMonthDays(monthDaysList: any[]): void {
    this.ServiceMonthDaysDetails.clear();
    if (monthDaysList && monthDaysList.length > 0) {
      monthDaysList.forEach((x: any) => {
        const rawId = x.serviceTypeId ?? x.ServiceTypeId ?? x.fk_service_type_id ?? '';
        const sId = rawId ? rawId.toString().trim() : null;
        const days = x.daysDivideInMonth ?? x.DaysDivideInMonth ?? null;
        this.ServiceMonthDaysDetails.push(
          this.fb.group({
            pk_id: [x.pk_id || x.Pk_id || 0],
            serviceTypeId: [sId],
            daysDivideInMonth: [days]
          })
        );
      });
    } else {
      this.addServiceMonthDays();
    }
  }

  private loadModelTypes(): void {
    this.clientMasterService.GetDdlListBasedOnCodeType(4).subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.modelList = res.data;
        }
      }
    });
  }
  onSubmit() {
    if (this.ClientForm.invalid) {
      this.submited = true;
      this.toastrService.error("Please fill all required fields correctly.");
      return;
    }

    const isHoliday = this.ClientForm.get('isHolidayHead')?.value;
    const holidayWageType = this.ClientForm.get('holidayWageTypeHead')?.value;
    let locationVal = this.ClientForm.get('Location')?.value;
    if (Array.isArray(locationVal)) {
      locationVal = locationVal.length > 0 ? locationVal.join(',') : null;
    } else if (!locationVal) {
      locationVal = null;
    }

    const rawHolidayMultiple = this.ClientForm.get('HolidayMultiple')?.value;
    const holidayMultiple = (rawHolidayMultiple !== null && rawHolidayMultiple !== undefined && rawHolidayMultiple !== '') ? Number(rawHolidayMultiple) : 0;

    const rawGstRate = this.ClientForm.get('gst_rate')?.value;
    const gstRate = (rawGstRate !== null && rawGstRate !== undefined && rawGstRate !== '') ? Number(rawGstRate) : 0;

    const rawCommission = this.ClientForm.get('CommissionPercent')?.value;
    const commissionPercent = (rawCommission !== null && rawCommission !== undefined && rawCommission !== '') ? Number(rawCommission) : 0;

    const rawDaysDivide = this.ClientForm.get('daysDivideInMonth')?.value;
    const daysDivideInMonth = (rawDaysDivide !== null && rawDaysDivide !== undefined && rawDaysDivide !== '') ? Number(rawDaysDivide) : 0;

    const rawPresentDays = this.ClientForm.get('PresentDaysforWeekOff')?.value;
    const presentDaysforWeekOff = (rawPresentDays !== null && rawPresentDays !== undefined && rawPresentDays !== '' && !isNaN(Number(rawPresentDays)))
      ? Number(rawPresentDays)
      : 0;

    const rawServiceMonthDays = (this.ServiceMonthDaysDetails.value || [])
      .filter((x: any) => x.serviceTypeId && x.daysDivideInMonth !== null && x.daysDivideInMonth !== '')
      .map((x: any) => ({
        pk_id: Number(x.pk_id) || 0,
        serviceTypeId: x.serviceTypeId?.toString(),
        daysDivideInMonth: Number(x.daysDivideInMonth) || 0
      }));

    const serviceTypeIds = rawServiceMonthDays.map((x: any) => x.serviceTypeId);
    const duplicateId = serviceTypeIds.find((id: string, idx: number) => serviceTypeIds.indexOf(id) !== idx);
    if (duplicateId) {
      const serviceObj = this.serviceTypeMonthList.find(s => s.value.toString() === duplicateId.toString());
      const serviceName = serviceObj?.name || 'this service';
      this.toastrService.error(`Already added for ${serviceName}`);
      return;
    }

    const data = {
      ...this.ClientForm.value,
      Location: locationVal,
      pk_cost_centre_id: Number(this.pk_cost_centre_id) || 0,
      ExtraDayDetails: this.ExtraDayDetails.value,
      ServiceMonthDaysDetails: rawServiceMonthDays,
      isHolidayHead: !!isHoliday,
      holidayWageTypeHead: isHoliday ? holidayWageType : null,
      HolidaySalaryHeadIds: (isHoliday && holidayWageType === 'On Heads')
        ? (this.ClientForm.get('HolidaySalaryHeadIds')?.value || []).map((id: any) => id.toString())
        : [],
      HolidayMultiple: holidayMultiple,
      gst_rate: gstRate,
      CommissionPercent: commissionPercent,
      addWeekOffInPaidDays: !!this.ClientForm.get('addWeekOffInPaidDays')?.value,
      daysDivideInMonth: daysDivideInMonth,
      PresentDaysforWeekOff: presentDaysforWeekOff
    };


    if (this.Isedit) {
      this.clientMasterService.update_clientmaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message || 'Client Master updated successfully!');
            this.router.navigate(['/dash/user/userdashboard/clientMaster_list']);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    } else {
      this.clientMasterService.add_clientmaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message || 'Client Master added successfully!');
            this.router.navigate(['/dash/user/userdashboard/clientMaster_list']);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    }
  }

  getZone() {
    this.clientMasterService.getDropdownList('Zone').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.ZoneList = res.data;
        }
      }
    });
  }

  getState() {
    this.clientMasterService.getDropdownList('State').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.StateList = res.data;
        }
      }
    });
  }

  getCity() {
    this.clientMasterService.getDropdownList('City').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.CityList = res.data;
        }
      }
    });
  }

  getLocation() {
    this.clientMasterService.getDropdownList('Location').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.LocationList = res.data;
        }
      }
    });
  }

  ServiceTypeDDL() {
    this.clientMasterService.GetDdlListBasedOnCodeType(1).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.ServiceTypeList = res.data;
        }
      }
    });
  }

  Paycycle() {
    this.clientMasterService.GetDdlListBasedOnCodeType(23).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.Pay_cycle = res.data;
        }
      }
    });
  }

  ClientCodeTypeDDL() {
    this.clientMasterService.GetDdlListBasedOnCodeType(3).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.ClientCodeList = res.data;
        }
      }
    });
  }

  onStateChange(event: any) {
    // Client-side filtering can be done here if needed
  }

  getServiceType() {
    this.clientMasterService.getDropdownList('ServiceType').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.ServiceTypeList = res.data;
        }
      }
    });
  }

  getLeavePolicy() {
    this.clientMasterService.getDropdownList('LeavePolicy').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.LeavePolicyList = res.data;
        }
      }
    });
  }

  getEarningHeads(): void {
    this.clientMasterService.getEarningHeads().subscribe({
      next: (res: any) => {
        if (res?.isSuccess && res.data) {
          this.EarningHeadList = res.data;
        }
      }
    });
  }

  onHolidayChange(): void {
    const isHoliday = this.ClientForm.get('isHolidayHead')?.value;
    if (!isHoliday) {
      this.ClientForm.patchValue({
        holidayWageTypeHead: null,
        HolidaySalaryHeadIds: [],
        HolidayMultiple: 0
      });
    }
  }

  onHolidayWageTypeChange(): void {
    const wageType = this.ClientForm.get('holidayWageTypeHead')?.value;
    if (wageType !== 'On Heads') {
      this.ClientForm.patchValue({
        HolidaySalaryHeadIds: []
      });
    }
  }

  patchFormForEdit(locId: any): void {
    this.ngxUILoaderService.start();
    this.clientMasterService.getById_clientmaster(locId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const data = res.data;

          let locArray: string[] = [];
          const rawLoc = data.location ?? data.Location;
          if (rawLoc) {
            locArray = rawLoc.split(',').map((id: string) => id.trim());
          }

          this.ClientForm.patchValue({
            ClientCode: data.clientCode,
            ClientName: data.clientName,
            EmpCodePrefix: data.empCodePrefix,
            Grouping: data.grouping,
            ContactPerson: data.contactPerson,
            EmailID: data.emailID,
            CINNo: data.cinNo,
            TAN: data.tan,
            GST: data.gst,
            gst_state: data.gst_state,
            PAN: data.pan,
            Address: data.address,
            Pay_cycle: data.pay_cycle,
            fk_cityId: data.fk_cityId,
            fk_stateId: data.fk_stateId,
            fk_zoneId: data.fk_zoneId,
            Location: locArray,
            Pincode: data.pincode,
            gst_rate: data.gst_rate ?? 0,
            Phone: data.phone,
            StartDate: data.startDate ? data.startDate.split('T')[0] : null,
            EndDate: data.endDate ? data.endDate.split('T')[0] : null,
            LeavePolicy: data.leavePolicy,
            CommissionPercent: data.commissionPercent ?? 0,
            ServiceTypeIds: data.serviceTypeIds || [],
            ModelTypeIds: data.modelTypeIds || data.modelIds || [],
            isHolidayHead: data.isHolidayHead === true || data.isHolidayHead === 1,
            holidayWageTypeHead: data.holidayWageTypeHead || null,
            HolidaySalaryHeadIds: data.holidaySalaryHeadIds ? data.holidaySalaryHeadIds.map((id: any) => id.toString()) : [],
            HolidayMultiple: data.holidayMultiple ?? 0,
            addWeekOffInPaidDays: data.addWeekOffInPaidDays === true || data.addWeekOffInPaidDays === 1,
            daysDivideInMonth: data.daysDivideInMonth ?? 0,
            PresentDaysforWeekOff: data.presentDaysforWeekOff ?? data.PresentDaysforWeekOff ?? 0,
            ShowDetailsOnSlalrySlip: data.showDetailsOnSlalrySlip === true || data.showDetailsOnSlalrySlip === 1 || data.ShowDetailsOnSlalrySlip === true || data.ShowDetailsOnSlalrySlip === 1
          });
          // this.ExtraDayList = data.extraDayDetails || [];
          this.ExtraDayDetails.clear();

          if (data.extraDayDetails?.length > 0) {

            data.extraDayDetails.forEach((x: any) => {

              this.ExtraDayDetails.push(
                this.fb.group({
                  extraDayStatus: [x.extraDayStatus],
                  dayConsider: [x.dayConsider]
                })
              );

            });

          }
          else {

            this.addExtraDay();
          }

          const monthDaysList = data.serviceMonthDaysDetails || data.ServiceMonthDaysDetails;
          if (this.serviceTypeMonthList && this.serviceTypeMonthList.length > 0) {
            this.populateServiceMonthDays(monthDaysList);
          } else {
            this.pendingMonthDaysList = monthDaysList || [];
          }
        }

        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        this.toastrService.error("Error loading details.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  checkCodeAvailability(code: string): void {
    if (!code) return;
    this.clientMasterService.CheckDuplicateValue('ClientCode', code, this.pk_cost_centre_id).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ClientForm.get('ClientCode')?.setErrors({ duplicate: response.message });
        } else {
          this.ClientForm.get('ClientCode')?.setErrors(null);
        }
      }
    });
  }


  checkNameAvailability(code: string): void {
    if (!code) return;
    this.clientMasterService.CheckDuplicateValue('ClientName', code, this.pk_cost_centre_id).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ClientForm.get('ClientName')?.setErrors({ duplicate: response.message });
        } else {
          this.ClientForm.get('ClientName')?.setErrors(null);
        }
      }
    });
  }

  //added new



  addExtraDay() {

    const lastIndex = this.ExtraDayDetails.length - 1;

    // check only when already one row exists
    if (lastIndex >= 0) {

      const lastRow = this.ExtraDayDetails.at(lastIndex);

      const extraDayStatus = lastRow.get('extraDayStatus')?.value;
      const dayConsider = lastRow.get('dayConsider')?.value;

      // stop adding new row if current row empty
      if (!extraDayStatus || !dayConsider) {

        this.toastrService.error('Please fill Extra Day Status and Day Consider');

        return;
      }
    }


    this.ExtraDayDetails.push(
      this.fb.group({
        extraDayStatus: [''],
        dayConsider: [null]
      })
    );
  }
  removeExtraDay(index: number) {

    this.ExtraDayDetails.removeAt(index);
  }

  addServiceMonthDays() {
    const lastIndex = this.ServiceMonthDaysDetails.length - 1;
    if (lastIndex >= 0) {
      const lastRow = this.ServiceMonthDaysDetails.at(lastIndex);
      const serviceTypeId = lastRow.get('serviceTypeId')?.value;
      const daysDivideInMonth = lastRow.get('daysDivideInMonth')?.value;

      if (!serviceTypeId || daysDivideInMonth === null || daysDivideInMonth === undefined || daysDivideInMonth === '') {
        this.toastrService.error('Please select Service Type and enter Days Divide In Month');
        return;
      }
    }

    this.ServiceMonthDaysDetails.push(
      this.fb.group({
        pk_id: [0],
        serviceTypeId: [null],
        daysDivideInMonth: [null]
      })
    );
  }

  removeServiceMonthDays(index: number) {
    this.ServiceMonthDaysDetails.removeAt(index);
    if (this.ServiceMonthDaysDetails.length === 0) {
      this.addServiceMonthDays();
    }
  }

  onServiceTypeMonthChange(index: number): void {
    const currentRow = this.ServiceMonthDaysDetails.at(index);
    const selectedId = currentRow.get('serviceTypeId')?.value;
    if (!selectedId) return;

    const duplicateIndex = this.ServiceMonthDaysDetails.controls.findIndex(
      (ctrl, i) => i !== index && ctrl.get('serviceTypeId')?.value?.toString() === selectedId.toString()
    );

    if (duplicateIndex !== -1) {
      const serviceObj = this.serviceTypeMonthList.find(s => s.value.toString() === selectedId.toString());
      const serviceName = serviceObj?.name || 'this service';
      this.toastrService.warning(`Already added for ${serviceName}`);
      currentRow.get('serviceTypeId')?.setValue(null);
    }
  }

  validateDecimalNumber(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Allow digits (0-9)
    const isDigit = charCode >= 48 && charCode <= 57;
    // Allow the decimal point (ASCII code 46)
    const isDecimal = charCode === 46;
    const inputEl = event.target as HTMLInputElement;
    const hasDecimal = inputEl?.value ? inputEl.value.includes('.') : false;

    // Disallow if not digit, or if decimal already exists
    if (!isDigit && !(isDecimal && !hasDecimal)) {
      event.preventDefault();
    }
  }

  validateTwoDigitDecimal(event: KeyboardEvent): void {
    const isSpecialKey = [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ].includes(event.key);
    if (isSpecialKey) return;

    const input = event.target as HTMLInputElement;
    const key = event.key;
    const isDigit = key >= '0' && key <= '9';

    // No decimal allowed: block everything except digits
    if (!isDigit) {
      event.preventDefault();
      return;
    }

    const val = input.value || '';
    const start = input.selectionStart ?? val.length;
    const end = input.selectionEnd ?? val.length;
    const proposed = val.slice(0, start) + key + val.slice(end);

    // Max 2 digits only and maximum value is 31
    if (proposed.length > 2 || Number(proposed) > 31) {
      event.preventDefault();
    }
  }

  formatTwoDigitDecimal(event: Event, controlName?: string, index?: number): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (!val) return;

    // Remove any character that is not a digit, and keep maximum 2 digits
    let formatted = val.replace(/[^0-9]/g, '').slice(0, 2);
    if (formatted && Number(formatted) > 31) {
      formatted = '31';
    }

    if (input.value !== formatted) {
      input.value = formatted;
    }

    if (index !== undefined && index >= 0) {
      this.ServiceMonthDaysDetails.at(index).get('daysDivideInMonth')?.setValue(formatted ? Number(formatted) : null, { emitEvent: false });
    } else if (controlName) {
      this.ClientForm.get(controlName)?.setValue(formatted ? Number(formatted) : null, { emitEvent: false });
    }
  }
}
