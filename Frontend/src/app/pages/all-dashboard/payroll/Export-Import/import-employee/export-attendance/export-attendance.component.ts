import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-export-attendance',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,FormsModule,NgxPaginationModule],
  templateUrl: './export-attendance.component.html',
  styleUrl: './export-attendance.component.scss'
})
export class ExportAttendanceComponent {
  ExportForm!: FormGroup;
  submitted=false;
  showError =false;

  selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];
locations = [
  { name: 'Select All', value: 'all' },  // Select All option
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];

departments = [
  { name: 'Select All', value: 'all' },  // Select All option
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];
selectedLocations: string[] = [];
  selectedDepartments : string[] = [];

  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit() {
    this. ExportForm = this.fb.group({
      employeeCode: [''],
      employeeName: [''],
      officeType: [''],
      designation: [''],
      location: [[]],  // should be an array
      postingCity: [''],
      grade:[''],
      reportType:[''],
      NatureType: [''],
      fromDate: ['',[ Validators.required]],
      toDate: ['',[ Validators.required]],
      department: [[]], // should be an array
    
    });
  }    
  toggleSelectAllDepartments(event: any) {
    if (event.target.checked) {
      this.selectedDepartments = this.departments.slice(1).map(dep => dep.value); // All except "Select All"
    } else {
      this.selectedDepartments = [];
    }
  }
  // Toggle individual selection
  toggleDepartments(department: string) {
    if (this.selectedDepartments.includes(department)) {
      this.selectedDepartments = this.selectedDepartments.filter(item => item !==department);
    } else {
      this.selectedDepartments.push(department);
    }
  }
  // Check if all locations are selected
  isAllSelectedDepartments(): boolean {
    return this.selectedDepartments.length === this.departments.length - 1;
  }
  
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedLocations = this.locations.slice(1).map(loc => loc.value); // All except "Select All"
    } else {
      this.selectedLocations = [];
    }
  }
  // Toggle individual selection
  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
  }
  // Check if all locations are selected
  isAllSelected(): boolean {
    return this.selectedLocations.length === this.locations.length - 1;
  }

  OnSubmit(){
    this.submitted = true;
    if (this.ExportForm.invalid) {
      this.showError = true;
      return;
    }
    
   }
  resetForm(): void {
         this. ExportForm.reset();
         this.selectedLocations = [];
         this.selectedDepartments = [];

        }
}


