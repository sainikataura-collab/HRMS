import { Component, OnInit, OnDestroy } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  CameraPreview,
  CameraPreviewOptions
} from '@capacitor-community/camera-preview';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendancemarkService } from '../Services/attendancemark.service';
import { ToastrService } from 'ngx-toastr';
import { AfterViewInit } from '@angular/core';
import { OlaMaps } from 'olamaps-web-sdk';
import { UiStateService } from '../../../../shared/services/ui-state.service';


import {
  FaceLandmarker,
  FilesetResolver,
  FaceLandmarkerResult
} from '@mediapipe/tasks-vision';
//import { ConfirmationService } from '../../../../shared/services/confirmation.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-attendance-mark-globe',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './attendance-mark-globe.component.html',
  styleUrl: './attendance-mark-globe.component.scss'
})
export class AttendanceMarkGlobeComponent implements OnInit, OnDestroy,AfterViewInit {

  attendanceConfig = {
  photoMode: 1, // 1 = None, 2 = Photo, 3 = Photo + Face Detection
  isGeoFenceMandatory: true
};

  markAttendance!:number ;
  
  //markAttendance 
  /*
    --1-Not required
    --2-Capture Photo
    --3-Capture Photo + FaceDetection
  */

  isInsideGeoFenceMandatoryForMarkAttendance:boolean = true;

  IsOnMobile = false;
  isLoading = true;

  currentTime: string = '';
  currentDate: string = '';

  cameraStarted = false;
  cameraMode = false;
  private faceFoundCount = 0;

 
  private visionFileset!: ReturnType<typeof FilesetResolver.forVisionTasks>;

    private faceLandmarkerImage!: FaceLandmarker;
    
    private faceLandmarkerVideo!: FaceLandmarker;
      private samplingInterval: any;

   

  // Config fetched from API
  officeLat = 0;
  officeLng = 0;
  geofenceRadius = 0;
  isMobileAllowed = false;
  useGeofence = false;

   insideGeofence = false;  //original
  

  faceDetected = false;
  captureStatus = '';
  annotatedPhotoUrl: string | null = null;

  private mapInstance: any;
private olaMaps: any;

  userLat = 0;
  userLng = 0;
  distanceFromOffice: number | null = null;

  punchType: 'in' | 'out' = 'in';
  inPunchTime: string | null = null;
  workingDuration: string | null = null;

  private watchId: string | null = null;
  

  private lastInsideStatus: boolean | null = null;
  private insideAudio = new Audio('assets/sounds/inside.mp3');
  private outsideAudio = new Audio('assets/sounds/outside.mp3');
  
  private viewReady = false;
private shouldInitMap = false;



currentLocationAddress: string = '';
officeLocationAddress: string = '';


  constructor(private attendanceService:AttendancemarkService,private toastrService:ToastrService,private uiStateService: UiStateService) {}
  async ngOnInit() {
   
   this.IsOnMobile = Capacitor.isNativePlatform();  
      
    this.olaMaps = new OlaMaps({
        apiKey: 'rFbNvM7s6utdC0GIOA7JlFzCvzJ33Te4poqsytwU'
       
    });   
    
    this.updateDateTime();
    // Update time every second
    setInterval(() => {
      this.updateDateTime();
    }, 1000);


    if (!this.IsOnMobile) {
      this.isLoading = false;
      return;
    }  

    this.initFaceLandmarkers()
      .then(() => this.fetchConfigAndStart())
      .catch(err => {
        this.toastrService.error('🧠 Face detection init failed');
        //console.error('FaceLandmarker setup failed:', err);
        this.isLoading = false;
      });


    
    this.attendanceService.get_AttendanceMarkInfo()      
      .subscribe(async(res) => {
        //console.log(res)
        if (!res.isSuccess || !res.data.isMobileAttendanceAllowed) {
          alert('📱 Mobile attendance is not allowed for the location.Please contact HR.');
          this.isLoading = false;
          return;
        }


        const firstLocation = res.data.locations?.[0];
        if (!firstLocation) {
          alert('❌ Your coordinates not configured in sytem.Please contact HR.');
          this.isLoading = false;
          return;
        }    

        this.officeLat = parseFloat(firstLocation.latitude);
        this.officeLng = parseFloat(firstLocation.longitude);
        this.geofenceRadius = parseFloat(firstLocation.distance);
        this.isMobileAllowed = true;
        this.useGeofence = res.data.isGeoFence;
        this.isInsideGeoFenceMandatoryForMarkAttendance= res.data.isGeoFence; //true or false
        this.markAttendance = parseInt(firstLocation.markAttendance);
   
        this.attendanceConfig.isGeoFenceMandatory = res.data.isGeoFence;
        this.attendanceConfig.photoMode = parseInt(firstLocation.markAttendance);


       
        // ✅ Set flag so ngAfterViewInit runs logic
        this.shouldInitMap = true;
         // 🧠 Only init map if view is ready
          if (this.viewReady) {
            setTimeout(() => this.initMap(), 0);
          }
        await this.checkGeofenceAndCamera();

        this.officeLocationAddress = 'Loading...';
        this.getFormattedAddress(this.officeLat, this.officeLng).then(addr => {
          this.officeLocationAddress = addr;
        });
      });
  }


  

  updateDateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g. 11:39
    this.currentDate = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }); 
    // e.g. 24/06/2025 (Tue)
  }


  private async fetchConfigAndStart() {
  try {
    

    // Begin getting current position
    const loc = await Geolocation.getCurrentPosition();
    this.userLat = loc.coords.latitude;
    this.userLng = loc.coords.longitude;

    
    this.captureStatus = 'Location acquired. Please open the camera manually.';
    this.isLoading = false;
  } catch (err) {
    //console.error('Error in fetchConfigAndStart:', err);
    this.isLoading = false;
     this.captureStatus = 'Failed to get location.';
  }
}

private async initFaceLandmarkers() {
  try {
    const [imageLandmarker, videoLandmarker] = await Promise.all([
      this.setupFaceLandmarker('IMAGE'),
      this.setupFaceLandmarker('VIDEO')
    ]);

    this.faceLandmarkerImage = imageLandmarker;
    this.faceLandmarkerVideo = videoLandmarker;
  } catch (err) {
    throw new Error('Failed to initialize face landmarkers: ' + err);
  }
}


  async setupFaceLandmarker(mode: 'IMAGE' | 'VIDEO') {
    const visionFileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    return await FaceLandmarker.createFromOptions(visionFileset, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      },
      runningMode: mode,
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }



ngAfterViewInit(): void {
  
  this.viewReady = true;

  if (this.shouldInitMap) {
    setTimeout(() => {
      this.waitForMapReady();
    }, 300); // Delay slightly to allow layout to stabilize
  }
}


waitForMapReady() {
  const mapEl = document.getElementById('map');

  if (!mapEl) {
   // console.warn('❌ #map not found in DOM');
    return;
  }

  const width = mapEl.offsetWidth;
  const height = mapEl.offsetHeight;



  if (width === 0 || height === 0) {
    // Try again after a short delay
    //console.warn('⚠️ Map container not yet sized, retrying...');
    setTimeout(() => this.waitForMapReady(), 200);
    return;
  }

  this.initMap(); // ✅ Now it's safe to call
}


  
// Fetch formatted address from Ola Maps API
getFormattedAddress(lat: number, lng: number): Promise<string> {
  const apiKey = 'rFbNvM7s6utdC0GIOA7JlFzCvzJ33Te4poqsytwU'; // Replace with actual key
  const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${apiKey}`;

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data?.results?.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Address not found';
    })
    .catch(err => {
      //console.error('Failed to fetch address:', err);
      return 'Unable to fetch address';
    });
}


  // 1. Init Ola Maps
  initMap() {
    document.getElementById('map')!.innerHTML = ''; // 🔥 force DOM reset

   
      const container = document.getElementById('map');
    if (!container) {
     // console.error('❌ #map container not found in DOM');
      return;
    }

    if (!this.officeLat || !this.officeLng) {
    //console.error("❌ Lat/lng not set yet.");
    return;
  }
 

  if (this.mapInstance?.remove) {
  this.mapInstance.remove();
  this.mapInstance = null;
}


    this.mapInstance = this.olaMaps.init({
     // style: "https://api.olamaps.io/styleEditor/v1/styleEdit/styles/6486b437-8de4-4eb9-af4e-5c05e4049b9f/MyMapStyle",   
    style:"https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
     container: 'map',
    center: [this.officeLng, this.officeLat],
    zoom: 15
  });
  


    const icon = document.createElement('div');
      
    icon.className = 'office-marker';
    icon.title = 'Office Location';

   icon.innerHTML = `
  <lord-icon
    src="https://cdn.lordicon.com/bljgubbm.json"
    trigger="loop"
    style="width:50px;height:50px;" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
  </lord-icon>
`;







    icon.style.fontSize = '28px';
    icon.style.lineHeight = '30px';
    icon.style.textAlign = 'center';
    icon.style.width = '30px';
    icon.style.height = '30px';
    


 

    this.olaMaps.addMarker({ element: icon, offset: [0, -10], anchor: 'bottom' })
    .setLngLat([this.officeLng, this.officeLat])
    .addTo(this.mapInstance);

     
  }

  // 2. Geofence & camera init
  async checkGeofenceAndCamera() { 

      const pos = await Geolocation.getCurrentPosition().catch(err => {
      this.toastrService.error('📍 Unable to get your current location.Please retry after sometime and ensure location is On.');
     // console.error('Geolocation error:', err);
      return null;
    });

    if (!pos) return;

    this.userLat = pos.coords.latitude;
    this.userLng = pos.coords.longitude;
    this.updateDistance();

    this.startWatchingGeofence();

    this.currentLocationAddress = 'Loading...';
    this.getFormattedAddress(this.userLat, this.userLng).then(addr => {
  this.currentLocationAddress = addr;
  }); 

 
 
    if (this.insideGeofence) {
      this.insideAudio.play();
    } else {
      this.outsideAudio.play();
    }

  
    this.isLoading = false;
  }

  startWatchingGeofence() {
    Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position) => {
        if (!position) return;
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        this.updateDistance();

        const now = this.distanceFromOffice! <= this.geofenceRadius;
        
       
        if (this.lastInsideStatus !== null && now !== this.lastInsideStatus) {
          now ? this.insideAudio.play() : this.outsideAudio.play();
        }
        

        this.insideGeofence = now; 
        
        this.lastInsideStatus = now;
      }
    ).then((watchId) => {
  this.watchId = watchId;
});

  } 

  updateDistance() {
    const R = 6371e3;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const φ1 = toRad(this.userLat),
      φ2 = toRad(this.officeLat),
      Δφ = toRad(this.officeLat - this.userLat),
      Δλ = toRad(this.officeLng - this.userLng);
    const a = Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    this.distanceFromOffice = R * c;
    this.insideGeofence = !this.useGeofence || this.distanceFromOffice <= this.geofenceRadius;   //original
    
  
  }

  // 3. Camera + face detection

  async startCameraFullScreen(data:string) {
      this.annotatedPhotoUrl = null;
    this.captureStatus = '';
    this.faceDetected = false;

    
    if(data=='in'){
      this.punchType='in';
    }else{
      this.punchType='out';
    }

    
  const opts: CameraPreviewOptions = {
    parent: 'cameraPreview',
    position: 'front',
    className: 'cameraPreview',
    width: window.innerWidth,
    height: window.innerHeight,
    disableAudio: true,
    toBack: true
  };

  try {
    await CameraPreview.start(opts);
    this.cameraStarted = true;
    this.cameraMode = true; // 👈 Hide rest of the UI 
     this.uiStateService.setCameraMode(true); // 🔥 Share state globally 

     // 👇 Only show status or run detection if photoMode is 3
    if (this.attendanceConfig.photoMode === 3) {
      this.captureStatus = 'Please align your face and wait for sometime.';
      this.samplingInterval = setInterval(() => this.runFaceDetectionSample(), 300);
    } else {
      this.captureStatus = '📸 Tap capture to take photo.';
      this.faceDetected = true; // ✅ Always enable capture in mode 2
    }

    //this.captureStatus = 'Please align your face and wait for sometime.';    
   // this.samplingInterval = setInterval(() => this.runFaceDetectionSample(), 300);
  } catch (err) {
    //console.error('👁️ Failed to start camera preview', err);
  }
}


  async runFaceDetectionSample() {
    const sample = await CameraPreview.captureSample({ quality: 50 });
    const img = new Image();
    img.src = `data:image/jpeg;base64,${sample.value}`;
    await img.decode();   

    const results: FaceLandmarkerResult = this.faceLandmarkerVideo.detectForVideo(
      img,
      performance.now()
    );

    if (results.faceLandmarks?.length > 0) {
      this.faceFoundCount++;
      if (this.faceFoundCount >= 3) {
      this.captureStatus = '✅ Live face detected — ready to capture';
      this.faceDetected = true;
      clearInterval(this.samplingInterval);
    }
  
    } else {
      this.faceFoundCount = 0;
      this.captureStatus = '👀 No live face detected yet…';
      this.faceDetected = false;
    }
  }

  // 4. Submit or retry
  async captureAndSubmit() {
    this.annotatedPhotoUrl=null; //reset image

      this.captureStatus = 'Capturing...';

      // 1. Skip if photoMode is 1
  if (this.attendanceConfig.photoMode === 1) {
   // console.warn('📵 No photo capture required');
    return;
  }

     //  2. Check geofence if mandatory
  if (this.attendanceConfig.isGeoFenceMandatory && !this.insideGeofence) {
    alert('🔴 Outside geofence. Cannot submit.');
    return;
  }
  
   //  3. If face detection is required and not confirmed
  if (this.attendanceConfig.photoMode === 3 && !this.faceDetected) {
    alert('⚠️ No face detected. Please align and wait.');
    return;
  }

//4. capture photo
    const pic = await CameraPreview.capture({ quality: 90 });
    const img = new Image();
    img.src = `data:image/jpeg;base64,${pic.value}`;
     await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    }); 


    //  5. If face detection needed, run extra check
     let finalCheck: FaceLandmarkerResult | null = null;

    //const finalCheck: FaceLandmarkerResult = await this.faceLandmarkerImage.detect(img);
    if (this.attendanceConfig.photoMode === 3) {
    finalCheck = await this.faceLandmarkerImage.detect(img);
    if (!finalCheck.faceLandmarks?.length) {
      alert('❌ Face lost. Please retry.');
      await CameraPreview.stop();
      return this.startCameraFullScreen(this.punchType);
    }
  }

    // if (!finalCheck.faceLandmarks?.length) {
    //   alert('❌ Face lost. Please retry.');
    //   await CameraPreview.stop();
    //   return this.startCameraFullScreen(this.punchType);
    // }

    //6. get address
    await this.getFormattedAddress(this.userLat, this.userLng).then(addr => {
      this.currentLocationAddress = addr;
      this.updateDistance();
    });


  //7. Annotate or use raw image  
   const url =  this.drawAnnotations(img);
   

    this.annotatedPhotoUrl = url;
 
    //  8. Stop camera
    await CameraPreview.stop();
        this.cameraStarted = false;
     this.cameraMode = false; // 👈 Show UI again
     this.uiStateService.setCameraMode(false); // 🔥 Exit global camera mode

setTimeout(() => {
  this.waitForMapReady(); // or this.initMap();
}, 300);
   }

  calculateDuration(start: string, end: string) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  async retryCapture() {
    this.annotatedPhotoUrl = null;
    this.captureStatus = '';
    this.faceDetected = false;
    this.cameraStarted = false;
    this.cameraMode = false; // 👈 Show rest of the UI again
    this.uiStateService.setCameraMode(false); // 🔥 Exit global camera mode

    await CameraPreview.stop();
    await this.startCameraFullScreen(this.punchType);
  }

  ngOnDestroy() {
      if (this.samplingInterval) {
        clearInterval(this.samplingInterval);
      }
   
    if (this.watchId) Geolocation.clearWatch({ id: this.watchId });
    
    CameraPreview.stop();
     this.uiStateService.setCameraMode(false); // 🔥 Share state globally 
      // Dispose face landmarkers
      if (this.faceLandmarkerImage) this.faceLandmarkerImage.close();
      if (this.faceLandmarkerVideo) this.faceLandmarkerVideo.close();
  }


  startCameraFullScreenPrompt(data:string){
    /*
    let message='';
    let title = '';
    if(data=='in'){
      message ='Are you sure to PunchIn ?'
    }else{
      message = 'Are you sure to PunchOut ?'
    }
     this.confirmationService.confirmAction(message,title)
          .then((confirmed) => {
            if (confirmed) {
              this.startCameraFullScreen(data);
            }
          });
    */

   
      if(this.userLat==null || this.userLng==null || this.userLat== 0 || this.userLng == 0){
         alert('System could not fetch your current location.Please retry after some time.Please ensure to enable location also(if not enabled already).');
          return;
        }

     if (this.attendanceConfig.photoMode === 1) {
    // Direct submission, no camera

      this.getFormattedAddress(this.userLat, this.userLng).then(addr => {
      this.currentLocationAddress = addr;
      this.updateDistance();

     
      this.submitAttendance();
      
      
     
    });
     }else{
      this.startCameraFullScreen(data);    
     }
    
  } 
  
private drawAnnotations(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.height; // 👈 Swap dimensions for portrait
  canvas.height = img.width;

  const ctx = canvas.getContext('2d')!;
  ctx.save();

  // ✅ Step 1: Rotate 90° clockwise to make portrait
  ctx.translate(canvas.width, 0);
  ctx.rotate(Math.PI / 2);

  // ✅ Step 2: Mirror horizontally (selfie-style)
  ctx.translate(img.width, 0);
  ctx.scale(-1, 1);

  // ✅ Step 3: Draw image with corrected orientation
  ctx.drawImage(img, 0, 0);

  ctx.restore();

  // ✅ Step 4: Add text annotation (top-left)
  ctx.fillStyle = 'red';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Lat: ${this.userLat.toFixed(5)}`, 10, 20);
  ctx.fillText(`Lng: ${this.userLng.toFixed(5)}`, 10, 40);
  ctx.fillText(`Time: ${new Date().toLocaleString()}`, 10, 60);

  return canvas.toDataURL('image/jpeg');
}


async submitAttendance() {
  //if (!this.annotatedPhotoUrl) return;

  try {
    //const url = this.annotatedPhotoUrl;

    
    
    const form = new FormData();
    // if(url!=''){
    //   const blob = await (await fetch(url)).blob();
    //    form.append('AttendanceImageFile', blob, `att${Date.now()}.jpg`);
    // }
   
    // ✅ Only attach photo if it's available (for mode 2 or 3)
    if (this.annotatedPhotoUrl) {
      const blob = await (await fetch(this.annotatedPhotoUrl)).blob();
      form.append('AttendanceImageFile', blob, `att${Date.now()}.jpg`);
    }

    form.append('Latitude', this.userLat.toString());
    form.append('Longitude', this.userLng.toString());

    form.append('AttenType', this.punchType === 'in' ? '1' : '2');
    form.append('Distance', this.distanceFromOffice?.toString() || '');
    form.append('LocAddress', this.currentLocationAddress);
    if(this.insideGeofence){
       form.append('IsOutOfRange', '0');
    }else{
       form.append('IsOutOfRange', '1');
    }
   

 

    this.attendanceService.insert_AttendanceMarkInfo(form).subscribe({
      next: (result) => {
        if (result.isSuccess) {
          this.toastrService.success("✅ Attendance marked successfully.");
          this.captureStatus = '✅ Attendance marked!';
          this.annotatedPhotoUrl = null;
        } else {
          this.toastrService.error(result.message);
          this.captureStatus = '❌ Attendance not marked!';
          this.annotatedPhotoUrl = null;
        }
      },
      error: () => {
        this.toastrService.error('❌ Error during submission');
      }
    });

  } catch (error) {
    //console.error("Submit Error:", error);
    this.toastrService.error('❌ Failed to prepare submission data');
  }
}




}