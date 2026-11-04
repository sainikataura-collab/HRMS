declare const html2pdf: any;
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { KraService } from '../Service/kra.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-emp-assessment-list',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxPaginationModule, FormsModule, SafeHtmlPipe],
  templateUrl: './emp-assessment-list.component.html',
  styleUrl: './emp-assessment-list.component.scss'
})
export class EmpAssessmentListComponent {
SelfList: any[] = [];
  searchText:string='';
 Isedit:boolean=false;
fk_empid:string='';

  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;
   today: Date =new Date();
   Showpdf:boolean=false;


  constructor( private KRAService: KraService,private route: ActivatedRoute,private toastrService:ToastrService,private router: Router,
    private sanitizer: DomSanitizer,public encryptionService:EncryptionService) {}
  
 

  ngOnInit(): void {
    this.getList();
  }


getList(): void {

    this.KRAService.getAllSelfAssess(this.pageIndex-1,this.pageSize).subscribe(res => {
        if (res.isSuccess) {
            this.SelfList = res.data;
            this.totalItems = res.totalCount;
        } else {
            console.error('Failed to retrieve data:', res.message);
            //alert(res.message);
        }
    });
}


onPageChange(event: number):void {
    this.pageIndex = event;
    this.getList();
  }


 filteredData(){
  if (!this.searchText) {
    return this.SelfList;
  } 
  const searchTextLower = this.searchText.toLowerCase();
  return this.SelfList.filter(candidate =>
    candidate.empName?.toLowerCase().includes(searchTextLower) ||
    candidate.location?.toLowerCase().includes(searchTextLower) ||
    candidate.period?.toLowerCase().includes(searchTextLower) 
  );
}


 



isUpdate(pk_kraassId: number) {
  this.router.navigate(["dash/performance/performancedashboard/Empwise-self-Assessment",pk_kraassId]);
}


isview(pk_kraassId: number) {
  this.router.navigate(["dash/performance/performancedashboard/Empwise-assessment-view",pk_kraassId]);
}

 getStatusClass(status: string): string {
  switch (status) {
    case 'Pending':
      return 'status-pending-self';
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






generatePDF(pk_kraassId: number): void {
  if (!pk_kraassId) {
    this.toastrService.error('No assessment ID found.');
    return;
  }

  this.Showpdf = true; 

  this.KRAService.GetById_Assessment_KRA(pk_kraassId).subscribe({
    next: (response) => {
      if (response.isSuccess && response.data && response.data.length > 0) {
        this.staticKRAData = response.data;

        setTimeout(() => {
          const element = document.getElementById('pdf-content') as HTMLElement;

          if (element) {
            window.scrollTo(0, 0); // Optional for clean rendering

            const opt = {
              margin: 5,
              filename: 'Assessment.pdf',
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





  pk_kraassId: number | null = null;
  staticKRAData: any[] = [];


   getAssessmentByKRAId(): void {
    if (this.pk_kraassId !== null) {
      this.KRAService.GetById_Assessment_KRA(this.pk_kraassId).subscribe({
        next: (response) =>{
          if (response.isSuccess && response.data && response.data.length > 0) {
            this.staticKRAData = response.data; // ✅ Needed
        


          }
        },
        error: () => {
          this.toastrService.error('Failed to fetch Assessment KRA data.');
          this.staticKRAData = [];
         
        }
      });
    }
  }

}


