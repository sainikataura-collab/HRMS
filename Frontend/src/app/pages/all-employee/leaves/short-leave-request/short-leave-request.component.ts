
import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink ,Router} from '@angular/router';
import { LeavereqService } from '../Service/leavereq.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-short-leave-request',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './short-leave-request.component.html',
  styleUrl: './short-leave-request.component.scss'
})
export class ShortLeaveRequestComponent {
  ShortLeaveForm!: FormGroup;
  showError = false;
  IsEdit = false;

  constructor(private fb: FormBuilder,
     private httpAttendanceService: LeavereqService,
         private toastr: ToastrService,
         private router: Router,
  ) {}

  ngOnInit(): void {
    this.ShortLeaveForm = this.fb.group({
      shortLeavedate: ['', Validators.required],
      intime: ['', Validators.required],
      outtime: ['', Validators.required],
      totalhours: [''],
      totdays: ['1'],
      Remarks: ['']
    });

    // Auto-calculate on in/out time change
    this.ShortLeaveForm.get('intime')?.valueChanges.subscribe(() => this.calculateHours());
    this.ShortLeaveForm.get('outtime')?.valueChanges.subscribe(() => this.calculateHours());
  }

  calculateHours(): void {

    const inTime = this.ShortLeaveForm.get('intime')?.value;
    const outTime = this.ShortLeaveForm.get('outtime')?.value;
    
    if (inTime && outTime) {
      const inDate = new Date(`1970-01-01T${inTime}`);
      const outDate = new Date(`1970-01-01T${outTime}`);

      let diffMs = outDate.getTime() - inDate.getTime();

      if (diffMs < 0) {
        // Handle overnight time, e.g. 22:00 to 02:00
        diffMs += 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const totalHours = `${this.pad(hours)}:${this.pad(minutes)}`;
      this.ShortLeaveForm.get('totalhours')?.setValue(totalHours);

      // // If more than or equal to 8 hours, consider 1 full day
      // this.ShortLeaveForm.get('totdays')?.setValue(hours >= 8 ? '1' : '0.5');
    }
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  onSubmit(): void {
    debugger;
    this.showError = true;

    if (this.ShortLeaveForm.invalid) {
      return;
    }

    const payload = {...this.ShortLeaveForm.value,
   shortLeavedate: formatDate(this.ShortLeaveForm.value.shortLeavedate, 'dd/MM/yyyy', 'en-IN')}
// Ensure date is in correct format




   

  
    this.httpAttendanceService.Isnert_ShortLeaveRequest(payload).subscribe({
     next: (res) => {
      if (res.isSuccess) {
        this.toastr.success(res.message || 'Short leave request submitted successfully');
        this.ShortLeaveForm.reset();
       this.router.navigateByUrl('/dash/leaves/leavesdashboard/shortLeaveList');

      } else {
        this.toastr.error(res.message || 'Failed to submit short leave request');
      }
    }
  });

  }
  
  }
