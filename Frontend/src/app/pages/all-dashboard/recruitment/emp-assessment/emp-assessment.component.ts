import { AfterViewChecked, AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { boolean } from 'mathjs';
import { NgSelectModule } from '@ng-select/ng-select';
declare const $: any;

@Component({
  selector: 'app-emp-assessment',
  standalone: true,
   imports: [CommonModule, FormsModule,ReactiveFormsModule,NgSelectModule],
  templateUrl: './emp-assessment.component.html',
  styleUrl: './emp-assessment.component.scss'
})
export class EmpAssessmentComponent implements AfterViewInit, AfterViewChecked {


  //  summernote start code

// cards: number[] = [0];
  shouldScroll = false;

    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

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
        placeholder: 'Self Assessment..',
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


  //  use summernote end 
  


  currentStep = 1;
  EmpWiseForm!:FormGroup
  showError:boolean=false

  employeeSelected = false;


  employeeList = [
    { id: 'E001', name: 'Anchal Sharma' },
    { id: 'E002', name: 'Rahul Verma' }
  ];

 staticKRAData = [
  { KRA: 'Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work Quality of Work ', KPI: 'Error rate < 5%', Weightage: 30 },
  { KRA: 'Timeliness', KPI: 'On-time delivery', Weightage: 40 }
];

constructor(private fb:FormBuilder) {}
  


  ngOnInit() {
  this.EmpWiseForm = this.fb.group({
    fk_empid: [null, Validators.required],
    cards: this.fb.array([])
  });
}


get cards(): FormArray {
  return this.EmpWiseForm.get('cards') as FormArray;
}

// onEmployeeSelect(empId: any) {
//   this.currentStep = 1;
//   // Call API to get KRA details, then populate cards
//   this.populateKRAs(empId);
// }


onEmployeeSelect(): void {
  const empId = this.EmpWiseForm.get('fk_empid')?.value;
  console.log('Employee selected:', empId);
  if (empId) {
    this.employeeSelected = true;
    this.currentStep = 1;
    this.populateStaticKRA();
  } else {
    this.employeeSelected = false;
    this.cards.clear();
  }
}

populateStaticKRA(): void {
  console.log('KRA data:', this.staticKRAData);
  this.cards.clear();
  for (let kra of this.staticKRAData) {
    this.cards.push(this.fb.group({
      KRA: [kra.KRA],
      KPI: [kra.KPI],
      Weightage: [kra.Weightage],
      selfassesment: [''],
      RMAssessment: [''],
      HODAssessment: ['']
    }));
  }
}




   nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  submitAssessment(): void {
    if (this.EmpWiseForm.valid) {
      console.log('Final Submitted Data:', this.EmpWiseForm.value);
      alert('Assessment submitted successfully!');
    } else {
      alert('Form is invalid!');
    }
  }






// populateKRAs(empId: any) {
//   // Dummy Example (replace with actual service call)
//   const dummyKRAs = [
//     { KRA: 'Customer Service', KPI: 'Response Time', Weightage: 30 },
//     { KRA: 'Quality', KPI: 'Defect Rate', Weightage: 40 }
//   ];

//   const formGroups = dummyKRAs.map(kra => this.fb.group({
//     KRA: [kra.KRA],
//     KPI: [kra.KPI],
//     Weightage: [kra.Weightage],
//     SelfAssessment: [''],
//     RMAssessment: [''],
//     HODAssessment: ['']
//   }));

//   const formArray = this.fb.array(formGroups);
//   this.EmpWiseForm.setControl('cards', formArray);
// }

onFileSelect(event: any, index: number, controlName: string) {
  const file = event.target.files[0];
  if (file) {
    this.cards.at(index).get(controlName)?.setValue(file);
  }
}
getFileName(index: number, controlName: string): string | null {
  const file = this.cards.at(index).get(controlName)?.value;
  return file ? (file.name || file) : null;
}
getDownloadLink(index: number, controlName: string): string {
  const file = this.cards.at(index).get(controlName)?.value;
  return file ? `your_file_path/${file.name || file}` : '#';
}

// 
}