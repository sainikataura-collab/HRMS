import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ReimdocStatusService } from '../../services/reimdoc-status.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-reimdoc-status',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './reimdoc-status.component.html',
  styleUrl: './reimdoc-status.component.scss'
})
export class ReimdocStatusComponent {
ReimDocForm!: FormGroup;
showError=false;
EmployeeList: { name: string; value: string }[] = [];
ReimType: { name: string; value: string }[] = [];
DocumentStatus = [
  { name: 'Undertaking', value: 'U' },
  { name: 'Submited', value: 'Y' },
  
];

searchText: string = '';
fk_empid!: string;
submitted=false;
Isedit=false;
ngxUILoaderService = inject(NgxUiLoaderService);
pk_docid: string ='';
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



  constructor(private fb: FormBuilder,private Service:ReimdocStatusService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
// Initializes the form and fetches necessary data on component load
  ngOnInit() {
   
    this.ReimDocForm = this.fb.group({
    fk_empid: ['' ,Validators.required],
    empname: [''], 
    designation: [''],
    dept: [''],
    fk_headid:['' ,Validators.required],
    docsub_status:['' ,Validators.required],
    submitdate:['' ,Validators.required],
    docsub_Amt:['' ,Validators.required],
    billdate:[''],
    billno:[''],
    remarks: [''],
    
     });
         this.getEmployeelist('Employee');
     this.getReimdocStatuslist('ReimTypeHead');

     //
     this.pk_docid = this.encryption.decryptText(this.route.snapshot.params['pk_docid']);
     if (this.pk_docid && this.pk_docid !== 'undefined') {
     this.patchform(this.pk_docid);
     this.Isedit = true; 
   }
     
  }
 // Fetches the employee list for the dropdown selection
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
 
// Fetches the reimbursement document types for the dropdown selection
getReimdocStatuslist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.Service.getReimType(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.ReimType= res.data.map((reim: any) => ({
          name: reim.name,
          value: reim.value
        }));
      } else {
        this.toastrService.error("Failed to load Reim.type  list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load Reim.type list:", err);
      this.toastrService.error("Error fetching load Reim.type list. Please try again.");
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
        this.ReimDocForm.patchValue({
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
// Fetches employees based on applied filters
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
// Updates the employeeFilters object and refreshes the employee list
handleFilters(filters: any) {
this.employeeFilters = filters;
this.getEmployees(); // Refresh list with new filters
}
// Prevents non-numeric input in number fields
 validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
// Submits the form, handling both insert and update operations
submit() {
    
  if (this.ReimDocForm.invalid) {
    this.submitted = true;
     return;
  }
  this.ngxUILoaderService.start(); // Start loader

  const formData = [{
    ...this.ReimDocForm.value,
    // companyId: sessionStorage.getItem('companyId'),
    // locId: sessionStorage.getItem('locationID'),
    // userId: sessionStorage.getItem('fk_UserID')
  }];
  if (this.pk_docid) {
    // **UPDATE existing**
    const updateData = {...this.ReimDocForm.value, pk_docid: this.pk_docid};

    this.Service.update_docStatus(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Reim. doc status  updated successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/reimdocStatus_list']);
        }
         else {
          this.toastrService.error(res.message || 'Failed to update Reim. doc status.');
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
    this.Service.add_Reimdoc_Status(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Reim. doc status  added successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/reimdocStatus_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add Reim. doc status.');
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



// Fetches document status details by ID and populates the form for editing
patchform(pk_docid: string) {
  this.Service.getById_docStatus(this.pk_docid).subscribe({
     next: (res) => {
       if (res.isSuccess && res.data) {
         console.log("Fetched doc status Data:", res.data);  // Debugging ke liye
         let formattedDate = this.formatDate(res.data.submitdate); // Convert date
         let formattedDate1 = this.formatDate(res.data.billdate); // Convert date


         this.ReimDocForm.patchValue({
          pk_docid:pk_docid,
          fk_empid: res.data.fk_empid,  // Employee ID
          empname: res.data.empname,    // Employee Name
          designation: res.data.designation,  // Employee Designation
          dept: res.data.dept,          // Employee Department
          fk_headid:String( res.data.fk_headid), 
          docsub_status: res.data.docsub_status,   
          submitdate:formattedDate, 
          docsub_Amt:res.data.docsub_Amt,
          billdate:formattedDate1,
          billno: res.data.billno,
          remarks:res.data.remarks
       
         });
   
         this.onEmpCodeChange({value:this.ReimDocForm.get('fk_empid')?.value });
     
         this.Isedit = true;
       } else {
         this.toastrService.error("Failed to load doc status details.");
         
       }
      },
     error: () => {
       this.toastrService.error("Error loading doc status data.");

 
     }
   });
 }

}
