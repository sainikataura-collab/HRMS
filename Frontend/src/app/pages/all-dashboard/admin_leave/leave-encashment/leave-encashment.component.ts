import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { data } from 'jquery';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { LeaveEncashmentService } from '../../payroll/services/leave-encashment.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-leave-encashment',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './leave-encashment.component.html',
  styleUrl: './leave-encashment.component.scss'
})
export class LeaveEncashmentComponent {
  leaveEncashForm!: FormGroup;
  showError=false;
  EmployeeList: { name: string; value: string }[] = [];
  Leave: { name: string, value: string }[] = []; 
  Month: { name: string, value: string }[] = []; 
  Year: { name: string, value: string }[] = []; 
  searchText: string = '';
  fk_empid!: string;
  submitted=false;
  Isedit=false;
  ngxUILoaderService = inject(NgxUiLoaderService);
  pk_encashid: string ='';
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
    constructor(private fb: FormBuilder,private Service:LeaveEncashmentService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
  
    ngOnInit() {
   
      this.leaveEncashForm = this.fb.group({
        fk_empid: [null,[ Validators.required]],
        empname: [''], 
        designation: [''],
        dept: [''],
        fk_monthid:[null,[ Validators.required]],
        fk_leaveid:[null,[ Validators.required]],
        balleave:['',[ Validators.required]],
        fk_yearid:[null,[ Validators.required]],
        totleaveencash:['',[ Validators.required]],
        dated:['',[ Validators.required]],
        amount_N:['',[ Validators.required]],
        remarks:['']

       });

       this.getLeavelist('Leave');
       this.getEmployeelist('Employee');
       this.getMonthlist('Month');
       this.getYearList('Year');

       this.pk_encashid = this.encryption.decryptText(this.route.snapshot.params['pk_encashid']);
       if (this.pk_encashid && this.pk_encashid !== 'undefined') {
       this.patchform(this.pk_encashid);
       this.Isedit = true; 
     }


     this.leaveEncashForm.get('fk_empid')?.valueChanges.subscribe(() => {
      this.checkAndFetchBalanceLeave();
    });
    
    this.leaveEncashForm.get('fk_leaveid')?.valueChanges.subscribe(() => {
      this.checkAndFetchBalanceLeave();
    });

    // this.leaveEncashForm.get('totleaveencash')?.valueChanges.subscribe(() => {
    //   this.calculateAmmount();
    // });

    // this.leaveEncashForm.get('totleaveencash')?.valueChanges.subscribe(() => {
    //   const balanceLeave = Number(this.leaveEncashForm.get('balleave')?.value);
    //   const inputLeave = Number(this.leaveEncashForm.get('totleaveencash')?.value);

    //   if (isNaN(balanceLeave) || balanceLeave <= 0) {
    //     this.toastrService.warning("You can't encash leave as balance leave is zero or negative.");
    //     this.leaveEncashForm.patchValue({ totleaveencash: '' });
    //     this.leaveEncashForm.get('amount_N')?.patchValue('');
    //     return;
    //   }

    //   if (inputLeave >= balanceLeave) {
    //     this.toastrService.warning(`Encash leave must be less than balance leave (${balanceLeave}).`);
    //     this.leaveEncashForm.patchValue({ totleaveencash: balanceLeave - 1 });
    //     this.calculateAmmount();
    //     return;
    //   }

    //   this.calculateAmmount();
    // });

    }




    getLeavelist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.Service.getLeave(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            this.Leave = res.data.map((leave: any) => ({
              name: leave.name,
              value: leave.value
            }));
          } else {
            this.toastrService.error("Failed to load leave list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching leave list:", err);
          this.toastrService.error("Error fetching leave list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }

    getMonthlist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.Service.getMonthlist(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            this.Month = res.data.map((month: any) => ({
              name: month.name,
              value: month.value
            }));
          } else {
            this.toastrService.error("Failed to load month list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching leave list:", err);
          this.toastrService.error("Error fetching month list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }

     //get year list 
     getYearList(fieldName: string) {
  
      this.ngxUILoaderService.start(); // Start loader before API call
    
      this.Service.getYear(fieldName).subscribe({
        next: (res) => {
              if (res.isSuccess && res.data) {
                  this.Year = res.data.map((year: any) => ({
                      name: year.name,
                      value: year.value
                  }));
              } else {
                  this.toastrService.error("Failed to load HOD list.");
              }
              this.ngxUILoaderService.stop(); // Stop loader after response
    
          },
          error: (err) => {
              console.error("Error fetching HOD list:", err);
              this.toastrService.error("Error fetching level list.");
              
          }
      });
    }
  
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
  
    // Auto-fills fields when an employee is selected from the dropdown
   onEmpCodeChange(empCode: any) {
    
  if (empCode) {
    console.log(empCode);
    this.fk_empid = empCode.value; // Assign selected employee ID
     this.Service.getEmployeeDetails(empCode.value).subscribe(
      (res) => {
        console.log(res);
        this.leaveEncashForm.patchValue({
          empname: res.data.empname,
          designation: res.data.designation,
          dept: res.data.dept
        });

        
      },
      (error) => {
        console.error('Error fetching employee details', error);
        this.toastrService.error('Failed to fetch employee details.');
      }
    );
  }
}
    onSubmit(){
      this.submitted=true;
   
        if (this.leaveEncashForm.invalid) {
          this.submitted = true;
          return;
        }
      
      const data = this.leaveEncashForm.getRawValue(); // Includes disabled fields!
        if(this.pk_encashid){
           data.pk_encashid = this.pk_encashid;
           this.Service.update_LeaveEncash(data,).subscribe({
            next: (result) => {
              if (result.isSuccess) {
                this.toastrService.success(result.message);
                this.router.navigate(['/dash/adminLeave/adminLeavedashboard/leaveEncashment_list']);
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
          this.Service.add_LeaveEncash(data).subscribe({
            next: (result) => {
              if (result.isSuccess) {
                this.toastrService.success(result.message);
                this.router.navigate(['/dash/adminLeave/adminLeavedashboard/leaveEncashment_list']);
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
   

    handleFilters(filters: any) {
      this.employeeFilters = filters;
      this.getEmployees(); // Refresh list with new filters
      }
   
      // Prevents non-numeric input in number fields
//  validateNumber(event: KeyboardEvent) {
//   const charCode = event.key.charCodeAt(0);
//   if (charCode < 48 || charCode > 57) {
//     event.preventDefault(); // Block non-numeric characters
//   }

//   //check bal leave >0
//   if(this.leaveEncashForm.get('balleave')?.value<=0  || this.leaveEncashForm.get('totleaveencash')?.value> this.leaveEncashForm.get('balleave')?.value){
//     event.preventDefault(); // Block non-numeric characters
//   }
// }

validateNumber(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  const char = event.key;

  // Allow control keys like Backspace, Arrow keys, etc.
  if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].includes(char)) {
    return;
  }

  // Block non-numeric characters
  if (!/^[0-9]$/.test(char)) {
    event.preventDefault();
    return;
  }

  const currentValue = input.value;
  const newValue = currentValue + char; // the value after key press
  const newNumber = parseInt(newValue, 10);

  const balanceLeave = this.leaveEncashForm.get('balleave')?.value || 0;

  // Check if balance leave is 0 or new input is >= balance leave
  if (balanceLeave <= 0 || newNumber > balanceLeave) {
    event.preventDefault();
  }
  this.leaveEncashForm.get('totleaveencash')?.valueChanges.subscribe(() => {
    this.calculateAmmount();
  });

}

 
// Fetches document status details by ID and populates the form for editing
patchform(pk_encashid: string) {
  this.Service.getById_LeaveEncash(this.pk_encashid).subscribe({
     next: (res) => {
       if (res.isSuccess && res.data) {
         console.log("Fetched doc status Data:", res.data);  // Debugging ke liye
        let formattedDate = this.formatDate(res.data.dated); // Convert date
        //  let formattedDate1 = this.formatDate(res.data.billdate); // Convert date
          
         this.leaveEncashForm.patchValue({
          pk_encashid:pk_encashid,
          fk_empid: res.data.fk_empid,  // Employee ID
          empname: res.data.empname,    // Employee Name
          designation: res.data.designation,  // Employee Designation
          dept: res.data.dept,
                    // Employee Department
         fk_monthid: String(res.data.fk_monthid),
        fk_yearid: String(res.data.fk_yearid),
        fk_leaveid: String(res.data.fk_leaveid),
        dated: formattedDate,
        balleave: res.data.balleave,
         totleaveencash: res.data.totleaveencash,
          amount_N: res.data.encash_amt,
          remarks: res.data.remarks
         });
              // 👉 Disable fields only in edit mode
        this.leaveEncashForm.get('fk_empid')?.disable();
        this.leaveEncashForm.get('empname')?.disable();
        this.leaveEncashForm.get('designation')?.disable();
        this.leaveEncashForm.get('dept')?.disable();
         this.onEmpCodeChange({value:this.leaveEncashForm.get('fk_empid')?.value });
     
         this.Isedit = true;
       } else {
         this.toastrService.error("Failed to load  details.");
         
       }
      },
     error: () => {
       this.toastrService.error("Error loading  data.");

 
     }
   });
 }

 // Formats date from DD/MM/YYYY to YYYY-MM-DD format
formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return ''; // Return an empty string if date is null or undefined
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    console.warn("Invalid date format:", dateString); //  Log incorrect format cases
    return ''; 
  }

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}



 checkAndFetchBalanceLeave() {
  const empId = this.leaveEncashForm.get('fk_empid')?.value;
  const leaveId = this.leaveEncashForm.get('fk_leaveid')?.value;

  if (empId && leaveId) {
    this.Service.getBalanceLeave(empId, leaveId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.leaveEncashForm.patchValue({
            balleave: res.data.balleave // Or whatever field your API returns
          });
        } else {
          this.leaveEncashForm.patchValue({ balleave: '' });
          this.toastrService.warning('Balance leave not found.');
        }
      },
      error: (err) => {
        console.error('Error fetching balance leave:', err);
        this.toastrService.error('Failed to fetch balance leave.');
        this.leaveEncashForm.patchValue({ balleave: '' });
      }
    });
  }
}
  
calculateAmmount(): void {
  const payload ={
   
    "fk_empid": this.leaveEncashForm.get('fk_empid')?.value,
    "fk_monthid":Number(this.leaveEncashForm.get('fk_monthid')?.value),
    "fk_yearid": Number(this.leaveEncashForm.get('fk_yearid')?.value),

  }
  this.Service
    .calculateLeaveEncashmentAmount(payload)
    .subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = this.leaveEncashForm.get('totleaveencash')?.value;
          const amount = +(res.data * data).toFixed(2);
          this.leaveEncashForm.patchValue({
            //amount_N: res.data
            amount_N: amount
          });
        } else {

          
          this.leaveEncashForm.patchValue({ amount_N: '' });
          this.toastrService.error(res.message || 'Failed to calculate amount.', 'Error');
        }
      },
      error: (error) => {
        this.EmployeeList = [];

        this.toastrService.error('Failed to calculate', 'Error');
      },
    });
}


reset(){
  this.leaveEncashForm.reset();
}


 

    
  }
  

