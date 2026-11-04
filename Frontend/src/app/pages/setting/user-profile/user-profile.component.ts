import { Component, OnInit } from '@angular/core';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule ,FormsModule } from '@angular/forms';
import { UserProfileService } from '../service/user-profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule ,ReactiveFormsModule,FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent  {

  todayDate: string = new Date().toLocaleDateString();

  // 🔁 Variables for nested response data
  searchText: string = '';
  employeeProfileMst: any = {};
  employeeQualification: any[] = [];
  employeePreviousJob: any[] = [];
  employeeLetter: any[] = [];
  reportingInfo1: any[] = [];
  reportingInfo2: any[] = [];

  constructor(
    private userProfileService: UserProfileService,
    private loaderService: NgxUiLoaderService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
  this.userProfileService.getUserProfile().subscribe({
    next: (res) => {
      this.loaderService.stop();
      if (res.isSuccess && res.data) {
        this.employeeProfileMst = res.data.employeeProfileMst || {};
        this.employeeQualification = res.data.employeeQualification || [];
        this.employeePreviousJob = res.data.employeePreviousJob || [];
        this.employeeLetter = res.data.employeeLetter || [];
        this.reportingInfo1 = res.data.reportingInfo1 || [];
        this.reportingInfo2 = res.data.reportingInfo2 || [];
         if (this.employeeProfileMst.policyImagePath) {
        this.userProfileService.getImage(this.employeeProfileMst.policyImagePath).subscribe({
          next: (blob) => {
            this.employeeProfileMst.policyImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load policy image:', err);
            this.employeeProfileMst.policyImageUrl = '';
          }
        });
      }
        // ✅ Calculate experience from DOJ
        // if (this.employeeProfileMst.doj) {
        //   const doj = new Date(this.employeeProfileMst.doj);
        //   const today = new Date();

        //   const diffYears = today.getFullYear() - doj.getFullYear();
        //   const diffMonths = today.getMonth() - doj.getMonth();
        //   const diffDays = today.getDate() - doj.getDate();

        //   let years = diffYears;
        //   let months = diffMonths;
        //   if (diffDays < 0) months--; // adjust month if day is not complete
        //   if (months < 0) {
        //     years--;
        //     months += 12;
        //   }

        //   this.employeeProfileMst.experienceText = '';
        // }
      } else {
        this.toastrService.warning(res.message || 'No data found.');
      }
    },
    error: () => {
      this.loaderService.stop();
      this.toastrService.error('Failed to load user profile.');
    }
  });
}


filteredQualifications(): any[] {
  if (!this.searchText) return this.employeeQualification;
  const text = this.searchText.toLowerCase();
  return this.employeeQualification.filter(item =>
    item.qualification?.toLowerCase().includes(text) ||
    item.subject?.toLowerCase().includes(text) ||
    item.institute?.toString().includes(text)||
    item.passYear?.toString().includes(text)||
    item.marks?.toString().includes(text)||
    item.division?.toString().includes(text)
  );
}


filteredPreviousJobs(): any[] {
  if (!this.searchText) return this.employeePreviousJob;
  const text = this.searchText.toLowerCase();
  return this.employeePreviousJob.filter(item =>
    item.compname?.toLowerCase().includes(text) ||
    item.designation?.toLowerCase().includes(text) ||
    item.department?.toLowerCase().includes(text) ||
    item.fromDate?.toLowerCase().includes(text)||
    item.toDate?.toLowerCase().includes(text)||
    item.profile?.toLowerCase().includes(text)||
    item.leavingReason?.toLowerCase().includes(text)
  );
}

filteredLetters(): any[] {
  if (!this.searchText) return this.employeeLetter;
  const text = this.searchText.toLowerCase();
  return this.employeeLetter.filter(item =>
    item.letterName?.toLowerCase().includes(text) ||
    item.issueDate?.toLowerCase().includes(text) 
  );
}

filteredReportingInfo1(): any[] {
  if (!this.searchText) return this.reportingInfo1;
  const text = this.searchText.toLowerCase();
  return this.reportingInfo1.filter(item =>
    item.empCode?.toLowerCase().includes(text) ||
    item.empName?.toLowerCase().includes(text)||
    item.designation?.toLowerCase().includes(text)||
    item.department?.toLowerCase().includes(text)
  );
}

filteredReportingInfo2(): any[] {
  if (!this.searchText) return this.reportingInfo2;
  const text = this.searchText.toLowerCase();
  return this.reportingInfo2.filter(item =>
     item.empCode?.toLowerCase().includes(text) ||
    item.empName?.toLowerCase().includes(text)||
    item.designation?.toLowerCase().includes(text)||
    item.department?.toLowerCase().includes(text)
  );
}




}