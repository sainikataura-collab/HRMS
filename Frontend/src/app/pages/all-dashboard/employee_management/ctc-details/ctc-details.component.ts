import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CTCService } from '../../../all-employee/performance/Service/ctc.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
//import * as XLSX from 'xlsx';
// Import change karo
import * as XLSX from 'xlsx-js-style';
import { ManualPunchBio } from '../../payroll/services/manual-puch-bio.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';

@Component({
  selector: 'app-ctc-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectComponent, ReactiveFormsModule, CommonSearchComponent],
  templateUrl: './ctc-details.component.html',
  styleUrl: './ctc-details.component.scss'
})
export class CtcDetailsComponent {

  ctcList: any[] = [];
  groupedEmployees: any[] = [];
  ctcGross: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  CostCenter = []
  isContractApplicable = false;
  isViewing = false;
  isExporting = false;
  isDownloading = false;
  EmployeeForm!: FormGroup;
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
    // <-- Added this to pass the stat click filter
  };
  constructor(
    private ctcService: CTCService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private fb: FormBuilder,
    private commanService: ManualPunchBio,


  ) { }

  ngOnInit(): void {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "false" ? false : true || false;

    this.EmployeeForm = this.fb.group({
    
      fk_costcentreid: [null],
    });

    this.getCostCenterList();

    // this.onSubmit();
  }

  onSubmit(): void {

    this.isViewing = true;

    this.loaderService.start();
    // const fk_costcenterid =
    //   this.EmployeeForm.get('fk_costcentreid')?.value ?? '';
      const filters = {
      ...this.employeeFilters,
      fk_costcentreid: this.EmployeeForm.get('fk_costcentreid')?.value ?? ''
    };
    this.ctcService.getAllCTCforAdmin(filters, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {

        this.isViewing = false;
        this.loaderService.stop();

        if (res.isSuccess) {

          this.ctcList = res.data.ctcList || [];
          this.ctcGross = res.data.ctcGross || [];
          // Group ctcList by fk_empid
          this.groupedEmployees = this.buildGroupedEmployees();
          this.totalItems = res.totalCount || this.ctcGross[0]?.TotalCount || this.ctcGross[0]?.totalCount || this.groupedEmployees.length;


        } else {

          this.ctcList = [];
          this.ctcGross = [];
          this.totalItems = 0;

          this.onReset();
          this.toastrService.warning(res.message || 'No CTC data found.');
        }
      },
      error: () => {

        this.isViewing = false;

        this.loaderService.stop();
        this.toastrService.error('Failed to load CTC details.');
      }
    });
  }

handleFilters(filters: any) {
  this.employeeFilters = {
   
    ...filters,   // <-- actually use what CommonSearchComponent sent
  };

  this.pageIndex = 1;
  this.onSubmit();   // no argument — onSubmit reads employeeFilters + form itself
}
  onPageChange(event: number): void {
    this.pageIndex = event;
    this.onSubmit();
  }

  filteredData(): any[] {
    if (!this.searchText) return this.ctcList;
    const text = this.searchText.toLowerCase();
    return this.ctcList.filter(item =>
      item.shortdesc?.toLowerCase().includes(text) ||
      item.amount?.toString().includes(text) ||
      item.amount_yearly?.toString().includes(text)
    );
  }

  getAllDataForExport(callback: (employees: any[]) => void, onError?: () => void): void {
    const filters = {
      ...this.employeeFilters,
      fk_costcentreid: this.EmployeeForm.get('fk_costcentreid')?.value ?? ''
    };

    // pageNo: 0, pageSize: 0 sends 0 to stored procedure, which returns ALL employees
    this.ctcService.getAllCTCforAdmin(filters, 0, 0).subscribe({
      next: (res) => {
        if (res && res.isSuccess) {
          const allCtcList = res.data?.ctcList || res.data?.CTCList || [];
          const allCtcGross = res.data?.ctcGross || res.data?.CTCGross || [];
          const allGrouped = this.buildGroupedEmployeesFromData(allCtcList, allCtcGross);
          if (allGrouped.length > 0) {
            callback(allGrouped);
          } else {
            callback(this.groupedEmployees);
          }
        } else {
          if (onError) onError();
          this.toastrService.error('Failed to fetch full data for export');
        }
      },
      error: () => {
        if (onError) onError();
        this.toastrService.error('Failed to fetch full data for export');
      }
    });
  }

  exportToExcel(): void {
    if (!this.groupedEmployees || this.groupedEmployees.length === 0) {
      this.toastrService.warning('No CTC data available to export');
      return;
    }

    this.isExporting = true;
    this.getAllDataForExport(
      (allEmployees) => {
        try {
          this.generateExcel(allEmployees);
        } finally {
          this.isExporting = false;
        }
      },
      () => {
        this.isExporting = false;
      }
    );
  }

  generateExcel(employees: any[]): void {
    const wsData: any[][] = [];
    const styleMap: { [cellRef: string]: any } = {};

    const styleRow = (rowIdx: number, colCount: number, style: any) => {
      for (let c = 0; c < colCount; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx, c });
        styleMap[cellRef] = style;
      }
    };

    // ── Header Row — 5 cols ab (Emp ID hata diya) ──
    wsData.push(['Emp Code', 'Employee Name', 'Component', 'Monthly (₹)', 'Yearly (₹)']);
    styleRow(0, 5, {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'CCCCCC' } } }
    });

    let currentRow = 1;

    for (const emp of employees) {

      // ── Employee Name Row ──
      wsData.push([emp.emp_code, emp.emp_name, '', '', '']);
      styleRow(currentRow, 5, {
        font: { bold: true, color: { rgb: '1e3a5f' } },
        fill: { fgColor: { rgb: 'DBEAFE' } },
        alignment: { vertical: 'center' }
      });
      currentRow++;

      // ── Component Rows ──
      for (const c of emp.components) {
        wsData.push(['', '', c.shortdesc, c.amount ?? 0, c.amount_yearly ?? 0]);
        styleRow(currentRow, 5, {
          font: { color: { rgb: '374151' } },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center' },
          border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
        });
        // Amount cols right-align
        [3, 4].forEach(ci => {
          const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: ci });
          styleMap[cellRef] = {
            font: { color: { rgb: '374151' } },
            fill: { fgColor: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'right', vertical: 'center' },
            numFmt: '#,##0.00'
          };
        });
        currentRow++;
      }

      // ── Total CTC Row ──
      wsData.push(['', '', 'Total CTC', emp.total_Month ?? 0, emp.total_Year ?? 0]);
      styleRow(currentRow, 5, {
        font: { bold: true, color: { rgb: '14532d' } },
        fill: { fgColor: { rgb: 'D1FAE5' } },
        alignment: { vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '6EE7B7' } },
          bottom: { style: 'thin', color: { rgb: '6EE7B7' } }
        }
      });
      [3, 4].forEach(ci => {
        const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: ci });
        styleMap[cellRef] = {
          font: { bold: true, color: { rgb: '14532d' } },
          fill: { fgColor: { rgb: 'D1FAE5' } },
          alignment: { horizontal: 'right', vertical: 'center' },
          numFmt: '#,##0.00',
          border: {
            top: { style: 'thin', color: { rgb: '6EE7B7' } },
            bottom: { style: 'thin', color: { rgb: '6EE7B7' } }
          }
        };
      });
      currentRow++;

      // ── Blank Separator ──
      wsData.push(['', '', '', '', '']);
      currentRow++;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // ── Apply styles ──
    for (const cellRef of Object.keys(styleMap)) {
      if (!worksheet[cellRef]) worksheet[cellRef] = { v: '', t: 's' };
      worksheet[cellRef].s = styleMap[cellRef];
    }

    // ── Column widths — 5 cols ──
    worksheet['!cols'] = [
      { wch: 14 }, // Emp Code
      { wch: 24 }, // Employee Name
      { wch: 30 }, // Component
      { wch: 18 }, // Monthly
      { wch: 18 }, // Yearly
    ];

    // ── Header Freeze — Row 1 fix rehegi scroll pe ──
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CTC Details');

    XLSX.writeFile(workbook, 'CTC_Details_All_Employees.xlsx');
    this.toastrService.success('Excel exported successfully with all employees!');
  }

  getCostCenterList() {
    this.commanService.getCommanList('CostCenter').subscribe({
      next: (res) => {
        res.data = res.data.slice(1);
        this.CostCenter = res.data;
      }
    });
  }

  buildGroupedEmployees(): any[] {
    return this.buildGroupedEmployeesFromData(this.ctcList, this.ctcGross);
  }

  buildGroupedEmployeesFromData(ctcList: any[], ctcGross: any[]): any[] {
    const map = new Map<string, any>();

    for (const item of ctcList) {
      if (!map.has(item.fk_empid)) {
        map.set(item.fk_empid, {
          fk_empid: item.fk_empid,
          emp_code: item.emp_code,
          emp_name: item.emp_name,
          expanded: false,
          components: []
        });
      }
      map.get(item.fk_empid).components.push(item);
    }

    // Attach gross totals from ctcGross
    for (const gross of ctcGross) {
      const emp = map.get(gross.fk_empid);
      if (emp) {
        emp.total_Month = gross.Total_Month;
        emp.total_Year = gross.Total_Year;
      }
    }

    return Array.from(map.values());
  }

  // Updated filteredData for grouped employees
  filteredGrouped(): any[] {
    if (!this.searchText) return this.groupedEmployees;
    const q = this.searchText.toLowerCase();
    return this.groupedEmployees.filter(e =>
      e.emp_name?.toLowerCase().includes(q) ||
      e.emp_code?.toLowerCase().includes(q) ||
      e.fk_empid?.toLowerCase().includes(q)
    );
  }

  getInitials(name: string): string {
    return (name || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  getTotalMonthlyAll(): number {
    return this.ctcGross.reduce((s, g) => s + (g.Total_Month ?? 0), 0);
  }
  getTotalYearlyAll(): number {
    return this.ctcGross.reduce((s, g) => s + (g.Total_Year ?? 0), 0);
  }
  onReset(): void {
    this.groupedEmployees = [];
    this.ctcList = [];
    this.ctcGross = [];
    // this.hasSearched = false;
    this.searchText = '';
    this.pageIndex = 1;
    this.totalItems = 0;
  }

  downloadSimple(): void {
    if (!this.groupedEmployees || this.groupedEmployees.length === 0) {
      this.toastrService.warning('No CTC data available to export');
      return;
    }

    this.isDownloading = true;
    this.getAllDataForExport(
      (allEmployees) => {
        try {
          this.generateSimpleExcel(allEmployees);
        } finally {
          this.isDownloading = false;
        }
      },
      () => {
        this.isDownloading = false;
      }
    );
  }

  generateSimpleExcel(employees: any[]): void {
    // ── Collect all unique component names across all employees ──
    const allComponents = new Set<string>();
    for (const emp of employees) {
      for (const c of emp.components) {
        allComponents.add(c.shortdesc);
      }
    }
    const componentCols = Array.from(allComponents);

    // ── Header Row ──
    const headers = ['Emp Code', 'Emp Name', ...componentCols, 'Per Month (₹)', 'Per Year (₹)'];
    const wsData: any[][] = [headers];
    const styleMap: { [cellRef: string]: any } = {};

    const totalCols = headers.length;

    // Style header
    for (let c = 0; c < totalCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      styleMap[cellRef] = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1D4ED8' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { bottom: { style: 'thin', color: { rgb: '93C5FD' } } }
      };
    }

    // ── Data Rows ──
    for (let ri = 0; ri < employees.length; ri++) {
      const emp = employees[ri];

      // Map component shortdesc → amount
      const compMap: { [key: string]: number } = {};
      for (const c of emp.components) {
        compMap[c.shortdesc] = c.amount ?? 0;
      }

      const row: any[] = [
        emp.emp_code,
        emp.emp_name,
        ...componentCols.map(col => compMap[col] ?? 0),
        emp.total_Month ?? 0,
        emp.total_Year ?? 0
      ];
      wsData.push(row);

      const excelRow = ri + 1; // 0 = header
      const isAlt = ri % 2 === 1;

      // Style all cells in this row
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: excelRow, c });
        styleMap[cellRef] = {
          font: { color: { rgb: '1F2937' } },
          fill: { fgColor: { rgb: isAlt ? 'F9FAFB' : 'FFFFFF' } },
          alignment: { vertical: 'center' },
          border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
        };
      }

      // Per Month col (green tint)
      const moCol = 2 + componentCols.length;
      const yrCol = moCol + 1;

      const moRef = XLSX.utils.encode_cell({ r: excelRow, c: moCol });
      styleMap[moRef] = {
        font: { bold: true, color: { rgb: '14532D' } },
        fill: { fgColor: { rgb: 'D1FAE5' } },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: '#,##0.00',
        border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
      };

      // Per Year col (yellow tint)
      const yrRef = XLSX.utils.encode_cell({ r: excelRow, c: yrCol });
      styleMap[yrRef] = {
        font: { bold: true, color: { rgb: '78350F' } },
        fill: { fgColor: { rgb: 'FEF9C3' } },
        alignment: { horizontal: 'right', vertical: 'center' },
        numFmt: '#,##0.00',
        border: { bottom: { style: 'hair', color: { rgb: 'E5E7EB' } } }
      };

      // Right-align numeric component cols
      for (let c = 2; c < moCol; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: excelRow, c });
        styleMap[cellRef] = {
          ...styleMap[cellRef],
          alignment: { horizontal: 'right', vertical: 'center' },
          numFmt: '#,##0.00'
        };
      }
    }

    // ── Build worksheet ──
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles
    for (const cellRef of Object.keys(styleMap)) {
      if (!worksheet[cellRef]) worksheet[cellRef] = { v: '', t: 's' };
      worksheet[cellRef].s = styleMap[cellRef];
    }

    // Column widths
    worksheet['!cols'] = [
      { wch: 12 },  // Emp Code
      { wch: 24 },  // Emp Name
      ...componentCols.map(() => ({ wch: 16 })),  // each component
      { wch: 16 },  // Per Month
      { wch: 16 },  // Per Year
    ];

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CTC Simple');
    XLSX.writeFile(workbook, 'CTC__Summary.xlsx');
    this.toastrService.success('Excel downloaded successfully with all employees!');
  }
}