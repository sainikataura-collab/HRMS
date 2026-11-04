declare var bootstrap: any;

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ScreeningAppService } from '../../RecruitServices/screening-app.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-screening-application',
  standalone: true,
  imports: [ReactiveFormsModule,NgSelectModule,CommonModule,FormsModule],
  templateUrl: './screening-application.component.html',
  styleUrl: './screening-application.component.scss'
})
export class ScreeningApplicationComponent {


  Isedit=false;
  submitted=false;
   pk_jobid!:string;
  showerror=false;

  searchText= '';

  ScreeningApp!:FormGroup
  jobList: { name: string; value: string }[] = [];
   candidateList: any[] = [];
   jobData: any;


  pageIndex:number=1;
  pageSize:number=10;
  totalItems :number= 0;

  constructor(private fb:FormBuilder,private toastrService:ToastrService,private router:Router,private ScreeningAppService:ScreeningAppService,public ngxUILoaderService:NgxUiLoaderService,public encryption:EncryptionService,private route: ActivatedRoute){}


  ngOnInit():void{
    this.ScreeningApp=this.fb.group({
      fk_jobId:[null,]
    })
    this.getjoblist('Job');
  }



 getjoblist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.ScreeningAppService.getjob(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data)
          this.jobList= res.data.map((job: any) => ({
            name: job.name,
            value: job.value
          }));
        } else {
          this.toastrService.error("Failed to load  job list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching job list:", err);
        this.toastrService.error("Error fetching job list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }
  


  //  getDataByid(pk_jobid: string) {
  
  //     this.ngxUILoaderService.start(); // Start loader before API call
    
  //     this.ScreeningAppService.get_ScreeningJobId(pk_jobid).subscribe({
  //       next: (res) => {
  //          if (res.isSuccess) {
  //            this.ngxUILoaderService.stop();
  //                 this.candidateList = res.data;
  //             } else {
  //                 alert(res.message);
  //             }
  //           }
          
       
  //           })
  //   }


//     getDataByid(pk_jobid:string): void {
//     this.ScreeningAppService.get_ScreeningJobId(pk_jobid).subscribe(res => {
//         if (res.isSuccess) {
//             console.log('Data retrieved successfully:', res.data);
//             this.candidateList = res.data;
//             this.totalItems = res.totalCount;
//             console.log(this.totalItems, 'this is total items retrieved');

//               // Set candidate list from res.data.candidateDetails
//                this.candidateList = res.data.candidateDetails;

//                  this.totalItems = res.totalCount;

    
//         } else {
//             console.error('Failed to retrieve data:', res.message);
//             alert(res.message);
//         }
//     });
// }


getDataByid(pk_jobid: string): void {
  this.ScreeningAppService.get_ScreeningJobId(pk_jobid).subscribe(res => {
    if (res.statusCode === 200 && res.data) {
      console.log('Data retrieved successfully:', res.data);

      // Set candidate list from res.data.candidateDetails
      this.candidateList = res.data.candidateDetails;

      // Set total count (even if it's 0)
      this.totalItems = res.data.totalCount;

      // Optionally store jobdata if needed
      this.jobData = res.data.jobdata;

      
    } else {
      console.error('Failed to retrieve data:', res.message || 'Unknown error');
      alert(res.message || 'Failed to retrieve candidate data');
    }
  });
}




  onJobChange() {
  const jobId = this.ScreeningApp.get('fk_jobId')?.value ;
  this.getDataByid(jobId);
  
  if (!jobId) {
    this.toastrService.warning('Please select a job.');
  }
  // if (jobId) {
  //   this.getDataByid(jobId);
  // } else {
  //   this.toastrService.warning('Please select a job.');
  // }
}



//for modal

selectedCandidate: any = null;


viewMore(candidate: any) {
  this.selectedCandidate = candidate;
  const modalElement = document.getElementById('candidateModal');
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}



// submitScreening() {

//   const payload = {
//     screenedApplication: this.candidateList.map(candidate => ({
//       pk_recId: candidate.pk_recId,
//       shortlist_status: candidate.shortlist_status,
//       remarks: candidate.remarks
//     }))
//   };

//   console.log(payload); // for debugging

//   this.ScreeningAppService.update_ScreeningApp(payload).subscribe({
//     next: res => {
//       alert('Screening updated successfully!');
//       this.toastrService.success(res.message);
//     },
//     error: err => {

//       this.toastrService.error(err.message);

//     }
//   });
// }



submitSingleRecord(candidate: any) {
  const payload = {
    screenedApplication: [{
     pk_recId: candidate.pk_recId,
      shortlist_status: candidate.shortList_status,
      remarks: candidate.remarks
    }]
  };

  this.ScreeningAppService.update_ScreeningApp(payload).subscribe({
    next: res => {
      candidate.responseMessage = res.message;
      candidate.responseStatus = 'success';
      
      

    },
    error: err => {
       candidate.responseMessage = err.message;
      candidate.responseStatus = 'error';
    }
  });
}


filteredData(){
  if (!this.searchText) {
    return this.candidateList;
  }
  const searchTextLower = this.searchText.toLowerCase();
  return this.candidateList.filter(shift =>
    shift.education?.toLowerCase().includes(searchTextLower) ||
    shift.candidate_name?.toLowerCase().includes(searchTextLower)
  );
}

  
}
