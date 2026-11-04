import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SectionDocService } from '../../../services/sectiondoc.service';


@Component({
  selector: 'app-section-doc-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule,RouterLink,CommonSearchComponent],
  templateUrl: './section-doc-status.component.html',
  styleUrl: './section-doc-status.component.scss'
})
export class SectionDocStatusComponent {
  previewImageUrl: string = '';
downloadUrl: string = '';
isImageType: boolean = false;

 SectionDocForm!: FormGroup;
 showError=false;
 EmployeeList: { name: string; value: string }[] = [];
 Subseclist: { name: string; value: string }[] = [];
 seclist: { name: string; value: string }[] = [];
 fileToUpload: File | null = null;
 DocumentStatus = [
   { name: 'Undertaking', value: 'U' },
   { name: 'Submited', value: 'Y' },
   
 ];
 
 searchText: string = '';
 fk_empid!: string;
 submitted=false;
 Isedit=false;
 ngxUILoaderService = inject(NgxUiLoaderService);
 pk_docid: string ='';
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
 };
 
 
 
   constructor(private fb: FormBuilder,private Service:SectionDocService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
   ngOnInit() {
   
    this.SectionDocForm= this.fb.group({
    fk_empid: ['' ,Validators.required],
    empname: [''], 
    designation: [''],
    dept: [''],
    fk_secid:['',Validators.required],
    fk_subsecid:[''],
    docsub_status:['' ,Validators.required],
    submitdate:['' ,Validators.required],
    docsub_Amt:['' ,Validators.required],
    billno:[''],
    billdate:[''],
    remarks: [''],
    Ifilename:['']
    
     });
     //basis of secid get subsecid
     this.SectionDocForm.get('fk_secid')?.valueChanges.subscribe(value => {
      console.log('Section changed:', value);
      //this.onSectionChange(value); // 👉 your custom function
      this.getSubSectionlist(value);
    });
         this.getEmployeelist('Employee');
      //  this.getSubSectionlist('GU-1'); //CURRENTLY HARDCODING, WILL COME FROM  FRONTEND IN FUTURE
        this.getSectionlist('Section');

     //
     this.pk_docid = this.encryption.decryptText(this.route.snapshot.params['pk_docid']);
     if (this.pk_docid && this.pk_docid !== 'undefined') {
     this.patchform(this.pk_docid);
     this.Isedit = true; 
   }


     
  }
 // Fetches the employee list for the dropdown selection
 getEmployeelist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.Service.getEmployee(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.EmployeeList= res.data.map((Emp: any) => ({
          name: Emp.name,
          value: Emp.value
        }));
      } else {
        this.toastrService.error("Failed to load employee list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching employee list:", err);
      this.toastrService.error("Error fetching employee list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}
 
// Fetches the reimbursement document types for the dropdown selection
getSubSectionlist(fieldName: string) {

  this.ngxUILoaderService.start();
  this.Service.getSubsectionlist(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.Subseclist= res.data.map((subsec: any) => ({
          name: subsec.name,
          value: subsec.value
        }));
      } else {
        this.toastrService.error("Failed to load list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load list:", err);
      this.toastrService.error("Error fetching load list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}

getSectionlist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.Service.getSection(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.seclist= res.data.map((sec: any) => ({
          name:sec.name,
          value:sec.value
        }));
      } else {
        this.toastrService.error("Failed to load list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load list:", err);
      this.toastrService.error("Error fetching load list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}
// Auto-fills fields when an employee is selected from the dropdown
onEmpCodeChange(empCode: any) {
    
  if (empCode) {
    console.log(empCode);
    this.fk_empid = empCode.value; // Assign selected employee ID
     this.Service.getEmployeeDetails(empCode.value).subscribe(
      (res) => {
        console.log(res);
        this.SectionDocForm.patchValue({
          empname: res.data.empname,
          designation: res.data.designation,
          dept: res.data.dept
        });

        
      },
      (error) => {
        console.error('Error fetching employee details', error);
        this.toastrService.error('Failed to fetch employee details.');
      }
    );
  }
}
// Fetches employees based on applied filters
getEmployees(): void {
  this.Service
    .get_Employees_Ddl(this.employeeFilters)
    .subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // this.employeeList = res.data;
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.EmployeeList = [];

          this.toastrService.error(res.message, 'Error');
        }
      },
      error: (error) => {
        this.EmployeeList = [];

        this.toastrService.error('Failed to retrieve employees', 'Error');
      },
    });
}
// Updates the employeeFilters object and refreshes the employee list
handleFilters(filters: any) {
this.employeeFilters = filters;
this.getEmployees(); // Refresh list with new filters
}
// Prevents non-numeric input in number fields
 validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//for file


onFileSelected(event: any) {
  const file: File = event.target.files[0]; // Get the selected file
  if (file) {
    this.fileToUpload = file;
  }
}


// Submits the form, handling both insert and update operations
submit() {
    
  if (this.SectionDocForm.invalid) {
    this.submitted = true;
     return;
  }
  this.ngxUILoaderService.start(); // Start loader

  // const formData = [{
  //   ...this.SectionDocForm.value,

  const formData = new FormData();
  formData.append('fk_empid', this.SectionDocForm.get('fk_empid')?.value || '');
  formData.append('empname', this.SectionDocForm.get('empname')?.value || '');
  formData.append('designation', this.SectionDocForm.get('designation')?.value || '');
  formData.append('dept', this.SectionDocForm.get('dept')?.value || '');
  // formData.append('secname', this.SectionDocForm.get('secname')?.value || '');
  // formData.append('subsecname', this.SectionDocForm.get('subsecname')?.value || '');
  formData.append('fk_secid', this.SectionDocForm.get('fk_secid')?.value || '');
  formData.append('fk_subsecid', this.SectionDocForm.get('fk_subsecid')?.value || '');
  //formData.append('status', '1');        // Optional: if always true
 // formData.append('isApproved', 'true'); // Optional
  formData.append('isActive', 'true');   // Optional
  formData.append('docsub_status', this.SectionDocForm.get('docsub_status')?.value || '');
  formData.append('submitdate', this.SectionDocForm.get('submitdate')?.value || '');
  formData.append('docsub_Amt', this.SectionDocForm.get('docsub_Amt')?.value || '');
  formData.append('billno', this.SectionDocForm.get('billno')?.value || '');
  formData.append('billdate', this.SectionDocForm.get('billdate')?.value || '');
  formData.append('remarks', this.SectionDocForm.get('remarks')?.value || '');
  
  if (this.fileToUpload) {
    formData.append('Ifilename', this.fileToUpload);
  }
    
  
  if (this.pk_docid) {
    // **UPDATE existing**
    formData.append('pk_docid', this.pk_docid);

    this.Service.update_Sectiondoc(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Section doc status  updated successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/Section-DocStatus_list']);
        }
         else {
          this.toastrService.error(res.message || 'Failed to update Section doc status.');
        }
        this.ngxUILoaderService.stop(); // Stop loader after response
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
        this.ngxUILoaderService.stop(); // Stop loader after response
      }
    });

  }
  else {
    // **INSERT new designation**
    this.Service.add_Sectiondoc(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Section status  added successfully!');
          this.router.navigate(['/dash/payroll/payrolldashboard/Section-DocStatus_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add section. doc status.');
        }
        this.ngxUILoaderService.stop(); // Stop loader after response
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
        this.ngxUILoaderService.stop(); // Stop loader after response
      }
    });
  }
}
// Formats date from DD/MM/YYYY to YYYY-MM-DD format
formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return ''; // Return an empty string if date is null or undefined
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    console.warn("Invalid date format:", dateString); //  Log incorrect format cases
    return ''; 
  }

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}



// Fetches document status details by ID and populates the form for editing
patchform(pk_docid: string) {
  this.Service.getById_Sectiondoc(this.pk_docid).subscribe({
     next: (res) => {
       if (res.isSuccess && res.data) {
         console.log("Fetched doc status Data:", res.data);  // Debugging ke liye
         let formattedDate = this.formatDate(res.data.submitdate); // Convert date
         let formattedDate1 = this.formatDate(res.data.billdate); // Convert date


         this.SectionDocForm.patchValue({
          pk_docid:pk_docid,
          fk_empid: res.data.fk_empid,  // Employee ID
          empname: res.data.empname,    // Employee Name
          designation: res.data.designation,  // Employee Designation
          dept: res.data.dept,          // Employee Department
          fk_secid:res.data.fk_secid,
          fk_subsecid:res.data.fk_subsecid,
          docsub_status: res.data.docsub_status,   
          submitdate:formattedDate, 
          docsub_Amt:res.data.docsub_Amt,
          billdate:formattedDate1,
          billno: res.data.billno,
          remarks:res.data.remarks,
          Ifilename: res.data.filename
         });
   
         this.onEmpCodeChange({value:this.SectionDocForm.get('fk_empid')?.value });
     
         this.Isedit = true;
       } else {
         this.toastrService.error("Failed to load doc status details.");
         
       }
      },
     error: () => {
       this.toastrService.error("Error loading doc status data.");

 
     }
   });
 }

//  previewFile() {
//   const filename = this.SectionDocForm.get('Ifilename')?.value;
//   if (!filename) return;

//   const fileExtension = filename.split('.').pop()?.toLowerCase();
//   this.downloadUrl = `YOUR_BACKEND_FILE_BASE_URL/${filename}`;

//   const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
//   this.isImageType = imageTypes.includes(fileExtension || '');

//   if (this.isImageType) {
//     this.previewImageUrl = this.downloadUrl;

//     // Show Bootstrap modal
//     const modal = new (window as any).bootstrap.Modal(
//       document.getElementById('imagePreviewModal')
//     );
//     modal.show();
//   } else {
//     // For non-image files like Excel
//     window.open(this.downloadUrl, '_blank');
//   }
// }

previewFile() {
  const fileName = this.SectionDocForm.get('Ifilename')?.value;
  const fileUrl = `D/IMAGE/${fileName}`; // replace with actual base path
  this.previewImageUrl = fileUrl;
  this.downloadUrl = fileUrl;
  this.isImageType = /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName);
}

}
