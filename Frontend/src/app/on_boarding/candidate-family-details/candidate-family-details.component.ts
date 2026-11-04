import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidateFamilyDetailsService } from '../services/candidate-family-details.service';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';

@Component({
  selector: 'app-candidate-family-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './candidate-family-details.component.html',
  styleUrl: './candidate-family-details.component.scss'
})
export class CandidateFamilyDetailsComponent implements OnInit {

  CandidateFamilyDetailsForm!: FormGroup;
  familyList: any[] = [];
  
  pk_familyid: number | null = null;
  
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  showError = false;
  isEdit = false;
  candidateKey: string = '';

  // Dropdown options
  Relation = [
    { name: '-- Select Relation --', value: '' },
    { name: 'Brother', value: 'Brother' },
    { name: 'Sister', value: 'Sister' },
    { name: 'Father', value: 'Father' },
    { name: 'Mother', value: 'Mother' },
    { name: 'Daughter', value: 'Daughter' },
    { name: 'Son', value: 'Son' },
 
    { name: 'Spouse', value: 'Spouse' }
  ];

  constructor(
    private fb: FormBuilder,
    private candidateFamilyService: CandidateExperienceDetailService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.CandidateFamilyDetailsForm = this.fb.group({
      pk_familyid: [null],
      membername: ['', Validators.required],
      relation: ['', Validators.required],
      dob: ['', Validators.required],
      qualification: [''],
      occupation: ['']
    });

    // Get candidate key and load data
    this.candidateKey = sessionStorage.getItem('candidateKey') || '';
    this.loadCandidateFamilyList();
  }

  loadCandidateFamilyList(): void {
    this.candidateFamilyService.getCandidateFamilyList(
      this.pageIndex - 1, 
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.familyList = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.familyList = [];
          this.totalItems = 0;
        }
      },
      error: (error) => {
        this.familyList = [];
        this.totalItems = 0;
        this.toastrService.error('Failed to load family list');
      }
    });
  }

  getCandidateFamilyDetailsById(pk_familyid: number): void {
    this.candidateFamilyService.getCandidateFamilyById(pk_familyid).subscribe({
      next: (res) => {        
        if (res.isSuccess && res.data) {
          const dob = this.formatDate(res.data.dob);
          
          this.CandidateFamilyDetailsForm.patchValue({
            pk_familyid: res.data.pk_familyid,
            membername: res.data.membername,
            relation: res.data.relation,
            dob: dob,
            qualification: res.data.qualification,
            occupation: res.data.occupation
          });
          
          this.isEdit = true;
        } else {
          this.toastrService.error(res.message || "Failed to load family details.");
        }
      },
      error: (error) => {
        this.toastrService.error(error.error?.message || "Error loading family data.");
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

  submitForm(): void {
    if (this.CandidateFamilyDetailsForm.invalid) {
      this.showError = true;
      this.toastrService.warning('Please fill all required fields', 'Warning');
      return;
    }

    const formData = new FormData();

    Object.keys(this.CandidateFamilyDetailsForm.value).forEach(key => {
      const value = this.CandidateFamilyDetailsForm.value[key];
      if (value != null) {
        formData.append(key, value.toString());
      }
    });

    if (this.isEdit && this.pk_familyid) {
      formData.append('pk_familyid', this.pk_familyid.toString());
      
      this.candidateFamilyService.update_CandidateFamilyDetails(formData).subscribe({
        next: (res) => {      
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Family details updated successfully!');
            this.resetForm();
            this.loadCandidateFamilyList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to update family details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while updating!');
        }
      });
    } else {
      this.candidateFamilyService.add_CandidateFamilyDetails(formData).subscribe({
        next: (res) => {         
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Family details added successfully!');
            this.resetForm();
            this.loadCandidateFamilyList();
            window.dispatchEvent(new Event('refresh-onboarding-status'));
          } else {
            this.toastrService.error(res.message || 'Failed to add family details.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.error?.message || 'Something went wrong while adding!');
        }
      });
    }
  }

  isUpdate(pk_familyid: number): void {
    this.pk_familyid = pk_familyid;
    this.getCandidateFamilyDetailsById(this.pk_familyid);
    this.isEdit = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCandidateFamilyDetails(pk_familyid: number): void {
    if (confirm('Are you sure you want to delete this family member record?')) {
      this.candidateFamilyService.delete_CandidateFamily(pk_familyid).subscribe({
        next: (response: any) => {          
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Record deleted successfully');
            this.loadCandidateFamilyList();
           window.dispatchEvent(new Event('refresh-onboarding-status'));
            
            if (this.pk_familyid === pk_familyid) {
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
    this.loadCandidateFamilyList();
  }

  resetForm(): void {
    this.CandidateFamilyDetailsForm.reset();
    this.showError = false;
    this.isEdit = false;
    this.pk_familyid = null;
  }
}