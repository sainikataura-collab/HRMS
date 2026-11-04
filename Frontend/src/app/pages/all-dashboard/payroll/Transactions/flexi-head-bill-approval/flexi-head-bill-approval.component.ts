import { Component } from '@angular/core';
import { FlexiBillApprovalService } from '../TransactionService/flexi-bill-approval.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-flexi-head-bill-approval',
  standalone: true,
    imports: [CommonModule,RouterLink,ReactiveFormsModule],

  templateUrl: './flexi-head-bill-approval.component.html',
  styleUrl: './flexi-head-bill-approval.component.scss'
})


export class FlexiHeadBillApprovalComponent {
EmployeeForm!: FormGroup;
 pk_flexibillId: number = 0;
 isEditMode!:Boolean
 submitted!:Boolean


  Department: { name: string; value: string }[] = [];
  Location: { name: string; value: string }[] = [];
  Designation: { name: string; value: string }[] = [];
  Grade: { name: string; value: string }[] = [];
  Cost: { name: string; value: string }[] = [];
  Employee: { name: string; value: string }[] = [];
  Qualification: { name: string; value: string }[] = [];
  Specialization: { name: string; value: string }[] = [];
  flexiHeadList: { name: string; value: string }[] = [];

   constructor(
    private FlexiBillService: FlexiBillApprovalService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    private route:ActivatedRoute,
    public encryptionService: EncryptionService,
    private fb: FormBuilder
  ) { }

 ngOnInit(): void {

    this.pk_flexibillId=Number(this.encryptionService.decryptText(this.route.snapshot.params['fk_flexibillId']))
       if ( this.pk_flexibillId) {
        this.loadFlexiBillDetails(this.pk_flexibillId)
        this.isEditMode = true;
      }
  
    this.EmployeeForm = this.fb.group({
      fk_flexibillId: [0],
      approvalStatus: ['', Validators.required],
      remarks: [null, Validators.required],
      




    // use only for disble
    billDate: [{ value: '', disabled: true }],
    description: [{ value: '', disabled: true }],
    balanceAmount: [{ value: null, disabled: true }],
    amount: [{ value: null, disabled: true }],
    Remarks: [{ value: null, disabled: true }]
    });



  }

  onSubmit(): void {
  this.submitted = true;

  if (this.EmployeeForm.invalid) {
    this.toastrService.error('Please fill all required fields', 'Validation Error');
    return;
  }

  const formValue = this.EmployeeForm.value;

  const payload = {
    flexiBillApprovalIns: {
      fk_flexibillId: this.pk_flexibillId || 0,
      approvalStatus: +formValue.approvalStatus, // ensure it's a number
      remarks: formValue.remarks,
    }
  };

  this.FlexiBillService.insertApproval(payload).subscribe({
    next: (response) => {
      if (response.isSuccess) {
        this.toastrService.success(response.message);
       this.router.navigate(['/dash/payroll/payrolldashboard/Flexi-bill-Approval-list']);

      } else {
        this.toastrService.error(response.message);
      }
    },
    error: (err) => {
      this.toastrService.error('Server error during submission');
    }
  });
}



loadFlexiBillDetails(id: number): void {
  this.FlexiBillService.get_Flexi_bill_HeadById(id).subscribe({
    next: (res) => {
      if (res?.data) {
        const formattedDate = res.data.billDate 
       ? new Date(res.data.billDate).toISOString().substring(0, 10)
       : '';
        this.EmployeeForm.patchValue({
          fk_flexibillId: res.data.pk_flexibillId,
          billDate: formattedDate,
          description: res.data.description,
          amount: res.data.amount,
          Remarks: res.data.remarks,
          balanceAmount: res.data.balanceamount
        });
      }
    },
    error: (err) => {
      this.toastrService.error('Failed to load flexi bill details');
    }
  });
}




 
}
