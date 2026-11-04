import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { SkpAttributeService } from '../../HRservices/skp-attribute.service';

@Component({
  selector: 'app-skpattributemaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],

  templateUrl: './skpattributemaster.component.html',
  styleUrl: './skpattributemaster.component.scss'
})
export class SKPattributemasterComponent {
  skpAttributeform!: FormGroup;
  submitted=false;
  Isedit=false;
  showError=false;

  pk_attributeId: string ='';
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: SkpAttributeService,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.skpAttributeform = this.fb.group({
      description: ['',Validators.required],
      orderNo: ['',Validators.required],
      isActive: [false],
 
   
    
    });
    this.pk_attributeId = this.encryption.decryptText(this.route.snapshot.params['pk_attributeId']);
    if (this.pk_attributeId) {
    this.Patchform(this.pk_attributeId);
    this.Isedit = true; 
  }
  }    
 
  
 

  //submit form
submitForm(): void {

  if (this.skpAttributeform.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.skpAttributeform.value,
    
  };
  

  // ✅ **Check if perquisite exists (Update) or not (Insert)**
  if (this.pk_attributeId) {
    // **UPDATE existing perquisite**
    const updateData = { ...formData, pk_attributeId: this.pk_attributeId};

    this.httpservice.update_skipAttribute(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail updated successfully!');
          this.router.navigate(['/dash/hr/hrdashboard/SKP_Attribute_Mst_list']);
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
    this.httpservice.add_skipAttribute(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail added successfully!');
          this.router.navigate(['/dash/hr/hrdashboard/SKP_Attribute_Mst_list']);
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
Patchform(pk_attributeId: string) {
   this.httpservice.get_skipAttributeBYid(this.pk_attributeId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
       
          // Convert dd/MM/yyyy to yyyy-MM-dd
          
          this.skpAttributeform.patchValue({
            description: res.data.description,
            orderNo:res.data.orderNo,
            isActive:res.data.isActive,

            
           

            
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
 

  checkAvailability(description: string): void {
    const fieldName = 'skpdescription'; 
    const fieldValue = description; 
    const generalId = this.pk_attributeId || ''; 
  
    this.httpservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.skpAttributeform.get('description')?.setErrors({ duplicate: response.message });
        } else {
          this.skpAttributeform.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.skpAttributeform.get('description')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }
  resetForm(): void {
         this.skpAttributeform.reset();
       
        }

}
