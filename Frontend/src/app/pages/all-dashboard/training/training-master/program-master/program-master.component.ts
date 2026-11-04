import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { ProgramService } from '../../services/program.service';

@Component({
  selector: 'app-program-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './program-master.component.html',
  styleUrl: './program-master.component.scss'
})
export class ProgramMasterComponent {

  programForm!: FormGroup;
  Isedit = false;

 // programid: number = 0;
   programid: number | null = null;
  showError = false;


  constructor(private fb: FormBuilder, private toastrService: ToastrService,
    private router: Router, private route: ActivatedRoute,private Service: ProgramService,
    private encryptionService: EncryptionService) { }

  ngOnInit(): void {
    this.programForm = this.fb.group({
      description: [null, Validators.required],
      remarks: [null, Validators.required],
      active: [false]
    });

    this.programid = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['programid']))

    if (this.programid) {
     this.getByid(this.programid);
      this.Isedit = true;
    }

  }



  // getStateList(fieldName: string) {

  //   // this.ngxUILoaderService.start(); // Start loader before API call

  //   this.lwfSlabService.getStateList(fieldName).subscribe({
  //       next: (res) => {


  //           if (res.isSuccess && res.data) {
  //             res.data = res.data.slice(1);
  //               this.StateList = res.data.map((fk_stateid: any) => ({
  //                 name: fk_stateid.name,
  //                   value: fk_stateid.value
  //               }));
  //           } else {
  //               this.toastrService.error("Failed to load HOD list.");
  //           }
  //           // Stop loader after response

  //       },
  //       error: (err) => {
  //           console.error("Error fetching HOD list:", err);
  //           this.toastrService.error("Error fetching level list.");

  //       }
  //   });
  // }



  formatDate(dateStr: string): string {
    if (dateStr) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`; // Format to YYYY-MM-DD
    }
    return '';
  }


  getByid(pk_slabid: number) {

    this.Service.getProgramById(pk_slabid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          
          var stateIdStr = res.data.fk_stateid + "";
        this.programForm.patchValue({
          description:res.data.description, 
          remarks:res.data.remarks, 
          active:res.data.active, 
        
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
      if (this.programForm.invalid) {
        this.showError = true;
        return;
      }

      const formData = {
        ...this.programForm.value
        
      };

      // ✅ **Check if designationId exists (Update) or not (Insert)**
   
      if (this.programid) {
        console.log(typeof this.programid )
        // **UPDATE existing designation**
        const updateData = { ...formData,pk_programId:this.programid};

        this.Service.update_program(updateData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'LWF updated successfully!');
              this.router.navigate(['/dash/training/trainingdashboard/program_master_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to update LWF.');
            }
          },
          error: (err) => {
            console.error('Update API Error:', err);
            this.toastrService.error('Something went wrong while updating!');
          }
        });

      } else {

        this.Service.add_program(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message);
              this.router.navigate(['/dash/training/trainingdashboard/program_master_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to add LWF.');
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
        this.programForm.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.programForm.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      this.programForm.get('description')?.setErrors({ duplicate: 'Error checking designation availability.' });
    }
  });
}

}

