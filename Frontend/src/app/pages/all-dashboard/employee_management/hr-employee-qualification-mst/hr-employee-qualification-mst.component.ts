import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

import { ToastrService } from 'ngx-toastr';

import { QualificationDetailService } from '../../payroll/services/employeeQualification.service';
import { EmployeeService } from '../../payroll/services/employee.service';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { EmployeeFactBoxComponent } from '../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-hr-employee-qualification-mst',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonSearchComponent, RouterLink, CommonModule, NgxPaginationModule, EmployeeFactBoxComponent],

  templateUrl: './hr-employee-qualification-mst.component.html',
  styleUrl: './hr-employee-qualification-mst.component.scss'
})
export class HREmployeeQualificationMstComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }
  currentStep: number = 6;
  fromSource: string = '';
  fk_empid: string = '';
  isEmp: boolean = false;
  empcode: string = '';
  empname: string = '';
  employeeDisplay: string = '';

  employees: { name: string, value: string }[] = [];
  qualificationDetailsList: any[] = [];
  showError=false;
  Isedit=false
  pk_empqualid: number = 0;
  
  existingFileName: string = '';
  pageIndex:number=1;
  pageSize:number=10;//Defoult item per page
  totalItems :number= 0;// Default page number
  
  QualificationForm!:FormGroup;

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
    private toasteservice:ToastrService,
    private qualificationService:QualificationDetailService,
    private employeeService: EmployeeService,
    private employeeMasterService: EmployeeMasterService,
    private encryptionService: EncryptionService,
    private toastrService:ToastrService,
    private route:ActivatedRoute,
    private router:Router
  
 
  ){}


   ngOnInit():void{
    this.QualificationForm=this.fb.group({
      pk_empqualid: [null],
      fk_qualiId: [null],
      fk_subjectid: [null],
      fk_insid: [null],
      fk_empid: [null, Validators.required,],
      qualification: ['', Validators.required,],
      subject:['', Validators.required,],
      institute:['', Validators.required,],
      passyear:['', Validators.required,],
      marks:[null,Validators.required,],
      division:[null, Validators.required,],
      documentupload: [null], 
    });
 
    this.getEmployees();
    
    this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';
    this.isEmp = this.route.snapshot.queryParamMap.get('isEmp') === 'true';

    this.route.paramMap.subscribe(params => {
      const rawParam = params.get('pk_empqualid');
      if (rawParam) {
        let decrypted = '';
        try {
          decrypted = this.encryptionService.decryptText(rawParam).toString();
        } catch (e) {
          decrypted = rawParam;
        }

        if (this.isEmp) {
          this.fk_empid = decrypted;
          this.pk_empqualid = 0;
          this.Isedit = false;
          this.QualificationForm.patchValue({ fk_empid: this.fk_empid });
          this.loadEmployeeDetails(this.fk_empid);
          this.onEmployeeSelect(this.fk_empid);
        } else if (decrypted && !isNaN(Number(decrypted)) && Number(decrypted) > 0) {
          this.pk_empqualid = Number(decrypted);
          this.getQualificationDetailsByid(this.pk_empqualid);
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

isUpdate(pk_empqualid: number) {
   
  this.pk_empqualid = pk_empqualid;  // Store the ID
  this.getQualificationDetailsByid(this.pk_empqualid); 
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

getQualificationDetailsByid(pk_empqualid: number) {
  this.qualificationService.getQualificationById(pk_empqualid).subscribe({
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
                this.QualificationForm.patchValue({ fk_empid: this.fk_empid });
              }
            }
          });
        }
        this.QualificationForm.patchValue({
          pk_empqualid: res.data.pk_empqualid,
          fk_empid: res.data.fk_empid,
          qualification: res.data.qualification,
          subject: res.data.subject,
          institute: res.data.institute,
          passyear: res.data.passyear,
          marks: res.data.marks,
          division: res.data.division,
        });
        this.existingFileName = res.data.documentupload;
        this.Isedit = true;
        this.onEmployeeSelect(this.fk_empid);

      } else {
        this.toastrService.error("Failed to load Qualification details.");
      }
    },
    error: () => {
      this.toastrService.error("Error loading Qualification data.");
    }
  });

}

// getEmployees(): void {
//   this.qualificationService.getEmpList(this.employeeFilters).subscribe({
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



// Handle filter updates from common search

 getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.qualificationService
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
handleFilters(filters: any) {
  this.employeeFilters = filters;
  this. getEmployees();
}


// use for reset form
resetForm(): void {
  this.QualificationForm.reset();
  if (this.isEmp && this.fk_empid) {
    this.QualificationForm.patchValue({ fk_empid: this.fk_empid });
  }
}

// call when show list after setecl employee
onFileSelect(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.QualificationForm.patchValue({ documentupload: file });
  }
}

// //Get EMployee list based on Selectded E
onEmployeeSelect(employeeCode: string): void {

  const selectedEmployee = this.QualificationForm.get('fk_empid')?.value || this.fk_empid;
  if (!selectedEmployee) {
    if (!this.isEmp) {
      this.toastrService.error('Please select an employee', 'Error');
    }
    return;
  }
  this.fk_empid = selectedEmployee.toString();
  this.qualificationService.getQualificationListBasedOnSelectedEmployee(selectedEmployee,this.pageIndex-1,this.pageSize).subscribe(res => {
    if (res.isSuccess) {
        console.log('Data retrieved successfully:', res.data);
        this.qualificationDetailsList = res.data;
        this.totalItems = res.totalCount;
        console.log(this.totalItems, 'this is total items retrieved');
    } 
    else {
        console.log('No qualification data:', res.message);
        this.qualificationDetailsList = [];
        this.totalItems = 0;
        if (!this.isEmp && res.message && !res.message.toLowerCase().includes('no record')) {
            this.toastrService.info(res.message);
        }
    }
 } );
}

// submitForm(): void {

//   if (this.QualificationForm.invalid) {
//     this.showError = true;
//     return;
//   }

//   const formData = new FormData();

//   // Append form fields to FormData
//   Object.keys(this.QualificationForm.value).forEach(key => {
//     const value = this.QualificationForm.value[key];
//     if (value != null) {
//       formData.append(key, value.toString());
//     }
//   });

//   // Append additional data from session storage
//   formData.append('companyId', sessionStorage.getItem('companyId') || '');
//   formData.append('locId', sessionStorage.getItem('locationID') || '');
//   formData.append('userId', sessionStorage.getItem('fk_UserID') || '');

//   // Append the selected file (if any)
//   const fileInput = this.QualificationForm.get('documentupload')?.value;
//   if (fileInput instanceof File) {
//     formData.append('documentupload', fileInput);
//   } else if (fileInput && fileInput.length > 0) {
//     const file = fileInput[0]; // Get the first file from FileList
//     formData.append('documentupload', file);
//   } else {
//     console.warn('No valid file selected.');
//   }

//   const selectedEmployee = this.QualificationForm.get('fk_empid')?.value;

//   // Check if updating or inserting
//   if (this.pk_empqualid != null && this.pk_empqualid !== undefined) {
//     formData.append('pk_empqualid', this.pk_empqualid.toString());

//     this.qualificationService.update_QualificationDetails(formData).subscribe({
//       next: (res) => {
       
//         if (res.isSuccess) {
//           this.toastrService.success(res.message,);
//           this.router.navigate(['/dash/payroll/payrolldashboard/HR_EmployeeQualification_List']);

//           //this.onEmployeeSelect(selectedEmployee);
         

//           // this.getQualificationDetailsByid(this.pk_empqualid); 
//         } else {
//           this.toastrService.error(res.message);
//         }
//       },
//       error: (err) => {
//         console.error('Update API Error:', err);
//         this.toastrService.error('Something went wrong while updating!', 'Error');
//       }
//     });

//   } else {
//     this.qualificationService.add_ExperienceDetails(formData).subscribe({
//       next: (res) => {
//         console.log('Insert Response:', res);
//         if (res.isSuccess) {
//           this.toastrService.success(res.message, 'Addition Successful');
//           this.router.navigate(['/dash/payroll/payrolldashboard/HR_EmployeeQualification_List']);

//           // this.onEmployeeSelect(selectedEmployee);
//           // this.QualificationForm.reset();

//         } else {
//           this.toastrService.error(res.message, 'Addition Failed');
//         }
//       },
//       error: (err) => {
//         console.error('Insert API Error:', err);
//         this.toastrService.error('Something went wrong while adding!', 'Error');
//       }
//     });
//   }
// }




submitForm(): void {
  if (this.QualificationForm.invalid) {
    this.showError = true;
    return;
  }

  const formData = new FormData();

  // Append form fields to FormData
  Object.keys(this.QualificationForm.value).forEach(key => {
    const value = this.QualificationForm.value[key];
    if (value != null) {
      formData.append(key, value.toString());
    }
  });

  // Get the file input value
  const fileInput = this.QualificationForm.get('documentupload')?.value;

  if (fileInput instanceof File) {
    //  If a new file is selected, append it
    formData.append('UploadFile', fileInput);
  } else if (fileInput && fileInput.length > 0) {
    //  Handle FileList (if file is selected via file input)
    const file = fileInput[0];
    formData.append('UploadFile', file);
  } else {
    //  If no new file is selected, keep the existing file name
    const existingFileName = this.QualificationForm.get('existingFile')?.value || '';
    if (existingFileName) {
      formData.append('documentupload', existingFileName);
    }
  }

  if (this.isEmp && this.fk_empid) {
    formData.set('fk_empid', this.fk_empid);
  }

  const selectedEmployee = this.QualificationForm.get('fk_empid')?.value || this.fk_empid;

  //  Check if updating or inserting
  if (this.pk_empqualid != null && this.pk_empqualid !== undefined && this.pk_empqualid != 0) {
    formData.append('pk_empqualid', this.pk_empqualid.toString());

    this.qualificationService.update_QualificationDetails(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message);
          if (this.pk_empqualid) {
            this.getQualificationDetailsByid(this.pk_empqualid);
          }
          if (this.fk_empid) {
            this.onEmployeeSelect(this.fk_empid);
          }
          if (this.factBox) {
            this.factBox.refresh();
          }
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!', 'Error');
      }
    });

  } else {
    this.qualificationService.add_ExperienceDetails(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message, 'Addition Successful');
          if (this.isEmp && this.fk_empid) {
            this.onEmployeeSelect(this.fk_empid);
            this.QualificationForm.reset();
            this.QualificationForm.patchValue({ fk_empid: this.fk_empid });
            if (this.factBox) {
              this.factBox.refresh();
            }
          } else {
            this.onBack();
          }
        } else {
          this.toastrService.error(res.message, 'Addition Failed');
        }
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!', 'Error');
      }
    });
  }
}



deleteExperienceDetails(pk_jobid: string): void {
  if (confirm('Are you sure you want to delete this record?')) {
    this.qualificationService.delete_QualificationDetails(pk_jobid).subscribe(
      (response: any) => {
        if (response.isSuccess) {
          this.toastrService.success(response.message || 'Record deleted successfully');
          this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_List']);

          // this.onEmployeeSelect(this.QualificationForm.get('fk_empid')?.value); // Refresh the list after deletion
        } else {
          this.toastrService.error(response.message || 'Failed to delete record', 'Error');
        }
      },
      (error) => {
        console.error('Error deleting record:', error);
        this.toastrService.error('An error occurred while deleting the record', 'Error');
      }
    );
  }
}

goToEmployeeMst(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToAttendance(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToOtherDetails(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goTohead(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToDemographic(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

goToQualification(): void {
  // Already on Qualification details
}

goToExperience(): void {
  if (this.fk_empid) {
    const encryptedId = this.encryptionService.encryptText(this.fk_empid).toString();
    this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
      queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
    });
  } else {
    this.toastrService.warning('Please select an employee first');
  }
}

onBack(): void {
  if (this.fromSource === 'qualification_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst_list']);
  } else if (this.fromSource === 'demographic_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails_list']);
  } else if (this.fromSource === 'experience_list') {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_list']);
  } else {
    this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list']);
  }
}

}
