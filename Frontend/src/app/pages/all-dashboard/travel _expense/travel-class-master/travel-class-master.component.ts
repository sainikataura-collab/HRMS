import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { RoleMastersService } from '../../payroll/services/role-masters.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { TravelClassMasterService } from '../TravelService/travel-class-master.service';


@Component({
  selector: 'app-travel-class-master',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './travel-class-master.component.html',
  styleUrl: './travel-class-master.component.scss'
})
export class TravelClassMasterComponent {

  travelClassForm!: FormGroup;
  ShowError = false;
  pk_classTvlId: number=0;
  Isedit: boolean = false;

  constructor(private fb: FormBuilder, private httpservice: TravelClassMasterService, 
    private toastrService: ToastrService, private router: Router, public encryption: EncryptionService, 
    private route: ActivatedRoute,
   private httprole:RoleMastersService) {
    // this.travelClassForm = this.fb.group({
    //   class: [''],
    //   remarks: [''],
    //   isActive: [false],
    // });
  }
  ngOnInit() {
    this.travelClassForm = this.fb.group({
      classname: ['', [Validators.required]],
      remarks: ['', [Validators.required]],


      isActive: [false],

    })
    this.pk_classTvlId = +this.encryption.decryptText(this.route.snapshot.params['pk_classTvlId']);
    if (this.pk_classTvlId) {
      this.patchform(this.pk_classTvlId);
      this.Isedit = true;
    }
  }




  onSubmit() {
  if (this.travelClassForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.ShowError = true;

    return;
  }

  // const formData = {
  //   ...this.travelClassForm.value,
    
  // };
  
  const formData = {
      TravelMasterMst: {
        ...this.travelClassForm.value,
      
      }
    };

  // ✅ **Check if perquisite exists (Update) or not (Insert)**
  if (this.pk_classTvlId) {
    // **UPDATE existing perquisite**
  
     const formData = {
      TravelMasterMst: {
        ...this.travelClassForm.value,
         pk_classTvlId: this.pk_classTvlId
      }
    };

    this.httpservice.travelMasterUpdate(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail updated successfully!');
          this.router.navigate(['/dash/travel_expense/travel_expensedashboard/travelClassMaster_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update detail.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } 
  else {
    // **INSERT new designation**
    this.httpservice.travelMasterInsert(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail added successfully!');
          this.router.navigate(['/dash/travel_expense/travel_expensedashboard/travelClassMaster_list']);
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

  patchform(pk_classTvlId: number) {
   this.httpservice.travelMasterGetById(this.pk_classTvlId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
        this.travelClassForm.patchValue({
          classname: res.data.classname,
          remarks:res.data.remarks,
            isActive:res.data.isActive,
            
           
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

  onReset() {
    this.travelClassForm.reset();
  }


  onBack() {
    console.log('use for go back');
  }


  
  //Check Duplicasy of given data in table
  checkDesignationAvailability(classname: string): void {
 
    const fieldName = 'classname'; 
    const fieldValue = classname; 
    const generalId = this.pk_classTvlId; 
  
    this.httprole.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.travelClassForm.get('classname')?.setErrors({ duplicate: response.message });
        } else {
          this.travelClassForm.get('classname')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.travelClassForm.get('travelClassForm')?.setErrors({ duplicate: 'Error checking role availability.' });
      }
    });
  }
  


}
