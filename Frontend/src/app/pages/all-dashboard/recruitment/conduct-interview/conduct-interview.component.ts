import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { ConductInterviewService } from '../RecruitServices/conduct-interview.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-conduct-interview',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,NgSelectComponent,CommonSearchComponent],
  templateUrl: './conduct-interview.component.html',
  styleUrl: './conduct-interview.component.scss'
})
export class ConductInterviewComponent {


  ConductInterviewForm!:FormGroup;
   ngxUILoaderService = inject(NgxUiLoaderService);
    Isedit=false;
    submitted=false;
    id!:number;
    showerror=false;
    EmployeeList: { name: string; value: string }[] = [];
    jobList: { name: string; value: string }[] = [];
    interviewlist:{ name: string; value: string }[] = [];
    Candidatelist:{ name: string; value: string }[] = [];
    jobopening_date:string='';
    jobclosing_date:string='';


    personality=[
  {name:'Excellent',value:'1'},
  {name:'Very Good',value:'2'},
   {name:'Good',value:'3'},
    {name:'Average',value:'4'},
    {name:'Below Average',value:'5'},
    
];

InterviewStatus=[
  {name:'Qualified',value:'1'},
  {name:'Disqualified',value:'2'},
   
    
];
 
totalinterviewround!:number;
totalcandidate!:number;

    fk_recId:string='';
    
    constructor(private fb:FormBuilder,private toastrService:ToastrService,private router:Router,private services:ConductInterviewService,public encryption:EncryptionService,private route: ActivatedRoute){}
    ngOnInit():void{
     this.ConductInterviewForm=this.fb.group({
  
      fk_jobId:[null,[Validators.required]],
      personality:[null,[Validators.required]],
      interview_status:[null,[Validators.required]],
      interview_remarks:[''],
      personalityremarks:[''],
      interview_round: [null,[Validators.required]], 
      fk_recId:[null,[Validators.required]],
      fk_empid:[null,[Validators.required]], 

     })
  
  
      this.ConductInterviewForm.get('fk_jobId')?.valueChanges.subscribe(value => {
      this.Getinterviewround(value);
      this.GetCandidatelist(value);
      this.getInterviewerList(value);
    });

     
     this.fk_recId = this.encryption.decryptText(this.route.snapshot.params['fk_recId']);
     if (this.fk_recId) {
     this.patchform(this.fk_recId);
     this.Isedit = true; 
     }
     this.getlocationlist('Job');
    }
  
  
  
  Getinterviewround(fieldName: string) {

  this.ngxUILoaderService.start();
  this.services.Getinterviewdropdown(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.finalRound.length) {
        console.log(res.data)
        this.interviewlist= res.data.finalRound.map((round: any) => ({
          name: round.name,
          value: round.value
        }));
        this.totalinterviewround=res.data.finalRound.length;
        this.jobclosing_date=res.data.job_closing_date;
        this.jobopening_date=res.data.job_opening_date;
      } else {
        this.toastrService.error("Failed to load interview round list.");
           this.totalinterviewround=0;
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load interview round list:", err);
      this.toastrService.error("Error fetching load interview round list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}

 GetCandidatelist(fieldName: string) {

  this.ngxUILoaderService.start();
  this.services.GetCandidatedropdown(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data.selectedCandidates?.length) {
        console.log(res.data)
        this.Candidatelist= res.data.selectedCandidates.map((candidate: any) => ({
          name: candidate.name,
          value: candidate.value
        }));

          this.totalcandidate=res.data.selectedCandidates.length;
       
      } else {
        this.toastrService.error("No candidates have applied for this job.");
        this.Candidatelist=[];
         this.totalcandidate=0;
          
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load list:", err);
      this.toastrService.error("Error fetching load list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}

  submitForm(){
    debugger;
   if (this.ConductInterviewForm.invalid) {
       this.showerror = true;
       return;
     }
    const formValue = this.ConductInterviewForm.value;
  
    const payload = {
      
     ScoringSheets: {
        fk_jobId: formValue.fk_jobId,
        personality:formValue.personality,
        interview_status:formValue.interview_status,
        interview_remarks:formValue.interview_remarks,
        personalityremarks:formValue.personalityremarks,
        interview_round: Number(formValue. interview_round),
        fk_recId:formValue.fk_recId,
      },

       Interviews: formValue.fk_empid.map((empId: string) => ({
       fk_recId: formValue.fk_recId,
       fk_empid: empId
  }))
    };
  
  
      
   //  **Check if  exists (Update) or not (Insert)**
      if (this.Isedit) {
        // **UPDATE existing record**
        
        this.services.update_ConductInterview(payload).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'detail updated successfully!');
              this.router.navigate(['/dash/recruitment/recruitmentdashboard/ConductInterview_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to update detail.');
            }
          },
          error: (err) => {
            console.error('Update API Error:', err);
            this.toastrService.error('Something went wrong while updating!');
          }
        });
    
      } else {
        // **INSERT new data**
        this.services.add_ConductInterview(payload).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'detail added successfully!');
              this.router.navigate(['/dash/recruitment/recruitmentdashboard/ConductInterview_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to add detail.');
            }
          },
          error: (err) => {
            console.error('Insert API Error:', err);
            this.toastrService.error('Something went wrong while adding!');
          }
        });
      }
    }
  
    // checkAvailability(name: string): void {
    //   const fieldName = 'recruitname'; 
    //   const fieldValue = name; 
    //   const generalId = this.fk_recId || ''; 
    
    //   this.services.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    //     next: (response) => {
    //       if (response && response.isSuccess === false) {
    //         this.ConductInterviewForm.get('name')?.setErrors({ duplicate: response.message });
    //       } else {
    //         this.ConductInterviewForm.get('name')?.setErrors(null);
    //       }
    //     },
    //     error: (err) => {
    //       console.error('Duplicate Check API Error:', err);
    //       this.ConductInterviewForm.get('name')?.setErrors({ duplicate: 'Error checking location availability.' });
    //     }
    //   });
    // }
    
  
    patchform(fk_recId: string) {
      this.services.get_ConductInterview_ById(this.fk_recId).subscribe({
         next: (res) => {
           if (res.isSuccess && res.data) {
           
              const data = res.data;
  
          //Patch main form fields
          this.ConductInterviewForm.patchValue({
             fk_jobId: data.scoringSheetList.fk_jobId,
             interview_remarks: data.scoringSheetList.interview_remarks,
              personalityremarks: data.scoringSheetList.personalityremarks,
               personality: data.scoringSheetList.personality,
              interview_status: data.scoringSheetList.interview_status,
              interview_round: String(data.scoringSheetList.interview_round),
             fk_recId: data.scoringSheetList.fk_recId,
          });
            //  Patch multi-select interviewer field
        const selectedEmpIds = data.interviews?.map((interview: any) => interview.fk_empid) || [];
        this.ConductInterviewForm.patchValue({
          fk_empid: selectedEmpIds
        });
         
             this.Isedit = true;
           } else {
             this.toastrService.error("Failed to load details.");
             
           }
          },
         error: () => {
           this.toastrService.error("Error loading data.");
   
     
         }
       });
     }
    
    Onreset():void{
       this.ConductInterviewForm.reset();
      
   }
  
   
  
  getInterviewerList(fieldName: string) {

  this.ngxUILoaderService.start();
  this.services.GetCandidatedropdown(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data.interviewers?.length) {
        console.log(res.data)
        this.EmployeeList= res.data.interviewers.map((emp: any) => ({
          name: emp.name,
          value: emp.value
        }));
       
      } else {
        this.toastrService.error("No candidate found.");
        this.EmployeeList=[];
          
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching load list:", err);
      this.toastrService.error("Error fetching load list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
  }
 getlocationlist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.services.getjob(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            console.log(res.data)
            this.jobList= res.data.map((Emp: any) => ({
              name: Emp.name,
              value: Emp.value
            }));
          } else {
            this.toastrService.error("Failed to load  job list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching job list:", err);
          this.toastrService.error("Error fetching employee list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }
  
}
