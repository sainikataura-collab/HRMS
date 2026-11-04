import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { LeaveAssessmentService } from '../../payroll/services/leaveassessment.sevice';

@Component({
  selector: 'app-leave-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, RouterLink, CommonSearchComponent,FormsModule,NgxPaginationModule],
  templateUrl: './leave-assessment.component.html',
  styleUrls: ['./leave-assessment.component.scss']
})
export class LeaveAssessmentComponent implements OnInit {
  //Employee: { name: string, value: string }[] = []; 
//list variable
list: any[] = [];
 pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
  fk_empid!: string;
//end

  EmployeeList: { name: string; value: string }[] = [];
  searchText: string = '';
  Leave: { name: string, value: string }[] = []; 
  ngxUILoaderService = inject(NgxUiLoaderService);
  router = inject(Router);
  isDisabled: boolean = true;
  submitted=false;
  showError=false;
  leaveAssignment!: FormGroup;
  pk_leaveId!: string ;
  Isedit=false;
empcode:string=''
  showEmployeeLeaveList: boolean = false;

 pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;

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
     search: '',
    pageNo: 1,
    pageSizes: 100
  };

  constructor(
    private fb: FormBuilder,
    private Service: LeaveAssessmentService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.leaveAssignment = this.fb.group({
      empcode: [null, Validators.required],
      empname: [''], // Disabled input
      designation: [''],
      dept: [''],
      leavetype: [null, Validators.required],
      currentyearleaves: ['', Validators.required],
      totalleavesearned: ['', Validators.required],
      leaveavailed: [''],
      fk_empid:[null],
      fk_leaveid:[null],
      pk_assignid:[null]
    //  :[]
     
    });

    // this.getEmployeelist('Employee');
    this.getLeavelist('Leave');
  }

  // Fetch employee list for dropdown
  // getEmployeelist(fieldName: string) {
  //   this.ngxUILoaderService.start();
  //   this.Service.getEmployee(fieldName).subscribe({
  //     next: (res) => {
  //       if (res?.isSuccess && res.data?.length) {
  //         console.log(res.data)
  //         this.EmployeeList= res.data.map((Emp: any) => ({
  //           name: Emp.name,
  //           value: Emp.value
  //         }));
  //       } else {
  //         this.toastrService.error("Failed to load employee list.");
  //       }
  //       this.ngxUILoaderService.stop();
  //     },
  //     error: (err) => {
  //       console.error("Error fetching employee list:", err);
  //       this.toastrService.error("Error fetching employee list. Please try again.");
  //       this.ngxUILoaderService.stop();
  //     }
  //   });
  // }
  // Auto-fill fields when an employee is selected
  onEmpCodeChange(empCode: any) {
    
    if (empCode) {
      console.log(empCode);
      this.fk_empid = empCode.value; // Assign selected employee ID
       this.Service.getEmployeeDetails(empCode.value).subscribe(
        (res) => {
          console.log(res);
          this.leaveAssignment.patchValue({
            empname: res.data.empname,
            designation: res.data.designation,
            dept: res.data.dept
          });
  
          // Fetch leave details for the selected employee
          this.getleaveDetails(this.fk_empid);
        },
        (error) => {
          console.error('Error fetching employee details', error);
          this.toastrService.error('Failed to fetch employee details.');
        }
      );
    }
  }
  
    // Auto-fill fields when an employee is selected
    // onleaveChange(empCode: any) {
    //   if (empCode) {
    //     console.log(empCode);
    //     this.Service.getEmployeeDetails(empCode.value).subscribe(
    //       (res) => {
    //         console.log(res);
    //         this.leaveAssignment.patchValue({
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
    //   }
    // }
  // Fetch leave list
  getLeavelist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getLeave(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          res.data=res.data.slice(1);
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
//leave change
// Triggered when a leave type is selected

onLeaveTypeChange(leaveId: any) {
  const empCode = this.leaveAssignment.get('empcode')?.value; // Get selected Employee Code

  if (!empCode) {
    this.toastrService.warning('Please select an employee first.');
    return;
  }

  console.log(`Fetching leave details for Employee: ${empCode}, Leave ID: ${leaveId}`);

  this.Service.getLeaveDetails(leaveId.value,empCode).subscribe(
    (res) => {
      console.log('Leave Details:', res);
      
      if (res && res.data) {
        this.leaveAssignment.patchValue({
          currentyearleaves: res.data.maxperyear,
          totalleavesearned: res.data.totalleavesearned || '0', // Handle empty values
          leaveavailed: res.data.availperyear
    
        });
      } else {
        this.toastrService.warning('No leave details found.');
      }
    },
    (error) => {
      console.error('Error fetching leave details:', error);
      this.toastrService.error('Failed to fetch leave details.');
    }
  );
}
onSave() {
  if (this.leaveAssignment.invalid) {
      this.showError=true;
      return;
     }
     //convet to xml
   const formData = [{
      ...this.leaveAssignment.getRawValue(),
      pk_assignid: this.leaveAssignment.value.pk_assignid || "",
      fk_empid: this.leaveAssignment.value.empcode,
      fk_leaveid: parseFloat(this.leaveAssignment.value.leavetype) || 0.0
    }];

  // console.log('Submitting Data:', formData);
   if(this.Isedit){
    console.log('inside.edit')
     // **Update Existing Leave Assignment**
     const data = {...formData[0]};
       this.Service.update_leave(data).subscribe({
      next: (result) => {
        if (result.isSuccess) {
         
          // Switch to list view after saving
         this.showEmployeeLeaveList = true;
          // Refresh the leave list
          this.getleaveDetails(this.fk_empid);
          this.toastrService.success('Leave Assignment Updated Successfully.');
          this.leaveAssignment.reset();
          this.Isedit = false;
        
          
        } else {
          this.toastrService.error(result.message);
        }
      },
      error: (err) => {
        this.toastrService.error("An error occurred during update.");
      }
    });
    }
 else{
  this.Service.add_leave(formData).subscribe({
    next: (result) => {
      if (result.isSuccess) {
        this.toastrService.success('Leave Assignment Saved Successfully.');

     
        
        // Optionally, refresh the leave list after saving
       this.getleaveDetails(this.fk_empid);  
        
      } else {
        this.toastrService.error(result.message);
      }
    },
    error: (err) => {
      if (err.error && err.error.message.includes("duplicate")) {
        this.toastrService.error("Leave already exists.");
      } else {
        this.toastrService.error("An error occurred during form submission");
      } 
    },
  });
}
}
  // View leave assignment data
  onView() {
    console.log('Viewing leave assignment data:', this.leaveAssignment.value);
  }
  //for input validation
  //for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);

  if (charCode >= 48 && charCode <= 57) {
    return;
  }
  // if (charCode < 48 || charCode > 57) {
  //   event.preventDefault(); // Block non-numeric characters
  // }
    // Allow decimal point (.)
  if (event.key === '.') {
    return;
  }
    // Block everything else
  event.preventDefault();
}

//for filter
handleFilters(filters: any) {
  this.employeeFilters = filters;
  this.getEmployees(); // Refresh list with new filters
}

// getEmployees(): void {
//   this.Service
//     .get_Employees_Ddl(this.employeeFilters)
//     .subscribe({
//       next: (res) => {
//         if (res.isSuccess) {
         
//           this.EmployeeList = res.data.map((emp: any) => ({
//             name: emp.name,
//             value: emp.value,
//           }));
//         } else {
//           this.EmployeeList = [];

//           this.toastrService.error(res.message, 'Error');
//         }
//       },
//       error: (error) => {
//         this.EmployeeList = [];

//         this.toastrService.error('Failed to retrieve employees', 'Error');
//       },
//     });
// }

// start...

 getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.Service
      .get_Employees_Ddlfor100(this.employeeFilters)
      .subscribe({

        next: (res) => {


          if (res.isSuccess) {

            this.EmployeeList =
              res.data.map((emp: any) => ({

                name: emp.name,

                value: emp.value

              }));

            if (!this.currentSearch) {

              this.initialEmployeeList =
                [
                  ...this.EmployeeList
                ];

            }
          }

          this.loadingEmployees = false;

        },

        error: () => {

          this.loadingEmployees = false;

          this.EmployeeList = [];

        }

      });

  }
  // onEmployeeSearch(event: any) {

  //   const search =
  //     (event.term || '')
  //       .trim()
  //       .toLowerCase();

  //   clearTimeout(
  //     this.searchTimer
  //   );

  //   // blank
  //   if (!search) {

  //     this.EmployeeList =
  //       [
  //         ...this.initialEmployeeList
  //       ];

  //     return;

  //   }

  //   // local check
  //   const local =
  //     this.initialEmployeeList
  //       .filter(x =>

  //         x.name
  //           .toLowerCase()
  //           .includes(search)

  //       );

  //   if (local.length > 0) {

  //     this.EmployeeList =
  //       local;

  //     return;

  //   }

  //   // not found
  //   this.searchTimer =
  //     setTimeout(() => {
  //     this.currentSearch =search;
  //       this.pageNo = 1;
  //         this.getEmployees();

  //     }, 1000);

  // }



// added by pp end

//get leave details

 onEmployeeSearch(event: any) {

    const search =
      (event.term || '')
        .trim()
        .toLowerCase();

    clearTimeout(
      this.searchTimer
    );

    // blank
    if (!search) {
      this.EmployeeList =
        [
          ...this.initialEmployeeList
        ];

         this.loadingEmployees = false;
      return;

    }

    // local check
    const local =
      this.initialEmployeeList
        .filter(x =>

          x.name
            .toLowerCase()
            .includes(search)

        );

    if (local.length > 0) {

      this.EmployeeList =
        local;
      this.loadingEmployees = false;
      return;

    }

    // not found
      this.loadingEmployees = true;
    this.searchTimer =
      setTimeout(() => {
        this.currentSearch = search;
        this.pageNo = 1;
        this.getEmployees();

      }, 100);

  }


getleaveDetails(fk_empid: string): void {
  if (!fk_empid) {
    this.toastrService.warning("Please select an employee first.");
    return;
  }

  console.log('Fetching leave details for Employee ID:', fk_empid);

  this.Service.get_All_leave(fk_empid, this.pageIndex - 1, this.pageSize).subscribe(
    (res) => {
      if (res.isSuccess) {
        if (res.data && res.data.length > 0) {
          console.log('Data retrieved successfully:', res.data);
          this.list = res.data;
          this.showEmployeeLeaveList = true;
          this.totalItems = res.totalCount;
          console.log(this.totalItems, 'Total leave items retrieved');
        } else {
          console.warn('No records found.');
          this.toastrService.info("No record found.");
          this.list = []; // Clear previous data
          this.showEmployeeLeaveList = false; // Hide the leave list
        }
      } else {
        console.error('API response failed:', res.message);
        this.toastrService.error(res.message || "Failed to retrieve leave details.");
      }
    },
    (error) => {
      console.error("API error:", error);

      // Handle different error status codes
      if (error.status === 404) {
        this.toastrService.info("No record found.");
        this.list = [];
        this.showEmployeeLeaveList = false;
      } else if (error.status === 500) {
        this.toastrService.error("Server error. Please try again later.");
      } else {
        this.toastrService.error("Failed to retrieve leave details.");
      }
    }
  );
}




//   if (!fk_empid) {
//     this.toastrService.warning("Please select an employee first.");
//     return;
//   }

//   console.log('Fetching leave details for Employee ID:', fk_empid);

//   this.Service.get_All_leave(fk_empid, this.pageIndex - 1, this.pageSize).subscribe(
//     (res) => {
//       if (res.isSuccess) {
//         console.log('Data retrieved successfully:', res.data);
        
//         if (res.data && res.data.length > 0) {
//           this.list = res.data;
//           this.totalItems = res.totalCount;
//           this.showEmployeeLeaveList = true; // ✅ Show list only if data exists
//           console.log(this.totalItems, 'Total leave items retrieved');
//         } else {
//           // ✅ No records found case
//           this.list = [];
//           this.totalItems = 0;
//           this.showEmployeeLeaveList = false; // Hide table if no data
//           this.toastrService.info("No leave records found for this employee.");
//         }
//       } else {
//         console.error('Failed to retrieve data:', res.message);
//         this.toastrService.error(res.message);
//       }
//     },
//     (error) => {
//       console.error("Error fetching leave details:", error);
//       this.toastrService.error("Failed to retrieve leave details.");
//     }
//   );
// }

//delete list 
deleteleave(pk_assignid: string): void {
  if (confirm('Are you sure you want to delete this leave record?')) {
    this.Service.delete_leave(pk_assignid).subscribe({
      next: (response) => {
        console.log("API Response:", response);

        const success = response?.modelResponse?.isSuccess || response?.isSuccess;

        if (success) {
          this.toastrService.success(response?.modelResponse?.message || "Successfully deleted");

          // ✅ Remove deleted item from the list without refreshing the entire list
          this.list = this.list.filter(item => item.pk_assignid !== pk_assignid);
          this.totalItems -= 1; // Reduce the total count of items
        } else {
          this.toastrService.error(response?.modelResponse?.message || "Delete failed!");
        }
      },
      error: (error) => {
        console.error('Error deleting leave record:', error);
        this.toastrService.error('Failed to delete leave.');
      }
    });
  }
}

//patch the form value
patchform(pk_assignid: string) {
  this.Service.getById_leave(pk_assignid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched leave Data:", res.data);
        this.empcode=res.data.fk_empid
       // Ensure EmployeeList & Leave List are available before patching
       
        this.leaveAssignment.patchValue({
          pk_assignid:pk_assignid,
         empcode:res.data.fk_empid,  // Assign full object for dropdown
         empname: res.data.empname,
         designation: res.data.designation,
         dept: res.data.dept,
         leavetype:String(res.data.fk_leaveid), // Assign full object for dropdow
         currentyearleaves: res.data.currentyearleaves,
         previousyearleaves: res.data.totalleavesearned,
         leaveavailed: res.data.leaveavailed,
         totalleavesearned:res.data.totalleavesearned

         
        });
   
        //console.log("sd",this.leaveAssignment.get('empcode')?.value);
         this.onEmpCodeChange({value:this.leaveAssignment.get('empcode')?.value });
     

        this.Isedit = true;  // Set to edit mode
        
      } 
      else {
        this.toastrService.error("Failed to load leave details.");
      }
    },
    error: () => {
      this.toastrService.error("Error loading leave data.");
    }
  });
}




//update leave list
editLeaveAssignment(pk_assignid: string) {
  console.log("assing id in edit",pk_assignid)
  this.patchform(pk_assignid);  // Load the selected data into the form
  this.showEmployeeLeaveList = false; // Hide list and show form
}


}