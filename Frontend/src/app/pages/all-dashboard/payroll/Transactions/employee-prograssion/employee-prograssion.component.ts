
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { Component, inject,HostListener, OnInit, ViewChild, NgModule } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { Router,RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';

import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';


@Component({
  selector: 'app-employee-prograssion',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule,CommonSearchComponent],
 
  templateUrl: './employee-prograssion.component.html',
  styleUrl: './employee-prograssion.component.scss'
 
})




export class EmployeePrograssionComponent {
 
  isFilterFormVisible = false;

toggleFilterForm(event: Event) {
  event.preventDefault();
  this.isFilterFormVisible = !this.isFilterFormVisible;
}

closeFilterForm() {
  this.isFilterFormVisible = false;
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event) {
  const clickedInsideModal = (event.target as HTMLElement).closest('.card.shadow-lg');
  const clickedButton = (event.target as HTMLElement).closest('.input-group-text');

  if (!clickedInsideModal && !clickedButton) {
    this.isFilterFormVisible = false;
  }
}



onModalClick(event: Event) {
  event.stopPropagation();
}

  // 

  departmentForm!:FormGroup;
  router=inject(Router);
  selectedLocations: string[] = [];
  selectedDepartment: string[] = [];

  EmployeeCode = [
    { name: '-- Select EmployeeCode --', value: '' },
  ];
  Status = [
    { name: '-- Select Status --', value: '' },
    { name: 'Normal Change', value: 'Male' }, 
    { name: 'Increment', value: 'Female' },
    { name: 'Promotion', value: 'Other' },
    { name: 'Transfer', value: 'Other' },
  ];

  OfficeType=[
    {name:'--select office Type--', value: ''},
    {name:'Head Office', value:'office type'}
  ]

  Location = [
    { name: '-- Select Location --', value: '' },
    { name: 'Mumbai', value: 'MH' },
    { name: 'Delhi', value: 'DL' },
    { name: 'Bangalore', value: 'KA' },
    { name: 'Hyderabad', value: 'TS' },
    { name: 'Ahmedabad', value: 'GJ' },
    { name: 'Chennai', value: 'TN' },
    { name: 'Kolkata', value: 'WB' },
    { name: 'Surat', value: 'GJ' },
    { name: 'Pune', value: 'MH' },
    { name: 'Jaipur', value: 'RJ' },
    { name: 'Lucknow', value: 'UP' },
    { name: 'Kanpur', value: 'UP' },
    { name: 'Nagpur', value: 'MH' },
    { name: 'Indore', value: 'MP' },
    { name: 'Thane', value: 'MH' }
  ];
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedLocations = this.Location.slice(1).map(loc => loc.value); // All except "Select All"
    } else {
      this.selectedLocations = [];
    }
  }
  // Toggle individual selection
  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
  }
  // Check if all locations are selected
  isAllSelected(): boolean {
    return this.selectedLocations.length === this.Location.length - 1;
  }

  NewDepartment = [
    { name: '-- Select DepartmentType --', value: '' },
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
  toggleNewDepartmentAll(event: any) {
    if (event.target.checked) {
      this.selectedDepartment = this.NewDepartment.slice(1).map(Dep => Dep.value); // All except "Select All"
    } else {
      this.selectedDepartment = [];
    }
  }
  // Toggle individual selection
  toggleNewDepartment(NewDepartment: string) {
    if (this.selectedDepartment.includes(NewDepartment)) {
      this.selectedDepartment = this.selectedDepartment.filter(item => item !== NewDepartment);
    } else {
      this.selectedDepartment.push(NewDepartment);
    }
  }
  // Check if all locations are selected
  isAllSelectedDepartment(): boolean {
    return this.selectedDepartment.length === this.NewDepartment.length - 1;
  }

  NewDesignation = [
    { name: '-- Select NewDesignation --', value: '' },
    { name: 'AGM', value: 'MH' },
    { name: 'Area Sales Manager', value: 'DL' },
    { name: 'Assistant', value: 'KA' },
    { name: 'Assistant Manager', value: 'TS' },
    { name: 'Associate', value: 'GJ' },
    { name: 'Ast Manager', value: 'TN' },
    { name: 'Consultant', value: 'WB' },
    { name: 'DGM', value: 'GJ' },
    { name: 'Driver', value: 'MH' },
    { name: 'Head', value: 'RJ' },
  ];

  NewPostingCity = [
    { name: '-- Select Location --', value: '' },
    { name: 'Mumbai', value: 'MH' },
    { name: 'Delhi', value: 'DL' },
    { name: 'Bangalore', value: 'KA' },
    { name: 'Hyderabad', value: 'TS' },
    { name: 'Ahmedabad', value: 'GJ' },
    { name: 'Chennai', value: 'TN' },
    { name: 'Kolkata', value: 'WB' },
    { name: 'Surat', value: 'GJ' },
    { name: 'Pune', value: 'MH' },
    { name: 'Jaipur', value: 'RJ' },
    { name: 'Lucknow', value: 'UP' },
    { name: 'Kanpur', value: 'UP' },
    { name: 'Nagpur', value: 'MH' },
    { name: 'Indore', value: 'MP' },
    { name: 'Thane', value: 'MH' }
  ];
  NewFunction = [
    { name: '-- Select NewFunction --', value: '' },
    { name: 'NA', value: 'MH' }
  ];
  NewNature = [
    { name: '-- Select NewNature --', value: '' },
    { name: 'NA', value: 'MH' },
    { name: 'Parmanent', value: 'MH' }
  ];
  NewAccommodation = [
    { name: '-- Select NewAccommodation --', value: '' },
    { name: 'Self', value: 'MH' },
    { name: 'Company Provided', value: 'MH' }
  ];
  ChangeSalary = [
    { name: '-- Select ChangeSalary --', value: '' },
    { name: 'Yes', value: 'MH' },
    { name: 'No', value: 'MH' }
  ];

  NewBankName = [
    { name: '-- Select NewBankName --', value: '' },
    { "name": "State Bank of India", "value": "SBI" },
    { "name": "HDFC Bank", "value": "HDFC" },
    { "name": "ICICI Bank", "value": "ICICI" },
    { "name": "Axis Bank", "value": "AXIS" },
    { "name": "Kotak Mahindra Bank", "value": "KOTAK" },
    { "name": "Punjab National Bank", "value": "PNB" },
    { "name": "Bank of Baroda", "value": "BOB" },
    { "name": "Canara Bank", "value": "CANARA" },
    { "name": "Union Bank of India", "value": "UBI" },
    { "name": "IndusInd Bank", "value": "INDUS" },
    { "name": "Yes Bank", "value": "YES" },
    { "name": "IDFC First Bank", "value": "IDFC" },
    { "name": "Federal Bank", "value": "FEDERAL" },
    { "name": "RBL Bank", "value": "RBL" },
    { "name": "UCO Bank", "value": "UCO" }
  ];
  NewLocation = [
    { name: '-- Select NewLocation --', value: '' },
    { name: 'Mumbai', value: 'MH' },
    { name: 'Delhi', value: 'DL' },
    { name: 'Bangalore', value: 'KA' },
    { name: 'Hyderabad', value: 'TS' },
    { name: 'Ahmedabad', value: 'GJ' },
    { name: 'Chennai', value: 'TN' },
    { name: 'Kolkata', value: 'WB' },
    { name: 'Surat', value: 'GJ' },
    { name: 'Pune', value: 'MH' },
    { name: 'Jaipur', value: 'RJ' },
    { name: 'Lucknow', value: 'UP' },
    { name: 'Kanpur', value: 'UP' },
    { name: 'Nagpur', value: 'MH' },
    { name: 'Indore', value: 'MP' },
    { name: 'Thane', value: 'MH' }
  ];
  NewGrade = [
    { name: '-- Select NewGrade --', value: '' },
    { name: 'NA', value: 'MH' }
  ];

  SortBy=[
    {name:'--Sorted By --',value:''},
    {name:'Emoloyee Code',value:'EmployeeCode'},
    {name:'Employee Name',value:'EmployeeName'},
    {name:'Location',value:'Location'},
    {name:'Department',value:'Department'},
    {name:'Designation',value:'Designation'},
    {name:'city',value:'City'}
  ]

  
  
}

