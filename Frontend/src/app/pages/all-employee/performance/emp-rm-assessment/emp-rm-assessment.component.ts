import { forkJoin, Observable } from 'rxjs';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { boolean } from 'mathjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeMasterService } from '../../../all-dashboard/payroll/services/employee-master.service';
import { KraService } from '../Service/kra.service';
import { CandidateMasterService } from '../../../all-dashboard/recruitment/RecruitServices/candidate-master.service';
import { AttendanceService } from '../../attendance/Services/attendance.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

declare const $: any;

@Component({
  selector: 'app-emp-rm-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, SafeHtmlPipe],

  templateUrl: './emp-rm-assessment.component.html',
  styleUrl: './emp-rm-assessment.component.scss'
})
export class EmpRmAssessmentComponent {

  shouldScroll = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;


  currentStep = 1;
  EmpWiseForm!: FormGroup
  showError: boolean = false
  Isedit: boolean = false

  employeeSelected = false;

   fk_empid!:string;

  fk_kraperiodId!: number;


  PeriodData: { name: string, value: string }[] = [];
  employeeList: { name: string, value: string }[] = [];

  staticKRAData: any[] = [];
  ZoneList: { name: string; value: string }[] = [];

  



  constructor(private fb: FormBuilder, private employeeMasterService:
     EmployeeMasterService,private service:CandidateMasterService,
    private toastrService: ToastrService, private KRAService: KraService, 
    private route: ActivatedRoute, public router:Router,
    private Service:CandidateMasterService,
   private  httpAttendanceService :AttendanceService,
  private sanitizer: DomSanitizer) { }



  ngOnInit() {
    this.EmpWiseForm = this.fb.group({
      fk_empid: [null, Validators.required],
      fk_kraperiodId: [null, Validators.required],
      cards: this.fb.array([]) // <<< important

    });

    this.getDropdown()
     this.populateStaticKRA();
    //  this.onEmployeeSelect();

    this.getEmployee()
   
  
    

  this.fk_empid =this.route.snapshot.paramMap.get('fk_empid')!;
  this.fk_kraperiodId =Number(this.route.snapshot.paramMap.get('kraperiodid')) ;
    

  debugger
    if (this.fk_empid !== null || this.fk_kraperiodId !==null ) {
      this.getAssessmentByKRAId();
      this.Isedit = true;
    }
  }


  get cards(): FormArray {
    return this.EmpWiseForm.get('cards') as FormArray;
  }



 populateStaticKRA(): void {
  this.cards.clear();
  for (let kra of this.staticKRAData) {
    const group = this.fb.group({
      
      pk_kraassId: [kra.pk_kraassId || 0],
       attachmentPath: [kra.attachmentPath],
       SelfattachmentPath: [kra.assessmentAttachmentPath],
       rmFilePath: [kra.rmFilePath],
      kraId: [kra.kraId || kra.fk_KRAId], // Make sure this matches the backend payload
      kra: [this.stripHtml(kra.kra)],
      kpi: [this.stripHtml(kra.kpi)],
      targetvalue: [this.stripHtml(kra.targetvalue)],
      weightage: [kra.weightage],
      selfAssessment: [kra.selfAssessment],
      selfRemark: [this.stripHtml(kra.assessmentRemarks)],
      RMAssessment: [kra.rmAssessment],
      RMRemark: [kra.rmAssessmentRemarks],
      FileBytes: [null],
       status:[kra.status || 0]
    });

    this.cards.push(group);
  }
}



 getEmployee() {
  this.httpAttendanceService.getEmployeeNameList().subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log(res.data)
        this.employeeList= res.data.map((Emp: any) => ({
          name: Emp.name,
          value: Emp.value
        }));
      } else {
       console.log('Error fetching zone list')
      }
  
    },
    error: (err) => {
      console.error("Error fetching zone list:", err);
    }
  });
} 


exceedMessages: boolean[] = [];

onAssessmentInput(index: number): void {
  const cardGroup = this.cards.at(index);
  const weightage = +cardGroup.get('weightage')?.value;
  let value = +cardGroup.get('RMAssessment')?.value;

  if (value > weightage) {
    cardGroup.get('RMAssessment')?.setValue(weightage);
    this.exceedMessages[index] = true;

    // Hide message after 2 seconds
    setTimeout(() => {
      this.exceedMessages[index] = false;
    }, 1000);
  } else {
    this.exceedMessages[index] = false;
  }
}

//  onEmployeeSelect(): void {

//     this.employeeSelected = true;
    
//        this.KRAService.GetById_Self_KRA().subscribe({
//       next: (response) => {
//         if (response.isSuccess && response.data) {
//           this.staticKRAData = response.data;
//           this.populateStaticKRA();
          
//         } else {
//           this.toastrService.warning(response.message);
//           this.staticKRAData = [];
//           this.cards.clear();
//         }
//       },
//       error: (err) => {
//         console.error('Error fetching KRA:', err);
//         this.toastrService.error('Failed to fetch KRA data.');
//         this.staticKRAData = [];
//         this.cards.clear();
//       }
//     });
 
// }




pk_KraAssessmentId!: number;

 getAssessmentByKRAId(): void {
  if (this.fk_empid !== null) {
    this.KRAService.GetById_RMAssessment_KRA(this.fk_empid,this.fk_kraperiodId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data && response.data.length > 0) {
          this.staticKRAData = response.data;
          this.populateStaticKRA();
          const kraInfo = response.data[0]; 
          
          if (kraInfo?.fk_empid) {
            this.EmpWiseForm.patchValue({
               fk_empid:  kraInfo.fk_empid,
              fk_kraperiodId: String(kraInfo.kraPeriodId)
            });

            this.EmpWiseForm.get('fk_empid')?.disable();
            this.EmpWiseForm.get('fk_kraperiodId')?.disable();
             this.employeeSelected = true;
          }


        } else {
          this.toastrService.warning(response.message);
          this.staticKRAData = [];
          this.cards.clear();
        }
      },
      error: (err) => {
        this.toastrService.error('Failed to fetch Assessment KRA data.');
        this.staticKRAData = [];
        this.cards.clear();
      }
    });
  }
}






onSubAll(): void {
  this.showError = true;
 
  if (this.EmpWiseForm.invalid) {
    this.toastrService.warning('Please fill in all required fields.');
    return;
  }

  const formData = new FormData();

  this.cards.controls.forEach((cardForm: AbstractControl, i: number) => {
    const formGroup = cardForm as FormGroup;

    formGroup.patchValue({
      RMRemark: $(`#summernoteEditor2_${i}`).summernote('code'),
    });

    if (formGroup.invalid) {
      this.toastrService.warning(`Please complete all fields for card ${i + 1}`);
      return;
    }

    const formValue = formGroup.value;

    // Append individual fields using kraJson[i].fieldName format
      formData.append(`kraJson[${i}].fk_empAppById`, this.EmpWiseForm.get('fk_empid')?.value || '');
      formData.append(`kraJson[${i}].kraId`, formValue.kraId);
      formData.append(`kraJson[${i}].srNo`, (i + 1).toString());
      formData.append(`kraJson[${i}].pk_kraassId`, formValue.pk_kraassId);
      formData.append(`kraJson[${i}].rmAssessment`, formValue.RMAssessment);
      formData.append(`kraJson[${i}].rmAssessmentRemarks`,formValue.RMRemark);
      formData.append(`kraJson[${i}].approvalStatus`, '2');
   
      // Attach file if present
    if (formValue.FileBytes instanceof File) {
      formData.append(`files`, formValue.FileBytes, formValue.FileBytes.name);
      formData.append(`kraJson[${i}].assessmentAttachmentPath`, formValue.FileBytes.name);
    } else {
      formData.append(`kraJson[${i}].assessmentAttachmentPath`, '');
    }
  });

  // Submit to API
  this.KRAService.update_RMAssessment(formData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success('All RMassessments submitted successfully!');
      this.router.navigate(['/dash/performance/performancedashboard/Report-manager-assessment-List']);

      } else {
        this.toastrService.warning(res.message || 'Some error occurred.');
      }
    },
    error: () => {
      this.toastrService.error('Something went wrong during submission.');
    }
  });
}

  kraStatus: number = 0; // declare


onSubOne(index: number): void {
     debugger
  if (this.kraStatus === 2) {
    this.toastrService.info('Already submitted. No changes allowed.');
    return;
  }
  
  this.showError = true;
  const formGroup = this.cards.at(index) as FormGroup;

  // Patch Summernote content to formGroup
  formGroup.patchValue({
    RMRemark: $(`#summernoteEditor2_${index}`).summernote('code'),
  });

  // Validate both this form and the main form
  if (formGroup.invalid || this.EmpWiseForm.invalid) {
    this.toastrService.warning(`Please complete all required fields for card ${index + 1}`);
    return;
  }

  const formValue = formGroup.value;
  const formData = new FormData();

  // Append primary key for targeted update
  formData.append(`kraJson[0].pk_kraassId`, formValue.pk_kraassId);
  formData.append(`kraJson[0].kraId`, formValue.kraId);
  // formData.append(`kraJson[0].fk_kraperiodId`, this.EmpWiseForm.get('fk_kraperiodId')?.value || '');
  formData.append(`kraJson[0].fk_empAppById`, this.EmpWiseForm.get('fk_empid')?.value || '');
  formData.append(`kraJson[0].srNo`, (index + 1).toString());

  // RM Assessment details
  formData.append(`kraJson[0].rmAssessment`, formValue.RMAssessment);
  formData.append(`kraJson[0].rmAssessmentRemarks`,formValue.RMRemark);
  formData.append(`kraJson[0].approvalStatus`, '1'); // RM Approval
  
  // File handling

   if (formValue.FileBytes instanceof File) {
      formData.append(`files`, formValue.FileBytes, formValue.FileBytes.name);
      formData.append(`kraJson[0].assessmentAttachmentPath`, formValue.FileBytes.name);
    } else {
      formData.append(`kraJson[0].assessmentAttachmentPath`, '');
    }

  this.KRAService.update_RMAssessment(formData).subscribe({
    next: (res) => {  
      if (res.isSuccess) {
        this.toastrService.success(`Data updated successfully`);
      } else {
        this.toastrService.warning(res.message || 'Submission failed.');
      }
    },
    error: () => {
      this.toastrService.error('Something went wrong during submission.');
    }
  });
}


 onFileSelect(event: Event, index: number, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const cardControl = this.cards.at(index);
      cardControl.patchValue({ [controlName]: file });
    }
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

 getDropdown() {
    this.KRAService.KraPeriodList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.PeriodData = res.data.map((item: any) => ({
            name: item.name,
            value: item.value
          }));
        } else {
          this.toastrService.error('Failed to load list.');
        }
      },
      error: (err) => {
        this.toastrService.error('Error fetching list.');
      }
    });
  }


  // onFileSelect(event: any, index: number, controlName: string) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.cards.at(index).get(controlName)?.setValue(file);
  //   }
  // }

  getFileName(index: number, controlName: string): string | null {
    const file = this.cards.at(index).get(controlName)?.value;
    return file ? (file.name || file) : null;
  }

  // getDownloadLink(index: number, controlName: string): string {
  //   const file = this.cards.at(index).get(controlName)?.value;
  //   return file ? `your_file_path/${file.name || file}` : '#';
  // }

  isEditMode = false;  // true if editing, false if adding
  editRecordId: number | null = null;










  // function for validate self assessment









  // populateStaticKRA(): void {
  //   this.cards.clear();
  //   for (let kra of this.staticKRAData) {
  //     this.cards.push(this.fb.group({
  //       kra: [this.stripHtml(kra.kra)],
  //       kpi: [this.stripHtml(kra.kpi)],
  //       targetvalue: [this.stripHtml(kra.targetvalue)],
  //       // weightage: [kra.weightage],
  //       weightage: [parseFloat(kra.weightage)],
  //       selfassesment: [kra.selfassesment || ''],
  //       RMAssessment: [kra.RMAssessment || ''],
  //       HODAssessment: [kra.HODAssessment || '']
  //     }));
  //   }

  // }


  ngAfterViewInit(): void {
    this.initSummernoteForIndex(0);

    const header = document.getElementById('stickyHeader');
    const stickyOffset = header?.offsetTop || 0;

    window.addEventListener('scroll', () => {
      if (window.scrollY >= stickyOffset) {
        header?.classList.add('sticky-active');
      } else {
        header?.classList.remove('sticky-active');
      }
    });
  }


ngAfterViewChecked() {
    this.cards.controls.forEach((_, index) => {
      const rmAssesmentSelector = `#summernoteEditor${index}`;
      const rmRemarkSelector = `#summernoteEditor2_${index}`;


      if (!$(rmAssesmentSelector).next('.note-editor').length) {
        $(rmAssesmentSelector).summernote({
          airMode: true,
          placeholder: 'Rm Assessment...',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(rmRemarkSelector).next('.note-editor').length) {
        $(rmRemarkSelector).summernote({
          airMode: true,
          placeholder: 'RM  Remark..',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }













    });
  }






  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scroll failed', err);
    }
  }



  initSummernoteForIndex(index: number): void {
    const commonOptions = {
      airMode: true,
      placeholder: 'Type here...',
      tabsize: 2,
      toolbar: [
        ['style', ['bold', 'italic', 'underline']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['insert', ['link']],
        ['view', ['codeview']]
      ]
    };

    $(`#summernoteEditor${index}`).summernote({ ...commonOptions, placeholder: 'Self Assesment...' });
    $(`#summernoteEditor2_${index}`).summernote({ ...commonOptions, placeholder: 'Self Remark..' });
    $(`#summernoteEditor3_${index}`).summernote({ ...commonOptions, placeholder: 'RM Assesment...' });
    $(`#summernoteEditor4_${index}`).summernote({ ...commonOptions, placeholder: 'RM Remark...' });
    $(`#summernoteEditor5_${index}`).summernote({ ...commonOptions, placeholder: 'HOD Assesment...' });
    $(`#summernoteEditor6_${index}`).summernote({ ...commonOptions, placeholder: 'HOD Remark...' });

  }



  download(filename: string) {
  this.Service.getImage(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Failed to download image:', err);
    }
  });
}



}



