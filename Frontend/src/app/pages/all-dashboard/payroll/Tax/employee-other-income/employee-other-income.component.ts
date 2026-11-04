import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmployeeOtherIncomeService } from '../../services/employee-other-income.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-employee-other-income',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './employee-other-income.component.html',
  styleUrl: './employee-other-income.component.scss'
})
export class EmployeeOtherIncomeComponent {
IncomeForm!: FormGroup;
showError=false;
EmployeeList: { name: string; value: string }[] = [];

searchText: string = '';
fk_empid!: string;
submitted=false;
Isedit=false;
ngxUILoaderService = inject(NgxUiLoaderService);
pk_incomeid: string ='';
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



  constructor(private fb: FormBuilder,private Service:EmployeeOtherIncomeService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
   
    this.IncomeForm = this.fb.group({
    fk_empid: ['' ,Validators.required],
    empname: [''], 
    designation: [''],
    dept: [''],
    dated:['' ,Validators.required],
    houseproperty: [''], 
    interest: [''],  
    anyotherincome: [''],
    anyloss: [''],
     });
     this.getEmployeelist('Employee');
    

     //
     this.pk_incomeid = this.encryption.decryptText(this.route.snapshot.params['pk_incomeid']);
     if (this.pk_incomeid && this.pk_incomeid !== 'undefined') {
     this.Patchform(this.pk_incomeid);
     this.Isedit = true; 
   }
     
  }
 
  
  submit() {
    
    if (this.IncomeForm.invalid) {
      this.submitted = true;
       return;
    }
    this.ngxUILoaderService.start(); // Start loader

    const formData = {
      ...this.IncomeForm.value,
      // companyId: sessionStorage.getItem('companyId'),
      // locId: sessionStorage.getItem('locationID'),
      // userId: sessionStorage.getItem('fk_UserID')
    };
    if (this.pk_incomeid) {
      // **UPDATE existing **
      const updateData = { ...formData,pk_incomeid: this.pk_incomeid};
  
      this.Service.update_Income(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Detailed updated successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/employeeOtherIncome_list']);
          }
           else {
            this.toastrService.error(res.message || 'Failed to update details.');
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
      // **INSERT new **
      this.Service.add_Income(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Detail added successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/employeeOtherIncome_list']);
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
onEmpCodeChange(empCode: any) {
    
  if (empCode) {
    console.log(empCode);
    this.fk_empid = empCode.value; // Assign selected employee ID
     this.Service.getEmployeeDetails(empCode.value).subscribe(
      (res) => {
        console.log(res);
        this.IncomeForm.patchValue({
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

  //for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//for the date formate
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



//get by id and patch the value
Patchform(pk_incomeid: string) {
  this.Service.getById_Income(this.pk_incomeid).subscribe({
     next: (res) => {
       if (res.isSuccess && res.data) {
         console.log("Fetched perquisite Assignment Data:", res.data);  // Debugging ke liye
         let formattedDate = this.formatDate(res.data.dated); // Convert date

         this.IncomeForm.patchValue({
          fk_empid: res.data.fk_empid,  // Employee ID
          empname: res.data.empname,    // Employee Name
          designation: res.data.designation,  // Employee Designation
          dept: res.data.dept,          // Employee Department
          houseproperty: res.data.houseproperty, // Perquisite ID
          interest: res.data.interest,   // Total Value
          anyotherincome: res.data.anyotherincome, // Amount Received
          anyloss: res.data.anyloss, // Taxable Amount
          dated: formattedDate,  // ✅ Ensure proper format

         
           
         });
         
         this.onEmpCodeChange({value:this.IncomeForm.get('fk_empid')?.value });
     
         this.Isedit = true;
       } else {
         this.toastrService.error("Failed to load perquistion assignment details.");
         
       }
      },
     error: () => {
       this.toastrService.error("Error loading perquistion assignment data.");

 
     }
   });
 }



}
