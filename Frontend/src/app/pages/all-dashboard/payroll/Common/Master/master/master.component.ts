import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import {NgSelectModule, } from '@ng-select/ng-select';
import { MasterService } from '../../../services/master.service';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [ReactiveFormsModule,NgSelectModule,CommonModule,MatButtonModule,MatFormFieldModule,MatSelectModule,MatCheckboxModule,FormsModule,CommonSearchComponent],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss'
})
export class MasterComponent implements OnInit{
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  constructor(private  fb:FormBuilder,private http:HttpClient,private masterService : MasterService){}
  departmentForm!:FormGroup;

  router=inject(Router)
 

  LeaveNatureType = [
    { name: '-- Select Location --', value: '' },
    { name: 'Maharashtra', value: 'MH' }, 
    { name: 'Uttar Pradesh', value: 'UP' },
    { name: 'Tamil Nadu', value: 'TN' },
    { name: 'Karnataka', value: 'KR' },
    { name: 'West Bengal', value: 'WB' },
    { name: 'Rajasthan', value: 'Raj' },
    { name: 'Madhya Pradesh', value: 'Mad' },
    { name: 'Punjab', value: 'Pun' },
    { name: 'Gurgoan', value: 'Gur' },
    { name: 'Saharsa', value: 'Sah' },
    { name: 'Patna', value: 'Pat' }
];

DepartmentType = [
  { name: '-- Select Location --', value: '' },
  { name: 'Human Resources', value: 'HR' }, 
  { name: 'Finance & Accounting', value: 'UP' },
  { name: 'Information Technology', value: 'TN' },
  { name: 'Marketing', value: 'KR' },
  { name: 'Sales', value: 'WB' },
  { name: 'Customer Service', value: 'Raj' },
  { name: 'Research & Development ', value: 'Mad' },
  { name: 'Operations & Production', value: 'Pun' },
  { name: 'Logistics & Supply Chain', value: 'Gur' },
  { name: 'Administration', value: 'Sah' }
];
SelectEmployeeType :any[]= [
  { name: '-- Select Employee --', value: '' },
  { name: 'PP001|shivam Kumar', value: 'PP001|shivam Kumar' }, 
  { name: 'PP001|Ram Kumar', value: 'PP001|Ram Kumar' },
  { name: 'PP001|Golu Kumar', value: 'PP001|Golu Kumar' },
  { name: 'PP001|Shiv Kumar', value: 'PP001|Shiv Kumar' },
  { name: 'PP001|Ravi Kumar', value: 'PP001|Ravi Kumar' },
  { name: 'PP001|Sandeep Kumar', value: 'PP001|Sandeep Kumar' },
  { name: 'PP001|Jay Kumar', value: 'PP001|Jay Kumar' },
  { name: 'PP001|Sumit Kumar', value: 'PP001|Sumit Kumar' },
  { name: 'PP001|Nitesh Kumar', value: 'PP001|Nitesh Kumar' },
  { name: 'PP001|viraj Kumar', value: 'PP001|viraj Kumar' }
];
StatusType = [
  { name: '-- Select Location --', value: '' },
  { name: 'Current', value: 'HR' }, 
  { name: 'Left', value: 'UP' },
  { name: 'All', value: 'UP' },
];



ngOnInit(): void {
  // Initialize the form
  this.departmentForm = this.fb.group({
    SelectEmployeeType: [['']], // Employee type dropdown
    offDays: this.fb.array(
      this.weekDays.map(() => this.fb.array([false, false, false, false, false])) // 5 checkboxes for each day
    )
  });
}
  // Getter for offDays array
  get offDaysArray(): FormArray {
    return this.departmentForm.get('offDays') as FormArray;
  }

  // Get each day's FormArray
  getDayArray(i: number): FormArray {
    return this.offDaysArray.at(i) as FormArray;
  }

  // Get individual checkbox control
  getCheckboxControl(i: number, n: number): FormControl {
    return this.getDayArray(i).at(n) as FormControl;
  }
  onSubmit(): void {
    if (this.departmentForm.valid) {
      const formData = this.departmentForm.value;
      this.masterService.submitMasterData(formData).subscribe(
        (response) => {
          console.log('Data submitted successfully:', response);
          alert('Employee weekly off data saved successfully!');
          this.resetForm();
        },
        (error) => {
          console.error('Error submitting data:', error);
          alert('Error saving data. Please try again.');
        }
      );
    } else {
      alert('Please fill all required fields.');
    }
  }
 
  view(){
    this.router.navigateByUrl("/dash/payrollmaster/MasterList");
   }
  onSearch(){

  }
  onClear(){

  }
  resetForm(){

  }
}
