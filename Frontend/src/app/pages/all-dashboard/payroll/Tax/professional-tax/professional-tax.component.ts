import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ProfessionalTaxService } from '../../services/professional-tax.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-professional-tax',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule,
    FormsModule],
  templateUrl: './professional-tax.component.html',
  styleUrl: './professional-tax.component.scss'
})
export class ProfessionalTaxComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);

  ProfessionalTaxForm!: FormGroup;
  submitted = false;
  showError = false;

  pk_slabid!: string;
  Isedit = false;
  states: { label: string, value: string }[] = [];

genderList = [
  { name: 'All', value: 'B' },
  { name: 'Male', value: 'M' },
  { name: 'Female', value: 'F' }
];
  constructor(private fb: FormBuilder, private ProfessionalTaxService: ProfessionalTaxService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, public encryptionService: EncryptionService) { }
  ngOnInit() {
    this.ProfessionalTaxForm = this.fb.group({
      fk_stateid: ['', Validators.required],
       gender: [null],
      sno: ['', Validators.required,],
      lowerlimit: ['', Validators.required],
      upperlimit: ['', Validators.required],
      tax_percent: ['', Validators.required],
      pk_slabid: [''],
      Jan_Amt: [0],
      Feb_Amt: [0],
      Mar_Amt: [0],
      Apr_Amt: [0],
      May_Amt: [0],
      Jun_Amt: [0],
      Jul_Amt: [0],
      Aug_Amt: [0],
      Sep_Amt: [0],
      Oct_Amt: [0],
      Nov_Amt: [0],
      Dec_Amt: [0]
    });
    if (this.route.snapshot.params['pk_slabid']) {
      this.pk_slabid = this.encryptionService.decryptText(this.route.snapshot.params['pk_slabid'].toString());

    }
    if (this.pk_slabid && this.pk_slabid !== 'undefined') {
      this.loadProfessionalTaxData(this.pk_slabid);
      this.Isedit = true;

    }
    this.getStateList('State');

  }
  getStateList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call

    this.ProfessionalTaxService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.states = res.data.map((fk_stateid: any) => ({
            name: fk_stateid.name,
            value: fk_stateid.value
          }));
        } else {
          this.toastrService.error("Failed to load HOD list.");
        }
        this.ngxUILoaderService.stop();

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastrService.error("Error fetching level list.");

      }
    });
  }
  restrictInput(event: KeyboardEvent) {
    const pattern = /^[0-9]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }
  restrictInputDecimal(event: KeyboardEvent) {
    const pattern = /^[0-9to.]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.ProfessionalTaxForm.invalid) {
      this.showError = true;
      return;
    }

    const data = {
      ...this.ProfessionalTaxForm.value,

      pk_slabid: this.pk_slabid

    };

    if (this.Isedit) {
      this.ProfessionalTaxService.update_professionalTaxSlab(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/user/userdashboard/professionalTax_list");
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      })
    }

    else {
      this.ProfessionalTaxService.add_professionalTaxSlab(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/user/userdashboard/professionalTax_list");

          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          // Error handling in case of a failure during form submission
          this.toastrService.error('An error occurred during form submission');
        }
      })

    }
  }


  loadProfessionalTaxData(pk_slabid: string) {
    this.ProfessionalTaxService.getById_professionalTaxSlab(pk_slabid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched ProfessionalTax Data:", res.data);  // Debugging ke liye

          this.ProfessionalTaxForm.patchValue({
            fk_stateid: res.data.fk_stateid ? res.data.fk_stateid.toString() : '',
            sno: res.data.sno,
            lowerlimit: res.data.lowerlimit,
            upperlimit: res.data.upperlimit,
            tax_percent: res.data.tax_percent,
            gender: res.data.gender,
            Jan_Amt: res.data.jan_Amt,
            Feb_Amt: res.data.feb_Amt,
            Mar_Amt: res.data.mar_Amt,
            Apr_Amt: res.data.apr_Amt,
            May_Amt: res.data.may_Amt,
            Jun_Amt: res.data.jun_Amt,
            Jul_Amt: res.data.jul_Amt,
            Aug_Amt: res.data.aug_Amt,
            Sep_Amt: res.data.sep_Amt,
            Oct_Amt: res.data.oct_Amt,
            Nov_Amt: res.data.nov_Amt,
            Dec_Amt: res.data.dec_Amt

          });

          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load ProfessionalTax details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading ProfessionalTax data.");
      }
    });
  }


  resetForm(): void {
    this.ProfessionalTaxForm.reset();

  }
}



