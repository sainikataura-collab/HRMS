import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FinancialYearService } from '../../payroll/services/financial-year.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-financial-year-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, FormsModule,CommonModule,NgxPaginationModule,],
  templateUrl: './financial-year-list.component.html',
  styleUrl: './financial-year-list.component.scss'
})
export class FinancialYearListComponent {


  changeFYForm!:FormGroup;
  pageIndex:number=1;
pageSize:number=10;
totalItems :number= 0;
  fincancialList:any[]=[];
  financialYears: any[] = []; // This will be populated from API

constructor(private financialyearService:FinancialYearService,private toastrService:ToastrService,private router:Router,
   public encryptionService:EncryptionService,private fb:FormBuilder,){}


      ngOnInit(){
        this.changeFYForm = this.fb.group({
          selectedFinancialYear: ['', Validators.required]
        });
        this.getFinYearList();
        this. getChangeYearData();
      }


      getFinYearList(): void {
        this.financialyearService.get_FinancialYear(this.pageIndex - 1, this.pageSize).subscribe({
          next: (response) => {
            console.log('Data retrieved successfully:', response);
            if (response.isSuccess) {
              this.fincancialList = response.data;
              this.totalItems = response.totalCount;
            } else {
              console.error('Failed to retrieve data:', response.message);
              this.toastrService.error(response.message || 'Failed to retrieve state data');
            }
          },
          error: (error) => {
            console.error('Error retrieving data:', error);
            this.toastrService.error('Error fetching state data');
          }
        });
      }


      // onChangeFinancialYear() {
      //   if (this.changeFYForm.valid) {
      //     const selectedYear = this.changeFYForm.value.selectedFinancialYear;
      //     console.log('Changing to Financial Year:', selectedYear);
      //     // Logic to switch financial year
      //   } else {
      //     alert('Please select a financial year to change.');
      //   }
      // }


      onChangeFinancialYear() {
        const selectedFYId = this.changeFYForm.get('selectedFinancialYear')?.value;
      
        if (!selectedFYId) {
          this.toastrService.error('Please select a Financial Year.');
          return;
        }
      
        const body = { pk_finid: selectedFYId }; // Example body
      
        // this.ngxUILoaderService.start();
      
        this.financialyearService.OnChange(selectedFYId, body).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success('Financial year changed successfully!');
            } else {
              this.toastrService.error('Failed to change financial year.');
            }
            // this.ngxUILoaderService.stop();
          },
          error: () => {
            this.toastrService.error('Error while changing financial year.');
            // this.ngxUILoaderService.stop();
          }
        });
      }
      
      



      getChangeYearData(): void {
        this.financialyearService.get_FinancialYearchangedata().subscribe({
          next: (response) => {
            console.log('Data retrieved successfully:', response);
            if (response.isSuccess)
               {
                  this.financialYears = response.data;

                  const currentFinancialYear = this.financialYears.find(x => x.curfyear === 'Y');
                  if (currentFinancialYear) {
                    this.changeFYForm.patchValue({
                      selectedFinancialYear: currentFinancialYear.pk_finid
                    });
                  }
               } 
            else 
              {
                console.error('Failed to retrieve data:', response.message);
                this.toastrService.error(response.message || 'Failed to retrieve state data');
              }
          },
          error: (error) => {
            console.error('Error retrieving data:', error);
            this.toastrService.error('Error fetching state data');
          }
        });
      }

      isUpdate(pk_finid: string) {
        // Encrypt the ID before navigating
        this.router.navigate(["/dash/user/userdashboard/financialYear", pk_finid]);
      }


      delete(pk_finid: string) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.financialyearService.delete_FinancialYear(pk_finid).subscribe(
                (response: any) => {
                    if (response.isSuccess) {
      
                      this.toastrService.success(response.message || 'Record deleted successfully');
                        //alert('Record deleted successfully');
                        this.getFinYearList(); 
                        this.getChangeYearData(); 
                    } 
                    else {
                      this.toastrService.error(response.message, 'Error');
                    }
                },
                (errorMessage) => {
                    console.error('Error deleting record', errorMessage);
                    this.toastrService.error(errorMessage, 'Error');
                }
            );
        }
      }


}
