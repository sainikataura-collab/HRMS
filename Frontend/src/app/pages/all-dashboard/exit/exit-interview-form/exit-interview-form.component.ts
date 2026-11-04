import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ExitFormAutorityService } from '../Service/exit-form-autority.service';

@Component({
  selector: 'app-exit-interview-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './exit-interview-form.component.html',
  styleUrl: './exit-interview-form.component.scss'
})
export class ExitInterviewFormComponent implements OnInit {
  interviewForm!: FormGroup;
  submitted = false;
  pk_exitInterviewId = 0;
  isViewMode = true;
  isReviewMode = true;
  reviewEmpId = '';

  ratingOptions = ['Excellent', 'Good', 'Average', 'Poor'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private exitInterviewService: ExitFormAutorityService
  ) { }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id') || '';

    this.reviewEmpId = routeId;
    this.isReviewMode = true;
    this.isViewMode = true;

    this.interviewForm = this.fb.group({
      empcode: [''],
      empname: [''],
      department: [''],

      r_betterCareer: [false],
      r_higherSalary: [false],
      r_relocation: [false],
      r_personal: [false],
      r_health: [false],
      r_education: [false],
      r_workEnv: [false],
      r_managerial: [false],
      r_jobDissatisfaction: [false],
      r_workLife: [false],
      r_companyPolicies: [false],
      r_retirement: [false],
      r_other: [false],
      r_otherText: [''],

      q1_jobRole: ['', Validators.required],
      q1_comments: [''],
      q2_manager: ['', Validators.required],
      q2_comments: [''],
      q3_workEnv: ['', Validators.required],
      q3_comments: [''],
      q4_salary: ['', Validators.required],
      q4_comments: [''],
      q5_policies: ['', Validators.required],
      q5_comments: [''],
      q6_training: ['', Validators.required],
      q6_comments: [''],
      q7_teamIssues: ['', Validators.required],
      q7_comments: [''],
      q8_liked: [''],
      q9_improvements: [''],
      q10_recommend: ['', Validators.required],
      q10_reason: ['']
    });

    if (this.reviewEmpId) {
      this.getAdminHodExitInterviewByEmpId(this.reviewEmpId);
    } else {
      this.toastr.error('Employee id not found.');
      this.back();
    }
  }

  preventChangeInViewMode(event: Event): void {
    if (this.isViewMode) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  patchExitInterviewForm(data: any): void {
    this.interviewForm.patchValue({
      empcode: data?.empcode || data?.EmpCode || '',
      empname: data?.empname || data?.EmpName || '',
      department: data?.department || data?.Department || '',

      r_betterCareer: data?.r_betterCareer ?? false,
      r_higherSalary: data?.r_higherSalary ?? false,
      r_relocation: data?.r_relocation ?? false,
      r_personal: data?.r_personal ?? false,
      r_health: data?.r_health ?? false,
      r_education: data?.r_education ?? false,
      r_workEnv: data?.r_workEnv ?? false,
      r_managerial: data?.r_managerial ?? false,
      r_jobDissatisfaction: data?.r_jobDissatisfaction ?? false,
      r_workLife: data?.r_workLife ?? false,
      r_companyPolicies: data?.r_companyPolicies ?? false,
      r_retirement: data?.r_retirement ?? false,
      r_other: data?.r_other ?? false,
      r_otherText: data?.r_otherText || '',

      q1_jobRole: data?.q1_jobRole || '',
      q1_comments: data?.q1_comments || '',
      q2_manager: data?.q2_manager || '',
      q2_comments: data?.q2_comments || '',
      q3_workEnv: data?.q3_workEnv || '',
      q3_comments: data?.q3_comments || '',
      q4_salary: data?.q4_salary || '',
      q4_comments: data?.q4_comments || '',
      q5_policies: data?.q5_policies || '',
      q5_comments: data?.q5_comments || '',
      q6_training: data?.q6_training || '',
      q6_comments: data?.q6_comments || '',
      q7_teamIssues: data?.q7_teamIssues || '',
      q7_comments: data?.q7_comments || '',
      q8_liked: data?.q8_liked || '',
      q9_improvements: data?.q9_improvements || '',
      q10_recommend: data?.q10_recommend || '',
      q10_reason: data?.q10_reason || ''
    });
  }

  getAdminHodExitInterviewByEmpId(empId: string): void {
    this.exitInterviewService.getAdminHodExitInterviewByEmpId(empId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          const data = res.data || res.Data;
          this.patchExitInterviewForm(data);
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to load Exit Interview');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while loading Exit Interview');
      }
    });
  }

  submitForm(): void {
    this.submitted = true;
    return;
  }

  resetForm(): void {
    this.submitted = false;

    this.interviewForm.reset({
      empcode: '',
      empname: '',
      department: '',

      r_betterCareer: false,
      r_higherSalary: false,
      r_relocation: false,
      r_personal: false,
      r_health: false,
      r_education: false,
      r_workEnv: false,
      r_managerial: false,
      r_jobDissatisfaction: false,
      r_workLife: false,
      r_companyPolicies: false,
      r_retirement: false,
      r_other: false,
      r_otherText: '',

      q1_jobRole: '',
      q1_comments: '',
      q2_manager: '',
      q2_comments: '',
      q3_workEnv: '',
      q3_comments: '',
      q4_salary: '',
      q4_comments: '',
      q5_policies: '',
      q5_comments: '',
      q6_training: '',
      q6_comments: '',
      q7_teamIssues: '',
      q7_comments: '',
      q8_liked: '',
      q9_improvements: '',
      q10_recommend: '',
      q10_reason: ''
    });
  }

  back(): void {
    this.router.navigate(['/dash/exit/exitdashboard/exit_interviewReview_list']);
  }
}