// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HolidaysMasterServiceService } from '../../payroll/services/holidays-master-service.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { formatDateForInput } from '../../../../healpers/commonlib';

@Component({
  selector: 'app-working-day-master',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,
    FormsModule],
  templateUrl: './working-day-master.component.html',
  styleUrl: './working-day-master.component.scss'
})
export class WorkingDayMasterComponent {
ngxUILoaderService = inject(NgxUiLoaderService);

  holidayForm!: FormGroup;
  submitted = false;
  showError = false;
  Isedit = false;
  pk_holidayid!: string;
  selectedLocations: string[] = [];
  years: { label: string, value: string }[]  = []; 
  Location: { name: string, value: string }[] = [];  // Corrected data structure



  constructor(
    private fb: FormBuilder,
    private holidaysMasterService: HolidaysMasterServiceService,
    private toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService
  ) { }

  ngOnInit() {
    this.createForm();

}


  

  createForm() {
    this.holidayForm = this.fb.group({
      fk_yearid: ['', Validators.required],
      fk_locid: [[]],
      holidaytype: ['', Validators.required],
      dated: ['', Validators.required],
      datedString: [''],
      IsWorkingDay: [false],
      isNH: [false],
      pk_holidayid: [''],

    });
    this.getYearList('Year');
    this.getLocationList('Location');

    this.pk_holidayid = this.encryptionService.decryptText(this.route.snapshot.params['pk_holidayid']);  

    if (this.pk_holidayid && this.pk_holidayid !== 'undefined') {

      this.loadHolidayMasterData(this.pk_holidayid);
      this.Isedit = true; 

    }
   
    
  }
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedLocations = [];
    } else {
      this.selectedLocations = this.Location.map(loc => loc.value);
    }
    this.holidayForm.patchValue({ fk_locid: this.selectedLocations });
  }
  
  isAllSelected(): boolean {
    return this.selectedLocations.length === this.Location.length;
  }
  
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
  

  toggleLocation(location: string) {
    if (this.selectedLocations.includes(location)) {
      this.selectedLocations = this.selectedLocations.filter(item => item !== location);
    } else {
      this.selectedLocations.push(location);
    }
    this.holidayForm.patchValue({ fk_locid: this.selectedLocations });
  }


  getYearList(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call
  
    this.holidaysMasterService.getYear(fieldName).subscribe({
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

  getLocationList(fieldName: string) {
    this.ngxUILoaderService.start(); // Start loader before API call

     this.holidaysMasterService.getLocation(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.Location = res.data.map((fk_locid: any) => ({
                    name: fk_locid.name,
                    value: fk_locid.value
                }));
                //  this.Location = res.data
          // .filter((item: any) => item.value !== null)
          // .map((fk_locid: any) => ({
          //   name: fk_locid.name,
          //   value: fk_locid.value
          // }));
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
  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Extract YYYY-MM-DD from ISO string
  }

  
 
  onSubmit() {
    this.submitted = true;
    if (this.holidayForm.invalid) {
      this.showError = true;
      return;
    }
  
    
  
    if (this.Isedit) {
      this.holidayForm.controls['fk_locid'].disable();
      const payload = {
        pk_holidayid: this.holidayForm.value.pk_holidayid,
        fk_yearid: Number(this.holidayForm.value.fk_yearid) || 0,
       fk_locid: this.selectedLocations && this.selectedLocations.length > 0 ? this.selectedLocations[0] : '',
        holidaytype: this.holidayForm.value.holidaytype,
        dated: this.formatDate(this.holidayForm.value.dated),  // ✅ Formatted Date
        isNH: this.holidayForm.value.isNH,
        IsWorkingDay: this.holidayForm.value.IsWorkingDay
      };
      // Update case: payload object bhej rahe hain
      this.holidaysMasterService.UpdateWorkingDayMasterAsync(payload).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/adminAttendance/adminAttendancedashboard/WorkingDayMaster_list");
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error("Something went wrong");
        }
      });
    } else {
      this.holidayForm.controls['fk_locid'].enable();

      debugger
      const addPayload = this.selectedLocations.map(loc => ({
        
        fk_yearid: Number(this.holidayForm.value.fk_yearid),
        fk_locid: loc,
        holidaytype: this.holidayForm.value.holidaytype,
        dated: this.holidayForm.value.dated,
       // dated: this.formatDate(this.holidayForm.value.dated),  // ✅ Formatted Date

        isNH: this.holidayForm.value.isNH
      }));
      debugger 
  
      this.holidaysMasterService.InsertWorkingDayMasterAsync(addPayload).subscribe({
        next: (result) => {
          if (result.isSuccess) {
           
            this.toastrService.success(result.message);
         
            this.router.navigateByUrl("/dash/adminAttendance/adminAttendancedashboard/WorkingDayMaster_list");
           
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

  

  resetForm() {
    this.holidayForm.reset();
  }

  

loadHolidayMasterData(pk_holidayid: string) {
  this.holidaysMasterService.GetWorkingDayMasterByIdAsync(pk_holidayid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {

        const patchedLocation = res.data.fk_locid ? [res.data.fk_locid] : [];
        let formattedDate = formatDateForInput(res.data.datedString);
        // if (res.data.datedString) {
        //   const [day, month, year] = res.data.datedString.split('/');
        //   formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD format
        // }

        this.holidayForm.patchValue({
          fk_yearid: res.data.fk_yearid ? res.data.fk_yearid.toString() : '',
          fk_locid: patchedLocation,
          holidaytype: res.data.holidaytype || '',
          pk_holidayid: res.data.pk_holidayid || '',
           IsWorkingDay:res.data.isWorkingDay,
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
