import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { KraService } from '../Service/kra.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CandidateMasterService } from '../../../all-dashboard/recruitment/RecruitServices/candidate-master.service';
import { EmployeeMasterService } from '../../../all-dashboard/payroll/services/employee-master.service';
import { AttendanceService } from '../../attendance/Services/attendance.service';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

declare const $: any;

@Component({
  selector: 'app-emp-hod-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, SafeHtmlPipe],
  templateUrl: './emp-hod-view.component.html',
  styleUrl: './emp-hod-view.component.scss'
})
export class EmpHodViewComponent {
shouldScroll = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;


  // use summernote end 

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
   private  httpAttendanceService :AttendanceService,
  private sanitizer: DomSanitizer,
private Service:CandidateMasterService) { }



  ngOnInit() {
    this.EmpWiseForm = this.fb.group({
      fk_empid: [null, Validators.required],
      fk_kraperiodId: [null, Validators.required],
      cards: this.fb.array([]) // <<< important

    });

    this.getDropdown()
    this.populateStaticKRA();
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
      hodTrnAppId: [kra.hodTrnAppId || 0],
       attachmentPath: [kra.attachmentPath],
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

      HODAssessment: [kra.hodAssessment],
      HODRemark: [kra.hodAssessmentRemarks],

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





pk_KraAssessmentId!: number;

 getAssessmentByKRAId(): void {
  if (this.fk_empid !== null) {
    this.KRAService.GetById_HODAssessment_KRA(this.fk_empid,this.fk_kraperiodId).subscribe({
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





 kraStatus: number = 0; // declare



  











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


  isEditMode = false;  // true if editing, false if adding
  editRecordId: number | null = null;










  // function for validate self assessment













  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Scroll failed', err);
    }
  }




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



