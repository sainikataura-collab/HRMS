import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-admin-resignation-action',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './admin-resignation-action.component.html',
  styleUrl: './admin-resignation-action.component.scss'
})
export class AdminResignationActionComponent implements OnInit {
  actionForm!: FormGroup;
  submitted = false;
  resignationId: number | null = null;
  employeeDetails: any = null;

  actionOptions = [
    { name: 'Approve',  value: 'Approved' },
    { name: 'Reject',   value: 'Rejected' },
    { name: 'On Hold',  value: 'OnHold' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.resignationId = +id;
        this.loadResignationData(this.resignationId);
      }
    });
  }

  initForm(): void {
    this.actionForm = this.fb.group({
      status: ['', Validators.required],
      actualLWD: ['', Validators.required],
      waiveNoticePeriod: [false],
      approverRemarks: ['']
    });
  }

  loadResignationData(id: number): void {
    // Mock employee data load
    this.employeeDetails = {
      empCode: 'EMP002',
      empName: 'Jane Smith',
      department: 'HR',
      resignationDate: '2024-05-18',
      expectedLWD: '2024-06-18',
      reason: 'Better Opportunity'
    };
    
    // Set default actual LWD to expected LWD
    this.actionForm.patchValue({
      actualLWD: '2024-06-18'
    });
  }

  submitForm(): void {
    this.submitted = true;

    if (this.actionForm.invalid) {
      return;
    }

    const payload = this.actionForm.value;
    console.log('Action Payload:', payload);

    this.toastr.success(`Resignation ${payload.status} successfully`);
    this.router.navigate(['/dash/exit/exitdashboard/admin_resignation_list']);
  }
}
