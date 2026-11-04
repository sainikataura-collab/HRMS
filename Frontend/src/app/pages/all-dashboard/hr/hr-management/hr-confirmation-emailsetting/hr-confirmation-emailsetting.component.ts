import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { HrConfirmationEmailService } from '../../HRservices/hr-confirmation-email.service';

@Component({
  selector: 'app-hr-confirmation-emailsetting',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule
  ],
  templateUrl: './hr-confirmation-emailsetting.component.html',
  styleUrl: './hr-confirmation-emailsetting.component.scss'
})
export class HrConfirmationEmailsettingComponent {
  HrConfirmationEmailsettingform!: FormGroup;
  submitted = false;
  showError = false;
  pk_conrequesemailtId: string = '';
  isEditMode: boolean = false;

  route = inject(ActivatedRoute);

  orderno = [
    { name: 'Reporting Manager', value: '1' },
    { name: 'Branch Manager', value: '2' },
    { name: 'Zone HR', value: '3' },
    { name: 'Sr. Manager', value: '4' },
    { name: 'HOD', value: '5' },
    { name: 'Cross Functional Reporting', value: '6' },
    { name: 'HR OD', value: '7' },
    { name: 'Sr. Manager-OD', value: '8' },
    { name: 'Head HR / CPO', value: '9' },
    { name: 'ED/Chairman', value: '10' },
    { name: 'MD', value: '11' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService,
    private httpservice: HrConfirmationEmailService,
  ) {}

  ngOnInit() {
    this.HrConfirmationEmailsettingform = this.fb.group({
      orderno: ['', Validators.required],
      days: ['', Validators.required],
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_conrequesemailtId');
      if (id) {
        this.pk_conrequesemailtId = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getConfirmationEmailById(this.pk_conrequesemailtId);
      }
    });
  }

  getConfirmationEmailById(pk_conrequesemailtId: string) {
    this.httpservice.getConfirmationEmailById(pk_conrequesemailtId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.HrConfirmationEmailsettingform.patchValue({
            orderno: String(response.data.orderno),
            days: response.data.days
          });
        } else {
          console.error('Failed to fetch ConfirmationEmail:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching ConfirmationEmail:', error);
      }
    );
  }

  // submit() {
  //   this.submitted = true;
  //   if (this.HrConfirmationEmailsettingform.invalid) {
  //     this.showError = true;
  //     return;
  //   }

  //   const payload = this.HrConfirmationEmailsettingform.value;
  //   {

  //   }

  //   if (this.isEditMode && this.confirmationId) {
  //     this.httpservice.updateConfirmationEmail({ pk_ConfirmationEmailId: this.confirmationId, ...payload }).subscribe(
  //       response => {
  //         if (response.isSuccess) {
  //           this.toastrService.success(response.message || 'Confirmation Email updated successfully!');
  //           this.router.navigate(['/dash/hr/hrdashboard/confirmationEmailList']);
  //         } else {
  //           this.toastrService.error(response.message);
  //         }
  //       }
  //     );
  //   } else {
  //     this.httpservice.addConfirmationEmail(payload).subscribe(
  //       response => {
  //         if (response.isSuccess) {
  //           this.toastrService.success(response.message || 'Confirmation Email created successfully!');
  //           this.router.navigate(['/dash/hr/hrdashboard/HR_Confirmation_EmailSetting_list']);
  //         } else {
  //           this.toastrService.error(response.message);
  //         }
  //       }
  //     );
  //   }
  // }

  submit() {
    this.submitted = true;
  
    if (this.HrConfirmationEmailsettingform.invalid) {
      this.showError = true;
      return;
    }
  
    const formValues = this.HrConfirmationEmailsettingform.value;
  
    // Ensure only 'orderno' is converted to number
    const payload = {
      ...formValues,
      orderno: Number(formValues.orderno)
    };
  
    if (this.isEditMode && this.pk_conrequesemailtId) {
      this.httpservice.updateConfirmationEmail({ pk_ConfirmationEmailId: this.pk_conrequesemailtId, ...payload }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Confirmation Email updated successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/confirmationEmailList']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    } else {
      this.httpservice.addConfirmationEmail(payload).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Confirmation Email created successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/HR_Confirmation_EmailSetting_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    }
  }
  

  resetForm(): void {
    this.HrConfirmationEmailsettingform.reset();
  }
}
