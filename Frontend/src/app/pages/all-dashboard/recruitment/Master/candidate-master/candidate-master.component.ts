import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CandidateMasterService } from '../../RecruitServices/candidate-master.service';
import { MaxdayDirective } from '../../../../../Directive/maxday.directive';

@Component({
  selector: 'app-candidate-master',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule,ReactiveFormsModule,NgSelectComponent,MaxdayDirective],
  templateUrl: './candidate-master.component.html',
  styleUrl: './candidate-master.component.scss'
})
export class CandidateMasterComponent {
ngxUILoaderService = inject(NgxUiLoaderService);
candidateMaster_Details!:FormGroup;
submitted=false;
isedit=false;
showerror=false;
pk_recId:string='';
emailOrMobile:string='';
id!:number;
//for file cv
fileToUpload: File | null = null;
  ImageUrl: string = '';   
  FileName: string = '';    
  oldfile: string='';

    originalEmail: string = '';
originalMobile: string = '';

  //for file
  fileToUploadPic: File | null = null;
oldPic: string = '';
picImageUrl: string = '';
picFileName: string = '';

JobList: { name: string; value: string }[] = [];
ZoneList: { name: string; value: string }[] = [];

selects=[
  {name:'Blacklisted',value:'1'},
  {name:'Offered',value:'2'},
   {name:'On Hold',value:'3'},
    {name:'No Show',value:'4'},
    {name:'Rejected',value:'5'},
     {name:'Shortlisted',value:'6'},
];

gender=[
  {name:'Male',value:'m'},
  {name:'Female',value:'f'},
   
];

isDuplicateMobile: boolean = false;
isDuplicateemail: boolean = false;
candidateDetailsList: any[] = []; 


constructor(private fb:FormBuilder,private service:CandidateMasterService,private router:Router,private toastrservice:ToastrService,public encryption:EncryptionService,private route: ActivatedRoute){}
ngOnInit():void
{
  this.candidateMaster_Details=this.fb.group(
    {
      fk_jobId:[null,[Validators.required]],
      gender:[null,[Validators.required]],
      candidate_name:['',[Validators.required]],
      dated:['',[Validators.required]],
      father_name:[''],
      dateofbirth:['',[Validators.required]],
      totexperience:['',[Validators.required]],
      email:['',[Validators.required]],
      keyskills:[''],
      nativity:[''],
     education:[''],	
     designation:[''],
     functionName:[''],	
     department:[''],	
     interviewer:[''],
     status:[null,[Validators.required]],
     refname:[''],
     remarks:['',[Validators.required]],
     currentctc:['',[Validators.required]],
     expectedctc:['',[Validators.required]],
     npmonth:[''],
     npdys:['',[Validators.required]],
     Joinindays:['',[Validators.required]],
     fk_zoneId:[null],
     mobile:['',[Validators.required]],
     File:[''],
     Pic:['']



    }
  )
 
   this.getZonelist('Zone');
  this.getJOblist('Job');
 
    this.pk_recId = this.encryption.decryptText(this.route.snapshot.params['pk_recId']);
      if (this.pk_recId) {
       this.Patchform(this.pk_recId);
      this.isedit = true; 
    }
     
 
}



//for only number validation
validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
//contact number validation
validateNumber1(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 54 || charCode >57) {
    event.preventDefault(); // Block non-numeric characters
  }
}

onFileSelected(event: any) {
  const file: File = event.target.files[0]; // Get the selected file
  if (file) {
    this.fileToUpload = file;
    this.FileName = '';
    this.ImageUrl = '';
  }
}


onPicSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    this.fileToUploadPic = file;
    this.picFileName = '';
    this.picImageUrl = '';
  }
}


onsubmit()
{

   if (this.isDuplicateMobile) {
    this.toastrservice.warning('Cannot submit:  Mobile number already registered');
    return;
  }

   if (this.isDuplicateemail) {
    this.toastrservice.warning('Cannot submit: Email  already registered');
    return;
  }
if(this.candidateMaster_Details.invalid)
  {

     this.showerror=true;
     return;
  }
   const formData = new FormData();
     // Append all form control values to FormData
  Object.keys(this.candidateMaster_Details.controls).forEach((key) => {
    const value = this.candidateMaster_Details.get(key)?.value;
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  //     if (this.fileToUpload) {
  //       formData.append('File', this.fileToUpload);
  //     }
  //     else if (this.oldfile) {
  //       formData.append('filename', this.oldfile); // No new file, use existing
  //       console.log("ghihi",this.oldfile)
  //     }
  //     if (this.fileToUploadPic) {
  //     formData.append('Pic', this.fileToUploadPic); // 'pic' is the key expected in your API
  //   } else if (this.oldPic) {
  //     formData.append('picturename', this.oldPic); // Optional: send old pic file name
  // }

   //  FILE HANDLING
  if (this.isedit) {
    // Editing - decide whether file changed
    if (this.fileToUpload) {
      formData.append('File', this.fileToUpload);
      formData.append('UpdFileChange', 'Y');
    } else {
      formData.append('UpdFileChange', 'N');
      if (this.oldfile) {
        formData.append('filename', this.oldfile);
        console.log("Using old file:", this.oldfile);
      }
    }
  } else {
    // Insert - just attach new file if available
    if (this.fileToUpload) {
      formData.append('File', this.fileToUpload);
    }
  }

  //  PICTURE HANDLING
  if (this.isedit) {
    if (this.fileToUploadPic) {
      formData.append('Pic', this.fileToUploadPic);
      formData.append('UpdPicChange', 'Y');
    } else {
      formData.append('UpdPicChange', 'N');
      if (this.oldPic) {
        formData.append('picturename', this.oldPic);
      }
    }
  } else {
    if (this.fileToUploadPic) {
      formData.append('Pic', this.fileToUploadPic);
    }
  }
   
  if(this.isedit)
    {

       if (this.pk_recId) {
      formData.append('pk_recId', this.pk_recId.toString());
    }
      this.service.update_candidateMaster(formData).subscribe({
        next:(result)=>{
           if(result.isSuccess)
            {
              this.toastrservice.success(result.message || 'detail updated successfully!');
              this.router.navigate(['/dash/recruitment/recruitmentdashboard/candidateMaster_list']);
            
            }  
            else
            {
               this.toastrservice.error(result.message);
            }           
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrservice.error('An error occurred during form submission');
          }

      })
    }

    else{
          this.service.add_candidateMaster(formData).subscribe({
          next:(result)=>{
             if(result.isSuccess)
             {
               this.toastrservice.success(result.message || 'detail added successfully!');
             this.router.navigate(['/dash/recruitment/recruitmentdashboard/candidateMaster_list']);
            

             }
             else{
                this.toastrservice.error(result.message || 'Failed to add detail.');
             }
        },
        
          error:()=>{
             this.toastrservice.error('An error occured during form submission');

          }


          })

    }



}


 // Fetches the employee list for the dropdown selection
 getJOblist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.service.getEmployee(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.JobList= res.data.map((Emp: any) => ({
          name: Emp.name,
          value: Emp.value
        }));
      } else {
        this.toastrservice.error("Failed to load job list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching job list:", err);
      this.toastrservice.error("Error fetching job list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}


 getZonelist(fieldName: string) {
  this.ngxUILoaderService.start();
  this.service.getEmployee(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.ZoneList= res.data.map((Emp: any) => ({
          name: Emp.name,
          value: Emp.value
        }));
      } else {
        this.toastrservice.error("Failed to load Zone list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching zone list:", err);
      this.toastrservice.error("Error fetching zone list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}


Patchform(pk_recId: string) {
  this.ngxUILoaderService.start();
  this.service.get_candidateMasterByid(pk_recId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data?.mst1) {
        const data = res.data.mst1;

      
        this.oldPic = data.picturename || '';

          this.originalEmail = data.email;
        this.originalMobile = data.mobile;

        this.candidateMaster_Details.patchValue({
          fk_jobId: data.fk_jobId,
          gender: data.gender,
          candidate_name: data.candidate_name,
          dated: this.convertDate(data.dated),
          father_name: data.father_name,
          dateofbirth: this.convertDate(data.dateofbirth),
          totexperience: data.totexperience,
          email: data.email,
          keyskills: data.keyskills,
          nativity: data.nativity,
          education: data.education,
          designation: data.designation,
          functionName: data.functionName,
          department: data.department,
          interviewer: data.interviewer,
          status: data.status,
          refname: data.refname,
          remarks: data.remarks,
          currentctc: data.currentctc,
          expectedctc: data.expectedctc,
          npmonth: data.npmonth,
          npdys: data.npdys,
          Joinindays: data.joinindays,
          fk_zoneId: data.fk_zoneId,
          mobile: data.mobile
        });
            
           this.oldfile = data.filename || '';
         this.FileName = data.filename;
       if (this.FileName) {
        this.service.getImage(this.FileName).subscribe({
          
          next: (blob) => {
            this.ImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load image:', err);
            this.ImageUrl = '';
          }
        });
      }
       this.oldPic = data.picturename || '';
         this.picFileName = data.picturename;
       if (this.picFileName) {
        this.service.getImage(this.picFileName).subscribe({
          
          next: (blob) => {
            this.picImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load image:', err);
            this.picImageUrl = '';
          }
        });
      }
        
      } else {
        this.toastrservice.error("Failed to retrieve candidate data.");
      }
      this.ngxUILoaderService.stop();
    },
    error: () => {
      this.toastrservice.error("Error retrieving candidate data.");
      this.ngxUILoaderService.stop();
    }
  });
}
convertDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

onReset():void
{
  this.candidateMaster_Details.reset();
}

// checkmobAvailability(Candidatemobile: string): void {
//   const fieldName = 'Candidatemobile'; //field name which is registere in  general table
//   const fieldValue = Candidatemobile; 
//   const generalId = this.pk_recId || ''; 

//   this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
//     next: (response) => {
//       if (response && response.isSuccess === false) {
//         this.candidateMaster_Details.get('mobile')?.setErrors({ duplicate: response.message });
//       } else {
//         this.candidateMaster_Details.get('mobile')?.setErrors(null);
//       }
//     },
//     error: (err) => {
//       console.error('Duplicate Check API Error:', err);
//       this.candidateMaster_Details.get('mobile')?.setErrors({ duplicate: 'Error checking class availability.' });
//     }
//   });
// }

// In component

checkmobAvailability(Candidatemobile: string): void {
  this.service.CheckDuplicateValue('Candidatemobile', Candidatemobile, this.pk_recId || '').subscribe({
    next: (response) => {
      
      this.isDuplicateMobile = response && response.isSuccess === false;
    },
    error: () => {
      this.isDuplicateMobile = false;
    }
  });
}


//email availability
checkemail(CandidateEmail: string): void {
  this.service.CheckDuplicateValue('CandidateEmail', CandidateEmail, this.pk_recId || '').subscribe({
    next: (response) => {
      
      this.isDuplicateemail = response && response.isSuccess === false;
    },
    error: () => {
      this.isDuplicateemail = false;
    }
  });
}



onMobileBlur(): void {
  const mobileValue = this.candidateMaster_Details.get('mobile')?.value;
  if (mobileValue && mobileValue.trim().length === 10) {
     // this.checkmobAvailability(mobileValue.trim());
    this.checkAndFetchCandidate();
  } else {
    this.isDuplicateMobile = false; // Clear duplicate warning if input is empty or invalid
  }
}

onEmailBlur(): void {
  const emailValue = this.candidateMaster_Details.get('email')?.value;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailValue && emailPattern.test(emailValue.trim())) {
   // this.checkemail(emailValue.trim());
    this.checkAndFetchCandidate();
  } else {
    this.isDuplicateemail = false; // Clear duplicate warning if input is empty or invalid
  }
}


checkemailAvailability(CandidateEmail: string): void {
  const fieldName = 'CandidateEmail'; //field name which is registere in  general table
  const fieldValue = CandidateEmail; 
  const generalId = this.pk_recId || ''; 

  this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.candidateMaster_Details.get('email')?.setErrors({ duplicate: response.message });
      } else {
        this.candidateMaster_Details.get('email')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.candidateMaster_Details.get('email')?.setErrors({ duplicate: 'Error checking class availability.' });
    }
  });
}

isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}


//   checkAndFetchCandidate() {
//   const mobile = this.candidateMaster_Details.controls['mobile'].value?.trim();
//   const email = this.candidateMaster_Details.controls['email'].value?.trim();

//   this.isDuplicateMobile = false;
//   this.isDuplicateemail = false;
//   this.candidateDetailsList = [];

//   // Check for valid email
//   if (email && this.isValidEmail(email)) {
//     this.service.get_candidateByemailmobile(email).subscribe({
//       next: (res: any) => {
//         const emailMatches = res?.data || [];
//         if (emailMatches.length) {
//           this.isDuplicateemail = true;
//           this.candidateDetailsList = emailMatches;

//           // Load image if any
//           this.candidateDetailsList.forEach(item => {
//             if (item.picturename) {
//               this.loadImage(item.picturename);
//             }
//           });
//         }
//       },
//       error: err => {
//         console.error('Email API Error:', err);
//         this.isDuplicateemail = false;
//       }
//     });
//   }

//   // Check for valid mobile
//   if (mobile && mobile.length === 10) {
//     this.service.get_candidateByemailmobile(mobile).subscribe({
//       next: (res: any) => {
//         const mobileMatches = res?.data || [];
//         if (mobileMatches.length) {
//           this.isDuplicateMobile = true;
//           this.candidateDetailsList = mobileMatches;

//           // Load image if any
//           this.candidateDetailsList.forEach(item => {
//             if (item.picturename) {
//               this.loadImage(item.picturename);
//             }
//           });
//         }
//       },
//       error: err => {
//         console.error('Mobile API Error:', err);
//         this.isDuplicateMobile = false;
//       }
//     });
//   }
// }


checkAndFetchCandidate() {
  const mobile = this.candidateMaster_Details.controls['mobile'].value?.trim();
  const email = this.candidateMaster_Details.controls['email'].value?.trim();

  // ✅ Reset flags first
  this.isDuplicateMobile = false;
  this.isDuplicateemail = false;
  this.candidateDetailsList = [];

  // ✅ In edit mode, if values match original, skip check
  if (this.isedit) {
    if (email === this.originalEmail) {
      this.isDuplicateemail = false;
    }
    if (mobile === this.originalMobile) {
      this.isDuplicateMobile = false;
    }
    
    // If both match original, return early
    if (email === this.originalEmail && mobile === this.originalMobile) {
      return;
    }
  }

  // Check for valid email (only if changed in edit mode)
  if (email && this.isValidEmail(email) && (!this.isedit || email !== this.originalEmail)) {
    this.service.get_candidateByemailmobile(email).subscribe({
      next: (res: any) => {
        const emailMatches = res?.data || [];
        
        const filteredMatches = this.isedit 
          ? emailMatches.filter((item: any) => item.pk_recId !== this.pk_recId)
          : emailMatches;
        
        if (filteredMatches.length) {
          this.isDuplicateemail = true;
          this.candidateDetailsList = filteredMatches;

          this.candidateDetailsList.forEach(item => {
            if (item.picturename) {
              this.loadImage(item.picturename);
            }
          });
        }
      },
      error: err => {
        console.error('Email API Error:', err);
        this.isDuplicateemail = false;
      }
    });
  }

  // Check for valid mobile (only if changed in edit mode)
  if (mobile && mobile.length === 10 && (!this.isedit || mobile !== this.originalMobile)) {
    this.service.get_candidateByemailmobile(mobile).subscribe({
      next: (res: any) => {
        const mobileMatches = res?.data || [];
        
        const filteredMatches = this.isedit 
          ? mobileMatches.filter((item: any) => item.pk_recId !== this.pk_recId)
          : mobileMatches;
        
        if (filteredMatches.length) {
          this.isDuplicateMobile = true;
          this.candidateDetailsList = filteredMatches;

          this.candidateDetailsList.forEach(item => {
            if (item.picturename) {
              this.loadImage(item.picturename);
            }
          });
        }
      },
      error: err => {
        console.error('Mobile API Error:', err);
        this.isDuplicateMobile = false;
      }
    });
  }
}


 imageMap: { [filename: string]: string } = {}; // filename -> base64 URL

loadImage(filename: string) {
  if (this.imageMap[filename]) return; // Don't reload if already loaded

  this.service.getImage(filename).subscribe({
    next: (blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageMap[filename] = reader.result as string;
      };
      reader.readAsDataURL(blob); // Convert blob to base64 image URL
    },
    error: (err) => {
      console.error('Failed to load image:', err);
    }
  });
}



onImageError(event: Event) {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/Image/profile_images.png';
}
    

}
