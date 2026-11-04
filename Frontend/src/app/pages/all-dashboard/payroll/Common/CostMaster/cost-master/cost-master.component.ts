import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { functionalService } from '../../../services/functional.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { CostMasterService } from '../../../services/cost-master.service';

@Component({
  selector: 'app-cost-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './cost-master.component.html',
  styleUrl: './cost-master.component.scss'
})
export class CostMasterComponent {
  FunctionMaster!:FormGroup;
  submitted = false;
  showError = false;
  pk_cost_centre_id!:string;
  Isedit=false;
  
  
  constructor(private fb: FormBuilder,private toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService , private CostMasterService : CostMasterService) {}
  
  
  ngOnInit():void{  
  
   this.FunctionMaster=this.fb.group({
    code:['',[Validators.required]],
    description:['',[Validators.required]],
  
  });
  
  
  this.pk_cost_centre_id = this.encryptionService.decryptText(this.route.snapshot.params['pk_cost_centre_id'].toString());  
    if (this.pk_cost_centre_id && this.pk_cost_centre_id !== 'undefined') {
      this.loadFunctionalMasterData(this.pk_cost_centre_id);
      this.Isedit = true; 
    }
  }
  
  
  
  
  checkDuplicate(description: string): void {
  const fieldName = 'CostDescription'; 
  const fieldValue = description; 
  const generalId = this.pk_cost_centre_id || ''; 
  
  this.CostMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.FunctionMaster.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.FunctionMaster.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.FunctionMaster.get('description')?.setErrors({ duplicate: 'Error checking FunctionMaster availability.' });
    }
  });
  }
  
  
  // 
  
  
  
  
  onSubmit(){
    
  if (this.FunctionMaster.invalid) {
    this.showError = true;
    return;
  }
  
  const data = {
    ...this.FunctionMaster.value,
  };
  
  
      
      if(this.Isedit){
  
        const data = {
          ...this.FunctionMaster.value,
          pk_cost_centre_id: this.pk_cost_centre_id,
        };
  
  
         this.CostMasterService.update_costMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/CostMaster_list");
            }
             else {
              // this.toastrService.error(result.message);
            }
          },
          
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrService.error('An error occurred during form submission');
          }
         })
      }
  
      else
      {
        this.CostMasterService.add_costMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/user/userdashboard/CostMaster_list");
  
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
  
  
  loadFunctionalMasterData(pk_cost_centre_id: string) {
    this.CostMasterService.getById_costMaster(pk_cost_centre_id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched functional Data:", res.data);  // Debugging ke liye
  
          this.FunctionMaster.patchValue({
            code: res.data.code,
            description:res.data.description,   
          });
  
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Functional details.");
        }
      },
  
      error: () => {
        this.toastrService.error("Error loading FUnctional data.");
      }
    });
  }
  
  resetForm(): void {
         this.FunctionMaster.reset();
    }
  
  
}
