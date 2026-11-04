declare var bootstrap: any;

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SelectedCandidateService } from '../../RecruitServices/selected-candidate.service';

@Component({
  selector: 'app-selected-candidate',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, CommonModule, FormsModule],
  templateUrl: './selected-candidate.component.html',
  styleUrl: './selected-candidate.component.scss'
})
export class SelectedCandidateComponent {
Isedit = false;
  submitted = false;
  pk_jobid!: string;
  showerror = false;
  ScheduleInterview!: FormGroup;
  jobList: { name: string; value: string }[] = [];
  candidateList: any[] = [];
  jobData: any;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  interviewDate: string = '';
  interviewTime: string = '';

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    public ngxUILoaderService: NgxUiLoaderService,
    public encryption: EncryptionService,
    private route: ActivatedRoute,
    private service : SelectedCandidateService
  ) {}

  ngOnInit(): void {
    this.ScheduleInterview = this.fb.group({
      fk_jobId: [null],
    });

    this.getjoblist('Job');
  }

  getjoblist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.service.getjob(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data);
          this.jobList = res.data.map((job: any) => ({
            name: job.name,
            value: job.value,
          }));
        } else {
          this.toastrService.error('Failed to load  job list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching job list:', err);
        this.toastrService.error('Error fetching job list. Please try again.');
        this.ngxUILoaderService.stop();
      },
    });
  }

  // }

  onInterviewDateChange(value: string) {
    this.candidateList.forEach(candidate => {
      candidate.interview_date = value;
    });
  }

  onInterviewTimeChange(value: string) {
  this.candidateList.forEach(candidate => {
    candidate.interview_time = value;
  });
}

  getDataByid(pk_jobid: string): void {
    this.service.getFinalSelectedCandidatesByJobId(pk_jobid).subscribe((res) => {
      if (res.statusCode === 200 && res.data) {
      
           this.candidateList = res.data.candidatedetail.map((candidate: any) => ({
        ...candidate,
        interview_date: this.formatDateForInput(candidate.interview_date),
        interview_time: candidate.interview_time,
      }));
          this.jobData = res.data.jobdetails; 
          

      } else {
        console.error(
          'Failed to retrieve data:',
          res.message || 'Unknown error'
        );
        alert(res.message || 'Failed to retrieve candidate data');
      }
    });
  }

    formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
  
    const parts = dateStr.split('/');
    console.log(parts);
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    console.log(day, month, year);
    const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
    console.log(date);
    if (isNaN(date.getTime())) return null; // still safe check
  
    const offset = date.getTimezoneOffset();
    console.log(offset);
    const localDate = new Date(date.getTime() - offset * 60000);
    console.log(localDate);
    return localDate.toISOString().split('T')[0]; // final output
  }

  onJobChange() {
    const jobId = this.ScheduleInterview.get('fk_jobId')?.value;
    if (jobId) {
      this.getDataByid(jobId);
    } else {
      this.toastrService.warning('Please select a job.');
    }
  }

  //for modal

  selectedCandidate: any = null;

  viewMore(candidate: any) {
    this.selectedCandidate = candidate;
    const modalElement = document.getElementById('candidateModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  submitScreening() {
    debugger
    const payload = {
      FreezingCandidate: this.candidateList.map((candidate) => ({
        fk_recId: candidate.pk_recId,
        final_selection_status: candidate.final_selection_status,
        remarks: candidate.remarks,
      })),
    };
    console.log(payload); // for debugging
    this.service.updateFinalSelectionStatus(payload).subscribe({
      next: (res) => {
        this.toastrService.success(res.message);
      },
      error: (err) => {
        this.toastrService.error(err.message);
      },
    });
  }

  // submitSingleRecord(candidate: any) {
  //   debugger;
  //   const payload = {
  //     ScheduleInterviewInsData: [
  //       {
  //         fk_recId: candidate.fk_recId,
  //         interview_date: candidate.interview_date,
  //         interview_time: candidate.interview_time,
  //       },
  //     ],
  //   };

  //   console.log(payload); // for debugging

  //   this.service.insertScheduleInterview(payload).subscribe({
  //     next: (res) => {
  //       alert('ScheduleInterview updated successfully!');
  //       this.toastrService.success(res.message);
  //     },
  //     error: (err) => {
  //       this.toastrService.error(err.message);
  //     },
  //   });
  // }

  submitSingleRecord(candidate: any) {
  const payload = {
    candidates:[{
      pk_recId: candidate.pk_recId,
      final_selection_status: candidate.final_selection_status,
      remarks: candidate.remarks,
    },
  ],
  };

  this.service.updateFinalSelectionStatus(payload).subscribe({
    next: (res) => {
      this.toastrService.success(res.message);
    },
    error: (err) => {
      this.toastrService.error(err.message);
    },
  });
}
}
