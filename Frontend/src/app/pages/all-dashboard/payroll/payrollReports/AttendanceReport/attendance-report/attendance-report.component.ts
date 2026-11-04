import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject,   } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router,RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';
import { AttendancereportService } from '../../../services/attendancereport.service';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';


@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule ,CommonSearchComponent],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.scss'
})
export class AttendanceReportComponent {
  AttendanceReportForm!:FormGroup;
  router=inject(Router);
  constructor(private  fb:FormBuilder,private http:HttpClient,private attendancereportService :AttendancereportService){}

  ngOnInit(): void {
    // Initialize the form
    this.AttendanceReportForm = this.fb.group({
      OfficeType: [['']], // Employee type dropdown
      Designation: [['']], // Employee type dropdown
      NatureType: [['']], // Employee type dropdown
      Month: [['']], // Employee type dropdown
      PostingCity: [['']], // Employee type dropdown
      Year: [['']], // Employee type dropdown
      ShortBy: [['']], // Employee type dropdown
      ReportType: [['']], // Employee type dropdown
    });
  }

 
  OfficeType:any []= [
    { name: '-- Select OfficeType --', value: '' },
    { name: 'Head Office', value: 'MH' }
  ];
  Designation:any []= [
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
  NatureType :any []= [
    { name: '-- Select NewNature --', value: '' },
    { name: 'NA', value: 'MH' },
    { name: 'Parmanent', value: 'MH' },
    { name: 'Probation', value: 'MH' },
  ];
  Month :any []=  [
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
  PostingCity:any []= [
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
  Year :any []=  [
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
  ShortBy :any []=  [
    { name: '-- Select ShortBy --', value: '' },
    { name: 'Employee Code', value: 'Employee Code' },
    { name: 'Employee Name', value: 'Employee Name' },
    { name: 'Location', value: 'Location' },
    { name: 'Department', value: 'Department' },
    { name: 'Designaion', value: 'Designaion' },
    { name: 'City', value: 'City' }
  ];
  ReportType :any []=  [
    { name: '-- Select ReportType --', value: '' },
    { name: 'Daily Attendance Consolidation', value: 'Daily Attendance Consolidation' }
  ];

  onSubmit(): void {
    if (this.AttendanceReportForm.valid) {
      const formData = this.AttendanceReportForm.value;
      this.attendancereportService.submitAttendancereportData(formData).subscribe(
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
  resetForm(): void {
    this.AttendanceReportForm.reset();
    
  }
}
