import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { Router,RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';
import { ListofmasterService } from '../../../services/listofmaster.service';

@Component({
  selector: 'app-list-of-master',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule,CommonSearchComponent],
  templateUrl: './list-of-master.component.html',
  styleUrl: './list-of-master.component.scss'
})
export class ListOfMasterComponent {
  ListOfMasterForm!:FormGroup;
  constructor(private  fb:FormBuilder,private http:HttpClient,private listofmasterService : ListofmasterService ){}
  router=inject(Router);
  ngOnInit(): void {
    // Initialize the form
    this.ListOfMasterForm = this.fb.group({
      ReportType: [['']], // Employee type dropdown
    });
  }

  ReportType :any []=  [
    { name: '-- Select ReportType --', value: '' },
    { name: 'List Of City', value: 'List Of City' },
    { name: 'List Of Location', value: 'List Of Location' },
    { name: 'List Of Department', value: 'List Of Department' },
    { name: 'List Of nature', value: 'List Of nature' },
    { name: 'List Of Degination', value: 'List Of Degination' },
    { name: 'List Of Grade', value: 'List Of Grade' },
    { name: 'List Of Bank', value: 'List Of Bank' },
    { name: 'List Of Religion', value: 'List Of Religion' },
    { name: 'List Of Catogery', value: 'List Of Catogery' },
    { name: 'List Of Formula', value: 'List Of Formula' },
    { name: 'List Of Holidays', value: 'List Of Holidays' },
    { name: 'List Of Heads', value: 'List Of Heads' },
  ];

  onSubmit(): void {
    if (this.ListOfMasterForm.valid) {
      const formData = this.ListOfMasterForm.value;
      this.listofmasterService.submitListofmasterData(formData).subscribe(
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
    this.ListOfMasterForm.reset();
    
  }
}
