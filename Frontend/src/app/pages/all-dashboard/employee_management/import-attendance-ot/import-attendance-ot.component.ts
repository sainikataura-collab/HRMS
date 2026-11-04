import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-attendance-ot',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectModule,FormsModule,NgxPaginationModule],
  templateUrl: './import-attendance-ot.component.html',
  styleUrl: './import-attendance-ot.component.scss'
})
export class ImportAttendanceOTComponent {
  AttendanceForm!: FormGroup;
  ImportForm!: FormGroup;
  selectedLocations: string[] = [];

  submitted=false;
  showError = false;

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
locations = [
  { name: 'Select All', value: 'all' },  // Select All option
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit() {

    this.AttendanceForm = this.fb.group({

      month: ['',[ Validators.required]],
      year: ['',[ Validators.required]],
      location:[''],

    });
    this.ImportForm = this.fb.group({

      file: ['']
    });
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
  if (this. AttendanceForm.invalid) {
    this.showError = true;
    return;
  }
  
 }

 
 resetForm(): void {
         this.ImportForm.reset();
        
        }
}


