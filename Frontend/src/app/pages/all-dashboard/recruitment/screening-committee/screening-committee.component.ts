import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { string } from 'mathjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ScreeningCommitteeService } from '../RecruitServices/screening-committee.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-screening-committee',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './screening-committee.component.html',
  styleUrl: './screening-committee.component.scss'
})
export class ScreeningCommitteeComponent {

ScreeningCommittee!:FormGroup;
 ngxUILoaderService = inject(NgxUiLoaderService);
  Isedit=false;
  submitted=false;
  id!:number;
  showerror=false;
  EmployeeList: { name: string; value: string }[] = [];
  jobList: { name: string; value: string }[] = [];
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
 
  Pk_Screening_CommitteeId:string='';
  selectedMembers: any[] = []; // Stores added employees
  constructor(private fb:FormBuilder,private toastrService:ToastrService,private router:Router,private services:ScreeningCommitteeService,public encryption:EncryptionService,private route: ActivatedRoute){}
  ngOnInit():void{
   this.ScreeningCommittee=this.fb.group({

    fk_jobId:[null,[Validators.required]],
    remarks:[''],
    fk_empid:[null], 
   
      

   })


   this.Pk_Screening_CommitteeId = this.encryption.decryptText(this.route.snapshot.params['Pk_Screening_CommitteeId']);
   if (this.Pk_Screening_CommitteeId) {
   this.patchform(this.Pk_Screening_CommitteeId);
   this.Isedit = true; 
   }
   this.getlocationlist('Job');
  }

  addMember(): void {
  const empId = this.ScreeningCommittee.get('fk_empid')?.value;

  if (!empId) {
    this.toastrService.error('Please select a member to add.');
    return;
  }

  const isAlreadyAdded = this.selectedMembers.some(member => member.fk_empid === empId);
  if (isAlreadyAdded) {
    this.toastrService.warning('This member is already added.');
    return;
  }

  this.services.getEmployeeDetails(empId).subscribe({
    next: (res) => {
      const emp = res.data;
      this.selectedMembers.push({
        fk_empid: empId,
        empCode: emp.empcode,
        empName: emp.empname,
        department: emp.dept,
        designation: emp.designation
      });
      this.ScreeningCommittee.get('fk_empid')?.reset();
    },
    error: () => {
      this.toastrService.error('Error fetching employee details.');
    }
  });
}
removeMember(index: number): void {
  this.selectedMembers.splice(index, 1);
}


submitForm(){

  const formValue = this.ScreeningCommittee.value;

  const payload = {
    
   screeningCommittee: {
      fk_jobId: formValue.fk_jobId,
      remarks: formValue.remarks || ''
    },
    screeningCommitteeMembers: this.selectedMembers.map((member: any) => ({
      fk_empid: member.fk_empid
    }))
  };

  console.log(payload); // Final JSON you want
    
  
    // ✅ **Check if perquisite exists (Update) or not (Insert)**
    if (this.Pk_Screening_CommitteeId) {
      // **UPDATE existing perquisite**
      const updateData = {
        screeningCommittee: {
          Pk_Screening_CommitteeId: this.Pk_Screening_CommitteeId,
          fk_jobId: formValue.fk_jobId,
         remarks: formValue.remarks || ''
       },
    screeningCommitteeMembers: this.selectedMembers.map((member: any) => ({
      fk_empid: member.fk_empid
    }))
  };
      this.services.update_ScreeningCommittee(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail updated successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/ScreeningCommittee-list']);
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
      this.services.add_ScreeningCommittee(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail added successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/ScreeningCommittee-list']);
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

  checkAvailability(name: string): void {
    const fieldName = 'recruitname'; 
    const fieldValue = name; 
    const generalId = this.Pk_Screening_CommitteeId || ''; 
  
    this.services.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ScreeningCommittee.get('name')?.setErrors({ duplicate: response.message });
        } else {
          this.ScreeningCommittee.get('name')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.ScreeningCommittee.get('name')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }
  

  patchform(Pk_Screening_CommitteeId: string) {
    this.services.get_ScreeningCommittee_ById(this.Pk_Screening_CommitteeId).subscribe({
       next: (res) => {
         if (res.isSuccess && res.data) {
         
            const data = res.data;

        // ✅ Patch main form fields
        this.ScreeningCommittee.patchValue({
          fk_jobId: data.screeningCommittee.fk_jobId,
          remarks: data.screeningCommittee.remarks
        });

        // ✅ Populate selectedMembers array
        this.selectedMembers = data.screeningCommitteeMember.map((member: any) => ({
          fk_empid: member.fk_empid,
          empCode: member.empcode,
          empName: member.empname,
          department: member.department,
          designation: member.designation
        }));
   
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
  
  Onreset():void{
     this.ScreeningCommittee.reset();
    
 }

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  getEmployees(): void {
    this.services.get_Employees_Ddl(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
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

   getlocationlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.services.getjob(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.jobList= res.data.map((Emp: any) => ({
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

}
