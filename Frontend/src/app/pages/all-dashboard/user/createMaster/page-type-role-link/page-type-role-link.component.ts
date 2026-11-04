import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PageTypeRoleLinkService } from '../../services/page-type-role-link.service';

@Component({
  selector: 'app-page-type-role-link',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink,NgSelectComponent],
  templateUrl: './page-type-role-link.component.html',
  styleUrl: './page-type-role-link.component.scss'
})
export class PageTypeRoleLinkComponent {
UserDetails!:FormGroup;
submitted=false;
showError = false;

id!:number;
Isedit=false;
selects = [
  { name: 'Ahemadabad', value: 'Ahemadabad' },
  { name: 'Alwar', value: 'Alwar' },
  { name: 'Ankleshwar', value: 'Ankleshwar' },
  { name: 'Ambala', value: 'Ambala' }
];
pageTypes = [
  { name: 'MASTER', controlName: 'master' },
  { name: 'TRANSACTION', controlName: 'transaction' },
  { name: 'REPORTS', controlName: 'reports' },
  { name: 'OTHER', controlName: 'other' }
];
  
  constructor(private fb: FormBuilder,private pageTypeRoleLinkService:PageTypeRoleLinkService,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit():void{
   
    this. UserDetails=this.fb.group({
      roleName: ['',[ Validators.required]],
      all: [false],
      master: [false],
      transaction: [false],
      reports: [false],
      other: [false]


    })


  }
  toggleAllSelection(event: any) {
    const isChecked = event.target.checked;
    let updatedValues: any = { all: isChecked };

    this.pageTypes.forEach(item => {
      updatedValues[item.controlName] = isChecked;
    });

    this.UserDetails.patchValue(updatedValues);
  }

  // ✅ Individual checkboxes ka selection handle karega
  toggleSelection(event: any, controlName: string) {
    const isChecked = event.target.checked;
    this.UserDetails.get(controlName)?.setValue(isChecked);

    // ✅ Check if all checkboxes are selected, then mark "All" as checked
    const allSelected = this.pageTypes.every(item => this.UserDetails.get(item.controlName)?.value);
    this.UserDetails.get('all')?.setValue(allSelected);
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
         this.pageTypeRoleLinkService.update_PageTypeRoleLink(this.id,data).subscribe({
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
        this.pageTypeRoleLinkService.add_PageTypeRoleLink(data).subscribe({
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

