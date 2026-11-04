import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notice-period-tracking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './notice-period-tracking.component.html',
  styleUrl: './notice-period-tracking.component.scss'
})
export class NoticePeriodTrackingComponent implements OnInit {
  noticeForm!: FormGroup;
  submitted = false;
  empInfo = { empCode: 'EMP001', empName: 'John Doe', designation: 'Software Engineer' };

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.noticeForm = this.fb.group({
      noticeStartDate:   ['', Validators.required],
      lastWorkingDate:   ['', Validators.required],
      requiredNoticeDays:[90],
      servedDays:        [{ value: 0, disabled: true }],
      buyoutDays:        [0],
      shortfallDays:     [{ value: 0, disabled: true }],
      perDaySalary:      [0],
      recoveryAmount:    [{ value: 0, disabled: true }]
    });
  }

  calculate(): void {
    const start = new Date(this.noticeForm.get('noticeStartDate')?.value);
    const end = new Date(this.noticeForm.get('lastWorkingDate')?.value);
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const served = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const required = this.noticeForm.get('requiredNoticeDays')?.value || 0;
    const buyout = this.noticeForm.get('buyoutDays')?.value || 0;
    const shortfall = Math.max(0, required - served - buyout);
    const perDay = this.noticeForm.get('perDaySalary')?.value || 0;
    const recovery = shortfall * perDay;

    this.noticeForm.patchValue({ servedDays: served, shortfallDays: shortfall, recoveryAmount: recovery });
  }

  submitForm(): void {
    this.submitted = true;
    if (this.noticeForm.invalid) return;
    this.toastr.success('Notice period tracking saved');
    this.router.navigate(['/dash/exit/exitdashboard/knowledge_transfer_form/1']);
  }
}
