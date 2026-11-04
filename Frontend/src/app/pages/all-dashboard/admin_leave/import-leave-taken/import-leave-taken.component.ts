import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DropdownService } from '../../../../shared/services/dropdown.service';
import { ImportAttendancePunchService } from '../../payroll/services/import-attendance-punch.service';


@Component({
  selector: 'app-import-leave-taken',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './import-leave-taken.component.html',
  styleUrl: './import-leave-taken.component.scss'
})
export class ImportLeaveTakenComponent {


  importedData: any[] = []; // This will hold API response
    searchControl = new FormControl('');
    searchText = ''; // optional if you're still using it elsewhere
         // This holds all data
  filteredData: any[] = [];   
   isContractApplicable= false;     // This will be shown in the table

  
    LeaveTakenEmport!: FormGroup;
    selectedFile: File | undefined;
    constructor(private fb: FormBuilder, private httservice: ImportAttendancePunchService, private Loader:NgxUiLoaderService,
  private dropdownService: DropdownService
  
  
  ) {}
  
    ngOnInit(): void {
      this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;

     
      this.searchControl.valueChanges.subscribe(value => {
        this.searchText = value?.toLowerCase() || '';
        this.filterData();
      }); 
      this.LeaveTakenEmport = this.fb.group({
        file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]], 
      });
    }
  
    exportTemplate() {
      const headers = [
        "Empcode", "EmpName", "LeaveType", "FromDate", "ToDate ", "Totaldays","Remarks"
      ];
    
      const sampleRow = {
        Empcode: "E001",
        EmpName: "XYZ",
        LeaveType: "",
        FromDate: "",
        ToDate: "",
        Totaldays: 0,
        Remarks: ""      
    
      };
    
  
      // ✅ filter contractor column

  // ✅ build row based on finalHeaders
  const orderedRow = headers.reduce((acc: any, key: string) => {
    acc[key] = (sampleRow as any)[key] || '';
    return acc;
  }, {});
    
      const ws = XLSX.utils.json_to_sheet([orderedRow], { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Taken Template');
    
      // Export as .xlsx
      XLSX.writeFile(wb, 'LeaveTaken_Template.xlsx');
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
        this.LeaveTakenEmport.get('file')?.setValue(file); // Set value to form control
      } else {
        this.LeaveTakenEmport.get('file')?.setErrors({ pattern: true });
      }
    }
    
    onSubmit() {
      debugger
      if (this.LeaveTakenEmport.invalid) {
        this.LeaveTakenEmport.markAllAsTouched();
        return;
      }
      
      if(this.selectedFile)
      {
        const formData = new FormData();
        formData.append('file', this.selectedFile!, this.selectedFile!.name);
       
      
        
         this.Loader.start();
      this.httservice.uploadFileLeaveTaken(formData).subscribe({
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
