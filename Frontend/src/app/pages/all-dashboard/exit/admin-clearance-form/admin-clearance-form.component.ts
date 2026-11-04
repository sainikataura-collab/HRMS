import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-clearance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './admin-clearance-form.component.html',
  styleUrl: './admin-clearance-form.component.scss'
})
export class AdminClearanceFormComponent implements OnInit {
  clearanceForm!: FormGroup;
  submitted = false;
  empInfo = { empCode: 'EMP001', empName: 'John Doe', lwd: '2024-06-30' };

  statusOptions = [
    { name: 'Cleared',             value: 'Cleared' },
    { name: 'Pending',             value: 'Pending' },
    { name: 'Recovery Required',   value: 'Recovery Required' }
  ];

  deptNames = ['IT', 'Finance', 'Admin', 'HR', 'Security', 'Payroll', 'Store'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.clearanceForm = this.fb.group({
      departments: this.fb.array(
        this.deptNames.map(dept =>
          this.fb.group({
            name:           [dept],
            status:         ['Pending'],
            recoveryAmount: [0],
            clearedBy:      [''],
            clearedDate:    [''],
            remarks:        ['']
          })
        )
      )
    });
  }

  get departments(): FormArray {
    return this.clearanceForm.get('departments') as FormArray;
  }

  getGroup(i: number): FormGroup {
    return this.departments.at(i) as FormGroup;
  }

  totalRecovery(): number {
    return this.departments.controls.reduce((sum, ctrl) => {
      const amt = ctrl.get('recoveryAmount')?.value || 0;
      const status = ctrl.get('status')?.value;
      return sum + (status === 'Recovery Required' ? +amt : 0);
    }, 0);
  }

  submitForm(): void {
    this.submitted = true;
    if (this.clearanceForm.invalid) return;
    console.log('Clearance:', this.clearanceForm.value);
    this.toastr.success('Clearance status saved');
    this.router.navigate(['/dash/exit/exitdashboard/fnf_settlement_list']);
  }
}
