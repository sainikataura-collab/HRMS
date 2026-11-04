import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { TaxDeductorService } from '../../services/tax-deductor.service';

@Component({
  selector: 'app-tax-deductor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgxPaginationModule, NgSelectModule],
  templateUrl: './tax-deductor.component.html',
  styleUrl: './tax-deductor.component.scss'
})
export class TaxDeductorComponent {
  TaxDeductorForm!: FormGroup;
  pk_dedId: string = '';
  isEditMode: boolean = false;
  State: { label: string, value: string }[] = [];
  FinancialYear: { name: string, value: string }[] = [];
  submitted = false;
  showError = false;
  router = inject(Router);
  route = inject(ActivatedRoute);

  selects = [
    { name: 'Ahemadabad', value: 'Ahemadabad' },
    { name: 'Alwar', value: 'Alwar' },
    { name: 'Ankleshwar', value: 'Ankleshwar' },
    { name: 'Ambala', value: 'Ambala' }
  ];
  DeductorType = [
    { name: 'Company', value: 'K' },
    { name: 'Central Government', value: 'A' },
    { name: 'State Government', value: 'S' },
    { name: 'Statutory body (Central Govt.)', value: 'D' },
    { name: 'Statutory body (State Govt.)', value: 'E' },
    { name: 'Autonomous body (Central Govt.)', value: 'G' },
    { name: 'Autonomous body (State Govt.)', value: 'H' },
    { name: 'Local Authority (Central Govt.)', value: 'L' },
    { name: 'Local Authority (State Govt.)', value: 'N' },
    { name: 'Branch / Division of Company', value: 'M' },
    { name: 'Association of Person (AOP)', value: 'P' },
    { name: 'Association of Person (Trust)', value: 'T' },
    { name: 'Artificial Juridical Person', value: 'J' },
    { name: 'Body of Individuals', value: 'B' },
    { name: 'Individual/HUF', value: 'Q' },
    { name: 'Firm', value: 'F' },
  ];

  constructor(
    private fb: FormBuilder,
    private taxDeductorService: TaxDeductorService,
    private toastrService: ToastrService,
    private encryptService: EncryptionService
  ) { }
  ngOnInit(): void {
    this.initializeForm();

    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_dedId');
      if (id) {
        this.pk_dedId = this.encryptService.decryptText(id.toString());
        this.isEditMode = true;
        this.getTaxDeductorById(this.pk_dedId);
      }
    });
    this.getStateList('State')
    this.getFinancialYearList('FinancialYear')


    

    this.TaxDeductorForm.get('fYear')?.valueChanges.subscribe((value: string) => {
      if (value) {
        console.log(value);
        let obj:{name:string,value:string} = (this.FinancialYear.find(e=>e.value==value)!);
        console.log(obj['name'].split('--'));
                const [start, end] = obj['name'].split('--');
        console.log([start, end]);
        this.TaxDeductorForm.patchValue({
          sfyear: start.trim(),
          efyear: end.trim(),
          sayear: end,
          eayear: (Number(end) + 1).toString()
        });
      }
    });
    

  }


  initializeForm(): void {
    this.TaxDeductorForm = this.fb.group({
      // Deductor Details
      name_dd: ['', Validators.required],
      branch_dd: [''],
      add1_dd: ['', Validators.required],
      add2_dd: [''],
      add3_dd: [''],
      add4_dd: [''],
      add5_dd: [''],
      state_dd: [''],
      DeductorStCode: [''],
      statecode_dd: [''],
      pin_dd: ['', Validators.required],
      email_dd: [''],
      stdcode_dd: [''],
      phone_dd: [''],
      fax_dd: [''],
      changadd_dd: ['', Validators.required],
      // Responsible Person Details
      name_rp: ['', Validators.required],
      desig_rp: ['', Validators.required],
      add1_rp: ['', Validators.required],
      add2_rp: [''],
      add3_rp: [''],
      add4_rp: [''],
      add5_rp: [''],
      state_rp: [''],
      statecode_rp: [''],
      pin_rp: [''],
      email_rp: [''],
      stdcode_rp: [''],
      phone_rp: [''],
      fax_rp: [''],
      changadd_rp: [''],
      // Transfer Checkbox
      TransferDetuctor: [false],
      // Tax Deductor Master
      fYear: ['', Validators.required],
      deductorType: [''],
      FinancialYears: [''],
      existingTdsAccess: [''],
      AsstYear: [''],
      retunrtype: [''],
      pan: [''],
      tan: [''],
      sfyear: [''],
      efyear: [''],
      sayear: [''],
      eayear: [''],
      approved: [''],
      officercode: ['']
    });
  }



  getTaxDeductorById(pk_dedId: string) {
    this.taxDeductorService.get_TaxDeductorById(pk_dedId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.TaxDeductorForm.patchValue({
            name_dd: response.data.name_dd,
            branch_dd: response.data.branch_dd,
            fYear: response.data.fk_finid,
            pk_dedId: response.data.pk_dedId,
            fk_finid: response.data.fk_finid,
            add1_dd: response.data.add1_dd,
            add2_dd: response.data.add2_dd,
            add3_dd: response.data.add3_dd,
            add4_dd: response.data.add4_dd,
            add5_dd: response.data.add5_dd,
            state_dd: response.data.state_dd,
            statecode_dd: response.data.statecode_dd,
            pin_dd: response.data.pin_dd,
            email_dd: response.data.email_dd,
            stdcode_dd: response.data.stdcode_dd,
            phone_dd: response.data.phone_dd,
            changadd_dd: response.data.changadd_dd,
            fax_dd: response.data.fax_dd,
            name_rp: response.data.name_rp,
            desig_rp: response.data.desig_rp,
            fathername_rp: response.data.fathername_rp,
            sex_rp: response.data.sex_rp,
            add1_rp: response.data.add1_rp,
            add2_rp: response.data.add2_rp,
            add3_rp: response.data.add3_rp,
            add4_rp: response.data.add4_rp,
            add5_rp: response.data.add5_rp,
            state_rp: response.data.state_rp,
            statecode_rp: response.data.statecode_rp,
            pin_rp: response.data.pin_rp,
            email_rp: response.data.email_rp,
            stdcode_rp: response.data.stdcode_rp,
            phone_rp: response.data.phone_rp,
            changadd_rp: response.data.changadd_rp,
            fax_rp: response.data.fax_rp,
            pan: response.data.pan,
            tan: response.data.tan,
            sfyear: response.data.sfyear,
            efyear: response.data.efyear,
            sayear: response.data.sayear,
            eayear: response.data.eayear,
            deductorType: response.data.deductorType,
            existingTdsAccess: response.data.existingTdsAccess,
            retunrtype: response.data.retunrtype,
            approved: response.data.approved,
            officercode: response.data.officercode,
          });
        } else {
          this.toastrService.error(response.message || 'Failed to fetch tax deductor data');
        }
      },
      (error) => {
        console.error('Error fetching tax deductor:', error);
        this.toastrService.error('Error fetching tax deductor data');
      }
    );
  }

  getStateList(fieldName: string) {
    this.taxDeductorService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.State = res.data.map((pk_stateid: any) => ({
            name: pk_stateid.name,
            value: pk_stateid.value
          }));
        } else {
          this.toastrService.error("Failed to load State list.");
        }
      },
      error: (err) => {
        console.error("Error fetching State list:", err);
        this.toastrService.error("Error fetching State list.");
      }
    });
  }
  getFinancialYearList(fieldName: string) {
    this.taxDeductorService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.FinancialYear = res.data.map((pk_finid: any) => ({
            name: pk_finid.name,
            value: pk_finid.value
          }));
        } else {
          this.toastrService.error("Failed to load FinancialYear list.");
        }
      },
      error: (err) => {
        console.error("Error fetching FinancialYear list:", err);
        this.toastrService.error("Error fetching FinancialYear list.");
      }
    });
  }


  resetForm(): void {
    this.TaxDeductorForm.reset();
    this.submitted = false;
    this.showError = false;
  }

  view() {
    this.router.navigateByUrl('/dash/payroll/payrolldashboard/taxDeductor_list');
  }

  // onSubmit(): void {
  //   debugger
  //   this.submitted = true;
  //   if (this.TaxDeductorForm.invalid) {
  //     this.showError = true;
  //     return;
  //   }
  //   const formData = this.TaxDeductorForm.value;
  //   if (this.isEditMode && this.pk_dedId) {
  //     // Update existing tax deductor
  //     this.taxDeductorService.update_TaxDeductor(Number(this.pk_dedId), formData).subscribe(
  //       (response) => {
  //         if (response.isSuccess) {
  //           this.toastrService.success(response.message || 'Tax Deductor updated successfully!');
  //           this.router.navigate(['/dash/payroll/payrolldashboard/taxDeductorList']);
  //         } else {
  //           this.toastrService.error(response.message || 'Failed to update tax deductor');
  //         }
  //       },
  //       (error) => {
  //         console.error('Update Error:', error);
  //         this.toastrService.error('Error updating tax deductor');
  //       }
  //     );
  //   } else {
  //     // Create new tax deductor
  //     this.taxDeductorService.add_TaxDeductor(formData).subscribe(
  //       (response) => {
  //         if (response.isSuccess) {
  //           this.toastrService.success(response.message || 'Tax Deductor created successfully!');
  //           this.router.navigate(['/dash/payroll/payrolldashboard/taxDeductorList']);
  //         } else {
  //           this.toastrService.error(response.message || 'Failed to create tax deductor');
  //         }
  //       },
  //       (error) => {
  //         console.error('Create Error:', error);
  //         this.toastrService.error('Error creating tax deductor');
  //       }
  //     );
  //   }
  // }


  onSubmit(): void {
    //debugger
    this.submitted = true;
    if (this.TaxDeductorForm.invalid) {
      this.showError = true;
      return;
    }

    // ✅ Convert Form Data to Expected Payload Format
    const payload = [
      {
        pk_dedId: this.isEditMode ? this.pk_dedId : "",  // If editing, use ID, otherwise empty
        ...this.TaxDeductorForm.value,  // Spread the form values into the payload
        fk_finid: this.TaxDeductorForm.get('fYear')?.value,  // Use the selected financial year ID  
      }
    ];

    if (this.isEditMode && this.pk_dedId) {
      // ✅ Update existing tax deductor
      this.taxDeductorService.update_TaxDeductor(Number(this.pk_dedId), payload).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Tax Deductor updated successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/taxDeductor_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to update tax deductor');
          }
        },
        (error) => {
          console.error('Update Error:', error);
          this.toastrService.error('Error updating tax deductor');
        }
      );
    } else {
      // ✅ Create new tax deductor
      this.taxDeductorService.add_TaxDeductor(payload).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Tax Deductor created successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/taxDeductor_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to create tax deductor');
          }
        },
        (error) => {
          console.error('Create Error:', error);
          this.toastrService.error('Error creating tax deductor');
        }
      );
    }
  }




}



