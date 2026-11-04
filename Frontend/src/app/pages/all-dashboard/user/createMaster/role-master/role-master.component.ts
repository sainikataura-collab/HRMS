import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { RoleMasterService } from '../../services/role-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-role-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink,NgSelectComponent],
  templateUrl: './role-master.component.html',
  styleUrl: './role-master.component.scss'
})
export class RoleMasterComponent {
 UserDetails!:FormGroup;
submitted=false;
showError = false;
  ngxUILoaderService = inject(NgxUiLoaderService);

id!:number;
Isedit=false;
rolelevel = [
  { name: '1', value: '1' },
  { name: '2', value: '2' },
  { name: '3', value: '3' },
  { name: '4', value: '4' },
  { name: '5', value: '5' },
  { name: '6', value: '6' },
  { name: '7', value: '7' },
  { name: '8', value: '8' },
  { name: '9', value: '9' }
];

pk_roleId:string='';
  
  constructor(private fb: FormBuilder,private roleMasterService:RoleMasterService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit():void{
   
    this. UserDetails=this.fb.group({
      rolename: ['',[ Validators.required]],
      mappedalias: ['',[ Validators.required]],
      rolelevel: ['',[ Validators.required]],
      remarks: [''],
    })
    let encryptedId = this.route.snapshot.paramMap.get('pk_roleId');
    if (encryptedId) {
      this.pk_roleId = this.encryption.decryptText(encryptedId); // Decrypt ID
      this.Isedit = true;
      this.patchform(this.pk_roleId); // 👇 Load form data
    }

  }
  

  onSubmit(){
    this.submitted=true;
    if (this. UserDetails.invalid) {
      this.showError = true;
      return;
    }
    const data = {
      ...this. UserDetails.value,
      rolelevel: Number(this.UserDetails.get('rolelevel')?.value),
    
      };
      if(this.Isedit){
        const data = {
          ...this. UserDetails.value,
          rolelevel: Number(this.UserDetails.get('rolelevel')?.value),
    
          pk_roleId:this.pk_roleId

          };
         this.roleMasterService.update_RoleMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigate(['/dash/user/userdashboard/roleMaster_list']);
 
            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrService.error('An error occurred during form submission');
          }
         })
      }
      else{
        this.roleMasterService.add_RoleMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigate(['/dash/user/userdashboard/roleMaster_list']);
            } else {
              this.toastrService.error(result.message);
            }
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrService.error('An error occurred during form submission');
          }
        })
      
      }
  }

  checkAvailability(rolename: string): void {
    const fieldName = 'rolename'; 
    const fieldValue = rolename; 
    const generalId = this.pk_roleId || ''; 
  
    this.roleMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.UserDetails.get('rolename')?.setErrors({ duplicate: response.message });
        } else {
          this.UserDetails.get('rolename')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.UserDetails.get('rolename')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }

  checkAliasAvailability(mappedalias: string): void {
    const fieldName = 'mappedalias'; 
    const fieldValue = mappedalias; 
    const generalId = this.pk_roleId || ''; 
  
    this.roleMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.UserDetails.get('mappedalias')?.setErrors({ duplicate: response.message });
        } else {
          this.UserDetails.get('mappedalias')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.UserDetails.get('mappedalias')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }
  


  patchform(pk_roleId: string) {
    this.ngxUILoaderService.start();
    this.roleMasterService.getRoleMasterById(pk_roleId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log(res.data);  // Debugging ke liye
          this.UserDetails.patchValue({
  
            rolename: res.data.rolename ,
            mappedalias:res.data.mappedalias,
            rolelevel:String(res.data.rolelevel),
            remarks:res.data.remarks
                   
          });
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load details.");
        }
        this.ngxUILoaderService.stop(); // Stop loader after response
  
      },
      error: () => {
        this.toastrService.error("Error loading data.");
      }
    });
  }
  resetForm(): void {
         this. UserDetails.reset();
        }
}

