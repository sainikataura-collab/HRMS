





import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CompensationService } from '../Service/compensation.service';

export interface TaxRegimeOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-tax-regime',
  standalone: true,
  imports: [CommonModule, RouterLink, NgSelectModule, ReactiveFormsModule],
  templateUrl: './tax-regime.component.html',
  styleUrls: ['./tax-regime.component.scss']
})
export class TaxRegimeComponent implements OnInit {
  Regimeform: FormGroup;
  showError = false;
  isLoading = false;
  pk_empid: string | null = null;

  // Dropdown options
  selectResime: TaxRegimeOption[] = [
        { name: 'select Tax Regime Type', value: '' },
    { name: 'Old', value: 'O' },
    { name: 'New', value: 'N' }
  ];

  constructor(
    private fb: FormBuilder,
    private taxRegimeService: CompensationService,
    private toastr: ToastrService
  ) {
    this.Regimeform = this.fb.group({
      TaxRegime: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // TODO: set pk_empid if required from route/service
  }

  onSubmit(): void {
    this.showError = true;

    if (this.Regimeform.valid) {
      this.isLoading = true;
      const selectedTaxRegime = this.Regimeform.get('TaxRegime')?.value;

      this.taxRegimeService.updateTaxRegime(selectedTaxRegime).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.isSuccess) {
            this.showError = false;
            this.toastr.success(response.message || 'Tax regime updated successfully.');
          } else {
            this.toastr.error(response.message || 'Failed to update tax regime.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating tax regime:', err);
          this.toastr.error('An error occurred while updating tax regime.');
        }
      });
    }
  }

  resetForm(): void {
    this.Regimeform.reset();
    this.showError = false;
  }

  // Getter for easy access
  get f() {
    return this.Regimeform.controls;
  }
}
