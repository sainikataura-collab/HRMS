import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CandidateQualificationService } from '../services/candidate-qualification.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-candidate-qualification-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './candidate-qualification-details.component.html',
  styleUrl: './candidate-qualification-details.component.scss'
})
export class CandidateQualificationDetailsComponent implements OnInit {

  CandidateQualificationForm!: FormGroup;
  qualificationList: any[] = [];
  
  pk_cqualid: number | null = null;
  
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  showError = false;
  isEdit = false;
  existingFileName: string = '';
  candidateKey: string = '';

  constructor(
    private fb: FormBuilder,
    private candidateQualificationService: CandidateQualificationService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.CandidateQualificationForm = this.fb.group({
      pk_cqualid: [null],
      qualification: ['', Validators.required],
      subject: ['', Validators.required],
      institute: ['', Validators.required],
      passyear: ['', Validators.required],
      marks: [null, Validators.required],
      division: ['', Validators.required],
      documentupload: [null]
    });

    this.candidateKey = sessionStorage.getItem('candidateKey') || '';
    this.loadCandidateQualificationList();
  }

  loadCandidateQualificationList(): void {
    this.candidateQualificationService.getCandidateQualificationList(
      this.pageIndex - 1, 
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.qualificationList = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.qualificationList = [];
          this.totalItems = 0;
        }
      },
      error: (error) => {
        this.qualificationList = [];
        this.totalItems = 0;
        this.toastrService.error('Failed to load qualification list');
      }
    });
  }

  getCandidateQualificationDetailsById(pk_cqualid: number): void {
    this.candidateQualificationService.getCandidateQualificationById(pk_cqualid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.CandidateQualificationForm.patchValue({
            pk_cqualid: res.data.pk_cqualid,
            qualification: res.data.qualification,
            subject: res.data.subject,
            institute: res.data.institute,
            passyear: res.data.passyear,
            marks: res.data.marks,
            division: res.data.division
          });
          
          this.existingFileName = res.data.documentupload || '';
          this.isEdit = true;
        } else {
          this.toastrService.error(res.message || "Failed to load qualification details.");
        }
      },
      error: (error) => {
        this.toastrService.error(error.error?.message || "Error loading qualification data.");
      }
    });
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
      
      this.CandidateQualificationForm.patchValue({ documentupload: file });
    }
  }

  submitForm(): void {
    if (this.CandidateQualificationForm.invalid) {
      this.showError = true;
      // this.toastrService.warning('Please fill all required fields', 'Warning');
      return;
    }

    const formData = new FormData();

    Object.keys(this.CandidateQualificationForm.value).forEach(key => {
      const value = this.CandidateQualificationForm.value[key];
      if (value != null && key !== 'documentupload') {
        formData.append(key, value.toString());
      }
    });

    const fileInput = this.CandidateQualificationForm.get('documentupload')?.value;
    if (fileInput instanceof File) {
      formData.append('UploadFile', fileInput);
    }

    if (this.isEdit && this.pk_cqualid) {
      formData.append('pk_cqualid', this.pk_cqualid.toString());
      
      this.candidateQualificationService.update_CandidateQualificationDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Qualification details updated successfully!');
            this.resetForm();
            this.loadCandidateQualificationList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to update qualification details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while updating!');
        }
      });
    } else {
      this.candidateQualificationService.add_CandidateQualificationDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Qualification details added successfully!');
            this.resetForm();
            this.loadCandidateQualificationList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to add qualification details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while adding!');
        }
      });
    }
  }

  isUpdate(pk_cqualid: number): void {
    this.pk_cqualid = pk_cqualid;
    this.getCandidateQualificationDetailsById(this.pk_cqualid);
    this.isEdit = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCandidateQualificationDetails(pk_cqualid: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.candidateQualificationService.delete_CandidateQualification(pk_cqualid).subscribe({
        next: (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Record deleted successfully');
            this.loadCandidateQualificationList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
            if (this.pk_cqualid === pk_cqualid) {
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
    this.loadCandidateQualificationList();
  }

  resetForm(): void {
    this.CandidateQualificationForm.reset();
    this.showError = false;
    this.isEdit = false;
    this.pk_cqualid = null;
    this.existingFileName = '';
    
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileUrl(fileName: string): string {
    if (!fileName || !this.candidateKey) return '';
    return `${environment.baseURL1}/CandidateQualificationDetails/documents/${fileName}?key=${this.candidateKey}`;
  }
}