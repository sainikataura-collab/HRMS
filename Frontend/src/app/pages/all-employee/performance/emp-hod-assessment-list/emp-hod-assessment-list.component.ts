
declare const html2pdf: any;

import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { KraService } from '../Service/kra.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-emp-hod-assessment-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, SafeHtmlPipe],
  templateUrl: './emp-hod-assessment-list.component.html',
  styleUrl: './emp-hod-assessment-list.component.scss'
})
export class EmpHodAssessmentListComponent {
 HODList: any[] = [];
  searchText:string='';
  Isedit:boolean=false;


  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;

     today: Date =new Date();



  constructor( private KRAService: KraService,private route: ActivatedRoute,private sanitizer: DomSanitizer,
    private toastrService:ToastrService,private router: Router,public encryptionService:EncryptionService) {}
  
 

  ngOnInit(): void {
    this.getList();
  }


getList(): void {
    this.KRAService.getAllHODAssess(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.HODList = res.data;
            this.totalItems = res.totalCount;
            console.log(this.totalItems, 'this is total items retrieved');
        } else {
            console.error('Failed to retrieve data:', res.message);
           // alert(res.message);
        }
    });
}




 getStatusClass(status: string): string {
  switch (status) {
    case 'Pending at RM':
      return 'status-pending-rm';
    case 'Pending at HOD':
      return 'status-pending-hod';
    case 'Approved':
      return 'status-approved';
    default:
      return '';
  }
}

onPageChange(event: number):void {
    this.pageIndex = event;
    this.getList();
  }


 filteredData() {
  if (!this.searchText) {
    return this.HODList;
  }

  const searchTextLower = this.searchText.toLowerCase();
  return this.HODList.filter(candidate =>
    candidate.rmAssessment?.toLowerCase().includes(searchTextLower) ||
    candidate.rmRemark?.toLowerCase().includes(searchTextLower) ||
    candidate.approvalStatus?.toLowerCase().includes(searchTextLower) 
   

  );
}

isUpdate(fk_empid: string, kraPeriodId:number) {
  this.router.navigate(["dash/performance/performancedashboard/HOD-assessment",fk_empid,kraPeriodId]);
}
isview(fk_empid: string, kraPeriodId:number) {
  this.router.navigate(["dash/performance/performancedashboard/HOD-assessment-View",fk_empid,kraPeriodId]);
}


Showpdf!:Boolean
  staticKRAData: any[] = [];

generatePDF(fk_empid: string,fk_kraperiodId:number): void {
  if (!fk_empid) {
    this.toastrService.error('No assessment ID found.');
    return;
  }

  this.Showpdf = true; 

  this.KRAService.GetById_HODAssessment_KRA(fk_empid,fk_kraperiodId).subscribe({
    next: (response) => {
      if (response.isSuccess && response.data && response.data.length > 0) {
        this.staticKRAData = response.data;

        setTimeout(() => {
          const element = document.getElementById('pdf-content') as HTMLElement;

          if (element) {
            window.scrollTo(0, 0); // Optional for clean rendering

            const opt = {
              margin: 5,
              filename: 'HOD Assessment.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: {
                scale: 2,
                scrollY: 0
              },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak: { avoid: 'tr' }
            };

            html2pdf().from(element).set(opt).save();
          } else {
            this.toastrService.error('PDF container not found.');
          }
        }, 100); // Wait for DOM update
      } else {
        this.toastrService.error('No assessment data found.');
      }
    },
    error: () => {
      this.toastrService.error('Failed to fetch Assessment KRA data.');
    }
  });
}




}




