import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { DropdownService } from '../../../../../../shared/services/dropdown.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { DealerOutletService } from '../../../services/dealer-outlet.service';
import { CommonSearchService } from '../../../../payroll/services/common-search.service';

@Component({
  selector: 'app-outlet-master',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './outlet-master.component.html',
  styleUrl: './outlet-master.component.scss'
})
export class OutletMasterComponent {

  DealerForm!: FormGroup;

  submitted = false;
  Isedit = false;
  pk_dealerOutletId!: number;
  

  // Dropdowns
  Client: { name: string; value: string }[] = [];
  cityList: { name: string; value: string }[] = [];
  stateList: { name: string; value: string }[] = [];
  regionList: { name: string; value: string }[] = [];
 retailTypeList: { name: string; value: string }[] = [];

//  retailTypeList: { name: string; value: number }[] = [
//   { name: 'Retail', value: 1 },
//   { name: 'Wholesale', value: 2 },
//   { name: 'Distributor', value: 3 },
//   { name: 'Dealer', value: 4 }
// ];
  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private service: DealerOutletService,
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService,
    private route: ActivatedRoute,
    private getcommondropdown: DealerOutletService
  ) {}

  ngOnInit(): void {

    //  Form
    this.DealerForm = this.fb.group({
      fk_cost_centre_id: [null, Validators.required],
      OutletCode: ['', Validators.required],
      OutletName: ['', Validators.required],
      DealerCode: ['', Validators.required],
      fk_retailtypeid: [null, Validators.required],
      Address: [''],
      fk_cityid: [null, Validators.required],
      fk_stateid: [null, Validators.required],
      fk_zoneId: [null,Validators.required]
    });

    //  Load Dropdowns
    this.getCostCenter('CostCenter');
    this.getCity('City');
    this.getState('State');
    this.getReligion('Zone');
    //this.getRetailType('RetailType');
     this.retailType();

    //  Edit Mode
    const encryptedId = this.route.snapshot.paramMap.get('pk_dealerOutletId');
    console.log('emcrypted id', encryptedId)
    if (encryptedId) {
      this.pk_dealerOutletId = Number(this.encryption.decryptText(encryptedId));
    
      this.Isedit = true;
      this.patchFormForEdit(this.pk_dealerOutletId);
    }
  }

  // Submit
  onSubmit() {
    this.submitted = true;

    if (this.DealerForm.invalid) return;

      const formValue = this.DealerForm.value;
    const payload = [{
      ...formValue,
       fk_cost_centre_id: Number(formValue.fk_cost_centre_id),
    fk_retailtypeid: Number(formValue.fk_retailtypeid),
    fk_stateid: Number(formValue.fk_stateid),
     fk_zoneId: Number(formValue.fk_zoneId),
      pk_dealerOutletId: this.Isedit ? this.pk_dealerOutletId : 0
    }];

    this.ngxUILoaderService.start();

    const apiCall = this.Isedit
      ? this.service.UpdateDealerOutlet(payload)
      : this.service.insertDealerOutlet(payload);

    apiCall.subscribe({
      next: (res: any) => {
        this.ngxUILoaderService.stop();

        if (res.isSuccess) {
          this.toastrService.success(res.message || (this.Isedit ? 'Updated Successfully' : 'Saved Successfully'));
          this.router.navigate(['/dash/user/userdashboard/DealerOutlet_list']);
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

  //  Dropdown APIs
  getCostCenter(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.Client = res?.data || [];
    });
  }

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

  getReligion(fieldName: string) {
    this.service.getcommondropdown(fieldName).subscribe(res => {
      this.regionList = res?.data || [];
    });
  }

  // getRetailType(fieldName: string) {
  //   this.service.getcommondropdown(fieldName).subscribe(res => {
  //     this.retailTypeList = res?.data || [];
  //   });
  // }

  //  Edit Patch
  patchFormForEdit(id: number) {
    this.ngxUILoaderService.start();

    this.service.getById(id).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          // this.DealerForm.patchValue(res.data);
             const data = res.data;

           this.DealerForm.patchValue({
          fk_cost_centre_id: String(data.fk_cost_centre_id),
          OutletCode: data.outletCode,
          OutletName: data.outletName,
          DealerCode: data.dealerCode,
          fk_retailtypeid: String(data.fk_retailtypeid),
          Address: data.address,
          fk_cityid: data.fk_cityid,
          fk_stateid: String(data.fk_stateid),
          fk_zoneId: String(data.fk_zoneId)
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

  //  Reset
  onReset() {
    this.submitted = false;
    this.DealerForm.reset();
  }

   retailType() {
    this.service.GetDdlListBasedOnCodeType(2).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.retailTypeList = res.data;
        }
      }
    });
  }

  checkAvailability(OutletCode: string): void {
  const fieldName = 'OutletCode'; 
  const fieldValue = OutletCode; 
  const generalId = this.pk_dealerOutletId; 

  this.service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.DealerForm.get('OutletCode')?.setErrors({ duplicate: response.message });
      } else {
        this.DealerForm.get('OutletCode')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.DealerForm.get('OutletCode')?.setErrors({ duplicate: 'Error checking OutletCode availability.' });
    }
  });
}
}