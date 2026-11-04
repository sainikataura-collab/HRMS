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
import { GenerateereturnService } from '../../../services/generateereturn.service';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-generate-ereturn',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule,CommonSearchComponent ],
  templateUrl: './generate-ereturn.component.html',
  styleUrl: './generate-ereturn.component.scss'
})
export class GenerateEreturnComponent {
  generateEreturn!:FormGroup;
  router=inject(Router);
  constructor(private  fb:FormBuilder,private http:HttpClient,private generateereturnService : GenerateereturnService){}

  ngOnInit(): void {
    // Initialize the form
    this.generateEreturn = this.fb.group({
      QuarterNumber: [['']], // Employee type dropdown
      Form: [['']], // Employee type dropdown
      ReportType: [['']], // Employee type dropdown
      Dated: [['']], // Employee type dropdown
    });
  }
  QuarterNumber = [
    { name: '-- Select QuarterNumber --', value: '' },
    { name: 'Frist Quater', value: 'FQ' },
    { name: 'Second Quater', value: 'SQ' },
    { name: 'Third Quater', value: 'TQ' },
    { name: 'Forth Quater', value: 'FQ' },
  ];
  Form = [
    { name: '-- Select Form --', value: '' },
    { name: 'From 24/24Q[Salary]', value: 'From 24/24Q[Salary]' },
    
  ];
  ReportType = [
    { name: '-- Select ReportType --', value: '' },
    { name: 'Ereturn', value: 'Ereturn' },
    { name: 'From', value: 'From' },
    { name: 'From 27A' , value: 'From 27A'}
  ];

  onSubmit(): void {
    if (this.generateEreturn.valid) {
      const formData = this.generateEreturn.value;
      this.generateereturnService.submitGenerateereturnData(formData).subscribe(
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
    this.generateEreturn.reset();
    
  }
}
