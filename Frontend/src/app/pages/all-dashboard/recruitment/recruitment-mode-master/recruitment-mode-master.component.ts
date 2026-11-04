import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { number, string } from 'mathjs';
import { RecruitModeService } from '../RecruitServices/recruit-mode.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-recruitment-mode-master',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,NgSelectComponent],
  templateUrl: './recruitment-mode-master.component.html',
  styleUrl: './recruitment-mode-master.component.scss'
})
export class RecruitmentModeMasterComponent {
  recruitModeDetails!:FormGroup;
  Isedit=false;
  submitted=false;
  id!:number;
  showerror=false;
  selects=[
    {name:'Offline',value:'offline'},
    {name:'Online',value:'Online'}

  ]
  pk_recmodeid:string='';
  constructor(private fb:FormBuilder,private toastrService:ToastrService,private router:Router,private services:RecruitModeService,public encryption:EncryptionService,private route: ActivatedRoute){}
  ngOnInit():void{
   this.recruitModeDetails=this.fb.group({
    type:['',[Validators.required]],
    name:['',Validators.required],
    description:[''],
     isActive:false
      

   })


   this.pk_recmodeid = this.encryption.decryptText(this.route.snapshot.params['pk_recmodeid']);
   if (this.pk_recmodeid) {
   this.patchform(this.pk_recmodeid);
   this.Isedit = true; 
   }
  }
  submitForm(): void {
 
    if (this.recruitModeDetails.invalid) {
     // this.toastrService.error('Please fill all required fields.');
      this.submitted = true;
      return;
    }
  
    const formData = {
      ...this.recruitModeDetails.value,
      
    };
    
  
    // ✅ **Check if perquisite exists (Update) or not (Insert)**
    if (this.pk_recmodeid) {
      // **UPDATE existing perquisite**
      const updateData = { ...formData, pk_recmodeid: this.pk_recmodeid};
  
      this.services.update_recruitmentMaster(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail updated successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/recruitmentMode-master_list']);
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
      this.services.add_recruitmentMaster(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail added successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/recruitmentMode-master_list']);
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

  checkAvailability(name: string): void {
    const fieldName = 'recruitname'; 
    const fieldValue = name; 
    const generalId = this.pk_recmodeid || ''; 
  
    this.services.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.recruitModeDetails.get('name')?.setErrors({ duplicate: response.message });
        } else {
          this.recruitModeDetails.get('name')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.recruitModeDetails.get('name')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }
  

  patchform(pk_recmodeid: string) {
    this.services.get_recruitmentMaster_ById(this.pk_recmodeid).subscribe({
       next: (res) => {
         if (res.isSuccess && res.data) {
         
           this.recruitModeDetails.patchValue({
            type:string(res.data.type),
            name: res.data.name,
            description: res.data.description,
            isActive: res.data.isActive
             
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
  
  Onreset():void{
     this.recruitModeDetails.reset();
    
 }



}
