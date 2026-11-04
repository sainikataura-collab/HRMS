import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZoneMasterService } from '../../../services/zone.service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-zone-master',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,NgSelectComponent,CommonModule],
  templateUrl: './zone-master.component.html',
  styleUrl: './zone-master.component.scss'
})
export class ZoneMasterComponent {
  
ngxUILoaderService = inject(NgxUiLoaderService);
  zoneForm!: FormGroup;

  zoneHR: { label: string, value: string }[]  = []; 
  operationHead: { label: string, value: string }[]  = []; 
  // selectedCode: string | null = null;
  ZoneId: string ='';
  Isedit=false;
  showError=false;




 // constructor( private toastrService:ToastrService,private route:Router,){}

 constructor(private fb:FormBuilder,private zoneMasterService:ZoneMasterService,private router:Router,
  private route: ActivatedRoute,private toastrService:ToastrService,private encryptionService:EncryptionService){}
  
ngOnInit(){
  this.ngxUILoaderService.start();
  this.zoneForm = this.fb.group({
    pk_zoneId:[null],
    zoneCode: [null, Validators.required],
    zoneDescription: [null, Validators.required],
    fk_hrempid: [null],
    fk_headempid: [null],
  });

  this.getZonalhrList('Employee');

  this.getOperational('Employee');



  this.ZoneId=this.encryptionService.decryptText(this.route.snapshot.params['pk_zoneId'].toString())
 
  // this.ZoneId = this.decodeID(this.route.snapshot.params['pk_zoneId']);

  if (this.ZoneId && this.ZoneId !== 'undefined') {
    this.getZoneDetailsByid(this.ZoneId);
    this.Isedit = true; 
  }


   // Call CheckDuplicateValue when the designation input changes
   this.zoneForm.get('zoneDescription')?.valueChanges.subscribe(value => {
    if (value) {
      this.checkDesignationAvailability(value);
    }
  });

}



encodeID(id: any): string {
  return btoa(id.toString()); // Convert to string before encoding
}

decodeID(id: string): string {
  return atob(id);
}


checkDesignationAvailability(zoneDescription: string): void {
  const fieldName = 'ZoneDescription'; 
  const fieldValue = zoneDescription; 
  const generalId = this.ZoneId || ''; 

  this.zoneMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.zoneForm.get('zoneDescription')?.setErrors({ duplicate: response.message });
      } else {
        this.zoneForm.get('zoneDescription')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.zoneForm.get('zoneDescription')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}


getZoneDetailsByid(ZoneId: string) {
debugger
  this.ngxUILoaderService.start(); // Start loader before API call

  this.zoneMasterService.getZoneById(ZoneId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Department Data:", res.data);  // Debugging ke liye

        this.zoneForm.patchValue({
          zoneCode: res.data.zoneCode ,
          zoneDescription:res.data.zoneDescription ,
          fk_hrempid:res.data.fk_hrempid,
          fk_headempid:res.data.fk_headempid
        });
        

        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load Category details.");
        
      }
      this.ngxUILoaderService.stop(); // Stop loader after response

    },
    error: () => {
      this.toastrService.error("Error loading Category data.");
      this.ngxUILoaderService.stop(); // Stop loader on error

    }
  });
}

getZonalhrList(fieldName: string) {

  this.ngxUILoaderService.start(); // Start loader before API call

  this.zoneMasterService.getZonalHR(fieldName).subscribe({
      next: (res) => {
          if (res.isSuccess && res.data) {
              this.zoneHR = res.data.map((fk_hrempid: any) => ({
                  name: fk_hrempid.name,
                  value: fk_hrempid.value
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
getOperational(fieldName: string) {
  this.zoneMasterService.getZonalHR(fieldName).subscribe({
      next: (res) => {
          if (res.isSuccess && res.data) {
              this.operationHead = res.data.map((fk_headempid: any) => ({
                  name: fk_headempid.name,
                  value: fk_headempid.value
              }));
          } else {
              this.toastrService.error("Failed to load HOD list.");
          }
      },
      error: (err) => {
          console.error("Error fetching HOD list:", err);
          this.toastrService.error("Error fetching level list.");
          
      }
  });
}




submitForm(): void {
  debugger
  if (this.zoneForm.invalid) {
    this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.zoneForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };
  

  // ✅ **Check if designationId exists (Update) or not (Insert)**
  if (this.ZoneId) {
    // **UPDATE existing designation**
    const updateData = { ...formData, pk_zoneId: this.ZoneId };

    this.zoneMasterService.update_Zone(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Designation updated successfully!');
          this.router.navigate(['/dash/user/userdashboard/zonemaster_list']);
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
    // **INSERT new designation**
    this.zoneMasterService.add_Zone(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Designation added successfully!');
          this.router.navigate(['/dash/user/userdashboard/zonemaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add designation.');
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
  this.zoneForm.reset();
}



}
