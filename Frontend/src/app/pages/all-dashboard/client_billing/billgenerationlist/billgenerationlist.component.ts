import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { EmployeeService } from '../../payroll/services/employee.service';

@Component({
  selector: 'app-billgenerationlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectComponent, NgxPaginationModule,RouterLink],
  templateUrl: './billgenerationlist.component.html',
  styleUrl: './billgenerationlist.component.scss'
})
export class BillgenerationlistComponent implements OnInit {
  pageIndex: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  filterForm!: FormGroup;
  searchText: string = "";
  submitted = false;
  showError = false;
  showList: boolean = false;
  isViewing: boolean = false;
  billList: any[] = [];
  
  isContractApplicable = false;
  months: any[] = [];
  years: any[] = [];
  CostCenter: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpService: EmployeeService,
    private ngxUILoaderService: NgxUiLoaderService,
    private commanService: ManualPunchBio
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;
    this.filterForm = this.fb.group({
      fk_monthId: [null],
      fk_yearId: [null],
      fk_costcentreid: [null],
    });

    this.getMonthsList();
    this.getyearsList();
    if (this.isContractApplicable) {
      this.getCostCenterList();
    } else {
        this.getCostCenterList();
    }
    this.onView();
  }

  navigateToAdd() {
    this.router.navigate(['/dash/client_billing/client_billing_dashboard/billgeneration']);
  }

  getMonthsList() {
    this.commanService.getCommanList('month').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.months = res.data;
      }
    });
  }

  getyearsList() {
    this.commanService.getCommanList('Year').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.years = res.data;
      }
    });
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data;
      }
    });
  }

  filteredData() {
    if (!this.searchText) {
      return this.billList;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.billList.filter(res =>
      res.EmpName?.toLowerCase().includes(searchTextLower) ||
      res.EmpCode?.toLowerCase().includes(searchTextLower) 
  
    );
  }

  onView(pageIndex: number = 1) {
    if (this.isViewing) return;
    this.submitted = true;

    this.isViewing = true;
    this.ngxUILoaderService.start();
    const payload = this.filterForm.value;
    payload.pageIndex = pageIndex;
    payload.pageSize = this.pageSize;
    this.pageIndex = pageIndex;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    if(typeof (this.httpService as any).getBillGenerationList === 'function') {
      (this.httpService as any).getBillGenerationList(payload).subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            this.billList = res.data || res.Data || [];
            this.totalCount = res.totalCount || res.TotalCount || this.billList.length;
            this.showList = true;
            this.toastrService.success(res.message);
          } else {
            this.billList = [];
            this.totalCount = 0;
            this.toastrService.info(res.message);
          }
          this.ngxUILoaderService.stop();
          this.isViewing = false;
        },
        error: (err: any) => {
          this.toastrService.error('Failed to retrieve list');
          this.ngxUILoaderService.stop();
          this.isViewing = false;
        }
      });
    } else {
        setTimeout(() => {
          this.ngxUILoaderService.stop();
          this.isViewing = false;
          this.billList = [];
          this.showList = true;
          this.toastrService.info("No records found (API pending connection).");
        }, 500);
    }
  }

  onPageChange(event: number) {
    this.onView(event);
  }

  isExporting = false;
  ispdfExporting = false;
  
  onExportExcel() {
    if (this.isExporting) return;
    
    this.submitted = true;

    this.isExporting = true;
    this.ngxUILoaderService.start();
    
    const payload = this.filterForm.value;
    payload.pageIndex = 1;
    payload.pageSize = 1000000; // fetch all

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    let contractorName = '';
    if (payload.fk_costcentreid) {
      const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
      contractorName = selectedContractor ? selectedContractor.name : '';
    }
    payload.contractorName = contractorName;

    if(typeof (this.httpService as any).downloadBillGenerationExcel === 'function') {
      (this.httpService as any).downloadBillGenerationExcel(payload).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `BillGeneration_List_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.isExporting = false;
          this.ngxUILoaderService.stop();
        },
        error: (err: any) => {
          this.toastrService.error('Failed to download Excel');
          this.isExporting = false;
          this.ngxUILoaderService.stop();
        }
      });
    } else {
      this.isExporting = false;
      this.ngxUILoaderService.stop();
      this.toastrService.info("Excel Download API not connected yet.");
    }
  }

  onExportPDF() {
    if (this.ispdfExporting) return;
    
    this.submitted = true;

    this.ispdfExporting = true;
    this.ngxUILoaderService.start();
    
    const payload = this.filterForm.value;
    payload.pageIndex = 1;
    payload.pageSize = 1000000;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    let contractorName = '';
    if (payload.fk_costcentreid) {
      const selectedContractor = this.CostCenter.find(c => c.value === payload.fk_costcentreid);
      contractorName = selectedContractor ? selectedContractor.name : '';
    }
    payload.contractorName = contractorName;

    if(typeof (this.httpService as any).downloadBillGenerationPDF === 'function') {
      (this.httpService as any).downloadBillGenerationPDF(payload).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `BillGeneration_List_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.ispdfExporting = false;
          this.ngxUILoaderService.stop();
        },
        error: (err: any) => {
          this.toastrService.error('Failed to download PDF');
          this.ispdfExporting = false;
          this.ngxUILoaderService.stop();
        }
      });
    } else {
      this.ispdfExporting = false;
      this.ngxUILoaderService.stop();
      this.toastrService.info("PDF Download API not connected yet.");
    }
  }

  onExportRowExcel(item: any) {
    this.ngxUILoaderService.start();
    const payload = {
      fk_monthId: item.MonthId || item.monthId || '',
      fk_yearId: item.YearId || item.yearId || '',
      fk_costcentreid: item.CostCenterId || item.costCenterId || '',
      contractorName: item.Client || item.client || '',
      pageIndex: 1,
      pageSize: 1000000
    };

    if(typeof (this.httpService as any).downloadBillGenerationExcel === 'function') {
      (this.httpService as any).downloadBillGenerationExcel(payload).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Bill_${item.InvoiceNo || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.ngxUILoaderService.stop();
        },
        error: (err: any) => {
          this.toastrService.error('Failed to download Excel');
          this.ngxUILoaderService.stop();
        }
      });
    } else {
      this.ngxUILoaderService.stop();
    }
  }

  onExportRowPDF(item: any) {
    this.ngxUILoaderService.start();
    const payload = {
      fk_monthId: item.MonthId || item.monthId || '',
      fk_yearId: item.YearId || item.yearId || '',
      fk_costcentreid: item.CostCenterId || item.costCenterId || '',
      contractorName: item.Client || item.client || '',
      pageIndex: 1,
      pageSize: 1000000
    };

    if(typeof (this.httpService as any).downloadBillGenerationPDF === 'function') {
      (this.httpService as any).downloadBillGenerationPDF(payload).subscribe({
        next: (res: Blob) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Bill_${item.InvoiceNo || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.ngxUILoaderService.stop();
        },
        error: (err: any) => {
          this.toastrService.error('Failed to download PDF');
          this.ngxUILoaderService.stop();
        }
      });
    } else {
      this.ngxUILoaderService.stop();
    }
  }
}
