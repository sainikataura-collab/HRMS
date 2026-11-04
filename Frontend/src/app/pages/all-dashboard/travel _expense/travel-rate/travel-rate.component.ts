import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { TravelRateService } from '../TravelService/travel-rate.service';

@Component({
  selector: 'app-travel-rate',
  standalone: true,
  imports: [FormsModule,
      RouterLink,
      ReactiveFormsModule,
      CommonModule,
      NgxPaginationModule,
      NgSelectModule],
  templateUrl: './travel-rate.component.html',
  styleUrl: './travel-rate.component.scss'
})
export class TravelRateComponent {

   ngxUILoaderService = inject(NgxUiLoaderService);
  
   Modelist: { name: string; value: string }[] = [];
   
   
   
     TravelRateform!: FormGroup;
      submitted = false;
      showError = false;
      pk_RateID!: number
      isEditMode: boolean = false;
    
      route = inject(ActivatedRoute);
    
     
      constructor(
        private fb: FormBuilder,
        private toastrService: ToastrService,
        private router: Router,
        private encryptionService: EncryptionService,
        private httpservice: TravelRateService,
      ) {}
    
      ngOnInit() {
        this.TravelRateform = this.fb.group({
          fk_travelmodeId: [null, Validators.required],
          rate: ['', Validators.required],
           effectivedate: ['', Validators.required],
            remarks: ['', Validators.required],
            isActive: [''],
           
        });
    
        this.route.paramMap.subscribe(params => {
          const id = params.get('pk_RateID');
          if (id) {
            this.pk_RateID = +this.encryptionService.decryptText(id.toString());
            this.isEditMode = true;
            this.getById(this.pk_RateID);
          }
        });
       this.getTravelModelist('TravelMode');
     
      }
    
     
      convertToISODate(dateStr: string): string | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    return `${year}-${month}-${day.padStart(2, '0')}`; // 'yyyy-MM-dd'
  }
  
    
   getById(pk_RateID: number) {
    this.httpservice.get_TravelRate_ById(pk_RateID).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          const data = response.data;
  
          const formattedEffectiveDate = this.convertToISODate(data.effectivedate);
          console.log("Patching date:", formattedEffectiveDate);
  
          this.TravelRateform.patchValue({
            fk_travelmodeId: String(data.fk_travelmodeId),
            rate: data.rate,
            remarks: data.remarks,
            effectivedate: formattedEffectiveDate, // or new Date(...) if needed
            isActive: data.isActive
          });
        } else {
          console.error('Failed to fetch Travel Rate detail:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching Travel Rate detail:', error);
      }
    );
  }
  
  
     
    
      submit() {
        
        if (this.TravelRateform.invalid) {
          this.showError = true;
          this.submitted = true;
      
          return;
        }
      
         const formValues = this.TravelRateform.value;
  
      
        // Ensure only 'orderno' is converted to number
       const payload = {
      TravelRateMst: [
        {
          ...formValues,
           pk_RateID: this.pk_RateID || 0, // Important for update
           rate:String(formValues.rate),
          fk_travelmodeId: Number(formValues.fk_travelmodeId),  // Convert if needed
         effectivedate: formValues.effectivedate,
          isActive: formValues.isActive
        }
      ]
    };
        if (this.isEditMode && this.pk_RateID) {
          
          this.httpservice.update_TravelRate(payload ).subscribe(
            response => {
              if (response.isSuccess) {
                this.toastrService.success(response.message || 'Details updated successfully!');
                this.router.navigate(['/dash/travel_expense/travel_expensedashboard/Travel_rate_list']);
              } else {
                this.toastrService.error(response.message);
              }
            }
          );
        } else {
          this.httpservice.add_TravelRate(payload).subscribe(
            response => {
              if (response.isSuccess) {
                this.toastrService.success(response.message || 'Detail saved successfully!');
                this.router.navigate(['/dash/travel_expense/travel_expensedashboard/Travel_rate_list']);
              } else {
                this.toastrService.error(response.message);
              }
            }
          );
        }
      }
      
    
      resetForm(): void {
        this.TravelRateform.reset();
      }
  getTravelModelist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.httpservice.getTravelMode(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            console.log(res.data)
            this.Modelist= res.data.map((Emp: any) => ({
              name: Emp.name,
              value: Emp.value
            }));
          } else {
            this.toastrService.error("Failed to load Mode list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching Mode list:", err);
          this.toastrService.error("Error fetching Mode list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }
  
     
    
  
}
