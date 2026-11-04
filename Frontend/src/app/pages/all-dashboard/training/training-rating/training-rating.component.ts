import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { TrainingRatingService } from '../services/training-rating.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-training-rating',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './training-rating.component.html',
  styleUrl: './training-rating.component.scss',
})
export class TrainingRatingComponent {
  TrainingForm!: FormGroup;
  submitted = false;
  Isedit = false;
  showError = false;
  pk_ratingId!: number;

  constructor(
    private fb: FormBuilder,
    private httpservice: TrainingRatingService,
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.TrainingForm = this.fb.group({
      description: ['',Validators.required],
      active: [false],
      remarks: [''],
    });

    this.pk_ratingId = +this.encryption.decryptText(this.route.snapshot.params['pk_ratingId']);
    if (this.pk_ratingId) {
      this.Patchform(this.pk_ratingId);
      this.Isedit = true;
    }
  }

  checkDescriptionAvailability(description: string): void {
    const fieldName = 'TrainingDescription'; // Field name to check
    const fieldValue = description; // Value to check
    const generalId = this.pk_ratingId; // ID for update, empty for insert

    this.httpservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.TrainingForm.get('description')?.setErrors({ duplicate: response.message });
        } else {
          this.TrainingForm.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Check Duplicate API Error:', err);
        this.toastrService.error('Error checking description availability.');
      },
    });
  }
  // ➕ Insert or ✏️ Update Form Submit
  submitForm(): void {
    if (this.TrainingForm.invalid) {
      this.showError = true;
      return;
    }

    const formData = { ...this.TrainingForm.value };

    if (this.pk_ratingId) {
      const updateData = { ...formData, pk_ratingId: this.pk_ratingId };
      this.httpservice.update_Training(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Detail updated successfully!');
            this.router.navigate(['/dash/training/trainingdashboard/TrainingRating_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to update detail.');
          }
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
        },
      });
    } else {
      this.httpservice.insert_Training(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
           
            this.toastrService.success(res.message || 'Detail added successfully!');
            this.router.navigate(['/dash/training/trainingdashboard/TrainingRating_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to add detail.');
          }
        },
        error: (err) => {
          console.error('Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
        },
      });
    }
  }

  // 🧠 Patch Data on Edit
  Patchform(pk_ratingId: number) {
    this.httpservice.getById_Training(pk_ratingId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.TrainingForm.patchValue({
            description: res.data.description,
            active: res.data.active === 'True' || res.data.active === true,  // 👈 Convert to boolean
            remarks: res.data.remarks,
          });
          this.Isedit = true;
        } else {
          this.toastrService.error('Failed to load details.');
        }
      },
      error: () => {
        this.toastrService.error('Error loading data.');
      },
    });
  }

  // 🔁 You can optionally implement checkDuplicateDescription() later like in RoleMasterComponent
}
