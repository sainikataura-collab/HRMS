import { EncryptionService } from './../../../../shared/services/encryption.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink ,Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';
import { BehavioralsService } from '../../recruitment/RecruitServices/behaviorals.service';

@Component({
  selector: 'app-behavioral-area-master',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule],
  templateUrl: './behavioral-area-master.component.html',
  styleUrl: './behavioral-area-master.component.scss',
})
export class BehavioralAreaMasterComponent {

behavioralForm!: FormGroup;
submitted = false;

showError = false;
pk_behaveid!:string;
Isedit=false;


constructor(private fb: FormBuilder,
  private behavioralsService:BehavioralsService,
  private  toastrService: ToastrService,
  private router:Router,
  private route: ActivatedRoute,
  public encryptionService:EncryptionService) {}


ngOnInit():void{

this.behavioralForm = this.fb.group({

      description: ['', Validators.required],
       weightage: ['', [Validators.required, Validators.pattern("^[0-9]+(\\.[0-9]+)?$")]],
      orderBy: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
      isActive: [false],
      remark: ['',Validators.required]
    });


this.pk_behaveid = this.encryptionService.decryptText(this.route.snapshot.params['pk_behaveid'].toString());


  if (this.pk_behaveid && this.pk_behaveid !== 'undefined') {
    this.loadBehavioralMasterData(this.pk_behaveid);
    this.Isedit = true;
  }

};




onSubmit(){

if (this.behavioralForm.invalid) {
   this.behavioralForm.markAllAsTouched();
  this.showError = true;
  return;
}

const data = {
  ...this.behavioralForm.value,
};

    if(this.Isedit){

      const data = {
        ...this.behavioralForm.value,
        active:this.behavioralForm.value.isActive ,
        pk_behaveid: this.pk_behaveid,
      };


       this.behavioralsService.update_behavioralMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/appraisal/appraisaldashboard/behavioral-area-master_list");
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
      this.behavioralsService.add_behavioralMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/appraisal/appraisaldashboard/behavioral-area-master_list");
          } else {
            this.toastrService.error("Description not accept duplicate value.");
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


loadBehavioralMasterData(pk_behaveid: string) {
  this.behavioralsService.getById_behavioralMaster(pk_behaveid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Behavioral Area Master Data:", res.data);  // Debugging ke liye

        this.behavioralForm.patchValue({

      description:res.data.description,
      weightage:res.data.weightage,
      orderBy:res.data.orderby,
      isActive:res.data.active,
      remark:res.data.remarks ,
        });


        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load Behavioral Area Master details.");
      }
    },

    error: () => {
      this.toastrService.error("Error loading Behavioral Area Master  data.");
    }
  });
}

















// onSubmit(){

// if (this.behavioralForm.invalid) {
//   this.showError = true;
//   return;
// }

// const data =
// {
//   ...this.behavioralForm.value
// }
//       this.behavioralsService.add_behavioralMaster(data).subscribe({
//         next: (result) => {
//           if (result.isSuccess) {
//             this.toastrService.success(result.message);
//             this.router.navigateByUrl("/dash/appraisal/appraisaldashboard/behavioralAreaMasterList");

//           } else {
//             this.toastrService.error(result.message);
//           }
//         },
//         error: () => {
//           // Error handling in case of a failure during form submission
//           this.toastrService.error('An error occurred during form submission');
//         }
//       })

//     }






}



