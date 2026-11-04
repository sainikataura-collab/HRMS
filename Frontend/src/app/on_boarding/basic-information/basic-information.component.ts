import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';

@Component({
  selector: 'app-basic-information',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './basic-information.component.html',
  styleUrl: './basic-information.component.scss'
})
export class BasicInformationComponent implements OnInit {
  @ViewChild('profileFileInput') profileFileInput!: ElementRef;
  
  basicInfoForm!: FormGroup;
  submitted = false;
  
  statList: any[] = [];
  cityList: any[] = [];
  fileName: { [key: string]: string } = {};
  
  // ✅ Use candidateKey instead of pk_recId
  candidateKey: string = '';
  isViewMode: boolean = true;  // ✅ Default to view mode
  basicInfoData: any = null;
  originalPhotoUrl: string = '';
  isExistingRecord: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private ngxUILoaderService: NgxUiLoaderService,
    private kycService: CandidateExperienceDetailService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // ✅ Get candidate key from session storage (set by guard)
    this.candidateKey = sessionStorage.getItem('candidateKey') || '';
    
    if (!this.candidateKey) {
      this.toastrService.error('Session expired. Please use the link from your email.', 'Error');
      return;
    }
    
    // ✅ Always try to load existing data first
    this.loadBasicInformation();
  }

  initializeForm(): void {
    this.basicInfoForm = this.formBuilder.group({
      StateId: ['', [Validators.required]],
      CityId: [''],
      Pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      Address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      ProfileImageFile: [null]
    });
  }

  get validate() {
    return this.basicInfoForm.controls;
  }

  loadBasicInformation(): void {
    this.ngxUILoaderService.start();
    
    // ✅ Call API with candidate key in header (handled by service)
    this.kycService.Get_BasicInfo().subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        
        if (res.isSuccess && res.data) {
          // ✅ Data exists - show in view mode
          this.basicInfoData = res.data;
          if(res.data.stateId ==null){
           this.isViewMode = false;
          this.isExistingRecord = false;
          this.getStateList('State');
          }else {
            // Load profile image if exists
            if (this.basicInfoData.photo) {
              this.loadImageToView(this.basicInfoData.photo);
            }
            // Populate form for potential editing
            this.populateForm(res.data);
          }
          
          
          
          
          
          
        } else {
          // ✅ No data found - show form in edit mode (first time user)
          this.isViewMode = false;
          this.isExistingRecord = false;
          this.getStateList('State');
        }
      },
      error: (err: any) => {
        this.ngxUILoaderService.stop();
     
        //  On error or 404, treat as new entry
        this.isViewMode = false;
        this.isExistingRecord = false;
        this.getStateList('State');
      }
    });
  }

  populateForm(data: any): void {
    this.basicInfoForm.patchValue({
      StateId: data.stateId || '',
      CityId: data.cityId || '',
      Pincode: data.pincode || '',
      Address: data.address || ''
    });
  }

  loadImageToView(filename: string) {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (!this.basicInfoData) this.basicInfoData = {};
          this.basicInfoData.photo = reader.result as string;
          this.originalPhotoUrl = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
       
      }
    });
  }

  downloadImage(imageUrl: string): void {
    // ✅ If it's already a data URL, create blob from it
    if (imageUrl.startsWith('data:image')) {
      const arr = imageUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], {type: mime});
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile_image_${new Date().getTime()}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }
    
    // ✅ Otherwise fetch from server
    this.kycService.getImageOnboard(imageUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageUrl;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
       
        this.toastrService.error('Failed to download image');
      }
    });
  }

  enableEditMode(): void {
    this.isViewMode = false;
    
    // Load state and city lists only when entering edit mode
    if (this.statList.length === 0) {
      this.getStateList('State');
    }
    
    // If state is already selected, load cities
    if (this.basicInfoData?.stateId && this.cityList.length === 0) {
      this.getCity(this.basicInfoData.stateId);
    }
    
    // Preserve the original photo URL for display in edit mode
    if (this.originalPhotoUrl && this.basicInfoData) {
      this.basicInfoData.profileImageUrl = this.originalPhotoUrl;
    }
  }

  cancelEdit(): void {
    // ✅ Only go back to view mode if data exists
    if (this.isExistingRecord) {
      this.isViewMode = true;
      this.submitted = false;
      this.fileName = {};
      
      // Clear the preview and reset to original photo
      if (this.basicInfoData) {
        this.basicInfoData.profileImageUrl = null;
        this.populateForm(this.basicInfoData);
      }
      
      // Reset file input
      this.basicInfoForm.patchValue({
        ProfileImageFile: null
      });
    } else {
      // ✅ If new entry, just reset the form
      this.reset();
    }
  }

  onStateChange(selectedState: string): void {
    if (!selectedState || selectedState === undefined) {
      this.cityList = [];
      this.basicInfoForm.get('CityId')?.reset();
    } else {
      this.getCity(selectedState);
      this.basicInfoForm.get('CityId')?.reset();
    }
  }

  getStateList(fieldName: string): void {
    this.kycService.getStateList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // this.statList = res.data.map((state: any) => ({
          //   name: state.name,
          //   value: state.value
          // }));
          
        this.statList = res.data.filter((state: any) => state.value != null);
        } else {
          this.toastrService.error('Failed to load state list.');
        }
      },
      error: (err) => {
      
        this.toastrService.error('Error fetching state list.');
      }
    });
  }

  getCity(StateId: string): void {
    this.ngxUILoaderService.start();
    this.kycService.getcityByStateId(StateId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          // this.cityList = res.data.map((city: any) => ({
          //   name: city.name,
          //   value: city.value
          // }));
          this.cityList = res.data.filter((city: any) => city.value != null);
        } else {
          this.cityList = [];
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
     
        this.toastrService.error('Error fetching city list. Please try again.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.toastrService.error('Only JPG, PNG files are allowed', 'Error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastrService.error('File size should not exceed 5MB', 'Error');
        return;
      }

      this.basicInfoForm.patchValue({
        [fileType]: file
      });
      this.fileName[fileType] = file.name;

      // Preview the new image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (!this.basicInfoData) this.basicInfoData = {};
        this.basicInfoData.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  OnSubmit(): void {
    this.submitted = true;

    if (this.basicInfoForm.invalid) {
      // this.toastrService.error('Please fill all required fields', 'Error');
      return;
    }

    const formData = new FormData();
    
    // ✅ Don't send pk_recId - backend gets it from candidate key
    formData.append('StateId', (this.basicInfoForm.get('StateId')?.value?.value || this.basicInfoForm.get('StateId')?.value || ''));
    formData.append('CityId', (this.basicInfoForm.get('CityId')?.value?.value || this.basicInfoForm.get('CityId')?.value || ''));
    formData.append('Pincode', this.basicInfoForm.get('Pincode')?.value || '');
    formData.append('Address', this.basicInfoForm.get('Address')?.value || '');

    // Append profile image if selected
    const profileFile = this.basicInfoForm.get('ProfileImageFile')?.value;
    if (profileFile) {
      formData.append('ProfileImageFile', profileFile);
    }

    this.ngxUILoaderService.start();

    // ✅ Service automatically adds X-Candidate-Key header
    this.kycService.Save_BasicInfo(formData).subscribe({
      next: (result) => {
        this.ngxUILoaderService.stop();
        if (result.isSuccess) {
          this.toastrService.success(result.message || 'Basic information saved successfully!', 'Success');
          
          // ✅ Reload data and switch to view mode
          this.loadBasicInformation();
          this.isViewMode = true;
          this.isExistingRecord = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
          this.fileName = {};
          this.submitted = false;
        } else {
          this.toastrService.error(result.message || 'Failed to save basic information', 'Error');
        }
      },
      error: (error) => {
        this.ngxUILoaderService.stop();
        
        if (error.status === 401) {
          this.toastrService.error('Session expired. Please use the link from your email again.', 'Error');
        } else if (error.status === 403) {
          this.toastrService.error('Onboarding already completed. Cannot edit.', 'Error');
        } else {
          this.toastrService.error('An error occurred while saving', 'Error');
        }
      }
    });
  }

  reset(): void {
    this.basicInfoForm.reset();
    this.submitted = false;
    this.fileName = {};
    
    if (this.basicInfoData) {
      this.basicInfoData.profileImageUrl = null;
    }
  }

  goBack(): void {
    // ✅ Only show back button for existing records in edit mode
    if (!this.isViewMode && this.isExistingRecord) {
      this.cancelEdit();
    }
  }

  restrictNonNumeric(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!allowedKeys.includes(event.key) && isNaN(Number(event.key))) {
      event.preventDefault();
    }
  }
}
