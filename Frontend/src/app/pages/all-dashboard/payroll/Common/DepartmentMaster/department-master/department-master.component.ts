import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectComponent} from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DepartmentService } from '../../../services/department.service';
import { ToastrService } from 'ngx-toastr';
import { DesignationService } from '../../../services/designation.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { DropdownService } from '../../../../../../shared/services/dropdown.service';

@Component({
  selector: 'app-department-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectComponent,RouterLink],
  templateUrl: './department-master.component.html',
  styleUrl: './department-master.component.scss'
})
export class DepartmentMasterComponent {


  departmentForm!:FormGroup;
  showError=false;

 
  // allHodCodes = [
  //   { empCode: 'PP010', empName: 'John Doe' },
  //   { empCode: 'PP011', empName: 'Jane Smith' },
  //   { empCode: 'PP012', empName: 'Mark Lee' }
  // ];

  allHodCodes: { label: string, value: string }[]  = []; 
  selectedCode: string | null = null;

  deptpartmentId: string ='';
  Isedit=false;

  
  


  constructor(private fb:FormBuilder, private departmentService:DepartmentService,private designationService:DesignationService,private router:Router,private route: ActivatedRoute,private toastrService:ToastrService,private encryptionService:EncryptionService,private dropdownService: DropdownService){}

  ngOnInit():void{
 

   this.departmentForm=this.fb.group({
    // department: [null],
    description: [null,Validators.required],
    fk_depHodid: [null],
    deptcode: [null,Validators.required],
     
      active: ['']

   });

       //this.deptpartmentId=this.route.snapshot.params['pk_DeptId']
       
      this.deptpartmentId=this.encryptionService.decryptText(this.route.snapshot.params['pk_DeptId']);

      
      if (this.deptpartmentId && this.deptpartmentId !== 'undefined') {
        this.getDepartmentDetailsByid(this.deptpartmentId);
        this.Isedit = true; 
      }

    this.getLevelList('Employee');
  
    // Call CheckDuplicateValue when the designation input changes
  //  this.departmentForm.get('description')?.valueChanges.subscribe(value => {
  //   if (value) {
  //     this.checkDesignationAvailability(value);
  //   }
  // });
 
 
}



checkDesignationAvailability(description: string): void {
  const fieldName = 'Department'; 
  const fieldValue = description; 
  const generalId = this.deptpartmentId || ''; 

  this.designationService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.departmentForm.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.departmentForm.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.departmentForm.get('description')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}
checkDeptAvailability(description: string): void {
  const fieldName = 'DeptCode'; 
  const fieldValue = description; 
  const generalId = this.deptpartmentId || ''; 

  this.designationService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.departmentForm.get('deptcode')?.setErrors({ duplicate: response.message });
      } else {
        this.departmentForm.get('deptcode')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.departmentForm.get('deptcode')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}




getLevelList(fieldName: string) {
  debugger
  this.departmentService.getHODList(fieldName).subscribe({
      next: (res) => {
          if (res.isSuccess && res.data) {
              this.allHodCodes = res.data.map((fk_depHodid: any) => ({
                  name: fk_depHodid.name,
                  value: fk_depHodid.value
              }));
          } else {
              this.toastrService.error("Failed to load HOD list.");
          }
          
      },
      error: (err) => {
          console.error("Error fetching HOD list:", err);
          this.toastrService.error("Error fetching level list.");
          
      }
  });
}


  


getDepartmentDetailsByid(departmentId: string) {

  this.departmentService.getDepartmentById(departmentId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log("Fetched Department Data:", res.data);  // Debugging ke liye

        this.departmentForm.patchValue({
          description: res.data.description ,
          active:res.data.active ,
          fk_depHodid:res.data.fk_depHodid,
          deptcode:res.data.deptcode
        });
        

        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load Category details.");
        
      }
    },
    error: () => {
      this.toastrService.error("Error loading Category data.");

    }
  });
}

onLevelChange(selectedValue: any): void {
  this.selectedCode = selectedValue;
  console.log("User Selected Level:", this.selectedCode);
}

submitForm(): void {
  debugger
  if (this.departmentForm.invalid) {
    this.showError = true;
    return;
  }

  const formData = {
    ...this.departmentForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };
  

  // ✅ **Check if designationId exists (Update) or not (Insert)**
  if (this.deptpartmentId) {
    // **UPDATE existing designation**
    const updateData = { ...formData, pk_DeptId: this.deptpartmentId };

    this.departmentService.update_department(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.dropdownService.triggerDepartmentReload();

          this.toastrService.success(res.message || 'Designation updated successfully!');
          this.router.navigate(['/dash/user/userdashboard/DepartmentForm_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update designation.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    // **INSERT new designation**
    this.departmentService.add_department(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.dropdownService.triggerDepartmentReload();

          this.toastrService.success(res.message || 'Designation added successfully!');
          this.router.navigate(['/dash/user/userdashboard/DepartmentForm_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add designation.');
        }
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
      }
    });
  }
}



   

  resetForm(): void {
    this.departmentForm.reset();
  }

}
