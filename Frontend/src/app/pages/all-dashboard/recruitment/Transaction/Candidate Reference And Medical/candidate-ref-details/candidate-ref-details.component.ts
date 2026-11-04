import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule,ReactiveFormsModule,FormGroup,FormBuilder,Validators,} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { CandidateRefAndMedService } from '../../../RecruitServices/candidate-ref-and-med.service';

@Component({
  selector: 'app-candidate-ref-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  templateUrl: './candidate-ref-details.component.html',
  styleUrl: './candidate-ref-details.component.scss',
})
export class CandidateRefDetailsComponent {
  CandidateReferenceForm!: FormGroup;
  selectedFile: File | null = null;
  oldFile: string = '';
  FileName: string = '';
  isEditMode = false;
  pk_rtrnid = 0;
  ImageUrl = '';
  submitted = false;
  showError = false;
   currentStep: number = 1;

  CandidateName: { name: string; value: string }[] = [];
  toastrService = inject(ToastrService);

  router = inject(Router);
  route = inject(ActivatedRoute);

  

  constructor(
    private fb: FormBuilder,
    private refService: CandidateRefAndMedService,
    private toastr: ToastrService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.initForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_rtrnid');
      if (id) {
        this.pk_rtrnid = +this.encryptionService.decryptText(id);
        this.isEditMode = true;
        this.loadRefById(this.pk_rtrnid);
      }
    });

    this.getCandidateList('CandidateName');

    this.CandidateReferenceForm.get('pk_recId')?.valueChanges.subscribe(
      (selectedId) => {
        if (selectedId) {
          this.getMedicalDetailsById(selectedId);
        }
      }
    );
  }


  initForm() {
    this.CandidateReferenceForm = this.fb.group({
      pk_recId: [''],
      father_name: [''],
      dateofbirth: [''],
      Email: [''],
      Mobile: [''],
      Phone: [''],
      corresContactNo: [''],
      permanentContactNo: [''],
      corresAddress: [''],
      permanentAddress: [''],

      refname: ['', Validators.required],
      compname: ['', Validators.required],
      designation: ['', Validators.required],
      email: ['', Validators.required],
      mobile: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      filepath: [''],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.FileName = '';
      this.ImageUrl = '';
    }
  }

   goToCandidateMedicalDetails() {
          this.router.navigate([`/dash/recruitment/recruitmentdashboard/CandidateMedicalDetails`]);
          }

          goToCandidateRefDetails(){
          this.router.navigate([`/dash/recruitment/recruitmentdashboard/CandidateRefrenceDetails`]);
          }
  getCandidateList(fieldName: string) {
    this.refService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.CandidateName = res.data.map((pk_recId: any) => ({
            name: pk_recId.name,
            value: pk_recId.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }

  getMedicalDetailsById(id: string): void {
    this.refService.getAllCandidatesByid(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.CandidateReferenceForm.patchValue(
            {
              pk_recId: res.data.pk_recId,
              fk_jobId: res.data.fk_jobId,
              candidate_name: res.data.candidate_name,
              father_name: res.data.father_name,
              gender: res.data.gender,
              Phone: res.data.phone,
              Mobile: res.data.mobile,
              Email: res.data.email,
              dateofbirth: this.formatDateForInput(res.data.dateofbirth),
              corresAddress: res.data.corresAddress,
              corresContactNo: res.data.corresContactNo,
              permanentAddress: res.data.permanentAddress,
              permanentContactNo: res.data.permanentContactNo,
            },
            { emitEvent: false }
          ); // <-- Prevent infinite loop
          this.toastr.success('Data loaded successfully');
        } else {
          this.toastr.error(res.message || 'Failed to fetch data');
        }
      },
      error: () => {
        this.toastr.error('Error fetching data');
      },
    });
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;

    // Try parsing using built-in Date parser
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) return null;

    // Adjust for timezone offset if needed
    const offset = parsedDate.getTimezoneOffset();
    const localDate = new Date(parsedDate.getTime() - offset * 60000);

    // Return in YYYY-MM-DD format
    return localDate.toISOString().split('T')[0];
  }

  loadRefById(id: number) {
    this.refService.getReferenceById(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const data = res.data;
          this.CandidateReferenceForm.patchValue({
          
          
            pk_recId: res.data.fk_recId,
            fk_jobId: res.data.fk_jobId,
             
            refname: data.refname,
            compname: data.compname,
            designation: data.designation,
            email: data.email,
            mobile: data.mobile,
            phone: data.phone,
            address: data.address,
            filepath: data.filename,
          });
          this.oldFile = data.filename;
          this.FileName = data.filename;
          if (this.FileName) {
            this.refService.getImage(this.FileName).subscribe({
              next: (blob) => {
                this.ImageUrl = URL.createObjectURL(blob);
              },
              error: () => (this.ImageUrl = ''),
            });
          }
        } else {
          this.toastr.error(res.message || 'Failed to fetch data');
        }
      },
      error: () => this.toastr.error('Error fetching data'),
    });
  }



  // onSubmit(): void {
  //   this.submitted = true;

  //   if (this.CandidateReferenceForm.invalid) {
  //     this.showError = true;
  //     return;
  //   }

  //   const formValues = this.CandidateReferenceForm.value;
  //   const formData = new FormData();

  //   const prefix = 'CandidateReferenceDetails.';

  //   // Append form fields with prefix
  //   formData.append(
  //     `${prefix}pk_rtrnid`,
  //     this.isEditMode ? this.pk_rtrnid.toString() : ''
  //   );
  //   formData.append(
  //     `${prefix}fk_recId`,
  //     this.CandidateReferenceForm.get('pk_recId')?.value
  //   );
  //   formData.append(`${prefix}refname`, formValues.refname);
  //   formData.append(`${prefix}compname`, formValues.compname);
  //   formData.append(`${prefix}designation`, formValues.designation);
  //   formData.append(`${prefix}email`, formValues.email);
  //   formData.append(`${prefix}mobile`, formValues.mobile || '');
  //   formData.append(`${prefix}phone`, formValues.phone || '');
  //   formData.append(`${prefix}address`, formValues.address || '');
  //   formData.append(`${prefix}fk_recId`, formValues.fk_recId || '');

  //   // Handle file upload
  //   if (this.selectedFile) {
  //     formData.append(
  //       `${prefix}filepath`,
  //       this.selectedFile,
  //       this.selectedFile.name
  //     );
  //     formData.append(`${prefix}FileContentType`, this.selectedFile.type);
  //   } else if (this.oldFile) {
  //     formData.append(`${prefix}attachment`, this.oldFile); // Use old file
  //     formData.append(`${prefix}filepath`, ''); // Keep filepath blank to avoid new upload
  //   }

  //   formData.append(`${prefix}filename`, ''); // Optional field

  //   // API call
  //   const request$ = this.isEditMode
  //     ? this.refService.updateReference(formData)
  //     : this.refService.insertReference(formData);

  //   request$.subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.toastr.success(res.message || 'Saved successfully!');
  //         this.router.navigate([
  //           '/dash/hr/hrdashboard/candidate-ref-details-list',
  //         ]);
  //       } else {
  //         this.toastr.error(res.message || 'Failed to save');
  //       }
  //     },
  //     error: () => {
  //       this.toastr.error('Server error while saving data');
  //     },
  //   });
  // }

  onSubmit(): void {
  this.submitted = true;

  if (this.CandidateReferenceForm.invalid) {
    this.showError = true;
    return;
  }

  const formValues = this.CandidateReferenceForm.value;
  const formData = new FormData();

  const prefix = 'CandidateReferenceDetails.';

  formData.append(
    `${prefix}pk_rtrnid`,
    this.isEditMode ? this.pk_rtrnid.toString() : ''
  );

  // ✅ Only this line for fk_recId — ensure pk_recId exists in the form
  // const pk_recId = this.CandidateReferenceForm.get('pk_recId')?.value;
  formData.append(`${prefix}fk_recId`,formValues.pk_recId || '');

  formData.append(`${prefix}refname`, formValues.refname);
  formData.append(`${prefix}compname`, formValues.compname);
  formData.append(`${prefix}designation`, formValues.designation);
  formData.append(`${prefix}email`, formValues.email);
  formData.append(`${prefix}mobile`, formValues.mobile || '');
  formData.append(`${prefix}phone`, formValues.phone || '');
  formData.append(`${prefix}address`, formValues.address || '');

  if (this.selectedFile) {
    formData.append(
      `${prefix}filepath`,
      this.selectedFile,
      this.selectedFile.name
    );
    formData.append(`${prefix}FileContentType`, this.selectedFile.type);
  } else if (this.oldFile) {
    formData.append(`${prefix}attachment`, this.oldFile);
    formData.append(`${prefix}filepath`, '');
  }

  formData.append(`${prefix}filename`, '');

  const request$ = this.isEditMode
    ? this.refService.updateReference(formData)
    : this.refService.insertReference(formData);

  request$.subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message || 'Saved successfully!');
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/CandidateRefrenceDetails_list']);
      } else {
        this.toastr.error(res.message || 'Failed to save');
      }
    },
    error: () => {
      this.toastr.error('Server error while saving data');
    },
  });
}


  resetForm() {
    this.CandidateReferenceForm.reset();
    this.submitted = false;
    this.showError = false;
  }
}
