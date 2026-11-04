
import { Component, inject, ViewChild,} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { AllRestrictedHolidayComponent } from '../all-restricted-holiday/all-restricted-holiday.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { formatDateForInput } from '../../../../healpers/commonlib';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { RestrictedService } from '../../payroll/services/restricted.service';



@Component({
  selector: 'app-restricted-holiday',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink,CommonSearchComponent,NgSelectModule,FormsModule],
  templateUrl: './restricted-holiday.component.html',
  styleUrl: './restricted-holiday.component.scss'
})
export class RestrictedHolidayComponent {


  @ViewChild(AllRestrictedHolidayComponent) AllRestrictedHolidayComponent!: AllRestrictedHolidayComponent;

  ngxUILoaderService = inject(NgxUiLoaderService);
  
    resholidayForm!: FormGroup;
    submitted = false;
    showError = false;
    Isedit = false;
    pk_holidayid!: string;
    selectedLocations: string[] = [];
    years: { label: string, value: string }[]  = []; 
    Location: { name: string, value: string }[] = []; 
   constructor(
      private fb: FormBuilder,
      private resholidaysMasterService: RestrictedService,
      private toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionserivce:EncryptionService) { }
  
    ngOnInit() {
      this.createForm();
      if (this.pk_holidayid) {
        this.Isedit = true; 
        this.resholidayForm.controls['fk_locid'].disable(); // ✅ Disable dropdown
      } else {
        this.Isedit = false; 
        this.resholidayForm.controls['fk_locid'].disable(); // ✅ Disable dropdown
        this.resholidayForm.controls['fk_locid'].disable(); // ✅ Disable dropdown
        this.resholidayForm.controls['fk_locid'].enable(); // ✅ Enable dropdown
      }  
 }
  
 //binding form 
    createForm() {
      this.resholidayForm = this.fb.group({
        fk_yearid: ['', Validators.required],
        fk_locid: [[]],
        holidaytype: ['', Validators.required],
        dated: ['', Validators.required],
        datedString: [''],
        isNH: [false],
        pk_holidayid: [''],
      });
//call the year list function and location list
      this.getYearList('Year');
      this.getLocationList('Location');
      //for decrypt  holiday id
      this.pk_holidayid = this.encryptionserivce.decryptText(this.route.snapshot.params?.['pk_holidayid'].toString())
      if (this.pk_holidayid && this.pk_holidayid !== 'undefined') {
        this.loadHolidayMasterData(this.pk_holidayid);
        this.Isedit = true; 
    }
   }
   //Selects/deselects all locations.
    toggleSelectAll() {
      if (this.isAllSelected()) {
        this.selectedLocations = [];
      } else {
        this.selectedLocations = this.Location.map(loc => loc.value);
      }
      this.resholidayForm.patchValue({ fk_locid: this.selectedLocations });
    }
    //for check all location selected or not return true if checked all otherwise false
    isAllSelected(): boolean {
      return this.selectedLocations.length === this.Location.length;
    }
    //Returns appropriate display text based on selection.
    getLocationDisplayText(): string {
      if (this.isAllSelected()) {
        return "All Selected";
      } 
      else if (this.selectedLocations.length === 1) {
        // Sirf ek value select ho tab uska naam dikhana hai
        return this.Location.find(item => item.value === this.selectedLocations[0])?.name || "--Select Locations--";
      } 
      else if (this.selectedLocations.length > 1) {
        // Multiple values select ho to pehla naam + "..."
        const firstSelected = this.Location.find(item => item.value === this.selectedLocations[0])?.name;
        return firstSelected ? `${firstSelected}...` : "--Select Locations--";
      } 
      else {
        return "--Select Locations--";
      }
    }
    
  //Adds/removes a location from the selection.
    toggleLocation(location: string) {
      if (this.selectedLocations.includes(location)) {
        this.selectedLocations = this.selectedLocations.filter(item => item !== location);
      } else {
        this.selectedLocations.push(location);
      }
      this.resholidayForm.patchValue({ fk_locid: this.selectedLocations });
    }
  
  //get year list 
    getYearList(fieldName: string) {
  
      this.ngxUILoaderService.start(); // Start loader before API call
    
      this.resholidaysMasterService.getYear(fieldName).subscribe({
        next: (res) => {
              if (res.isSuccess && res.data) {
                  this.years = res.data.map((fk_yearid: any) => ({
                      name: fk_yearid.name,
                      value: fk_yearid.value
                  }));
              } else {
                  this.toastrService.error("Failed to load HOD list.");
              }
              this.ngxUILoaderService.stop(); // Stop loader after response
    
          },
          error: (err) => {
              console.error("Error fetching HOD list:", err);
              this.toastrService.error("Error fetching level list.");
              
          }
      });
    }
  

// Get location list
getLocationList(fieldName: string) {
  this.ngxUILoaderService.start(); // Start loader before API call

  this.resholidaysMasterService.getLocation(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        // Transform response data into name-value pairs
        // this.Location = res.data.slice(1).map((location: any) => ({
           this.Location = res.data.map((location: any) => ({
          name: location.name,
          value: location.value
        }));
      } else {
        this.toastrService.error("Failed to load location list.");
      }
      this.ngxUILoaderService.stop(); // Stop loader after response
    },
    error: (err) => {
      console.error("Error fetching location list:", err);
      this.toastrService.error("Error fetching location list. Please try again.");
      this.ngxUILoaderService.stop(); // Ensure loader stops even on error
    }
  });
}

    formatDate(date: string | Date): string {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD from ISO string
    }
  
    
   
    onSubmit() {
      this.submitted = true;
      debugger
      if (this.resholidayForm.invalid) {
        this.showError = true;
        return;
      }
     if (this.Isedit) {
        this.resholidayForm.controls['fk_locid'].disable();
        const payload = {
          pk_holidayid: this.resholidayForm.value.pk_holidayid,
          fk_yearid: Number(this.resholidayForm.value.fk_yearid) || 0,
         fk_locid: this.selectedLocations && this.selectedLocations.length > 0 ? this.selectedLocations[0] : '',
          holidaytype: this.resholidayForm.value.holidaytype,
          dated: this.formatDate(this.resholidayForm.value.dated),  // ✅ Formatted Date
          isNH: this.resholidayForm.value.isNH
        };
        // Update case: payload object bhej rahe hain
        this.resholidaysMasterService.update_ResHolidayMaster(payload).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/adminLeave/adminLeavedashboard/RestrictedMaster_list");
            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            this.toastrService.error("Something went wrong");
          }
        });
      } 
      else {
        this.resholidayForm.controls['fk_locid'].enable();
  
          const addPayload = this.selectedLocations.map(loc => ({
          fk_yearid: Number(this.resholidayForm.value.fk_yearid),
          fk_locid: loc,
          holidaytype: this.resholidayForm.value.holidaytype,
          dated: this.resholidayForm.value.dated,
         // dated: this.formatDate(this.holidayForm.value.dated),  // ✅ Formatted Date
  
          isNH: this.resholidayForm.value.isNH
        }));
              
        this.resholidaysMasterService.add_ResHolidayMaster(addPayload).subscribe({
          next: (result) => {
            if (result.isSuccess) {
             
              this.toastrService.success(result.message);
           
              this.router.navigateByUrl("/dash/adminLeave/adminLeavedashboard/RestrictedMaster_list");
             
            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            this.toastrService.error("Something went wrong");
          }
        });
      }
    }
  
    
  
    
  //method for patch value by get by id
  loadHolidayMasterData(pk_holidayid: string) {
    this.resholidaysMasterService.getById_ResHolidayMaster(pk_holidayid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Holiday Data:", res.data);  // Debugging ke liye
         const patchedLocation = res.data.fk_locid ? [res.data.fk_locid] : [];
          const formattedDate=formatDateForInput(res.data.dated);
          this.resholidayForm.patchValue({
            fk_yearid: res.data.fk_yearid ? res.data.fk_yearid.toString() : '',
            fk_locid: patchedLocation,
            holidaytype: res.data.holidaytype || '',
            pk_holidayid: res.data.pk_holidayid || '',
            dated: formattedDate, // Ensure datedString is set in dated field
             isNH: res.data.isNH
          });
          
          // Update selectedLocations so multi dropdown UI reflect kare
          this.selectedLocations = [...patchedLocation];
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load holiday details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading holiday data.");
      }
    });
  }
  

}

