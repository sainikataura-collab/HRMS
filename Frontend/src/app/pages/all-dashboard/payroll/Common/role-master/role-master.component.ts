import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RoleMastersService } from '../../services/role-masters.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-role-master',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './role-master.component.html',
  styleUrl: './role-master.component.scss'
})
export class RoleMasterComponent {


  RoleForm!:FormGroup;
  submitted=false;
  Isedit=false;
  showError=false;
  roleId!: number;
  constructor(private fb: FormBuilder,private httpservice:RoleMastersService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
  

  ngOnInit():void{
  this.RoleForm=this.fb.group({
    RoleName:['',[Validators.required]],
    Description:['',[Validators.required]],
   
   
    IsActive:[true],

  })
  this.roleId = +this.encryption.decryptText(this.route.snapshot.params['roleId']);
  if (this.roleId) {
  this.Patchform(this.roleId);
  this.Isedit = true; 
}
}

//submit form
submitForm(): void {

  if (this.RoleForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.RoleForm.value,
    
  };
  

  // ✅ **Check if perquisite exists (Update) or not (Insert)**
  if (this.roleId) {
    // **UPDATE existing perquisite**
    const updateData = { ...formData, roleId: this.roleId};

    this.httpservice.update_RoleMasters(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail updated successfully!');
          this.router.navigate(['/dash/user/userdashboard/RoleMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update detail.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    // **INSERT new designation**
    this.httpservice.add_RoleMasters(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail added successfully!');
          this.router.navigate(['/dash/user/userdashboard/RoleMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add detail.');
        }
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
      }
    });
  }
}
//get by id and patch the value
Patchform(roleId: number) {
   this.httpservice.getById_RoleMasters(this.roleId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
        this.RoleForm.patchValue({
          RoleName: res.data.roleName,
          Description:res.data.description,
            IsActive:res.data.isActive,
            
           
          });
          
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load details.");
          
        }
       },
      error: () => {
        this.toastrService.error("Error loading data.");

  
      }
    });
  }

  checkDesignationAvailability(RoleName: string): void {
    const fieldName = 'rolenames'; 
    const fieldValue = RoleName; 
    const generalId = this.roleId; 
  
    this.httpservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.RoleForm.get('RoleName')?.setErrors({ duplicate: response.message });
        } else {
          this.RoleForm.get('RoleName')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.RoleForm.get('RoleName')?.setErrors({ duplicate: 'Error checking role availability.' });
      }
    });
  }
  


}
