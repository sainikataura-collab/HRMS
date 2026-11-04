import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ExitInterviewService } from '../Services/exit-interview.service';

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
  isViewMode = false;
  isReviewMode = false;

  reviewEmpId = '';
  mode = '';

  ratingOptions = ['Excellent', 'Good', 'Average', 'Poor'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private exitInterviewService: ExitInterviewService
  ) { }

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get('id') || '';
    this.mode = this.route.snapshot.queryParamMap.get('mode') || '';

    this.isReviewMode = this.mode === 'review';

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

    if (this.mode === 'review') {
      this.isViewMode = true;
      this.reviewEmpId = routeId;
      this.getAdminHodExitInterviewByEmpId(this.reviewEmpId);
    } else if (this.mode === 'view') {
      this.isViewMode = true;
      this.pk_exitInterviewId = Number(routeId || 0);

      if (this.pk_exitInterviewId > 0) {
        this.getExitInterviewById(this.pk_exitInterviewId);
      }
    } else {
      this.pk_exitInterviewId = Number(routeId || 0);

      if (this.pk_exitInterviewId > 0) {
        this.isViewMode = true;
        this.getExitInterviewById(this.pk_exitInterviewId);
      }
    }
  }

  patchExitInterviewForm(data: any): void {
    this.interviewForm.patchValue({
      empcode: data.empcode || data.EmpCode || '',
      empname: data.empname || data.EmpName || '',
      department: data.department || data.Department || '',

      r_betterCareer: data.r_betterCareer ?? data.R_BetterCareer ?? false,
      r_higherSalary: data.r_higherSalary ?? data.R_HigherSalary ?? false,
      r_relocation: data.r_relocation ?? data.R_Relocation ?? false,
      r_personal: data.r_personal ?? data.R_Personal ?? false,
      r_health: data.r_health ?? data.R_Health ?? false,
      r_education: data.r_education ?? data.R_Education ?? false,
      r_workEnv: data.r_workEnv ?? data.R_WorkEnv ?? false,
      r_managerial: data.r_managerial ?? data.R_Managerial ?? false,
      r_jobDissatisfaction: data.r_jobDissatisfaction ?? data.R_JobDissatisfaction ?? false,
      r_workLife: data.r_workLife ?? data.R_WorkLife ?? false,
      r_companyPolicies: data.r_companyPolicies ?? data.R_CompanyPolicies ?? false,
      r_retirement: data.r_retirement ?? data.R_Retirement ?? false,
      r_other: data.r_other ?? data.R_Other ?? false,
      r_otherText: data.r_otherText || data.R_OtherText || '',

      q1_jobRole: data.q1_jobRole || data.Q1_JobRole || '',
      q1_comments: data.q1_comments || data.Q1_Comments || '',
      q2_manager: data.q2_manager || data.Q2_Manager || '',
      q2_comments: data.q2_comments || data.Q2_Comments || '',
      q3_workEnv: data.q3_workEnv || data.Q3_WorkEnv || '',
      q3_comments: data.q3_comments || data.Q3_Comments || '',
      q4_salary: data.q4_salary || data.Q4_Salary || '',
      q4_comments: data.q4_comments || data.Q4_Comments || '',
      q5_policies: data.q5_policies || data.Q5_Policies || '',
      q5_comments: data.q5_comments || data.Q5_Comments || '',
      q6_training: data.q6_training || data.Q6_Training || '',
      q6_comments: data.q6_comments || data.Q6_Comments || '',
      q7_teamIssues: data.q7_teamIssues || data.Q7_TeamIssues || '',
      q7_comments: data.q7_comments || data.Q7_Comments || '',
      q8_liked: data.q8_liked || data.Q8_Liked || '',
      q9_improvements: data.q9_improvements || data.Q9_Improvements || '',
      q10_recommend: data.q10_recommend || data.Q10_Recommend || '',
      q10_reason: data.q10_reason || data.Q10_Reason || ''
    });
  }

  getExitInterviewById(pk_exitInterviewId: number): void {
    this.exitInterviewService.getExitInterviewById(pk_exitInterviewId).subscribe({
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

  preventChangeInViewMode(event: Event): void {
    if (this.isViewMode) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  submitForm(): void {
    this.submitted = true;

    if (this.isViewMode) {
      return;
    }

    if (this.interviewForm.invalid) {
      return;
    }

    const payload = {
      ...this.interviewForm.value,
      active: true
    };

    this.exitInterviewService.insertExitInterview(payload).subscribe({
      next: (response: any) => {
        if (response?.isSuccess || response?.IsSuccess) {
          this.toastr.success(response?.message || response?.Message || 'Exit Interview submitted successfully');
          this.router.navigate(['/dash/emp-exit/emp-exitdashboard/exit_interview_form']);
        } else {
          this.toastr.error(response?.message || response?.Message || 'Failed to submit Exit Interview');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong');
      }
    });
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
    if (this.isReviewMode) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/dash/emp-exit/emp-exitdashboard/exit_interview_review']);
      });
    } else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/dash/emp-exit/emp-exitdashboard/exit_interview_form']);
      });
    }
  }
}