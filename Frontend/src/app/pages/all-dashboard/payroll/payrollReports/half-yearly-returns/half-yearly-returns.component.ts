import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-half-yearly-returns',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './half-yearly-returns.component.html',
  styleUrl: './half-yearly-returns.component.scss'
})
export class HalfYearlyReturnsComponent {
EmployeeForm!: FormGroup;
  submitted=false;

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
      // shortBy: [''],
      month: [''],
      year: [''],
     // department: [[]], // should be an array
      reportType: [''],
      reportPeriod: [''],

    });
  }    
 
  resetForm(): void {
         this. EmployeeForm.reset();
        
        }
}


