import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exit-interview-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exit-interview-view.component.html',
  styleUrl: './exit-interview-view.component.scss'
})
export class ExitInterviewViewComponent implements OnInit {
  interviewId: number | null = null;
  interviewData: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.interviewId = +id;
        this.loadInterviewData(this.interviewId);
      }
    });
  }

  loadInterviewData(id: number): void {
    // Mock data — matches exact fields from exit-interview-form
    this.interviewData = {
      // Employee info
      empCode: 'EMP001',
      empName: 'John Doe',
      department: 'Technology',
      designation: 'Software Engineer',
      submittedDate: '2024-06-15',

      // Section 1: Reasons for leaving (checkboxes)
      r_betterCareer:       true,
      r_higherSalary:       false,
      r_relocation:         false,
      r_personal:           false,
      r_health:             false,
      r_education:          false,
      r_workEnv:            false,
      r_managerial:         false,
      r_jobDissatisfaction: false,
      r_workLife:           true,
      r_companyPolicies:    false,
      r_retirement:         false,
      r_other:              false,
      r_otherText:          '',

      // Section 2: Q1–Q10 Feedback
      q1_jobRole:    'Good',
      q1_comments:   'Role was interesting but lacked growth opportunities.',

      q2_manager:    'Excellent',
      q2_comments:   'Manager was very supportive and approachable.',

      q3_workEnv:    'Good',
      q3_comments:   'Comfortable office environment.',

      q4_salary:     'Average',
      q4_comments:   'Compensation was below market standard.',

      q5_policies:   'Yes',
      q5_comments:   'Policies were communicated during onboarding.',

      q6_training:   'Yes',
      q6_comments:   'Good training programs.',

      q7_teamIssues: 'No',
      q7_comments:   '',

      q8_liked:        'Great team culture and learning opportunities.',
      q9_improvements: 'Better salary benchmarking and remote work policies.',

      q10_recommend: 'Yes',
      q10_reason:    'Overall a good company with a positive work culture.'
    };
  }

  // Helper: get all checked reasons as a comma-separated string
  getReasons(): string {
    if (!this.interviewData) return '';
    const map: Record<string, string> = {
      r_betterCareer:       'Better Career Opportunity',
      r_higherSalary:       'Higher Salary',
      r_relocation:         'Relocation',
      r_personal:           'Personal Reasons',
      r_health:             'Health Issues',
      r_education:          'Higher Education',
      r_workEnv:            'Work Environment',
      r_managerial:         'Managerial Issues',
      r_jobDissatisfaction: 'Job Dissatisfaction',
      r_workLife:           'Work-Life Balance',
      r_companyPolicies:    'Company Policies',
      r_retirement:         'Retirement',
      r_other:              this.interviewData.r_otherText || 'Other'
    };
    return Object.keys(map)
      .filter(k => this.interviewData[k] === true)
      .map(k => map[k])
      .join(', ') || 'None selected';
  }

  ratingBadge(rating: string): string {
    const map: Record<string, string> = {
      'Excellent': 'bg-success',
      'Good':      'bg-primary',
      'Average':   'bg-warning',
      'Poor':      'bg-danger'
    };
    return map[rating] || 'bg-secondary';
  }

  yesnoBadge(val: string): string {
    return val === 'Yes' ? 'bg-success' : 'bg-danger';
  }

  recommendBadge(val: string): string {
    const map: Record<string, string> = { 'Yes': 'bg-success', 'No': 'bg-danger', 'Maybe': 'bg-warning' };
    return map[val] || 'bg-secondary';
  }
}
