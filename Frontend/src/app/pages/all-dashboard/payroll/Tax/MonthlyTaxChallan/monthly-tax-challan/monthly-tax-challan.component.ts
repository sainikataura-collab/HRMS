import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject,   } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';
import { MonthlytaxchallanService } from '../../../services/monthlytaxchallan.service';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-monthly-tax-challan',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule,CommonSearchComponent ],
  templateUrl: './monthly-tax-challan.component.html',
  styleUrl: './monthly-tax-challan.component.scss'
})
export class MonthlyTaxChallanComponent {
  monthlytaxchallanForm!:FormGroup;
   constructor(private  fb:FormBuilder,private http:HttpClient,private monthlytaxchallanService : MonthlytaxchallanService ){}
  router=inject(Router);

  ngOnInit(): void {
    // Initialize the form
    this.monthlytaxchallanForm = this.fb.group({
      OfficeType: [['']], // Employee type dropdown
      Designation: [['']], // Employee type dropdown
      ReportType: [['']], // Employee type dropdown
      Month: [['']], // Employee type dropdown
      PostingCity: [['']], // Employee type dropdown
      Year: [['']], // Employee type dropdown
      ShortBy: [['']], // Employee type dropdown
      QuarterNumber: [['']], // Employee type dropdown
    });
  }
 
  OfficeType :any []= [
    { name: '-- Select OfficeType --', value: '' },
    { name: 'Head Office', value: 'MH' }
  ];
  Designation:any []=  [
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
  Month:any []=  [
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
  PostingCity :any []= [
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
  QuarterNumber :any []=  [
    { name: '-- Select QuarterNumber --', value: '' },
    { name: 'Frist Quater', value: 'FQ' },
    { name: 'Second Quater', value: 'SQ' },
    { name: 'Third Quater', value: 'TQ' },
    { name: 'Forth Quater', value: 'FQ' },
  ];

  onSubmit(): void {
    if (this.monthlytaxchallanForm.valid) {
      const formData = this.monthlytaxchallanForm.value;
      this.monthlytaxchallanService.submitMonthlyTaxChallanData(formData).subscribe(
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
    this.monthlytaxchallanForm.reset();
    
  }

}
