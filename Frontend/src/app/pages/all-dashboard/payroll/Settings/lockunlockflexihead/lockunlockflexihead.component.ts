import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';


@Component({
  selector: 'app-lockunlockflexihead',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './lockunlockflexihead.component.html',
  styleUrl: './lockunlockflexihead.component.scss'
})
export class LockunlockflexiheadComponent {
  LockunlockflexiheadForm!: FormGroup;
  submited=false;
    constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private httpservice: PayrollService) {}
  
    ngOnInit() {
      this.LockunlockflexiheadForm = this.fb.group({
        FinancialYear: ['' ,Validators.required],
        Quarter: ['',Validators.required],
        EndDate: ['',Validators.required],
      });
    }    
   
    submit() {
      this.submited = true;
      if (this.LockunlockflexiheadForm.invalid) {
        alert('Please fill out all required fields!');
        return;
      }
      const payload = this.LockunlockflexiheadForm.value;
      console.log('Submitting:', payload);
      this.httpservice.lockunlockinsert(payload).subscribe(
        (response) => {
          console.log('API Response:', response);
          alert('Record saved successfully');
        },
        (error) => {
          console.error('API Error:', error);
          alert('Error saving record');
        }
      );
    }
   
  
    resetForm(): void {
           this. LockunlockflexiheadForm.reset();
         
          }
  
}
