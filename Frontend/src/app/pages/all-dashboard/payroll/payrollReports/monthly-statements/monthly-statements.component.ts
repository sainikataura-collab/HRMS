import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-monthly-statements',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './monthly-statements.component.html',
  styleUrl: './monthly-statements.component.scss'
})
export class MonthlyStatementsComponent {
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
      // shortBy: [''],
      month: ['',[ Validators.required]],
      year: ['',[ Validators.required]],
      //department: [[]], // should be an array
      reportType: [''],

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


