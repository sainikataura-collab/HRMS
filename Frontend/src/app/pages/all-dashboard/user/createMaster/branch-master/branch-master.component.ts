import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ToastrService } from 'ngx-toastr';
import { BranchMstService } from '../../services/branch-mst.service';

@Component({
  selector: 'app-branch-master',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './branch-master.component.html',
  styleUrl: './branch-master.component.scss'
})
export class BranchMasterComponent {

    BranchForm!: FormGroup;

  submitted = false;
  Isedit = false;
  pk_branchId!: number;

  // Dropdowns
  cityList: { name: string; value: string }[] = [];
   BranchHeadList: { name: string; value: string }[] = [];
  stateList: { name: string; value: string }[] = [];
  regionList: { name: string; value: string }[] = [];

  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private service: BranchMstService, //  changed
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    //  Form
    this.BranchForm = this.fb.group({
      BranchName: ['', Validators.required],
      PhoneNumber: [''],
      Address: [''],
       fk_branchhead_empid: [null, Validators.required],
      fk_cityid: [null, Validators.required],
      fk_stateid: [null, Validators.required],
      fk_zoneId: [null, Validators.required]
    });

    //  Load Dropdowns
    this.getCity('City');
    this.getState('State');
    this.getZone('Zone');
     this.getbranchhead('Employee');

    //  Edit Mode
    const encryptedId = this.route.snapshot.paramMap.get('pk_branchId');

    if (encryptedId) {
      this.pk_branchId = Number(this.encryption.decryptText(encryptedId));
      this.Isedit = true;
      this.patchFormForEdit(this.pk_branchId);
    }
  }

  // ===================== SUBMIT =====================
  onSubmit() {
    this.submitted = true;

    if (this.BranchForm.invalid) return;

    const formValue = this.BranchForm.value;

    const payload = [{
      ...formValue,
      fk_stateid: Number(formValue.fk_stateid),
      fk_zoneId: Number(formValue.fk_zoneId),
      pk_branchId: this.Isedit ? this.pk_branchId : 0
    }];

    this.ngxUILoaderService.start();

    const apiCall = this.Isedit
      ? this.service.updateBranch(payload)
      : this.service.insertBranch(payload);

    apiCall.subscribe({
      next: (res: any) => {
        this.ngxUILoaderService.stop();

        if (res.isSuccess) {
          this.toastrService.success(res.message || (this.Isedit ? 'Updated Successfully' : 'Saved Successfully'));
          this.router.navigate(['/dash/user/userdashboard/BranchMaster_list']);
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Error occurred');
      }
    });
  }

  // ===================== DROPDOWNS =====================
  getCity(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.cityList = res?.data || [];
    });
  }

  getState(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.stateList = res?.data || [];
    });
  }

  getZone(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.regionList = res?.data || [];
    });
  }

   getbranchhead(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.BranchHeadList = res?.data || [];
    });
  }
  // ===================== EDIT PATCH =====================
  patchFormForEdit(id: number) {
    this.ngxUILoaderService.start();

    this.service.getById(id).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {

          const data = res.data;

          this.BranchForm.patchValue({
            BranchName: data.branchName,
            PhoneNumber: data.phoneNumber,
            Address: data.address,
            fk_cityid: data.fk_cityid,
             fk_branchhead_empid: data.fk_branchhead_empid,
            fk_stateid: String(data.fk_stateid),
            fk_zoneId: String(data.fk_zoneId),

          });

        } else {
          this.toastrService.error('Failed to load data');
        }

        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.ngxUILoaderService.stop();
        this.toastrService.error('Error loading data');
      }
    });
  }

  // ===================== RESET =====================
  onReset() {
    this.submitted = false;
    this.BranchForm.reset();
  }

   checkAvailability(BranchName: string): void {
  const fieldName = 'BranchName'; 
  const fieldValue = BranchName; 
  const generalId = this.pk_branchId; 

  this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.BranchForm.get('BranchName')?.setErrors({ duplicate: response.message });
      } else {
        this.BranchForm.get('BranchName')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.BranchForm.get('BranchName')?.setErrors({ duplicate: 'Error checking Branch Name availability.' });
    }
  });
}
  //for only number validation
  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric characters
    }
  }

  
}
