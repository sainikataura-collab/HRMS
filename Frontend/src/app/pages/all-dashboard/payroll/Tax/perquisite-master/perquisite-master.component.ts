import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { PerquisiteMasterService } from '../../services/perquisite-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-perquisite-master',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './perquisite-master.component.html',
  styleUrl: './perquisite-master.component.scss'
})
export class PerquisiteMasterComponent {
  PerquisiteForm!: FormGroup;
  submitted=false;
  Isedit=false;
  showError=false;
  perquisiteId: string ='';
  constructor(private fb: FormBuilder,private httpservice: PerquisiteMasterService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.PerquisiteForm = this.fb.group({
      description: ['',Validators.required],
      
    });

    this.perquisiteId = this.encryption.decryptText(this.route.snapshot.params['pk_perkId']);
    if (this.perquisiteId && this.perquisiteId !== 'undefined') {
    this.getPerquisiteDetailsByid(this.perquisiteId);
    this.Isedit = true; 
  }
  }    
 
  
 //submit form
 submitForm(): void {

  if (this.PerquisiteForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.PerquisiteForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };
  

  // ✅ **Check if perquisite exists (Update) or not (Insert)**
  if (this.perquisiteId) {
    // **UPDATE existing perquisite**
    const updateData = { ...formData, pk_perkId: this.perquisiteId};

    this.httpservice.update_Perquisite(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'perquisite updated successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/perquisiteMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update perquisite.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    // **INSERT new designation**
    this.httpservice.add_Perquisite(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'perquisite added successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/perquisiteMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add section.');
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
getPerquisiteDetailsByid(ZoneId: string) {
   this.httpservice.getPerquisiteById(this.perquisiteId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched perquisite Data:", res.data);  // Debugging ke liye
  
          this.PerquisiteForm.patchValue({
            description: res.data.description
            
          });
          
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load perquistion details.");
          
        }
       },
      error: () => {
        this.toastrService.error("Error loading perquistion data.");

  
      }
    });
  }
 
  
}



