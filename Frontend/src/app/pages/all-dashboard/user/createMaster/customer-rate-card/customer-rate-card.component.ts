import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CustomerRateCardService } from '../../services/customer-rate-card.service';
import { EmployeeMasterService } from '../../../payroll/services/employee-master.service';
import { GeneralService } from '../../../payroll/services/general.service';

@Component({
  selector: 'app-customer-rate-card',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-rate-card.component.html',
  styleUrl: './customer-rate-card.component.scss'
})
export class CustomerRateCardComponent implements OnInit {

  rateCardForm!: FormGroup;
  earningHeadsList = new FormArray<FormGroup>([]);

  CustomerList: { name: string, value: string }[] = [];
  LocationList: { name: string, value: string }[] = [];
  ServiceTypeList: { name: string, value: string }[] = [];
  CategoryList: { name: string, value: string }[] = [];
  WorkDurationList: { name: string, value: string }[] = [];

  showError = false;
  submitted = false;
  rateCardId!: string | null;
  Isedit = false;

  minWageTotal = 0;
  minWageHeadMap: { [headId: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private rateCardService: CustomerRateCardService,
    private employeeMasterService: EmployeeMasterService,
    private generalService: GeneralService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private ngxLoader: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDropdowns();

    this.route.paramMap.subscribe(params => {
      this.rateCardId = params.get('rateCardId');
      if (this.rateCardId && this.rateCardId !== 'undefined') {
        this.Isedit = true;
        this.loadRateCardData(Number(this.rateCardId));
      } else {
        this.getHeads();
      }
    });
  }

  initializeForm() {
    this.rateCardForm = this.fb.group({
      CustomerId: [null, Validators.required],
      LocationId: [null, Validators.required],
      ServiceTypeId: [null, Validators.required],
      CategoryId: [null, Validators.required],
      WorkDuration: [null, Validators.required],
      earningHeads: this.fb.array([])
    });

    this.earningHeadsList = this.rateCardForm.get('earningHeads') as FormArray;

    this.rateCardForm.get('LocationId')?.valueChanges.subscribe(() => {
      this.fetchMinimumWages();
    });

    this.rateCardForm.get('CategoryId')?.valueChanges.subscribe(() => {
      this.fetchMinimumWages();
    });
  }

  get earningHeads(): FormArray {
    return this.rateCardForm.get('earningHeads') as FormArray;
  }

  loadDropdowns() {
    // Customers
    this.employeeMasterService.get_DropdownList('Client').subscribe(res => {
      if (res.isSuccess && res.data) {
        this.CustomerList = res.data.map((x: any) => ({ name: x.name, value: x.value }));
      }
    });

    // Locations will be loaded dynamically based on selected Customer/Client

    // Service Type (CodetypeId = 14 from General Master)
    this.generalService.GetDdlListBasedOnCodeType('14').subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.ServiceTypeList = res.data.map((x: any) => ({ name: x.text || x.name, value: Number(x.value) }));
      }
    });

     this.generalService.GetDdlListBasedOnCodeType('20').subscribe((res: any) => {
      if (res.isSuccess && res.data) {
        this.WorkDurationList = res.data.map((x: any) => ({ name: x.text || x.name, value: Number(x.value) }));
      }
    });

    // Category
    this.employeeMasterService.get_DropdownList('Category').subscribe(res => {
      if (res.isSuccess && res.data) {
        this.CategoryList = res.data.map((x: any) => ({ name: x.name, value: x.value }));
      }
    });

    // Work Duration from Shift Master (company-specific distinct durations)
    // this.employeeMasterService.get_DropdownList('ShiftDuration').subscribe(res => {
    //   if (res.isSuccess && res.data) {
    //     this.WorkDurationList = res.data.map((x: any) => ({ name: x.name, value: x.value }));
    //   }
    // });
  }

  getHeads() {
    this.earningHeads.clear();

    this.rateCardService.getDynamicHeads().subscribe((response: any) => {
      if (response.isSuccess && response.data) {
        const headList: any[] = response.data;

        headList.forEach((item: any) => {
          const group = this.fb.group({
            fk_headid: item.pk_headid || item.fk_headid,
            shortDesc: item.shortdesc || item.shortDesc || item.headName,
            amount: [0, Validators.required]
          });
          this.earningHeads.push(group);
        });
      }
    });
  }

  get totalEarningCount(): number {
    let total = 0;
    this.earningHeadsList.controls.forEach(control => {
      total += Number(control.value.amount) || 0;
    });
    return total;
  }

  restrictInputDecimal(event: KeyboardEvent) {
    const pattern = /^[0-9.]$/;
    const inputChar = event.key;
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  fetchMinimumWages(): void {
    const locationId = this.rateCardForm.get('LocationId')?.value;
    const categoryId = this.rateCardForm.get('CategoryId')?.value;

    if (!locationId || !categoryId) {
      this.minWageTotal = 0;
      this.minWageHeadMap = {};
      return;
    }

    this.rateCardService.getMinimumWage(locationId.toString(), categoryId.toString()).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data) {
          this.minWageTotal = Number(res.data.minimumWages) || 0;
          const map: { [headId: string]: number } = {};
          (res.data.heads || []).forEach((h: any) => {
            const amt = Number(h.minAmount) || 0;
            if (amt > 0) {
              map[h.headId.toString()] = amt;
            }
          });
          this.minWageHeadMap = map;
        } else {
          this.minWageTotal = 0;
          this.minWageHeadMap = {};
        }
      },
      error: () => {
        this.minWageTotal = 0;
        this.minWageHeadMap = {};
      }
    });
  }

  getMinWageForHead(headId: any): number {
    if (!headId) return 0;
    return this.minWageHeadMap[headId.toString()] || 0;
  }

  isLessThanMinWage(control: any): boolean {
    const headId = control.value?.fk_headid;
    const minAmt = this.getMinWageForHead(headId);
    if (minAmt <= 0) return false;
    const enteredAmt = Number(control.value?.amount) || 0;
    return enteredAmt < minAmt;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.rateCardForm.invalid) {
      this.showError = true;
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return;
    }

    // Minimum Wage Head Validations
    for (const control of this.earningHeadsList.controls) {
      const headId = control.value?.fk_headid;
      const minAmt = this.getMinWageForHead(headId);
      const enteredAmt = Number(control.value?.amount) || 0;
      if (minAmt > 0 && enteredAmt < minAmt) {
        this.toastrService.error(
          `Amount for "${control.value?.shortDesc || 'Head'}" (${enteredAmt.toFixed(2)}) cannot be less than minimum wage (${minAmt.toFixed(2)})`,
          'Validation Error'
        );
        return;
      }
    }

    // Minimum Wages Total Validation
    if (this.minWageTotal > 0 && this.totalEarningCount < this.minWageTotal) {
      this.toastrService.error(
        `Total Earning (${this.totalEarningCount.toFixed(2)}) cannot be less than Total Minimum Wages (${this.minWageTotal.toFixed(2)})`,
        'Validation Error'
      );
      return;
    }

    const formVal = this.rateCardForm.value;
    const details = this.earningHeads.controls.map(control => {
      return {
        HeadId: control.value.fk_headid,
        Amount: Number(control.value.amount)
      };
    });

    const payload = {
      RateCardId: this.Isedit ? Number(this.rateCardId) : 0,
      CustomerId: formVal.CustomerId,
      LocationId: formVal.LocationId,
      ServiceTypeId: Number(formVal.ServiceTypeId),
      CategoryId: formVal.CategoryId,
      WorkDuration: formVal.WorkDuration ? formVal.WorkDuration.toString() : '',
      Details: details
    };

    if (this.Isedit) {
      this.rateCardService.update(payload).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toastrService.success('Rate Card updated successfully!', 'Success');
            this.router.navigateByUrl("/dash/user/userdashboard/customerRateCard_list"); // Adjust list route if created later
          } else {
            this.toastrService.error(res?.message || 'Update Failed', 'Error');
          }
        },
        error: (err) => this.toastrService.error('Error updating rate card')
      });
    } else {
      this.rateCardService.insert(payload).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toastrService.success('Rate Card created successfully!', 'Success');
             this.router.navigateByUrl("/dash/user/userdashboard/customerRateCard_list");
            this.rateCardForm.reset();
            this.earningHeads.clear();
            this.LocationList = [];
            this.minWageTotal = 0;
            this.minWageHeadMap = {};
            this.submitted = false;
            this.showError = false;
          } else {
            this.toastrService.error(res?.message || 'Insert Failed', 'Error');
          }
        },
        error: (err) => this.toastrService.error('Error creating rate card')
      });
    }
  }

  onCustomerChange(event: any): void {
    const customerId = event ? (event.value || this.rateCardForm.get('CustomerId')?.value) : null;
    this.rateCardForm.get('LocationId')?.setValue(null);
    this.minWageTotal = 0;
    this.minWageHeadMap = {};
    if (customerId) {
      this.loadLocationsByCustomer(customerId);
    } else {
      this.LocationList = [];
    }
  }

  onCustomerClear(): void {
    this.rateCardForm.get('LocationId')?.setValue(null);
    this.LocationList = [];
    this.minWageTotal = 0;
    this.minWageHeadMap = {};
  }

  loadLocationsByCustomer(customerId: any, selectedLocationId?: string): void {
    if (!customerId) {
      this.LocationList = [];
      return;
    }
    this.rateCardService.getLocationsByCustomer(customerId).subscribe({
      next: (res) => {
        if (res && res.isSuccess && res.data && res.data.length > 0) {
          this.LocationList = res.data.map((x: any) => ({ name: x.name, value: x.value }));
          if (selectedLocationId) {
            this.rateCardForm.get('LocationId')?.setValue(selectedLocationId);
          }
        } else {
          this.LocationList = [];
          this.rateCardForm.get('LocationId')?.setValue(null);
        }
      },
      error: () => {
        this.LocationList = [];
        this.rateCardForm.get('LocationId')?.setValue(null);
      }
    });
  }

  loadRateCardData(id: number) {
    this.rateCardService.getById(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data;
          this.rateCardForm.patchValue({
            CustomerId: data.customerId?.toString(),
            ServiceTypeId: data.serviceTypeId,
            CategoryId: data.categoryId?.toString(),
            WorkDuration: Number(data.workDuration),
          });

          if (data.customerId) {
            this.loadLocationsByCustomer(data.customerId, data.locationId?.toString());
          }

          this.fetchMinimumWages();

          this.earningHeads.clear();
          (data.details || []).forEach((item: any) => {
            const group = this.fb.group({
              fk_headid: item.headId,
              shortDesc: item.headName || 'Head',
              amount: [item.amount, Validators.required]
            });
            this.earningHeads.push(group);
          });
        }
      }
    });
  }

  clearForm(): void {
    this.rateCardForm.reset();
    this.earningHeads.clear();
    this.LocationList = [];
    this.minWageTotal = 0;
    this.minWageHeadMap = {};
    this.submitted = false;
    this.showError = false;
  }
}
