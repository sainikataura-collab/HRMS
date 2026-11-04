import { Tooltip } from '@amcharts/amcharts5';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { WebPageMasterService } from '../../services/web-page-master.service';

@Component({
  selector: 'app-web-page-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink,NgSelectComponent,RouterLink],
  templateUrl: './web-page-master.component.html',
  styleUrl: './web-page-master.component.scss'
})
export class WebPageMasterComponent {

  WebpageDetails!:FormGroup;
  submitted=false;
  showError = false;
  
  id!:number;
  Isedit=false;
  selects = [
    { name: 'Common', value: 'Common' },
    { name: 'create master', value: 'create master' },
    { name: 'CRM Master', value: 'CRM Master' },
    { name: 'Emp Management', value: 'Emp Management' }
  ];
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private webpageservice:WebPageMasterService) {}
ngOnInit():void{
   
    this.WebpageDetails=this.fb.group({
      Menucaption: ['',[ Validators.required]],
      Tooltip: [''],
      ParentMenu: ['',[ Validators.required]],
      NavigateUrl:[''],
      DisplayOrder: [''],
      isActive:false,
      webpagepath:[''],
      Webpagename:[''],
      BelongsModule: ['',[ Validators.required]],
      TypeOfpage: ['',[ Validators.required]],
      Remarks: [''],
    })
}
onSubmit(){
  this.submitted=true;
  if (this. WebpageDetails.invalid) {
    this.showError = true;
    return;
  }
  const data = {
    ...this. WebpageDetails.value 
    };

    if(this.Isedit){
      this.webpageservice.update_WebPageMaster(this.id,data).subscribe({
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
     this.webpageservice.add_WebPageMaster(data).subscribe({
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
  this. WebpageDetails.reset();
    }
}
