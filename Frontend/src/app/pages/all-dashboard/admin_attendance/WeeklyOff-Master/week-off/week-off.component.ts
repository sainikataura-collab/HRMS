import { CommonModule } from '@angular/common';
import { Component, inject} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WeeklyOffService } from '../../../payroll/services/weekly-off.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';




@Component({
  selector: 'app-week-off',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxPaginationModule,
    FormsModule,RouterLink
  ],
  templateUrl: './week-off.component.html',
  styleUrls: ['./week-off.component.scss']
})
export class WeekOffComponent {

  weeklyOffForm!: FormGroup;
  router=inject(Router)
  isEditMode: boolean = false;
  weeklyOffId: string | null = null;
  selectedLocations: string[] = [];
  Location:{ name: string, value: string }[] = []; 
   // Corrected data structure
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  
  constructor(private fb: FormBuilder,private http:HttpClient,private weeklyOffService:WeeklyOffService,private toastrService: ToastrService,private route:ActivatedRoute,private ngxUILoaderService:NgxUiLoaderService,private encryptionService: EncryptionService) {}

  ngOnInit(): void {
    // Initialize the form group and nested form arrays
    this.weeklyOffForm = this.fb.group({
      fk_locid: [[]], // Multi-select locations
      sun: [''],
      mon: [''],
      tue: [''],
      wed: [''],
      thur: [''],
      fri: [''],
      sat: [''],
      offDays: this.fb.array(
        this.weekDays.map(() => this.fb.array([
          new FormControl(false),
          new FormControl(false),
          new FormControl(false),
          new FormControl(false),
          new FormControl(false)
        ])) // 5 checkboxes for each day
      )
    });
    this.getLocationList('Location');

      // Check if there's an ID in the route
    this.route.paramMap.subscribe(params => {
    const id = params.get('pk_woffid');
    console.log(id)
    if (id) {
      console.log("inside edit")
      this.isEditMode = true;
      this.weeklyOffId = this.encryptionService.decryptText(id.toString());
      this.loadWeeklyOffData(this.weeklyOffId);
      this.weeklyOffForm.controls['fk_locid'].disable(); // ✅ Disable dropdown
    }else{
      this.isEditMode = false; 
      this.weeklyOffForm.controls['fk_locid'].enable();
    }
  });
  }

  loadWeeklyOffData(id: string) {
    this.weeklyOffService.getWeeklyOffById(id).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          const data = response.data;
          
          // Convert string (e.g., "11111") to checkbox array [true, true, true, true, true]
          const parseDays = (binaryStr: string) => 
            binaryStr.split('').map(char => char === '1');
  
          this.weeklyOffForm.patchValue({
            fk_locid: [data.fk_locid], // Patch location ID
            sun: data.sun,
            mon: data.mon,
            tue: data.tue,
            wed: data.wed,
            thur: data.thur,
            fri: data.fri,
            sat: data.sat
          });
  
          // Patch checkbox values for week-off days
          this.offDaysArray.controls.forEach((dayArray, index) => {
            const formArray = dayArray as FormArray;
            const binaryString = [
              data.mon, data.tue, data.wed, data.thur, data.fri, data.sat, data.sun
            ][index];
  
            parseDays(binaryString).forEach((checked, i) => {
              formArray.controls[i].setValue(checked);
            });
          });
  
          this.selectedLocations = [data.fk_locid]; // Ensure selected locations are updated
        }
      },
      error: (err) => {
        this.toastrService.error('Error fetching weekly off data.');
      }
    });
  }

  
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedLocations = [];
    } else {
      this.selectedLocations = this.Location.map(loc => loc.value);
    }
    this.weeklyOffForm.patchValue({ fk_locid: this.selectedLocations });
  }
  
  isAllSelected(): boolean {
    return this.selectedLocations.length === this.Location.length;
  }
  
  getLocationDisplayText(): string {
    if (this.isAllSelected()) {
      return "All Selected";
    } else if (this.selectedLocations.length === 1) {
      return this.Location.find(item => item.value === this.selectedLocations[0])?.name || "--Select Locations--";
    } else if (this.selectedLocations.length > 1) {
      const firstSelected = this.Location.find(item => item.value === this.selectedLocations[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select Locations--";
    } else {
      return "--Select Locations--";
    }
  }

  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
    this.weeklyOffForm.patchValue({ fk_locid: this.selectedLocations });
  }


  getLocationList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.weeklyOffService.getLocation(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // this.Location = res.data.slice(1).map((fk_locid: any) => ({
             this.Location = res.data.map((fk_locid: any) => ({
            name: fk_locid.name,
            value: fk_locid.value
          }));
        } else {
          this.toastrService.error("Failed to load location list.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response
  
      },
      error: (err) => {
        console.error("Error fetching location list:", err);
        this.toastrService.error("Error fetching location list.");
      }
    });
  }

  updateSearchText() {
    this.weeklyOffForm.patchValue({
      searchText: this.selectedLocations.length ? this.selectedLocations.join(',') : ''
    }, { emitEvent: false });
  }


  get offDaysArray(): FormArray {
    return this.weeklyOffForm.get('offDays') as FormArray;
  }

  getDayArray(i: number): FormArray {
    return this.offDaysArray.at(i) as FormArray;
  }

  getCheckboxControl(i: number, n: number): FormControl {
    return this.getDayArray(i).at(n) as FormControl;
  }

// Updated onSubmit to format data correctly
// onSubmit() {
//   if (this.weeklyOffForm.valid) {
//     const formValue = this.weeklyOffForm.value;
//     const offDaysArray = this.offDaysArray.value;

//     // Construct binary strings for each day based on checkbox states
//     const weeklyOffDataSingle = {
//       sun: offDaysArray[0].map((checked: boolean) => checked ? '1' : '0').join(''),
//       mon: offDaysArray[1].map((checked: boolean) => checked ? '1' : '0').join(''),
//       tue: offDaysArray[2].map((checked: boolean) => checked ? '1' : '0').join(''),
//       wed: offDaysArray[3].map((checked: boolean) => checked ? '1' : '0').join(''),
//       thur: offDaysArray[4].map((checked: boolean) => checked ? '1' : '0').join(''),
//       fri: offDaysArray[5].map((checked: boolean) => checked ? '1' : '0').join(''),
//       sat: offDaysArray[6].map((checked: boolean) => checked ? '1' : '0').join('')
//     };

//     const payload = this.selectedLocations.map(location => ({
//       ...weeklyOffDataSingle,
//       fk_locid: location
//     }));

//     console.log('Payload:', payload);

//     // Call the service with structured subscribe method
//     this.weeklyOffService.saveWeeklyOff(payload).subscribe({
//       next: (response) => {
//         console.log('Response:', response);
//         if (response.isSuccess) {
//           this.toastrService.success('Weekly off data saved successfully!');
//           this.router.navigateByUrl("/dash/payroll/payrolldashboard/WeeklyOff-Master-List");
//         } else {
//           this.toastrService.error(response.message || 'Error saving weekly off data.');
//         }
//       },
//       error: () => {
//         this.toastrService.error('Error saving weekly off data.');
//       }
//     });
//   } else {
//     this.toastrService.error('Please fill all required fields.');
//   }
// }

onSubmit(): void {
  if (this.weeklyOffForm.invalid) {
    this.toastrService.error('Please fill all required fields.');
    return;
  }
  const formValue = this.weeklyOffForm.value;
  const offDaysArray = this.offDaysArray.value;

  const weeklyOffDataSingle = {
    mon: offDaysArray[0].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    tue: offDaysArray[1].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    wed: offDaysArray[2].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    thur:offDaysArray[3].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    fri: offDaysArray[4].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    sat: offDaysArray[5].map((checked: boolean) => (checked ? '1' : '0')).join(''),
    sun: offDaysArray[6].map((checked: boolean) => (checked ? '1' : '0')).join(''),
  };

  const payload = this.selectedLocations.map(location => ({
    ...weeklyOffDataSingle,
    fk_locid: location
  }));

  if (this.isEditMode && this.weeklyOffId) {
    console.log("inside edit,payload[0]",payload[0]);
    this.weeklyOffService.updateWeeklyOff({  ...payload[0] ,pk_wOffId: this.weeklyOffId}).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Weekly off updated successfully!');
          this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/WeeklyOff-Master-data_list']);
        }else{
          this.toastrService.error(response.message);
        }
      },
      error: () => {
        this.toastrService.error("Something went wrong");
      }

    });
  } else {
    this.weeklyOffForm.controls['fk_locid'].enable();

    this.weeklyOffService.saveWeeklyOff(payload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Weekly off added successfully!');
          this.router.navigate(['/dash/adminAttendance/adminAttendancedashboard/WeeklyOff-Master-data_list']);
        }else{
          this.toastrService.error(response.message);
        }
      },
      error: () => {
        this.toastrService.error("Something went wrong");
      }
    });
  }
}



onReset() {
  this.weeklyOffForm.reset();
  this.selectedLocations = [];
  // Explicitly cast each control as FormArray
  this.offDaysArray.controls.forEach((dayArray) => {
    const formArray = dayArray as FormArray;
    formArray.controls.forEach(control => control.setValue(false));
  });
}

view() {
  this.router.navigateByUrl("/dash/adminAttendance/adminAttendancedashboard/AllWeeklyOffList");
}

}
