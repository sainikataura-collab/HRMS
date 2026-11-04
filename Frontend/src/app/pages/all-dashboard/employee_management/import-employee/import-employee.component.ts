import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx-js-style';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { ImportAttendancePunchService } from '../../payroll/services/import-attendance-punch.service';
import * as FileSaver from 'file-saver';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CompanyParameterService } from '../../payroll/services/company-parameter.service';
import { DarclFactBoxComponent } from '../../vendor/shared/darcl-fact-box/darcl-fact-box.component';
import { UploadFileHistoryService } from '../../vendor/Service/upload-file-history.service';

@Component({
  selector: 'app-import-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DarclFactBoxComponent],
  templateUrl: './import-employee.component.html',
  styleUrl: './import-employee.component.scss'
})
export class ImportEmployeeComponent {
  importedData: any[] = []; // This will hold API response
  searchControl = new FormControl('');
  searchText = ''; // optional if you're still using it elsewhere
  filteredData: any[] = [];
  isContractApplicable = false;
  isVendorApplicable = false;
   isAutoEmpcode = false;
  Contractor_Applicable: boolean = false;
  Vendor_Applicable: boolean = false;
  showclientdetails: boolean = false;

  // This will be shown in the table
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  EmployeeEmport!: FormGroup;
  selectedFile: File | undefined;
  ngxUILoaderService = inject(NgxUiLoaderService);

  // --- Fact Box Properties ---
  isFactBoxOpen: boolean = true;
  factBoxFiles: any[] = [];
  pageIndexFactBox: number = 1;
  pageSizeFactBox: number = 5;
  totalUploadedFiles: number = 0;
  isLoadingFactBox: boolean = false;

  constructor(private fb: FormBuilder, private httpservice: ImportAttendancePunchService, private Loader: NgxUiLoaderService,
    private dropdownService: DropdownService,
    private toastr: ToastrService,
    private Service: CompanyParameterService,
    private toastrService: ToastrService,
    private uploadHistoryService: UploadFileHistoryService
  ) { }

  ngOnInit(): void {
    this.isContractApplicable = sessionStorage.getItem('ContractApplicable') == "true" ? true : false;
    this.isVendorApplicable = sessionStorage.getItem('vendor_Applicable') == "true" ? true : false;
   this.isAutoEmpcode = sessionStorage.getItem('isAutoEmpcode') == "true" ? true : false;
  
    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });
    this.EmployeeEmport = this.fb.group({
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]],
    });
    this.getCompanyById("1");
    this.loadFactBoxFiles();
  }

  // exportTemplate() {
  //   const headers = [
  //     "Empcode", "EmpName", "FatherName", "City", "LocationCode", "Location", "Department", "Designation",
  //     "Nature", "Grade", "ReportingManager", "HOD", "Bank", "AccountNo", "Ifsccode", "DOB", "DOJ",
  //     "PFApp", "ESIApp", "PensionApp", "VOLPFApp", "ProfTaxApp", "PANNo", "Email", "Gender", "Religion",
  //     "Category", "Paymode", "AdharcardNo", "ContractorName"
  //   ];

  //   const sampleRow = {
  //     Empcode: "E001",
  //     EmpName: "XYZ",
  //     FatherName: "",
  //     City: "",
  //     LocationCode: "",
  //     Location: "",
  //     Department: "",
  //     Designation: "",
  //     Nature: "",
  //     Grade: "",
  //     ReportingManager: "",
  //     HOD: "",
  //     Bank: "",
  //     AccountNo: "",
  //     Ifsccode: "",
  //     DOB: "15-08-1994",
  //     DOJ: "01-03-2023",
  //     PFApp: "No",
  //     ESIApp: "No",
  //     PensionApp: "No",
  //     VOLPFApp: "No",
  //     ProfTaxApp: "No",
  //     PANNo: "",
  //     Email: "",
  //     Gender: "",
  //     Religion: "",
  //     Category: "",
  //     Paymode: "Bank",
  //     AdharcardNo: "",
  //     ContractorName: ""
  //   };
  // //for removing  ContractorName added by pp
  //    const finalHeaders = this.isContractApplicable 
  //   ? headers 
  //   : headers.filter(h => h !== "ContractorName");

  //   // Convert data with headers order
  //   const orderedRow = finalHeaders.reduce((acc: any, key: string) => {
  //     acc[key] = (sampleRow as any)[key] || '';

  //     return acc;
  //   }, {});

  //   const ws = XLSX.utils.json_to_sheet([orderedRow], { header: headers });
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

  //   // Export as .xlsx
  //   XLSX.writeFile(wb, 'Employee_Template.xlsx');
  // }

  exportTemplate() {
    const headers = [
      "Empcode", "EmpName", "FatherName", "City", "LocationCode", "Location", "Department", "Designation",
      "Nature", "Grade", "DOB", "DOJ", "ClientName", "VendorName", "ServiceType", "BusinessVertical",
      "PFApp", "PFMaxLimitApp", "ESIApp", "PensionApp", "VOLPFApp", "ProfTaxApp", "Gender", "Religion", "Category", "ReportingManager", "HOD", "Bank", "AccountNo", "Ifsccode", "PANNo", "Email", "MobileNo",
      "Paymode", "AdharcardNo", "OutletCode"
    ];

    const sampleRow = {
      Empcode: "E001",
      EmpName: "XYZ",
      FatherName: "",
      City: "",
      LocationCode: "",
      Location: "",
      Department: "",
      Designation: "",
      Nature: "",
      Grade: "",
      ReportingManager: "",
      HOD: "",
      Bank: "",
      AccountNo: "",
      Ifsccode: "",
      DOB: "15-08-1994",
      DOJ: "01-03-2023",
      PFApp: "No",
      PFMaxLimitApp: "No",
      ESIApp: "No",
      PensionApp: "No",
      VOLPFApp: "No",
      ProfTaxApp: "No",
      PANNo: "",
      Email: "",
      MobileNo: "",
      Gender: "",
      Religion: "",
      Category: "",
      Paymode: "Bank",
      AdharcardNo: "",
      OutletCode: "",
      ClientName: "",
      VendorName: "",
      ServiceType: "",
      BusinessVertical: ""
    };

    //  filter contractor column
    // const finalHeaders = this.isContractApplicable 
    //   ? headers 
    //   : headers.filter(h => h !== "ContractorName");

    // let finalHeaders = [...headers];

    // if (!this.isContractApplicable) {
    //   finalHeaders = finalHeaders.filter(h => h !== 'ContractorName');
    // }

    // if (!this.isVendorApplicable) {
    //   finalHeaders = finalHeaders.filter(h => h !== 'VendorCode');
    // }

    // ✅ filter contractor column
    let finalHeaders = this.Contractor_Applicable
      ? headers
      : headers.filter(h => h !== "ContractorName");

    finalHeaders = this.Vendor_Applicable
      ? finalHeaders
      : finalHeaders.filter(h => h !== "VendorName");

      finalHeaders = this.isAutoEmpcode
      ? finalHeaders.filter(h => h !== "Empcode")
      : finalHeaders;

    finalHeaders = this.Vendor_Applicable
      ? finalHeaders
      : finalHeaders.filter(h => h !== "ServiceType");

    finalHeaders = this.Vendor_Applicable
      ? finalHeaders
      : finalHeaders.filter(h => h !== "BusinessVertical");

    finalHeaders = this.showclientdetails
      ? finalHeaders
      : finalHeaders.filter(h => h !== "OutletCode");


    //  build row based on finalHeaders
    const orderedRow = finalHeaders.reduce((acc: any, key: string) => {
      acc[key] = (sampleRow as any)[key] || '';
      return acc;
    }, {});

    //  also use finalHeaders here
    const ws = XLSX.utils.json_to_sheet([orderedRow], { header: finalHeaders });

    const empCodeIndex = finalHeaders.indexOf("Empcode");
    const categoryIndex = finalHeaders.indexOf("Category");

    finalHeaders.forEach((header, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        const isRed = colIdx >= empCodeIndex && (categoryIndex !== -1 ? colIdx <= categoryIndex : false);
        ws[cellRef].s = {
          fill: {
            fgColor: { rgb: isRed ? "FBDAD7" : "FFFFFF" }
          },
          font: {
            bold: true,
            color: { rgb: "000000" }
          }
        };
      }
    });

    ws['!cols'] = finalHeaders.map(header => ({ wch: Math.max((header?.length || 10) + 4, 14) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

    XLSX.writeFile(wb, 'Employee_Template.xlsx');
  }

  getCompanyById(pk_companyId: string): void {
    this.ngxUILoaderService.start();

    this.Service.getById_companyparameter(pk_companyId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const config = res.data.saL_Company_Config;

          this.Contractor_Applicable = config.contractor_Applicable;
          this.Vendor_Applicable = config.vendor_Applicable;
          this.showclientdetails = config.showclientdetails;
        } else {
          this.toastrService.error(
            res.message || 'Failed to load company details.'
          );
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('GetById Error:', err);
        this.toastrService.error('Something went wrong while loading data.');
        this.ngxUILoaderService.stop();
      },
    });
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded') {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData() {
    this.uploadedCount = this.importedData.filter(item => item.status === 'Updated').length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = item.status === 'Updated';
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = item.status !== 'Updated';
      }

      return matchesSearch && matchesStatus;
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.EmployeeEmport.get('file')?.setValue(file); // Set value to form control
    } else {
      this.EmployeeEmport.get('file')?.setErrors({ pattern: true });
    }
  }

  onSubmit() {
    debugger
    if (this.EmployeeEmport.invalid) {
      this.EmployeeEmport.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);



      this.Loader.start();
      this.httpservice.uploadFile(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.dropdownService.triggerLocationReload();
            this.dropdownService.triggerDepartmentReload();
            this.importedData = res.data;
            this.filterData();
            this.toastr.success(res.message);
          } else {
            this.toastr.error(res.message || 'Import failed');
          }
          this.Loader.stop();

          // Save upload history and refresh Fact Box
          if (this.selectedFile) {
            const resultPayload = res?.data ? res.data : { isSuccess: res?.isSuccess, message: res?.message || 'Import failed' };
            this.uploadHistoryService.saveUploadHistory(this.selectedFile, 'EMP_IMPORT', resultPayload).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording employee upload history:', e)
            });
          }
        },
        error: (err) => {
          console.error('Error fetching employee list:', err);
          this.Loader.stop();
          const msg = err?.error?.message || err?.message || 'Something went wrong';
          this.toastr.error(msg);
          if (this.selectedFile) {
            this.uploadHistoryService.saveUploadHistory(this.selectedFile, 'EMP_IMPORT', { isSuccess: false, message: msg }).subscribe({
              next: () => {
                this.pageIndexFactBox = 1;
                this.loadFactBoxFiles();
              },
              error: (e) => console.error('Error recording employee upload history:', e)
            });
          }
        }
      }

      );
    }

  }

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  loadFactBoxFiles(): void {
    this.isLoadingFactBox = true;
    this.uploadHistoryService.getUploadHistory('EMP_IMPORT', this.pageIndexFactBox, this.pageSizeFactBox).subscribe({
      next: (res: any) => {
        this.isLoadingFactBox = false;
        if (res && res.data) {
          this.factBoxFiles = res.data.list || [];
          this.totalUploadedFiles = res.data.totalCount || 0;
        } else {
          this.factBoxFiles = [];
          this.totalUploadedFiles = 0;
        }
      },
      error: (err: any) => {
        this.isLoadingFactBox = false;
        console.error('Error loading Fact Box files:', err);
      }
    });
  }

  onFactBoxPageChange(page: number): void {
    this.pageIndexFactBox = page;
    this.loadFactBoxFiles();
  }

  downloadFactBoxFile(file: any): void {
    const fileId = file.id || file.pk_id || file.fileId;
    const fileName = file.file_name || file.fileName || 'Employee_Import.xlsx';
    if (!fileId) return;

    this.Loader.start();
    this.uploadHistoryService.downloadFile(fileId).subscribe({
      next: (blob: Blob) => {
        this.Loader.stop();
        FileSaver.saveAs(blob, fileName);
      },
      error: (err: any) => {
        this.Loader.stop();
        console.error('Error downloading file from Fact Box:', err);
        this.toastr.error('Unable to download file.');
      }
    });
  }


  downloadExcel(): void {

    const exportData = this.filteredData.map((row: any) => ({
      Status: row.status,
      Empcode: row.empcode,
      EmpName: row.empName,
      FatherName: row.fatherName,
      City: row.city,
      LocationCode: row.locationCode,
      Location: row.location,
      Department: row.department,
      Designation: row.designation,
      Nature: row.nature,
      Grade: row.grade,
      ReportingManager: row.reportingManager,
      HOD: row.hod,
      Bank: row.bank,
      AccountNo: row.accountNo,
      Ifsccode: row.ifsccode,
      DOB: row.dobString,
      DOJ: row.dojString,
      PFApp: row.pfApp,
      ESIApp: row.esiApp,
      PensionApp: row.pensionApp,
      VOLPFApp: row.volpfApp,
      ProfTaxApp: row.profTaxApp,
      PANNo: row.panNo,
      Email: row.email,
      MobileNo: row.mobileNo,
      Gender: row.gender,
      Religion: row.religion,
      Category: row.category,
      Paymode: row.paymode,
      AdharCardNo: row.adharcardNo,
      OutletCode: row.outletCode,
      ContractorName: row.contractorName
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Employees': worksheet },
      SheetNames: ['Employees']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, 'Employee_List.xlsx');
  }





  // downloadExcel(): void {

  //   const exportData = this.filteredData.map((row: any) => ({
  //     Status: row.status,
  //     EmpCode: row.empcode,
  //     EmployeeName: row.empName,
  //     FatherName: row.fatherName,
  //     City: row.city,
  //     LocationCode: row.locationCode,
  //     Location: row.location,
  //     Department: row.department,
  //     Designation: row.designation,
  //     Nature: row.nature,
  //     Grade: row.grade,
  //     ReportingManager: row.reportingManager,
  //     HOD: row.hod,
  //     Bank: row.bank,
  //     AccountNo: row.accountNo,
  //     IFSCCode: row.ifsccode,
  //     DOB: row.dobString,
  //     DOJ: row.dojString,
  //     PFApplicable: row.pfApp,
  //     ESIApplicable: row.esiApp,
  //     PensionApplicable: row.pensionApp,
  //     VolPFApplicable: row.volpfApp,
  //     ProfTaxApplicable: row.profTaxApp,
  //     PANNo: row.panNo,
  //     Email: row.email,
  //     Gender: row.gender,
  //     Religion: row.religion,
  //     Category: row.category,
  //     PayMode: row.paymode,
  //     AdharCardNo: row.adharcardNo,
  //     ContractorName:row.contractorName
  //   }));

  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

  //   const workbook: XLSX.WorkBook = {
  //     Sheets: { 'Employees': worksheet },
  //     SheetNames: ['Employees']
  //   };

  //   const excelBuffer: any = XLSX.write(workbook, {
  //     bookType: 'xlsx',
  //     type: 'array'
  //   });

  //   const data: Blob = new Blob([excelBuffer], {
  //     type:
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  //   });

  //   FileSaver.saveAs(data, 'Employee_List.xlsx');
  // }
}