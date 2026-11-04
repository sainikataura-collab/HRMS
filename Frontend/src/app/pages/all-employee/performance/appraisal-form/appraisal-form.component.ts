
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AttendanceService } from '../../../all-employee/attendance/Services/attendance.service';
import { PrograssionDetailService } from '../Service/prograssion-detail.service';
import { QualificationDetailService } from '../../../all-dashboard/payroll/services/employeeQualification.service';
import { ManualPunchBio } from '../../../all-dashboard/payroll/services/manual-puch-bio.service';

import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-appraisal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule, RouterLink, SafeHtmlPipe],
  templateUrl: './appraisal-form.component.html',
  styleUrls: ['./appraisal-form.component.scss']
})
export class AppraisalFormComponent {
  form!: FormGroup;
  employeeList: { name: string, value: string }[] = [];
  years: any[] = [];
  selectedEmpDetails: any = null;
  isUpdateMode = false;
  isInitialLoadDone = false;
  pkAppEmpId: string = '';
  submissionStatus: number = 0; // 0 = draft, 1 = final

  constructor(
    private fb: FormBuilder,
    private qualificationService: QualificationDetailService,
    private httpservice: ManualPunchBio,
    private appraisalService:   PrograssionDetailService,
    private sanitizer: DomSanitizer,
    private tostr: ToastrService,
    private router: Router,
    private loader: NgxUiLoaderService,
    private route: ActivatedRoute,
   private httpAttendanceService: AttendanceService
  ) {}

  ngOnInit() {
     this.loader.start();
    const empId = this.route.snapshot.paramMap.get('empId');
    const yearId = Number(this.route.snapshot.paramMap.get('yearId'));
    this.form = this.fb.group({
      selectedEmployee: [null],
      selectedYear: [null],
      kraList: this.fb.array([]),
      behavioralAttributes: this.fb.array([]),
      managerComment: [''],
      employeeComment: ['']
    });

    if (empId && yearId) {
      this.isUpdateMode = true;
     
      this.getAppraisalById(empId, yearId);
    } else {
      this.isInitialLoadDone = true;
    }

    this.getEmployees();
    this.getyearsList();
    this.setupFormSubscriptions();
       this.loader.stop();
  }

  setupFormSubscriptions() {
    let lastEmp: string | null = null;
    let lastYear: string | null = null;

    this.form.get('selectedEmployee')?.valueChanges.subscribe(emp => {
      const year = this.form.get('selectedYear')?.value;
      if (this.isInitialLoadDone && emp && year && (emp !== lastEmp || year !== lastYear)) {
        lastEmp = emp;
        lastYear = year;
        this.fetchAppraisalData(emp, year);
      }
    });

    this.form.get('selectedYear')?.valueChanges.subscribe(year => {
      const emp = this.form.get('selectedEmployee')?.value;
      if (this.isInitialLoadDone && emp && year && (emp !== lastEmp || year !== lastYear)) {
        lastEmp = emp;
        lastYear = year;
        this.fetchAppraisalData(emp, year);
      }
    });
  }

  createKraItem(kra: any) {
    return this.fb.group({
      description: [kra.description],
      target: [kra.target],
      achievement: [kra.achievement],
      weight: [kra.weight],
      rating: [kra.rating ?? 0, [Validators.min(0), Validators.max(5)]]
    });
  }

  createBehavioralItem(attr: any) {
    return this.fb.group({
      name: [attr.name],
      rating: [attr.rating ?? 0, [Validators.min(0), Validators.max(5)]],
      comment: [attr.comment ?? '']
    });
  }

  fetchAppraisalData(empId: string, year: string) {
    this.appraisalService.appraisalDetails(empId, year).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.selectedEmpDetails = res.data.empInfo || null;

          const kraList = res.data.kraevaluation || [];
          const behavioralAttributes = res.data.behavioralAttribute || [];

          const kraFormArray = this.fb.array(kraList.map((kra: any) => this.createKraItem(kra)));
          const behavioralFormArray = this.fb.array(behavioralAttributes.map((attr: any) => this.createBehavioralItem(attr)));

          this.form.setControl('kraList', kraFormArray);
          this.form.setControl('behavioralAttributes', behavioralFormArray);
        } else {
          this.resetFormArrays();
        }
      },
      error: () => this.resetFormArrays()
    });
  }

  resetFormArrays() {
    this.form.setControl('kraList', this.fb.array([]));
    this.form.setControl('behavioralAttributes', this.fb.array([]));
    this.selectedEmpDetails = null;
  }

  getEmployees(): void {
    this.httpAttendanceService.getEmployeeNameList().subscribe({
      next: (res) => {
        this.employeeList = res.isSuccess
          ? res.data.map((emp: any) => ({ name: emp.name, value: emp.value }))
          : [];
      },
      error: () => this.employeeList = []
    });
  }

  getyearsList() {
    this.appraisalService.AppraisalYearDdl().subscribe({
      next: (res) => this.years = res.data || []
    });
  }

  get kraListFormArray(): FormArray {
    return this.form.get('kraList') as FormArray;
  }

  get behavioralAttributesFormArray(): FormArray {
    return this.form.get('behavioralAttributes') as FormArray;
  }

  get finalKraScore(): number {
    const total = this.kraListFormArray.controls.reduce((sum, ctrl) => {
      const weight = +ctrl.get('weight')?.value || 0;
      const rating = +ctrl.get('rating')?.value || 0;
      return sum + (weight * rating);
    }, 0);
    const totalWeight = this.kraListFormArray.controls.reduce((sum, ctrl) => {
      return sum + (+ctrl.get('weight')?.value || 0);
    }, 0);
    return totalWeight ? +(total / totalWeight).toFixed(2) : 0;
  }

  get behavioralScoreAvg(): number {
    const total = this.behavioralAttributesFormArray.controls.reduce((sum, ctrl) => {
      return sum + (+ctrl.get('rating')?.value || 0);
    }, 0);
    const count = this.behavioralAttributesFormArray.length;
    return count ? +(total / count).toFixed(2) : 0;
  }

  get finalWeightedScore(): number {
    return +((this.finalKraScore * 0.7) + (this.behavioralScoreAvg * 0.3)).toFixed(2);
  }

  get finalRating(): string {
    const score = this.finalWeightedScore;
    if (score < 50) return 'C';
    if (score < 60) return 'B';
    if (score < 70) return 'A';
    if (score < 80) return 'A+';
    return 'A++';
  }

  // saveDraft() {
  //   console.log('kraList:', this.kraListFormArray);
  // }

 getAppraisalById(empId: string, yearId: number) {
  this.appraisalService.appraisaldetailsview(empId, yearId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        const main = res.data.empInfo;
        const kraList = res.data.kraevaluation || [];
        const behavioralList = res.data.behavioralAttribute || [];
        
        this.pkAppEmpId = main.pk_appempId;

        // ✅ Patch base fields
        this.form.patchValue({
          selectedEmployee: empId,
          selectedYear: yearId.toString(),
          managerComment: main.managerComments,
          employeeComment: main.employeeComments

        });
         this.isUpdateMode=true
  this.form.get('selectedEmployee')?.disable();
  this.form.get('selectedYear')?.disable();


        // ✅ Patch kraList
        const kraFormArray = this.fb.array(kraList.map((k: any) => this.fb.group({
          description: k.Description,
          target: k.Target,
          achievement: k.Achievement,
          weight: k.weight,
          rating: k.rating
        })));
        this.form.setControl('kraList', kraFormArray);

        // ✅ Patch behavioralAttributes
        const behaviorFormArray = this.fb.array(behavioralList.map((b: any) => this.fb.group({
          name: b.Name,
          rating: b.Rating,
          comment: b.Comment
        })));
        this.form.setControl('behavioralAttributes', behaviorFormArray);

       // ✅ Save full empInfo for view
      this.selectedEmpDetails = {
  name: main.EmployeeName,
  code: main.empcode,
  department: main.department,
  designation: main.designation,
  manager: main.manager,
  Date: main.AppraisalYear,

  kraScore: +main.kraScore || 0,
  behavioralScore: +main.behavioralScore || 0,
  finalWeightedScore: +main.FinalWeightedScore || 0,
  managerComments: main.managerComments,
  employeeComments: main.employeeComments,
  dated: main.dated
};

      }
    },
    error: (err) => {
      console.error('Error fetching appraisal by ID', err);
      this.resetFormArrays();
    }
  });
}

saveDraft() {
  this.submissionStatus = 0;
  this.submit();
}

finalSave() {
  this.submissionStatus = 1;
  this.submit();
}





  submit() {
  const empId = this.form.value.selectedEmployee;
  const appId = +this.form.value.selectedYear;

  // ✅ If in update mode (pkAppEmpId is set), skip duplicate check
  if (this.pkAppEmpId) {
    this.saveAppraisal(empId, appId);
  } else {
    this.appraisalService.checkAppraisalExists(empId, appId).subscribe({
      next: res => {
        if (res.isSuccess && res.data?.isDuplicate) {
          this.tostr.warning(res.message || 'Appraisal for this employee and year already exists!');
          return;
        }
        this.saveAppraisal(empId, appId);
      },
      error: err => {
        console.error('Error checking duplicate:', err);
        alert('Failed to check for duplicate appraisal.');
      }
    });
  }
}




saveAppraisal(empId: string, appId: number) {
  if (!this.form.valid) {
    console.warn('Form is invalid');
    return;
  }

  const formValue = this.form.getRawValue(); // Use getRawValue to include disabled fields

  const payload = {
    main: {
      pk_appempId: this.pkAppEmpId, // null or actual id
      selectedEmployee: formValue.selectedEmployee,
      selectedYear: formValue.selectedYear,
      managerComment: formValue.managerComment,
      employeeComment: formValue.employeeComment,
      finalKraScore: this.finalKraScore,
      behavioralScore: this.behavioralScoreAvg,
      finalWeightedScore: this.finalWeightedScore,
     status: this.submissionStatus // <-- will be 0 for draft or 1 for final

    },
    kraList: formValue.kraList.map((k: any) => ({
      description: k.description,
      target: k.target,
      achievement: Number(k.achievement) || 0,
      weight: +k.weight,
      rating: +k.rating
    })),
    behavioralList: formValue.behavioralAttributes.map((b: any) => ({
      name: b.name,
      rating: +b.rating,
      comment: b.comment ?? ''
    }))
  };

  this.appraisalService.AppraisalInsert(payload).subscribe({
    next: res => {
      if (res.isSuccess) {
        this.tostr.success(res.message || 'Appraisal submitted successfully.');
        this.router.navigate(['/dash/performance/performancedashboard/AppraisalList']);
      } else {
        this.tostr.error(res.message || 'Submission failed.');
      }
    },
    error: err => {
      console.error('Submission error:', err);
      alert('An error occurred during submission.');
    }
  });
}

}
