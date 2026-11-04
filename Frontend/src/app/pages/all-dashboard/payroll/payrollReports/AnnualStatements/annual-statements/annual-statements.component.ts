import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject,   } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router,RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';

@Component({
  selector: 'app-annual-statements',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule ],
  templateUrl: './annual-statements.component.html',
  styleUrl: './annual-statements.component.scss'
})
export class AnnualStatementsComponent {
  departmentForm!:FormGroup;
  router=inject(Router);
  selectedLocations: string[] = [];
  selectedDepartment: string[] = [];

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
  OfficeType = [
    { name: '-- Select OfficeType --', value: '' },
    { name: 'Head Office', value: 'MH' }
  ];
  Designation = [
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
  NatureType = [
    { name: '-- Select NewNature --', value: '' },
    { name: 'NA', value: 'MH' },
    { name: 'Parmanent', value: 'MH' },
    { name: 'Probation', value: 'MH' },
  ];
  Month = [
    { name: '-- Select Month --', value: '' },
    { name: 'January', value: 'Jan' },
    { name: 'February', value: 'Feb' },
    { name: 'March', value: 'Mar' },
    { name: 'April', value: 'Apr' },
    { name: 'May', value: 'May' },
    { name: 'June', value: 'Jun' },
    { name: 'July', value: 'Jul' },
    { name: 'August', value: 'Aug' },
    { name: 'September', value: 'Sep' },
    { name: 'October', value: 'Oct' },
    { name: 'November', value: 'Nov' },
    { name: 'December', value: 'Dec' },
  ];
  PostingCity = [
    { name: '-- Select Month --', value: '' },
    { name: 'Mumbai', value: 'MUM' }, // January
    { name: 'Delhi', value: 'DEL' },  // February
    { name: 'Bangalore', value: 'BLR' }, // March
    { name: 'Hyderabad', value: 'HYD' }, // April
    { name: 'Ahmedabad', value: 'AHM' }, // May
    { name: 'Chennai', value: 'CHE' }, // June
    { name: 'Kolkata', value: 'KOL' }, // July
    { name: 'Surat', value: 'SUR' }, // August
    { name: 'Pune', value: 'PUN' }, // September
    { name: 'Jaipur', value: 'JAI' }, // October
    { name: 'Lucknow', value: 'LUC' }, // November
    { name: 'Kanpur', value: 'KAN' }, // December
  ];
  Year = [
    { name: '-- Select Year --', value: '' },
    { name: '2020', value: '2021' },
    { name: '2021', value: '2022' },
    { name: '2022', value: '2023' },
    { name: '2023', value: '2024' },
    { name: '2024', value: '2025' },
    { name: '2025', value: '2026' },
    { name: '2026', value: '2027' },
    { name: '2027', value: '2027' }
  ];
  ShortBy = [
    { name: '-- Select ShortBy --', value: '' },
    { name: 'Employee Code', value: 'Employee Code' },
    { name: 'Employee Name', value: 'Employee Name' },
    { name: 'Location', value: 'Location' },
    { name: 'Department', value: 'Department' },
    { name: 'Designaion', value: 'Designaion' },
    { name: 'City', value: 'City' }
  ];
  ReportType = [
    { name: '-- Select ReportType --', value: '' },
    { name: 'Daily Attendance Consolidation', value: 'MH' }
  ];


}
