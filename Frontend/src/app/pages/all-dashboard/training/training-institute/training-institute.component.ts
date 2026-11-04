import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';

import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { TrainingInstituteService } from '../services/training-institute.service';


@Component({
  selector: 'app-training-institute',
  standalone: true,
  imports: [FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule],
  templateUrl: './training-institute.component.html',
  styleUrl: './training-institute.component.scss'
})
export class TrainingInstituteComponent {


  ngxUILoaderService = inject(NgxUiLoaderService);

  //  Modelist: { name: string; value: string }[] = [];

  typeList = [
    { value: 'I', name: 'Institute' },
    { value: 'C', name: 'Consultancy' }
  ];


  form!: FormGroup;
  submitted = false;
  showError = false;
  pk_instituteId!: number
  isEditMode: boolean = false;

  route = inject(ActivatedRoute);


  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService,
    private httpservice: TrainingInstituteService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      description: ['', Validators.required],
      type: [null, Validators.required],
      remarks: [''],
      active: [false],

    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_instituteId');
      if (id) {
        this.pk_instituteId = +this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getById(this.pk_instituteId);
      }
    });
    
  }





  getById(pk_instituteId: number) {
    this.ngxUILoaderService.start();
    this.httpservice.getTrainingInstituteById(pk_instituteId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          const data = response.data;


          this.form.patchValue({
            type: data.type,
            description: data.description,
            remarks: data.remarks,
            active: data.active
          });
        } else {
          console.error('Failed to fetch Travel Rate detail:', response.message);
        }
        this.ngxUILoaderService.stop();
      },
      (error) => {
        console.error('Error fetching Travel Rate detail:', error);
        this.ngxUILoaderService.stop();
      }
    );
  }




  submit() {

    if (this.form.invalid) {
      this.showError = true;
      this.submitted = true;

      return;
    }

    const formValues = this.form.value;


    // Ensure only 'orderno' is converted to number
    const payload = {


      ...formValues,
      pk_instituteId: this.pk_instituteId || 0, // Important for update



    };
     this.ngxUILoaderService.start(); 
    if (this.isEditMode && this.pk_instituteId) {
    this.httpservice.update_TrainingInstitute(payload).subscribe(
      response => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Details updated successfully!');
          this.router.navigate(['/dash/training/trainingdashboard/TrainingInstitute_list']);
        } else {
          this.toastrService.error(response.message);
        }
        this.ngxUILoaderService.stop(); // Stop loader after update
      },
      error => {
        this.toastrService.error('Update failed. Please try again.');
        this.ngxUILoaderService.stop(); // Stop loader on error
      }
    );
  }  else {
    this.httpservice.add_TrainingInstitute(payload).subscribe(
      response => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Detail saved successfully!');
          this.router.navigate(['/dash/training/trainingdashboard/TrainingInstitute_list']);
        } else {
          this.toastrService.error(response.message);
        }
        this.ngxUILoaderService.stop(); // Stop loader after insert
      },
      error => {
        this.toastrService.error('Save failed. Please try again.');
        this.ngxUILoaderService.stop(); // Stop loader on error
      }
    );
  }


  }


  resetForm(): void {
    this.form.reset();
  }
  // getTravelModelist(fieldName: string) {
  //     this.ngxUILoaderService.start();
  //     this.httpservice.getTravelMode(fieldName).subscribe({
  //       next: (res) => {
  //         if (res?.isSuccess && res.data?.length) {
  //           console.log(res.data)
  //           this.Modelist= res.data.map((Emp: any) => ({
  //             name: Emp.name,
  //             value: Emp.value
  //           }));
  //         } else {
  //           this.toastrService.error("Failed to load Mode list.");
  //         }
  //         this.ngxUILoaderService.stop();
  //       },
  //       error: (err) => {
  //         console.error("Error fetching Mode list:", err);
  //         this.toastrService.error("Error fetching Mode list. Please try again.");
  //         this.ngxUILoaderService.stop();
  //       }
  //     });
  //   }

  checkDuplicate(description: string): void {
const fieldName = 'TrainingInstitute'; 
const fieldValue = description; 
const generalId = this.pk_instituteId; 

this.httpservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
  next: (response) => {
    if (response && response.isSuccess === false) {
      this.form.get('description')?.setErrors({ duplicate: response.message });
    } else {
      this.form.get('description')?.setErrors(null);
    }
  },
  error: (err) => {
    console.error('Duplicate Check API Error:', err);
    this.form.get('description')?.setErrors({ duplicate: 'Error checking FunctionMaster availability.' });
  }
});
}

}
