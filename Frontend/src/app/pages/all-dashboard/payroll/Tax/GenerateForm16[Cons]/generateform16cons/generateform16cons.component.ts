import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject,   } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';
import { Generateform16consService } from '../../../services/generateform16cons.service';

@Component({
  selector: 'app-generateform16cons',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule,CommonSearchComponent ],
  templateUrl: './generateform16cons.component.html',
  styleUrl: './generateform16cons.component.scss'
})
export class Generateform16consComponent {
  departmentForm!:FormGroup;
  router=inject(Router);
   constructor(private  fb:FormBuilder,private http:HttpClient,private generateform16consService : Generateform16consService  ){}
  
   ngOnInit(): void {
    // Initialize the form
    this.departmentForm = this.fb.group({
      NatureType: [['']], // Employee type dropdown
      Month: [['']], // Employee type dropdown
      PostingCity: [['']], // Employee type dropdown
      FinancialYear: [['']], // Employee type dropdown
      ShortBy: [['']], // Employee type dropdown
      QuarterNumber: [['']], // Employee type dropdown
      Dated: [['']], // Employee type dropdown
    });
  }

 
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
  FinancialYear = [
    { name: '-- Select Year --', value: '' },
    { name: '2020-2021', value: '2021' },
    { name: '2021-2021', value: '2022' },
    { name: '2022-2022', value: '2023' },
    { name: '2023-2023', value: '2024' },
    { name: '2024-2025', value: '2025' },
    { name: '2025-2026', value: '2026' },
    { name: '2026-2027', value: '2027' },
    { name: '2027-2027', value: '2027' }
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
  QuarterNumber = [
    { name: '-- Select QuarterNumber --', value: '' },
    { name: 'Frist Quater', value: 'FQ' },
    { name: 'Second Quater', value: 'SQ' },
    { name: 'Third Quater', value: 'TQ' },
    { name: 'Forth Quater', value: 'FQ' },
  ];

  onSubmit(): void {
    if (this.departmentForm.valid) {
      const formData = this.departmentForm.value;
      this.generateform16consService.submitGenerateform16consData(formData).subscribe(
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
    this.departmentForm.reset();
    
  }
}
