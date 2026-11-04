import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { VideoUrlUploadService } from '../services/video-url-upload.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-traning-video-url-upload',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,CommonModule,NgSelectComponent],
  templateUrl: './traning-video-url-upload.component.html',
  styleUrl: './traning-video-url-upload.component.scss'
})
export class TraningVideoUrlUploadComponent {


  VideoURLForm!: FormGroup;

isEditMode: boolean = false;
pk_TrainingId: number = 0;
selectedFile: File | null = null;
existingThumbnail: string = '';



  showError!:Boolean
  constructor(private fb: FormBuilder,private route: ActivatedRoute,
    private VideoUrlSerivce:VideoUrlUploadService, private toastrService:ToastrService,private ngxUILoaderService: NgxUiLoaderService,) { }

  application=[
    {name:'select Application', value:'S'},
    {name:'CRM', value:'CRM'},
    {name:'ERP', value:'ERP'},
    {name:'LEAVE', value:'LEAVE'},
    {name:'HRMS', value:'HRMS'},
    {name:'PROCUREMENT', value:'PROCUREMENT'},
  ]


  Filetype=[
    {name: 'select Filetype', value:'S'},
    {name: 'Video', value:'Video'},
    {name: 'Document', value:'Document'}
  ]
 


  ngOnInit(): void {
    this.VideoURLForm = this.fb.group({
      Application: ['S', Validators.required],
      Topic: [null,],
      thumbnails: [''],
      URL: [null],
      filetype: [null, Validators.required],
      isActive: [false]
    })


     this.pk_TrainingId=this.route.snapshot.params['pk_TrainingId']
         if (this.pk_TrainingId && this.pk_TrainingId) {
          this.get_Byid(this.pk_TrainingId);
          this.isEditMode = true; 

          // this.SubDeptMstForm.get('fk_deptid')?.disable();
        }

  }



onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
  }
}



//  get_Byid(pk_TrainingId: Number) {
     
       
      
//         this.VideoUrlSerivce.getById(pk_TrainingId).subscribe({
//           next: (res) => {
//             if (res.isSuccess && res.data) {
    
//               this.VideoURLForm.patchValue({

//                 pk_TrainingId:res.data.pk_TrainingId,
//                 Application:res.data.application,
//                 Topic:res.data.topic,
//                 thumbnails:res.data.thumbnails,
//                 URL:res.data.url,
//                 filetype:res.data.filetype.toString(),
//                 isActive:res.data.isActive, 
//               });
             
//               this.isEditMode = true;
    
//             }
//              else 
//              {
//               this.toastrService.error("Failed to load Category details.");
//              }
          
      
//           },
//           error: () => {
//             this.toastrService.error("Error loading Category data.");
//             this.ngxUILoaderService.stop(); // Stop loader on error
      
//           }
//         });
//       }

get_Byid(pk_TrainingId: number): void {
  this.VideoUrlSerivce.getById(pk_TrainingId).subscribe({
    next: (res: any) => {
      if (res.isSuccess && res.data) {
        const data = res.data;

        // ✅ Patch the form
        this.VideoURLForm.patchValue({
          pk_TrainingId: data.pk_TrainingId,
          Application: data.application,
          Topic: data.topic,
          URL: data.url,
          filetype: data.filetype,
          isActive: data.isActive,
          thumbnails: data.thumbnails
        });

        // ✅ Store old file and ID for update use
        this.pk_TrainingId = data.pk_TrainingId;
        this.existingThumbnail = data.thumbnails;
        this.isEditMode = true;
      } else {
        this.toastrService.error("Failed to load training video data.", "Error");
      }
    },
    error: () => {
      this.toastrService.error("Error loading training video data.", "Error");
    }
  });
}


Onsubmit() {

  debugger

  this.showError = false;



  const formvalue = this.VideoURLForm.value;
  const formData = new FormData();

  // Patch regular fields
  formData.append('UrlUpload.Application', formvalue.Application);
  formData.append('UrlUpload.Topic', formvalue.Topic);
  formData.append('UrlUpload.URL', formvalue.URL);
  formData.append('UrlUpload.filetype', formvalue.filetype);
  formData.append('UrlUpload.isActive', formvalue.isActive);

  // ✅ Add file if selected
  if (this.selectedFile) {
    formData.append('UrlUpload.FileBytes', this.selectedFile);
  }

  // ✅ Edit mode: include ID and old file if not replaced
  if (this.isEditMode) {
    formData.append('UrlUpload.pk_TrainingId', this.pk_TrainingId.toString());

    // Only add existing thumbnail if file not replaced
    if (!this.selectedFile && this.existingThumbnail) {
      formData.append('UrlUpload.thumbnails', this.existingThumbnail);
    }
  }

  // ✅ Call API
  const apiCall = this.isEditMode
  ? this.VideoUrlSerivce.update_VideoURLUploads(formData)
  : this.VideoUrlSerivce.Insert_VideoURLUploads(formData);

  apiCall.subscribe({
    next: (res: any) => {
      if (res.isSuccess) {
       this.toastrService.success(this.isEditMode ? res.message : res.message);
        this.isEditMode = true;
        this.selectedFile = null;
      } else {
        this.toastrService.error(res.message);
      }
    },
    error: () => {
        this.toastrService.error('Operation failed.', 'Error');
    }
  });
}






}
