import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx-js-style';
import { ToastrService } from 'ngx-toastr';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { EmployeeProfileComponent } from '../employee-profile/employee-profile.component';
import { AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgxPaginationModule, CommonSearchComponent, NgSelectComponent, EmployeeProfileComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements AfterViewInit, OnDestroy {
  ngxUILoaderService = inject(NgxUiLoaderService);

  selectedEmpIdForModal: string | null = null;

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  employeeList: any[] = [];
  searchText: string = '';
  isContractApplicable = false;
  CostCenter: any[] = [];
  fk_costcentreid: string = '';
  private isFirstLoad: boolean = true;
  isSpinnerLoading: boolean = false;

  // Default filter structure
  employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    userId: '',
    empStatus: '',
    fk_costcentreid: '',
    statFilter: ''
  };

  setStatFilter(filterType: string) {
    if (this.employeeFilters.statFilter === filterType) {
      this.employeeFilters.statFilter = '';
    } else {
      this.employeeFilters.statFilter = filterType;
    }
    this.pageIndex = 1;
    this.getEmployee();
  }

  form!: FormGroup;
  constructor(
    private employeeMasterService: EmployeeMasterService,
    private router: Router,
    private toastrService: ToastrService,
    public encryptionService: EncryptionService,
    private commanService: ManualPunchBio,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.form = this.fb.group({
      role_id: [null],
      searchTerm: ['']
    });
    this.getCostCenterList();
  }

  ngAfterViewInit() {
    const modalElement = document.getElementById('employeeProfileModal');
    if (modalElement) {
      document.body.appendChild(modalElement);
    }
  }

  ngOnDestroy() {
    const modalElement = document.getElementById('employeeProfileModal');
    if (modalElement) {
      modalElement.remove();
    }
  }

  onContractorChange(event: any) {
    this.employeeFilters.fk_costcentreid = this.fk_costcentreid || '';
    this.pageIndex = 1;
    this.getEmployee();
  }

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.pageIndex = 1;
    this.GetAllList();
  }

  filteredData() {
    if (!this.searchText) return this.employeeList;

    const searchTextLower = this.searchText.toLowerCase();

    return this.employeeList.filter(emp =>
      emp.empname?.toLowerCase().includes(searchTextLower) ||
      emp.empcode?.toLowerCase().includes(searchTextLower) ||
      emp.locationName?.toLowerCase().includes(searchTextLower) ||
      emp.clientName?.toLowerCase().includes(searchTextLower) ||
      emp.vendorName?.toLowerCase().includes(searchTextLower) ||
      emp.desig?.toLowerCase().includes(searchTextLower) ||
      emp.depart?.toLowerCase().includes(searchTextLower) ||
      emp.bankName?.toLowerCase().includes(searchTextLower) ||
      emp.ifsccode?.toLowerCase().includes(searchTextLower) ||
      emp.bankaccountno?.toLowerCase().includes(searchTextLower) ||
      emp.panno?.toLowerCase().includes(searchTextLower) ||
      emp.adhaarNo?.toLowerCase().includes(searchTextLower) ||
      emp.mobileNo?.toLowerCase().includes(searchTextLower) ||
      emp.uanNo?.toLowerCase().includes(searchTextLower) ||
      emp.email?.toLowerCase().includes(searchTextLower)
    );
  }

  GetAllList() {
    const payload = this.form.value;

    Object.keys(payload).forEach(key => {
      if (payload[key] === null) {
        payload[key] = '';
      }
    });

    this.pageIndex = 1;
    this.getEmployee();
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getEmployee();
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data;
      }
    });
  }

  onSearchTextChanged() {
    const localFilteredData = this.filteredData();
    if (!this.searchText) {
      this.pageIndex = 1;
      this.form.get('searchTerm')?.setValue('');
      this.getEmployee();
    } else if (localFilteredData.length === 0) {
      this.pageIndex = 1;
      this.form.get('searchTerm')?.setValue(this.searchText);
      this.getEmployee();
    }
  }

  isUpdate(pk_empid: string) {
    this.router.navigateByUrl("/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/" + pk_empid);
  }

  exportToExcel(): void {
    this.employeeMasterService.DownloadExcel(this.employeeFilters).subscribe(res => {
      if (res.isSuccess && res.data.length > 0) {
        const excludedColumns = ['cid', 'pk_empid', 'manualempcode', '', 'fk_LocID', 'fk_companyId', 'fk_UserID', 'isActive', 'fk_insUserID', 'fk_updUserID', 'fk_insDateID', 'fk_updDateID', 'timestamp', 'fk_locId', 'fk_InsuserId', 'fk_updUserId', 'isCActive'];
        const columnMappings: Record<string, string> = {
          empcode: 'Code',
          empname: 'Name',
          locationName: 'Location',
          clientName: 'Client',
          vendorName: 'Vendor',
          desig: 'Designation',
          depart: 'Department',
          bankName: 'Bank Name',
          ifsccode: 'IFSC Code',
          bankaccountno: 'A/C No',
          adhaarNo: 'Aadhaar No',
          panno: 'PAN No',
          mobileNo: 'Mobile No',
          uanNo: 'UAN No',
          email: 'Email'
        };

        const filteredData = res.data.map((item: Record<string, any>) => {
          return Object.keys(item)
            .filter(key => !excludedColumns.includes(key))
            .reduce((obj: Record<string, any>, key: string) => {
              obj[columnMappings[key] || key] = item[key];
              return obj;
            }, {});
        });

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

        const colWidths = Object.keys(filteredData[0] || {}).map(key => {
          const max_width = filteredData.reduce((w: number, r: any) => Math.max(w, r[key] ? r[key].toString().length : 0), key.length);
          return { wch: max_width + 2 };
        });
        worksheet['!cols'] = colWidths;

        const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ c: C, r: 0 });
          if (!worksheet[address]) continue;
          worksheet[address].s = {
            fill: {
              fgColor: { rgb: "E2EFDA" }
            },
            font: {
              bold: true,
              color: { rgb: "000000" }
            },
            border: {
              top: { style: 'thin', color: { rgb: "000000" } },
              bottom: { style: 'thin', color: { rgb: "000000" } },
              left: { style: 'thin', color: { rgb: "000000" } },
              right: { style: 'thin', color: { rgb: "000000" } }
            }
          };
        }
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'EmployeeMaster');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const fileName = 'EmployeeMasterList.xlsx';
        const link = document.createElement('a');
        link.href = URL.createObjectURL(data);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        this.toastrService.warning('No data available to export');
      }
    });
  }

  stats: any = null;

  getEmployee(): void {
    if (this.isFirstLoad) {
      this.ngxUILoaderService.start();
    } else {
      this.isSpinnerLoading = true;
    }
    const searchTerm = this.form.get('searchTerm')?.value || null;

    this.employeeMasterService.get_employee(this.pageIndex - 1, this.pageSize, searchTerm, this.employeeFilters).subscribe({
      next: (res) => {
        if (this.isFirstLoad) {
          this.ngxUILoaderService.stop();
        } else {
          this.isSpinnerLoading = false;
        }

        if (res.isSuccess) {
          this.employeeList = res.data;
          this.totalItems = res.totalCount;
          this.stats = res.dataObj;

          if (this.isFirstLoad) {
            this.toastrService.success(res.message);
            this.isFirstLoad = false;
          }
        } else {
          this.employeeList = [];
          this.totalItems = 0;
          this.stats = null;
          this.toastrService.error(res.message, 'Error');
          this.isFirstLoad = false;
        }
      },
      error: (error) => {
        if (this.isFirstLoad) {
          this.ngxUILoaderService.stop();
          this.isFirstLoad = false;
        } else {
          this.isSpinnerLoading = false;
        }

        this.employeeList = [];
        this.totalItems = 0;
        this.toastrService.error('Failed to retrieve employees', 'Error');
      }
    });
  }
}
