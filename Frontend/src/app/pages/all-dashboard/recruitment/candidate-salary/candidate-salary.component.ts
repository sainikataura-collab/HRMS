import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { CandidateSalaryService } from '../RecruitServices/candidate-salary.service';

import { ScreeningAppService } from '../RecruitServices/screening-app.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ConductInterviewService } from '../RecruitServices/conduct-interview.service';

@Component({
    selector: 'app-candidate-salary',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, NgSelectModule, FormsModule, RouterLink],
    templateUrl: './candidate-salary.component.html',
    styleUrl: './candidate-salary.component.scss'
})
export class CandidateSalaryComponent {

 showErrorhead =false;
    pk_empid!:string;


    CandidateSalary!: FormGroup;
    headForm!: FormGroup;
    Isedit: boolean = false;
    showError = false;

    showEarningHeads: boolean = false;

    Location: { name: string, value: string }[] = [];
    CandidateList: { name: string, value: string }[] = [];
    HeadList: { name: string, value: string }[] = [];
    jobList: any[] = [];

    candidate_Detail: any[] = [];
    salaryHead1: any[] = [];
    salaryHead2: any[] = [];

    pk_recId!: string;

    // salaryHead1 = new FormArray<FormGroup>([]);
    // salaryHead2 = new FormArray<FormGroup>([]);

    earningCount: number | null = null;

    Grade: { name: string, value: string }[] = [];




    constructor(private fb: FormBuilder, private toastrService: ToastrService, private router: Router, public route: ActivatedRoute,
        private employeeMasterService: EmployeeMasterService,private services:ConductInterviewService, private CandSalaryService: CandidateSalaryService, private EncryptionService: EncryptionService, private ScreeningAppService: ScreeningAppService) { }


    ngOnInit() {
        this.CandidateSalary = this.fb.group({
            // candidateName: [null,],
            fk_jobId: [''],
            fk_recId: [null,],
            basedon: [''],
            amount: [0,],
            fathername: [null,],
            dateofbirth: [null,],
            experience: [null,],
            CurrentCTC: [null,],
            notificationNo: [null,],
            Jobtitle: [null,],
            pfApp: [null,Validators.required],
            esiApp: [null,Validators.required],
            // fk_locid: [null,],
            LocId: [null,Validators.required],
            // fk_grade: [null,],
            FkGradeId: [null,Validators.required],
            remarks: [null,],

            earningHeads: this.fb.array([
                this.fb.group({
                    fk_headid: ['',],
                    amount: [0,]
                })
            ]),


        });



        this.getjoblist('Job');
        this.getLocationList('Location');
        this.getGradeList('Grade');
        this.getHeadlist('Head');
        // this.TCandidateList('CandidateName');
        this.CandidateSalary.get('fk_jobId')?.valueChanges.subscribe(value => {
        this.GetCandidatelist(value);
        });

        //    this.pk_recId=this.EncryptionService.decryptText(this.route.snapshot.params['pk_recId']);
        this.pk_recId = this.route.snapshot.params['pk_recId'];

        if (this.pk_recId && this.pk_recId !== 'undefined' ) {
           
            this.getDataByid(this.pk_recId);
             this.Isedit = true;
            
        }




    }


 GetCandidatelist(fieldName: string) {
    
  this.services.GetCandidatedropdown(fieldName).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data.selectedCandidates?.length) {

       
        this.CandidateList= res.data.selectedCandidates.map((candidate: any) => ({
          name: candidate.name,
          value: candidate.value
        }));
        

       
      } else {
        this.toastrService.error("No candidates have applied for this job.");
        this.CandidateList=[];
         
          
      }
    },
    error: (err) => {
    
      this.toastrService.error("Error fetching load list. Please try again.");
    
    }
  });
}



    getjoblist(fieldName: string) {

        this.ScreeningAppService.getjob(fieldName).subscribe({
            next: (res) => {
                if (res?.isSuccess && res.data?.length) {
                    console.log(res.data)
                    this.jobList = res.data.map((job: any) => ({
                        name: job.name,
                        value: job.value
                    }));
                } else {
                    this.toastrService.error("Failed to load  job list.");
                }

            },
            error: (err) => {
                console.error("Error fetching job list:", err);
                this.toastrService.error("Error fetching job list. Please try again.");

            }
        });
    }

    getHeadlist(fieldName: string) {

        this.ScreeningAppService.getjob(fieldName).subscribe({
            next: (res) => {
                if (res?.isSuccess && res.data?.length) {
                    console.log(res.data)
                    this.HeadList = res.data.map((job: any) => ({
                        name: job.name,
                        value: job.value
                    }));
                } else {
                    this.toastrService.error("Failed to load  job list.");
                }

            },
            error: (err) => {
                console.error("Error fetching job list:", err);
                this.toastrService.error("Error fetching job list. Please try again.");

            }
        });
    }


    formatDate(dateStr: string): string | null {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const offset = date.getTimezoneOffset(); // Handle timezones correctly
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().split('T')[0]; // "yyyy-MM-dd"
    }

    getCandidatedata(): void {
        const pk_recId = this.CandidateSalary.get('fk_recId')?.value;
        if (!pk_recId) {

            return;
        }
        this.CandSalaryService.get_CandidateSalaryByid(pk_recId).subscribe(res => {
            if (res.statusCode === 200 && res.data) {
                this.candidate_Detail = res.data.candidate_Detail;
                this.salaryHead1 = res.data.salaryHead1;
                this.salaryHead2 = res.data.salaryHead2;

                this.CandidateSalary.patchValue({
                    fk_jobId: res.data.candidate_Detail.fk_jobId,
                    fk_recId: res.data.candidate_Detail.pk_recId,
                    fathername: res.data.candidate_Detail.father_name,
                    dateofbirth: this.formatDate(res.data.candidate_Detail.dateofbirth),
                    experience: res.data.candidate_Detail.totexperience,
                    CurrentCTC: res.data.candidate_Detail.currentctc,
                    notificationNo: res.data.candidate_Detail.notification_no,
                    Jobtitle: res.data.candidate_Detail.job_title,
                      pfApp: res.data.candidate_Detail.pf_app,
                    esiApp: res.data.candidate_Detail.esi_app,
                    basedon: res.data.candidate_Detail.basedon,
                    LocId: res.data.candidate_Detail.fk_locid,
                    FkGradeId: res.data.candidate_Detail.fk_classid,
                    basic: res.data.candidate_Detail.basic,
                    fk_classid: res.data.candidate_Detail.fk_classid,
                    gender: res.data.candidate_Detail.gender,
                    remarks: res.data.candidate_Detail.remarks,
                    amount: res.data.salaryHead1.amount || 0,
                    shortdesc: res.data.salaryHead1.shortdesc,
                    headtype: res.data.salaryHead1.headtype,
                });
            }
        });
    }
    
 onJobChange(){
  const jobId = this.CandidateSalary.get('fk_jobId')?.value ;

  this.getDataid(jobId);
  if (!jobId) {
    this.toastrService.warning('Please select a job.');
  }

}

    getDataid(pk_jobid: string): void {
    this.ScreeningAppService.get_ScreeningJobId(pk_jobid).subscribe(res => {
    if (res.statusCode === 200 && res.data) {
      console.log('Data retrieved successfully:', res.data);

      // Set candidate list from res.data.candidateDetails
      this.CandidateList = res.data.candidateDetails[0].pk_recId;


      
    } else {
      console.error('Failed to retrieve data:', res.message || 'Unknown error');
      alert(res.message || 'Failed to retrieve candidate data');
    }
  });
}



    getDataByid(pk_recId: string): void {

        this.CandSalaryService.get_CandidateSalaryByid(pk_recId).subscribe(res => {
            if (res.statusCode === 200 && res.data) {
                this.candidate_Detail = res.data.candidate_Detail;
                this.salaryHead1 = res.data.salaryHead1;
                this.salaryHead2 = res.data.salaryHead2;


                this.CandidateSalary.patchValue({
                    fk_jobId: res.data.candidate_Detail.fk_jobId,
                    fk_recId: res.data.candidate_Detail.pk_recId,
                    fathername: res.data.candidate_Detail.father_name,
                    dateofbirth: this.formatDate(res.data.candidate_Detail.dateofbirth),
                    experience: res.data.candidate_Detail.totexperience,
                    CurrentCTC: res.data.candidate_Detail.currentctc,
                    notificationNo: res.data.candidate_Detail.notification_no,
                    Jobtitle: res.data.candidate_Detail.job_title,
                    pfApp: res.data.candidate_Detail.pf_app,
                    esiApp: res.data.candidate_Detail.esi_app,
                    basedon: res.data.candidate_Detail.basedon,
                    LocId: res.data.candidate_Detail.fk_locid,
                    FkGradeId: res.data.candidate_Detail.fk_classid,
                    basic: res.data.candidate_Detail.basic,
                    // fk_classid: res.data.candidate_Detail.fk_classid,
                    gender: res.data.candidate_Detail.gender,
                    remarks: res.data.candidate_Detail.remarks,
                    amount: res.data.salaryHead1.amount || 0,
                    shortdesc: res.data.salaryHead1.shortdesc,
                    headtype: res.data.salaryHead1.headtype,

                });

                this.earningCount = res.data.earningAmount;


                const earningHeadsArray = this.CandidateSalary.get('earningHeads') as FormArray;
                earningHeadsArray.clear(); // Clear old rows

                if (res.data.salaryHead1 && res.data.salaryHead1.length > 0) {
                    res.data.salaryHead1.forEach((head: any) => {
                        earningHeadsArray.push(this.fb.group({
                            fk_headid: [head.fk_headid].toString(),
                            shortdesc: [head.shortdesc],
                            amount: [head.amount],
                            headtype: [head.headtype]
                        }));
                    });
                    this.showEarningHeads = true;
                } else {
                   console.log("hjhl")// If no heads found, show one empty row
                }



            } else {
                this.toastrService.error(res.message);
            }
        });
    }


    submitCandidateSalary() {
        if (this.CandidateSalary.invalid) {
            this.showError = true;
            return;
        }

        const formValue = this.CandidateSalary.value;

        const candidatePayload = {
           fk_locid: formValue.LocId,
           fk_classid:formValue.FkGradeId,
            basedon: formValue.basedon,
            ctc: +formValue.CurrentCTC,
            basic: +formValue.amount,
            pf_app: formValue.pfApp,
            esi_app: formValue.esiApp
        };

        const salaryHeadsPayload = this.CandidateSalary.get('earningHeads')?.value.map((head: any) => {
            return {
                fk_recId: formValue.fk_recId || 0,  // Make sure it's 0 or null if creating
                fk_headid: head.fk_headid,
                amount: +head.amount || 0
            };
        });

        const finalPayload = {
            candidate: candidatePayload,
            salaryHeads: salaryHeadsPayload
        };

        // Check if it's edit mode
        if (this.Isedit) {
            // Edit mode: update existing salary
            this.CandSalaryService.update_CandidateSalary(finalPayload).subscribe({
                next: (res: any) => {
                    if (res.isSuccess) {
                        this.toastrService.success(res.message);
                        this.router.navigate(['/dash/recruitment/recruitmentdashboard/Candidate-Salary_list']);
                    } else {
                        this.toastrService.error(res.message);
                    }
                },
                error: (err) => {
                    this.toastrService.error('Something went wrong while updating salary!');
                    console.error(err);
                }
            });
        } else {
            // Create mode: add new salary
            this.CandSalaryService.add_CandidateSalary(finalPayload).subscribe({
                next: (res: any) => {
                    if (res.isSuccess) {
                        this.toastrService.success(res.message);
                        this.router.navigate(['/dash/recruitment/recruitmentdashboard/Candidate-Salary_list']);
                    } else {
                        this.toastrService.error(res.message);
                    }
                },
                error: (err) => {
                    this.toastrService.error('Something went wrong while saving salary!');
                    console.error(err);
                }
            });
        }
    }

    get earningHeads(): FormArray {
        return this.CandidateSalary.get('earningHeads') as FormArray;
    }


    getLocationList(fieldName: string) {
        this.employeeMasterService.get_DropdownList(fieldName).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.Location = res.data.map((fk_locid: any) => ({
                        name: fk_locid.name,
                        value: fk_locid.value
                    }));
                } else {
                    this.toastrService.error("Failed to load Location list.");
                }
            },
            error: (err) => {
                this.toastrService.error("Error fetching Location list.");
            }
        });
    }

    TCandidateList(fieldName: string) {
        this.employeeMasterService.get_DropdownList(fieldName).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.CandidateList = res.data.map((fk_locid: any) => ({
                        name: fk_locid.name,
                        value: fk_locid.value
                    }));
                } else {
                    this.toastrService.error("Failed to load Candidate list.");
                }
            },
            error: (err) => {
                this.toastrService.error("Error fetching Candidate list.");
            }
        });
    }


    getGradeList(fieldName: string) {
        this.employeeMasterService.get_DropdownList(fieldName).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.Grade = res.data.map((pk_classid: any) => ({
                        name: pk_classid.name,
                        value: pk_classid.value
                    }));
                } else {
                    this.toastrService.error("Failed to load Grade list.");
                }
            },
            error: (err) => {
                this.toastrService.error("Error fetching Grade list.");
            }
        });
    }


    restrictInputDecimal(event: KeyboardEvent): void {
        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
        const inputChar = event.key;

        if (allowedKeys.indexOf(inputChar) !== -1) {
            return; // Allow control keys
        }

        // Allow only digits and one decimal point
        const currentInput = (event.target as HTMLInputElement).value;
        if (!/^\d*\.?\d*$/.test(currentInput + inputChar)) {
            event.preventDefault();
        }
    }

    resetTable() {
        const control = this.CandidateSalary.get('earningHeads') as FormArray;
        control.clear(); // This removes all rows from the FormArray
        this.showEarningHeads = false;
    }



    // for get head

       getHeadList() {
     
       
              if (this.CandidateSalary.invalid) {
                this.showError = true;
                return;
              }
                this.showEarningHeads=true;
            
              const data = { ...this.CandidateSalary.value, fk_empId: this.pk_empid };
            
              this.earningHeads.clear();
              
            
              this.employeeMasterService.add_employeeHead(data).subscribe((response: any) => {
                if (response.statusCode === 200) {
                  const head1List: any[] = response.data.head1 || [];
                  head1List.forEach((item: any) => {
                    const group = this.fb.group({
                      fk_headid: item.pkHeadId,
                      shortDesc: item.shortDesc,
                      amount: item.amount,
                      effectDate: this.formatDate(item.effectDate),
                      type: 'earning'
                    });
                    this.earningHeads.push(group);
                  });
            
            
                }
              });
            }




                // onCandidateSearchChange() {
    //     const searchText = this.CandidateSalary.get('candidateSearch')?.value;

    //     if (searchText && searchText.trim().length >= 2) {
    //         this.jobList = [];
    //         this.CandSalaryService.get_CandidateNameSerach(searchText.trim()).subscribe({
    //             next: (res) => {
    //                 if (res.isSuccess) {
    //                     this.jobList = res.data;

    //                     //   // Check if only "--Select Candidate--" exists with null value
    //                     //   if (
    //                     //     this.CandidateList.length === 1 &&
    //                     //     this.CandidateList[0].value === null
    //                     //   ) {
    //                     //     // Show message
    //                     //     alert("Record not found"); // Replace with your own notification logic
    //                     //   }

    //                 }
    //             },
    //             error: (err) => {
    //                 console.error('Error fetching candidates:', err);

    //             }
    //         });
    //     }
    // }



    // submitCandidateSalary() {
    //     if (this.CandidateSalary.invalid) {
    //         this.showError = true;
    //         return;
    //     }
    //     const formValue = this.CandidateSalary.value;

    //     const candidatePayload = {
    //         fk_locid: formValue.fk_locid,
    //         fk_classid: formValue.fk_grade,
    //         basedon: formValue.basedon,
    //         ctc: +formValue.CurrentCTC,
    //         basic: +formValue.amount,
    //         pf_app: formValue.pfApp,
    //         esi_app: formValue.esiApp
    //     };



    //     const salaryHeadsPayload = this.CandidateSalary.get('earningHeads')?.value.map((head: any, index: number) => {

    //         return {
    //             fk_recId: formValue.fk_recId,
    //             fk_headid: head.fk_headid,  // auto-filled from salaryHead1
    //             amount: +head.amount
    //         };
    //     });



    //     const finalPayload = {
    //         candidate: candidatePayload,
    //         salaryHeads: salaryHeadsPayload
    //     };

    //     this.CandSalaryService.update_CandidateSalary(finalPayload).subscribe({
    //         next: (res: any) => {
    //             if (res.isSuccess) {
    //                 this.toastrService.success(res.message );
    //                 this.router.navigate(['/dash/recruitment/recruitmentdashboard/Candidate-Salary-List']); // change route as needed
    //             } else {
    //                 this.toastrService.error(res.message );
    //             }
    //         },
    //         error: (err) => {
    //             this.toastrService.error('Something went wrong while saving salary!');
    //             console.error(err);
    //         }
    //     });
    // }


    // getDataByid(pk_recId: string): void {
    //     const CandidateName = this.CandidateSalary.get('fk_recId')?.value;

    //     if(CandidateName){

    //            this.CandSalaryService.get_CandidateSalaryByid(pk_recId).subscribe(res => {
    //         if (res.statusCode === 200 && res.data) {

    //             this.candidate_Detail = res.data.candidate_Detail;

    //             this.salaryHead1 = res.data.salaryHead1;

    //             this.salaryHead2 = res.data.salaryHead2;


    //         } else {
    //             this.toastrService.error(res.message);
    //         }
    //     });
    //     }

    // }


   

}
