import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { OfficeTypeMasterService } from '../../services/office-type-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx'

@Component({
  selector: 'app-office-type-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './office-type-master.component.html',
  styleUrl: './office-type-master.component.scss'
})



export class OfficeTypeMasterComponent {
  OfficeTypeMaster!:FormGroup;
submitted=false;
showError = false;
Isedit=false;
pk_offtypeid!:number;
  
  constructor(private fb: FormBuilder,private officeTypeMasterService:OfficeTypeMasterService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService ) {}

  ngOnInit():void{
   
    this.OfficeTypeMaster=this.fb.group({
      code: ['',[ Validators.required]],
      description: ['',[ Validators.required]],
      emailhod: [''],
      emailhr: [''],
    });

    this.pk_offtypeid = +this.encryptionService.decryptText(this.route.snapshot.params['officeTypeID']);  
    if (this.pk_offtypeid && this.pk_offtypeid) {
      debugger
      this.loadOfficeTypeMasterData(this.pk_offtypeid);
      this.Isedit = true; 
    } 

  };

  checkDuplicate(code: string): void {

    debugger
    const fieldName = 'OfficeTypeMaster'; 
    const fieldValue = code; 
    const generalId = this.pk_offtypeid; 
    
    this.officeTypeMasterService.CheckDuplicateValue(fieldName, fieldValue,generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.OfficeTypeMaster.get('code')?.setErrors({ duplicate: response.message });
        } else {
          this.OfficeTypeMaster.get('code')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.OfficeTypeMaster.get('code')?.setErrors({ duplicate: 'Error checking Office Type Master availability.' });
      }
    });
    }

    checkDuplicateOfficeName(officename: string): void {
      const fieldName = 'OfficeTypeDescription'; 
      const fieldValue = officename; 
      const generalId = this.pk_offtypeid; 
      
      this.officeTypeMasterService.CheckDuplicateValue(fieldName, fieldValue,generalId).subscribe({
        next: (response) => {
          if (response && response.isSuccess === false) {
            this.OfficeTypeMaster.get('description')?.setErrors({ duplicate: response.message });
          } else {
            this.OfficeTypeMaster.get('description')?.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Duplicate Check API Error:', err);
          this.OfficeTypeMaster.get('description')?.setErrors({ duplicate: 'Error checking Office Type Master availability.' });
        }
      });
      }


    


  onSubmit()
  {
    this.submitted=true;
    if (this.OfficeTypeMaster.invalid) {
      this.showError = true;
  return;
  }
    const data = {
      ...this.OfficeTypeMaster.value ,
     
      };



      if(this.pk_offtypeid){
        const data = {
          ...this.OfficeTypeMaster.value ,
          pk_offtypeid: this.pk_offtypeid.toString(),
          };
         this.officeTypeMasterService.update_OfficeTypeMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/officeTypeMaster_list");
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
        this.officeTypeMasterService.add_OfficeTypeMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/officeTypeMaster_list");
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



  
// 


loadOfficeTypeMasterData(pk_offtypeid:number) {
  this.officeTypeMasterService.getById_OfficeTypeMaster(pk_offtypeid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Office Type Data:", res.data);  // Debugging ke liye

        this.OfficeTypeMaster.patchValue({
          code: res.data.code,
          description:res.data.officeName,   
          emailhr:res.data.emailhr,   
          emailhod:res.data.emailhod,
        
        });


        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load office Type Master details.");
      }
    },


    error: () => {
      this.toastrService.error("Error loading Office Type Master data.");
    }
  });
}



  resetForm(): void {
         this.OfficeTypeMaster.reset();
    }
}

