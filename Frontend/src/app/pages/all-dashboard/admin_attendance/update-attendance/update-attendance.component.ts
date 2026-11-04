import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';
import { EmpweekoffmasterService } from '../../payroll/services/empweekoffmaster.service';

@Component({
  selector: 'app-update-attendance',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './update-attendance.component.html',
  styleUrl: './update-attendance.component.scss'
})
export class UpdateAttendanceComponent {

  Form!: FormGroup;
    submitted = false;
  EmployeeList: { name: string; value: string }[] = [];
  //leave: { name: string; value: string }[] = [];
  
    leaveList: any[] = [];   // final list from API
    showList: boolean = false;
  
    leave: { name: string; value: string | null }[] = [
   { name: 'Attendance Regularization', value: '3' },
    { name: 'Comp Off', value: '2' },
     { name: 'Short Leave', value: '1' }
   
  ];
  
   pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;
  
    ngxUILoaderService = inject(NgxUiLoaderService);
  
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
      private toastr: ToastrService,
      private router: Router,
      private leaveService: LeaveTransactionService,
      private empweekoffmasterService:EmpweekoffmasterService
    ) {}
    
  
    ngOnInit() {
      this.Form = this.fb.group({
       
        fk_empid: [null],
        fromDate: [''],
        toDate: [''],
        IsAttendancelog:[false]
      });
  
    
    
    }
  
  
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    
    this.getEmployees();   }
    
  


    
  
  
    Update() {
    if (this.Form.invalid) {
      this.toastr.warning('Please select all required fields.');
      
      return;
    }
  
    const payload = {...this.Form.value};
  
    this.ngxUILoaderService.start();
  
    this.leaveService.update(payload).subscribe({
      next: (res) => {
        try {
          if (res?.isSuccess) {
              this.toastr.success("Your Attendance will be update with in 20 to 30 min .");
           
          } 
           else {
              this.toastr.error(res.message);
           
          } 
        } catch (e) {
         
          this.toastr.error("Unexpected error while processing list.");
         
        } finally {
          this.ngxUILoaderService.stop();
        }
      },
      error: (err) => {
   
        this.toastr.error("Something went wrong while fetching list.");
     
        this.ngxUILoaderService.stop();
      }
    });
  }

  getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.empweekoffmasterService
      .get_Employees_Ddl(this.employeeFilters)
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
  onEmployeeSearch(event: any) {

    const search =
      (event.term || '')
        .trim()
        .toLowerCase();

    clearTimeout(
      this.searchTimer
    );

    // blank search 
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
  
  
  
  
    resetForm() {
      this.Form.reset();
     
    }
  
    
  
  
  
  
  
  
  
  
  
}
