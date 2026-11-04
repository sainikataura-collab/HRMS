import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../common-search/common-search.component';
import { seniorityLevel } from '../../../services/senioritylevel.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seniority-level',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './seniority-level.component.html',
  styleUrl: './seniority-level.component.scss'
})
export class SeniorityLevelComponent {


 seniorityForm!:FormGroup;

 locations = [
    { name: 'Ahemdabad', value: 'ahmedabad' },
    { name: 'Alwar', value: 'alwar' },
    { name: 'Ambala', value: 'ambala' },
    { name: 'Ankleshwar', value: 'ankleshwar' }
  ];

    // Static Data for Employees
    employees: { label: string, value: string }[]  = []; 
    Senior: { label: string, value: string }[]  = []; 


    // employees = [
    //   {  code: '0' ,name: '-select emp -',},
    //   { code: 'EMP001', name: 'EMP001||John'},
    //   { code: 'EMP001', name: 'EMP001||John Doe' },

    //   { code: 'EMP002', name: 'EMP002||Jane Smith' },
    //   { code: 'EMP003', name: 'EMP003||Brown' }
    // ];


    // Senior = [
    //   { value: 'EMP001', name: 'John Doe' },
    //   { value: 'EMP002', name: 'Jane Smith' },
    //   { code: 'EMP003', name: 'Robert Brown' }
    // ];

  status = [
    { name: 'Current', value: 'N' }, 
    { name:'Left'   , value:'Y'},
    { name: 'All', value:'' }];

  department = [{ name: 'Account', value: 'A' }, { name: 'Admin', value: 'Ad'}];
  
  
  searchTo =  [
    { name: '-- level--', value: '0' },
    { name: 'Employee', value: 'E' }, 
    { name: 'Senior', value: 'S' },

];

filteredEmployees = [...this.employees]; //  for dynamic filtering

seniorityLevels: any[] = []; 
// filteredEmployees: any[] = []; // Stores filtered names based on entered code

  constructor(
    private fb:FormBuilder,
    private seniorityService:seniorityLevel,
    private toasteservice:ToastrService
  ){}

  ngOnInit():void{
  this.seniorityForm=this.fb.group({
    code: [''],
    employeeCode: [''],
    name: [''],
    location: [null],
    department: [''],
    status: [''],
    searchTo: [''],
    seniorEmployeeCode: [null],
    orderNo: [''],
  

  });

  this.getEmployeeList('Employee');
  }

  getEmployeeList(fieldName: string) {
    debugger
    this.seniorityService.getEmpList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.employees = res.data.map((employeeCode: any) => ({
                    name: employeeCode.name,
                    value: employeeCode.value
                }));
            } else {
                this.toasteservice.error("Failed to load Employee list.");
            }
            
        },
        error: (err) => {
            console.error("Error fetching  Emp list:", err);
            this.toasteservice.error("Error fetching Employee list.");
            
        }
    });
  }
  getSeriorEmpList(fieldName: string) {
    debugger
    this.seniorityService.getEmpList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.Senior = res.data.map((seniorEmployeeCode: any) => ({
                    name: seniorEmployeeCode.name,
                    value: seniorEmployeeCode.value
                }));
            } else {
                this.toasteservice.error("Failed to load Employee list.");
            }
            
        },
        error: (err) => {
            console.error("Error fetching  Emp list:", err);
            this.toasteservice.error("Error fetching Employee list.");
            
        }
    });
  }

    // Method for adding seniority level data


   
    // addSeniorityLevel() {
    //   if (this.seniorityForm.valid) {
    //     this.seniorityLevels.push(this.seniorityForm.value); // Add the form data to the list
    //     console.log(this.seniorityLevels); // Log the data to the console
    //     this.seniorityForm.reset(); // Optionally reset the form after adding
    //   } else {
    //     console.log('Form is invalid');
    //   }

    // }
  
    addSeniorityLevel() {
      if (this.seniorityForm.valid) {
        this.seniorityLevels.push(this.seniorityForm.value);
        this.seniorityForm.reset();
      }
    }
    saveSeniorityLevels() {
      if (this.seniorityLevels.length > 0) {
        this.seniorityService.save_seniorityLevel(this.seniorityLevels).subscribe
        (response => {
          console.log('Data saved successfully', response);
          alert('Data saved successfully!');
          this.seniorityLevels = []; // Clear the list after saving
        }, error => {
          console.error('Error saving data', error);
          alert('Failed to save data.');
        });
      } else {
        alert('No data to save.');
      }
    }
   
  //   searchEmployee() {
  //     const enteredCode = this.seniorityForm.get('code')?.value.trim();
      
  //     if (enteredCode) {
  //       // Filter employees based on entered code
  //       this.filteredEmployees = this.employees.filter(emp => emp.code.includes(enteredCode));
  //     } else {
  //       // If code is empty, show all employees
  //       this.filteredEmployees = [...this.employees];
  //     }
  //}
 
     onSubmit() {
    console.log(this.seniorityForm.value);
  }
}
