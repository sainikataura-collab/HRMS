import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NoService } from '../../services/no.service';
import { CommonSearchComponent } from '../common-search/common-search.component';

@Component({
  selector: 'app-no',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './no.component.html',
  styleUrl: './no.component.scss'
})
export class NoComponent {

  UpdateEmployeeForm!: FormGroup;
  submitted=false;
  showEmployeeList: boolean = false;

id!:number;
Isedit=false;
selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];
// locations = [
//   { name: 'Select All', value: 'all' },  // Select All option
//   { name: 'Ahemadabad', value: 'Ahemadabad' },
//   { name: 'Alwar', value: 'Alwar' },
//   { name: 'Ankleshwar', value: 'Ankleshwar' },
//   { name: 'Ambala', value: 'Ambala' }
// ];

// departments = [
//   { name: 'Select All', value: 'all' },  // Select All option
//   { name: 'Ahemadabad', value: 'Ahemadabad' },
//   { name: 'Alwar', value: 'Alwar' },
//   { name: 'Ankleshwar', value: 'Ankleshwar' },
//   { name: 'Ambala', value: 'Ambala' }
// ];
// selectedLocations: string[] = [];
//   selectedDepartments : string[] = [];
 

  constructor(private fb: FormBuilder,private holidaysMasterService:NoService,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit() {
    this.UpdateEmployeeForm = this.fb.group({
      employeeCode: [''],
      employeeName: [''],
      officeType: [''],
      designation: [''],
      location: [[]],  // should be an array
      PostingCity: [''],
      NatureType: [''],
      ShortBy: [''],
      EmployeeStatus: [''],
      department: [[]], // should be an array
      PersonalMobileNo: [''],
      OfficialMobileNo: [false]
    });
  }    

toggleEmployeeList() {
  this.showEmployeeList = true; // Show Employee List
}
  resetForm(): void {
         this. UpdateEmployeeForm.reset();
         
        }
}


