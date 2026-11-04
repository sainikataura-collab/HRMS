import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FNFserviceService } from '../Service/fnfservice.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-fnf-settlement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './fnf-settlement-form.component.html',
  styleUrl: './fnf-settlement-form.component.scss'
})
export class FnfSettlementFormComponent implements OnInit {

  fnfForm!: FormGroup;
  submitted = false;
  employeeDetails: any = null;
  empId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private fnfSettlementService: FNFserviceService,
    private  encryptionService :EncryptionService
  ) { }

  ngOnInit(): void {
    this.initForm();

     const id = this.route.snapshot.paramMap.get('id');

if (id) {
  this.empId = this.encryptionService.decryptText(id);
  this.getFnfSettlementDetail(this.empId);
}
  }

  initForm(): void {
    this.fnfForm = this.fb.group({
      fk_empid: [''],
      fk_seprequestId: [0],

      totNoOfDaysWorked: [0],
      daysNoticeReq: [0],
      daysNoticeGiven: [0, Validators.required],
      daysShortfallNotice: [0],
      shortfallAdjusted: [0],
      noticerecoverydays: [0],
      noOfDaysWorkdInMonth: [0, Validators.required],
      noOfDaysConsidered: [0],
      balAnnualLeaveTot: [0],

      totEarnings: [0],
      totDeductions: [0],
      totOtherEarnings: [0],
      totOtherDeductions: [0],
      totGEarnings: [0],
      totGDeductions: [0],
      NetPay: [0],

      TenureYear: [0],
      TenureMonth: [0],
      TenureDay: [0],

      earnings: this.fb.array([]),
      deductions: this.fb.array([]),
      otherEarnings: this.fb.array([]),
      otherDeductions: this.fb.array([])
    });
  }

  get earnings(): FormArray {
    return this.fnfForm.get('earnings') as FormArray;
  }

  get deductions(): FormArray {
    return this.fnfForm.get('deductions') as FormArray;
  }

  get otherEarnings(): FormArray {
    return this.fnfForm.get('otherEarnings') as FormArray;
  }

  get otherDeductions(): FormArray {
    return this.fnfForm.get('otherDeductions') as FormArray;
  }

  getSalaryRows(): number[] {
    const len = Math.max(this.earnings.length, this.deductions.length);
    return Array.from({ length: len }, (_, i) => i);
  }

  getOtherRows(): number[] {
    const len = Math.max(this.otherEarnings.length, this.otherDeductions.length);
    return Array.from({ length: len }, (_, i) => i);
  }



  getFnfSettlementDetail(pk_empid: string): void {
    this.fnfSettlementService.getFnfSettlementDetail(pk_empid).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.employeeDetails = res.data;

          this.fnfForm.patchValue({
            fk_empid: res.data.pk_empid,
            fk_seprequestId: res.data.pk_seprequestId || 0,
            totNoOfDaysWorked: res.data.totNoOfDaysWorked || res.data.daysworkedwithus || 0,
            daysNoticeReq: res.data.noticePeriod || 0,
            daysNoticeGiven: res.data.noofdaysnoticegiven || 0,
            daysShortfallNotice: res.data.daysshortfallinnoticeperiod || 0,
            noticerecoverydays: res.data.noticerecoverydays || 0,
            noOfDaysWorkdInMonth: res.data.paiddays || 0,
            noOfDaysConsidered: res.data.daystobeConsidered || 0,
            balAnnualLeaveTot: res.data.el || 0,
            TenureYear: res.data.tenureYear || 0,
            TenureMonth: res.data.tenureMonth || 0,
            TenureDay: res.data.tenureDay || 0
          });

          this.calculateNoticeFields();

          if (res.data?.heads?.length) {
            this.bindHeads(res.data.heads);
          }
        } else {
          this.toastr.error(res?.message || 'Employee details not found.');
        }
      },
      error: () => {
        this.toastr.error('Error while fetching F&F details.');
      }
    });
  }

  private bindHeads(heads: any[]): void {
    this.earnings.clear();
    this.deductions.clear();
    this.otherEarnings.clear();
    this.otherDeductions.clear();

    heads.forEach((item, index) => {
      const type = item.headType?.trim();
      const ctrl = this.fb.group({
        headName: [item.headName],
        sno: [item.sno || index + 1],
        headType: [type],
        Rate_amount: [item.rate_amount ?? item.Rate_amount ?? 0],
        amount: [item.amount ?? 0],
        isActive: [item.isActive ?? true]
      });

      if (type === 'Earnings') {
        this.earnings.push(ctrl);
      } else if (type === 'Deductions') {
        this.deductions.push(ctrl);
      } else if (type === 'OtherEarnings') {
        this.otherEarnings.push(ctrl);
      } else if (type === 'OtherDeductions') {
        this.otherDeductions.push(ctrl);
      }
    });

    this.calculateTotals();
  }

  calculateNoticeFields(): void {
    const noticeReq = Number(this.fnfForm.get('daysNoticeReq')?.value || 0);
    const noticeGiven = Number(this.fnfForm.get('daysNoticeGiven')?.value || 0);
    const workedInMonth = Number(this.fnfForm.get('noOfDaysWorkdInMonth')?.value || 0);

    this.fnfForm.patchValue({
      daysShortfallNotice: noticeReq - noticeGiven,
      noOfDaysConsidered: workedInMonth
    }, { emitEvent: false });
  }

  calculateTotals(): void {
    const sumAmount = (arr: FormArray) =>
      arr.controls.reduce((total, ctrl) => total + Number(ctrl.get('amount')?.value || 0), 0);

    const totalEarnings = sumAmount(this.earnings);
    const totalDeductions = sumAmount(this.deductions);
    const totalOtherEarnings = sumAmount(this.otherEarnings);
    const totalOtherDeductions = sumAmount(this.otherDeductions);

    const grossEarnings = totalEarnings + totalOtherEarnings;
    const grossDeductions = totalDeductions + totalOtherDeductions;
    const netPay = grossEarnings - grossDeductions;

    this.fnfForm.patchValue({
      totEarnings: totalEarnings,
      totDeductions: totalDeductions,
      totOtherEarnings: totalOtherEarnings,
      totOtherDeductions: totalOtherDeductions,
      totGEarnings: grossEarnings,
      totGDeductions: grossDeductions,
      NetPay: netPay
    }, { emitEvent: false });
  }

  getAllHeads(): any[] {
    return [
      ...this.earnings.getRawValue(),
      ...this.deductions.getRawValue(),
      ...this.otherEarnings.getRawValue(),
      ...this.otherDeductions.getRawValue()
    ];
  }

  submitForm(): void {
    this.submitted = true;
    this.calculateNoticeFields();
    this.calculateTotals();

    if (this.fnfForm.invalid) {
      this.toastr.error('Please fill required fields.');
      return;
    }

    const payload = {
      ...this.fnfForm.getRawValue(),
      heads: this.getAllHeads()
    };

    delete payload.earnings;
    delete payload.deductions;
    delete payload.otherEarnings;
    delete payload.otherDeductions;

    payload.heads = payload.heads.map((x: any, index: number) => ({
      ...x,
      sno: Number(x.sno || index + 1),
      amount: Number(x.amount || 0),
      Rate_amount: Number(x.Rate_amount ?? x.rate_amount ?? 0),
      isActive: x.isActive ?? true
    }));

    this.fnfSettlementService.insertFnfSettlement(payload).subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          this.toastr.success(res.message || 'F&F Settlement submitted successfully.');
          this.router.navigate(['/dash/exit/exitdashboard/fnf_settlement_list']);
        } else {
          this.toastr.error(res?.message || 'Failed to submit F&F Settlement.');
        }
      },
      error: () => {
        this.toastr.error('Error while submitting F&F Settlement.');
      }
    });
  }

  resetForm(): void {
    this.fnfForm.reset();
    this.earnings.clear();
    this.deductions.clear();
    this.otherEarnings.clear();
    this.otherDeductions.clear();

    if (this.empId) {
      this.getFnfSettlementDetail(this.empId);
    }
  }

  clearZero(controlName: string): void {
    const control = this.fnfForm.get(controlName);

    if (control?.value === 0 || control?.value === '0') {
      control.setValue('');
    }
  }
}