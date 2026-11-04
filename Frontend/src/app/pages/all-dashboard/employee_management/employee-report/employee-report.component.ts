import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { EmployeeReportService } from '../../payroll/services/employee-report.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgSelectComponent,CommonSearchComponent,NgxPaginationModule],
  templateUrl: './employee-report.component.html',
  styleUrl: './employee-report.component.scss'
})
export class EmployeeReportComponent {


   ExportExcel!:FormGroup;
    isExporting = false;
    searchText:string="";
    submitted=false;
    showError=false;
    totalCount:number=0;
    pageIndex: number = 1;
    pageSize: number = 10;
    showEmployeeList: boolean = false;
    EmployeeList:any[]=[]
    EmployeeListExcle:any[]=[];
    months=[]
    years=[]
  
   CostCenter: { name: string; value: string | null }[] = [];
    tableHeaders:string[]=[]
    isContractApplicable= false;
    ExportTypelist=[
      //{name: '--select Grade --', Value:0},
      {name:'Employee Details',value:0}
     
  
    ]
  
  SalTransfer=[
      {name:'All',value:"A"},
      {name:'Bank',value:"B"},
      {name:'Cash',value:"C"},
      {name:'Stop',value:"S"}
    ]
  
    constructor(
      private fb: FormBuilder,
      private  toastrService: ToastrService,
      private router: Router,
      private httpService: EmployeeReportService,
       private ngxUILoaderService:NgxUiLoaderService,
      private commanService: ManualPunchBio,) {}
    ngOnInit() {
      this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;
  
      this.ExportExcel = this.fb.group({
        empCode: [''],
        fk_monthId:[null],
        fk_yearId:[null],
        fk_costcentreid: [null],
        EmplyeeType:[''],     
        empCodeManual: [''],
        empName: [''],
        selectedDepartments: [[]],
        selectedDesignation: [''],
        selectedLocations: [[]],
        selectedNature: [''],
        selectedCity: [''],
        sortBy: [''],
        ExportType:[null],
        SalTransfer: ['A']
      });
  
      this.getMonthsList();
      this.getyearsList();
      this.getCostCenterList();
    }    
  
    getMonthsList() {
      this.commanService.getCommanList('month').subscribe({
        next: (res) => {
          res.data = res.data.slice(1);
          this.months = res.data
          
        }
      })
    }
    getyearsList() {
      this.commanService.getCommanList('Year').subscribe({
        next: (res) => {
          res.data = res.data.slice(1);
          this.years = res.data
        }
      })
    }
  
     getCostCenterList() {
      this.commanService.getCommanList('CostCenter').subscribe({
        next: (res) => {
          res.data = res.data.slice(1);
          this.CostCenter = res.data
          
        }
      })
    }
    
  
   
    restfrom(){
      this.EmployeeList=[];
    }
      // Handle filter updates from common search
      handleFilters(filters: any) {
  
        this.ExportExcel.patchValue(filters);
      }
      filteredData() {
        if (!this.searchText) {
          return this.EmployeeList;
        }
        const searchTextLower = this.searchText.toLowerCase();
        return this.EmployeeList.filter(res =>
          res.EmpCode?.toLowerCase().includes(searchTextLower)||
          res.EmpName?.toLowerCase().includes(searchTextLower)||     
          res.Code?.toLowerCase().includes(searchTextLower)||   
          res.Name?.toLowerCase().includes(searchTextLower)||       
          res.Branch?.toLowerCase().includes(searchTextLower)||
          res.zoneDescription?.toLowerCase().includes(searchTextLower)||
          res.Department?.toLowerCase().includes(searchTextLower)||
          res.Designation?.toLowerCase().includes(searchTextLower), );
      }
  
  
    onpagechange(event: number): void {
      debugger
    this.pageIndex = event;
    this.OnVeiw();
  }
      OnSubmit(){
        this.pageIndex=1;
        this.totalCount=0;
         this.OnVeiw();
    }
  
      OnVeiw(){
        this.submitted = true;
        this.ngxUILoaderService.start();
        if (this.ExportExcel.invalid) {
          this.showError = true;
          this.ngxUILoaderService.stop();
           return;
        }
  
  
      const exportType = this.ExportExcel.value.ExportType;
  //const foreignTypes = [11, 12, 36, 37, 42,43];
  
  const payload = {
    ...this.ExportExcel.value,
   // ExportType: foreignTypes.includes(exportType) ? 2 : exportType, // ✅ override if in list
  
   ExportType:exportType, // ✅ override if in list
   pageIndex: this.pageIndex - 1,
    pageSize: this.pageSize
  };
  
  
  
  
      Object.keys(payload).forEach(key=>{
        if(payload[key]===null){
         payload[key]='';
      }
      })
     this.EmployeeListExcle=[];
        this.httpService.ViewEmployeeReportlist(payload).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.EmployeeList = res.data;
              this.totalCount=res.totalCount
              //console.log( this.totalCount)
              this.tableHeaders = Object.keys(res.data[0] ?? {});
              this.showEmployeeList = true  
  
             
              // this.toastrService.success(res.message)        
            } else {
              this.tableHeaders =[]
              this.EmployeeList =[]
              this.totalCount=0
             this.toastrService.info(res.message)
            }
            this.ngxUILoaderService.stop();
          },
          error: (error) => {
          this.ngxUILoaderService.stop();
            this.toastrService.error('Failed to retrieve employees', error);
          }
         
  
        });
      }
  
 
  
  //Employee report.....
   downloadExcel() {
       
     if (this.isExporting) return; // prevent double click
    this.isExporting = true;
  
    const payload = {
      ...this.ExportExcel.value,
      pageIndex: 0,
      pageSize: 10000
    };
  
    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });
      let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
        let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
        let {name : month,value}={...selectedMonth!}
  
        let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
        let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
        let {name : Year,value : Yearvalue}={...selectedYear!}
  
        let selectedReportId = this.ExportExcel.get('ExportType')?.value;
        let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
        let {name : Report,value : Reportvalue}={...selectedReport!}
  
        let ReportName =Report +'_'+ month+'_'+Year+'.xlsx';
  
    //added for contractor name
    // Find contractor name from CostCenter list
  let contractorName = '';
  if (payload.fk_costcentreid) {
    const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
    contractorName = selectedContractor ? selectedContractor.name : '';
  }
  // Add to formData for backend
  payload.contractorName = contractorName;
  
    
  
    this.httpService.downloadViewEmployeeReportlist(payload).subscribe({
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
