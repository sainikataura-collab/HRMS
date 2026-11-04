import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonEngine } from '@angular/ssr';
import { CompanyPolicyService } from '../../HRservices/company-policy.service';
import { response } from 'express';

@Component({
  selector: 'app-policies-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './policies-master.component.html',
  styleUrl: './policies-master.component.scss'
})
export class PoliciesMasterComponent {

  router=Inject(Router)
  componyPolicies!:FormGroup;
  showError=false;
  constructor(private fb:FormBuilder, private httpService:CompanyPolicyService){}

ngOnInit():void{

  this.componyPolicies=this.fb.group({
    description:[null],
    isActive:['']
  })
}

OnSubmit(){
  if(this.componyPolicies.invalid){
   this.showError=true;
  }

  const formdata=this.componyPolicies.value;
  this.httpService.add_CompanyMaster(formdata).subscribe(
    (response)=>{
      console.log('Data Save Successfull!',response);
      this.componyPolicies.reset();
    },
    (error) => {
      console.error('Error saving data!', error);
    }
  )

}


}
