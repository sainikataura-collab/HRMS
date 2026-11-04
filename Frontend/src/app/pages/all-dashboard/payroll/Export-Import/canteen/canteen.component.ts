import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmployeeService } from '../../services/employee.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { LeaveTransactionService } from '../../services/leave-transaction.service';
@Component({
  selector: 'app-canteen',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './canteen.component.html',
  styleUrl: './canteen.component.scss'
})
export class CanteenComponent {
    isExporting = false;
ExportExcel!:FormGroup;
  searchText:string="";
  submitted=false;
  showError=false;
  showEmployeeList: boolean = false;
  isContractApplicable = false;
   //CostCenter = []
   CostCenter: { name: string; value: string | null }[] = [];
  EmployeeList:any[]=[]
  months=[]
  years=[]
  leavetypeddl: { name: string, value: string }[] = [];
  tableHeaders:string[]=[]
  showErroronProcess=false
  ExportTypelist=[
    //{name: '--select Grade --', Value:0},
    {name:'Daily Canteen  Report',value:1},
    {name:'Monthly Canteen  Report',value:2}

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
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.ExportExcel = this.fb.group({
      
      empCode: [''],
      fk_monthId:[null],
      fk_yearId:[null],
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
      fk_leaveid:[null],
      fromdate: [null],
      todate: [null],
      fk_costcentreid: [null],
    });

    // this.getMonthsList();
    // this.getyearsList();
    this.getLeavetype('Leave');
     this.getCostCenterList();
  }    

  getLeavetype(fieldName: string) {
    // this.ngxUILoaderService.start(); // Start loader before API call
    this.leaveTransactionService.getCommonDropdown(fieldName).subscribe({
        next: (res) => {
      this.leavetypeddl=res.data;
        },

    });
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

    getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data

      }
    })
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
         res.empcode?.toLowerCase().includes(searchTextLower)||
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

    //
  
       if(this.ExportExcel.value.fromdate == null)
        {
          this.toastrService.error('Please select from date', '');
          this.ngxUILoaderService.stop();
          return;
        }

      if(this.ExportExcel.value.todate == null)
        {
          this.toastrService.error('Please select to date','');
          this.ngxUILoaderService.stop();
          return;
        }

    //
    const payload=this.ExportExcel.value
    
  
    Object.keys(payload).forEach(key=>{
      if(payload[key]===null){
       payload[key]='';
    }
    })
  
      this.httpService.View_Canteenlist(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.EmployeeList = res.data;

            //aded new
             // 🔹 Filter headers to remove 'compname' for table display
        this.tableHeaders = Object.keys(res.data[0] ?? {}).filter(
          h => h.toLowerCase() !== 'compname' && h.toLowerCase() !== 'company name'
        );
           // this.tableHeaders = Object.keys(res.data[0] ?? {});
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
  //     // let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
  //     // let selectedMonth: {name: string, value: string} | undefined = this.months.find((m: {name: string, value: string}) => m.value === selectedMonthId);
  //     // let {name : month,value}={...selectedMonth!}

  //     // let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
  //     // let selectedYear: {name: string, value: string} | undefined = this.years.find((m: {name: string, value: string}) => m.value === selectedYearId);
  //     // let {name : Year,value : Yearvalue}={...selectedYear!}
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
        let selectedReportId = this.ExportExcel.get('ExportType')?.value;
      let selectedReport: {name: string, value: number} | undefined = this.ExportTypelist.find((m: {name: string, value: number}) => m.value === selectedReportId);
      let {name : Report,value : Reportvalue}={...selectedReport!}

      let ReportName =Report +'.xlsx';
     // console.log('reort', ReportName)

  const formData = { ...this.ExportExcel.value };
  //added for contractor name
  // Find contractor name from CostCenter list
let contractorName = '';
if (formData.fk_costcentreid) {
  const selectedContractor = this.CostCenter.find(c => c.value === formData.fk_costcentreid);
  contractorName = selectedContractor ? selectedContractor.name : '';
}
// Add to formData for backend
formData.contractorName = contractorName;

  Object.keys(formData).forEach(key => {
    if (formData[key] === null) {
      formData[key] = '';
    }
  });

  this.httpService.downloadViewCanteenReportlist(formData).subscribe({
    next: (res: Blob) => {
      const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
     // a.download = `Canteen_${new Date().toISOString().split('T')[0]}.xlsx`; // dynamic filename
     a.download = `${ReportName || 'Canteen'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.isExporting = false; // reset even on error
    },
    error: (err) => {
      console.error('Download failed', err);
      this.isExporting = false; // reset even on error
    }
  });
}

}
