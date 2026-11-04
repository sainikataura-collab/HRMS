import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { EmployeeService } from '../../services/employee.service';
import { LeaveTransactionService } from '../../services/leave-transaction.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-export-loan',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgSelectComponent,CommonSearchComponent], 
 
  templateUrl: './export-loan.component.html',
  styleUrl: './export-loan.component.scss'
})
export class ExportLoanComponent {
  ExportExcel!:FormGroup;
  searchText:string="";
  submitted=false;
  showError=false;
  showEmployeeList: boolean = false;
   CostCenter: { name: string; value: string | null }[] = [];
  EmployeeList:any[]=[]
  months=[]
  years=[]
  loanddl: { name: string, value: string }[] = [];
  tableHeaders:string[]=[]
  showErroronProcess=false
  isContractApplicable= false;
    isExporting = false;
  ExportTypelist=[
    //{name: '--select Grade --', Value:0},
    {name:'Loan Details',value:1},
    {name:'Paid Loan Details',value:2}, 
    {name:'Pending Loan Details',value:3},  
    // {name:'Pending Loan Detail',value:2}
    // {name:'Employee Increment Details',value:8},
  ]
  constructor(
    private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
     private ngxUILoaderService:NgxUiLoaderService,
    private commanService: ManualPunchBio,
  private leaveTransactionService:LeaveTransactionService) {}
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
      ExportType:[null,[Validators.required]],
      fk_loanid:[null],
      todate: [null,[Validators.required]],
      fromdate: [null,[Validators.required]]

    });

    // this.getMonthsList();
    // this.getyearsList();
    this.getLeavetype('Loan');
     this.getCostCenterList();
  }    

  getLeavetype(fieldName: string) {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveTransactionService.getCommonDropdown(fieldName).subscribe({
        next: (res) => {
          res.data = res.data.slice(1);
      this.loanddl=res.data;
        },

    });
    
  }

    getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data
        
      }
    })
  }
  // getMonthsList() {
  //   this.commanService.getCommanList('month').subscribe({
  //     next: (res) => {
  //       res.data = res.data.slice(1);
  //       this.months = res.data
        
  //     }
  //   })
  // }
  // getyearsList() {
  //   this.commanService.getCommanList('Year').subscribe({
  //     next: (res) => {
  //       res.data = res.data.slice(1);
  //       this.years = res.data
  //     }
  //   })
  // }
  
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


    OnVeiw(){
      
      this.submitted = true;
      this.ngxUILoaderService.start();
      if (this.ExportExcel.invalid) {
        this.showError = true;
        this.ngxUILoaderService.stop();
         return;
      }
  
    const payload=this.ExportExcel.value
    
  
    Object.keys(payload).forEach(key=>{
      if(payload[key]===null){
       payload[key]='';
    }
    })
  
      this.httpService.Export_Loanlist(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.EmployeeList = res.data;
            this.tableHeaders = Object.keys(res.data[0] ?? {});
            this.showEmployeeList = true   
            this.toastrService.success(res.message)        
          } else {
            this.tableHeaders =[]
            this.EmployeeList =[]
           this.toastrService.info(res.message)
          }
          this.ngxUILoaderService.stop();
        },
        error: (error) => {
         
          this.toastrService.error('Failed to retrieve employees', error);
        }
       

      });
    }


  //   downloadExcel(): void {

  //     let selectedReportId = this.ExportExcel.get('ExportType')?.value;
  //     let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
  //     let {name : Report,value : Reportvalue}={...selectedReport!}

  //     let ReportName =Report +'.xlsx';

  //     const tableElement = document.getElementById('exportTable');
    
  //     if (!tableElement) {
  //       console.error('Table element not found!');
  //       return;
  //     }
    
  //     try {
  //       // Convert the HTML table to a worksheet
  //       const worksheet = (window as any).XLSX.utils.table_to_sheet(tableElement);
    
  //       // Create a new workbook and append the worksheet
  //       const workbook = (window as any).XLSX.utils.book_new();
  //       (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
  //       // Write the workbook to an Excel file buffer
  //       const excelBuffer: any = (window as any).XLSX.write(workbook, {
  //         bookType: 'xlsx',
  //         type: 'array',
  //       });
    
  //       // Create a blob from the buffer
  //       const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
  //       // Save the Excel file with a custom name
  //       (window as any).saveAs(blob, ReportName);
  //     } catch (error) {
  //       console.error('Error exporting Excel:', error);
  //     }
  //   }

  downloadExcel() {
     
   if (this.isExporting) return; // prevent double click
  this.isExporting = true;

 const payload=this.ExportExcel.value
    
  
    Object.keys(payload).forEach(key=>{
      if(payload[key]===null){
       payload[key]='';
    }
    })
  
     let selectedReportId = this.ExportExcel.get('ExportType')?.value;
      let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
      let {name : Report,value : Reportvalue}={...selectedReport!}

      let ReportName =Report +'.xlsx';


  //added for contractor name
  // Find contractor name from CostCenter list
let contractorName = '';
if (payload.fk_costcentreid) {
  const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
  contractorName = selectedContractor ? selectedContractor.name : '';
}
// Add to formData for backend
payload.contractorName = contractorName;

  

  this.httpService.downloadViewLoanReportlist(payload).subscribe({
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