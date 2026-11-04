import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KycService } from '../service/kyc.service';

import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
  selector: 'app-kyc-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kyc-details.component.html',
  styleUrl: './kyc-details.component.scss'
})
export class KycDetailsComponent {
  kyc:  any={};
  aadhaarFrontImage: string | null = null;
  aadhaarBackImage: string | null = null;
  panCardPath: string | null = null;
  gstDocPath: string | null = null;
  ngxUILoaderService = inject(NgxUiLoaderService);
  constructor(public kycservice:KycService,public router:Router,private route: ActivatedRoute,) { 
  }
  ngOnInit(): void {
    this.ngxUILoaderService.start();
   
    this.kycservice.get_details().subscribe(res=>{
      this.kyc=res.data;
      console.log(res)
      this.aadhaarFrontImage = this.kyc.aadhaarFrontPath || null;
      this.aadhaarBackImage = this.kyc.aadhaarBackPath || null;
      this.panCardPath = this.kyc.panCardPath || null;
      this.gstDocPath = this.kyc.gstDocPath || null;
    })
    this.ngxUILoaderService.stop(); 
  }
  
  
  showImage(imageKey: string): void {
    const imagePath = this.kyc[imageKey];  // Get the image path from the KYC data
    if (imagePath) {
      this.kycservice.getImage(imagePath).subscribe(
         (blob) => {
       
          const imageUrl = URL.createObjectURL(blob);
          // Open the image in a new tab
          window.open(imageUrl, '_blank');
          // Convert Blob to a Data URL
        },
        (error) => {
          console.error('Error fetching image:', error);
        }
      );
    }
  }
}  