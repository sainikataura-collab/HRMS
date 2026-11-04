import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';

@Component({
  selector: 'app-previous-tax-details',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './previous-tax-details.component.html',
  styleUrl: './previous-tax-details.component.scss'
})
export class PreviousTaxDetailsComponent {
EmployeeForm!: FormGroup;
  submitted=false;

selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: PayrollService) {}

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      empCode: [''],
      employeeCode: ['',Validators.required],
      employeeName: [''],
      location: [''],
      department: [''],
      profTaxPaid: [''],
      enterAllow: [''],
      deductFrom: [''],
      fromDate: ['',Validators.required],
      toDate: ['',Validators.required],
      designation: [''],
      gSalary_T: [''],
      gSalary_NT: [''],
      gHRA_T: [''],
      gHRA_NT: [''],
      gConveyance_T: [''],
      gConveyance_NT: [''],
      gPerk_T: [''],
      gPerk_NT: [''],
      gCEA_T: [''],
      gCEA_NT: [''],
      incomeTaxPaid_T: [''],
     
    });
  }    
 
  submit() {
    this.submitted = true;
    if (this.EmployeeForm.invalid) {
      alert('Please fill out all required fields!');
      return;
    }
    const payload = this.EmployeeForm.value;
    console.log('Submitting:', payload);
    this.httpservice.previousinsert(payload).subscribe(
      (response) => {
        console.log('API Response:', response);
        alert('Record saved successfully');
      },
      (error) => {
        console.error('API Error:', error);
        alert('Error saving record');
      }
    );
  }
 

  resetForm(): void {
         this. EmployeeForm.reset();
       
        }
}



