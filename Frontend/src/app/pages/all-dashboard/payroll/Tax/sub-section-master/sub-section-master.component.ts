import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SubsectionService } from '../../services/subsection.service';

@Component({
  selector: 'app-sub-section-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './sub-section-master.component.html',
  styleUrl: './sub-section-master.component.scss'
})
export class SubSectionMasterComponent {
  SubSectionForm!: FormGroup;
  submitted = false;
  showError = false;
  subsectionId: string = '';
  isEditMode: boolean = false;
  Description: { name: string, value: string }[] = [];
  route = inject(ActivatedRoute); 
  ngxUiLoaderService = inject(NgxUiLoaderService);
;

 

  constructor(
    private fb: FormBuilder,
    private subsectionService: SubsectionService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}
  
  ngOnInit(): void {
    this.SubSectionForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(100)]],
      fk_secid: [null, Validators.required],
      maxLimit: ['', Validators.required],
      active: [false]
    });

    this.getUnderSectionList('Description');
    this.SubSectionForm.get('description')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkOperationalAvailability(value);
      }
    });


    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_subsecid');
      if (id) {
        this.subsectionId = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getSubsectionById(this.subsectionId);
      }
    });

    
  }

  checkOperationalAvailability(description: string): void {
    const fieldName = 'SubSecDescription';
    const fieldValue = description;
    const generalId = this.subsectionId || '';

    this.subsectionService.checkDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.SubSectionForm.get('description')?.setErrors({ duplicate: response.message });
        } else {
          this.SubSectionForm.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.SubSectionForm.get('description')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }


  getUnderSectionList(fieldName: string) {
   
    this.ngxUiLoaderService.start();
    this.subsectionService.getDescription(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Description = res.data.map((underSection: any) => ({
            name: underSection.name,
            value: underSection.value
          }));
        } else {
          this.toastrService.error("Failed to load Under Section list.");
        }
        this.ngxUiLoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching Under Section list:", err);
        this.toastrService.error("Error fetching Under Section list.");
        this.ngxUiLoaderService.stop();
      }
    });
  }

  getSubsectionById(id: string) {
    this.subsectionService.getSubsectionById(id).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.SubSectionForm.patchValue({
            description: response.data.description,
            fk_secid: response.data.fk_secid, // Assuming fk_secid maps to underSection
            maxLimit: response.data.maxlimit,
            active: response.data.active
          });
        } else {
          console.error('Failed to fetch Subsection:', response.message);
          this.toastrService.error(response.message || 'Failed to load subsection data');
        }
      },
      (error) => {
        console.error('Error fetching Subsection:', error);
        this.toastrService.error('Error loading subsection data');
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.SubSectionForm.invalid) {
      this.showError = true;
      return;
    }
    const formData = this.SubSectionForm.value;
    if (this.isEditMode && this.subsectionId) {
      debugger;
      this.subsectionService.updateSubsection({pk_subsecid: this.subsectionId, ...formData }).subscribe(
        response => {
          
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Subsection updated successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to update subsection');
          }
        },
        error => {
          console.error('Error updating subsection:', error);
          this.toastrService.error('Error updating subsection data');
        }
      );
    } else {
      this.subsectionService.addSubsectionMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Subsection created successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to create subsection');
          }
        },
        error => {
          console.error('Error creating subsection:', error);
          this.toastrService.error('Error saving subsection data');
        }
      );
    }
  }

  view(): void {
    this.router.navigateByUrl("/dash/payroll/payrolldashboard/subSectionMaster_list");
  }

  resetForm(): void {
    this.SubSectionForm.reset({
      description: '',
      fk_secid: '',
      maxLimit: '',
      active: false
    });
    this.showError = false;
    this.submitted = false;
  }


}



