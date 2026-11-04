import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { forkJoin } from 'rxjs';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';
import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-arrear-process',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent,WorkflowSidebarComponent],
  templateUrl: './arrear-process.component.html',
  styleUrl: './arrear-process.component.scss'
})
export class ArrearProcessComponent {
  EmployeeForm!: FormGroup;
  submitted=false;
  showError =false;
  showErroronProcess=false;
  months:any[]=[];
  years:any[]=[];
  ArrearUnProcessed:string[] = [];
  ArrearProcessed:string[] = [];
  ArrearProcessedCount: number = 0;
  ArrearUnProcessedCount: number = 0;
  pageIndex1: number = 1;
  pageSize1: number = 10;
pageIndex2: number = 1;
pageSize2: number = 10;
searchTextProcessed = '';
searchTextUnprocessed = '';

filteredProcessedList: any[] = [];
filteredUnProcessedList: any[] = [];

ArrearProcessData: any = {};
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private Loader: NgxUiLoaderService,
    private httpservice: MonthlyRentDetailService,
    private router: Router,
    public workflowNav: WorkflowNavigationService
  ) {}
    ngOnInit() {

      this.filteredProcessedList = this.ArrearProcessData.arrearProcessed || [];
      this.filteredUnProcessedList = this.ArrearProcessData.arrearUnProcessed || [];


      console.log('fkhfkjdh',  this.filteredUnProcessedList)
      this.EmployeeForm = this.fb.group({
        empCode: [''],
        empName: [''],
        selectedLocations: [[]], 
        selectedDepartments: [[]], 
        selectedDesignation: [''], 
        selectedNature: [''], 
        selectedCity: [''], 
        sortBy: [''], 
        empStatus: [''],
        Fk_FinId: [''],
        Fk_CompanyId: [''],
        FkMonthId: [null,Validators.required],
        FkYearId: [null,Validators.required],
        arrearType: [''],
        toDate: [null, [Validators.required]],
        totalDays: [''],  
        fromDate: [null, [Validators.required]],
      });
    
      this.EmployeeForm.get('fromDate')?.valueChanges.subscribe(() => {
        this.calculateTotalDays();
      });
    
      this.EmployeeForm.get('toDate')?.valueChanges.subscribe(() => {
        this.calculateTotalDays();
      });
    
      this.Loader.start();
      forkJoin([
        this.httpservice.getCommanList('Month'),
        this.httpservice.getCommanList('Year')
      ]).subscribe({
        next: ([monthsRes, yearsRes]) => {
          this.months = monthsRes.data;
          this.years = yearsRes.data;
          this.Loader.stop(); 

          // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
          this.workflowNav.applyContextIfFromWorkflow(this.EmployeeForm, this.months, this.years);
        },
        error: () => {
          this.toastrService.error("Failed to load data");
          this.Loader.stop();
        }
      });
    }

  getPayrollContext = () => ({
    month: this.EmployeeForm.get('FkMonthId')?.value,
    year: this.EmployeeForm.get('FkYearId')?.value,
    costCentre: null
  });
    

  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);    
  }
  calculateTotalDays() {
    const fromDate = this.EmployeeForm.get('fromDate')?.value;
    const toDate = this.EmployeeForm.get('toDate')?.value;

    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
  
      if (endDate >= startDate) {
        const difference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) + 1;
        this.EmployeeForm.patchValue({ totalDays: difference });
      } else {
        this.EmployeeForm.patchValue({ totalDays: 0 });
      }
    }
  }

  ProcessedPageChange(event: number): void {
    this.pageIndex2 = event;
    this.ArrearDataList();
  }
  
  UnProcessedPageChange(event: number): void {
    this.pageIndex1 = event;
    this.ArrearDataList();
  }

  PostProcessedData() {

  if (!this.filteredUnProcessedList || this.filteredUnProcessedList.length === 0) {
    this.toastrService.warning('You have not selected employee to Arrear process !.');
    return;
  }
  this.submitted=true;
  this.showErroronProcess=true
 if(this.EmployeeForm.invalid) return;
  const selectedempcodes= this.ArrearProcessed.join(',')
  
  const postPayload = {...this.EmployeeForm.value, empcode:selectedempcodes}; // ✔ send directly 

  Object.keys(postPayload).forEach(key => {
    if (postPayload[key] === null) {
      postPayload[key] = '';
    }     
  });

  
  this.httpservice.PostArrearProcess(postPayload).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success('Arrer has been processed successfully!');
        this.OnView();
      } else {
        this.toastrService.error(res.message || 'Failed salary has been processed successfull.');
      }
    },
    error: (err) => {
      this.toastrService.error(err.message || 'Server error while posting data');
    }
  });
}

DeleteProcessedData() {
  if (!this.filteredProcessedList || this.filteredProcessedList.length === 0) {
    this.toastrService.warning('You have not selected employee to Arrear Un-process!.');
    return;
  }

  this.submitted=true;
  this.showErroronProcess=true;
if(this.EmployeeForm.invalid) return;

const selectedempcodes= this.ArrearUnProcessed.join(',')
  
  const postPayload = {...this.EmployeeForm.value,empcode:selectedempcodes}; // ✔ send directly



  Object.keys(postPayload).forEach(key => {
    if (postPayload[key] === null) {
      postPayload[key] = '';
    }
  });

  
  this.httpservice.DeleteArrearProcess(postPayload).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.OnView();
        this.toastrService.success('Arrear Process has been Un processed successfull');
     
      } else {
        this.toastrService.error(res.message);
      }
    },
    error: (err) => {
      this.toastrService.error(err.message);
    }
  });
}




EmpArrearUnProcessed(empCode: string, event: any) {
  if (event.target.checked) {
    if (!this.ArrearUnProcessed.includes(empCode)) {
      this.ArrearUnProcessed.push(empCode);
    }
  } else {
    this.ArrearUnProcessed = this.ArrearUnProcessed.filter(code => code !== empCode);
  }
}
EmpArrearProcessed(empCode: string, event: any) {
  if (event.target.checked) {
    if (!this.ArrearProcessed.includes(empCode)) {
      this.ArrearProcessed.push(empCode);
    }
  } else {
    this.ArrearProcessed = this.ArrearProcessed.filter(code => code !== empCode);
  }
}




ArrearDataList() {

  
  // Clone and sanitize form data
  const formData = { ...this.EmployeeForm.value };

  Object.keys(formData).forEach(key => {
    if (formData[key] === null) {
      formData[key] = '';
    }
  });


  const payload = {
    pageIndex1: this.pageIndex1 - 1,
    pageSize1: this.pageSize1,
    pageIndex2: this.pageIndex2 - 1,
    pageSize2: this.pageSize2,
    ...formData // spread form values into the request body
  };
this.Loader.start();
  this.httpservice.getArrearProcess(payload).subscribe({
    next: (res: any) => {
      this.Loader.stop();
      if (res.isSuccess) {
        this.ArrearProcessData = res.data;
        this.filteredProcessedList = [];
        this.filteredUnProcessedList = [];
        this.searchTextProcessed=''
         this.searchTextUnprocessed=''
          this.ArrearProcessedCount = res.data.arrearProcessedCount;
          this.ArrearUnProcessedCount = res.data.arrearUnProcessedCount;
        this.filterArrearData('processed');
        this.filterArrearData('unprocessed');

      }else{
        this.toastrService.info(res.message)
        this.filteredProcessedList = [];
        this.filteredUnProcessedList = [];
        this.ArrearProcessData={}
        this.ArrearProcessedCount=0,
        this.ArrearUnProcessedCount=0
      
      }
     

    },
    error: (err) => {
      this.toastrService.error(err.message);
      this.Loader.stop();
    }
  });
  
}


  OnView(){


    // this.submitted = true;
    // this.showError = true;

    // if (this.EmployeeForm.invalid) return;

    const sortBy = this.EmployeeForm.get('sortBy')?.value;
    const departments = this.EmployeeForm.get('selectedDepartments')?.value;
    const locations = this.EmployeeForm.get('selectedLocations')?.value;

    if (!sortBy || sortBy.trim() === '') {
      this.toastrService.warning('Please select sortBy');
      return;
    }

    if (!departments?.length) {
      this.toastrService.warning('Please select at least one Department');
      return;
    }

    if (!locations?.length) {
      this.toastrService.warning('Please select at least one Location');
      return;
    }

const form = this.EmployeeForm;

const requiredFields = ['FkMonthId', 'FkYearId'];
const isValid = requiredFields.every(field => form.get(field)?.value);

if (!isValid) {
  this.toastrService.warning('Please select Month, Year');
  return;
}

this.ArrearUnProcessed=[];
this.ArrearProcessed=[];
 this.ArrearDataList()

  }


  filterArrearData(type: 'processed' | 'unprocessed') {
 
    
    let list: any[] = [];
    let searchText = '';
  
    switch (type) {
      case 'processed':
        list = this.ArrearProcessData.arrearProcessed || [];
        searchText = this.searchTextProcessed;
        this.filteredProcessedList= this.applySearch(list, searchText);
        break;
      case 'unprocessed':
        list = this.ArrearProcessData.arrearUnProcessed || [];
        searchText = this.searchTextUnprocessed;
        this.filteredUnProcessedList = this.applySearch(list, searchText);
        break;
    }
  }
  
  applySearch(list: any[], searchText: string): any[] {
    if (!searchText) return list;
    const search = searchText.toLowerCase();
    return list.filter(emp =>
      (emp.empName?.toLowerCase().includes(search) || '') ||
      (emp.empCode?.toLowerCase().includes(search) || '') ||
      (emp.manualEmpCode?.toLowerCase().includes(search) || '') ||
      (emp.location?.toLowerCase().includes(search) || '') ||
      (emp.department?.toLowerCase().includes(search) || '') ||
      (emp.designation?.toLowerCase().includes(search)  || '')
    );
  }

  goToMonthlyAttendance(): void {
    this.router.navigate([this.workflowNav.ROUTES.MONTHLY_ATTENDANCE]);
  }

  goToAttendanceAdjustment(): void {
    this.router.navigate([this.workflowNav.ROUTES.ATTENDANCE_ADJUSTMENT]);
  }

  goToAutoSalaryProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.AUTO_SALARY_PROCESS]);
  }

  goToAttendanceReport(): void {
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Arrear Process');
  }

  goToLeaveReport(): void {
    this.workflowNav.navigateToReport('leave', this.router.url, 'Arrear Process');
  }

}


