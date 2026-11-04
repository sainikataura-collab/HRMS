import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { HrmanagementService } from '../hrmanagement.service';

@Component({
  selector: 'app-dueclearencemaster',
  standalone: true,
  imports: [FormsModule,RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],

  templateUrl: './dueclearencemaster.component.html',
  styleUrl: './dueclearencemaster.component.scss'
})
export class DueclearencemasterComponent {
  Dueclearencemasterform!: FormGroup;
  submitted=false;

selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: HrmanagementService) {}

  ngOnInit() {
    this.Dueclearencemasterform = this.fb.group({
      Description: ['',Validators.required],
      OrderNumber: ['',Validators.required],
      InputType: ['',Validators.required],
      IsActive: [false],
  
      

    });
  }    
 
  submit() {
    this.submitted = true;
    if (this.Dueclearencemasterform.invalid) {
      alert('Please fill out all required fields!');
      return;
    }
    const payload = this.Dueclearencemasterform.value;
    console.log('Submitting:', payload);
    this.httpservice.Dueclearencemasterinsert(payload).subscribe(
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
         this.Dueclearencemasterform.reset();
       
        }
}
