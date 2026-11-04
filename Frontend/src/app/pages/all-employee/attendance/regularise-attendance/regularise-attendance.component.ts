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
import { NgSelectComponent } from '@ng-select/ng-select';
import { AttendanceService } from '../Services/attendance.service';

@Component({
  selector: 'app-regularise-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgSelectComponent],
  templateUrl: './regularise-attendance.component.html',
  styleUrl: './regularise-attendance.component.scss',
})
export class RegulariseAttendanceComponent {
  regularizeForm!: FormGroup;
  showError = false;
  IsEdit = false;
  // AttendenceTypeddl: { name: string; value: string }[] = [];
  AttendenceTypeddl: { name: string; value: string; description: string }[] = [];
  isLateComing: boolean = false;

  selectedInOutId: string = '';

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.regularizeForm = this.fb.group({
      fk_empid: [''],
      attenDate: [null, Validators.required],
      intime: ['', Validators.required],
      outtime: ['', Validators.required],
      totalhours: ['', Validators.required],
      remarks: [''],
    });

    // Auto-calculate working hours
    this.regularizeForm
      .get('intime')
      ?.valueChanges.subscribe(() => this.calculateWorkingHours());
    this.regularizeForm
      .get('outtime')
      ?.valueChanges.subscribe(() => this.calculateWorkingHours());

    this.RegulariseAttendance(); // Load dropdown data
  }

  calculateWorkingHours(): void {
    const inTime = this.regularizeForm.get('intime')?.value;
    const outTime = this.regularizeForm.get('outtime')?.value;

    if (inTime && outTime) {
      const inDate = new Date(`1970-01-01T${inTime}`);
      const outDate = new Date(`1970-01-01T${outTime}`);

      let diffMs = outDate.getTime() - inDate.getTime();

      if (diffMs < 0) {
        // Handle overnight shift
        diffMs += 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const totalHours = `${this.pad(hours)}:${this.pad(minutes)}`;

      this.regularizeForm.get('totalhours')?.setValue(totalHours);
    }
  }

  RegulariseAttendance() {
    this.attendanceService.RegulariseAttendanceddl().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data && res.data.length > 0) {
           res.data=res.data.slice(1);
          this.AttendenceTypeddl = res.data.map((item: any) => ({
            name: `${item.description} (${item.daydescription})`,
            value: item.pk_inoutid,
            description: item.description, // keep description for condition check
           
          }));
           console.log(name);
        } else {
          this.toastrService.error('No data found for Regularise Attendance.');
        }
      },
      error: (err) => {
        console.error('Error fetching Regularise Attendance list:', err);
        this.toastrService.error('Error fetching Regularise Attendance.');
      },
    });
  }

  onAttendancetypeChange(pk_inoutid: string): void {
pk_inoutid= this.regularizeForm.get('attenDate')?.value;
//new aded
   const selected = this.AttendenceTypeddl.find(
  x => String(x.value) === String(pk_inoutid || this.regularizeForm.get('attenDate')?.value)
);

console.log('selected:', selected);

if (selected) {
  // take only the part after "--"
  const descPart = selected.description.split('--')[1]?.trim().toLowerCase() || '';
  this.isLateComing = descPart.includes('late coming');
} else {
  this.isLateComing = false;
}
//new added
    
   

    this.attendanceService.getInOutTimeByInOutId(pk_inoutid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data && res.data.length > 0) {
          const record = res.data[0];

          const inHours = this.pad(record.inHours);
          const inMinutes = this.pad(record.inMinutes || '0');
          const outHours = this.pad(record.outHours || '0');
          const outMinutes = this.pad(record.outMinutes || '0');

          const intime = `${inHours}:${inMinutes}`;
          const outtime = `${outHours}:${outMinutes}`;

          // Calculate total hours
          const totalhours = this.calculateTotalHours(intime, outtime);

          this.regularizeForm.patchValue({
            intime,
            outtime,
            totalhours,
          });
        } else {
          this.toastrService.warning('No In/Out time found for selected date.');
        }
      },
      error: (err) => {
        console.error('Error fetching In/Out time:', err);
        this.toastrService.error('Error fetching time for selected date.');
      },
    });
  }

  calculateTotalHours(inTime: string, outTime: string): string {
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);

    let inDate = new Date(1970, 0, 1, inH, inM);
    let outDate = new Date(1970, 0, 1, outH, outM);

    if (outDate < inDate) {
      outDate.setDate(outDate.getDate() + 1); // overnight shift
    }

    const diffMs = outDate.getTime() - inDate.getTime();
    const totalH = Math.floor(diffMs / (1000 * 60 * 60));
    const totalM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${this.pad(totalH)}:${this.pad(totalM)}`;
  }

  pad(value: any): string {
    const strVal = value?.toString() || '0';
    const num = parseInt(strVal, 10);
    return isNaN(num) ? '00' : num < 10 ? `0${num}` : `${num}`;
  }

  onSubmit(): void {
    this.IsEdit = true;

    if (this.regularizeForm.invalid) {
      this.showError = true;
      return;
    }

    const formValues = this.regularizeForm.value;
    const requestData = {
      regulariseAttendanceMst: {
        ...formValues,
      },
    };

    this.attendanceService.insertRegulariseAttendance(requestData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrService.success(
            response.message || 'Attendance regularised successfully!'
          );
          this.router.navigate(['/dash/attendance/attendancedashboard/RegulariseAttendanceList']);
        } else {
          this.toastrService.error(
            response.message || 'Failed to submit regularisation.'
          );
        }
      },
      error: () => {
        this.toastrService.error('Server error. Please try again later.');
      },
    });
  }

  resetForm(): void {
    this.regularizeForm.reset();
    this.showError = false;
  }
}






