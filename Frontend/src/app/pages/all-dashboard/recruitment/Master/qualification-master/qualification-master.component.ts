import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { QualificationMasterService } from '../../RecruitServices/qualification-master.service';

@Component({
  selector: 'app-qualification-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, RouterLink],
  templateUrl: './qualification-master.component.html',
  styleUrl: './qualification-master.component.scss'
})
export class QualificationMasterComponent {
  qualificationForm!: FormGroup;
  submitted = false;
  showerror = false;
  id: number | null = null;
  isEditMode: boolean = false;
  route = inject(ActivatedRoute);
  
  selects = [
    { name: 'Degree', value: 'Degree' },
    { name: 'Diploma', value: 'Diploma' },
    { name: 'Certificate', value: 'Certificate' }
  ];

  constructor(
    private fb: FormBuilder,
    private qualificationMasterService: QualificationMasterService,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.qualificationForm = this.fb.group({
      type: ['', Validators.required],
      qualification: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(100)]],
      active: [false]
    });

    this.qualificationForm.get('qualification')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkQualificationAvailability(value);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_qualiId');
      if (id) {
        this.id = +this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getQualificationById(this.id);
      }
    });
  }

  checkQualificationAvailability(qualification: string): void {
    const fieldName = 'Qualification';
    const fieldValue = qualification;
    const generalId = this.id ? this.id.toString() : '';

    this.qualificationMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.qualificationForm.get('qualification')?.setErrors({ duplicate: response.message });
        } else {
          this.qualificationForm.get('qualification')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.qualificationForm.get('qualification')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  getQualificationById(pk_qualiId: number) {
    this.qualificationMasterService.getQualificationById(pk_qualiId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.qualificationForm.patchValue({
            type: response.data.type,
            qualification: response.data.qualification,
            description: response.data.description,
            active: response.data.active
          });
        } else {
          console.error('Failed to fetch Qualification:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching Qualification:', error);
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.qualificationForm.invalid) {
      this.showerror = true;
      return;
    }
    const formData = {
      ...this.qualificationForm.value,
      active: !!this.qualificationForm.value.active
    };
    if (this.isEditMode && this.id) {
      this.qualificationMasterService.updateQualification({pk_qualiId: this.id, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'QualificationMaster updated successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/qualification-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    } else {
      this.qualificationMasterService.add_QualificationMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'QualificationMaster created successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/qualification-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    }
  }

  resetForm(): void {
    this.qualificationForm.reset({ isActive: true });
    this.submitted = false;
    this.showerror = false;
    this.id = null;
    this.isEditMode = false;
  }
}



