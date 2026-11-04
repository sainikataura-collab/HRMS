import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';
import { TaxConfigService } from '../../services/tax-config.service';

@Component({
  selector: 'app-taxconfiguration',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './taxconfiguration.component.html',
  styleUrl: './taxconfiguration.component.scss'
})
export class TaxconfigurationComponent {
  TaxConfirmationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: PayrollService,
    private taxConfigService: TaxConfigService,
  ) {}

  docStatus = [
    { name: 'Undertaking', value: 'Undertaking' },
    { name: 'Submited', value: 'Submited' }
  ];
  ngOnInit() {
    this.TaxConfirmationForm = this.fb.group({
      schargeQAmtLimit: [''],
      sChargePer: ['', Validators.required],
      cessChargePer: [''],
      max80DedLimit: [''],
      max_Child: [''],
      ceA_QLimit: [''],
      seniorcitizionage: [''],
      hraExemptMetroPer: [''],
      hraExemptNonMetroPer: ['', Validators.required],
      docStatus: ['', Validators.required],
      documentSubmissionDate: [''],
    });
    this.loadTaxConfig(); // 👈 Call the API once on load
  }



  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
  
    const parts = dateStr.split('/');
    console.log(parts);
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    console.log(day, month, year);
    const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
    console.log(date);
    if (isNaN(date.getTime())) return null; // still safe check
  
    const offset = date.getTimezoneOffset();
    console.log(offset);
    const localDate = new Date(date.getTime() - offset * 60000);
    console.log(localDate);
    return localDate.toISOString().split('T')[0]; // final output
  }


  loadTaxConfig() {
    this.taxConfigService.getTaxConfigList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data;

          console.log(this.formatDateForInput(data.documentSubmissionDate))
          // 👇 Patching the form with API data
          this.TaxConfirmationForm.patchValue({
            schargeQAmtLimit: data.schargeQAmtLimit,
            sChargePer: data.sChargePer,
            cessChargePer: data.cessChargePer,
            max80DedLimit: data.max80DedLimit,
            max_Child: data.max_Child,
            ceA_QLimit: data.ceA_QLimit,
            seniorcitizionage: data.seniorcitizionage,
            hraExemptMetroPer: data.hraExemptMetroPer,
            hraExemptNonMetroPer: data.hraExemptNonMetroPer,
            docStatus: data.docStatus,
            documentSubmissionDate: this.formatDateForInput(data.documentSubmissionDate),
          });
  
          console.log("Form patched successfully:", this.TaxConfirmationForm.value);
        } else {
          this.toastrService.error('Failed to fetch tax config data.');
        }
      },
      error: (err) => {
        console.error('Error fetching tax config:', err);
        this.toastrService.error('Something went wrong while loading data.');
      }
    });
  }
  

  resetForm() {
    this.TaxConfirmationForm.reset();
  }

  update() {
    if (this.TaxConfirmationForm.invalid) {
      this.toastrService.error('Please fill all required fields.');
      return;
    }

    const payload = this.TaxConfirmationForm.value;

    this.taxConfigService.updateTaxConfig(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastrService.success('Tax configuration updated successfully.');
        } else {
          this.toastrService.error(res.message || 'Failed to update tax configuration.');
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.toastrService.error('An error occurred while updating tax configuration.');
      }
    });
  }
}