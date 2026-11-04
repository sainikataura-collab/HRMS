import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { ExperienceDetailService } from '../../../payroll/services/experience-details.service';
import { EmployeeService } from '../../../payroll/services/employee.service';
import { EmployeeMasterService } from '../../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { EmployeeFactBoxComponent } from '../../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-experience-details',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonSearchComponent, RouterLink, CommonModule, NgxPaginationModule, EmployeeFactBoxComponent],
  templateUrl: './experience-details.component.html',
  styleUrl: './experience-details.component.scss'
})
export class ExperienceDetailsComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }
  currentStep: number = 7;
  fromSource: string = '';
  fk_empid: string = '';
  isEmp: boolean = false;
  empcode: string = '';
  empname: string = '';
  employeeDisplay: string = '';

  ExperienceDetailsForm!:FormGroup;

    //Employees
    //employees: { label: string, value: string }[]  = [];
    employees: { name: string, value: string }[] = [];

    experienceList: any[] = [];
    
    pk_jobid: number | null=null;
    pageIndex:number=1;
    pageSize:number=10;//Defoult item per page
    totalItems :number= 0;// Default page number

    showError=false;
    Isedit=false

    // filteredEmployees: { name: string, value: string }[] = []; // Filtered list

    searchText: string = '';

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
    private fb:FormBuilder,
    private experienceDetailService:ExperienceDetailService,
    private toasteservice:ToastrService,
    private employeeService: EmployeeService,
    private employeeMasterService: EmployeeMasterService,
    private toastrService:ToastrService,
    private route:ActivatedRoute,
    private router:Router,
    private encryptionSercvice:EncryptionService
  
 
  ){}

  ngOnInit():void{
  this.ExperienceDetailsForm=this.fb.group({
    pk_pjobid: [null],
    fk_empid: [null, Validators.required,],
    department: [''],
    designation: [''],
    compname:['', Validators.required,],
    fromdate:['', Validators.required,],
    todate:['', Validators.required,],
    ctc:[null,Validators.required,],
    profile:[null],
    status: [''],
    leavingreason:[null],
    documentupload: [null], 
  });

  this.getEmployees();

  this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';
  this.isEmp = this.route.snapshot.queryParamMap.get('isEmp') === 'true';

  this.route.paramMap.subscribe(params => {
    const rawParam = params.get('pk_pjobid');
    if (rawParam) {
      let decrypted = '';
      try {
        decrypted = this.encryptionSercvice.decryptText(rawParam).toString();
      } catch (e) {
        decrypted = rawParam;
      }

      if (this.isEmp) {
        this.fk_empid = decrypted;
        this.pk_jobid = null;
        this.Isedit = false;
        this.ExperienceDetailsForm.patchValue({ fk_empid: this.fk_empid });
        this.loadEmployeeDetails(this.fk_empid);
        this.onEmployeeSelect(this.fk_empid);
      } else if (decrypted && !isNaN(Number(decrypted)) && Number(decrypted) > 0) {
        this.pk_jobid = Number(decrypted);
        this.getExperienceDetailsByid(this.pk_jobid);
        this.Isedit = true;
      }
    }
  });

}

loadEmployeeDetails(empid: string): void {
  if (!empid) return;
  this.employeeMasterService.getById_employee(empid).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data?.employeeMst) {
        this.empcode = res.data.employeeMst.empcode || '';
        this.empname = res.data.employeeMst.empname || '';
        this.employeeDisplay = `${this.empcode} - ${this.empname}`;
      }
    },
    error: (err) => console.error('Error fetching employee details:', err)
  });
}

existingFileName: string = '';
fileDownloadUrl: string = '';

isUpdate(pk_jobid: number) {
  console.log("Update method called with ID:", pk_jobid);
  this.pk_jobid = pk_jobid;
 
   this.getExperienceDetailsByid(this.pk_jobid);
   this.Isedit = true;
}




downloadFile(fileName: string): void {

  if (!fileName) {
    return;
  }

  this.employeeService.getImage(fileName).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;

      document.body.appendChild(a);
      a.click();

      // document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },

    error: (err) => {
      console.error('File download error:', err);
      this.toastrService.error('Unable to download file');
    }
  });
}

  getExperienceDetailsByid(pk_jobid: number) {
    this.experienceDetailService.getExperienceById(pk_jobid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log(res.data);
          if (res.data.fk_empid) {
            this.fk_empid = res.data.fk_empid.toString();
            this.employeeMasterService.getById_employee(this.fk_empid).subscribe({
              next: (empRes) => {
                if (empRes.isSuccess && empRes.data?.employeeMst) {
                  const empCode = empRes.data.employeeMst.empcode || '';
                  const empName = empRes.data.employeeMst.empname || '';
                  const empOption = {
                    name: `${empCode} - ${empName}`,
                    value: this.fk_empid
                  };
                  if (!this.employees.some(e => e.value === empOption.value)) {
                    this.employees = [empOption, ...this.employees];
                    this.initialEmployeeList = [empOption, ...this.initialEmployeeList];
                  }
                  this.empcode = empCode;
                  this.empname = empName;
                  this.employeeDisplay = `${empCode} - ${empName}`;
                  this.ExperienceDetailsForm.patchValue({ fk_empid: this.fk_empid });
                }
              }
            });
          }
          // Convert date strings to "YYYY-MM-DD"
          const fromdate = this.formatDate(res.data.fromdate);
          const todate = this.formatDate(res.data.todate);
          this.ExperienceDetailsForm.patchValue({
            pk_pjobid: res.data.pk_pjobid,
            fk_empid: res.data.fk_empid,
            compname: res.data.compname,
            designation: res.data.designation,
            department: res.data.department,
            fromdate: fromdate,
            todate: todate,
            ctc: res.data.ctc,
            profile: res.data.profile,
            leavingreason: res.data.leavingreason
          });
          // Save file name separately to display as link
          this.existingFileName = res.data.documentupload;
          this.Isedit = true;
          this.onEmployeeSelect(this.fk_empid);

        } else {
          this.toastrService.error("Failed to load Experience details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading Experience data.");
      }
    });
  }


  formatDate(dateString: string): string {
    const [ day,month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }


// Handle filter updates from common search
handleFilters(filters: any) {
  this.employeeFilters = filters;
  this. getEmployees();
}

  // Get Employee List based on filters
  // getEmployees(): void {
  //   this.experienceDetailService.getEmpList(this.employeeFilters).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         // this.employeeList = res.data;
  //         this.employees= res.data.map((emplyeedata: any) => ({
  //           name: emplyeedata.name,
  //           value: emplyeedata.value
  //         }));
          
  //       } else {
  //         this.employees = [];
  //         this.toastrService.error(res.message, 'Error');
  //       }
  //     },
  //     error: (error) => {
  //       this.employees = [];
      
  //       this.toastrService.error('Failed to retrieve employees', 'Error');
  //     }
  //   });
  // }

  getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.experienceDetailService
      .getEmpList(this.employeeFilters)
      .subscribe({

        next: (res) => {


          if (res.isSuccess) {

            this.employees =
              res.data.map((emp: any) => ({

                name: emp.name,

                value: emp.value

              }));

            if (!this.currentSearch) {
              this.initialEmployeeList =
                [
                  ...this.employees
                ];
            }

            if (this.isEmp && this.fk_empid && !this.employeeDisplay) {
              const found = this.employees.find(e => e.value === this.fk_empid);
              if (found) {
                this.employeeDisplay = found.name;
                const parts = found.name.split(' - ');
                if (parts.length > 1) {
                  this.empcode = this.empcode || parts[0];
                  this.empname = this.empname || parts[1];
                }
              }
            }
          }

          this.loadingEmployees = false;

        },

        error: () => {

          this.loadingEmployees = false;

          this.employees = [];

        }

      });

  }
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
      this.employees =
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

      this.employees =
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

  submitForm(): void {
    if (this.ExperienceDetailsForm.invalid) {
      this.showError = true;
      return;
    }
    debugger;
  
    const formData = new FormData();
    Object.keys(this.ExperienceDetailsForm.value).forEach(key => {
      const value = this.ExperienceDetailsForm.value[key];
      if (value != null) {
        formData.append(key, value.toString());
      }
    });
    const fileInput = this.ExperienceDetailsForm.get('documentupload')?.value;
    // if (fileInput instanceof File) {
    //   formData.append('documentupload', fileInput);
    // } 
      if (fileInput instanceof File) {
    formData.append('UploadFile', fileInput, fileInput.name);
  }

    else if (fileInput) {
      // If the file input is not a File object, handle it accordingly.
      console.warn('The file input is not a valid File object.');
    }
    
    if (this.isEmp && this.fk_empid) {
      formData.set('fk_empid', this.fk_empid);
    }

    const selectedEmployee = this.ExperienceDetailsForm.get('fk_empid')?.value || this.fk_empid;
  
    // ✅ Check if pk_jobid exists (Update) or not (Insert)

      if (this.Isedit && this.pk_jobid) {
        formData.append('pk_empqualid', this.pk_jobid.toString());
        
      this.experienceDetailService.update_ExperienceDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'ExperienceDetails updated successfully!');
            if (this.pk_jobid) {
              this.getExperienceDetailsByid(this.pk_jobid);
            }
            if (this.fk_empid) {
              this.onEmployeeSelect(this.fk_empid);
            }
            if (this.factBox) {
              this.factBox.refresh();
            }
          } else {
            this.toastrService.error(res.message || 'Failed to update ExperienceDetails.');
          }
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
        }
      });
  
    } else {
      this.experienceDetailService.add_ExperienceDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            if (this.isEmp && this.fk_empid) {
              this.onEmployeeSelect(this.fk_empid);
              this.ExperienceDetailsForm.reset();
              this.ExperienceDetailsForm.patchValue({ fk_empid: this.fk_empid });
              if (this.factBox) {
                this.factBox.refresh();
              }
            } else {
              this.onBack();
            }
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: (err) => {
          console.error('Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
        }
      });
    }
  }

// //Get EMployee list based on Selectded E
  onEmployeeSelect(employeeCode: string): void {

    const selectedEmployee = this.ExperienceDetailsForm.get('fk_empid')?.value || this.fk_empid;
    if (!selectedEmployee) {
      if (!this.isEmp) {
        this.toastrService.error('Please select an employee', 'Error');
      }
      return;
    }
    this.fk_empid = selectedEmployee.toString();
    this.experienceDetailService.getExperienceListBasedOnSelectedEmployee(selectedEmployee,this.pageIndex-1,this.pageSize).subscribe(res => {
      if (res.isSuccess) {
          console.log('Data retrieved successfully:', res.data);
          this.experienceList = res.data;
          this.totalItems = res.totalCount;
          console.log(this.totalItems, 'this is total items retrieved');
      } 
      else {
          console.log('No experience data found:', res.message);
          this.experienceList = [];
          this.totalItems = 0;
          if (!this.isEmp && res.message && !res.message.toLowerCase().includes('no record')) {
              this.toastrService.info(res.message);
          }
      }
   } );
  }


  deleteExperienceDetails(pk_jobid: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.experienceDetailService.delete_experience(pk_jobid).subscribe(
        (response: any) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message);
            this.onEmployeeSelect(this.ExperienceDetailsForm.get('fk_empid')?.value); 
            // Refresh the list after deletion
            this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_List']);

          } else {
            this.toastrService.error(response.message);
          }
        },
        (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('An error occurred while deleting the record', 'Error');
        }
      );
    }
}

onPageChange(event: number): void {
  this.pageIndex = event;
  const selectedEmployee = this.ExperienceDetailsForm.get('fk_empid')?.value;
  if (selectedEmployee) {
    this.onEmployeeSelect(selectedEmployee);
  }
}

onFileSelect(event: any): void {
const file = event.target.files[0];
if (file) {
  this.ExperienceDetailsForm.patchValue({ documentupload: file });
}


}




//conver date in string 
// formatDate(dateString: string): string {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return '';
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }
















// 📅 Utility function to convert date strings to Date objects









  





 
  
  
//
//   submitForm(): void {
//     if (this.ExperienceDetailsForm.invalid) {
//      // this.toastrService.error('Please fill all required fields.');
//       this.showError = true;
//       return;
//     }
//     debugger

//     const formData = {
//       ...this.ExperienceDetailsForm.value,
//       companyId: sessionStorage.getItem('companyId'),
//       locId: sessionStorage.getItem('locationID'),
//       userId: sessionStorage.getItem('fk_UserID')
//     };
//     const selectedEmployee = this.ExperienceDetailsForm.get('fk_empid')?.value;
   

//     // ✅ **Check if designationId exists (Update) or not (Insert)**
//     if (this.pk_jobid){
//       // **UPDATE existing designation**
//       const updateData = { ...formData,pk_jobid: this.pk_jobid };

//       this.experienceDetailService.update_ExperienceDetails(updateData).subscribe({
//         next: (res) => {
//           if (res.isSuccess) {
//             this.toastrService.success(res.message || 'Designation updated successfully!');
//             this.onEmployeeSelect(selectedEmployee);
//             // this.router.navigate(['/dash/payroll/payrolldashboard/DesignationList']);

//           } else {
//             this.toastrService.error(res.message || 'Failed to update designation.');
//           }
//         },
//         error: (err) => {
//           console.error('Update API Error:', err);
//           this.toastrService.error('Something went wrong while updating!');
//         }
//       });

//     } else {
//       // **INSERT**
//       this.experienceDetailService.add_ExperienceDetails(formData).subscribe({
        
//         next: (res) => {
//           if (res.isSuccess) {
//             this.toastrService.success(res.message );
//             this.onEmployeeSelect(selectedEmployee);
//           } else {
//             this.toastrService.error(res.message);
//           }
//         },
//         error: (err) => {
//           console.error('Insert API Error:', err);
//           this.toastrService.error('Something went wrong while adding!');
//         }
//       });
//     }
// }

resetForm(): void {
  this.ExperienceDetailsForm.reset();
  if (this.isEmp && this.fk_empid) {
    this.ExperienceDetailsForm.patchValue({ fk_empid: this.fk_empid });
  }
}

goToEmployeeMst(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToAttendance(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToOtherDetails(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goTohead(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToDemographic(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToQualification(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionSercvice.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToExperience(): void {
  // Already on Experience details
}

onBack(): void {
  if (this.fromSource === 'experience_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_list']);
  } else if (this.fromSource === 'qualification_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst_list']);
  } else if (this.fromSource === 'demographic_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails_list']);
  } else {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list']);
  }
}

}