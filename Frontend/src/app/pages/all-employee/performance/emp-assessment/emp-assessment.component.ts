


import { forkJoin, Observable } from 'rxjs';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { boolean } from 'mathjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeMasterService } from '../../../all-dashboard/payroll/services/employee-master.service';
import { KraService } from '../Service/kra.service';
import { CandidateMasterService } from '../../../all-dashboard/recruitment/RecruitServices/candidate-master.service';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

declare const $: any;

@Component({
  selector: 'app-emp-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, SafeHtmlPipe],
  templateUrl: './emp-assessment.component.html',
  styleUrl: './emp-assessment.component.scss'
})


export class EmpAssessmentComponent implements AfterViewInit, AfterViewChecked {
  shouldScroll = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  currentStep = 1;
  EmpWiseForm!: FormGroup
  showError: boolean = false
  Isedit: boolean = false
  employeeSelected = false;
  PeriodData: { name: string, value: string }[] = [];
  employeeList: { name: string, value: string }[] = [];
  pk_kraassId: number | null = null;
  // fk_kraperiodId!: number;
  getAssessmentData: any[] = [];
  staticKRAData: any[] = [];
 

  // Fill from backend
  constructor(private fb: FormBuilder, private employeeMasterService: EmployeeMasterService,private Service:CandidateMasterService,
    private toastrService: ToastrService, private KRAService: KraService, private route: ActivatedRoute, private sanitizer: DomSanitizer,private router:Router,) { }

  ngOnInit() {

    this.EmpWiseForm = this.fb.group({
      //fk_empid: [null],
      fk_kraperiodId: [null, Validators.required],
      cards: this.fb.array([])
    });
 
    this.pk_kraassId = Number(this.route.snapshot.paramMap.get('pk_kraassId'));


    if (!this.pk_kraassId) {
      this.onEmployeeSelect();
    }
    // ✅ Only proceed if BOTH are valid positive numbers
    if (!isNaN(this.pk_kraassId) && this.pk_kraassId > 0 && !isNaN(this.pk_kraassId) && this.pk_kraassId > 0) {
      
      this.getAssessmentByKRAId();
      this.Isedit = true;
    }
    this.getDropdown();
  }








  isDuplicatePeriod: boolean = false;

  onPeriodSelect(periodIdStr: any): void {
    this.isDuplicatePeriod = false;
    debugger

    const periodId = Number(periodIdStr?.value);
    if (periodId) {

      this.KRAService.validatePeriod(periodId).subscribe({
        next: (res) => {
          debugger
          if (!res.isSuccess) {
            this.isDuplicatePeriod = true;
            this.toastrService.warning(res.message || 'This period is already used.');
            this.EmpWiseForm.patchValue({ fk_kraperiodId: null });
          }
        },
        error: () => {
          this.isDuplicatePeriod = true;
          this.toastrService.error('Error while checking period availability.');
          this.EmpWiseForm.patchValue({ fk_kraperiodId: null });
        }
      });
    }
  }


  get cards(): FormArray {
    return this.EmpWiseForm.get('cards') as FormArray;
  }

  populateStaticKRA(): void {
    this.cards.clear();

    for (let kra of this.staticKRAData) {
      const group = this.fb.group({
        pk_KraAssessmentId: [kra.pk_KraAssessmentId || 0],
        pk_kraassTrnId: [kra.pk_kraassTrnId],
        kraId: [kra.kraId || kra.fk_KRAId],
        attachmentPath: [kra.attachmentPath],
        kra: [kra.kra],
        kpi: [kra.kpi],
        kpa: [kra.kpa],
        targetvalue: [kra.targetvalue],
        weightage: [kra.weightage],      //  selfAssessment: [0, Validators.required],
        selfAssessment: [kra.selfAssessment],
        selfRemark: [kra.assessmentRemarks],
        FileBytes: [null],
        status:[kra.status || 0]
      },

      { validators: this.validateSelfAssessment() });

 // ✅ Disable fields if status is 1


      this.cards.push(group);
       // 👇 Load image preview if attachment exists
    if (kra.attachmentPath) {
      this.loadImage(kra.attachmentPath);
    }
      if (kra?.status == 1) {
    group.get('selfAssessment')?.disable();
    group.get('selfRemark')?.disable();
  }

    }


  }

  onEmployeeSelect(): void {

    // const empId = this.EmpWiseForm.get('fk_empid')?.value;

    this.employeeSelected = true;
    this.currentStep = 1;
    this.KRAService.GetById_Self_KRA().subscribe({

      next: (response) => {
        if (response.isSuccess && response.data) {
          this.staticKRAData = response.data;
          this.populateStaticKRA();
          this.getDropdown();
        } else {
          this.toastrService.warning(response.message);
          this.staticKRAData = [];
          this.cards.clear();
        }
      },
      error: (err) => {
        console.error('Error fetching KRA:', err);
        this.toastrService.error('Failed to fetch KRA data.');
        this.staticKRAData = [];
        this.cards.clear();
      }
    });

  }

  // onSubAll() {
  
  //   this.showError = true;

  //   if (this.EmpWiseForm.invalid) {
  //     this.toastrService.warning('Please fill in all required fields.');
  //     return;
  //   }

  //   const formData = new FormData();

  //   this.cards.controls.forEach((cardForm: AbstractControl, i: number) => {
  //     const formGroup = cardForm as FormGroup;

  //     formGroup.patchValue({
  //       selfRemark: $(`#summernoteEditor2_${i}`).summernote('code'),
  //     });

  //     if (formGroup.invalid) {
  //       this.toastrService.warning(`Please complete all fields for card ${i + 1}`);
  //       return;
  //     }

  //     const formValue = formGroup.value;

  //     // Append KRA fields
  //     formData.append(`kraJson[${i}].kraPeriodId`, this.EmpWiseForm.get('fk_kraperiodId')?.value || '');
  //     // formData.append(`kraJson[${i}].fk_empid`, this.EmpWiseForm.get('fk_empid')?.value || '');
  //     formData.append(`kraJson[${i}].srNo`, (i + 1).toString());
  //     formData.append(`kraJson[${i}].kraId`, formValue.kraId);
  //     formData.append(`kraJson[${i}].kra`, formValue.kra);
  //     formData.append(`kraJson[${i}].kpi`, formValue.kpi);
  //     formData.append(`kraJson[${i}].kpa`, formValue.kpa);

  //     formData.append(`kraJson[${i}].TargetValue`, formValue.targetvalue);
  //     formData.append(`kraJson[${i}].Weightage`, formValue.weightage);

  //     formData.append(`kraJson[${i}].selfAssessment`, formValue.selfAssessment);
  //     formData.append(`kraJson[${i}].assessmentRemarks`, formValue.selfRemark);
  //     formData.append(`kraJson[${i}].status`, '1');




  //     // ----- Handle First File (AttachmentPath) -----
  //     if (formValue.FileBytes instanceof File) {
  //       const file1 = formValue.FileBytes;
  //       formData.append('files', file1, file1.name);
  //       formData.append(`kraJson[${i}].assessmentAttachmentPath`, file1.name);
  //     } else {
  //       formData.append(`kraJson[${i}].assessmentAttachmentPath`, '');
  //     }

  //     formData.append(`kraJson[${i}].attachmentPath`, formValue.attachmentPath);

  //   });

  //   // Call API
  //   this.KRAService.Insert_Add_Self_Emp_Kra(formData).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.toastrService.success('All assessments submitted successfully!');
  //       } else {
  //         this.toastrService.warning(res.message || 'Submission failed.');
  //       }
  //     },
  //     error: () => {
  //       this.toastrService.error('Server error during submission.');
  //     }
  //   });
  // }

  onSubAll() {
  this.showError = true;

  if (this.EmpWiseForm.invalid) {
    this.toastrService.warning('Please fill in all required fields.');
    return;
  }

  const formData = new FormData();
  let hasEligible = false;

  this.cards.controls.forEach((cardForm: AbstractControl, i: number) => {
    const formGroup = cardForm as FormGroup;

    // Skip if status is 1 (already submitted)
    if (formGroup.get('status')?.value === 1) {
      return;
    }

    hasEligible = true;

    formGroup.patchValue({
      selfRemark: $(`#summernoteEditor2_${i}`).summernote('code'),
    });

    if (formGroup.invalid) {
      this.toastrService.warning(`Please complete all fields for card ${i + 1}`);
      return;
    }

    const formValue = formGroup.value;

    // Append fields to formData
    formData.append(`kraJson[${i}].kraPeriodId`, this.EmpWiseForm.get('fk_kraperiodId')?.value || '');
    formData.append(`kraJson[${i}].srNo`, (i + 1).toString());
    formData.append(`kraJson[${i}].kraId`, formValue.kraId);
    formData.append(`kraJson[${i}].kra`, formValue.kra);
    formData.append(`kraJson[${i}].kpi`, formValue.kpi);
    formData.append(`kraJson[${i}].kpa`, formValue.kpa);
    formData.append(`kraJson[${i}].TargetValue`, formValue.targetvalue);
    formData.append(`kraJson[${i}].Weightage`, formValue.weightage);
    formData.append(`kraJson[${i}].selfAssessment`, formValue.selfAssessment);
    formData.append(`kraJson[${i}].assessmentRemarks`, formValue.selfRemark);
    formData.append(`kraJson[${i}].status`, '1');

    if (formValue.FileBytes instanceof File) {
      const file1 = formValue.FileBytes;
      formData.append('files', file1, file1.name);
      formData.append(`kraJson[${i}].assessmentAttachmentPath`, file1.name);
    } else {
      formData.append(`kraJson[${i}].assessmentAttachmentPath`, '');
    }

    formData.append(`kraJson[${i}].attachmentPath`, formValue.attachmentPath);
  });

  // If no records with status 0
  if (!hasEligible) {
    this.toastrService.info('All records have already been submitted.');
    return;
  }

  // Call API
  this.KRAService.Insert_Add_Self_Emp_Kra(formData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success('All eligible assessments submitted successfully!');
       this.router.navigate(['/dash/performance/performancedashboard/Empwise-self-Assessment-List']);

        
      } else {
        this.toastrService.warning(res.message || 'Submission failed.');
      }
    },
    error: () => {
      this.toastrService.error('Server error during submission.');
    }
  });
}






  pk_KraAssessmentId!: number;

  kraStatus: number = 0; // declare at top



  getAssessmentByKRAId(): void {
    if (this.pk_kraassId !== null) {
      this.KRAService.GetById_Assessment_KRA(this.pk_kraassId).subscribe({
        next: (response) =>{
          if (response.isSuccess && response.data && response.data.length > 0) {
            this.staticKRAData = response.data; // ✅ Needed
            this.populateStaticKRA();  // <<<< critical call
            const kraInfo = response.data[0];
            this.kraStatus = kraInfo.status; // <-- ✅ Save status
            this.EmpWiseForm.get('fk_kraperiodId')?.setValue(String(kraInfo.kraPeriodId));
            this.EmpWiseForm.get('fk_kraperiodId')?.disable();


            // this.pk_KraAssessmentId=kraInfo.pk_KraAssessmentId[0]


            this.employeeSelected = true;

          }
        },
        error: () => {
          this.toastrService.error('Failed to fetch Assessment KRA data.');
          this.staticKRAData = [];
          this.cards.clear();
        }
      });
    }
  }


  onSubOne(index: number) {
    debugger
  if (this.kraStatus === 1) {
    this.toastrService.info('Already submitted. No changes allowed.');
    return;
  }

  const formGroup = this.cards.at(index) as FormGroup;

  formGroup.patchValue({
    selfRemark: $(`#summernoteEditor2_${index}`).summernote('code'),
  });

  if (formGroup.invalid || this.EmpWiseForm.get('fk_kraperiodId')?.invalid) {
    this.toastrService.warning('Please fill all fields before submitting.');
    return;
  }

  const formData = new FormData();
  const formValue = formGroup.value;

  // const status =  '0'; // Still status 1 (draft), final is only in `onSubAll`
  formData.append(`kraJson[0].kraPeriodId`, this.EmpWiseForm.get('fk_kraperiodId')?.value);
  // formData.append(`kraJson[0].fk_empid`, this.); // ensure `this.empId` is set
  formData.append(`kraJson[0].srNo`, (index + 1).toString());
  formData.append(`kraJson[0].kraId`, formValue.kraId);
  formData.append(`kraJson[0].kra`, formValue.kra || '');
  formData.append(`kraJson[0].kpi`, formValue.kpi || '');
  formData.append(`kraJson[0].kpa`, formValue.kpa || '');
  formData.append(`kraJson[0].TargetValue`, formValue.targetvalue || '');
  formData.append(`kraJson[0].Weightage`, formValue.weightage || '');
  formData.append(`kraJson[0].selfAssessment`, formValue.selfAssessment || '');
  formData.append(`kraJson[0].assessmentRemarks`, formValue.selfRemark || '');
  formData.append(`kraJson[0].status`, '0');

  if (formValue.FileBytes instanceof File) {
    formData.append('files', formValue.FileBytes, formValue.FileBytes.name);
    formData.append(`kraJson[0].assessmentAttachmentPath`, formValue.FileBytes.name);
  } else {
    formData.append(`kraJson[0].assessmentAttachmentPath`, '');
  }

  formData.append(`kraJson[0].attachmentPath`, formValue.attachmentPath || '');

  this.KRAService.Insert_Add_Self_Emp_Kra(formData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success(res.message);
        this.getAssessmentByKRAId(); // reload updated data
      } else {
        this.toastrService.warning(res.message || 'Submission failed.');
      }
    },
    error: () => {
      this.toastrService.error('Server error during submission.');
    }
  });
}

  onFileSelect(event: Event, index: number, controlName: string) {
    debugger
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const cardControl = this.cards.at(index);
      cardControl.patchValue({ [controlName]: file });
    }
  }

  isAllSubmitted(): boolean {
  return this.cards.controls.every(ctrl => ctrl.get('status')?.value == 1);
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


  getFileName(index: number, controlName: string): string | null {
    const file = this.cards.at(index).get(controlName)?.value;
    return file ? (file.name || file) : null;
  }

  getDownloadLink(index: number, controlName: string): string {
    const file = this.cards.at(index).get(controlName)?.value;
    return file ? `your_file_path/${file.name || file}` : '#';
  }

  isEditMode = false;  // true if editing, false if adding
  editRecordId: number | null = null;




  // function for validate self assessment

  validateSelfAssessment(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const selfAssessment = group.get('selfAssessment')?.value;
      const weightage = group.get('weightage')?.value;

      if (selfAssessment != null && weightage != null && +selfAssessment > +weightage) {
        return { assessmentExceedsWeightage: true };
      }
      return null;
    };
  }


  
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
      const selfAssesmentSelector = `#summernoteEditor${index}`;
      const selfRemarkSelector = `#summernoteEditor2_${index}`;
      const rmAssesmentSelector = `#summernoteEditor3_${index}`;
      const rmRemarkSelector = `#summernoteEditor4_${index}`;
      const hodAssesmentSelector = `#summernoteEditor5_${index}`;
      const hodRemarkSelector = `#summernoteEditor6_${index}`;

      if (!$(selfAssesmentSelector).next('.note-editor').length) {
        $(selfAssesmentSelector).summernote({
          airMode: true,
          placeholder: 'Self Assessment...',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(selfRemarkSelector).next('.note-editor').length) {
        $(selfRemarkSelector).summernote({
          airMode: true,
          placeholder: 'Self Remarks..',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(rmAssesmentSelector).next('.note-editor').length) {
        $(rmAssesmentSelector).summernote({
          airMode: true,
          placeholder: 'RM Assessment...',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(rmRemarkSelector).next('.note-editor').length) {
        $(rmRemarkSelector).summernote({
          airMode: true,
          placeholder: 'RM Remarkt..',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(hodAssesmentSelector).next('.note-editor').length) {
        $(hodAssesmentSelector).summernote({
          airMode: true,
          placeholder: 'HOD Assessment...',
          toolbar: [['style', ['bold', 'italic', 'underline']], ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link']], ['view', ['codeview']]]
        });
      }


      if (!$(hodRemarkSelector).next('.note-editor').length) {
        $(hodRemarkSelector).summernote({
          airMode: true,
          placeholder: 'HOD Remarkt..',
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

exceedMessages:boolean[]=[];


  onAssessmentInput(index: number): void {
  const cardGroup = this.cards.at(index);
  const weightage = +cardGroup.get('weightage')?.value;
  let value = +cardGroup.get('selfAssessment')?.value;

  if (value > weightage) {
    cardGroup.get('selfAssessment')?.setValue(weightage);
    this.exceedMessages[index] = true;

    // Hide message after 2 seconds
    setTimeout(() => {
      this.exceedMessages[index] = false;
    }, 1000);
  } else {
    this.exceedMessages[index] = false;
  }
}


// imageMap: { [filename: string]: string } = {}; // filename -> base64 image

// loadImage(filename: string) {
//   if (this.imageMap[filename]) return; // Avoid reloading

//   this.Service.getImage(filename).subscribe({
//     next: (blob) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imageMap[filename] = reader.result as string;
//       };
//       reader.readAsDataURL(blob);
//     },
//     error: (err) => {
//       console.error('Failed to load image:', err);
//     }
//   });
// }

// download(filename: string) {
//   this.Service.getImage(filename).subscribe({
//     next: (blob) => {
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     },
//     error: (err) => {
//       console.error('Failed to download image:', err);
//     }
//   });
// }


imageMap: { [filename: string]: string } = {}; // Cache of base64 image URLs

loadImage(filename: string) {
  if (this.imageMap[filename]) return;

  this.Service.getImage(filename).subscribe({
    next: (blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageMap[filename] = reader.result as string;
      };
      reader.readAsDataURL(blob);
    },
    error: (err) => {
      console.error('Failed to load image:', err);
    }
  });
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

