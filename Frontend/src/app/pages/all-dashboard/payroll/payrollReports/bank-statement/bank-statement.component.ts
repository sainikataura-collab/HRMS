import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-bank-statement',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './bank-statement.component.html',
  styleUrl: './bank-statement.component.scss'
})
export class BankStatementComponent {
EmployeeForm!: FormGroup;
  submitted=false;
  showError = false;

id!:number;
Isedit=false;
selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      // employeeCode: [''],
      // employeeName: [''],
      officeType: [''],
      // designation: [''],
      // location: [[]],  // should be an array
      // postingCity: [''],
      // natureType: [''],
      bankName: ['',[ Validators.required]],
      month: ['',[ Validators.required]],
      year: ['',[ Validators.required]],
     // department: [[]], // should be an array
      salaryType: ['',[ Validators.required]],
      reportType: ['',[ Validators.required]],
      fileType: [false]
    });
  }    
 OnVeiw(){
  this.submitted = true;
  if (this. EmployeeForm.invalid) {
    this.showError = true;
    return;
  }
 }

  resetForm(): void {
         this. EmployeeForm.reset();
        
        }
}


