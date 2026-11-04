import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
// import { TransactionService } from '../../services/transaction.service';
import { SalarySleepMessageService } from '../../services/salary-sleep-message.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
// import { re } from 'mathjs';
import { LoanTransactionService } from '../../services/loan-transaction.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { WorkflowNavigationService } from '../../../../../shared/services/workflow-navigation.service';
import { WorkflowSidebarComponent } from '../../../../../shared/components/workflow-sidebar/workflow-sidebar.component';

@Component({
  selector: 'app-salary-lock',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent,WorkflowSidebarComponent],
  templateUrl: './salary-lock.component.html',
  styleUrl: './salary-lock.component.scss'
})
export class SalaryLockComponent {
EmployeeForm!: FormGroup;
isContractApplicable= false;
CostCenter:any[]=[];
  submitted=false;
  showEmployeeList: boolean = false;
  employees: { name: string, value: string }[] = [];
  showError =false;
  EmployeeList:any={}
  searchText:string="";
Isedit=false;
pageIndex1: number = 1;
pageSize1: number = 10;
pageIndex2: number = 1;
pageSize2: number = 10;
searchTextLock = '';
searchTextUnUnLock = '';
salarylockedcount: number = 0;
salaryunlockcount: number = 0;
filteredLockedList: any[] = [];
filteredUnLockedList: any[] = [];
selectedUnLockedEmpCodes: string[] = [];
selectedLockedEmpCodes: string[] = [];

months = [];
years = [];
  constructor(
    private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private commanservice: ManualPunchBio,
    private httpservice: SalarySleepMessageService,
    private Loader: NgxUiLoaderService,
    public workflowNav: WorkflowNavigationService
  ) {}

  ngOnInit() {
    this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;
  
    this.filteredLockedList = this.EmployeeList.salarylocked || [];
    this.filteredUnLockedList = this.EmployeeList.salaryunlock || [];

    this.EmployeeForm = this.fb.group({
      empCode: [''],
      fk_monthId: ['',[ Validators.required]],
      fk_yearId: ['',[ Validators.required]],
       fk_costcentreid:[null],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      // Fk_userid: [''],
      // Fk_locid:['']
    });
    this.Loader.start();
    forkJoin([
      this.commanservice.getCommanList('month'),
      this.commanservice.getCommanList('Year'),
      this.commanservice.getCommanList('CostCenter')
    ]).subscribe({
      next: ([monthRes, yearRes, costCenterRes]) => {
        this.months = monthRes?.data || [];
        this.years = yearRes?.data || [];
        this.CostCenter = costCenterRes?.data || [];
        this.Loader.stop();

        // ── Auto-patch ONLY if navigating from workflow sidebar / factbox ──
        this.workflowNav.applyContextIfFromWorkflow(this.EmployeeForm, this.months, this.years, this.CostCenter);
      },
      error: () => {
        this.Loader.stop();
        this.toastrService.error("Failed to load dropdown lists.");
      }
    });
  }

  getPayrollContext = () => ({
    month: this.EmployeeForm.get('fk_monthId')?.value,
    year: this.EmployeeForm.get('fk_yearId')?.value,
    costCentre: this.EmployeeForm.get('fk_costcentreid')?.value
  }); 
  
  
  onpageChange(event:number)
  
  {this.pageIndex2=event;
    debugger
    this.OnVeiw()

  }  

  
  onpageChange1(event:number)

  {this.pageIndex1=event;
  
    this.OnVeiw()

  }  
  getMonthsList() {
    this.commanservice.getCommanList('month').subscribe({
      next: (res) => {
        this.months = res.data
      }
    })
  }
  getyearsList() {
    this.commanservice.getCommanList('Year').subscribe({
      next: (res) => {
        this.years = res.data
      }
    })
  }

  getList() {
    this.commanservice.getCommanList('CostCenter').subscribe({
      next: (res) => {
        this.CostCenter = res.data
      }
    })
  }
      
      // Handle filter updates from common search
      handleFilters(filters: any) {

        this.EmployeeForm.patchValue(filters);
      }


      
      filtersalaryData(type: 'Locked' | 'UnLocked') {
 
    
    let list: any[] = [];
    let searchText = '';
  
    switch (type) {
      case 'Locked':
        list = this.EmployeeList.salarylocked || [];
        searchText = this.searchTextLock;
        this.filteredLockedList= this.applySearch(list, searchText);
        break;
      case 'UnLocked':
        list = this.EmployeeList.salaryunlock || [];
        searchText = this.searchTextUnUnLock;
        this.filteredUnLockedList = this.applySearch(list, searchText);
        break;  
    }
  }
  
  applySearch(list: any[], searchText: string): any[] {
    if (!searchText) return list;
    const search = searchText.toLowerCase();
    return list.filter(emp =>
      (emp.empname?.toLowerCase().includes(search) || '') ||
      (emp.empcode?.toLowerCase().includes(search) || '') ||
      (emp.manualempcode?.toLowerCase().includes(search) || '') ||
      (emp.location?.toLowerCase().includes(search) || '') ||
      (emp.department?.toLowerCase().includes(search) || '') ||
      (emp.designation?.toLowerCase().includes(search)  || '')
    );
  }


    OnVeiw(){
    this.submitted = true;
    if (this. EmployeeForm.invalid) {
      this.showError = true;
     
       return;
    }
  
  const payload = this.EmployeeForm.value ;
  
  Object.keys(payload).forEach(key=>{
    if(payload[key]===null){
     payload[key]='';
  }
  })

  
  

 // this.Loader.start();
    this.httpservice.get_Salarylock(this.pageIndex1 - 1, this.pageSize1 ,this.pageIndex2 - 1, this.pageSize2,payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.showEmployeeList = true
          //this.Loader.stop();
          this.EmployeeList = res.data;
          this.filteredLockedList=[]
          this.filteredUnLockedList=[]
          this.searchTextLock=''
          this.searchTextUnUnLock=''
          this.selectedUnLockedEmpCodes = [];
          this.selectedLockedEmpCodes = [];
           this.salarylockedcount = res.data.salarylockedcount;
           this.salaryunlockcount = res.data.salaryunlockcount;
           this.filtersalaryData('Locked');
           this.filtersalaryData('UnLocked');
         

        } else {
       
          this.toastrService.info(res.message)
          this.filteredLockedList = [];
          this.filteredUnLockedList = [];
          this.EmployeeList={}
          this.salarylockedcount=0,
          this.salaryunlockcount=0
        }
      },
      error: (error) => {
        this.employees = [];
        this.toastrService.error('Failed to retrieve employees', error);
      }
    });
  }

//update lock or unlock 

updateunLock(){
  this.submitted = true;
  if (this. EmployeeForm.invalid) {
    this.showError = true;
   
     return;
  }
const payload = this.EmployeeForm.value ;
  
  Object.keys(payload).forEach(key=>{
    if(payload[key]===null){
     payload[key]='';
  }
  })

  this.httpservice.get_emplyeeSalaryunlock(payload).subscribe({
next:(res)=>{
  if(res.isSuccess){
    this.toastrService.success(res.message);
    //this.filteredUnLockedList=res.data;
    this.OnVeiw()
  }
  else{
    this.toastrService.info(res.message);
  }
},
error: (error) => {
  this.employees = [];
  this.toastrService.error('Failed to retrieve employees', error);
}
  })

}
   
updateLock(){
  this.submitted = true;
  if (this. EmployeeForm.invalid) {
    this.showError = true;
   
     return;
  }

  const payload = this.EmployeeForm.value ;
  
  Object.keys(payload).forEach(key=>{
    if(payload[key]===null){
     payload[key]='';
  }
  })

  this.httpservice.get_emplyeeSalarylock(payload).subscribe({
next:(res)=>{
  if(res.isSuccess){
    this.toastrService.success(res.message);
 //   this.filteredLockedList=res.data;
 this.OnVeiw()
  }
  else{
    this.toastrService.info(res.message);
  }
},
error: (error) => {
  this.employees = [];
  this.toastrService.error('Failed to retrieve employees', error);
}
  })

}

  get isSelectAllUnLocked(): boolean {
    if (!this.filteredUnLockedList || this.filteredUnLockedList.length === 0) return false;
    return this.filteredUnLockedList.every(emp => this.selectedUnLockedEmpCodes.includes(emp.empcode));
  }

  selectAllUnLocked(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.filteredUnLockedList.forEach(emp => {
        if (emp.empcode && !this.selectedUnLockedEmpCodes.includes(emp.empcode)) {
          this.selectedUnLockedEmpCodes.push(emp.empcode);
        }
      });
    } else {
      const pageCodes = this.filteredUnLockedList.map(emp => emp.empcode);
      this.selectedUnLockedEmpCodes = this.selectedUnLockedEmpCodes.filter(c => !pageCodes.includes(c));
    }
  }

  isEmpUnLockedSelected(empcode: string): boolean {
    return this.selectedUnLockedEmpCodes.includes(empcode);
  }

  toggleUnLockedSelection(empcode: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedUnLockedEmpCodes.includes(empcode)) {
        this.selectedUnLockedEmpCodes.push(empcode);
      }
    } else {
      this.selectedUnLockedEmpCodes = this.selectedUnLockedEmpCodes.filter(c => c !== empcode);
    }
  }

  get isSelectAllLocked(): boolean {
    if (!this.filteredLockedList || this.filteredLockedList.length === 0) return false;
    return this.filteredLockedList.every(emp => this.selectedLockedEmpCodes.includes(emp.empcode));
  }

  selectAllLocked(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.filteredLockedList.forEach(emp => {
        if (emp.empcode && !this.selectedLockedEmpCodes.includes(emp.empcode)) {
          this.selectedLockedEmpCodes.push(emp.empcode);
        }
      });
    } else {
      const pageCodes = this.filteredLockedList.map(emp => emp.empcode);
      this.selectedLockedEmpCodes = this.selectedLockedEmpCodes.filter(c => !pageCodes.includes(c));
    }
  }

  isEmpLockedSelected(empcode: string): boolean {
    return this.selectedLockedEmpCodes.includes(empcode);
  }

  toggleLockedSelection(empcode: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedLockedEmpCodes.includes(empcode)) {
        this.selectedLockedEmpCodes.push(empcode);
      }
    } else {
      this.selectedLockedEmpCodes = this.selectedLockedEmpCodes.filter(c => c !== empcode);
    }
  }

  get totalEmployees(): number {
    return (this.salarylockedcount || 0) + (this.salaryunlockcount || 0);
  }

  get lockPercent(): number {
    return this.totalEmployees > 0 ? Math.round(((this.salarylockedcount || 0) / this.totalEmployees) * 100) : 0;
  }

  goToAutoSalaryProcess(): void {
    this.router.navigate([this.workflowNav.ROUTES.AUTO_SALARY_PROCESS]);
  }

  goToManualIncomeTax(): void {
    this.router.navigate([this.workflowNav.ROUTES.MANUAL_INCOME_TAX]);
  }

  goToSalaryReport(): void {
    this.workflowNav.navigateToReport('salary', this.router.url, 'Salary Lock');
  }

  goToAttendanceReport(): void {
    this.workflowNav.navigateToReport('attendance', this.router.url, 'Salary Lock');
  }

  goToLeaveReport(): void {
    this.workflowNav.navigateToReport('leave', this.router.url, 'Salary Lock');
  }

}

