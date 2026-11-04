import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PerquisiteAssignmentService } from '../../services/perquisite-assignment.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-assign-perquisite',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './assign-perquisite.component.html',
  styleUrl: './assign-perquisite.component.scss'
})
export class AssignPerquisiteComponent {

PerquisiteAssignForm!: FormGroup;
showError=false;
EmployeeList: { name: string; value: string }[] = [];
PerquisiteList: { name: string; value: string }[] = [];
searchText: string = '';
fk_empid!: string;
submitted=false;
id!:number;
Isedit=false;
ngxUILoaderService = inject(NgxUiLoaderService);
pk_perktrnId: string ='';
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



  constructor(private fb: FormBuilder,private Service:PerquisiteAssignmentService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
   
    this.PerquisiteAssignForm = this.fb.group({
    fk_empid: ['' ,Validators.required],
    empname: [''], 
    designation: [''],
    dept: [''],
    fk_perkId:['' ,Validators.required],
    totvalue: ['',Validators.required], 
    amtreceived: [''],  
    taxableamt: [''],
    trndate: ['',Validators.required],
     });
     this.getEmployeelist('Employee');
     this.getPerquisitelist('Perquisite');

     //
     this.pk_perktrnId = this.encryption.decryptText(this.route.snapshot.params['pk_perktrnId']);
     if (this.pk_perktrnId && this.pk_perktrnId !== 'undefined') {
     this.getPerquisiteDetailsByid(this.pk_perktrnId);
     this.Isedit = true; 

      // ✅ Disable fields in edit mode
    this.PerquisiteAssignForm.get('fk_empid')?.disable();
    this.PerquisiteAssignForm.get('empname')?.disable();
    this.PerquisiteAssignForm.get('designation')?.disable();
    this.PerquisiteAssignForm.get('dept')?.disable();
   }
     
  }
 
  
  submit() {
    
    if (this.PerquisiteAssignForm.invalid) {
      this.submitted = true;
       return;
    }
    this.ngxUILoaderService.start(); // Start loader

    const formData = {
      ...this.PerquisiteAssignForm.getRawValue(),
      // companyId: sessionStorage.getItem('companyId'),
      // locId: sessionStorage.getItem('locationID'),
      // userId: sessionStorage.getItem('fk_UserID')
    };
    if (this.pk_perktrnId) {
      // *UPDATE existing perquisite*
      const updateData = { ...formData, pk_perktrnId: this.pk_perktrnId};
  
      this.Service.update_perquisite(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'perquisite assignment updated successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/assignPerquisite_list']);
          }
           else {
            this.toastrService.error(res.message || 'Failed to update perquisite assignment.');
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
      // *INSERT new designation*
      this.Service.add_perquisite(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'perquisite added successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/assignPerquisite_list']);
          } else {
            this.toastrService.error(res.message || 'Failed to add section.');
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
        this.PerquisiteAssignForm.patchValue({
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
 //get perquisite
 getPerquisitelist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.Service.getPerquisite(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.PerquisiteList= res.data.map((per: any) => ({
          name: per.name,
          value: per.value
        }));
        console.log(this.PerquisiteList);
      } else {
        this.toastrService.error("Failed to load perquisite list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching employee list:", err);
      this.toastrService.error("Error fetching perquisite list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
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
getPerquisiteDetailsByid(pk_perktrnId: string) {
  this.Service.getById_perquisite(this.pk_perktrnId).subscribe({
     next: (res) => {
       if (res.isSuccess && res.data) {
         console.log("Fetched perquisite Assignment Data:", res.data);  // Debugging ke liye
         let formattedDate = this.formatDate(res.data.trndate); // Convert date

         this.PerquisiteAssignForm.patchValue({
          fk_empid: res.data.fk_empid,  // Employee ID
          empname: res.data.empname,    // Employee Name
          designation: res.data.designation,  // Employee Designation
          dept: res.data.dept,          // Employee Department
          fk_perkId: res.data.fk_perkId, // Perquisite ID
          totvalue: res.data.totvalue,   // Total Value
          amtreceived: res.data.amtreceived, // Amount Received
          taxableamt: res.data.taxableamt, // Taxable Amount
          trndate: formattedDate,  // ✅ Ensure proper format
           
         });
         
         this.onEmpCodeChange({value:this.PerquisiteAssignForm.get('fk_empid')?.value });
     
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