import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { HrmanagementService } from '../hrmanagement.service';
import { CommonSearchComponent } from "../../../payroll/Employee/common-search/common-search.component";

@Component({
  selector: 'app-userparametermaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],

  templateUrl: './userparametermaster.component.html',
  styleUrl: './userparametermaster.component.scss'
})
export class UserparametermasterComponent {
  Userparametermasterform!: FormGroup;
  submitted=false;

selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: HrmanagementService) {}

  ngOnInit() {
    this.Userparametermasterform = this.fb.group({
      EmployeeCode: ['',Validators.required],
      Department: ['',Validators.required],
      Remarks: ['',Validators.required],
      IsActive: [false],
      Parameter: ['',Validators.required],
      RemarksS: ['',Validators.required],
      IsActiveS: [false],
  
      

    });
  }    
 
  submit() {
    this.submitted = true;
    if (this.Userparametermasterform.invalid) {
      alert('Please fill out all required fields!');
      return;
    }
    const payload = this.Userparametermasterform.value;
    console.log('Submitting:', payload);
    this.httpservice.Userparametermasterinsert(payload).subscribe(
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
         this.Userparametermasterform.reset();
       
        }
}
