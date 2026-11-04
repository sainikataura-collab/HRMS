import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-loan-or-adv-status',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './loan-or-adv-status.component.html',
  styleUrl: './loan-or-adv-status.component.scss'
})
export class LoanOrAdvStatusComponent {
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
      toDate: [''],
      fromDate: [''],
     // department: [[]], // should be an array
   
    });
  }    
 


  resetForm(): void {
         this. EmployeeForm.reset();
        
        }
}


