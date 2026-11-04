import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { appraisalService } from '../appraisal.service';


import { NgSelectComponent } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../shared/services/encryption.service';
@Component({
  selector: 'app-appraisal-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule, RouterLink,NgSelectComponent],
  templateUrl: './appraisal-master.component.html',
  styleUrl: './appraisal-master.component.scss'
})
export class AppraisalMasterComponent {
AppraisalMaster!: FormGroup;
  showError = false;
  submitted = false;
 pk_appId: number | null = null;
  Isedit = false;
  FinancialYearList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private appraisalService: appraisalService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.AppraisalMaster = this.fb.group({
      description: ['', [Validators.required]],
      fk_finid: [null, [Validators.required]],
      dated: ['', [Validators.required]],
      remarks: [''],
      active: [false]
    });
   this.getFinancialYearList('FinancialYear');

    const encId = this.route.snapshot.params['pk_appId'];
    const decrypted = encId ? this.encryptionService.decryptText(encId) : null;
    // ✅ Convert decrypted string to number
    this.pk_appId = decrypted && !isNaN(+decrypted) ? +decrypted : null;
    if (this.pk_appId) {
      this.loadAppraisalData(this.pk_appId);
      this.Isedit = true;
    }
  }

    getFinancialYearList(fieldName: string) {
    this.appraisalService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
       
          this.FinancialYearList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));
        } else {
          this.toastrService.error("Failed to load role list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching role list.");
      }
    });
  }


  // Submit form
  onSubmit(): void {
    if (this.AppraisalMaster.invalid) {
      this.showError = true;
      return;
    }

    const data = {
      ...this.AppraisalMaster.value
    };

    if (this.Isedit) {
      const updateData = {
        ...data,
        pk_appId: this.pk_appId
      };

      this.appraisalService.update_Appraisal(updateData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.router.navigateByUrl('/dash/appraisal/appraisaldashboard/AppraisalMaster_list');
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during update.');
        }
      });
    } else {
      this.appraisalService.insert_Appraisal(data).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
       this.router.navigateByUrl('/dash/appraisal/appraisaldashboard/AppraisalMaster_list');
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during submission.');
        }
      });
    }
  }

  // Load data for update
  loadAppraisalData(pk_appId: number): void {
    debugger
  this.appraisalService.getById_Appraisal(pk_appId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {

        const formattedDate = this.formatDateToYMD(res.data.dated);
  
        this.AppraisalMaster.patchValue({
          description: res.data.description,
          fk_finid: res.data.fk_finid,
          dated: formattedDate, // ✅ converted to input-compatible format
          remarks: res.data.remarks,
           active: res.data.active === 'True' || res.data.active === 'true' ? true : false
        });

        console.log('Appraisal data loaded:', res.data);
        this.Isedit = true;
      } else {
        this.toastrService.error('Failed to load Appraisal details.');
      }
    },
    error: () => {
      this.toastrService.error('Error loading Appraisal data.');
    }
  });
}

checkDuplicate(description: string): void {
  const fieldName = 'AppraisalDesc'; // 👈 your setup for Appraisal Master
  const fieldValue = description;
  const generalId = this.pk_appId !== null ? this.pk_appId.toString() : '';

  this.appraisalService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.AppraisalMaster.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.AppraisalMaster.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.AppraisalMaster.get('description')?.setErrors({ duplicate: 'Error checking Appraisal availability.' });
    }
  });
}


formatDateToYMD(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ''; // Invalid date fallback

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}


  // Reset form
  resetForm(): void {
    this.AppraisalMaster.reset();
  }
}
