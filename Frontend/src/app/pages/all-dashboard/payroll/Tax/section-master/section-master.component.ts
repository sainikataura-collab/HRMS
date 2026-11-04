import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';
import { SectionMasterService } from '../../services/section-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-section-master',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './section-master.component.html',
  styleUrl: './section-master.component.scss'
})
export class SectionMasterComponent {
  SectionMasterForm!: FormGroup;
 submited=false;
 Isedit=false;
 showError=false;
 SectionId: string ='';
  ngxUILoaderService: any;
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private service:SectionMasterService,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.SectionMasterForm = this.fb.group({
      description: ['' ,Validators.required],
      code: ['',Validators.required],
      maxlimit: ['',Validators.required],
      partof: false,
      active: false,
    });

    this.SectionId = this.encryption.decryptText(this.route.snapshot.params['pk_secid']);
    if (this.SectionId && this.SectionId !== 'undefined') {
    this.getSectionDetailsByid(this.SectionId);
    this.Isedit = true; 
  }

   // Call CheckDuplicateValue when the section input changes
   this.SectionMasterForm.get('description')?.valueChanges
   .pipe(debounceTime(1500)) 
   .subscribe(value => {
    if (value) {
      this.checkSectionAvailability(value);
    }
  });

this.SectionMasterForm.get('code')?.valueChanges
  .pipe(debounceTime(1500)) // Waits 500ms after the user stops typing
  .subscribe(value => {
    if (value) {
      this.checkCodeAvailability(value);
    }
  });
  
  
  
  }    

 //for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
 //submit form
 submitForm(): void {

  if (this.SectionMasterForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.SectionMasterForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };
  

  // ✅ **Check if sectionId exists (Update) or not (Insert)**
  if (this.SectionId) {
    // **UPDATE existing designation**
    const updateData = { ...formData, pk_secid: this.SectionId };

    this.service.update_section(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'section updated successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/sectionMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update section.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    // **INSERT new designation**
    this.service.add_section(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'section added successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/sectionMaster_list']);
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
getSectionDetailsByid(ZoneId: string) {
   this.service.getsectionById(this.SectionId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched section Data:", res.data);  // Debugging ke liye
  
          this.SectionMasterForm.patchValue({
            description: res.data.description ,
            code:res.data.code ,
            maxlimit:res.data.maxlimit,
            active:res.data.active,
            partof:res.data.partof
          });
          
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load section details.");
          
        }
       },
      error: () => {
        this.toastrService.error("Error loading Section data.");

  
      }
    });
  }
 
//is value available
checkSectionAvailability(description: string): void {
  const fieldName = 'SectionDescription'; 
  const fieldValue = description; 
  const generalId = this.SectionId || ''; 

  this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.SectionMasterForm.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.SectionMasterForm.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.SectionMasterForm.get('description')?.setErrors({ duplicate: 'Error checking section availability.' });
    }
  });
}
 
checkCodeAvailability(code: string): void {
  const fieldName = 'SectionCode'; 
  const fieldValue = code; 
  const generalId = this.SectionId || ''; 

  this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.SectionMasterForm.get('code')?.setErrors({ duplicate: response.message });
      } else {
        this.SectionMasterForm.get('code')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.SectionMasterForm.get('code')?.setErrors({ duplicate: 'Error checking code availability.' });
    }
  });
}
}



