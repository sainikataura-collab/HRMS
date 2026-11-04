import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CandidateExperienceDetailService } from '../services/candidate-experience-details.service';
import { CompanyConfigService, CompanyConfig } from '../services/company-config.service';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

@Component({
  selector: 'app-photograph-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './photograph-verification.component.html',
  styleUrl: './photograph-verification.component.scss'
})
export class PhotographVerificationComponent implements OnInit {
  photoForm!: FormGroup;
  submitted = false;
  isViewMode = false;
  photoData: any = null;
  previewPhoto: string | null = null;
  originalPhotoUrl: string | null = null;
  fileName: string = '';
  pk_recId: string = '';

  companyConfig: CompanyConfig | null = null;
  isPhotoMandatory: boolean = false;

  faceLandmarker: FaceLandmarker | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  cameraStream: MediaStream | null = null;


  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private loader: NgxUiLoaderService,
    private kycService: CandidateExperienceDetailService,
    private companyConfigService: CompanyConfigService
  ) {}

  ngOnInit(): void {
    this.pk_recId = sessionStorage.getItem('candidateKey') || '';
    this.initializeForm();
    this.loadCompanyConfig();
    this.loadPhotoDetails();
  }

  initializeForm(): void {
    this.photoForm = this.fb.group({
      PhotoFile: ['', Validators.required]
    });
  }

  get validate() {
    return this.photoForm.controls;
  }

  loadCompanyConfig(): void {
    this.companyConfig = this.companyConfigService.getConfig();
    if (this.companyConfig) {
      this.isPhotoMandatory = this.companyConfig.photographMandatory;
      if (this.companyConfig.photographLivecapture) {
        this.setupFaceLandmarker();
      }
    } else {
      this.kycService.getMandatoryDetails().subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            this.companyConfig = res.data;
            this.companyConfigService.setConfig(res.data);
            this.isPhotoMandatory = res.data.photographMandatory;
            if (this.companyConfig?.photographLivecapture) {
              this.setupFaceLandmarker();
            }
          }
        }
      });
    }
  }

  loadPhotoDetails(): void {
    this.kycService.Get_Photograph_ById().subscribe({
      next: (res) => {
        const photoName = res?.data?.photo || res?.data?.Photo;
        if (!res.isSuccess || !res.data || !photoName) {
          this.isViewMode = false;
          return;
        }

        this.photoData = { ...res.data, photo: photoName };
        this.isViewMode = true;
        this.loadImageToView(photoName);
        this.photoForm.get('PhotoFile')?.clearValidators();
        this.photoForm.get('PhotoFile')?.updateValueAndValidity();
      },
      error: () => {
        this.isViewMode = false;
      }
    });
  }

  loadImageToView(filename: string): void {
    this.kycService.getImageOnboard(filename).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.originalPhotoUrl = reader.result as string;
          this.photoData.photo = this.originalPhotoUrl;
        };
        reader.readAsDataURL(blob);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('Only JPG or PNG images are allowed for photograph', 'Error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size cannot exceed 5MB', 'Error');
      return;
    }

    this.photoForm.patchValue({ PhotoFile: file });
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewPhoto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  editPhoto(): void {
    this.isViewMode = false;
    this.photoForm.get('PhotoFile')?.clearValidators();
    this.photoForm.get('PhotoFile')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;

    const file = this.photoForm.get('PhotoFile')?.value;
    if (!file && !this.photoData?.photo) {
      this.toastr.error('Please upload your photograph.', 'Validation Error');
      return;
    }

    const fd = new FormData();
    fd.append('pk_recId', this.pk_recId);

    if (file && typeof file !== 'string') {
      fd.append('PhotoFile', file);
    }

    this.loader.start();
    this.kycService.verifyPhotograph(fd).subscribe({
      next: (res) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Photograph saved successfully.', 'Success');
          this.loadPhotoDetails();
          this.isViewMode = true;
          window.dispatchEvent(new Event('refresh-onboarding-status'));
        } else {
          this.toastr.error(res.message || 'Failed to save photograph.', 'Error');
        }
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('An error occurred while saving photograph.', 'Error');
      }
    });
  }

  reset(): void {
    this.photoForm.reset();
    this.submitted = false;
    this.fileName = '';
    this.previewPhoto = null;
    if (this.cameraStream) {
      this.stopCamera();
    }
  }

  // Mediapipe Initialization
  async setupFaceLandmarker() {
    try {
      const visionFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      );
      this.faceLandmarker = await FaceLandmarker.createFromOptions(visionFileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    } catch (err) {
      console.error('Error loading face landmarker:', err);
    }
  }

  // Camera Methods
  startCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(stream => {
          this.cameraStream = stream;
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = stream;
            this.videoElement.nativeElement.play();
          }
        })
        .catch(err => {
          console.error('Error accessing camera: ', err);
          this.toastr.error('Unable to access camera. Please check permissions.', 'Error');
        });
    } else {
      this.toastr.error('Camera not supported in this browser.', 'Error');
    }
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  }

  capturePhoto(): void {
    if (!this.videoElement || !this.videoElement.nativeElement) {
      this.toastr.error('Camera not started.', 'Error');
      return;
    }
    
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (this.faceLandmarker) {
        const detections = this.faceLandmarker.detect(canvas);
        if (!detections.faceLandmarks || detections.faceLandmarks.length === 0) {
          this.toastr.error('No human face detected! Please make sure your face is visible in the camera.', 'Face Detection Failed');
          return;
        }
      }

      const dataUrl = canvas.toDataURL('image/jpeg');
      this.previewPhoto = dataUrl;
      
      // Convert DataURL to File
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], 'camera_capture.jpg', { type: mimeString });
      
      this.photoForm.patchValue({ PhotoFile: file });
      this.photoForm.get('PhotoFile')?.updateValueAndValidity();
      
      this.stopCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }
}

