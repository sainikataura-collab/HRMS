import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { UpdateMobileDeviceIdService } from '../../services/update-mobile-device-id.service';
import { CommonSearchComponent } from '../common-search/common-search.component';

@Component({
  selector: 'app-update-mobile-device-id',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './update-mobile-device-id.component.html',
  styleUrl: './update-mobile-device-id.component.scss'
})
export class UpdateMobileDeviceIdComponent {
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
 

  constructor(private fb: FormBuilder,private holidaysMasterService:UpdateMobileDeviceIdService,private  toastrService: ToastrService,private router: Router) {}

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

toggleEmployeeList() {
  this.showEmployeeList = true; // Show Employee List
}


  // onSubmit(){
  //   this.submitted=true;
  //   const data = {
  //     ...this.holidayForm.value 
  //     };
  //        this.holidaysMasterService.update_holidaysMaster(this.id,data).subscribe({
  //         next: (result) => {
  //           if (result.isSuccess) {
  //             this.toastrService.success(result.message);
  //           } else {
  //             this.toastrService.error(result.message);
  //           }
  //         },
  //         error: () => {
  //           // Error handling in case of a failure during form submission
  //           this.toastrService.error('An error occurred during form submission');
  //         }
  //        })
      
     
      
  // }
  resetForm(): void {
         this. UpdateEmployeeForm.reset();
         this.selectedLocations = [];
         this.selectedDepartments = [];

        }


}
