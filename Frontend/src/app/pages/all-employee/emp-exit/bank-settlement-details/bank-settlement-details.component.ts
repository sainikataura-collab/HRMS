import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bank-settlement-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './bank-settlement-details.component.html',
  styleUrl: './bank-settlement-details.component.scss'
})
export class BankSettlementDetailsComponent implements OnInit {
  bankForm!: FormGroup;
  submitted = false;
  empInfo = { empCode: 'EMP001', empName: 'John Doe', lwd: '2024-06-30' };

  constructor(private fb: FormBuilder, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.bankForm = this.fb.group({
      bankName:         ['', Validators.required],
      accountNumber:    ['', Validators.required],
      ifscCode:         ['', Validators.required],
      panNumber:        ['', Validators.required],
      uanNumber:        [''],
      pfNumber:         [''],
      gratuityEligible: ['', Validators.required]
    });
  }

  submitForm(): void {
    this.submitted = true;
    if (this.bankForm.invalid) return;
    console.log('Bank Details:', this.bankForm.value);
    this.toastr.success('Bank details saved successfully');
    this.router.navigate(['/dash/emp-exit/emp-exitdashboard/resignation_list']);
  }
}
