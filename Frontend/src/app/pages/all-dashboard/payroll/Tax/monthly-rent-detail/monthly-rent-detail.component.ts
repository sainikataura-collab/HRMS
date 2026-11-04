import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';

@Component({
  selector: 'app-monthly-rent-detail',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './monthly-rent-detail.component.html',
  styleUrl: './monthly-rent-detail.component.scss'
})
export class MonthlyRentDetailComponent {
RentDetailForm!: FormGroup;
showError=false;
EmployeeList: { name: string; value: string }[] = [];
monthsData:{ name: string; value: string }[] = [];
searchText: string = '';
fk_empid!: string;
submitted=false;
id!:number;
Isedit=false;
ngxUILoaderService = inject(NgxUiLoaderService);
DocumentStatus = [
  { name: 'Undertaking', value: 'U' },
  { name: 'Submited', value: 'Y' },
  
];
pk_rentId: number | null = null;
fk_finid: string ='';



// Default filter structure
employeeFilters = {
  empCode: '',
  empCodeManual: '',
  empName: '',
  selectedDepartments: [],
  selectedDesignation: '',
  selectedLocations: [],
  selectedNature: '',
  selectedCity: '',
  sortBy: '',
  userId: '',
  empStatus: '',
};
//fill alll rent related
months: { sno: number; month: string; year: number; rent: number }[] = [];
fillAllValue: number = 0;



 constructor(private fb: FormBuilder,private Service:MonthlyRentDetailService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
   
    this.RentDetailForm = this.fb.group({
    fk_empid: ['' ,Validators.required],
    empname: [''], 
    designation: [''],
    dept: [''],
    docsub_status:['' ,Validators.required],
    months: this.fb.array([])  // ⬅️ Table data as FormArray

    
     });
     this.getEmployeelist('Employee');
     this.generateMonthList();
    // this.getMonthList(); 
}

 // ✅ Safe getter
 get monthsControls() {
  return (this.RentDetailForm.get('months') as FormArray).controls;
}




generateMonthList() {
  this.ngxUILoaderService.start(); 

  this.Service.getMonthlist(this.fk_empid).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log("Original month list from API:", res);

        const financialMonthOrder = [
          'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
          'OCTOBER', 'NOVEMBER', 'DECEMBER',
          'JANUARY', 'FEBRUARY', 'MARCH'
        ];

        // Step 2: Sort the API months according to financial year
        const orderedMonths = financialMonthOrder.map(monthName =>
          res.data.find((m: any) => m.value.toUpperCase() === monthName)
        ).filter(Boolean); // remove nulls

        // Step 3: Generate table rows April–March (No Select row)
        //const currentYear = new Date().getFullYear();
         var date =sessionStorage.getItem('financialDate1')!;
         const currentYear = new Date(date).getFullYear();
        
        this.months = orderedMonths.map((month: any, index: number) => {
          let year = currentYear;
          if (['JANUARY', 'FEBRUARY', 'MARCH'].includes(month.value.toUpperCase())) {
            year += 1;
          }
          return {
            sno: index + 1,
            month: month.value,
            year: year,
            rent: 0
          };
        });

         // Step 4: Bind to FormArray (RentDetailForm.months)
        const controlArray = this.RentDetailForm.get('months') as FormArray;
        controlArray.clear(); // Reset FormArray

        this.months.forEach((month, index) => {
          controlArray.push(this.fb.group({
           // sno: [month.sno],
            fk_monthId: [month.month],
            fk_yearId: [month.year],
            rentamount: [null, Validators.required]
          }));
        });

      

        console.log("Final months table array:", this.months);
      } 
      else {
        this.toastrService.error("Failed to load month list.");
      }
      this.ngxUILoaderService.stop(); // Stop loader
    },
    error: (err) => {
      console.error("Error fetching month list:", err);
      this.toastrService.error("Error fetching month list. Please try again.");
      this.ngxUILoaderService.stop(); // Stop loader
    }
  });
}



fillAllRents() {
  const controlArray = this.RentDetailForm.get('months') as FormArray;
  controlArray.controls.forEach(control => {
    control.get('rentamount')?.setValue(this.fillAllValue);
  });
}


mapMonthNameToNumber(monthName: string): string {
  const monthMap: { [key: string]: string } = {
    'JANUARY': '1',
    'FEBRUARY': '2',
    'MARCH': '3',
    'APRIL': '4',
    'MAY': '5',
    'JUNE': '6',
    'JULY': '7',
    'AUGUST': '8',
    'SEPTEMBER': '9',
    'OCTOBER': '10',
    'NOVEMBER': '11',
    'DECEMBER': '12'
  };
  return monthMap[monthName.toUpperCase()] || '0';
}
  submit() {
    debugger
    if (this.RentDetailForm.invalid) {
      this.submitted = true;
      window.scrollTo(0,0);
       return;
    }
    this.ngxUILoaderService.start(); // Start loader

    
    const raw = this.RentDetailForm.getRawValue();
    const rentMst = {
      pk_rentId:this.pk_rentId,
      fk_empid: raw.fk_empid,
      dated: new Date(),
      docsub_status: raw.docsub_status,
      status: "",
      totalAmount: raw.months.reduce((acc: number, m: any) => acc + +m.rentamount, 0),
      rentdetailtype: "",
      isActive: true
    };
  
    const rentDetailMst = raw.months.map((m: any, index: number) => ({
      fk_monthId: this.mapMonthNameToNumber(m.fk_monthId),
      fk_yearId: m.fk_yearId.toString(),
      rentamount: +m.rentamount,
      remarks: "",
      dated: new Date(),
      isActive: true
    }));
  
    const formData = {
      rentMst,
      rentDetailMst
    };
     
  debugger
    if (this.pk_rentId) {
      // **UPDATE existing perquisite**
      const updateData = { ...formData};
  
      this.Service.update_Rent(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail updated successfully!');
            this.resetForm(); 
        //   this.router.navigate(['/dash/payroll/payrolldashboard/MonthlyRentDetail']);
          }
           else {
            this.toastrService.error(res.message || 'Failed to update detail.');
          }
          this.ngxUILoaderService.stop(); // Stop loader after response
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
          this.ngxUILoaderService.stop(); // Stop loader after response
        }
      });
  
    }
    else {
      // **INSERT new designation**
      this.Service.add_Rent(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail added successfully!');
          this.resetForm(); 

          // this.router.navigate(['/dash/payroll/payrolldashboard/MonthlyRentDetail']);
          } else {
            this.toastrService.error(res.message || 'Failed to add detail.');
          }
          this.ngxUILoaderService.stop(); // Stop loader after response
        },
        error: (err) => {
          console.error('Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
          this.ngxUILoaderService.stop(); // Stop loader after response
        }
      });
    }
  }

  //for only number validation
  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric characters
    }
  }
  
 //get employee
 // Fetch employee list for dropdown
 getEmployeelist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.Service.getEmployee(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.EmployeeList= res.data.map((Emp: any) => ({
          name: Emp.name,
          value: Emp.value
        }));
      } else {
        this.toastrService.error("Failed to load employee list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching employee list:", err);
      this.toastrService.error("Error fetching employee list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}
 
// Auto-fill fields when an employee is selected
// onEmpCodeChange(empCode: any) {
    
//   if (empCode) {
//     console.log(empCode);
//     this.fk_empid = empCode.value; // Assign selected employee ID
//      this.Service.getEmployeeDetails(empCode.value).subscribe(
//       (res) => {
//         console.log(res);
//         this.RentDetailForm.patchValue({
//           empname: res.data.empname,
//           designation: res.data.designation,
//           dept: res.data.dept
//         });

        
//       },
//       (error) => {
//         console.error('Error fetching employee details', error);
//         this.toastrService.error('Failed to fetch employee details.');
//       }
//     );
//     //for month trigger
//     this.generateMonthList();
//   }
// }


// onEmpCodeChange(empCode: any) {
//   if (empCode) {
//     this.fk_empid = empCode.value;

//     // 👇 Get employee name/designation/etc.
//     this.Service.getEmployeeDetails(empCode.value).subscribe(
//       (res) => {
//         console.log("hii",res);
//         this.RentDetailForm.patchValue({
//           empname: res.data.empname,
//           designation: res.data.designation,
//           dept: res.data.dept
//         });
//       },
//       (error) => {
//         this.toastrService.error('Failed to fetch employee details.');
//       }
//     );

   

    
//       this.Service.getById_Rent(empCode.value).subscribe({
//         next: (res) => {
//           if (res.isSuccess && res.data) {
//             const rentMst = res.data.employeeRentMst;
//             const rentDetailMst = res.data.employeeRentDetail;
      
//           //  this.pk_rentId = rentMst?.pk_rentId || null;
      
//             this.RentDetailForm.patchValue({
//               docsub_status: rentMst?.docsub_status || ''
//             });
      
            
//             const controlArray = this.RentDetailForm.get('months') as FormArray;
//              controlArray.clear(); // Clear existing controls
      
            
//             // First generate month controls
//             this.months.forEach((month) => {
//               controlArray.push(this.fb.group({
//                 fk_monthId: [month.month],
//                 fk_yearId: [month.year],
//                 rentamount: [month.rent, Validators.required]
//               }));
//             });
      
         
//             const financialMonthOrder = [
//               '','JANUARY', 'FEBRUARY', 'MARCH','APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
//               'OCTOBER', 'NOVEMBER', 'DECEMBER'              
//             ];
            
//             rentDetailMst.forEach((item: any) => {
//               const controlArray = this.RentDetailForm.get('months') as FormArray;
//               const target = controlArray.controls.find((c: AbstractControl) => {
//                 const monthId = c.get('fk_monthId')?.value;
//                 const yearId = c.get('fk_yearId')?.value;

//                 console.log();

//                 console.log(monthId)
//                 console.log(`Checking control - month: ${monthId}, year: ${yearId} vs item - month: ${item.fk_monthId}, year: ${item.fk_yearId}`);
                 
//                 return String(financialMonthOrder.findIndex(m=>m==monthId)) === String(item.fk_monthId) &&
//                        String(yearId) === String(item.fk_yearId);
//               });
//               console.log(target);
//               if (target) {
//                 target.patchValue({ rentamount: item.rentamount });
//               } else {
//                 console.warn('No matching control for month:', item.fk_monthId, 'year:', item.fk_yearId);
//               }
//             });
            
//             this.Isedit = true;
      
//           } else {
//             // No existing data – fresh form
//             this.generateMonthList(); // Should initialize the months FormArray
//           }
//         },
//         error: (err) => {
//           console.error("Error loading rent details:", err);
//           this.toastrService.error("Error loading rent data.");
//         }
//       });
      
    
//   }
// }

onEmpCodeChange(empCode: any) {
  if (empCode) {
    this.fk_empid = empCode.value;

    // Fetch employee name/designation/department
    this.Service.getEmployeeDetails(empCode.value).subscribe(
      (res) => {
        this.RentDetailForm.patchValue({
          empname: res.data.empname,
          designation: res.data.designation,
          dept: res.data.dept
        });
      },
      (error) => {
        this.toastrService.error('Failed to fetch employee details.');
      }
    );

    // Fetch existing rent details for the employee
    this.Service.getById_Rent(empCode.value).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const rentMst = res.data.employeeRentMst;
          const rentDetailMst = res.data.employeeRentDetail;
          this.pk_rentId = rentMst?.pk_rentId;

          // Patch document submission status
          this.RentDetailForm.patchValue({
            docsub_status: rentMst?.docsub_status || ''
          });

          // Clear and regenerate month controls
          const controlArray = this.RentDetailForm.get('months') as FormArray;
          controlArray.clear();

          this.months.forEach((month) => {
            controlArray.push(this.fb.group({
              fk_monthId: [month.month],
              fk_yearId: [month.year],
              rentamount: [month.rent, Validators.required]
            }));
          });

          const financialMonthOrder = [
            '', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
          ];

          rentDetailMst.forEach((item: any) => {
            const target = controlArray.controls.find((c: AbstractControl) => {
              const monthId = c.get('fk_monthId')?.value;
              const yearId = c.get('fk_yearId')?.value;

              return String(financialMonthOrder.findIndex(m => m === monthId)) === String(item.fk_monthId) &&
                     String(yearId) === String(item.fk_yearId);
            });

            if (target) {
              target.patchValue({ rentamount: item.rentamount });
            }
          });

          //this.Isedit = true;
        } else {
          // No existing data – initialize fresh form
          this.generateMonthList();
        }
      },
      error: () => {
        this.toastrService.error("Error loading rent data.");
      }
    });
  }
}


  //for get employee from filter
  getEmployees(): void {
    this.Service
      .get_Employees_Ddl(this.employeeFilters)
      .subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // this.employeeList = res.data;
            this.EmployeeList = res.data.map((emp: any) => ({
              name: emp.name,
              value: emp.value,
            }));
          } else {
            this.EmployeeList = [];
  
            this.toastrService.error(res.message, 'Error');
          }
        },
        error: (error) => {
          this.EmployeeList = [];
  
          this.toastrService.error('Failed to retrieve employees', 'Error');
        },
      });
  }
  //for filter
handleFilters(filters: any) {
  this.employeeFilters = filters;
  this.getEmployees(); // Refresh list with new filters
}

 


resetForm() {
  this.fillAllValue = 0;
  this.submitted = false;
  this.pk_rentId = null;
  this.Isedit = false;

  // Reset all form fields including employee dropdown
  this.RentDetailForm.patchValue({
    fk_empid: null,          // Reset employee selection to default (null)
    empname: '',
    designation: '',
    dept: '',
    docsub_status: ''
  });

  // Reset only rentamounts (keep month/year)
  const controlArray = this.RentDetailForm.get('months') as FormArray;
  controlArray.controls.forEach(control => {
    control.get('rentamount')?.setValue(0);
  });
}


//for delete 
delete() {
  const fk_empid = this.RentDetailForm.value.fk_empid;

  if (!fk_empid) {
    this.toastrService.warning('Please select an employee to delete their rent details.');
    return;
  }

  if (confirm(`Are you sure you want to delete rent details`)) {
    this.Service.delete_Rent(fk_empid).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Record deleted successfully!');

          // ✅ Reset form
          this.resetForm();

          // ✅ Clear rentId and employee ID
          this.pk_rentId = null;
          this.RentDetailForm.patchValue({ fk_empid: null });
        } else {
          this.toastrService.error(response.message || 'Failed to delete record.');
        }
      },
      error: (err) => {
        console.error('Error while deleting:', err);
        this.toastrService.error('Something went wrong while deleting the record.');
      }
    });
  }
}



}
