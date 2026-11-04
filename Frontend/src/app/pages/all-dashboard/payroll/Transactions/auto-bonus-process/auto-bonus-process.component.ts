import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { MonthlyRentDetailService } from '../../services/monthly-rent-detail.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter, forkJoin } from 'rxjs';
import { DropdownService } from '../../../../../shared/services/dropdown.service';

@Component({
  selector: 'app-auto-bonus-process',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule,CommonSearchComponent,NgxPaginationModule],
  templateUrl: './auto-bonus-process.component.html',
  styleUrl: './auto-bonus-process.component.scss'
})
export class AutoBonusProcessComponent {
EmployeeForm!: FormGroup;
 isContractApplicable= false;
  submitted=false;
  salaryLockCount: number = 0;
  salaryProcessedCount: number = 0;
  salaryNotProcessedCount: number = 0;
  showError =false;
  fiterData={}
// For table 1
pageIndex1: number = 1;
pageSize1: number = 10;

// For table 2
pageIndex2: number = 1;
pageSize2: number = 10;

// For table 3
pageIndex3: number = 1;
pageSize3: number = 10;
months:any[]=[];
natureOptions: any[] = [];
attendanceData: any = {};
CostCenter:any[]=[];


searchTextProcessed = '';
searchTextLocked = '';
searchTextUnprocessed = '';
selectedempcodeUnProcessed:string[] = [];
filteredProcessedList: any[] = [];
filteredLockedList: any[] = [];
filteredUnprocessedList: any[] = [];


years:any[]=[];
  constructor(private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private httpservice :MonthlyRentDetailService,
    private Loader:NgxUiLoaderService,
   private dropdownService: DropdownService

  ) {}
  ngOnInit() {
    this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;

    this.filteredProcessedList = this.attendanceData.salaryProcessed || [];
    this.filteredLockedList = this.attendanceData.salaryLock || [];
    this.filteredUnprocessedList = this.attendanceData.salaryNotProcessed || [];

    this.EmployeeForm = this.fb.group({
      FkMonthId: [null,Validators.required],
      FkYearId: [null,Validators.required],
      fk_costcentreid: [null],
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
      toDate: [null, [Validators.required]],
      totalDays: [''],  
      fromDate: [null, [Validators.required]], 
      })
      this.EmployeeForm.get('fromDate')?.valueChanges.subscribe(() => {
        this.calculateTotalDays();
      });
    
      this.EmployeeForm.get('toDate')?.valueChanges.subscribe(() => {
        this.calculateTotalDays();
      });
    
    this.Loader.start();
      forkJoin([
      this.httpservice.getCommanList('Month'),
      this.httpservice.getCommanList('Year'),
       this.httpservice.getCommanList('CostCenter'),

    ]).subscribe({
      next: ([monthsRes, yearsRes,ContractorRes]) => {
        this.months = monthsRes.data;
        this.years = yearsRes.data;
        this.CostCenter=ContractorRes.data.slice(1);
        this.Loader.stop(); 
      },
      error: () => {
        this.toastrService.error("Failed to load data");
        this.Loader.stop();
      }
    });
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

  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);

  }
  autoProcessDataList() {

  
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
      pageIndex3: this.pageIndex3 - 1,
      pageSize3: this.pageSize3,
      ...formData // spread form values into the request body
    };
  this.Loader.start();
    this.httpservice.getBonusProcess(payload).subscribe({
    
      next: (res: any) => {
        this.Loader.stop();
        if (res.isSuccess) {
          this.attendanceData = res.data;


          this.filteredProcessedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
          this.salaryLockCount=0,
          this.salaryProcessedCount=0
          this.salaryNotProcessedCount=0
          this.searchTextLocked='',
          this.searchTextProcessed=''
         this.searchTextUnprocessed=''
          setTimeout(() => {
            this.salaryLockCount = res.data.salaryLockCount;
            this.salaryProcessedCount = res.data.salaryProcessedCount;
            this.salaryNotProcessedCount = res.data.salaryNotProcessedCount;
          });
          this.filterAttendance('process');
          this.filterAttendance('locked');
          this.filterAttendance('unprocessed');

        }else{
          this.toastrService.info(res.message)
          this.filteredProcessedList = [];
          this.filteredLockedList = [];
          this.filteredUnprocessedList = [];
        }
       

      },
      error: (err) => {
        this.toastrService.error(err.message);
        this.Loader.stop();
      }
    });
    
  }

  EmpUnProcessed(empCode: string, event: any) {

    if (event.target.checked) {
      if (!this.selectedempcodeUnProcessed.includes(empCode)) {
        this.selectedempcodeUnProcessed.push(empCode);
      }
    } else {
      this.selectedempcodeUnProcessed = this.selectedempcodeUnProcessed.filter(code => code !== empCode);
      console.log('thisemcpdode',this.selectedempcodeUnProcessed )
    }
  }

onNotMarkedPageChange(event: number): void {
  this.pageIndex1 = event;
  this.autoProcessDataList();
}

onMarkedPageChange(event: number): void {
  this.pageIndex2 = event;
  this.autoProcessDataList();
}

onLockedPageChange(event: number): void {
  this.pageIndex3 = event;
  this.autoProcessDataList();
}

  onSubmit() {
    debugger
    this.submitted = true;
    this.showError = true;
   
    if (this.EmployeeForm.invalid) {
      
      return;
    }

    const empCode = this.EmployeeForm.get('sortBy')?.value;
    const selectedDepartments = this.EmployeeForm.get('selectedDepartments')?.value;
    const selectedLocations = this.EmployeeForm.get('selectedLocations')?.value;


    if (!empCode || empCode.trim() === '') {
      this.toastrService.warning('Please select sortBy', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }

    if (!selectedDepartments || selectedDepartments.length === 0) {
      this.toastrService.warning('Please select at least one Department', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }
  
    if (!selectedLocations || selectedLocations.length === 0) {
      this.toastrService.warning('Please select at least one Location', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }
    this.selectedempcodeUnProcessed=[];
  
    this.autoProcessDataList();
  }
   

  postSalaryData() {

    if (!this.filteredUnprocessedList || this.filteredUnprocessedList.length === 0) {
      this.toastrService.warning('You have not selected employee to process!.');
      return;
    }
    const selectempcode=this.selectedempcodeUnProcessed.join(',')
    const postPayload = {...this.EmployeeForm.value,empcode:selectempcode}; // ✔ send directly 

    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }     
    });

    
    this.httpservice.postBonusProcess(postPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success('Bonus has been processed successfully!');
          this.onSubmit();
        } else {
          this.toastrService.error(res.message || 'Failed salary has been processed successfull.');
        }
      },
      error: (err) => {
        this.toastrService.error(err.message || 'Server error while posting data');
      }
    });
  }
  
  deleteSalaryData() {
   
    if (!this.filteredProcessedList || this.filteredProcessedList.length === 0) {
      this.toastrService.warning('You have not selected employee to un-process!.');
      return;
    }
    const selectempcode=this.selectedempcodeUnProcessed.join(',')
    const postPayload = {...this.EmployeeForm.value,empcode:selectempcode}; // ✔ send directly 
  
    Object.keys(postPayload).forEach(key => {
      if (postPayload[key] === null) {
        postPayload[key] = '';
      }
    });

    
    this.httpservice.DeleteBonusProcess(postPayload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.onSubmit();
          this.toastrService.success('Bonus Process has been Un processed successfull');
       
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: (err) => {
        this.toastrService.error(err.message);
      }
    });
  }
  


  filterAttendance(type: 'process' | 'locked' | 'unprocessed') {
 
    
    let list: any[] = [];
    let searchText = '';
  
    switch (type) {
      case 'process':
        list = this.attendanceData.salaryProcessed || [];
        searchText = this.searchTextProcessed;
        this.filteredProcessedList= this.applySearch(list, searchText);
        break;
      case 'locked':
        list = this.attendanceData.salaryLock || [];
        searchText = this.searchTextLocked;
        this.filteredLockedList = this.applySearch(list, searchText);
        break;
      case 'unprocessed':
        list = this.attendanceData.salaryNotProcessed || [];
        searchText = this.searchTextUnprocessed;
        this.filteredUnprocessedList = this.applySearch(list, searchText);
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
      (emp.designation?.toLowerCase().includes(search) || '') ||
      (emp.totaldays?.toString().toLowerCase().includes(search) || '') ||
      (emp.present?.toString().toLowerCase().includes(search) || '') ||
      (emp.lwp?.toString().toLowerCase().includes(search) || '') ||
      (emp.holidays?.toString().toLowerCase().includes(search) || '') ||
      (emp.otHrs?.toString().toLowerCase().includes(search) || '') ||
      (emp.wOff?.toString().toLowerCase().includes(search) || '') ||
      (emp.paidDays?.toString().toLowerCase().includes(search) || '')
    );
  }



}
