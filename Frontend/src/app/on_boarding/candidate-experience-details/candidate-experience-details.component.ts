import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-candidate-experience-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './candidate-experience-details.component.html',
  styleUrl: './candidate-experience-details.component.scss'
})
export class CandidateExperienceDetailsComponent implements OnInit {

  CandidateExperienceDetailsForm!: FormGroup;
  experienceList: any[] = [];
  
  pk_cpjobid: number | null = null;
  
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  showError = false;
  isEdit = false;
  existingFileName: string = '';
  existingOfferLetterName: string = '';
  candidateKey: string = '';

  constructor(
    private fb: FormBuilder,
    private candidateExperienceService: CandidateExperienceDetailService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.CandidateExperienceDetailsForm = this.fb.group({
      pk_cpjobid: [null],
      compname: ['', Validators.required],
      fromdate: ['', Validators.required],
      todate: ['', Validators.required],
      ctc: [null, Validators.required],
      department: [''],
      designation: [''],
      profile: [''],
      leavingreason: [''],
      documentupload: [null],
      offerletter: [null]
    });

    //  Guard already validated - just get key and load data
    this.candidateKey = sessionStorage.getItem('candidateKey') || '';
    this.loadCandidateExperienceList();
  }

  loadCandidateExperienceList(): void {
    this.candidateExperienceService.getCandidateExperienceList(
      this.pageIndex - 1, 
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.experienceList = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.experienceList = [];
          this.totalItems = 0;
        }
      },
      error: (error) => {
        this.experienceList = [];
        this.totalItems = 0;
        this.toastrService.error('Failed to load experience list');
      }
    });
  }

  getCandidateExperienceDetailsById(pk_cpjobid: number): void {
    this.candidateExperienceService.getCandidateExperienceById(pk_cpjobid).subscribe({
      next: (res) => {        
        if (res.isSuccess && res.data) {
          const fromdate = this.formatDate(res.data.fromdate);
          const todate = this.formatDate(res.data.todate);
          
          this.CandidateExperienceDetailsForm.patchValue({
            pk_cpjobid: res.data.pk_cpjobid,
            compname: res.data.compname,
            designation: res.data.designation,
            department: res.data.department,
            fromdate: fromdate,
            todate: todate,
            ctc: res.data.ctc,
            profile: res.data.profile,
            leavingreason: res.data.leavingreason
          });
          
          this.existingFileName = res.data.documentupload || '';
          this.existingOfferLetterName = res.data.offerletter || '';
          this.isEdit = true;
        } else {
          this.toastrService.error(res.message || "Failed to load experience details.");
        }
      },
      error: (error) => {
        this.toastrService.error(error.error?.message || "Error loading experience data.");
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      return dateString.split('T')[0];
    }
    
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  onOfferLetterSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastrService.error('Offer letter file size should not exceed 5MB', 'Error');
        event.target.value = '';
        return;
      }
      
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        this.toastrService.error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed', 'Error');
        event.target.value = '';
        return;
      }
      
      this.CandidateExperienceDetailsForm.patchValue({ offerletter: file });
    }
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastrService.error('File size should not exceed 5MB', 'Error');
        event.target.value = '';
        return;
      }
      
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        this.toastrService.error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed', 'Error');
        event.target.value = '';
        return;
      }
      
      this.CandidateExperienceDetailsForm.patchValue({ documentupload: file });
    }
  }

  submitForm(): void {
    if (this.CandidateExperienceDetailsForm.invalid) {
      this.showError = true;
    //   this.toastrService.warning('Please fill all required fields', 'Warning');
      return;
    }

    const formData = new FormData();

    Object.keys(this.CandidateExperienceDetailsForm.value).forEach(key => {
      const value = this.CandidateExperienceDetailsForm.value[key];
      if (value != null && key !== 'documentupload' && key !== 'offerletter') {
        formData.append(key, value.toString());
      }
    });

    const fileInput = this.CandidateExperienceDetailsForm.get('documentupload')?.value;
    if (fileInput instanceof File) {
      formData.append('UploadFile', fileInput);
    }

    const offerLetterInput = this.CandidateExperienceDetailsForm.get('offerletter')?.value;
    if (offerLetterInput instanceof File) {
      formData.append('UploadOfferLetter', offerLetterInput);
    }

    if (this.isEdit && this.pk_cpjobid) {
      formData.append('pk_cpjobid', this.pk_cpjobid.toString());
      
      this.candidateExperienceService.update_CandidateExperienceDetails(formData).subscribe({
        next: (res) => {      
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Experience details updated successfully!');
            this.resetForm();
            this.loadCandidateExperienceList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to update experience details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while updating!');
        }
      });
    } else {
      this.candidateExperienceService.add_CandidateExperienceDetails(formData).subscribe({
        next: (res) => {         
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Experience details added successfully!');
            this.resetForm();
            this.loadCandidateExperienceList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to add experience details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while adding!');
        }
      });
    }
  }

  isUpdate(pk_cpjobid: number): void {
    this.pk_cpjobid = pk_cpjobid;
    this.getCandidateExperienceDetailsById(this.pk_cpjobid);
    this.isEdit = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCandidateExperienceDetails(pk_cpjobid: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.candidateExperienceService.delete_CandidateExperience(pk_cpjobid).subscribe({
        next: (response: any) => {          
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Record deleted successfully');
            this.loadCandidateExperienceList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
            
            if (this.pk_cpjobid === pk_cpjobid) {
              this.resetForm();
            }
          } else {
            this.toastrService.error(response.message || 'Failed to delete record');
          }
        },
        error: (error) => {
          this.toastrService.error(error.error?.message || 'An error occurred while deleting the record', 'Error');
        }
      });
    }
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadCandidateExperienceList();
  }

  resetForm(): void {
    this.CandidateExperienceDetailsForm.reset();
    this.showError = false;
    this.isEdit = false;
    this.pk_cpjobid = null;
    this.existingFileName = '';
    this.existingOfferLetterName = '';
    
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    const offerLetterInput = document.getElementById('offerletter') as HTMLInputElement;
    if (offerLetterInput) {
      offerLetterInput.value = '';
    }
  }

  getFileUrl(fileName: string): string {
    if (!fileName || !this.candidateKey) return '';
    return `${environment.baseURL1}/CandidateExperienceDetails/documents/${fileName}?key=${this.candidateKey}`;
  }
}