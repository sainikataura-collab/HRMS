import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrainingCalendarService } from '../../services/training-calendar.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-training-calendar-admin',
  standalone: true,
 imports: [CommonModule, ReactiveFormsModule,NgSelectComponent],
  templateUrl: './training-calendar-admin.component.html',
  styleUrl: './training-calendar-admin.component.scss'
})
export class TrainingCalendarAdminComponent {
  trainingCalendarForm!: FormGroup;
  programs: any[] = [];       // program dropdown list
  subprograms: any[] = [];    // subprogram dropdown list
  planningList: any[] = [];   // planning id dropdown
  submitted = false;
  showError = false;
  isEdit = false;

   planningId: number | null = null;

    modeList  = [
    { name: '-- Select Mode --', value: '' },

    { name: 'Offline', value: 'offline' },
    { name: 'Online', value: 'online' }
  ];

 statusddl  = [
  { name: '-- Select Mode--', value: '' },
  { name: 'Scheduled', value: 'S' },
  { name: 'Cancelled', value: 'CN' },
  { name: 'Rescheduled', value: 'RS' }
];


  constructor(private fb: FormBuilder, private http: HttpClient,private router:Router,
    private CalendarService:TrainingCalendarService, private toastr:ToastrService,private route:ActivatedRoute) {}

  ngOnInit() {

this.route.queryParams.subscribe(params => {
    const fk_TNIId = params['fk_TNIId'];
    const pk_planningId = params['pk_planningId'];
    this.loaddata(Number(pk_planningId));
  });
    
    this.trainingCalendarForm = this.fb.group({
      pk_calendarId: [0],
      fk_programId: [null, Validators.required],
      fk_TNIId: [null],
      fk_subprogramId: [null, Validators.required],
      fk_planningId: [null, Validators.required],
      trainer: ['', Validators.required],
      mode: ['', Validators.required],
      trainingDateTime: ['', Validators.required],
      location: ['', Validators.required],
      status: ['', Validators.required],
      programName: [''],
      subProgramName: ['']
    
    });

  }
  
loaddata(pk_planningId: number) {
  debugger;
  this.CalendarService.getCalenderById(pk_planningId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.trainingCalendarForm.patchValue({
          fk_programId: res.data.fk_programId,
          fk_subprogramId: res.data.fk_subprogramId,
          fk_TNIId: res.data.fk_TNIId,
          fk_planningId: res.data.pk_planningId,
          trainer: res.data.trainer,
          mode: res.data.mode,
          trainingDateTime: res.data.trainingDateTime,
          location: res.data.location,
          programName: res.data.programName,
        subProgramName: res.data.subProgramName
        });

        // Optional: disable fields if training is already approved
        if (res.data.approval) {
          this.trainingCalendarForm.disable(); // disables all fields
        }
      }
    },
    error: (err) => {
      console.error('Error loading calendar data', err);
    }
  });
}





 onSubmit() {
  if (this.trainingCalendarForm.invalid) {
    this.showError = true;
    return;
  }

  
  const formValue = this.trainingCalendarForm.value;
// Build payload for Training Calendar
  const payload = {
    fk_programId: formValue.fk_programId ,
    fk_subprogramId: formValue.fk_subprogramId ,
    fk_planningId: formValue.fk_planningId,   // ✅ Required Planning Id
    fk_TNIId: formValue.fk_TNIId,    // ✅ Send TNI id here
  
    trainer: formValue.trainer,
    mode: formValue.mode,
    trainingDateTime: formValue.trainingDateTime,  // ✅ datetime from form
    location: formValue.location,
    status: formValue.status        // e.g., P = Planned, C = Completed
  };

  // Insert or Update
  if (this.isEdit) {
    this.CalendarService.Update_TrainingCalendar(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success('Training Calendar updated successfully');
          this.router.navigate(['/dash/training/trainingdashboard/TrainingPlanning_List']);
        } else {
          this.toastr.error(res.message || 'Failed to update training calendar');
        }
      },
      error: (err) => {
        this.toastr.error('Error while updating training calendar');
        console.error(err);
      }
    });
  } else {
    this.CalendarService.add_TrainingCalendar(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.router.navigate(['/dash/training/trainingdashboard/Admin_Training_Calendar_List']);
        } else {
          this.toastr.error(res.message || 'Failed to save training calendar');
        }
      },
      error: (err) => {
        this.toastr.error('Error while saving training calendar');
        console.error(err);
      }
    });
  }
 }


}
