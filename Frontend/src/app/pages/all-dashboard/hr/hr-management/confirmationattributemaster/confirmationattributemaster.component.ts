import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { HrmanagementService } from '../hrmanagement.service';

@Component({
  selector: 'app-confirmationattributemaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],

  templateUrl: './confirmationattributemaster.component.html',
  styleUrl: './confirmationattributemaster.component.scss'
})
export class ConfirmationattributemasterComponent {
  Confirmationattributemasterform!: FormGroup;
  submitted=false;
  ConfirmationattributemasterList = [
    { id: 1,Assesment: '	Reporting Manager',Score	: '1',OrderNo	 :"true",Active:"yes"},
    { id: 2, Assesment: '	Reporting Manager',Score	: '1',OrderNo	 :"true",Active:"yes"},
    { id: 3,Assesment: '	Reporting Manager',Score	: '1',OrderNo	 :"true",Active:"yes"},
    { id: 4,Assesment: '	Reporting Manager',Score	: '1',OrderNo	 :"true",Active:"yes"} ]; 


    delete(Id: number): void {
      const confirmation = window.confirm("Are you sure you want to delete this Confirmationattributemaster?");
      
      if (confirmation) {
        // Proceed with deletion if the user confirms
        const index = this.ConfirmationattributemasterList.findIndex(c => c.id === Id);
        if (index !== -1) {
          this.ConfirmationattributemasterList.splice(index, 1); 
          console.log('Confirmationattributemaster deleted:', Id);
        }
      } else {
        // Do nothing if the user cancels
        console.log('Confirmationattributemaster deletion cancelled');
      }
    }
    
selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: HrmanagementService) {}

  ngOnInit() {
    this.Confirmationattributemasterform = this.fb.group({
      Category: ['',Validators.required],
      Description: ['',Validators.required],
      Remarks: ['',Validators.required],
   
      DisplayOrder:['',Validators.required],
      Assesment:[''],
      Score:[''],
      DisplayOrders:[''],
      IsActive: [false],
   
      IsActivess: [false],
  
      

    });
  }    
 
  submit() {
    this.submitted = true;
    if (this.Confirmationattributemasterform.invalid) {
      alert('Please fill out all required fields!');
      return;
    }
    const payload = this.Confirmationattributemasterform.value;
    console.log('Submitting:', payload);
    this.httpservice.confirmationinsert(payload).subscribe(
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
         this.Confirmationattributemasterform.reset();
       
        }
}
