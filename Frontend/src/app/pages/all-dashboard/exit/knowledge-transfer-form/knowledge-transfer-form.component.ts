import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-knowledge-transfer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './knowledge-transfer-form.component.html',
  styleUrl: './knowledge-transfer-form.component.scss'
})
export class KnowledgeTransferFormComponent implements OnInit {
  ktForm!: FormGroup;
  submitted = false;
  empInfo = { empCode: 'EMP001', empName: 'John Doe', lwd: '2024-06-30' };

  progressOptions = [
    { name: 'Completed',   value: 'Completed' },
    { name: 'In Progress', value: 'In Progress' },
    { name: 'Pending',     value: 'Pending' }
  ];

  clientOptions = [
    { name: 'Completed',      value: 'Completed' },
    { name: 'In Progress',    value: 'In Progress' },
    { name: 'Not Applicable', value: 'Not Applicable' }
  ];

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.ktForm = this.fb.group({
      handoverTo:       ['', Validators.required],
      docStatus:        ['', Validators.required],
      trainingStatus:   ['', Validators.required],
      clientTransition: [''],
      ktCompletionDate: [''],
      pendingTasks:     [''],
      remarks:          ['']
    });
  }

  submitForm(): void {
    this.submitted = true;
    if (this.ktForm.invalid) return;
    this.toastr.success('Knowledge transfer saved');
    this.router.navigate(['/dash/exit/exitdashboard/admin_clearance_form/1']);
  }
}
