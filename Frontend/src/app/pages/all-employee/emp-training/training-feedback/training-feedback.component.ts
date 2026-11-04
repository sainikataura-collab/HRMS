import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ProgramService } from '../../../all-dashboard/training/services/program.service';
import { ToastrService } from 'ngx-toastr';
import { TrainingPlanningService } from '../../../all-dashboard/training/services/training-planning.service';
import { TrainingCalendarService } from '../../../all-dashboard/training/services/training-calendar.service';

@Component({
  selector: 'app-training-feedback',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink,NgSelectComponent],
  templateUrl: './training-feedback.component.html',
  styleUrl: './training-feedback.component.scss'
})
export class TrainingFeedbackComponent {
 
 
  feedbackForm!: FormGroup;
 trainingPrograms: any[] = [];
 //fk_empId!:string


  likedOptions = [
    { id:'', name: 'Select ' },
    { id: 'content', name: 'Program Content' },
    { id: 'facilitator', name: 'Facilitator/Speaker' },
    { id: 'organization', name: 'Organization' },
    { id: 'materials', name: 'Materials Provided' },
  ];
  recommendList= [
     { id:'', name: 'Select Data' },

     { id: 'yes', name: 'Yes, definitely' },
    { id: 'maybe', name: 'Maybe' },
    { id: 'no', name: 'No' }
  ]
 
  submitted = false;
  constructor(private fb: FormBuilder,private programService: ProgramService,
    private toastr:ToastrService, private planningservice:TrainingPlanningService,
  private feebackservice:TrainingCalendarService) {}

ngOnInit(): void{
  this.feedbackForm = this.fb.group({
      //name: ['', Validators.required],
      fk_planningId: [null],
      rating: [null,],
      // liked: this.fb.array([]),
      improvements: [''],
      comments: [''],
      recommend: ['']
    });
    this.loadCompleteTrainingPrograms();
}

 loadCompleteTrainingPrograms(): void {
    this.planningservice.get_CompletedProgramsbyid().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          this.trainingPrograms = res.data.map((item: any) => ({
            name: item.name,   
            value: item.value  
          }));
        } else {
          this.trainingPrograms = [];
          this.toastr.warning(res.message || 'No completed training programs found.');
        }
      },
      
      error: (err) => {
        console.error('Error loading training programs:', err);
        this.toastr.error('Failed to load training programs.');
      }
    });
  }











  // Handle checkbox changes
  onCheckboxChange(e: any) {
    const liked: FormArray = this.feedbackForm.get('liked') as FormArray;

    if (e.target.checked) {
      liked.push(this.fb.control(e.target.value));
    } else {
      const index = liked.controls.findIndex(x => x.value === e.target.value);
      liked.removeAt(index);
    }
  }

   // ⭐ Set rating value (fills all stars up to selected)
  setRating(value: number) {
    this.feedbackForm.get('rating')?.setValue(value);
  }


  // ✅ Save Method (Final)
  submitFeedback() {
    debugger
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    const payload = {
      fk_planningId: this.feedbackForm.value.fk_planningId,
      rating: this.feedbackForm.value.rating,
      recommend: this.feedbackForm.value.recommend,
      comments: this.feedbackForm.value.improvements,
      Date: new Date()
    };

    console.log('Submitting feedback:', payload);

    this.feebackservice.givefeedback(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Feedback submitted successfully!');
          this.feedbackForm.reset();
          // (this.feedbackForm.get('liked') as FormArray).clear();
          this.submitted = true;
        } else {
          this.toastr.warning(res.message || 'Failed to submit feedback.');
        }
      },
      error: (err) => {
        console.error('Feedback save error:', err);
        this.toastr.error('Something went wrong while saving feedback.');
      }
    });
  }
}