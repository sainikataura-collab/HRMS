import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { SpecializationMasterService } from '../../RecruitServices/specialization-master.service';


@Component({
  selector: 'app-specialization-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, RouterLink],
  templateUrl: './specialization-master.component.html',
  styleUrl: './specialization-master.component.scss'
})
export class SpecializationMasterComponent {
  specializationForm!: FormGroup;
  submitted = false;
  showerror = false;
  specializationId: string = '';
  isEditMode: boolean = false;
  route = inject(ActivatedRoute);
  
  selects = [
    { name: 'Technical', value: 'Technical' },
    { name: 'Certification', value: 'Certification' }
  ];

  constructor(
    private fb: FormBuilder,
    private specializationMasterService: SpecializationMasterService,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.specializationForm = this.fb.group({
      type: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.maxLength(150)]],
      isActive: [false]
    });

    this.specializationForm.get('name')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkSpecializationAvailability(value);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_specializationId');
      if (id) {
        this.specializationId = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getSpecializationById(this.specializationId);
      }
    });
  }

  checkSpecializationAvailability(name: string): void {
    const fieldName = 'Specialization';
    const fieldValue = name;
    const generalId = this.specializationId || '';

    this.specializationMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.specializationForm.get('name')?.setErrors({ duplicate: response.message });
        } else {
          this.specializationForm.get('name')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.specializationForm.get('name')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  getSpecializationById(pk_specializationId: string) {
    this.specializationMasterService.getSpecializationById(pk_specializationId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.specializationForm.patchValue({
            type: response.data.type,
            name: response.data.name,
            description: response.data.description,
            isActive: response.data.isActive
          });
        } else {
          console.error('Failed to fetch Specialization:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching Specialization:', error);
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.specializationForm.invalid) {
      this.showerror = true;
      return;
    }
    const formData = {
      ...this.specializationForm.value,
      isActive: !!this.specializationForm.value.isActive
    };
    if (this.isEditMode && this.specializationId) {
      this.specializationMasterService.updateSpecialization({ pk_specializationId: this.specializationId, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'SpecializationMaster updated successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/specialization-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    } else {
      this.specializationMasterService.add_SpecializationMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'SpecializationMaster created successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/specialization-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    }
  }

  resetForm(): void {
    this.specializationForm.reset();
  }
}
