import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { RegligionMasterService } from '../../../services/regligion-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-regligion-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './regligion-master.component.html',
  styleUrl: './regligion-master.component.scss'
})
export class RegligionMasterComponent {
regligionFrom!:FormGroup;
submitted=false;
showError = false;
religionid : string ='';
isEditMode: boolean = false;
route = inject(ActivatedRoute); 
id!:number;
Isedit=false;

  
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private regligionMasterService: RegligionMasterService,private encryptionService:EncryptionService) {}

  ngOnInit():void{
   
    this.regligionFrom=this.fb.group({
      religiontype:[null,[ Validators.required]],
    })

    
       // Call CheckDuplicateValue when the designation input changes
   this.regligionFrom.get('religiontype')?.valueChanges.subscribe(value => {
    if (value) {
      this.checkDesignationAvailability(value);
    }
  });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_religionid');
      if (id) {
        this.religionid = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getAccountById(this.religionid);
      }
    });
  }


  checkDesignationAvailability(religiontype: string): void {

    const fieldName = 'ReligionType'; 
    const fieldValue = religiontype; 
    const generalId = this.religionid || ''; 
  
    this.regligionMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.regligionFrom.get('religiontype')?.setErrors({ duplicate: response.message });
        } else {
          this.regligionFrom.get('religiontype')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.regligionFrom.get('religiontype')?.setErrors({ duplicate: 'Error checking designation availability.' });
      }
    });
  }
  view(){
    this.router.navigateByUrl("/dash/user/userdashboard/regligionMaster_list");
   }

   getAccountById(id: string){
    this.regligionMasterService.getRegligionById(id).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.regligionFrom.patchValue({
            religiontype: response.data.religiontype
          });
        } else {
          console.error('Failed to fetch Regligion:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching Regligion:', error);
      }
    );
  }
   
 
   onSubmit(): void {
    if(this.regligionFrom.invalid){
      this.showError=true;
    }
    
    debugger
    const formData = this.regligionFrom.value;
    if (this.isEditMode && this.religionid) {
      // Update existing account
      this.regligionMasterService.updateRegligion({pk_religionid: this.religionid, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {

            this.toastrService.success(response.message||'ReligionMaster updated successfully!');
            
            this.router.navigate(['/dash/user/userdashboard/regligionMaster_list']);
          }
           else {
            this.toastrService.success(response.message||'ReligionMaster  Not updated successfully!');

          }
        }
      );
    } else {
      if(this.regligionFrom.invalid){
        return;
      }
      // Create new account
      this.regligionMasterService.add_RegligionMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            //alert('RegligionMaster created successfully!');
            this.toastrService.success(response.message||'RegligionMaster Insert successfully!');
            this.router.navigate(['dash/user/userdashboard/regligionMaster_list']);
          } else {
            //alert(response.message);
          }
        }
      );
    }
  }
  resetForm(): void {
         this.regligionFrom.reset();
        }
}
