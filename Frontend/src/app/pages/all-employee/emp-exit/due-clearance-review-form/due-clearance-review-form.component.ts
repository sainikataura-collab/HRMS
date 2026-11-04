import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { DueClearanceService } from '../Services/due-clearance.service';

@Component({
  selector: 'app-due-clearance-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule
  ],
  templateUrl: './due-clearance-review-form.component.html',
  styleUrl: './due-clearance-review-form.component.scss'
})
export class DueClearanceReviewFormComponent {
  clearanceForm!: FormGroup;

  encryptedEmpId: string = '';
  empId: string = '';
  isViewMode: boolean = false;

  originalTransactions: any[] = [];

  empInfo = {
    empcode: '',
    empname: '',
    department: ''
  };

  issuedOptions = [
    { name: 'Yes', value: true },
    { name: 'No', value: false }
  ];

  statusOptions = [
    { name: 'Returned', value: 'Returned' },
    { name: 'Damaged', value: 'Damaged' },
    { name: 'Missing', value: 'Missing' },
    { name: 'No Due', value: 'No Due' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private encryptionService: EncryptionService,
    private dueClearanceService: DueClearanceService
  ) { }

  ngOnInit(): void {
    this.encryptedEmpId = this.route.snapshot.paramMap.get('empId') || '';
    this.empId = this.encryptionService.decryptText(this.encryptedEmpId);
    this.isViewMode = this.route.snapshot.queryParamMap.get('viewMode') === 'true';

    this.clearanceForm = this.fb.group({
      assets: this.fb.array([])
    });

    this.getHODClearanceByEmp();
  }

  get assets(): FormArray {
    return this.clearanceForm.get('assets') as FormArray;
  }

  getGroup(index: number): FormGroup {
    return this.assets.at(index) as FormGroup;
  }

  getValue(data: any, ...keys: string[]): any {
    for (const key of keys) {
      if (data && data[key] !== undefined && data[key] !== null) {
        return data[key];
      }
    }

    return null;
  }

  getHODClearanceByEmp(): void {
    this.dueClearanceService.getHODClearanceByEmp(this.empId).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          const data = res.data || res.Data;

          const mst =
            data?.clearanceDepartmentUser ||
            data?.ClearanceDepartmentUser ||
            {};

          const transactions =
            data?.transactions ||
            data?.Transactions ||
            [];

          this.empInfo = {
            empcode: this.getValue(mst, 'empcode', 'empCode') || '',
            empname: this.getValue(mst, 'empname', 'empName') || '',
            department:
              this.getValue(mst, 'employeeDepartment', 'department') || ''
          };

          this.originalTransactions = transactions;
          this.bindAssets(transactions);
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to load due clearance details');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while loading due clearance details');
      }
    });
  }

  bindAssets(transactions: any[]): void {
    console.log('HOD Edit Transactions:', transactions);
    this.assets.clear();

    transactions.forEach((item: any) => {
      const group = this.fb.group({
        pk_userParameterId: [
          this.getValue(item, 'pk_userParameterId', 'pkUserParameterId') || 0
        ],
        fk_depttrnid: [
          this.getValue(item, 'fk_depttrnid', 'fk_depttrnId', 'fkDepttrnid', 'fkDepttrnId', 'pk_depttrnid', 'pk_depttrnId', 'pkDepttrnid', 'pkDepttrnId') || 0
        ],
        assetName: [
          this.getValue(item, 'assetName', 'description') || ''
        ],
        isIssued: [
          this.getValue(item, 'isIssued', 'issued') || false
        ],
        assetStatus: [
          this.getValue(item, 'assetStatus', 'status') || ''
        ],
        recoveryAmount: [
          this.getValue(item, 'recoveryAmount') || 0
        ],
        remarks: [
          this.getValue(item, 'remarks') || ''
        ],
        isActive: [
          this.getValue(item, 'isActive') ?? true
        ]
      });

      if (!group.get('isIssued')?.value) {
        group.get('assetStatus')?.disable();
        group.get('recoveryAmount')?.disable();
      }

      const status = group.get('assetStatus')?.value;
      if (status !== 'Damaged' && status !== 'Missing') {
        group.get('recoveryAmount')?.disable();
      }

      if (this.isViewMode) {
        group.disable();
      }

      this.assets.push(group);
    });
  }

  onStatusChange(index: number): void {
    const group = this.getGroup(index);
    const status = group.get('assetStatus')?.value;

    if (status === 'Damaged' || status === 'Missing') {
      group.get('recoveryAmount')?.enable();
    } else {
      group.patchValue({
        recoveryAmount: 0
      });

      group.get('recoveryAmount')?.disable();
    }
  }

  isIssued(index: number): boolean {
    return this.getGroup(index).get('isIssued')?.value === true;
  }

  onIssuedChange(index: number): void {
    const group = this.getGroup(index);

    if (group.get('isIssued')?.value) {
      group.get('assetStatus')?.enable();
    } else {
      group.patchValue({
        assetStatus: '',
        recoveryAmount: 0
      });

      group.get('assetStatus')?.disable();
      group.get('recoveryAmount')?.disable();
    }
  }

  isRecoverable(index: number): boolean {
    const status = this.getGroup(index).get('assetStatus')?.value;

    return this.isIssued(index) &&
      (status === 'Damaged' || status === 'Missing');
  }

  totalRecovery(): number {
    return this.assets.controls.reduce((sum, ctrl) => {
      const issued = ctrl.get('isIssued')?.value;
      const status = ctrl.get('assetStatus')?.value;
      const amount = Number(ctrl.get('recoveryAmount')?.value || 0);

      return sum + (
        issued === true && (status === 'Damaged' || status === 'Missing')
          ? amount
          : 0
      );
    }, 0);
  }

  validateIssuedAssetsStatus(): boolean {
    for (let i = 0; i < this.assets.length; i++) {
      const group = this.getGroup(i);
      const assetName = group.get('assetName')?.value;
      const issued = group.get('isIssued')?.value;
      const status = group.get('assetStatus')?.value;

      if (issued === true && (!status || status === '')) {
        this.toastr.error(`Please select status for ${assetName}.`);
        return false;
      }
    }

    return true;
  }

  validateRecoveryAmount(): boolean {
    for (let i = 0; i < this.assets.length; i++) {
      const group = this.getGroup(i);
      const assetName = group.get('assetName')?.value;
      const issued = group.get('isIssued')?.value;
      const status = group.get('assetStatus')?.value;
      const recoveryAmount = Number(group.get('recoveryAmount')?.value || 0);

      if (
        issued === true &&
        (status === 'Damaged' || status === 'Missing') &&
        recoveryAmount <= 0
      ) {
        this.toastr.error(`Please enter recovery amount for ${assetName}.`);
        return false;
      }
    }

    return true;
  }

  createPayload(): any {
    return {
      ClearanceDepartmentUser: {
        fk_empid: this.empId,
        fk_companyId: '',
        remarks: '',
        isActive: true
      },
      Transactions: this.assets.getRawValue().map((item: any) => ({
        pk_userParameterId: item.pk_userParameterId || 0,
        fk_depttrnid: item.fk_depttrnid,
        remarks: item.remarks || '',
        isActive: item.isActive ?? true,
        isIssued: item.isIssued === true,
        assetStatus: item.assetStatus || '',
        recoveryAmount: Number(item.recoveryAmount || 0)
      }))
    };
  }

  submitForm(): void {

    if (this.assets.length === 0) {
      this.toastr.error('No assets assigned for your department.');
      return;
    }

    if (this.clearanceForm.invalid) {
      return;
    }

    if (!this.validateIssuedAssetsStatus()) {
      return;
    }

    if (!this.validateRecoveryAmount()) {
      return;
    }
    const payload = this.createPayload();
    console.log('HOD Clearance Payload:', payload);

    this.dueClearanceService.updateHODClearance(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.IsSuccess) {
          this.toastr.success(res?.message || res?.Message || 'Due clearance submitted successfully');
          this.router.navigate([
            '/dash/emp-exit/emp-exitdashboard/due_clearance_review_list'
          ]);
        } else {
          this.toastr.error(res?.message || res?.Message || 'Failed to submit due clearance');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while submitting due clearance');
      }
    });
  }

  resetForm(): void {
    this.bindAssets(this.originalTransactions);
  }
}