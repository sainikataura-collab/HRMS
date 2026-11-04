import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { FinancialYearService } from '../../payroll/services/financial-year.service';

@Component({
  selector: 'app-financial-year',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink,],
  templateUrl: './financial-year.component.html',
  styleUrl: './financial-year.component.scss'
})
export class FinancialYearComponent {
  financialDetails!:FormGroup;
submitted=false;
showError = false;

id!:string;
Isedit=false;



changeFYForm!: FormGroup;

selectedFinancialYear: string = '';
  
  constructor(private fb: FormBuilder,private financialYearService:FinancialYearService,
    private  toastrService: ToastrService,private router: Router,private ngxUILoaderService:NgxUiLoaderService,
  private route: ActivatedRoute,private encryptionService:EncryptionService) {}

  ngOnInit():void{
   
    this.financialDetails = this.fb.group({
      date1: ['', Validators.required],
      date2: ['', Validators.required]
    });


  // this.ShiftId=Number.parseInt(this.route.snapshot.params['pk_shiftId'])
  this.id = (this.route.snapshot.params['pk_finid']);


     
  if (this.id && this.id) {
    this.getFin_YearByid(this.id);
    this.Isedit = true; 
  }

  }
  

  getFin_YearByid(pk_finid: string) {

      this.ngxUILoaderService.start(); // Start loader before API call
    
      this.financialYearService.get_FinancialYearId(pk_finid).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            console.log("Fetched Department Data:", res.data);  // Debugging ke liye
    
            this.financialDetails.patchValue({
              pk_finid:res.data.pk_finid,
              cid:res.data.cid,
              date1: this.formatDate(res.data.date1),
              date2: this.formatDate(res.data.date2),
              fyear:res.data.fyear,
              active:res.data.active
            });
            
    
            this.Isedit = true;

          }
           else 
           {
            this.toastrService.error("Failed to load Category details.");
           }
          this.ngxUILoaderService.stop(); // Stop loader after response
    
        },
        error: () => {
          this.toastrService.error("Error loading Category data.");
          this.ngxUILoaderService.stop(); // Stop loader on error
    
        }
      });
  }



  formatDate(dateStr: string): string | null {
    if (!dateStr) return null;
  
    const parts = dateStr.split('/');
    console.log(parts);
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    console.log(day, month, year);
    const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
    console.log(date);
    if (isNaN(date.getTime())) return null; // still safe check
  
    const offset = date.getTimezoneOffset();
    console.log(offset);
    const localDate = new Date(date.getTime() - offset * 60000);
    console.log(localDate);
    return localDate.toISOString().split('T')[0]; // final output
  }
  // formatDate(dateStr: string): string {
  //   if (!dateStr) return '';
  
  //   const parts = dateStr.split('/'); // ["22", "02", "2025"]
  //   if (parts.length === 3) {
  //     const [day, month, year] = parts;
  //     return `${year}-${month}-${day}`; // "2025-02-22"
  //   }
  //   return dateStr;
  // }
  




    onSubmit(): void {
      if (this.financialDetails.invalid) {
        this.showError = true;
        return;
      }
    
      const formData = {
        ...this.financialDetails.value,
        fk_LocID: sessionStorage.getItem('locationID'),
        fk_UserID: sessionStorage.getItem('fk_UserID')
      };
  
    
      if (this.id) {
        // **UPDATE Financial Year**
        const updateData = { ...formData, pk_finid: this.id };  // pk_finid is Financial Year primary key
     
        this.financialYearService.update_FinancialYear(this.id, updateData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'Financial Year updated successfully!');
              this.router.navigate(['/dash/user/userdashboard/financialYear_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to update financial year.');
            }
          },
          error: (err) => {
            this.toastrService.error('Something went wrong while updating!');
          }
        });
    
      } else {
        // **INSERT new Financial Year**
        this.financialYearService.add_FinancialYear(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'Financial Year added successfully!');
              this.router.navigate(['/dash/user/userdashboard/financialYear_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to add financial year.');
            }
          },
          error: (err) => {
            this.toastrService.error('Something went wrong while adding!');
          }
        });
      }
    }
    


    
  resetForm(): void {
         this.financialDetails.reset();
    }
}

