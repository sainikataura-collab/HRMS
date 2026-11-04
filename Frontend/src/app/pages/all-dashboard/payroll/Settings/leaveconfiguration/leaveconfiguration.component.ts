import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PayrollService } from '../../services/lock&unloackFlexiHead.service';
import { LeaveConfigService } from '../../services/leave-config.service'; // 👈 Add your service
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-leaveconfiguration',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leaveconfiguration.component.html',
  styleUrl: './leaveconfiguration.component.scss'
})
export class LeaveconfigurationComponent {
  LeaveconfigurationForm!: FormGroup;
  showError = false;
  Month: { name: string; value: string }[] = [];
  Year: { name: string; value: string }[] = [];
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private httpservice: PayrollService,
    private leaveConfigService: LeaveConfigService // 👈 Injected service
  ) {}

  jdate_propationate = [
    { name: '0', value: '0' },
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' }
  ];

  ngOnInit() {
    this.LeaveconfigurationForm = this.fb.group({
      fk_monthId: [''],
      fk_yearId: [''],
      nholiday_priority: [''],
      woff_priority: [''],
      club_priority: [''],
      cover_priority: [''],
      jdate_propationate: [''],
      isLockedForApply: [false],
      isLockedForApproval: [false]
    });

    this.loadLeaveConfig(); // 👈 Load config on init
    this.getMonthlist('Month');
    this.getYearList('Year');
  }

  getMonthlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.leaveConfigService.getMonthlist(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.Month = res.data.map((month: any) => ({
            name: month.name,
            value: month.value
          }));
        } else {
          this.toastrService.error('Failed to load month list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching month list:', err);
        this.toastrService.error('Error fetching month list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  getYearList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.leaveConfigService.getYear(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Year = res.data.map((year: any) => ({
            name: year.name,
            value: year.value
          }));
        } else {
          this.toastrService.error('Failed to load year list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching year list:', err);
        this.toastrService.error('Error fetching year list.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  loadLeaveConfig() {
    this.leaveConfigService.getLeaveConfigList().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data;
          this.LeaveconfigurationForm.patchValue({
            fk_monthId: String(data.fk_monthId),
            fk_yearId: String(data.fk_yearId),
            nholiday_priority: data.nholiday_priority,
            woff_priority: data.woff_priority,
            club_priority: data.club_priority,
            cover_priority: data.cover_priority,
            jdate_propationate: data.jdate_propationate,
            isLockedForApply: data.isLockedForApply,
            isLockedForApproval: data.isLockedForApproval
          });
          console.log("Leave configuration form patched:", this.LeaveconfigurationForm.value);
        } else {
          this.toastrService.error('Failed to fetch leave config data.');
        }
      },
      error: (err) => {
        console.error('Error loading leave config:', err);
        this.toastrService.error('Something went wrong while loading data.');
      }
    });
  }

  resetForm() {
    this.LeaveconfigurationForm.reset();
  }

  update() {
    if (this.LeaveconfigurationForm.invalid) {
      this.toastrService.error('Please fill all required fields.');
      return;
    }

    const payload = this.LeaveconfigurationForm.value;

    this.leaveConfigService.updateLeaveConfig(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastrService.success('Leave configuration updated successfully.');
        } else {
          this.toastrService.error(res.message || 'Failed to update leave configuration.');
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.toastrService.error('An error occurred while updating leave configuration.');
      }
    });
  }
}
