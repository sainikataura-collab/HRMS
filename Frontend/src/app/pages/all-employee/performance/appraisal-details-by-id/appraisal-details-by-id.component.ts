
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Ensure you have this service installed and imported
import { PrograssionDetailService } from '../Service/prograssion-detail.service';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

declare var html2pdf: any; // Declare html2pdf globally
@Component({
  selector: 'app-appraisal-details-by-id',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SafeHtmlPipe],
  templateUrl: './appraisal-details-by-id.component.html',
  styleUrl: './appraisal-details-by-id.component.scss'
})

export class AppraisalDetailsByIdComponent implements OnInit {
  empId: string = '';
  appraisalData: any = {};
   kraList: any []=[];
   behavioralList:any []=[];

   currentDate:Date = new Date();
  constructor(
    private route: ActivatedRoute,
    private appraisalService: PrograssionDetailService,
        private sanitizer: DomSanitizer,
           private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
      this.loader.start(); // Start the loader
     const empId = this.route.snapshot.paramMap.get('empId');
  const yearId = Number(this.route.snapshot.paramMap.get('yearId'));
     if (empId && yearId) {
    
      this.loadAppraisalData(empId, yearId);
      
    }
    this.loader.stop(); // Stop the loader after data is loaded
  }

  loadAppraisalData(empId: string, yearId: number): void {
    this.appraisalService.appraisaldetailsview(empId, yearId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.appraisalData = res.data.empInfo;
          this.kraList = res.data.kraevaluation || [];
          this.behavioralList = res.data.behavioralAttribute || [];
        }
      },
      error: (err) => {
        console.error('Failed to load appraisal:', err);
      }
    });
  }


  

  downloadPDF(): void {
    // Temporarily show header for PDF
    const header = document.getElementById('pdfHeader');
    if (header) header.classList.remove('d-none');

    const element = document.getElementById('appraisalPdfContent');
    const opt = {
      margin: 0.3,
      filename: `Appraisal_Report_${this.appraisalData.EmployeeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { avoid: 'tr' } // Optional: prevents breaks inside rows
    };


    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        if (header) header.classList.add('d-none'); // hide again after download
      });
  }
}
