import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { circularformService } from '../../HRservices/circular-form-upload.service';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { map } from 'mathjs';

@Component({
  selector: 'app-circular',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,RouterLink,CommonModule,NgSelectModule],
  templateUrl: './circular.component.html',
  styleUrl: './circular.component.scss'
})
export class CircularComponent {


  selectedDepartment: string[] = [];
  showError=false;

  CircularFormsUploads!:FormGroup;
  ngxUILoaderService = inject(NgxUiLoaderService);

  // NewDepartment = [
  //   { name: '-- Select DepartmentType --', value: '' },
  //   { name: 'Human Resources', value: 'HR' }, 
  //   { name: 'Finance & Accounting', value: 'FA' },
  //   { name: 'Information Technology', value: 'IT' },
  //   { name: 'Marketing', value: 'MR' },
  //   { name: 'Sales', value: 'SL' },
  //   { name: 'Customer Service', value: 'CS' },
  //   { name: 'Research & Development ', value: 'RD' },
  //   { name: 'Operations & Production', value: 'OP' },
  //   { name: 'Logistics & Supply Chain', value: 'LSC' },
  //   { name: 'Administration', value: 'AD' }
  // ];

  NewDepartment: { name: string, value: string }[] = [];  // Corrected data structure


  FileType=[
    { name: '-- Select File Type --', value: '' },
    { name: 'Circulars', value: 'C' }, 
    { name: 'Forms', value: 'F' }
  ]

  Isedit:boolean=false;
  pk_UploadId!:number;

  constructor(private fb:FormBuilder,private httpservice:circularformService,private router:Router,private route: ActivatedRoute,private toastrService: ToastrService,private encryptionService:EncryptionService){}

  ngOnInit(){
    this.CircularFormsUploads=this.fb.group({
      CircularFormsNo:[null,[Validators.required]],
      CircularFormsName:[null,[Validators.required]],
      Description:[null,[Validators.required]],
      Department:[[]],
      fileType:[null,[Validators.required]],
      Dated:[null,[Validators.required]],
      Remarks:[null,],
       filename:[null],
      isActive:[null,],
      showAllCompony:[null,],

    })
    
    this.Departmentlist('Department')
    this.pk_UploadId=Number(this.encryptionService.decryptText(this.route.snapshot.params['pk_uploadId']))
         if (this.pk_UploadId && this.pk_UploadId) {
          this.get_UploadById(this.pk_UploadId);
          this.Isedit = true; 
    
   
  }}
  


  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedDepartment = [];
    } else {
      //this.selectedDepartment = this.NewDepartment.map(loc => loc.value);
      // ✅ ONLY THIS LINE CHANGED - Filter out null/empty values ANJALI 6 feb 2026
    this.selectedDepartment = this.NewDepartment
      .filter(dept => dept.value != null && dept.value != '') // ✅ ADD THIS LINE
      .map(loc => loc.value);
    }
    this.CircularFormsUploads.patchValue({ Department: this.selectedDepartment });
  }
  


  // isAllSelected(): boolean {
  //   return this.selectedDepartment.length === this.NewDepartment.length;
  // }
  isAllSelected(): boolean {
  // ✅ CHANGED - Compare with valid departments only
  const validDepts = this.NewDepartment.filter(d => d.value != null && d.value != '');
  return this.selectedDepartment.length === validDepts.length && validDepts.length > 0;
}
  
  
  getDepartmentDisplayText(): string {
    if (this.isAllSelected()) {
      return "All Selected";
    } 
    else if (this.selectedDepartment.length === 1) {
      
      return this.NewDepartment.find(item => item.value === this.selectedDepartment[0])?.name || "--Select Locations--";
    } 
    else if (this.selectedDepartment.length > 1) {

      const firstSelected = this.NewDepartment.find(item => item.value === this.selectedDepartment[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select Locations--";
    } 
    else {
      return "--Select Locations--";
    }
  }
  

  toggleLocation(location: string) {


      // ✅ ADD THIS CHECK at the start ANJALI 6 feb 2026
  if (!location || location === null || location === '') {
    return; // Don't process invalid values
  }
  //
    if (this.selectedDepartment.includes(location)) {
      this.selectedDepartment = this.selectedDepartment.filter(item => item !== location);
    } else {
      this.selectedDepartment.push(location);
    }
    this.CircularFormsUploads.patchValue({Department: this.selectedDepartment });
  }




  Departmentlist(fieldName: string) {

    this.ngxUILoaderService.start(); // Start loader before API call
  
    this.httpservice.CommonDropDown(fieldName).subscribe({
        next: (res) => {
            if (res.isSuccess && res.data) {
                this.NewDepartment = res.data
                //ANAJLI 6 FEB 2026 - ADDED FILTER TO EXCLUDE NULL/EMPTY VALUES FROM DEPARTMENT LIST
                          .filter((dept: any) => dept.value != null && dept.value != '') // ✅ ADD THIS LINE
//ANJLAI 6 FEB 2026 - MAP TO EXPECTED STRUCTURE
               .map((Department: any) => ({
                    name: Department.name,
                    value: Department.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
            this.ngxUILoaderService.stop(); // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");
            
        }
    });
  }


get_UploadById(uploadId: number): void {
  debugger
  this.ngxUILoaderService.start();

  this.httpservice.get_DocUploadById(uploadId).subscribe({
  next: (res) => {
    if (res?.data) {
      const doc = res.data.documenteData;

      this.CircularFormsUploads.patchValue({
        CircularFormsNo: doc.circularno,
        CircularFormsName: doc.circularname,
        Description: doc.description,
        fileType: doc.filetype,
        Dated: this.formatDateForInput(doc.dated),
        isActive: doc.active,
        showAllCompony: doc.isAllCompany,
        Remarks: doc.remarks,
        filename: doc.documentname

      });

      // Delay if departments may not be loaded yet
      setTimeout(() => {
        const selectedDepts = res.data.departmentList.map((d: any) => d.fk_deptid.toString());
        this.CircularFormsUploads.patchValue({ Department: selectedDepts});
        console.log('data load',selectedDepts)

      }, 300);
    } else {
      this.toastrService.error("No data found.");
    }
  },
  error: (err) => {
    console.error("Error loading document:", err);
    this.toastrService.error("Something went wrong.");
  },
  complete: () => {
    this.ngxUILoaderService.stop();
  }
});

}


formatDateForInput(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`; // output: 2025-05-15
}


  



Onsubmit(): void {
  if (this.CircularFormsUploads.invalid) {
    this.showError = true;
    return;
  }

  const formValue = this.CircularFormsUploads.value;
  const formData = new FormData();
  // ✅ Append Upload_Documents fields
  formData.append('circularno', formValue.CircularFormsNo);
  formData.append('circularname', formValue.CircularFormsName);
  formData.append('description', formValue.Description);
  formData.append('filetype', formValue.fileType);
  formData.append('dated', formValue.Dated);
  formData.append('active', formValue.isActive ?? false);
  formData.append('isAllCompany', formValue.showAllCompony ?? false);
  formData.append('remarks', formValue.Remarks ?? '');

   formData.append('SavedFileName', this.fileName);
  formData.append('contenttype', this.fileType);

  //  Append Upload_trn[] as multiple items
//   formValue.Department.forEach((deptId: string) => {
//   formData.append('fk_deptid', deptId); // no index, same key for multiple values
// });
 

  // NEW CODE: ANAJLI 6 FEB 2026 - VALIDATE AND APPEND ONLY NON-NULL/EMPTY DEPARTMENTS
  const validDepartments = formValue.Department.filter((id: string) => id != null && id != '');
  
  if (validDepartments.length === 0) {
    this.toastrService.error('Please select at least one department');
    return;
  }
  
  validDepartments.forEach((deptId: string) => {
    formData.append('fk_deptid', deptId);
  });
  
  //ANJALI 6 FEB 2026 - ADDED VALIDATION TO ENSURE AT LEAST ONE DEPARTMENT IS SELECTED AND NULL/EMPTY VALUES ARE NOT APPENDED

   //  Append conditionally only if editing
  if (this.Isedit) {
    formData.append('pk_uploadId', this.pk_UploadId.toString());
    formData.append('UpdAppChange', 'Y');
  } else {
    formData.append('pk_uploadId', '');
    formData.append('UpdAppChange', '');
  }

  // formData.append('pk_uploadId', this.Isedit ? this.pk_UploadId.toString() : '');
  // formData.append('UpdAppChange', 'Y');

  //  Append the file
   //  Append the file only if a new file was selected


 
  if (this.selectedFile) {
    formData.append('filename', this.selectedFile);
  }

  // if (this.fileName) {
  //   formData.append('file', this.fileName);
  // }
 

  // ✅ Send to API
  const apiCall = this.Isedit
    ? this.httpservice.update_DocUpload(formData)
    : this.httpservice.add_DocUpload(formData);

  apiCall.subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success(res.message);
        this.router.navigate(['/dash/hr/hrdashboard/Circular-Forms-Uploads_list']);
      } else {
        this.toastrService.error(res.message);
      }
    },
    error: () => {
      this.toastrService.error(`Something went wrong while ${this.Isedit ? 'updating' : 'adding'}!`);
    }
  });
}





fileName: string = '';
oldfile: string = '';
fileType: string = '';
selectedFile: File | null = null;



onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
   
    this.selectedFile = file;
    this.fileName = file.name;
    this.fileType = file.type;
     this.CircularFormsUploads.patchValue({
      filename: file.name
    });
  }
}


  
}
