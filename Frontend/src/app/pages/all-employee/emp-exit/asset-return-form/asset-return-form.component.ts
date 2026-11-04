import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-asset-return-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './asset-return-form.component.html',
  styleUrl: './asset-return-form.component.scss'
})
export class AssetReturnFormComponent implements OnInit {
  assetForm!: FormGroup;
  submitted = false;

  empInfo = { empCode: 'EMP001', empName: 'John Doe', lwd: '2024-06-30' };

  issuedOptions = [
    { name: 'Yes', value: 'Yes' },
    { name: 'No',  value: 'No' }
  ];

  statusOptions = [
    { name: 'Returned', value: 'Returned' },
    { name: 'Damaged',  value: 'Damaged' },
    { name: 'Missing',  value: 'Missing' }
  ];

  assetNames = ['Laptop', 'Mobile', 'SIM Card', 'ID Card', 'Access Card', 'Vehicle', 'Documents', 'Uniform'];

  constructor(private fb: FormBuilder, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.assetForm = this.fb.group({
      assets: this.fb.array(
        this.assetNames.map(name =>
          this.fb.group({
            name:           [name],
            issued:         ['No'],
            status:         [''],
            recoveryAmount: [0],
            remarks:        ['']
          })
        )
      )
    });
  }

  get assets(): FormArray {
    return this.assetForm.get('assets') as FormArray;
  }

  getGroup(i: number): FormGroup {
    return this.assets.at(i) as FormGroup;
  }

  isIssued(i: number): boolean {
    return this.getGroup(i).get('issued')?.value === 'Yes';
  }

  isRecoverable(i: number): boolean {
    const status = this.getGroup(i).get('status')?.value;
    return this.isIssued(i) && (status === 'Damaged' || status === 'Missing');
  }

  totalRecovery(): number {
    return this.assets.controls.reduce((sum, ctrl) => {
      const amt = ctrl.get('recoveryAmount')?.value || 0;
      const status = ctrl.get('status')?.value;
      const issued = ctrl.get('issued')?.value;
      return sum + (issued === 'Yes' && (status === 'Damaged' || status === 'Missing') ? +amt : 0);
    }, 0);
  }

  submitForm(): void {
    this.submitted = true;
    if (this.assetForm.invalid) return;
    console.log('Asset Return:', this.assetForm.value);
    this.toastr.success('Asset return form submitted successfully');
    this.router.navigate(['/dash/emp-exit/emp-exitdashboard/no_due_declaration']);
  }
}
