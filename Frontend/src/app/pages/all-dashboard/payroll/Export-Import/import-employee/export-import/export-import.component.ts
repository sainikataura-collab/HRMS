import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-export-import',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,FormsModule,NgxPaginationModule],
  templateUrl: './export-import.component.html',
  styleUrl: './export-import.component.scss'
})
export class ExportImportComponent {
 submitted=false;
  showError =false;
 ExportForm!: FormGroup;
 ImportForm!: FormGroup;
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
months = [
  { name: 'January', value: '01' },
  { name: 'February', value: '02' },
  { name: 'March', value: '03' },
  { name: 'April', value: '04' },
  { name: 'May', value: '05' },
  { name: 'June', value: '06' },
  { name: 'July', value: '07' },
  { name: 'August', value: '08' },
  { name: 'September', value: '09' },
  { name: 'October', value: '10' },
  { name: 'November', value: '11' },
  { name: 'December', value: '12' }
];

years = [
  { name: '2019', value: '2019' },
  { name: '2020', value: '2020' },
  { name: '2021', value: '2021' },
  { name: '2022', value: '2022' },
  { name: '2023', value: '2023' },
  { name: '2024', value: '2024' }
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
      month: ['',[ Validators.required]],
      year: ['',[ Validators.required]],
      department: [[]], // should be an array
    
    });
    this.ImportForm = this.fb.group({

      file: ['']
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
         this.ImportForm.reset();

        }
}
