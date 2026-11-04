import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CandidateService } from '../../HRservices/candidate.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-candidate',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './candidate.component.html',
  styleUrl: './candidate.component.scss'
})
export class CandidateComponent {
  CandidateForm!: FormGroup;
  submitted=false;
  pk_formatid!: number;
  Isedit=false;
  EmployeeList: { name: string; value: string }[] = [];
  locationList: { name: string; value: string }[] = [];
  designationList: { name: string; value: string }[] = [];
  departmentList: { name: string; value: string }[] = [];
  HRList: { name: string; value: string }[] = [];
  cityList: { name: string; value: string }[] = [];
  ngxUILoaderService = inject(NgxUiLoaderService);

 constructor(private Service:CandidateService,private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
 
   ngOnInit() {
     this.CandidateForm = this.fb.group({
       fk_empid: [null,Validators.required],
       name: ['',Validators.required],
       nname: ['',Validators.required],
       fk_locid:  [null,Validators.required],
       fk_deptid: [null,Validators.required],
       fk_desgid: [null,Validators.required],
       fk_cityid: [null,Validators.required],
       pinno:[''],
       joiningdate: [null,Validators.required],
       ctc:[null,Validators.required],
       contactno: [null,Validators.required],
       address:[''],
       fk_emphrid:[null,Validators.required]



    
     
     });
 
     this.pk_formatid     = +this.encryption.decryptText(this.route.snapshot.params['pk_formatid']);
     if (this.pk_formatid) {
     this.Patchform(this.pk_formatid);
     this.Isedit = true; 
   }
   
   this.getEmployeelist('Employee');
   this.getlocationlist('location');
   this.getdepartmentlist('department');
   this.getdesignationlist('designation');
   this.getcitylist('city');
   this.getHrlist('Employee');
   }    
  
   
    // Fetch employee list for dropdown
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
 

  getHrlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.HRList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load Hr list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching Hr list:", err);
        this.toastrService.error("Error fetching Hr list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }
  getlocationlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.locationList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load  location list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching location list:", err);
        this.toastrService.error("Error fetching employee list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getdepartmentlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.departmentList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load  department list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching department list:", err);
        this.toastrService.error("Error fetching department list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getdesignationlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.designationList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load  designation list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching designation list:", err);
        this.toastrService.error("Error fetching designation list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getcitylist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.cityList= res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load  city list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching city list:", err);
        this.toastrService.error("Error fetching city list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }
  
  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric characters
    }
  }
   submitForm(): void {
 
     if (this.CandidateForm.invalid) {
      // this.toastrService.error('Please fill all required fields.');
       this.submitted = true;
       return;
     }
   
     const formData = {
       ...this.CandidateForm.value,
       
     };
     
   
     // ✅ **Check if perquisite exists (Update) or not (Insert)**
     if (this.pk_formatid) {
       // **UPDATE existing perquisite**
       const updateData = { ...formData, pk_formatid: this.pk_formatid};
   
       this.Service.update_Candidate(updateData).subscribe({
         next: (res) => {
           if (res.isSuccess) {
             this.toastrService.success(res.message || 'detail updated successfully!');
             this.router.navigate(['/dash/hr/hrdashboard/Candidate_list']);
           } else {
             this.toastrService.error(res.message || 'Failed to update detail.');
           }
         },
         error: (err) => {
           console.error('Update API Error:', err);
           this.toastrService.error('Something went wrong while updating!');
         }
       });
   
     } else {
       // **INSERT new designation**
       this.Service.add_Candidate(formData).subscribe({
         next: (res) => {
           if (res.isSuccess) {
             this.toastrService.success(res.message || 'detail added successfully!');
             this.router.navigate(['/dash/hr/hrdashboard/Candidate_list']);
           } else {
             this.toastrService.error(res.message || 'Failed to add detail.');
           }
         },
         error: (err) => {
           console.error('Insert API Error:', err);
           this.toastrService.error('Something went wrong while adding!');
         }
       });
     }
   }
  
  
  convertToISODate(dateStr: string): string | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`; // yyyy-MM-dd
  }
   //get by id and patch the value
   Patchform(pk_formatid: number) {
      this.Service.get_Candidate_ById(this.pk_formatid).subscribe({
         next: (res) => {
           if (res.isSuccess && res.data) {
            const joiningDateFormatted = this.convertToISODate(res.data.joiningdate);

             this.CandidateForm.patchValue({
               fk_empid: res.data.fk_empid,
              
               name: res.data.name,
               nname: res.data.nname,
               fk_locid: res.data.fk_locid,
               fk_deptid: res.data.fk_deptid,
               fk_desgid: res.data.fk_desgid,
               fk_cityid: res.data.fk_cityid,
               pinno: res.data.pinno,
               joiningdate:joiningDateFormatted,
               ctc: res.data.ctc,
               contactno: res.data.contactno,
               address: res.data.address,
               fk_emphrid: res.data.fk_emphrid
              
   
               
      });
             
     
             this.Isedit = true;
           } else {
             this.toastrService.error("Failed to load details.");
             
           }
          },
         error: () => {
           this.toastrService.error("Error loading data.");
   
     
         }
       });
     }
    
   
 
   resetForm(): void {
          this.CandidateForm.reset();
        
         }
 
 
  


}
