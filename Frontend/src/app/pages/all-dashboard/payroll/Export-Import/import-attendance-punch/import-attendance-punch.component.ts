import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ImportAttendancePunchService } from '../../services/import-attendance-punch.service';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-import-attendance-punch',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectComponent],
  templateUrl: './import-attendance-punch.component.html',
  styleUrl: './import-attendance-punch.component.scss'
})
export class ImportAttendancePunchComponent {
  ImportForm!: FormGroup;
  AttendanceForm!: FormGroup;

  submitted=false;
  showError = false;

months = [
  { name: 'January', value: '01' },
  { name: 'February', value: '02' },
  { name: 'March', value: '03' },
  { name: 'April', value: '04' },
  { name: 'May', value: '05' },
  { name: 'June', value: '06' },
  { name: 'July', value: '07' },
  { name: 'August', value: '08' },
  { name: 'September', value: '09' },
  { name: 'October', value: '10' },
  { name: 'November', value: '11' },
  { name: 'December', value: '12' }
];

years = [
  { name: '2019', value: '2019' },
  { name: '2020', value: '2020' },
  { name: '2021', value: '2021' },
  { name: '2022', value: '2022' },
  { name: '2023', value: '2023' },
  { name: '2024', value: '2024' }
];
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private importAttendancePunchService:ImportAttendancePunchService) {}

  ngOnInit() {
    this.AttendanceForm = this.fb.group({

      fromDate: ['',[ Validators.required]],
      toDate: ['',[ Validators.required]],
    });
    this.ImportForm = this.fb.group({

      month: ['',[ Validators.required]],
      year: ['',[ Validators.required]],
      file: ['']
    });
  }    
 OnSubmit(){
  this.submitted = true;
  if (this. AttendanceForm.invalid) {
    this.showError = true;
    return;
  }
  const data = {
    ...this.AttendanceForm.value 
    };

      this.importAttendancePunchService.add_Job(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      })
 }

 OnImport(){
  this.submitted = true;
  if (this.ImportForm.invalid) {
    this.showError = true;
    return;
  }
  const data = {
    ...this.ImportForm.value 
    };

      this.importAttendancePunchService.add_Job(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      })
 }

 exportToExcel(): void {
  this.importAttendancePunchService.exportExcel().subscribe((res: Blob) => {
    const url = window.URL.createObjectURL(res);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Employee_List.xlsx'; // Set the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, (error) => {
    console.error('Error downloading the file', error);
  });
}
  resetForm(): void {
         this. ImportForm.reset();
        
        }
}


