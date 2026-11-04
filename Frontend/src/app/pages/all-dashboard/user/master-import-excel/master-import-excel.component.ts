import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as XLSX from 'xlsx-js-style';
import { MasterImportService } from '../services/master-import.service';


@Component({
  selector: 'app-master-import-excel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectModule],
  templateUrl: './master-import-excel.component.html',
  styleUrls: ['./master-import-excel.component.scss']
})
export class MasterImportExcelComponent implements OnInit {
  importForm!: FormGroup;
  selectedFile: File | undefined;
  activeTab: string = 'success';

  // Results
  successList: any[] = [];
  failedList: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  successKeys: string[] = [];
  failedKeys: string[] = [];

  @ViewChild('fileInput')
fileInput!: ElementRef<HTMLInputElement>;
  masters = [
    { id: 'City', name: 'City Master' },
    { id: 'Designation', name: 'Designation Master' },
    { id: 'Department', name: 'Department Master' },
    { id: 'Location', name: 'Location Master' },
    { id: 'Client', name: 'Client Master' },
    { id: 'Outlet', name: 'Outlet Master' },
    { id: 'Branch', name: 'Branch Master' }





  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private loader: NgxUiLoaderService,
    private importService: MasterImportService
  ) { }

  ngOnInit(): void {
    this.importForm = this.fb.group({
      masterType: [null, Validators.required],
      file: [null, [Validators.required]]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.selectedFile = file;
        this.importForm.get('file')?.setValue(file);
        this.resetResults();
      } else {
        this.importForm.get('file')?.setErrors({ pattern: true });
        this.selectedFile = undefined;
      }
    }
  }

  downloadTemplate(): void {
    const masterType = this.importForm.get('masterType')?.value;
    if (!masterType) {
      this.toastrService.warning('Please select a Master Type first.');
      return;
    }

    let templateData: any[] = [];
    let fileName = '';

    switch (masterType) {
      case 'City':
        templateData = [['CityName', 'StateName', 'IsMetro']];
        fileName = 'City_Master_Template.xlsx';
        break;
      case 'Designation':
        templateData = [['Designation', 'LevelName', 'SeniorityLevel', 'Qualification', 'Remarks']];
        fileName = 'Designation_Master_Template.xlsx';
        break;
      case 'Department':
        templateData = [['Department', 'DeptCode', 'HodCode']];
        fileName = 'Department_Master_Template.xlsx';
        break;
      // case 'Location':
      //   templateData = [['LocName', 'OfficeType', 'Zone', 'CityName', 'ParentLocation', 'ContactPerson', 'Address', 'Email', 'Phone', 'Fax', 'Remarks', 'Latitude', 'Longitude', 'MachineID', 'Distance', 'BonusBasedOn', 'AttendanceSource', 'LoginAllow', 'DailyAttenAllow']];
      //   fileName = 'Location_Master_Template.xlsx';
      //   break;
       case 'Location':
        templateData = [['LocName', 'LocationCode' ,'OfficeType', 'Zone','StateName', 'CityName', 'ParentLocation', 'ContactPerson', 'Address', 'Email', 'Phone', 'Fax', 'Remarks', 'Latitude', 'Longitude', 'MachineID', 'Distance', 'BonusBasedOn', 'AttendanceSource', 'LoginAllow', 'DailyAttenAllow','AreaManager','AreaManagerEmail','RegionalManager','RegionalManagerEmail']];
       fileName = 'Location_Master_Template.xlsx';
        break;
      case 'Client':
        templateData = [['ClientCode', 'ClientName', 'EmpCodePrefix', 'Grouping', 'ContactPerson', 'EmailID', 'CINNo', 'TAN','GST','PAN', 'Address', 'CityName', 'StateName', 'ZoneName', 'Pincode', 'Phone', 'StartDate', 'EndDate', 'LeavePolicy', 'CommissionPercent', 'Service']];
        fileName = 'Client_Master_Template.xlsx';
        break;
      case 'Outlet':
        templateData = [['ClientName', 'OutletCode', 'OutletName', 'DealerCode', 'RetailType', 'Address', 'CityName', 'StateName', 'RegionName']];
        fileName = 'Outlet_Master_Template.xlsx';
        break;
      case 'Branch':
        templateData = [['BranchName', 'BranchheadCode','Address', 'PhoneNumber', 'CityName', 'StateName', 'RegionName']];
        fileName = 'Branch_Master_Template.xlsx';
        break;

    }

    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Apply Styles to Header (Row 1)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1'; // Header is row 1
      if (!ws[address]) continue;

      ws[address].s = {
        fill: {
          fgColor: { rgb: "4F81BD" } // Corporate Blue
        },
        font: {
          color: { rgb: "FFFFFF" }, // White
          bold: true,
          name: 'Arial',
          sz: 11
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
    }

    // Set Column Widths
    const wscols = [];
    for (let i = 0; i <= range.e.c; i++) {
      wscols.push({ wch: 20 }); // Set standard width
    }
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, fileName);
  }

  importData(): void {
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.toastrService.warning('Please select a valid Excel file.');
      return;
    }

    const masterType = this.importForm.get('masterType')?.value;
    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.loader.start();
    this.resetResults();

    let requestObservable;

    switch (masterType) {
      case 'City':
        requestObservable = this.importService.importCityMaster(formData);
        break;
      case 'Designation':
        requestObservable = this.importService.importDesignationMaster(formData);
        break;
      case 'Department':
        requestObservable = this.importService.importDepartmentMaster(formData);
        break;
      case 'Location':
        requestObservable = this.importService.importLocationMaster(formData);
        break;
      case 'Client':
        requestObservable = this.importService.importClientMaster(formData);
        break;
      case 'Outlet':
        requestObservable = this.importService.importOutletMaster(formData);
        break;
      case 'Branch':
        requestObservable = this.importService.importBranchMaster(formData);
        break;


    }

    if (requestObservable) {
      requestObservable.subscribe({
        next: (res: any) => {
          this.loader.stop();
          if (res.isSuccess) {
            this.successMessage = res.message;

            this.processResults(res.data, masterType);
            this.resetForm();
          } else {
            this.toastrService.error(res.message || 'Import failed.');
            this.resetForm();
          }
        },
        error: (err: any) => {
          this.loader.stop();
          this.resetForm();
          this.errorMessage = err.message || 'An error occurred during import.';
          this.toastrService.error('Import failed.');
        }
      });
    }
  }

  private processResults(resData: any[], masterType: string): void {
    this.successList = [];
    this.failedList = [];

    // The backend should return the original rows with 'Status' and 'Message'
    if (resData && resData.length > 0) {
      resData.forEach(row => {
        // We look for 'Status' exactly, assuming the backend uses 'Status' capitalization or similar.
        // It might be 'status' based on dynamic Dapper return, so we check both.
        const rowStatus = row.Status || row.status || '';

        if (rowStatus?.toLowerCase() === 'inserted') {
          this.successList.push(row);
        } else {
          this.failedList.push(row);
        }
      });

      if (this.successList.length > 0) {
        this.successKeys = Object.keys(this.successList[0]).filter(k => k.toLowerCase() !== 'status' && k.toLowerCase() !== 'message');
      }
      if (this.failedList.length > 0) {
        this.failedKeys = Object.keys(this.failedList[0]).filter(k => k.toLowerCase() !== 'status' && k.toLowerCase() !== 'message');
      }

      if (this.successList.length === 0 && this.failedList.length > 0) {
        this.activeTab = 'failed';
      } else {
        this.activeTab = 'success';
      }

      if (this.failedList.length > 0) {
        this.toastrService.warning(`Imported with some errors/duplicates.`);
      } else {
        this.toastrService.success(`All records imported successfully.`);
      }
    } else {
      this.toastrService.info('No any data inserted.');
    }
  }

  resetFile(): void {
    this.selectedFile = undefined;
    this.importForm.get('file')?.reset();
    this.resetResults();
  }

  resetResults(): void {
    this.successList = [];
    this.failedList = [];
    this.successKeys = [];
    this.failedKeys = [];
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Get keys from object for dynamic table columns
  getObjectKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj).filter(k => k.toLowerCase() !== 'status' && k.toLowerCase() !== 'message');
  }

 
resetForm() {
  this.selectedFile = undefined;

  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
}
}
