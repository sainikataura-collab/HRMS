import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApprovalSecDocService } from '../../../services/approval-sec-doc.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-approval-sec-doc-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink,NgSelectModule],
  templateUrl: './approval-sec-doc-edit.component.html',
  styleUrl: './approval-sec-doc-edit.component.scss'
})
export class ApprovalSecDocEditComponent {
  detailForm!: FormGroup;
  employeeData: any;
  formattedBillDate: string = '';
  constructor(private fb: FormBuilder, private router: Router, private approvalSecDocService: ApprovalSecDocService, private toastrService: ToastrService) {
    this.employeeData = this.router.getCurrentNavigation()?.extras.state;
  }

  Status = [
    { name: '--select status--', value: '' },
    { name: 'Approve', value: '3' },
    { name: 'Disapprove', value: '4' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    if (this.employeeData) {
      this.populateForm();
    } else {
      console.warn('No employee data received.');
      // Optionally redirect back if no data is received
      // this.router.navigate(['/dash/payroll/payrolldashboard/Approval-Section-Doc']);
    }
  }

 

  initializeForm() {
    this.detailForm = this.fb.group({
      code: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: true }],
      section: [{ value: '', disabled: true }],
      subSection: [{ value: '', disabled: true }],
      billDate: [{ value: '', disabled: true }],
      billAmount: [{ value: '', disabled: true }],
      status: ['Pending', Validators.required],
      remarks: ['', Validators.required],
    });
  }

  populateForm() {
    this.detailForm.patchValue({
      code: this.employeeData.empcode || '',
      name: this.employeeData.empname || '',
      section: this.employeeData.sectionDes || '',
      subSection: this.employeeData.subSectionDes || '',
      billDate: formatDate(this.employeeData.billDate, 'dd MMM yyyy', 'en-US'),

      billAmount: this.employeeData.docsub_Amt || '',
      status: 'Pending', // Default value; adjust if API provides status
      remarks: '', // Default empty; adjust if API provides remarks
    });
  }

  // onSubmit() {
  //   debugger
  //   if (this.detailForm.valid) {
  //     const approvalData = {
  //       ...this.employeeData,
  //       status: this.detailForm.get('status')?.value,
  //       remarks: this.detailForm.get('remarks')?.value,
  //       fk_insUserId: sessionStorage.getItem('userId') || '', // UserId from session
  //       approvalStatus: +this.detailForm.get('status')?.value, // Convert string to number
  //     };
  
  //     const payload = [approvalData]; // Because API expects a list of objects
  
  //     this.approvalSecDocService.insert_ApprovalSectionDoc(payload).subscribe({
  //       next: (res) => {
  //         console.log('Approval inserted:', res);
  //         this.router.navigate(['/dash/payroll/payrolldashboard/Approval-Section-Doc']);
  //       },
  //       error: (err) => {
  //         console.error('Submission failed:', err);
  //       }
  //     });
  //   } else {
  //     console.warn('Form is invalid');
  //   }
  // }

  onSubmit() {
    if (this.detailForm.invalid) {
      this.toastrService.warning('Please fill all required fields.');
      return;
    }
  
    const approvalData = {
      ...this.employeeData,
      status: this.detailForm.get('status')?.value,
      remarks: this.detailForm.get('remarks')?.value,
      fk_insUserId: sessionStorage.getItem('userId') || '',
      approvalStatus: +this.detailForm.get('status')?.value,
    };
  
    const payload = [approvalData];
  
    this.approvalSecDocService.insert_ApprovalSectionDoc(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Section document approved successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/Approval-Section-Doc']);
        } else {
          this.toastrService.error(res.message || 'Failed to approve section document');
        }
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.toastrService.error('Something went wrong while submitting approval.');
      }
    });
  }
  
  
}
