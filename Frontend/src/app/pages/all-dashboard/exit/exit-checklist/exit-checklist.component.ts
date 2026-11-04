import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-exit-checklist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './exit-checklist.component.html',
  styleUrl: './exit-checklist.component.scss'
})
export class ExitChecklistComponent implements OnInit {
  checklistForm!: FormGroup;
  submitted = false;

  empInfo = { empCode: 'EMP001', empName: 'John Doe', lwd: '2024-06-30' };

  statusOptions = [
    { name: 'Pending',   value: 'Pending' },
    { name: 'Completed', value: 'Completed' },
    { name: 'N/A',       value: 'N/A' }
  ];

  activities = [
    'System Access Disabled',
    'Email Account Blocked',
    'ID Card Deactivated',
    'Assets Collected',
    'Payroll Processing Stopped',
    'Attendance Records Closed',
    'Relieving Letter Issued',
    'Experience Letter Issued',
    'FNF Settlement Processed'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.checklistForm = this.fb.group({
      items: this.fb.array(
        this.activities.map(activity =>
          this.fb.group({
            activity:      [activity],
            status:        ['Pending', Validators.required],
            completedBy:   [''],
            completedDate: [''],
            remarks:       ['']
          })
        )
      )
    });
  }

  get items(): FormArray {
    return this.checklistForm.get('items') as FormArray;
  }

  getGroup(index: number): FormGroup {
    return this.items.at(index) as FormGroup;
  }

  allDone(): boolean {
    return this.items.controls.every(ctrl =>
      ctrl.get('status')?.value === 'Completed' || ctrl.get('status')?.value === 'N/A'
    );
  }

  submitForm(): void {
    this.submitted = true;
    if (this.checklistForm.invalid) return;
    console.log('Exit Checklist:', this.checklistForm.value);
    this.toastr.success('Exit checklist saved successfully');
    if (this.allDone()) {
      this.toastr.info('All activities done! Employee exit process is complete.');
    }
  }
}
