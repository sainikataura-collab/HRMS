import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { LodgingBoardingService } from '../TravelService/lodging-boarding.service';

import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-lodging-boarding',
  standalone: true,
  imports: [FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule],
  templateUrl: './lodging-boarding.component.html',
  styleUrl: './lodging-boarding.component.scss'
})
export class LodgingBoardingComponent {
    ngxUILoaderService = inject(NgxUiLoaderService);

 GradeList: { name: string; value: string }[] = [];
  ClassList: { name: string; value: string }[] = [];
 
 
   lodgingBoardingform!: FormGroup;
    submitted = false;
    showError = false;
    pk_lodgingboardingId!: number
    isEditMode: boolean = false;
  
    route = inject(ActivatedRoute);
  
   
    constructor(
      private fb: FormBuilder,
      private toastrService: ToastrService,
      private router: Router,
      private encryptionService: EncryptionService,
      private httpservice: LodgingBoardingService,
    ) {}
  
    ngOnInit() {
      this.lodgingBoardingform = this.fb.group({
        fk_classid: [null, Validators.required],
        fk_classTvlId: [null, Validators.required],
         effectivedate: ['', Validators.required],
          lodgingboarding: ['', Validators.required],
          fixedFda: ['', Validators.required],
          fixedLta: ['', Validators.required],
          isActive:[''],
      });
  
      this.route.paramMap.subscribe(params => {
        const id = params.get('pk_lodgingboardingId');
        if (id) {
          this.pk_lodgingboardingId = +this.encryptionService.decryptText(id.toString());
          this.isEditMode = true;
          this.getConfirmationEmailById(this.pk_lodgingboardingId);
        }
      });
     this.getGradelist('Grade');
     this.getClasslist('Class');
    }
  
    // getConfirmationEmailById(pk_lodgingboardingId: number) {
    //   this.httpservice.get_lodging_Boarding_ById(pk_lodgingboardingId).subscribe(
    //     (response) => {
    //       if (response.isSuccess && response.data) {
    //         this.lodgingBoardingform.patchValue({
    //           orderno: String(response.data.orderno),
    //           days: response.data.days
    //         });
    //       } else {
    //         console.error('Failed to fetch ConfirmationEmail:', response.message);
    //       }
    //     },
    //     (error) => {
    //       console.error('Error fetching ConfirmationEmail:', error);
    //     }
    //   );
    // }
    convertToISODate(dateStr: string): string | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  return `${year}-${month}-${day.padStart(2, '0')}`; // 'yyyy-MM-dd'
}

  
 getConfirmationEmailById(pk_lodgingboardingId: number) {
  this.httpservice.get_lodging_Boarding_ById(pk_lodgingboardingId).subscribe(
    (response) => {
      if (response.isSuccess && response.data) {
        const data = response.data;

        const formattedEffectiveDate = this.convertToISODate(data.effectivedate);
        console.log("Patching date:", formattedEffectiveDate);

        this.lodgingBoardingform.patchValue({
          fk_classid: data.fk_classid,
          fk_classTvlId: String(data.fk_classTvlId),
          lodgingboarding: data.lodgingboarding,
          fixedFda: data.fixedFda,
          fixedLta: data.fixedLta,
          effectivedate: formattedEffectiveDate, // or new Date(...) if needed
          isActive: data.isActive
        });
      } else {
        console.error('Failed to fetch Lodging Boarding:', response.message);
      }
    },
    (error) => {
      console.error('Error fetching Lodging Boarding:', error);
    }
  );
}


   
  
    submit() {
      
      if (this.lodgingBoardingform.invalid) {
        this.showError = true;
        this.submitted = true;
    
        return;
      }
    
       const formValues = this.lodgingBoardingform.value;

    
      // Ensure only 'orderno' is converted to number
     const payload = {
    lodgingBoardingMst: [
      {
        ...formValues,
         pk_lodgingboardingId: this.pk_lodgingboardingId || 0, // Important for update
        fk_classTvlId: Number(formValues.fk_classTvlId),  // Convert if needed
        lodgingboarding: String(formValues.lodgingboarding),
        fixedFda: String(formValues.fixedFda),
        fixedLta: String(formValues.fixedLta),
        effectivedate: formValues.effectivedate,
        isActive: formValues.isActive
      }
    ]
  };
      if (this.isEditMode && this.pk_lodgingboardingId) {
        
        this.httpservice.update_lodging_Boarding(payload ).subscribe(
          response => {
            if (response.isSuccess) {
              this.toastrService.success(response.message || 'Details updated successfully!');
              this.router.navigate(['/dash/travel_expense/travel_expensedashboard/lodging_Boarding_list']);
            } else {
              this.toastrService.error(response.message);
            }
          }
        );
      } else {
        this.httpservice.add_lodging_Boarding(payload).subscribe(
          response => {
            if (response.isSuccess) {
              this.toastrService.success(response.message || 'Detail saved successfully!');
              this.router.navigate(['/dash/travel_expense/travel_expensedashboard/lodging_Boarding_list']);
            } else {
              this.toastrService.error(response.message);
            }
          }
        );
      }
    }
    
  
    resetForm(): void {
      this.lodgingBoardingform.reset();
    }
getGradelist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.httpservice.getGrade(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.GradeList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load Grade list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching Grade list:", err);
        this.toastrService.error("Error fetching Grade list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

   
  getClasslist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.httpservice.getGrade(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.ClassList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load Class list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching class list:", err);
        this.toastrService.error("Error fetching class list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }
}
