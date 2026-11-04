import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { LeavereqService } from '../Service/leavereq.service';
import { formatDateForInput } from '../../../../healpers/commonlib';

@Component({
  selector: 'app-comp-off-request',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './comp-off-request.component.html',
  styleUrl: './comp-off-request.component.scss',
})
export class CompOffRequestComponent {
  CompOffForm!: FormGroup;
  showError = false;
  IsEdit = false;

  constructor(
    private fb: FormBuilder,
    private compOffService: LeavereqService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.CompOffForm = this.fb.group({
      fk_empid: [''],
      compoffdate: ['', Validators.required],
      intime: ['', Validators.required],
      outtime: ['', Validators.required],
      totalhours: ['', Validators.required],
      compoffdays: ['', Validators.required],
      reason: [''],
    });

    // Auto-calculate total hours and days
    // this.CompOffForm.get('intime')?.valueChanges.subscribe(() =>
    //   this.calculateHours()
    // );
    // this.CompOffForm.get('outtime')?.valueChanges.subscribe(() =>
    //   this.calculateHours()
    // );
  }

  // calculateHours(): void {

  //   const inTime = this.CompOffForm.get('intime')?.value;
  //   const outTime = this.CompOffForm.get('outtime')?.value;

  //   if (inTime && outTime) {
  //     const inDate = new Date(`1970-01-01T${inTime}`);
  //     const outDate = new Date(`1970-01-01T${outTime}`);

  //     let diffMs = outDate.getTime() - inDate.getTime();

  //     // Handle overnight shift
  //     if (diffMs < 0) {
  //       diffMs += 24 * 60 * 60 * 1000;
  //     }

  //     const hours = Math.floor(diffMs / (1000 * 60 * 60));
  //     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  //     const totalHours = `${this.pad(hours)}:${this.pad(minutes)}`;
  //     this.CompOffForm.get('totalhours')?.setValue(totalHours);

  //     // Days logic: If 8 or more hours = 1 day, else 0.5
  //     this.CompOffForm.get('compoffdays')?.setValue(hours >= 8 ? '1' : '0.5');
  //   }
  // }

  // comp-off-request.component.ts

calculateAttendance(): void {
  // Ensure the date is in the correct format
  const selectedDate = this.CompOffForm.get('compoffdate')?.value;
  if (!selectedDate) {
    alert('Please select a date first!');
    return;
  }
  const formattedDate=formatDateForInput(selectedDate);
    
   this.compOffService.getCompOffAttendanceByDate(selectedDate).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data && res.data.length > 0) {
        const record = res.data[0];
       
        this.CompOffForm.patchValue({
          intime: record.intime || '', 
          outtime: record.outtime || '',
          totalhours: record.totalhours || '0.00',
          compoffdays: record.totdays || '',
        });
      } else {
        alert('No data found for selected date');
      }
    },
    error: (err) => {
      console.error('Error fetching data:', err);
      alert('Something went wrong while fetching data');
    }
  });
}


  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

onSubmit(): void {
  this.IsEdit = true;

  if (this.CompOffForm.invalid) {
    this.showError = true;
    return;
  }
  const formValues = this.CompOffForm.value;
  // 👇 Wrap into expected structure
  const requestData = {
    compOffRequestMst: {
      ...formValues,
    }
  };

  this.compOffService.insertCompOffRequest(requestData).subscribe({
    next: (response) => {
      if (response.isSuccess) {
        this.toastrService.success(response.message || 'Comp Off Request submitted successfully!');
        this.router.navigate(['/dash/leaves/leavesdashboard/CompOffrequestList']);
      } else {
        this.toastrService.error(response.message || 'Failed to submit Comp Off Request.');
      }
    },
    error: () => {
      this.toastrService.error('Server error. Please try again later.');
    }
  });
}


  resetForm(): void {
    this.CompOffForm.reset();
    this.showError = false;
  }
}
