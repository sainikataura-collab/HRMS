import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from "../../../payroll/Employee/common-search/common-search.component";
import { HrmanagementService } from '../hrmanagement.service';

@Component({
  selector: 'app-budgetissuemaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './budgetissuemaster.component.html',
  styleUrl: './budgetissuemaster.component.scss'
})
export class BudgetissuemasterComponent {
  Budgetissuemasterform!: FormGroup;
  submitted=false;

selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: HrmanagementService) {}

  ngOnInit() {
    this.Budgetissuemasterform = this.fb.group({
      EmployeeCode: ['',Validators.required],
      FinancialYear: ['',Validators.required],
      CardType: ['',Validators.required],
      DurationofBudgetValidity: ['',Validators.required],
      BudgetType: ['',Validators.required],
      ProjectedAmount: ['',Validators.required],
      IsActive: [false],
  
      

    });
  }    
 
  submit() {
    this.submitted = true;
    if (this.Budgetissuemasterform.invalid) {
      alert('Please fill out all required fields!');
      return;
    }
    const payload = this.Budgetissuemasterform.value;
    console.log('Submitting:', payload);
    this.httpservice.Budgetissuemasterinsert(payload).subscribe(
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
         this.Budgetissuemasterform.reset();
       
        }

}
