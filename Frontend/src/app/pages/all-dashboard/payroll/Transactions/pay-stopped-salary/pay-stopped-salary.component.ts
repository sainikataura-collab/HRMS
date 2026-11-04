import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SalaryPayStoppedService } from '../../services/pay-stopped.service';

@Component({
  selector: 'app-pay-stopped-salary',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './pay-stopped-salary.component.html',
  styleUrl: './pay-stopped-salary.component.scss'
})
export class PayStoppedSalaryComponent {
EmployeeForm!: FormGroup;
  submitted=false;
  showEmployeeList: boolean = false;
  showError =false;
  id!:number;
  Isedit=false;


Month: { name: string, value: string }[] = []; 
Year: { name: string, value: string }[] = []; 
PaidSalaryList: any[] = [];
stoppedSalaryList: any[] = [];


masterSelected: boolean = false;
Selected: boolean = false;


searchTextStopped = '';
searchTextStoPaid = '';

ngxUILoaderService = inject(NgxUiLoaderService);


  constructor(private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,private paystopService: SalaryPayStoppedService) {}

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      FkMonthId: [null,[ Validators.required]],
      FkYearId: [null,[ Validators.required]],

      empCode: [''],
      empCodeManual:[''],
      empName: [''],
      selectedDepartments: [],
      SelectedDesignation: [''],
      selectedLocations: [],
      SelectedNature:[''],
      SelectedCity:[''],
      sortBy:[''],
      userId: [''],
      empStatus:[''],
    
      // FkMonthId: ['',[ Validators.required]],
      // year: ['',[ Validators.required]],
      payDate: ['',[ Validators.required]],
    });
    this.getMonthlist('Month');
    this.getYearList('Year');
  }   
  

  get filteredStoppedList() {
    if (!this.searchTextStopped) {
      return this.stoppedSalaryList;
    }
    const search = this.searchTextStopped.toLowerCase();
    return this.stoppedSalaryList.filter(emp =>
      emp.empname.toLowerCase().includes(search) ||
      emp.empcode.toLowerCase().includes(search) ||
      emp.location.toLowerCase().includes(search) ||
      emp.department.toLowerCase().includes(search) ||
      emp.designation.toLowerCase().includes(search)
    );
  }

  get filteredStopPaidList() {
    if (!this.searchTextStoPaid) {
      return this.PaidSalaryList;
    }
    const search = this.searchTextStoPaid.toLowerCase();
    return this.PaidSalaryList.filter(emp =>
      emp.empname.toLowerCase().includes(search) ||
      emp.empcode.toLowerCase().includes(search) ||
      emp.location.toLowerCase().includes(search) ||
      emp.department.toLowerCase().includes(search) ||
      emp.designation.toLowerCase().includes(search)
    );
  }

  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);
    }

    getMonthlist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.paystopService.getMonthlist(fieldName).subscribe({
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
    
      this.paystopService.getYear(fieldName).subscribe({
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


    selectAll() {
      for (let emp of this.stoppedSalaryList) {
        emp.isSelected = this.masterSelected;
      }
    }
  
    AllSelectStopSalary() {
      for (let emp of this.stoppedSalaryList) {
        emp.isSelected = this.Selected;
      }
    }
  
  
    checkIfAllSelected() {
      this.Selected = this.stoppedSalaryList.every(emp => emp.isSelected);
    }


    getList() {
   
      if(this.EmployeeForm.invalid){
        alert('please enter month & year');
        return;
      }
  
      const formValues = this.EmployeeForm.value;
   
      this.paystopService.get_paidSalaryList(formValues).subscribe({
        next: (res) => {
          if (res.isSuccess) { // Ensure `res` is not undefined or null
            console.log('Data retrieved successfully:',
              res.data);
              this.PaidSalaryList = res.data.paidSalary || [];
              this.stoppedSalaryList = res.data.stoppedSalary || [];
  
          } else {
            console.error('Failed to retrieve data:', res.message);
            this.toastrService.error(res.message);
          }
          this.ngxUILoaderService.stop();
        }
      
      });
    }

    StopSalary() {
      debugger;
      const selectedEmployees = this.PaidSalaryList.filter(emp => emp.isSelected);
    
      if (selectedEmployees.length === 0) {
        this.toastrService.warning("Please select at least one employee to unstop salary.");
        return;
      }
      const selectedEmpList = selectedEmployees.map(emp => ({
        fk_empid: emp.pk_empid   // ✅ use 'pk_empid' instead of 'fk_empid'
      }));
    
      const postPayload = {
        empList: selectedEmpList,
        fk_monthId: this.EmployeeForm.value.FkMonthId,
        fk_yearId: this.EmployeeForm.value.FkYearId,
        // stopsalary: 'N'  // ⬅ Important: N for unstop
      };
    
      this.paystopService.stop_Salary(postPayload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success('Salary has been **stopped** successfully!');
            this.getList();  // refresh list
          } else {
            this.toastrService.error(res.message || 'Failed to stop salary.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.message || 'Server error while posting data');
        }
      });
    }
    

    PaySalary() {
      const selectedEmployees = this.stoppedSalaryList.filter(emp => emp.isSelected);
    
      if (selectedEmployees.length === 0) {
        this.toastrService.warning("Please select at least one employee to unstop salary.");
        return;
      }
      const selectedEmpList = selectedEmployees.map(emp => ({
        fk_empid: emp.pk_empid   // ✅ use 'pk_empid' instead of 'fk_empid'
      }));
    
      const postPayload = {
        empList: selectedEmpList,
        fk_monthId: this.EmployeeForm.value.FkMonthId,
        fk_yearId: this.EmployeeForm.value.FkYearId,
        // stopsalary: 'N'  // ⬅ Important: N for unstop
      };
    
      this.paystopService.Pay_Salary(postPayload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success('Salary has been **un-stopped** successfully!');
            this.stoppedSalaryList = [];  // reset the list
            this.getList();  // refresh list
          } else {
            this.toastrService.error(res.message || 'Failed to unstop salary.');
          }
        },
        error: (err) => {
          this.toastrService.error(err.message || 'Server error while posting data');
        }
      });
    }
  


  // OnVeiw(){
  //   this.submitted = true;
  //   if (this. EmployeeForm.invalid) {
  //     this.showError = true;
  //     return;
  //   }
  //  }



  toggleEmployeeList() {
    this.showEmployeeList = true; // Show Employee List
  }
  resetForm(): void {
         this. EmployeeForm.reset();
       
        }
}


