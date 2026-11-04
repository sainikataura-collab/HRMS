import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Idesignation } from '../../../Interface/icommon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DesignationService } from '../../../services/designation.service';
import { ToastrService } from 'ngx-toastr';
import { Action } from 'rxjs/internal/scheduler/Action';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-designationmaster',
  standalone: true,
  imports: [ReactiveFormsModule, NgxPaginationModule, CommonModule, RouterLink, NgSelectComponent],
  templateUrl: './designationmaster.component.html',
  styleUrl: './designationmaster.component.scss'
})
export class DesignationmasterComponent {


  designationForm!: FormGroup;
  Isedit = false;
  showError = false;



  levelOptions: { label: string, value: number }[] = [];  // Will store dynamic data from API

  selectedLevel: number | null = null;

  designationId: string = '';

  constructor(private fb: FormBuilder, private designationservice: DesignationService, private router: Router, private toastrService: ToastrService, private route: ActivatedRoute, public encryptionService: EncryptionService) { }

  ngOnInit(): void {
    this.designationForm = this.fb.group({
      // pk_desgid:[null],
      designation: [null, Validators.required,],
      seniorityLevel: [null],
      fk_levelid: [null], // Initialize properly
      qualification: [null],
      remarks: [null],
      isActive: [true]
    })


    this.designationId = this.encryptionService.decryptText(this.route.snapshot.params['pk_desgid']);

    // this.designationId=this.route.snapshot.params['pk_desgid'] 

    if (this.designationId && this.designationId !== 'undefined') {
      this.getDesignationDetailsByid(this.designationId);
      this.Isedit = true;

    }



    this.getLevelList('Level');

    // Call CheckDuplicateValue when the designation input changes
    //  this.designationForm.get('designation')?.valueChanges.subscribe(value => {
    //   if (value) {
    //     this.checkDesignationAvailability(value);
    //   }
    // });

  }

  checkDesignationAvailability(designation: string): void {
    const fieldName = 'Designation';
    const fieldValue = designation;
    const generalId = this.designationId || '';

    this.designationservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.designationForm.get('designation')?.setErrors({ duplicate: response.message });
        } else {
          this.designationForm.get('designation')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.designationForm.get('designation')?.setErrors({ duplicate: 'Error checking designation availability.' });
      }
    });
  }


  getDesignationDetailsByid(designationId: string) {
    this.designationservice.getDesignationById(designationId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log(res.data);  // Debugging ke liye
          this.designationForm.patchValue({
            designation: res.data.designation,
            seniorityLevel: res.data.seniorityLevel,
            fk_levelid: res.data.fk_levelid,
            qualification: res.data.qualification,
            isActive: res.data.isActive,
            remarks: res.data.remarks
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
    this.selectedLevel = selectedValue;
    console.log("User Selected Level:", this.selectedLevel);
  }



  getLevelList(fieldName: string) {
    this.designationservice.getLevels(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Received Level Data:", res.data);

          this.levelOptions = res.data.map((level: any) => ({
            name: level.name, // Display name
            value: level.value // Ensure pk_levelid is mapped correctly
          }));

          console.log("Mapped Level Options:", this.levelOptions);

          // Check if any level is preselected (if applicable)
          if (this.levelOptions.length > 0) {
            this.selectedLevel = this.levelOptions[0].value; // Setting first value as default
            console.log("Selected Level:", this.selectedLevel);
          }
        } else {
          this.toastrService.error("Failed to load levels.");
        }
      },
      error: (err) => {
        console.error("Error fetching level list:", err);
        this.toastrService.error("Error fetching level list.");
      }
    });
  }


  submitForm(): void {
    if (this.designationForm.invalid) {
      // this.toastrService.error('Please fill all required fields.');
      this.showError = true;
      return;
    }

    const formData = {
      ...this.designationForm.value,
      companyId: sessionStorage.getItem('companyId'),
      locId: sessionStorage.getItem('locationID'),
      userId: sessionStorage.getItem('fk_UserID')
    };

    //  **Check if designationId exists (Update) or not (Insert)**
    if (this.designationId) {
      // **UPDATE existing designation**
      const updateData = { ...formData, pk_desgid: this.designationId };

      this.designationservice.update_Designation(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Designation updated successfully!');
            this.router.navigate(['/dash/user/userdashboard/DesignationForm_list']);
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
      this.designationservice.add_designation(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Designation added successfully!');
            this.router.navigate(['/dash/user/userdashboard/DesignationForm_list']);
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





}

