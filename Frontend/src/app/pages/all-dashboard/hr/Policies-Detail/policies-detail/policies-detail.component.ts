import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PolicyService } from '../../HRservices/policy-detail.service';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-policies-detail',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectComponent],
  templateUrl: './policies-detail.component.html',
  styleUrl: './policies-detail.component.scss'
})
export class PoliciesDetailComponent {

  componyPoliciesForm!:FormGroup;

  companyPolicyList=[
    {name:'cp', value:'cp'}
  ]

  constructor(private fb:FormBuilder,private httpservice:PolicyService){}

  showError=false;

  ngOnInit():void{
    this.componyPoliciesForm=this.fb.group({
      CompanyPolicy:[this.companyPolicyList],
      Description:[null],
      Details:[null],
      filename:[null],
      isActive:['',false]
    })
  }


  OnSubmit(){
    if(this.componyPoliciesForm.invalid){
     this.showError=true;
    }
    const formdata=this.componyPoliciesForm.value;
    this.httpservice.add_CompanyDetail(formdata).subscribe(
      (response)=>{
        console.log('Data Save Successfull!',response);
        this.componyPoliciesForm.reset();
      },
      (error) => {
        console.error('Error saving data!', error);
      }
    )
  }
}
