import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { TrainingTypeService } from '../services/training-type.service';



@Component({
  selector: 'app-training-type-master',
  standalone: true,
 imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule, RouterLink],
  templateUrl: './training-type-master.component.html',
  styleUrl: './training-type-master.component.scss'
})
export class TrainingTypeMasterComponent {
  TrainingMaster!: FormGroup;
  submitted = false;
  showError = false;
  pk_typeId!: number;
  Isedit = false;


  constructor(private fb: FormBuilder, private trainingTypeService: TrainingTypeService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, private encryptionService: EncryptionService) { }


  ngOnInit(): void {

    this.TrainingMaster = this.fb.group({
      remarks: ['', [Validators.required]],
      description: ['', [Validators.required]],
      active:[false]
    });


    this.pk_typeId =+ this.encryptionService.decryptText(this.route.snapshot.params['pk_typeId'].toString());

    if (this.pk_typeId && this.pk_typeId !== 0) {
      this.loadTrainingMasterData(this.pk_typeId);
      this.Isedit = true;
    }
  }

  checkDuplicate(description: string): void {
  const fieldName = 'TrainingType';
  const fieldValue = description;
  const generalId = this.pk_typeId;

  this.trainingTypeService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.TrainingMaster.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.TrainingMaster.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.TrainingMaster.get('description')?.setErrors({ duplicate: 'Error checking TrainingMaster availability.' });
    }
  });
  }
  onSubmit() {

    if (this.TrainingMaster.invalid) {
      this.showError = true;
      return;
    }

    const data = {
      ...this.TrainingMaster.value,
    };


    if (this.Isedit) {
      const data = {

        ...this.TrainingMaster.value,
         pk_typeId: this.pk_typeId

    };

      this.trainingTypeService.update_trainingType(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {

            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/training/trainingdashboard/training_type_master_list");
          }
          else {
            this.toastrService.error(result.message);
          }
        },

        error: () => {
          // Error handling in case of a failure during form submission
          this.toastrService.error('An error occurred during form submission');
        }
      })
    }

    else {
      this.trainingTypeService.add_trainingType(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            
              this.router.navigateByUrl("/dash/training/trainingdashboard/training_type_master_list");

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

  loadTrainingMasterData(pk_typeId: number) {
    this.trainingTypeService.getById_trainingType(pk_typeId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {

          this.TrainingMaster.patchValue({
            remarks: res.data.remarks,
            active: res.data.active,
            description: res.data.description,
          });


          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Travel Mode Master details.");
        }
      },

      error: () => {
        this.toastrService.error("Error loading Travel Mode Master data.");
      }
    });
  }

  resetForm(): void {
    this.TrainingMaster.reset();
  }

}
