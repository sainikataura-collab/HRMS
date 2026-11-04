import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlexiSalaryService } from '../Service/flexi-head-bills.service';
 

@Component({
  selector: 'app-flexi-head-bills',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgSelectModule,
  ],
  templateUrl: './flexi-head-bills.component.html',
  styleUrl: './flexi-head-bills.component.scss',
})
export class FlexiHeadBillsComponent {
  flexiForm!: FormGroup;
  flexiHeadList: any[] = [];
  selectedFile: File | null = null;
  ImageUrl: string = '';
  FileName: string = '';
  oldfile: string = '';
  isEditMode = false;
  submitted = false;
  pk_billid: number = 0;
  duplicateDateWarning: boolean = false;
  flexiBillList: any[] = []; // This holds the list of all existing flexi bills

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private flexiService = inject(FlexiSalaryService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initializeForm();
    this.getFlexiHeadDropdown();
    this.getAllFlexiBills(); // ⬅️ Fetch the bills here
    // 👇 Listen to billAmt change
    this.flexiForm.get('amount')?.valueChanges.subscribe(() => {
      this.validateBillAmountLimit();
    });

    this.route.paramMap.subscribe((params) => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        // this.pk_billid = +this.decryptId(encryptedId);
        this.isEditMode = true;
        // this.getBillById(this.pk_billid); // Call when API ready
      }
    });
  }

  initializeForm(): void {
    this.flexiForm = this.fb.group({
      fk_headid: ['', Validators.required],
      billDate: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]], // ✅ Prevent < 0
      balanceAmount: [''], // <-- This is important
      remarks: [''],
      filepath: [''],
    });
  }

  preventNegativeInput(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'Minus' || event.key === 'e') {
      event.preventDefault();
    }
  }

  getAllFlexiBills(): void {
  this.flexiService.getFlexiBills().subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.flexiBillList = res.data;
      }
    },
    error: () => {
      this.toastr.error('Failed to load bill data');
    }
  });
}
checkDuplicateBillDate(): void {
  const selectedDate = this.flexiForm.get('billDate')?.value;
  if (!selectedDate || !this.flexiBillList?.length) {
    this.duplicateDateWarning = false;
    return;
  }

  // Format selected date to yyyy-MM-dd
  const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];

  const isDuplicate = this.flexiBillList.some(bill => {
    if (!bill.billDate) return false;

    const formattedBillDate = new Date(bill.billDate).toISOString().split('T')[0];
    return formattedBillDate === formattedSelectedDate;
  });

  this.duplicateDateWarning = isDuplicate;
}



  getFlexiHeadDropdown(): void {
    this.flexiService.getFlexiHeadDropdown().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.flexiHeadList = res.data;
        } else {
          this.toastr.error(res.message || 'Failed to load head list');
        }
      },
      error: () => {
        this.toastr.error('Error loading dropdown');
      },
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.ImageUrl = '';
    }
  }

  validateBillAmount(): void {
    const { fk_headid, billDate } = this.flexiForm.value;

    if (fk_headid && billDate) {
      this.flexiForm.patchValue({ amount: 0 }); // Step 1: Bill amount zero

      this.flexiService.validateBill(fk_headid, billDate, 0).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            // ✅ Correct key: res.data.balBillAmt
            this.flexiForm.patchValue({
              balanceAmount: res.data.balBillAmt,
            });
          } else {
            this.flexiForm.patchValue({ balanceAmount: '' });
            this.toastr.warning(res.message || 'Validation failed');
          }
        },
        error: () => {
          this.toastr.error('Failed to validate bill');
        },
      });
    }
  }

  validateBillAmountLimit(): void {
    const amount = +this.flexiForm.get('amount')?.value || 0;
    const balanceAmt = +this.flexiForm.get('balanceAmount')?.value || 0;

    if (amount > balanceAmt) {
      this.flexiForm.get('amount')?.setErrors({ exceedsBalance: true });
    } else {
      this.flexiForm.get('amount')?.setErrors(null);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.flexiForm.invalid) return;

    const formValues = this.flexiForm.value;
    const formData = new FormData();

    formData.append(
      'pk_flexibillId',
      this.isEditMode ? this.pk_billid.toString() : ''
    );
    formData.append('billDate', formValues.billDate);
    formData.append('fk_headid', formValues.fk_headid);
    formData.append('amount', formValues.amount);
    formData.append('remarks', formValues.remarks || '');

    if (this.selectedFile) {
      formData.append('filepath', this.selectedFile);
    } else if (this.oldfile) {
      formData.append('attachment', this.oldfile);
    }

    const apiCall = this.isEditMode
      ? this.flexiService.insertFlexiBill(formData) // Update API if different
      : this.flexiService.insertFlexiBill(formData);

    apiCall.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(res.message || 'Saved successfully');
          this.router.navigate(['/dash/reimbursement/reimbursementdashboard/FlexiHeadBillsList']);
        } else {
         
           this.toastr.warning(res.message || 'Bill already submitted for the selected month.');
        }
      },
      error: () => {
        this.toastr.error('Server error');
      },
    });
  }

  resetForm(): void {
    this.flexiForm.reset();
    this.submitted = false;
    this.selectedFile = null;
    this.ImageUrl = '';
  }
}
