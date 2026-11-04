import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpErrorResponse } from '@angular/common/http';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { EmployeeService } from '../../payroll/services/employee.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';

@Component({
  selector: 'app-billgeneration',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgSelectComponent, CommonSearchComponent, NgxPaginationModule, RouterLink],
  templateUrl: './billgeneration.component.html',
  styleUrl: './billgeneration.component.scss'
})
export class BillgenerationComponent {

  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  ExportExcel!: FormGroup;
  searchText: string = "";
  submitted = false;
  showError = false;
  showEmployeeList: boolean = false;
  EmployeeList: any[] = []
  isContractApplicable = false;
  months = []
  years = []
  CostCenter: { name: string; value: string | null }[] = [];
  State: { name: string; value: string | null }[] = [];
  isExporting = false;
  isSaving = false;
  tableHeaders: string[] = []

  // Summary properties
  editedEmployees: { [key: string]: any } = {};
  previewEmployeeList: any[] = [];
  isPreviewLoading = false;
  agencyChargePercent: number = 0;
  baseTotalCTC: number = 0;
  grandTotals: any = {};
  summaryCTC: number = 0;
  summaryBonus: number = 0;
  summaryTADA: number = 0;
  summaryIncentive: number = 0;
  summaryGratuity: number = 0;
  summaryTotal: number = 0;
  summaryAgencyCharges: number = 0;
  summarySubTotal: number = 0;
  summaryRecovery: number = 0;
  summaryFinalTotal: number = 0;
  summaryIGST: number = 0;
  summaryCGST: number = 0;
  summarySGST: number = 0;
  summaryGrandTotal: number = 0;
  igstPercent: number = 0;
  cgstPercent: number = 0;
  sgstPercent: number = 0;

  invoiceDetails: any = {};

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio,) { }
  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;
    this.ExportExcel = this.fb.group({
      empCode: [''],
      fk_monthId: [null, [Validators.required]],
      fk_yearId: [null, [Validators.required]],
      fk_costcentreid: [null, [Validators.required]],
      fk_stateId: [null],

      EmplyeeType: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      selectedDesignation: [''],
      selectedLocations: [[]],
      selectedNature: [''],
      selectedCity: [''],
      sortBy: [''],
      // ExportType: [null]
    });

    this.getMonthsList();
    this.getyearsList();
    this.getCostCenterList();
    this.getstateList();
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

  getstateList() {
    this.commanService.getCommanList('State').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.State = res.data

      }
    })
  }
  restfrom() {
    this.EmployeeList = [];
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
      res.EmpCode?.toLowerCase().includes(searchTextLower) ||
      res.EmpName?.toLowerCase().includes(searchTextLower) ||
      res.Code?.toLowerCase().includes(searchTextLower) ||
      res.Name?.toLowerCase().includes(searchTextLower) ||
      res.empcode?.toLowerCase().includes(searchTextLower) ||
      res.empname?.toLowerCase().includes(searchTextLower) ||
      res.Department?.toLowerCase().includes(searchTextLower) ||
      res.Designation?.toLowerCase().includes(searchTextLower),);
  }


  OnVeiw(pageIndex: number = 1) {
    this.submitted = true;

    if (this.ExportExcel.invalid) {
      this.showError = true;

      return;
    }

    this.ngxUILoaderService.start();
    const payload = this.ExportExcel.value

    payload.pageIndex = pageIndex;
    payload.pageSize = this.pageSize;
    this.pageIndex = pageIndex;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    })

    this.httpService.View_bill(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data || res.Data;
          this.totalCount = res.totalCount || res.TotalCount || 0;
          this.grandTotals = res.totals || res.Totals || {};
          this.baseTotalCTC = this.grandTotals.TotalCTC || res.totalCTC || res.TotalCTC || 0;
          this.invoiceDetails = res.invoiceDetails || res.InvoiceDetails || {};

          // Restore manual edits from previous pages
          this.EmployeeList.forEach(emp => {
            const empCode = emp.Empcode || emp.EmpCode;
            if (this.editedEmployees[empCode]) {
              Object.assign(emp, this.editedEmployees[empCode]);
            }
          });

          // Get dynamic Commission Percent from the first employee record
          this.agencyChargePercent = parseFloat(this.EmployeeList[0]?.CommissionPercent) || 0;
          this.igstPercent = parseFloat(this.EmployeeList[0]?.IGST) || 0;
          this.cgstPercent = parseFloat(this.EmployeeList[0]?.CGST) || 0;
          this.sgstPercent = parseFloat(this.EmployeeList[0]?.SGST) || 0;

          const excludedColumns = ['CommissionPercent', 'Insurance', 'Bonus', 'CTC_Including_Bonus', 'TADA', 'Incentive', 'Gratuity', 'Remarks', 'IGST', 'CGST', 'SGST'];
          this.tableHeaders = Object.keys(this.EmployeeList[0] ?? {}).filter(key => !excludedColumns.includes(key));
          this.calculateSummary();
          this.showEmployeeList = true
          this.toastrService.success(res.message)
        } else {
          this.tableHeaders = []
          this.EmployeeList = []
          this.totalCount = 0;
          this.toastrService.info(res.message)
        }
        this.ngxUILoaderService.stop();
      },
      error: (error) => {

        this.toastrService.error('Failed to retrieve employees', error);
      }


    });
  }
  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  getTotal(col: string) {
    if (col === 'Empcode' || col === 'empname' || col === 'paiddays') return '';
    if (col === 'Gross Salary' && (this.grandTotals.TotalGrossSalary !== undefined || this.grandTotals.totalGrossSalary !== undefined)) return (this.grandTotals.TotalGrossSalary ?? this.grandTotals.totalGrossSalary ?? 0).toFixed(2);
    if (col === 'PFEmpr (13%)' && (this.grandTotals.TotalPFEmpr !== undefined || this.grandTotals.totalPFEmpr !== undefined)) return (this.grandTotals.TotalPFEmpr ?? this.grandTotals.totalPFEmpr ?? 0).toFixed(2);
    if (col === 'Employer ESI@3.25%' && (this.grandTotals.TotalESIEmr !== undefined || this.grandTotals.totalESIEmr !== undefined)) return (this.grandTotals.TotalESIEmr ?? this.grandTotals.totalESIEmr ?? 0).toFixed(2);
    if (col === 'Welfare Fund' && (this.grandTotals.TotalLWFEmr !== undefined || this.grandTotals.totalLWFEmr !== undefined)) return (this.grandTotals.TotalLWFEmr ?? this.grandTotals.totalLWFEmr ?? 0).toFixed(2);
    if (col === 'Total Benefits' && (this.grandTotals.TotalBenefits !== undefined || this.grandTotals.totalBenefits !== undefined)) return (this.grandTotals.TotalBenefits ?? this.grandTotals.totalBenefits ?? 0).toFixed(2);
    if (col === 'CTC' && (this.grandTotals.TotalCTC !== undefined || this.grandTotals.totalCTC !== undefined)) return (this.grandTotals.TotalCTC ?? this.grandTotals.totalCTC ?? 0).toFixed(2);

    return this.EmployeeList.reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0).toFixed(2);
  }

  getTotalInput(col: string) {
    if (col === 'CTC_Including_Bonus') {
      const grandCTC = parseFloat(this.grandTotals.TotalCTC ?? this.grandTotals.totalCTC ?? 0) || 0;
      return (grandCTC + this.summaryBonus).toFixed(2);
    }
    // For manual inputs, calculate total across ALL pages from editedEmployees
    const allEdits = Object.values(this.editedEmployees);
    return allEdits.reduce((sum, item: any) => sum + (parseFloat(item[col]) || 0), 0).toFixed(2);
  }

  calculateSummary() {
    // 1. Calculate CTC including bonus for current page and track edits
    this.EmployeeList.forEach(item => {
      item.CTC_Including_Bonus = (parseFloat(item['CTC']) || 0) + (parseFloat(item.Bonus) || 0);

      const empCode = item.Empcode || item.EmpCode;
      if (item.Insurance || item.Bonus || item.TADA || item.Incentive || item.Gratuity || item.Remarks) {
        this.editedEmployees[empCode] = { ...item };
      } else if (this.editedEmployees[empCode]) {
        delete this.editedEmployees[empCode];
      }
    });

    // 2. Sum manual entries across ALL pages (using editedEmployees)
    const allEdits = Object.values(this.editedEmployees);
    this.summaryBonus = allEdits.reduce((sum, item: any) => sum + (parseFloat(item.Bonus) || 0), 0);
    this.summaryTADA = allEdits.reduce((sum, item: any) => sum + (parseFloat(item.TADA) || 0), 0);
    this.summaryIncentive = allEdits.reduce((sum, item: any) => sum + (parseFloat(item.Incentive) || 0), 0);
    this.summaryGratuity = allEdits.reduce((sum, item: any) => sum + (parseFloat(item.Gratuity) || 0), 0);

    // 3. Set CTC from backend TotalCTC
    this.summaryCTC = this.baseTotalCTC;

    this.summaryTotal = this.summaryCTC + this.summaryBonus + this.summaryTADA + this.summaryIncentive + this.summaryGratuity;
    this.summaryAgencyCharges = this.summaryTotal * (this.agencyChargePercent / 100);
    this.summarySubTotal = this.summaryTotal + this.summaryAgencyCharges;
    this.summaryFinalTotal = this.summarySubTotal - (this.summaryRecovery || 0);
    this.summaryIGST = this.summaryFinalTotal * (this.igstPercent / 100);
    this.summaryCGST = this.summaryFinalTotal * (this.cgstPercent / 100);
    this.summarySGST = this.summaryFinalTotal * (this.sgstPercent / 100);

    // Defaulting GrandTotal to include all GSTs dynamically.
    this.summaryGrandTotal = this.summaryFinalTotal + this.summaryIGST + this.summaryCGST + this.summarySGST;
  }

  onPageChange(event: number) {
    this.OnVeiw(event);
  }

  loadPreviewData() {
    this.isPreviewLoading = true;
    this.previewEmployeeList = [];
    const payload = this.ExportExcel.value;
    payload.pageIndex = 1;
    payload.pageSize = 1000000;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.httpService.View_bill(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          let list = res.data || res.Data || [];
          list.forEach((emp: any) => {
            const empCode = emp.Empcode || emp.EmpCode;
            if (this.editedEmployees[empCode]) {
              Object.assign(emp, this.editedEmployees[empCode]);
            }
          });
          this.previewEmployeeList = list;
          this.invoiceDetails = res.invoiceDetails || res.InvoiceDetails || {};
        } else {
          this.toastrService.info(res.message);
        }
        this.isPreviewLoading = false;
      },
      error: (error) => {
        this.toastrService.error('Failed to load preview');
        this.isPreviewLoading = false;
      }
    });
  }

  downloadExcel() {

    if (this.isExporting) return; // prevent double click
    this.isExporting = true;

    const payload = this.ExportExcel.value

    payload.pageIndex = 1;
    payload.pageSize = 1000000;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    })


    let selectedMonthId = this.ExportExcel.get('fk_monthId')?.value;
    let selectedMonth: { name: string, value: string } | undefined = this.months.find((m: { name: string, value: string }) => m.value === selectedMonthId);
    let { name: month, value } = { ...selectedMonth! }

    let selectedYearId = this.ExportExcel.get('fk_yearId')?.value;
    let selectedYear: { name: string, value: string } | undefined = this.years.find((m: { name: string, value: string }) => m.value === selectedYearId);
    let { name: Year, value: Yearvalue } = { ...selectedYear! }


    let ReportName = month + '_' + Year + '.xlsx';



    //added for contractor name
    // Find contractor name from CostCenter list
    let contractorName = '';
    if (payload.fk_costcentreid) {
      const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
      contractorName = selectedContractor ? selectedContractor.name : '';
    }
    // Add to formData for backend
    payload.contractorName = contractorName;



    this.httpService.downloadViewBillReportlist(payload).subscribe({
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





  onExportClick(): void {
    this.downloadExcel();
  }

  saveData() {
    this.isSaving = true;

    // Send all the edited employees from all pages, plus the current page employees to be safe
    const finalEmployeeList = Object.values(this.editedEmployees);
    // If the user hasn't edited anything on other pages, just send the current page (or empty, the SP handles it)
    this.EmployeeList.forEach(emp => {
      const empCode = emp.Empcode || emp.EmpCode;
      if (!this.editedEmployees[empCode]) {
        finalEmployeeList.push(emp);
      }
    });

    const payload = {
      ...this.ExportExcel.value,
      EmployeeList: finalEmployeeList,
      summaryCTC: this.summaryCTC,
      summaryBonus: this.summaryBonus,
      summaryTADA: this.summaryTADA,
      summaryIncentive: this.summaryIncentive,
      summaryGratuity: this.summaryGratuity,
      summaryTotal: this.summaryTotal,
      summaryAgencyCharges: this.summaryAgencyCharges,
      summarySubTotal: this.summarySubTotal,
      summaryRecovery: this.summaryRecovery,
      summaryFinalTotal: this.summaryFinalTotal,
      summaryIGST: this.summaryIGST,
      summaryCGST: this.summaryCGST,
      summarySGST: this.summarySGST,
      summaryGrandTotal: this.summaryGrandTotal
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.httpService.Save_bill(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message);
          this.router.navigate(['/dash/client_billing/client_billing_dashboard/billgeneration_list']);
        } else {
          this.toastrService.info(res.message);
        }
        this.isSaving = false;
      },
      error: (err: any) => {
        this.toastrService.error('Failed to save data');
        this.isSaving = false;
      }
    });
  }







}

