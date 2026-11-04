import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { StateMasterService } from '../../services/state-master.service';

@Component({
  selector: 'app-state-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './state-master.component.html',
  styleUrl: './state-master.component.scss'
})
export class StateMasterComponent {
UserDetails!:FormGroup;
submitted=false;
showError = false;

id!:number;
Isedit=false;

  
  constructor(private fb: FormBuilder,private stateMasterService:StateMasterService,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit():void{
   
    this. UserDetails=this.fb.group({
      description: ['',[ Validators.required]],
      code: ['',[ Validators.required]],
      GSTNo: ['',[ Validators.required]],
      LWFApplicable:false,
      PTApplicable:false,

    })


  }
  

  onSubmit(){
    this.submitted=true;
    if (this. UserDetails.invalid) {
      this.showError = true;
      return;
    }
    const data = {
      ...this. UserDetails.value 
      };
      if(this.Isedit){
         this.stateMasterService.update_StateMaster(this.id,data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
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
        this.stateMasterService.add_StateMaster(data).subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.toastrService.success(result.message);
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
  resetForm(): void {
         this. UserDetails.reset();
        }
}

