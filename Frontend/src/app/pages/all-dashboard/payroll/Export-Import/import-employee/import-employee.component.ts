import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ImportAttendancePunchService } from '../../services/import-attendance-punch.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { CompanyParameterService } from '../../services/company-parameter.service';

@Component({
  selector: 'app-import-employee',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './import-employee.component.html',
  styleUrl: './import-employee.component.scss'
})
export class ImportEmployeeComponent {
  importedData: any[] = []; // This will hold API response
  searchControl = new FormControl('');
  searchText = ''; // optional if you're still using it elsewhere
       // This holds all data
filteredData: any[] = [];   
 isContractApplicable= false;     // This will be shown in the table

  EmployeeEmport!: FormGroup;
  selectedFile: File | undefined;
  toastrService: any;
  ngxUILoaderService: any;
  Contractor_Applicable : boolean=false;
  Vendor_Applicable : boolean=false;
  showclientdetails : boolean=false;


  constructor
  (
private fb: FormBuilder, private httpservice: ImportAttendancePunchService, private Loader:NgxUiLoaderService,
private dropdownService: DropdownService,  private Service: CompanyParameterService
) {}

  ngOnInit(): void {
   this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? false:false;
 
   this.getCompanyById(""); 

    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    }); 
    this.EmployeeEmport = this.fb.group({
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]], 
    });



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
    "Nature", "Grade", "ReportingManager", "HOD", "Bank", "AccountNo", "Ifsccode", "DOB", "DOJ",
    "PFApp", "ESIApp", "PensionApp", "VOLPFApp", "ProfTaxApp", "PANNo", "Email", "Gender", "Religion",
    "Category", "Paymode", "AdharcardNo", "ContractorName", "OutletCode", "VendorName", "ServiceType","BusinessVertical"
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
    ESIApp: "No",
    PensionApp: "No",
    VOLPFApp: "No",
    ProfTaxApp: "No",
    PANNo: "",
    Email: "",
    Gender: "",
    Religion: "",
    Category: "",
    Paymode: "Bank",
    AdharcardNo: "",
    ContractorName: "",
    OutletCode: "",
    ServiceType: "",
    BusinessVertical: "",

  };

  // ✅ filter contractor column
  let finalHeaders = this.Contractor_Applicable 
    ? headers 
    : headers.filter(h => h !== "ContractorName");

finalHeaders = this.Vendor_Applicable 
    ? finalHeaders 
    : finalHeaders.filter(h => h !== "VendorName");

    finalHeaders = this.Vendor_Applicable 
    ? finalHeaders 
    : finalHeaders.filter(h => h !== "ServiceType");

    finalHeaders = this.Vendor_Applicable 
    ? finalHeaders 
    : finalHeaders.filter(h => h !== "BusinessVertical");

    finalHeaders = this.showclientdetails 
    ? finalHeaders 
    : finalHeaders.filter(h => h !== "OutletCode");


  // ✅ build row based on finalHeaders
  const orderedRow = finalHeaders.reduce((acc: any, key: string) => {
    acc[key] = (sampleRow as any)[key] || '';
    return acc;
  }, {});

  // ✅ also use finalHeaders here
  const ws = XLSX.utils.json_to_sheet([orderedRow], { header: finalHeaders });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

  XLSX.writeFile(wb, 'Employee_Template.xlsx');
}

  filterData() {
    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      )
    );
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
  getCompanyById(pk_companyId: string): void {
    this.ngxUILoaderService.start();

    this.Service.getById_companyparameter(pk_companyId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const config = res.data.saL_Company_Config;

          this.Contractor_Applicable= config.contractor_Applicable;
            this.Vendor_Applicable=config.vendor_Applicable;
            this.showclientdetails=config.showclientdetails;
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


  onSubmit() {
    debugger
    if (this.EmployeeEmport.invalid) {
      this.EmployeeEmport.markAllAsTouched();
      return;
    }
    
    if(this.selectedFile)
    {
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);
     
    
      
      this.Loader.start();
    this.httpservice.uploadFile(formData).subscribe({
      next:(res)=>{
        this.Loader.stop()
        this.dropdownService.triggerLocationReload();
        this.dropdownService.triggerDepartmentReload();
       this.importedData=res.data
       this.filterData();
      },
      error: (err) => {
        console.error('Error fetching employee list:', err);
        
        this.Loader.stop();
        alert(err);
      }
    }
     
    );
  }
  
}
}