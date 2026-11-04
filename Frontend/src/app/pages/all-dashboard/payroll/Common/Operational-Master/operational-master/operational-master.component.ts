import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { OperationalMasterService } from '../../../services/operational-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
@Component({
  selector: 'app-operational-master',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgxPaginationModule,RouterLink],
  templateUrl: './operational-master.component.html',
  styleUrl: './operational-master.component.scss'
})
export class OperationalMasterComponent {
  operationalForm!: FormGroup;
  submitted = false;
  showError = false;
  operationalId: string = '';
  isEditMode: boolean = false;
  route = inject(ActivatedRoute);
  id!: number;
  
  constructor(
    private fb: FormBuilder,
    private operationalMasterService: OperationalMasterService,
    private toastrService: ToastrService,
    private router: Router,private encryptionService:EncryptionService
  ) {}
  ngOnInit(): void {
    this.operationalForm = this.fb.group({
      OperationalCode: ['',[Validators.required,Validators.maxLength(20)]],
      OperationalDescription: ['', [Validators.required,Validators.maxLength(150)]],
    });

    this.operationalForm.get('OperationalDescription')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkOperationalAvailability(value);
      }
    });

    // this.pk_natureid=this.encryptionService.decryptText(this.route.snapshot.params['pk_natureid'].toString());


    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_OperationalId');
      if (id) {
        this.operationalId =this.encryptionService.decryptText(id.toString()) ;
        this.isEditMode = true;
        this.getOperationalById(this.operationalId);
      }
    });
  }

  checkOperationalAvailability(OperationalDescription: string): void {
    const fieldName = 'OperationalDes';
    const fieldValue = OperationalDescription;
    const generalId = this.operationalId || '';

    this.operationalMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.operationalForm.get('OperationalDescription')?.setErrors({ duplicate: response.message });
        } else {
          this.operationalForm.get('OperationalDescription')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.operationalForm.get('OperationalDescription')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  getOperationalById(id: string) {
    this.operationalMasterService.getOperationalById(id).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.operationalForm.patchValue({
            OperationalCode: response.data.operationalCode,
            OperationalDescription: response.data.operationalDescription
          });
        } else {
          console.error('Failed to fetch Operational:', response.message);
        }
      },
      (error) => {
        console.error('Error fetching Operational:', error);
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.operationalForm.invalid) {
      this.showError = true;
      return;
    }
    const formData = this.operationalForm.value;
    if (this.isEditMode && this.operationalId) {
      this.operationalMasterService.updateOperational({pk_OperationalId: this.operationalId, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'OperationalMaster updated successfully!');
            this.router.navigate(['/dash/user/userdashboard/operationalMaster_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    } else {
      this.operationalMasterService.add_OperationalMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'OperationalMaster created successfully!');
            this.router.navigate(['/dash/user/userdashboard/operationalMaster_list']);
          } else {
            this.toastrService.error(response.message);
          }
        }
      );
    }
  }

  resetForm(): void {
    this.operationalForm.reset();
  }
}
