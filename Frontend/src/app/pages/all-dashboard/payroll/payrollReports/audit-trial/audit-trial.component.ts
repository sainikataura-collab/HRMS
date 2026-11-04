import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-audit-trial',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './audit-trial.component.html',
  styleUrl: './audit-trial.component.scss'
})
export class AuditTrialComponent {
EmployeeForm!: FormGroup;
showError = false;
submitted = false
  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router) {}

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      fromDate: ['',[ Validators.required]],
      toDate: ['',[ Validators.required]],

    });
  }    
  OnVeiw(){
    this.submitted = true;
    if (this. EmployeeForm.invalid) {
      this.showError = true;
      return;
    }
   }
  resetForm(): void {
         this. EmployeeForm.reset();
      

        }
}


