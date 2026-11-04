import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { EmployeeKRAPLIService } from '../../HRservices/employee-krapli.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-employee-krapli',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule,CommonSearchComponent],
  templateUrl: './employee-krapli.component.html',
  styleUrl: './employee-krapli.component.scss'
})
export class EmployeeKRAPLIComponent {
  EmployeeForm!: FormGroup;
  EmployeeList: { name: string; value: string }[] = [];
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
  list: any[] = [];
  searchText: string = '';
   constructor(private fb: FormBuilder,private Service:EmployeeKRAPLIService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
   

   ngOnInit() {
    this.EmployeeForm = this.fb.group({
      employees: this.fb.array([]),
         
      
    });

   

  } 
  get employeesFormArray(): FormArray {
    return this.EmployeeForm.get('employees') as FormArray;
  }
  
  createEmployeeGroup(emp: any): FormGroup {
    return this.fb.group({
      fk_empid:[emp.pk_empid],
      empcode: [emp.empcode],
      empname: [emp.empname],
      depart: [emp.depart],
      isKRA: [emp.isKRA],
      kra: [emp.kra],
      pli: [emp.pli],
    });
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
    this.getFilteredList();  
    }
  filteredData() {
  if (!this.searchText?.trim()) {
    return this.employeesFormArray.controls as FormGroup[];
  }

  const searchTextLower = this.searchText.toLowerCase();
  return (this.employeesFormArray.controls as FormGroup[]).filter((group: FormGroup) => {
    const empcode = group.get('empcode')?.value?.toLowerCase() || '';
    const empname = group.get('empname')?.value?.toLowerCase() || '';
    return empcode.includes(searchTextLower) || empname.includes(searchTextLower);
  });
}


    getFilteredList(): void {
      this.Service.get_list(this.employeeFilters).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.list = res.data;
            const formGroups = this.list.map((emp) => this.createEmployeeGroup(emp));
            this.EmployeeForm.setControl('employees', this.fb.array(formGroups));
          } else {
            this.list = [];
            this.toastrService.error(res.message || 'Failed to fetch employee data', 'Error');
          }
        },
        error: () => {
          this.list = [];
          this.toastrService.error('Error while fetching filtered employee list', 'Error');
        },
      });
    }

    // updateFilteredEmployees() {
    //   debugger
    //   const filteredEmployees = this.filteredData().map(group => ({
    //     fk_empid: group.get('fk_empid')?.value, // Corrected from empcode to fk_empid
    //     isKRA: group.get('isKRA')?.value,
    //     kra: group.get('kra')?.value,
    //     pli: group.get('pli')?.value
    //   }));
    //   // Call your service or handle logic here
    //   this.Service.updateEmployeeKRA(filteredEmployees).subscribe({
    //     next: (res) => {
    //       if (res.isSuccess) {
    //         this.toastrService.success('KRA/PLI updated successfully');
    //       } else {
    //         this.toastrService.error(res.message || 'Update failed');
    //       }
    //     },
    //     error: () => {
    //       this.toastrService.error('Error while updating KRA/PLI');
    //     }
    //   });
    // }
    

    updateFilteredEmployees() {
      const filteredEmployees = this.filteredData().map(group => ({
        fk_empid: group.get('fk_empid')?.value,
        isKRA: group.get('isKRA')?.value,
        kra: +group.get('kra')?.value || 0,
        pli: +group.get('pli')?.value || 0
      }));
    
      const payload = {
        empList: filteredEmployees
      };
    
      this.Service.updateEmployeeKRA(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success('KRA/PLI updated successfully');
          } else {
            this.toastrService.error(res.message || 'Update failed');
          }
        },
        error: () => {
          this.toastrService.error('Error while updating KRA/PLI');
        }
      });
    }
    

}
