import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CityMasterService } from '../../../services/city-master.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { boolean } from 'mathjs';

@Component({
  selector: 'app-city-master',
  standalone: true,
  imports: [CommonModule,NgSelectModule,RouterLink,ReactiveFormsModule,FormsModule],
  templateUrl: './city-master.component.html',
  styleUrl: './city-master.component.scss'
})
export class CityMasterComponent {



  showcityList: boolean = false; 
  cityForm!: FormGroup;
  isSubmit: boolean = false;
  Isedit: boolean = false; 

  // States: { name: string, value: string }[]  = []; 
  States: { label: string, value: number }[]  = [];


  route=inject(ActivatedRoute);
  router=inject(Router);

  showError=false;
  cityId:string='';
  pk_cityid:string='';

  constructor(private fb: FormBuilder,private citymasterService:CityMasterService,private toastrService:ToastrService,private encryptionService:EncryptionService) {
  
  }
  ngOnInit(): void {
    this.cityForm = this.fb.group({
      fk_stateid: [null,Validators.required],
      cityname: [null,Validators.required],      
      isMetro: [false], 
      isCActive: [true]  
    });

    //use for getState List
    this.getStateList('State');


    this.cityId=this.encryptionService.decryptText(this.route.snapshot.params['pk_cityid'].toString());



  //this.cityId = this.route.snapshot.params['pk_cityid'];

  // if (this.cityId && this.cityId ) {
  //   this.getCityDetailsByid(this.cityId || 'undefined');
  //   this.Isedit = true; 
  // }

  if (this.cityId && this.cityId !== 'undefined') {
    this.getCityDetailsByid(this.cityId);
    this.Isedit = true; 
  }


}




checkDesignationAvailability(cityname: string): void {
  const fieldName = 'City'; 
  const fieldValue = cityname; 
  const generalId = this.cityId || ''; 

  this.citymasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.cityForm.get('cityname')?.setErrors({ duplicate: response.message });
      } else {
        this.cityForm.get('cityname')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.cityForm.get('cityname')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}


  getCityDetailsByid(pk_cityid: string) {
    debugger
     
      this.citymasterService.getCityById(pk_cityid).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            console.log("Fetched city Data:", res.data);  // Debugging ke liye
            var stateIdStr = res.data.fk_stateid + "";
            this.cityForm.patchValue({
              // fk_stateid: res.data.fk_stateid ,
              fk_stateid: stateIdStr,
              cityname:res.data.cityname,
              isMetro:boolean(res.data.metroName),
              isCActive:res.data.isCActive
            });
            
    
            this.Isedit = true;
          } else {
            this.toastrService.error("Failed to load Category details.");
            
          }
         // Stop loader after response
    
        },
        error: () => {
          this.toastrService.error("Error loading Category data.");
          // Stop loader on error
    
        }
      });
    }
  getStateList(fieldName: string) {

    // this.ngxUILoaderService.start(); // Start loader before API call
  
    this.citymasterService.getStateList(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.States = res.data.map((fk_stateid: any) => ({
                  name: fk_stateid.name,
                    value: fk_stateid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
            // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");
            
        }
    });
  }

  

  // viewFilteredList() {
  //   const selectedStateId = this.cityForm.get('fk_stateid')?.value;

  //   if (!selectedStateId) {
  //     alert('Please select a state*.');
  //     return;
  //   }

  //   this.router.navigate(['/dash/payroll/payrolldashboard/city-master-list'], {
  //     queryParams: { stateId: selectedStateId }
  //   });
  // }



 submitForm(): void {
  debugger
  if (this.cityForm.invalid) {
    this.showError = true;
    return;
  }

  const formData = {
    ...this.cityForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };
  

 
  if (this.cityId) {
    const updateData = { ...formData, pk_cityid: this.cityId };

    this.citymasterService.update_City(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'city updated successfully!');
          this.router.navigate(['/dash/user/userdashboard/city-master_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update designation.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    
    this.citymasterService.add_City(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'City added successfully!');
          this.router.navigate(['/dash/user/userdashboard/city-master_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add City.');
        }
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
      }
    });
  }
}
resetForm(): void {
  this.cityForm.reset();
}


 
}


















