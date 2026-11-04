import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { report } from 'process';
import { CandidateRefAndMedService } from '../../../RecruitServices/candidate-ref-and-med.service';

@Component({
  selector: 'app-candidate-medical-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule,
    NgxPaginationModule,
  ],
  templateUrl: './candidate-medical-details.component.html',
  styleUrl: './candidate-medical-details.component.scss',
})
export class CandidateMedicalDetailsComponent {
  medicalForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  showError = false;
  pk_mtrnid!: string;

  CandidateName: { name: string; value: string }[] = [];
  toastrService = inject(ToastrService);

  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private medService: CandidateRefAndMedService,
    private toastr: ToastrService,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_mtrnid');
      if (id) {
        this.pk_mtrnid = this.encryptionService.decryptText(id);
        this.isEditMode = true;
      }
    });

    this.getCandidateList('CandidateName');

    if (this.pk_mtrnid && this.pk_mtrnid !== 'undefined') {
      this.loadFunctionalMasterData(this.pk_mtrnid);
    } else {
      this.isEditMode = false;
    }
    
    this.medicalForm.get('pk_recId')?.valueChanges.subscribe((selectedId) => {
      if (selectedId) {
        this.getMedicalDetailsById(selectedId);
      }
    });
    
  }

  initializeForm(): void {
    this.medicalForm = this.fb.group({
      pk_recId: [''],
      father_name: [''],
      dateofbirth: [''],
      email: [''],
      mobile: [''],
      phone: [''],
      corresContactNo: [''],
      permanentContactNo: [''],
      corresAddress: [''],
      permanentAddress: [''],
      description: ['', Validators.required],
      dated: ['', Validators.required],
      report: ['', Validators.required],
    });
  }

     currentStep: number = 1;

 goToCandidateMedicalDetails() {
          this.router.navigate([`dash/recruitment/recruitmentdashboard/CandidateRefrenceDetails_list`]);
          }

  getCandidateList(fieldName: string) {
    this.medService.getdropDawn(fieldName).subscribe({
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
    this.medService.getAllCandidatesByid(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.medicalForm.patchValue(
            {
              pk_recId: res.data.pk_recId,
              fk_jobId: res.data.fk_jobId,
              candidate_name: res.data.candidate_name,
              father_name: res.data.father_name,
              gender: res.data.gender,
              phone: res.data.phone,
              mobile: res.data.mobile,
              email: res.data.email,
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



loadFunctionalMasterData(pk_mtrnid: string) {
  debugger;
  this.medService.getMedicalById(pk_mtrnid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Project Data:", res.data);  // Debugging ke liye

        this.medicalForm.patchValue({



          pk_recId: res.data.fk_recId,
              fk_jobId: res.data.fk_jobId,
              candidate_name: res.data.candidate_name,
              father_name: res.data.father_name,
              gender: res.data.gender,
              phone: res.data.phone,
              mobile: res.data.mobile,
              email: res.data.email,
          description: res.data.description,
          dated:this.formatDateForInput(res.data.dated),
          report: res.data.report,  
        });
        this.isEditMode = true;
      } else {
        this.toastrService.error("Failed to load Candidate Medical details.");
      }
    },
    error: () => {
      this.toastrService.error("Error loading Candidate Medical data.");
    }
  });
}


  onSubmit(): void {
  this.submitted = true;

  if (this.medicalForm.invalid) {
    this.showError = true;
    return;
  }
  const candidate_MedicalDetails = {
    ...this.medicalForm.value,
   pk_mtrnid: this.isEditMode ? Number(this.pk_mtrnid) : 0,
    fk_recId: this.medicalForm.get('pk_recId')?.value // ✅ Map pk_recId to fk_recId here
  };
  const payload = {
    candidate_MedicalDetails: candidate_MedicalDetails,
  };
  const request$ = this.isEditMode
    ? this.medService.updateMedical(payload)
    : this.medService.insertMedical(payload);

  request$.subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message || 'Saved successfully');
        this.router.navigate(['/dash/recruitment/recruitmentdashboard/CandidateMedicalDetails_list']);
      } else {
        this.toastr.error(res.message || 'Operation failed');
      }
    },
    error: () => {
      this.toastr.error('Something went wrong');
    },
  });
}




  resetForm(): void {
    this.medicalForm.reset();
    this.submitted = false;
    this.showError = false;
  }
}
