
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Ensure you have this service installed and imported
import { PrograssionDetailService } from '../Service/prograssion-detail.service';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-appraisal-approval-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SafeHtmlPipe],
  templateUrl: './appraisal-approval-details.component.html',
  styleUrl: './appraisal-approval-details.component.scss'
})

export class AppraisalApprovalDetailsComponent implements OnInit {
  empId: string = '';
  appraisalData: any = {};
   kraList: any []=[];
   behavioralList:any []=[];

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


  
}
