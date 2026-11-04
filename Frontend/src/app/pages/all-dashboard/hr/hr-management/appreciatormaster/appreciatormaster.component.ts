import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonSearchComponent } from "../../../payroll/Employee/common-search/common-search.component";

import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { AppreciatorService } from '../../HRservices/appreciator.service';

@Component({
  selector: 'app-appreciatormaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule, CommonSearchComponent],
  templateUrl: './appreciatormaster.component.html',
  styleUrl: './appreciatormaster.component.scss'
})
export class AppreciatormasterComponent {
  Appreciatorform!: FormGroup;
  submitted=false;
  pk_crdauthId!: number;
  Isedit=false;
  EmployeeList: { name: string; value: string }[] = [];
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


  constructor(private Service:AppreciatorService,private fb: FormBuilder,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}

  ngOnInit() {
    this.Appreciatorform = this.fb.group({
      fk_empid: [null,Validators.required],
      isABCD: [false],
      isShabash: [false],
      isWelldone: [false],
   
    
    });

    this.pk_crdauthId = +this.encryption.decryptText(this.route.snapshot.params['pk_crdauthId']);
    if (this.pk_crdauthId) {
    this.Patchform(this.pk_crdauthId);
    this.Isedit = true; 
  }
  }    
 
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  getEmployees(): void {
    this.Service.get_Employees_Ddl(this.employeeFilters).subscribe({
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

  submitForm(): void {

    if (this.Appreciatorform.invalid) {
     // this.toastrService.error('Please fill all required fields.');
      this.submitted = true;
      return;
    }
  
    const formData = {
      ...this.Appreciatorform.value,
      
    };
    
  
    // ✅ **Check if perquisite exists (Update) or not (Insert)**
    if (this.pk_crdauthId) {
      // **UPDATE existing perquisite**
      const updateData = { ...formData, pk_crdauthId: this.pk_crdauthId};
  
      this.Service.update_cardAppreciator(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail updated successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/Appreciator_Master_list']);
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
      this.Service.add_cardAppreciator(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'detail added successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/Appreciator_Master_list']);
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
  //get by id and patch the value
  Patchform(pk_crdauthId: number) {
     this.Service.get_cardAppreciatorByid(this.pk_crdauthId).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.Appreciatorform.patchValue({
              fk_empid: res.data.fk_empid,
             
              isABCD:res.data.isABCD,
              isShabash:res.data.isShabash,
              isWelldone:res.data.isWelldone,
             
  
              
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
         this.Appreciatorform.reset();
       
        }

}
