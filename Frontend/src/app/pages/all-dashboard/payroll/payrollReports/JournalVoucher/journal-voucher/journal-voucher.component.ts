import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject,   } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Router,RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule, } from '@ng-select/ng-select';


@Component({
  selector: 'app-journal-voucher',
  standalone: true,
  imports: [ ReactiveFormsModule, FormsModule, CommonModule, MatStepperModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, NgSelectModule ],
  templateUrl: './journal-voucher.component.html',
  styleUrl: './journal-voucher.component.scss'
})
export class JournalVoucherComponent {
  departmentForm!:FormGroup;
  router=inject(Router);
  selectedLocations: string[] = [];

  Location = [
    { name: '-- Select Location --', value: '' },
    { name: 'Mumbai', value: 'MH' },
    { name: 'Delhi', value: 'DL' },
    { name: 'Bangalore', value: 'KA' },
    { name: 'Hyderabad', value: 'TS' },
    { name: 'Ahmedabad', value: 'GJ' },
    { name: 'Chennai', value: 'TN' },
    { name: 'Kolkata', value: 'WB' },
    { name: 'Surat', value: 'GJ' },
    { name: 'Pune', value: 'MH' },
    { name: 'Jaipur', value: 'RJ' },
    { name: 'Lucknow', value: 'UP' },
    { name: 'Kanpur', value: 'UP' },
    { name: 'Nagpur', value: 'MH' },
    { name: 'Indore', value: 'MP' },
    { name: 'Thane', value: 'MH' }
  ];
  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedLocations = this.Location.slice(1).map(loc => loc.value); // All except "Select All"
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
    return this.selectedLocations.length === this.Location.length - 1;
  }
  Month = [
    { name: '-- Select Month --', value: '' },
    { name: 'January', value: 'Jan' },
    { name: 'February', value: 'Feb' },
    { name: 'March', value: 'Mar' },
    { name: 'April', value: 'Apr' },
    { name: 'May', value: 'May' },
    { name: 'June', value: 'Jun' },
    { name: 'July', value: 'Jul' },
    { name: 'August', value: 'Aug' },
    { name: 'September', value: 'Sep' },
    { name: 'October', value: 'Oct' },
    { name: 'November', value: 'Nov' },
    { name: 'December', value: 'Dec' },
  ];
  Year = [
    { name: '-- Select Year --', value: '' },
    { name: '2020', value: '2021' },
    { name: '2021', value: '2022' },
    { name: '2022', value: '2023' },
    { name: '2023', value: '2024' },
    { name: '2024', value: '2025' },
    { name: '2025', value: '2026' },
    { name: '2026', value: '2027' },
    { name: '2027', value: '2027' }
  ];
}
