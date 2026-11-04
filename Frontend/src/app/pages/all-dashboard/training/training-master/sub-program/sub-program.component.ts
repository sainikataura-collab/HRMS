import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../services/program.service';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-sub-program',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink,NgSelectComponent],
  templateUrl: './sub-program.component.html',
  styleUrl: './sub-program.component.scss'
})
export class SubProgramComponent {

  subprogramForm!: FormGroup;
  Isedit = false;

 // programid: number = 0;
   programid: number | null = null;
  showError = false;

    programddl: { label: string, value: string }[]  = []; 


  constructor(private fb: FormBuilder, private toastrService: ToastrService,
    private router: Router, private route: ActivatedRoute,private Service: ProgramService,
    private encryptionService: EncryptionService) { }

  ngOnInit(): void {
    this.subprogramForm = this.fb.group({
      subProgramName: [null, Validators.required],
      fk_programId: [null, Validators.required],
      isActive: [false]
    });

    this.ProgramList('Program')
    this.programid = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['subprogramId']))

    if (this.programid) {
     this.getByid(this.programid);
      this.Isedit = true;
    }

  }



 ProgramList(fieldName: string) {

    // this.ngxUILoaderService.start(); // Start loader before API call

    this.Service.getCommonList(fieldName).subscribe({
        next: (res) => {

            if (res.isSuccess && res.data) {
              res.data = res.data.slice(1);
                this.programddl = res.data.map((fk_programId: any) => ({
                  name: fk_programId.name,
                    value: fk_programId.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
            // Stop loader after response

        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");

        }
    });
  }





  getByid(programid: number) {

    this.Service.get_SubprogramById(programid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
        this.subprogramForm.patchValue({
          fk_programId:res.data.fk_programId.toString(), 
          subProgramName:res.data.subProgramName, 
          isActive:res.data.isActive, 
          
        
        });
        this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load LWF details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading LWF data.");
      }
    });
  }



    submitForm(): void {
      debugger
      if (this.subprogramForm.invalid) {
        this.showError = true;
        return;
      }

      const formData = {
        ...this.subprogramForm.value,
          fk_programId: Number(this.subprogramForm.value.fk_programId),
        
      };

      // ✅ **Check if designationId exists (Update) or not (Insert)**
   
      if (this.programid) {
        console.log(typeof this.programid )
        // **UPDATE existing **
        const updateData = { ...formData,pk_subProgramId:this.programid};

        this.Service.update_Subsubprogram(updateData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message);
              this.router.navigate(['/dash/training/trainingdashboard/subprogram_master_list']);
            } 
            else {
              this.toastrService.error(res.message);
            }
          },
          error: (err) => {
            console.error('Update API Error:', err);
            this.toastrService.error('Something went wrong while updating!');
          }
        });

      } else {

        this.Service.add_subprogram(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message);
              this.router.navigate(['/dash/training/trainingdashboard/subprogram_master_list']);
            } else {
              this.toastrService.error(res.message );
            }
          },
          error: (err) => {
  
            this.toastrService.error('Something went wrong while adding!');
          }
        });
      }
  }

  checkDesignationAvailability(description: string): void {
  const fieldName = 'Program'; 
  const fieldValue = description; 
   const generalId = this.programid ?? 0; 

  this.Service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.subprogramForm.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.subprogramForm.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      this.subprogramForm.get('description')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}

}

