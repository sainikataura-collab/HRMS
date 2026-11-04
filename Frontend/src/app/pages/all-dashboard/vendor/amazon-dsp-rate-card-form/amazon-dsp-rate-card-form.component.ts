import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { AmazonDspRateCardService, AmazonDspBlockRateCard } from '../Service/amazon-dsp-rate-card.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-amazon-dsp-rate-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './amazon-dsp-rate-card-form.component.html',
  styles: []
})
export class AmazonDspRateCardFormComponent implements OnInit {
  rateCardForm!: FormGroup;
  isEditMode: boolean = false;
  submitted: boolean = false;
  isSaving: boolean = false;
  rateCardId: number = 0;
  existingSource: string = 'Form Entry';
  existingFilePath: string | null = null;

  // Dropdown lists
  locations: any[] = [];
  blocks: any[] = [];
  vehicleTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private rateCardService: AmazonDspRateCardService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      const decryptedId = this.encryptionService.decryptText(idParam) || idParam;
      if (decryptedId && !isNaN(Number(decryptedId))) {
        this.rateCardId = Number(decryptedId);
        this.isEditMode = true;
        this.loadRateCardData(this.rateCardId);
      }
    }
  }

  initForm(): void {
    this.rateCardForm = this.fb.group({
      locationID: [null, [Validators.required]],
      block: [null, [Validators.required]],
      vehicleType: [null, [Validators.required]],
      rate: ['', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      effectiveFrom: ['', [Validators.required]]
    });
  }

  loadDropdowns(): void {
    // 1. Locations dropdown (Location)
    this.rateCardService.getDropdownList('Location').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.locations = res.data.map((item: any) => ({
            value: item.value?.toString(),
            name: item.name
          }));
        }
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });

    // 2. Block dropdown (CodeTypeId: 7)
    this.rateCardService.getDdlListBasedOnCodeType('7').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.blocks = res.data.map((item: any) => {
            // const raw = item.name || item.codeDescription || item.value?.toString() || '';
            const raw = item.name || item.codeDescription || '';
            const clean = this.cleanDropdownText(raw);
            return {
              // value: clean,
               value: item.value?.toString(),
              name: clean
            };
          });
        }
      },
      error: (err) => {
        console.error('Error loading blocks:', err);
      }
    });

    // 3. Vehicle Type dropdown (CodeTypeId: 8)
    this.rateCardService.getDdlListBasedOnCodeType('8').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.vehicleTypes = res.data.map((item: any) => {
            // const raw = item.name || item.codeDescription || item.value?.toString() || '';
             const raw = item.name || item.codeDescription || '';
            const clean = this.cleanDropdownText(raw);
            return {
              // value: clean,
               value: item.value?.toString(),
              name: clean
            };
          });
        }
      },
      error: (err) => {
        console.error('Error loading vehicle types:', err);
      }
    });
  }

  private cleanDropdownText(text: any): string {
    if (!text) return '';
    const str = String(text).trim();
    if (str.includes(':')) {
      const parts = str.split(':');
      return parts[parts.length - 1].trim() || parts[0].trim();
    }
    return str;
  }
private toLocalDateString(dateValue: any): string {
    const d = new Date(dateValue);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
  loadRateCardData(id: number): void {
    this.rateCardService.getById(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const item = res.data;
          let formattedDate = '';
          if (item.effectiveFrom) {
formattedDate = this.toLocalDateString(item.effectiveFrom);          }

          this.existingSource = item.source || 'Form Entry';
          this.existingFilePath = item.filePath || null;

          this.rateCardForm.patchValue({
            locationID: item.locationID?.toString(),
            block: item.block,
            vehicleType: item.vehicleType,
            rate: item.rate,
            effectiveFrom: formattedDate
          });
        } else {
          this.toastr.error('Could not load rate card details.');
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error loading rate card data.');
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.rateCardForm.invalid) {
      this.rateCardForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields properly.');
      return;
    }

    this.isSaving = true;
    const formValue = this.rateCardForm.value;

    const payload: AmazonDspBlockRateCard = {
      locationID: formValue.locationID,
      block: formValue.block,
      vehicleType: formValue.vehicleType,
      rate: formValue.rate?.toString(),
      effectiveFrom: formValue.effectiveFrom ? new Date(formValue.effectiveFrom) : undefined,
      source: this.isEditMode ? (this.existingSource || 'Form Entry') : 'Form Entry',
      filePath: this.existingFilePath || undefined
    };

    if (this.isEditMode) {
      payload.pk_BlockRateCardID = this.rateCardId;
      this.rateCardService.update(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            this.toastr.success('Amazon DSP RateCard updated successfully.');
            this.goBack();
          } else {
            this.toastr.error(res.message || 'Failed to update rate card.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error('Error updating rate card.');
        }
      });
    } else {
      this.rateCardService.insert(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.isSuccess) {
            this.toastr.success('Amazon DSP RateCard created successfully.');
            this.goBack();
          } else {
            this.toastr.error(res.message || 'Failed to create rate card.');
          }
        },
        error: (err) => {
          this.isSaving = false;
          console.error(err);
          this.toastr.error('Error creating rate card.');
        }
      });
    }
  }

  resetForm(): void {
    this.submitted = false;
    this.rateCardForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/amazon_dsp_rate_card_list']);
  }
}
