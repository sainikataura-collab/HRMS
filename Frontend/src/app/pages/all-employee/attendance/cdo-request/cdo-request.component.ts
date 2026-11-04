import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AttendanceService } from '../Services/attendance.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cdo-request',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgSelectComponent],
  templateUrl: './cdo-request.component.html',
  styleUrl: './cdo-request.component.scss'
})
export class CdoRequestComponent {

  Form!: FormGroup;
    showError = false;
    IsEdit = false;
   
  
    constructor(
      private fb: FormBuilder,
      private attendanceService: AttendanceService,
      private toastrService: ToastrService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.Form = this.fb.group({
        fk_empid: [''],
        attenDate: [null, Validators.required],
        // intime: ['', Validators.required],
        // outtime: ['', Validators.required],
        cdoHours: ['', Validators.required],
        remarks: [''],
      });
  
     
    }
  
   
    
    onSubmit(): void {
      this.IsEdit = true;
  
      if (this.Form.invalid) {
        this.showError = true;
        return;
      }
  
      const formValues = this.Form.value;
      const requestData = {
        CDORequest: {
          ...formValues,
        },
      };
  
      this.attendanceService.insertcdo(requestData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(
              response.message || 'CDO addded successfully!'
            );
            this.router.navigate(['/dash/attendance/attendancedashboard/cdoRequest-list']);
          } else {
            this.toastrService.error(
              response.message || 'Failed to add cdo.'
            );
          }
        },
        error: () => {
          this.toastrService.error('Server error. Please try again later.');
        },
      });
    }
  
    resetForm(): void {
      this.Form.reset();
      this.showError = false;
    }
  
    validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);

  if (charCode >= 48 && charCode <= 57) {
    return;
  }
  // if (charCode < 48 || charCode > 57) {
  //   event.preventDefault(); // Block non-numeric characters
  // }
    // Allow decimal point (.)
  if (event.key === '.') {
    return;
  }
    // Block everything else
  event.preventDefault();
}

}
