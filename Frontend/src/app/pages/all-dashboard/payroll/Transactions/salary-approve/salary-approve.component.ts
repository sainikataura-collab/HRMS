import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SalarySleepMessageService } from '../../services/salary-sleep-message.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-salary-approve',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './salary-approve.component.html',
  styleUrl: './salary-approve.component.scss'
})
export class SalaryApproveComponent {
    isExporting = false;
approvedHeaders: string[] = [];
disapprovedHeaders: string[] = [];
hiddenColumns = ['CID', 'IsApproved'];
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
  salaryApprovedcount: number = 0;
  salaryDisapprovedcount: number = 0;
  filteredApprovedList: any[] = [];
  filteredDisapprovedList: any[] = [];
  
  months = [];
  years = [];
    constructor(
      private fb: FormBuilder,
      private  toastrService: ToastrService,
      private router: Router,
      private commanservice: ManualPunchBio,
      private httpservice: SalarySleepMessageService,     private Loader:NgxUiLoaderService,
    private httpService: EmployeeService
    ) {}
  
    ngOnInit() {
      this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;
    
      this.filteredApprovedList = this.EmployeeList.salaryApprovedList || [];
      this.filteredDisapprovedList = this.EmployeeList.salaryDisapprovedList || [];
  
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


        // added for salary report excel export if in  future data  export accoding  the approval and disapproval then remove exporttype and saltransfer 
        
      ExportType:[2],
      SalTransfer: ['A']
      });
      this.getMonthsList();
      this.getyearsList();
      this.getList();
    } 
    
    
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
  
  
        
        filtersalaryData(type: 'Approve' | 'Disapprove') {
   
      
      let list: any[] = [];
      let searchText = '';
    
      switch (type) {
        case 'Approve':
          list = this.EmployeeList.salaryApprovedList || [];
          searchText = this.searchTextLock;
          this.filteredApprovedList= this.applySearch(list, searchText);
          break;
        case 'Disapprove':
          list = this.EmployeeList.salaryDisapprovedList || [];
          searchText = this.searchTextUnUnLock;
          this.filteredDisapprovedList = this.applySearch(list, searchText);
          break;  
      }
    }
    
   
  
    applySearch(list: any[], searchText: string): any[] {
  if (!searchText) return list;

  const search = searchText.toLowerCase();

  return list.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(search)
    )
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
      this.httpservice.get_Salaryapproved(this.pageIndex1 - 1, this.pageSize1 ,this.pageIndex2 - 1, this.pageSize2,payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.showEmployeeList = true
            //this.Loader.stop();
           
             this.EmployeeList = res.data;

// ✅ SET RAW LISTS FIRST
this.filteredApprovedList = res.data.salaryApprovedList || [];
this.filteredDisapprovedList = res.data.salaryDisapprovedList || [];



this.searchTextLock = '';
this.searchTextUnUnLock = '';

// ✅ COUNTS
this.salaryApprovedcount = res.data.salaryApprovedCount;
this.salaryDisapprovedcount = res.data.salaryDisapprovedCount;

// ✅ DYNAMIC HEADERS (ADD HERE)
this.approvedHeaders = [];
this.disapprovedHeaders = [];

// if (this.filteredApprovedList.length > 0) {
//   this.approvedHeaders = Object.keys(this.filteredApprovedList[0]);
// }

// if (this.filteredDisapprovedList.length > 0) {
//   this.disapprovedHeaders = Object.keys(this.filteredDisapprovedList[0]);
// }

if (this.filteredApprovedList.length > 0) {
  this.approvedHeaders = Object.keys(this.filteredApprovedList[0])
    .filter(key => !this.hiddenColumns.includes(key));
}

if (this.filteredDisapprovedList.length > 0) {
  this.disapprovedHeaders = Object.keys(this.filteredDisapprovedList[0])
    .filter(key => !this.hiddenColumns.includes(key));
}

// ✅ APPLY SEARCH AFTER HEADERS
this.filtersalaryData('Approve');
this.filtersalaryData('Disapprove');

           
  
          } else {
         
            this.toastrService.info(res.message)
            this.filteredDisapprovedList = [];
            this.filteredApprovedList = [];
            this.EmployeeList={}
            this.salaryApprovedcount=0,
            this.salaryDisapprovedcount=0
          }
        },
        error: (error) => {
          this.employees = [];
          this.toastrService.error('Failed to retrieve employees', error);
        }
      });
    }
  
  //update lock or unlock 
  
  updateDisapporve(){
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
  
    this.httpservice.get_emplyeeSalarydisapproved(payload).subscribe({
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
     
  updateApprove(){
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
  
    this.httpservice.get_emplyeeSalaryapproved(payload).subscribe({
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
// according approval and diapproval wise

//   downloadExcel() {
     
//    if (this.isExporting) return; // prevent double click
//   this.isExporting = true;

//    const payload = this.EmployeeForm.value ;
    
//     Object.keys(payload).forEach(key=>{
//       if(payload[key]===null){
//        payload[key]='';
//     }
//     })
//     let selectedMonthId = this.EmployeeForm.get('fk_monthId')?.value;
//       let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
//       let {name : month,value}={...selectedMonth!}

//       let selectedYearId = this.EmployeeForm.get('fk_yearId')?.value;
//       let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
//       let {name : Year,value : Yearvalue}={...selectedYear!}

     
//        let ReportName =month+'_'+Year+'.xlsx';

//   //added for contractor name
//   // Find contractor name from CostCenter list
// let contractorName = '';
// if (payload.fk_costcentreid) {
//   const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
//   contractorName = selectedContractor ? selectedContractor.name : '';
// }
// // Add to formData for backend
// payload.contractorName = contractorName;

  

//   this.httpservice.downloadGetsalaryApprovedList(this.pageIndex1 - 1, this.pageSize1 ,this.pageIndex2 - 1, this.pageSize2,payload).subscribe({
//     next: (res: Blob) => {
//       const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//      // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
//     a.download = ReportName;

//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//        this.isExporting = false; // reset after download
//     },
//     error: (err) => {
//       console.error('Download failed', err);
//        this.isExporting = false; // reset even on error
//     }
//   });
// }




// for salary report download on both button
downloadExcel() {
     
   if (this.isExporting) return; // prevent double click
  this.isExporting = true;

  const payload = {
    ...this.EmployeeForm.value,
    pageIndex: 0,
    pageSize: 10000
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === null) {
      payload[key] = '';
    }
  });
    let selectedMonthId = this.EmployeeForm.get('fk_monthId')?.value;
      let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
      let {name : month,value}={...selectedMonth!}

      let selectedYearId = this.EmployeeForm.get('fk_yearId')?.value;
      let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
      let {name : Year,value : Yearvalue}={...selectedYear!}

      

      let ReportName =month+'_'+Year+'.xlsx';

  //added for contractor name
  // Find contractor name from CostCenter list
let contractorName = '';
if (payload.fk_costcentreid) {
  const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
  contractorName = selectedContractor ? selectedContractor.name : '';
}
// Add to formData for backend
payload.contractorName = contractorName;

  

  this.httpService.downloadViewSalaryReportlist(payload).subscribe({
    next: (res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
     // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
    a.download = ReportName;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
       this.isExporting = false; // reset after download
    },
    error: (err) => {
      console.error('Download failed', err);
       this.isExporting = false; // reset even on error
    }
  });
}


}
