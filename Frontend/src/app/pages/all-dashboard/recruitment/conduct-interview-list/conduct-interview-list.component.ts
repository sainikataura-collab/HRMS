import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectComponent } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ConductInterviewService } from '../RecruitServices/conduct-interview.service';

@Component({
  selector: 'app-conduct-interview-list',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule,NgSelectComponent,NgxPaginationModule,FormsModule],
  templateUrl: './conduct-interview-list.component.html',
  styleUrl: './conduct-interview-list.component.scss'
})
export class ConductInterviewListComponent {

    ngxUILoaderService = inject(NgxUiLoaderService);
        searchText: string = '';
       
        list: any[] = [];
        sedit:boolean=false;
 Candidatelist:{ name: string; value: string }[] = [];
jobList: { name: string; value: string }[] = [];
  ConductInterviewForm!:FormGroup;   
   showerror=false;   

       
       
        constructor(private service:ConductInterviewService, private fb:FormBuilder, public router:Router,private toastrService:ToastrService,private cdRef:ChangeDetectorRef,public encryption:EncryptionService) { }
  ngOnInit(): void {

      this.ConductInterviewForm=this.fb.group({
  
      fk_jobId:[null,[Validators.required]],
      fk_recId:[null,[Validators.required]],
     
     
        
  
     })
  
  

          //  this. getlist();

           this.ConductInterviewForm.get('fk_jobId')?.valueChanges.subscribe(value => {
          this.GetCandidatelist(value);
    });
       this.ConductInterviewForm.get('fk_recId')?.valueChanges.subscribe(value => {
          this.getlist(value);
    });
        this.getlocationlist('Job');
    }
         
        
          getlist(fk_recId:string): void {

            this.service.get_ConductInterview(fk_recId).subscribe(res => {
                if (res.isSuccess) {
                    console.log('Data retrieved successfully:', res.data);
                    this.list = res.data;
                    
                } else {
                    console.error('Failed to retrieve data:', res.message);
                    alert(res.message);
                }
            });
        }
        
       
       //for filter the data 
    filteredData() {
      if (!this.searchText) {
        return this.list;
      }
     
      const searchTextLower = this.searchText.toLowerCase();
      return this.list.filter(res =>
        res.job_title?.toLowerCase().includes(searchTextLower)||
        res.notification_no?.toLowerCase().includes(searchTextLower)
       
      );
     }
        //for delete 
        delete(fk_recId: string) {
            if (confirm('Are you sure you want to delete this record?')) {
                this.service.delete_ConductInterview(fk_recId).subscribe(
                    (response: any) => {
                        if (response.isSuccess) {
        
                          this.toastrService.success(response.message || 'Record deleted successfully');
                            //alert('Record deleted successfully');
                            this.getlist(fk_recId); // Refresh the list
                        } 
                        else {
                          this.toastrService.error(response.message, 'Error');
                        }
                    },
                    (errorMessage) => {
                        console.error('Error deleting record', errorMessage);
                        this.toastrService.error(errorMessage, 'Error');
                       
                    }
                );
            }
        }
          
        // //for update 
            isUpdate(fk_recId: string) {
                  this.router.navigate(["/dash/recruitment/recruitmentdashboard/ConductInterview", fk_recId]);
  
           }
        

              getlocationlist(fieldName: string) {
      this.ngxUILoaderService.start();
      this.service.getjob(fieldName).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            console.log(res.data)
            this.jobList= res.data.map((Emp: any) => ({
              name: Emp.name,
              value: Emp.value
            }));
          } else {
            this.toastrService.error("Failed to load  location list.");
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error("Error fetching location list:", err);
          this.toastrService.error("Error fetching employee list. Please try again.");
          this.ngxUILoaderService.stop();
        }
      });
    }
  
 GetCandidatelist(fieldName: string) {

  this.ngxUILoaderService.start();
  this.service.GetCandidatedropdown(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data.selectedCandidates?.length) {
        console.log(res.data)
        this.Candidatelist= res.data.selectedCandidates.map((candidate: any) => ({
          name: candidate.name,
          value: candidate.value
        }));
       
      } else {
        this.toastrService.error("No candidate found.");
        this.Candidatelist=[];
          
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
}
