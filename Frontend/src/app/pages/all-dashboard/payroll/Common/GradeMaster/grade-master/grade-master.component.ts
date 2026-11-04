import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, MaxValidator, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GradeMasterService } from '../../../services/grade-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';



@Component({
  selector: 'app-grade-master',
  standalone: true,
  imports: [CommonModule,NgSelectModule,RouterLink, ReactiveFormsModule],
  templateUrl: './grade-master.component.html',
  styleUrl: './grade-master.component.scss'
})
export class GradeMasterComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  // NoticeOptions: { label: string, value: number }[]  = [];  // Will store dynamic data from API
  NoticeOptions=[
    { label: "30 days", value: "30" },
    { label: "60 days", value: "60" },
    { label: "90 days", value: "90" }
  ]
  selectedNotice: number | null = null;
  GradeForm!: FormGroup;
  Isedit=false;
  route=inject(ActivatedRoute);
  router=inject(Router);
  httpservice=inject(GradeMasterService);
  showError=false;
  gradeId: string=''
  constructor(private fb:FormBuilder, private gradeservice:GradeMasterService,private toastrService:ToastrService,public encryptionService:EncryptionService){}
  
  ngOnInit(): void {
    this.GradeForm = this.fb.group({
      classname: ['',[Validators.required]],
      NoticePeriod: ['',[Validators.required]]  
    });

    // this.gradeId=this.route.snapshot.params['pk_classid']
    this.gradeId=this.encryptionService.decryptText(this.route.snapshot.params['pk_classid'].toString())

     

    if (this.gradeId && this.gradeId !== 'undefined') {
      this.getGradeDetailsByid(this.gradeId);
      this.Isedit = true; 
  
    }
  //  this.getGradeList('Level'); 
  //calling dublicate
  // Call CheckDuplicateValue when the designation input changes
  // this.GradeForm.get('classname')?.valueChanges.subscribe(value => {
  //   if (value) {
  //     this.checkClassAvailability(value);
  //   }
  // });

  }
  
//get all by id

getGradeDetailsByid(gradeId: string) {
  this.ngxUILoaderService.start();
  this.gradeservice.get_GradeById(gradeId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        console.log(res.data);  // Debugging ke liye
        this.GradeForm.patchValue({

          classname: res.data.classname ,
          NoticePeriod:res.data.noticePeriod,
                 
        });

        this.Isedit = true;
      } else {
        this.toastrService.error("Failed to load Category details.");
      }
      this.ngxUILoaderService.stop(); // Stop loader after response

    },
    error: () => {
      this.toastrService.error("Error loading Category data.");
    }
  });
}

 //on grade change
//  onGradeChange(Notice: any): void {
//   this.selectedNotice = Notice;
//   console.log("User Selected Level:", this.selectedNotice);
// }    
  //for grade list
  // getGradeList(fieldName: string) {
  //   this.gradeservice.getLevels(fieldName).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess && res.data) {
  //         console.log("Received Level Data:", res.data);
  
  //         this.NoticeOptions = res.data.map((level: any) => ({
  //           name: level.name, // Display name
  //           value: level.value // Ensure pk_levelid is mapped correctly
  //         }));
  
  //         console.log("Mapped Level Options:", this.NoticeOptions);
  
  //         // Check if any level is preselected (if applicable)
  //         if (this.NoticeOptions.length > 0) {
  //           this.selectedNotice = this.NoticeOptions[0].value; // Setting first value as default
  //           console.log("Selected Level:", this.selectedNotice);
  //         }
  //       } else {
  //         this.toastrService.error("Failed to load levels.");
  //       }
  //     },
  //     error: (err) => {
  //       console.error("Error fetching level list:", err);
  //       this.toastrService.error("Error fetching level list.");
  //     }
  //   });
  // }
  

 //for submit form
 submitForm(): void {
 debugger   
  if (this.GradeForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.GradeForm.value,
    companyId: sessionStorage.getItem('companyId'),
    locId: sessionStorage.getItem('locationID'),
    userId: sessionStorage.getItem('fk_UserID')
  };

  // ✅ **Check if designationId exists (Update) or not (Insert)**
  if (this.gradeId) {
    // **UPDATE existing designation**
    const updateData = { ...formData, pk_classid: this.gradeId };

    this.gradeservice.Update_Grade(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Designation updated successfully!');
          this.router.navigate(['/dash/user/userdashboard/gradeMaster_list']);
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
    this.gradeservice.Insert_Grade(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Designation added successfully!');
          this.router.navigate(['/dash/user/userdashboard/gradeMaster_list']);
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
//reset the form
resetForm(): void {
  this.GradeForm.reset();
}
// //class name availability

checkClassAvailability(classname: string): void {
  const fieldName = 'Class'; //field name which is registere in  general table
  const fieldValue = classname; 
  const generalId = this.gradeId || ''; 

  this.gradeservice.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.GradeForm.get('classname')?.setErrors({ duplicate: response.message });
      } else {
        this.GradeForm.get('classname')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.GradeForm.get('classname')?.setErrors({ duplicate: 'Error checking class availability.' });
    }
  });
}

 
}
