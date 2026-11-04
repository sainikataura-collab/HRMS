declare const html2pdf: any;
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CompensationService } from '../Service/compensation.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { forkJoin } from 'rxjs';
import { CommonSearchService } from '../../../all-dashboard/payroll/services/common-search.service';
import { EmployeeService } from '../../../all-dashboard/payroll/services/employee.service';
import { convertAmountToWordsIndian } from '../../../../healpers/commonlib';
import { CompanyParameterService } from '../../../all-dashboard/payroll/services/company-parameter.service';

@Component({
  selector: 'app-emp-salary-payout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgSelectModule, CommonSearchComponent, NgxPaginationModule],
  templateUrl: './emp-salary-payout.component.html',
  styleUrl: './emp-salary-payout.component.scss'
})
export class EmpSalaryPayoutComponent {
  combinedData:any[]=[];
  SalarypayoutForm!: FormGroup;
   SalaryslipForm!: FormGroup;
  submitted = false;
  isPdfVisible: boolean = true;
  Amountlist: any[] = []
  Employeelist: any[] = []
  years: any[] = [];
  months: any[] = [];
  FinancialYear: any[] = [];
  Incometaxlist1: any[] = [];
    Incometaxlist2: any[] = [];
  selectedTab: string = 'Salary Slip';
// Inside your component.ts
totalNetAmount = 0;
totalPFGross = 0;
totalPF = 0;
totalPFEmr = 0;
totalPFAmount = 0;
totalIncomeTax = 0;
//Salry Slip
salarySlipData:any[]=[]
showPayslip: boolean = false;
payColumns: { Fixed: string, Rate: string, Earnings: string, Arrears: string}[] = [];
dedColumns: { Fixed: string, Amount: string}[] = [];
LeaveList :any[]=[];

 companyLogo: String =
    'assets/Image/Logo/empower.jpg';
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private compensationService: CompensationService,
    private Loader: NgxUiLoaderService,
    private dropdownService: CommonSearchService,
     private httpService: EmployeeService,
      private service: CompanyParameterService

  ) { }

  ngOnInit() {
    this.SalarypayoutForm = this.fb.group({
      selectedMonth: [''],
      selectedYear: [''],
      selectedfinancialYear: ['']
    })

     this.SalaryslipForm = this.fb.group({
      fk_monthId: [''],
      fk_yearId: [''],
      ExportType: [100]
    })
    this.Loader.start();
    forkJoin([
      this.dropdownService.getEmp_CommonDdl('Month'),
      this.dropdownService.getEmp_CommonDdl('Year'),
      this.dropdownService.getEmp_CommonDdl('FinancialYear')
    ]).subscribe({
      next: ([monthsRes, yearsRes, financialYearres]) => {
        monthsRes.data = monthsRes.data.slice(1);
        this.months = monthsRes.data;
        yearsRes.data = yearsRes.data.slice(1);
        this.years = yearsRes.data;
        financialYearres.data = financialYearres.data.slice(1);
        this.FinancialYear = financialYearres.data;
        this.Loader.stop();
      },
      error: () => {
        this.toastrService.error("Failed to load data");
        this.Loader.stop();
      }
    });


  }
onTabClick(tab: string): void {
  this.selectedTab = tab;

}

  onSelectionChange(): void {
    const { selectedMonth, selectedYear, selectedfinancialYear } = this.SalarypayoutForm.value;
    if (selectedMonth && selectedYear) {
      this.getsalaryslip(selectedMonth, selectedYear);

    }
    if (selectedfinancialYear) {
      this.getincometaxlist(selectedfinancialYear);
    }
  }
  getsalaryslip(month: string, year: string): void {
    this.Loader.start();
    this.compensationService.getEmp_Payslip(month, year).subscribe({
      next: (res) => {
        this.Amountlist = res.data.list1 || [];
        this.Employeelist = res.data.list2 || [];
        this.Loader.stop();
      },
      error: (err) => {
        this.toastrService.error('Error fetching pay slip');
        this.Loader.stop();
      }
    });
  }

  getincometaxlist(fk_finid: string) {
    this.Loader.start();
    this.compensationService.getEmp_PFSavingIncomeTax(fk_finid).subscribe({
      next: (res) => {
        this.Incometaxlist1 = res.data.list1 || [];
         this.Incometaxlist2 = res.data.list1 || [];
           this.calculateTotals();
        this.Loader.stop();
      },
      error: (err) => {
        this.toastrService.error('Error fetching pay slip');
        this.Loader.stop();
      }
    });
  }
calculateTotals(): void {
  this.totalNetAmount = 0;
  this.totalPFGross = 0;
  this.totalPF = 0;
  this.totalPFEmr = 0;
  this.totalPFAmount = 0;
  this.totalIncomeTax = 0;

  this.Incometaxlist2.forEach((item: any) => {
    this.totalNetAmount += item.NetAmount || 0;
   // this.totalPFGross += item.PFGross || 0;
    this.totalPF += item.PF || 0;
    this.totalPFEmr += item.PFEmr || 0;
    this.totalPFAmount += item.PFAmount || 0;
    this.totalIncomeTax += item.IT || 0;
  });
}



downloadAndDisplaySalarySlip(): void {
  const fk_monthId = this.SalarypayoutForm.value.selectedMonth || '';
  const fk_yearId = this.SalarypayoutForm.value.selectedYear || '';

  if (!fk_monthId || !fk_yearId) {
    this.toastrService.warning('Please select Month and Year.');
    return;
  }

  this.Loader.start();
  this.compensationService.Download_SalarySlip_Pdf_ForEmployee(fk_monthId, fk_yearId).subscribe({
    next: (file: Blob) => {
      this.Loader.stop();
      if (!file || file.size === 0) {
        this.toastrService.info('No salary slip record found.');
        return;
      }
      const blob = new Blob([file], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalarySlip_${fk_monthId}_${fk_yearId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.toastrService.success('Salary slip downloaded successfully.');
    },
    error: (err) => {
      this.Loader.stop();
      console.error('Error downloading salary slip PDF:', err);
      if (err.status === 400 || err.status === 404) {
        this.toastrService.warning('No salary record found for selected month and year.');
      } else {
        this.toastrService.error('Failed to download salary slip PDF.');
      }
    }
  });

  /*
  // Existing frontend HTML-to-PDF generation commented out as requested:
  this.compensationService.Download_SalarySlip_ForEmployee(fk_monthId,fk_yearId).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.salarySlipData = res.data;
        this.loadCompanyLogo(
          this.salarySlipData?.[0]?.company_logopath
        );
        console.log('sddfff',this.salarySlipData)
        this.LeaveList = res.data[4] != null  ?  res.data[4]["LeaveList"] : [];
        this.salarySlipData[0].website = convertAmountToWordsIndian(this.salarySlipData[3]?.NetPay);
        this.payColumns =[];
        this.dedColumns =[];
        console.log(res.data[1])
        // For Earning
        for (let i = 1; i <= 15; i++) {
          if(res.data[1]["Pay"+i] != null && res.data[1]["Pay"+i] != "") {
            if(res.data[3]["PayAmt"+i]!=0) {
              var obj = {Fixed: res.data[1]["Pay"+i], Rate: res.data[3]["Pay"+i], Earnings: res.data[3]["PayAmt"+i], Arrears: res.data[3]["PayAmt"+i+"_A"]};
              this.payColumns.push(obj);
            }
          }
        }
        for (let i = 1; i <= 10; i++) {
          if(res.data[1]["PayR"+i] != null && res.data[1]["PayR"+i] != "") {
            if(res.data[3]["PayRAmt"+i]!=0) {
              var objR = {Fixed: res.data[1]["PayR"+i], Rate: res.data[3]["PayR"+i], Earnings: res.data[3]["PayRAmt"+i], Arrears: res.data[3]["PayRAmt"+i+"_A"]};
              this.payColumns.push(objR);
            }
          }
        }
        // For Deduction
        if(res.data[3]["PF"] != null && res.data[3]["PF"] != 0) {
          var objPF = {Fixed: "PF", Amount: res.data[3]["PF"]};
          this.dedColumns.push(objPF);
        }
        if(res.data[3]["VolPF"] != null && res.data[3]["VolPF"] != 0) {
          var objPF = {Fixed: "VolPF", Amount: res.data[3]["VolPF"]};
          this.dedColumns.push(objPF);
        }
        if(res.data[3]["ESI"] != null && res.data[3]["ESI"] != 0) {
          var objPF = {Fixed: "ESI", Amount: res.data[3]["ESI"]};
          this.dedColumns.push(objPF);
        }
        if(res.data[3]["ProfTax"] != null && res.data[3]["ProfTax"] != 0) {
          var objPF = {Fixed: "ProfTax", Amount: res.data[3]["ProfTax"]};
          this.dedColumns.push(objPF);
        }
        if(res.data[3]["IT"] != null && res.data[3]["IT"] != 0) {
          var objPF = {Fixed: "IT", Amount: res.data[3]["IT"]};
          this.dedColumns.push(objPF);
        }
        if(res.data[3]["LWF"] != null && res.data[3]["LWF"] != 0) {
          var objPF = {Fixed: "LWF", Amount: res.data[3]["LWF"]};
          this.dedColumns.push(objPF);
        }
        for (let i = 1; i <= 15; i++) {
          if(res.data[1]["PayD"+i] != null && res.data[1]["PayD"+i] != "") {
            if(res.data[3]["PayDAmt"+i]!=0) {
              var objDed = {Fixed: res.data[1]["PayD"+i], Amount: res.data[3]["PayDAmt"+i]};
              this.dedColumns.push(objDed);
            }
          }
        }
        for (let i = 1; i <= 15; i++) {
          if(res.data[1]["Loan"+i] != null && res.data[1]["Loan"+i] != "") {
            if(res.data[3]["LoanAmt"+i]!=0) {
              var objLoan = {Fixed: res.data[1]["Loan"+i], Amount: res.data[3]["LoanAmt"+i]};
              this.dedColumns.push(objLoan);
            }
          }
        }
        const maxLength = Math.max(this.payColumns.length, this.dedColumns.length);
        this.combinedData = Array(maxLength).fill({}).map((_, i) => ({
          pay: this.payColumns[i] || { Fixed: '', Rate: '', Earnings: '', Arrears: '' },
          ded: this.dedColumns[i] || { Fixed: '', Amount: '' }
        }));
        setTimeout(() => {
          this.downloadPDF();
          this.isPdfVisible = true;
        }, 500);
      } else {
        this.salarySlipData = [];
        this.toastrService.info("No record found");
      }
    },
    error: (err) => {
      console.error('Error downloading salary slip:', err);
    }
  });
  */
}
downloadpdf(): void {
   const fk_monthId= this.SalarypayoutForm.value.selectedMonth || ''
 const fk_yearId= this.SalarypayoutForm.value.selectedYear || ''
this.SalaryslipForm = this.fb.group({
      fk_monthId: [fk_monthId],
      fk_yearId: [fk_yearId],
      ExportType: [100]
    })
  const payload = {
    ...this.SalaryslipForm.value
    

  };

  // replace null with ''
  Object.keys(payload).forEach(key => {
    if (payload[key] === null) {
      payload[key] = '';
    }
  });

  this.compensationService.Export_pdf(payload).subscribe({
    next: (file: Blob) => {

      const blob = new Blob([file], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'TCCI.pdf'; // 👉 this is the filename shown in downloads
      a.click();

      window.URL.revokeObjectURL(url);
     
    },
   

  error: (error) => {
   
  

  if (error.status === 500) {
    this.toastrService.warning('Record not found');
  } else {
    this.toastrService.error('Failed to download PDF');
  }

}
  });
}



/*
// Existing frontend client-side downloadPDF commented out:
downloadPDF(): void {
  debugger
  this.showPayslip = true;

  setTimeout(() => {
    const element = document.getElementById('pdf-content');

    if (element) {
      window.scrollTo(0, 0); // Ensure top scroll (important for long pages)

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `SalarySlip_${this.salarySlipData[2]?.empcode || 'Employee'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { avoid: 'tr' }
      };

      html2pdf().set(opt).from(element).save();
    } else {
      this.toastrService.error("Could not find PDF content.");
    }
  }, 800); // Give Angular time to render HTML
}
*/

 loadCompanyLogo(filename: string) {

    // console.log('filename=', filename);

    if (!filename) {
      this.companyLogo =
        'assets/Image/Logo/empower.jpg';
      return;
    }

    this.service.getImage(filename)
      .subscribe({

        next: (blob) => {

        

          const reader =
            new FileReader();

          reader.onload = () => {

            

            this.companyLogo =
              reader.result as string;

          };

          reader.readAsDataURL(blob);

        },

        error: (err) => {

         

          this.companyLogo =
            'assets/Image/Logo/empower.jpg';

        }

      });

  }
}
