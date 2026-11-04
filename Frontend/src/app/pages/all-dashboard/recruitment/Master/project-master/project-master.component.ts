import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ProjectmasterService } from '../../RecruitServices/projectmaster.service';

@Component({
  selector: 'app-project-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './project-master.component.html',
  styleUrl: './project-master.component.scss'
})
export class ProjectMasterComponent {
ProjectMaster!:FormGroup;
submitted = false;
showError = false;
pk_ProjectId!:string;
Isedit=false;


constructor(private fb: FormBuilder,private projectservice : ProjectmasterService,private  toastrService: ToastrService,private router: Router,private route: ActivatedRoute,public encryptionService:EncryptionService) {}


ngOnInit():void{  

 this.ProjectMaster=this.fb.group({
  Projectcode:['',[Validators.required]],
  Projectname:['',[Validators.required]],
  active:[false]

});


this.pk_ProjectId = this.encryptionService.decryptText(this.route.snapshot.params['pk_ProjectId']);  
  if (this.pk_ProjectId && this.pk_ProjectId !== 'undefined') {
    this.loadFunctionalMasterData(this.pk_ProjectId);
    this.Isedit = true; 
  }
}




checkDuplicate(Projectname: string): void {
const fieldName = 'ProjectMaster'; 
const fieldValue = Projectname; 
const generalId = this.pk_ProjectId || ''; 

this.projectservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
  next: (response) => {
    if (response && response.isSuccess === false) {
      this.ProjectMaster.get('Projectname')?.setErrors({ duplicate: response.message });
    } else {
      this.ProjectMaster.get('Projectname')?.setErrors(null);
    }
  },
  error: (err) => {
    console.error('Duplicate Check API Error:', err);
    this.ProjectMaster.get('Projectname')?.setErrors({ duplicate: 'Error checking FunctionMaster availability.' });
  }
});
}
// 




onSubmit(){
  
if (this.ProjectMaster.invalid) {
  this.showError = true;
  return;
}
const data = {
  ...this.ProjectMaster.value,
};
    if(this.Isedit){
      const data = {
        ...this.ProjectMaster.value,
        pk_ProjectId: Number(this.pk_ProjectId),
      };
       this.projectservice.update_ProjectMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/recruitment/recruitmentdashboard/ProjectMaster_list");
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
      this.projectservice.add_ProjectMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/recruitment/recruitmentdashboard/ProjectMaster_list");

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


loadFunctionalMasterData(pk_ProjectId: string) {
  this.projectservice.getById_ProjectMaster(pk_ProjectId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Project Data:", res.data);  // Debugging ke liye

        this.ProjectMaster.patchValue({
          Projectcode: res.data.projectcode,
          Projectname:res.data.projectname,
          active: res.data.active,  
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
       this.ProjectMaster.reset();
  }

}
