import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../../../environments/environment';


//  Reuse same interfaces from final-submission
interface BasicInfo {
  pk_recId: string;
  candidate_name: string;
  email: string;
  mobile: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  pincode?: string;
  address?: string;
  photo?: string;
}

interface AadhaarDetails {
  pk_recId: string;
  aadhaarNo?: string;
  aadhaarName?: string;
  aadhaarDob?: string;
  aadhaarAddress?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
}

interface PANDetails {
  pk_recId: string;
  panNo?: string;
  panName?: string;
  panDob?: string;
  panCard?: string;
}

interface QualificationDetails {
  pk_cqualid: number;
  qualification: string;
  subject?: string;
  institute: string;
  passyear: number;
  marks: number;
  division: string;
  documentupload?: string;
}

interface ExperienceDetails {
  pk_cpjobid: number;
  compname: string;
  designation: string;
  department?: string;
  fromdate: string;
  todate: string;
  ctc: number;
  documentupload?: string;
  offerletter?: string;
}

interface FamilyDetails {
  fk_recId: string;
  membername: string;
  relation: string;
  dob: string;
  qualification?: string;
  occupation?: string;
}

interface CandidateSummary {
  basicInfo: BasicInfo | null;
  aadhaarDetails: AadhaarDetails | null;
  panDetails: PANDetails | null;
  qualifications: QualificationDetails[];
  experience: ExperienceDetails[];
  family: FamilyDetails[];
}

@Component({
  selector: 'app-candidate-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-review.component.html',
  styleUrl: './candidate-review.component.scss'
})
export class CandidateReviewComponent implements OnInit {
  candidateKey: string = '';
  candidateId: string = '';
  candidateName: string = '';
  onboardingStatus: string = '';
  completionDate: string = '';
  loading: boolean = true;
  isDownloading: boolean = false;

  imageUrls = {
    profilePhoto: '',
    aadhaarFront: '',
    aadhaarBack: '',
    panCard: ''
  };

  candidateSummary: CandidateSummary = {
    basicInfo: null,
    aadhaarDetails: null,
    panDetails: null,
    qualifications: [],
    experience: [],
    family: []
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.candidateKey = this.route.snapshot.params['key'];
    
    if (!this.candidateKey) {
      this.toastr.error('Invalid candidate key', 'Error');
      this.loading = false;
      return;
    }

    this.loadCandidateDetails();
  }

  loadCandidateDetails() {
    this.loading = true;
    
    this.http.get<any>(`${environment.baseURL1}/HRCandidateReview/review?key=${this.candidateKey}`)
      .subscribe({
        next: (response: any) => {
          if (response.isSuccess && response.data) {
            this.candidateId = response.data.candidateId;
            this.candidateName = response.data.candidateName;
            this.onboardingStatus = response.data.onboardingStatus;
            this.completionDate = response.data.completionDate;
            
            //  Extract summary
            this.candidateSummary = {
              basicInfo: response.data.summary.basicInfo || null,
              aadhaarDetails: response.data.summary.aadhaarDetails || null,
              panDetails: response.data.summary.panDetails || null,
              qualifications: response.data.summary.qualifications || [],
              experience: response.data.summary.experience || [],
              family: response.data.summary.family || []
            };

            // Load images
            this.loadImages();
          } else {
            this.toastr.error(response.message || 'Failed to load candidate details', 'Error');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading candidate details', err);
          this.toastr.error('Failed to load candidate details', 'Error');
          this.loading = false;
        }
      });
  }

  loadImages(): void {
    // Load profile photo
    if (this.candidateSummary.basicInfo?.photo) {
      this.loadImage(this.candidateSummary.basicInfo.photo, 'profilePhoto');
    }

    // Load Aadhaar images
    if (this.candidateSummary.aadhaarDetails?.aadhaarFront) {
      this.loadImage(this.candidateSummary.aadhaarDetails.aadhaarFront, 'aadhaarFront');
    }
    if (this.candidateSummary.aadhaarDetails?.aadhaarBack) {
      this.loadImage(this.candidateSummary.aadhaarDetails.aadhaarBack, 'aadhaarBack');
    }

    // Load PAN card
    if (this.candidateSummary.panDetails?.panCard) {
      this.loadImage(this.candidateSummary.panDetails.panCard, 'panCard');
    }
  }

  loadImage(filename: string, imageType: keyof typeof this.imageUrls): void {
    this.http.get(`${environment.baseURL1}/CandidateExperienceDetails/images/${filename}`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imageUrls[imageType] = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error(`Failed to load ${imageType}`, err);
      }
    });
  }

  getFileUrl(fileName: string): string {
    if (!fileName || !this.candidateKey) return '';
    return `${environment.baseURL1}/CandidateQualificationDetails/documents/${fileName}?key=${this.candidateKey}`;
  }

  downloadPDF(): void {
    const summaryElement = document.getElementById('candidate-summary-section');
    
    if (!summaryElement) {
      this.toastr.error('Cannot generate PDF', 'Error');
      return;
    }

    this.isDownloading = true;
    this.toastr.info('Generating PDF...', 'Please Wait');

    html2canvas(summaryElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      allowTaint: true,
      imageTimeout: 0
    }).then(canvas => {
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2) - 10;
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      let heightLeft = imgHeight;
      let position = margin;
      
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
      
      while (heightLeft > 10) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }
      
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      const pageCount = pdf.internal.pages.length - 1;
      
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        pdf.setDrawColor(200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `HR Review - ${this.candidateName}`,
          margin,
          pageHeight - 7,
          { align: 'left' }
        );
        
        pdf.setFontSize(7);
        pdf.setTextColor(120);
        pdf.text(
          `Generated: ${currentDate}`,
          margin,
          pageHeight - 3,
          { align: 'left' }
        );
        
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 5,
          { align: 'right' }
        );
      }
      
      pdf.setProperties({
        title: `HR Review - ${this.candidateName}`,
        subject: 'Candidate Onboarding Review',
        author: 'HR Team',
        keywords: 'onboarding, candidate, hr review',
        creator: 'HR Management System'
      });
      
      const fileName = `HR_Review_${this.candidateName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      this.toastr.success('PDF downloaded successfully!', 'Success');
      this.isDownloading = false;
    }).catch(error => {
      console.error('PDF generation error:', error);
      this.toastr.error('Failed to generate PDF', 'Error');
      this.isDownloading = false;
    });
  }

  printDetails(): void {
    window.print();
  }

  maskAadhaar(aadhaar: string | undefined): string {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar || 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  }

  maskPAN(pan: string | undefined): string {
    if (!pan || pan.length !== 10) return pan || 'N/A';
    return `${pan.slice(0, 2)}XXX${pan.slice(-4)}`;
  }

  formatIndianCurrency(amount: number): string {
    return amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  }
}



// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-candidate-review',
//   standalone: true,
//   imports: [],
//   templateUrl: './candidate-review.component.html',
//   styleUrl: './candidate-review.component.scss'
// })
// export class CandidateReviewComponent implements OnInit {
//   candidateKey: string = '';
//   candidateData: any;
//   loading: boolean = true;

//   constructor(
//     private route: ActivatedRoute,
//     private http: HttpClient
//   ) {}

//   ngOnInit() {
//     this.candidateKey = this.route.snapshot.params['key'];
//     this.loadCandidateDetails();
//   }

//   loadCandidateDetails() {
//     this.http.get(`/api/v1/CandidateExperienceDetails/hr-review?key=${this.candidateKey}`)
//       .subscribe({
//         next: (response: any) => {
//           if (response.isSuccess) {
//             this.candidateData = response.data;
//           }
//           this.loading = false;
//         },
//         error: (err) => {
//           console.error('Error loading candidate details', err);
//           this.loading = false;
//         }
//       });
//   }

//   printDetails() {
//     window.print();
//   }
// }
