import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TrainingService } from '../services/training.service';


@Component({
  selector: 'app-training-need-identification',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule,RouterLink, FormsModule, NgSelectModule,],

  templateUrl: './training-need-identification.component.html',
  styleUrl: './training-need-identification.component.scss'
})
export class TrainingNeedIdentificationComponent {
tniForm!: FormGroup;
  showError = false;
  Isedit = false;

  // dropdowns
  reasonList = [
    { id: 'PG', name: 'Performance Gap' },
    { id: 'C', name: 'Compliance' },
    { id: 'SU', name: 'Skill Upgrade' },
    { id: 'S', name: 'Suggestion' }
  ];

  priorityList = [
    { id: 'H', name: 'High' },
    { id: 'M', name: 'Medium' },
    { id: 'L', name: 'Low' }
  ];

  targetAudienceList = [
    { id: 'E', name: 'Self' },
    { id: 'TEAM', name: 'Team' },
    { id: 'D', name: 'Department' },
    { id: 'R', name: 'Role' }
  ];
  programddl: { label: string, value: string }[] = [];

  subprogramddl: { label: string, value: string }[] = [];

  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private trainingService: TrainingService,
     private toastr: ToastrService, private programService: ProgramService,private router:Router) { }

  ngOnInit(): void {
    this.tniForm = this.fb.group({
      reason: [null, Validators.required],
      priority: [null, Validators.required],
      proposedTimeline: [null, Validators.required],
      targetAudience: [null, Validators.required],
      remarks: [''],
      AttachmentPath: [null],
      FileBytes: [[]],
      fk_programId: [[],Validators.required],
      fk_subprogramId: [[],Validators.required],

    });

    this.ProgramList('Program')
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.tniForm.patchValue({ FileBytes: file });
    }
  }


  ProgramList(fieldName: string) {
  //  this.ngxUILoaderService.start(); // Start loader before API call
    this.programService.getCommonList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
          this.programddl = res.data.map((fk_programId: any) => ({
            name: fk_programId.name,
            value: fk_programId.value
          }));
        } else {
          this.toastr.error("Failed to load HOD list.");
        }
        // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching HOD list:", err);
        this.toastr.error("Error fetching level list.");

      }
    });
  }

    // Program → Subprogram mapping
  programSubprogramMap: { [programId: string]: any[] } = {};
  onProgramChange(selectedPrograms: any[]) {
    if (!selectedPrograms || selectedPrograms.length === 0) {
      this.subprogramddl = [];
      this.programSubprogramMap = {};
      this.tniForm.patchValue({ fk_subprogramId: [] });
      return;
    }

    const requests = selectedPrograms.map((p: any) =>
      this.programService.getSubprogramById_Dropdown(p.value)
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        let subprograms: { label: string; value: string; programId: string }[] = [];
        this.programSubprogramMap = {};

        results.forEach((res, index) => {
          const programId = selectedPrograms[index].value;

          if (res.isSuccess && res.data) {
            const subs = res.data.map((sub: any) => ({
              label: sub.name,
              value: sub.value,
              programId: programId
            }));

            this.programSubprogramMap[programId] = subs.map((s: { value: any; }) => s.value);

            subprograms.push(...subs);
          }
        });

        // Remove duplicates (optional)
        this.subprogramddl = subprograms.filter(
          (sub, index, self) =>
            index === self.findIndex((s) => s.value === sub.value)
        );

        this.tniForm.patchValue({ fk_subprogramId: [] });
      },
      error: (err) => {
        console.error('Error fetching subprograms:', err);
        this.toastr.error('Error fetching subprograms.');
      }
    });
  }

  onSubmit(): void {

      if (this.tniForm.invalid) 
        {
      this.showError = true;
      return;
    }
    const formValues = this.tniForm.value;
    console.log('Final TNI Form Values:', formValues);

    const formData = new FormData();
    formData.append('ReasonForTraining', formValues.reason);
    formData.append('Priority', formValues.priority);
    formData.append('ProposedTimeline', formValues.proposedTimeline);
    formData.append('TargetAudience', formValues.targetAudience);
    formData.append('Remarks', formValues.remarks);

    if (this.selectedFile) {
      formData.append('FileBytes', this.selectedFile);
    }

    let index = 0;
    for (let programId of formValues.fk_programId) {
      const programValue = programId.value ?? programId;

      const validSubprograms = this.programSubprogramMap[programValue] || [];

      validSubprograms.forEach((spId) => {
        if (formValues.fk_subprogramId.includes(spId)) {
          formData.append(`tniDetails[${index}].fk_programId`, programValue);
          formData.append(`tniDetails[${index}].fk_subprogramId`, spId);
          index++;
        }
      });
    }

    this.trainingService.insert_TNI(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.router.navigate(['/dash/emp-training/emp-trainingdashboard/TNI_List_For_Employee']);

          // this.tniForm.reset();
          // this.selectedFile = null;
          // this.showError = false;
        } else {
          this.toastr.error(res.message || 'Failed to submit TNI');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastr.error('Something went wrong while submitting TNI');
      }
    });
  }

  resetForm(): void {
    this.tniForm.reset();
    this.showError = false;
    this.selectedFile = null;
  }


  
}

