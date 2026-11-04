import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NatureMasterServiceService } from '../../../services/nature-master-service.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-nature-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './nature-master.component.html',
  styleUrl: './nature-master.component.scss'
})
export class NatureMasterComponent {
natureFrom!:FormGroup;
submitted=false;
showError = false;
pk_natureid!:string;
Isedit=false;

  constructor(private fb: FormBuilder,private natureMasterService:NatureMasterServiceService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService) {}

  ngOnInit():void{
   
    this.natureFrom=this.fb.group({

      nature: ['',[Validators.required,Validators.maxLength(15)]],
      pk_natureid:['']
    })

    this.pk_natureid=this.encryptionService.decryptText(this.route.snapshot.params['pk_natureid'].toString());

    // this.pk_natureid = this.route.snapshot.params['pk_natureid']; 
    
    if (this.pk_natureid && this.pk_natureid !== 'undefined') {
      this.loadNatureMasterData(this.pk_natureid);
      this.Isedit = true; 

    }
    this.natureFrom.get('nature')?.valueChanges.subscribe((value) => {
      if(value){
        this.checkDuplicate(value);
      }
      
    });
    
  }
  checkDuplicate(nature: string): void {
    const fieldName = 'Nature'; 
    const fieldValue = nature; 
    const generalId = this.pk_natureid || ''; 
  
    this.natureMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.natureFrom.get('nature')?.setErrors({ duplicate: response.message });
        } else {
          this.natureFrom.get('nature')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.natureFrom.get('nature')?.setErrors({ duplicate: 'Error checking nature availability.' });
      }
    });
  }

  onSubmit(){
    this.submitted = true;
  if (this.natureFrom.invalid) {
    this.showError = true;
    return;
  }

  const data = {
    ...this.natureFrom.value,
    fk_UserID: sessionStorage.getItem('fk_UserID'),
    fk_LocID: sessionStorage.getItem('fk_LocID'),
    companyId: sessionStorage.getItem('fk_CompanyID'),
    pk_natureid: this.pk_natureid 

  };
      
      if(this.Isedit){
         this.natureMasterService.update_NatureMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/natureMaster_list");
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
        this.natureMasterService.add_NatureMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/natureMaster_list");

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

  
  loadNatureMasterData(pk_natureid: string) {
    this.natureMasterService.getById_NatureMaster(pk_natureid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched Bank Data:", res.data);  // Debugging ke liye
  
          this.natureFrom.patchValue({
            nature: res.data.nature || '',
            Pk_Natureid: res.data.pk_BankId || ''
          });
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load bank details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading bank data.");
      }
    });
  }
  resetForm(): void {
         this.natureFrom.reset();
        }
}