// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-channel-master',
//   standalone: true,
//   imports: [],
//   templateUrl: './channel-master.component.html',
//   styleUrl: './channel-master.component.scss'
// })
// export class ChannelMasterComponent {

// }


import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChannelMasterService } from '../../services/channel-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CityMasterService } from '../../services/city-master.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-channel-master',
  standalone: true,
  imports: [ FormsModule, ReactiveFormsModule, CommonModule,NgSelectModule],
  templateUrl: './channel-master.component.html',
  styleUrl: './channel-master.component.scss'
})
export class ChannelMasterComponent {
  ChannelDetail!: FormGroup;
    ngxUILoaderService = inject(NgxUiLoaderService);
  
  submitted = false;
  showError = false;
  Isedit = false;
  pk_ChannelId!: string;
    States: { label: string, value: number }[]  = [];


  constructor(
    private router: Router,
    private channelMasterService: ChannelMasterService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private encryptionService: EncryptionService,
    private citymasterService:CityMasterService,
  ) {}

  ngOnInit(): void {
    this.ChannelDetail = this.formBuilder.group({
      channelCode: ['', Validators.required],
      channelName: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', Validators.required],
      contactPerson: [''],
      contactNo: ['', [Validators.pattern('^[0-9]{10,20}$')]],
      emailId: ['', [Validators.email]],
      address: [''],
      pk_ChannelId: [''],
      isActive: [true],
      userId: ['', Validators.required],
      password: ['', Validators.required],
            fk_stateid: [null,Validators.required],

         city: ['', Validators.required],
               location: ['', Validators.required],
                     officeType: ['', Validators.required]





    });
     this.getStateList('State');

    this.pk_ChannelId = this.encryptionService.decryptText(
      this.route.snapshot.params['pk_ChannelId'].toString()
    );

    if (this.pk_ChannelId && this.pk_ChannelId !== 'undefined') {
      this.loadChannelMasterData(this.pk_ChannelId);
      this.Isedit = true;
    }

    this.ChannelDetail.get('channelCode')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkDuplicate(value);
      }
    });
     // Check duplicate for ChannelName
    this.ChannelDetail.get('channelName')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkDuplicateChannelName(value);
      }
    });
      this.ChannelDetail.get('companyName')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkDuplicateChannelName(value);
      }
    });
  }

    getStateList(fieldName: string) {

    // this.ngxUILoaderService.start(); // Start loader before API call
  
    this.citymasterService.getStateList(fieldName).subscribe({
        next: (res) => {
              this.ngxUILoaderService.start();

            if (res.isSuccess && res.data) {
                this.States = res.data.map((fk_stateid: any) => ({
                  name: fk_stateid.name,
                    value: fk_stateid.value
                }));
            } else {
                this.toastrService.error("Failed to load HOD list.");
            }
                    this.ngxUILoaderService.stop();

            // Stop loader after response
  
        },
        error: (err) => {
            console.error("Error fetching HOD list:", err);
            this.toastrService.error("Error fetching level list.");
            
        }
    });
  }


  
  // Check duplicate for ChannelName
  checkDuplicateChannelName(channelName: string): void {
    const fieldName = 'ChannelName';
    const fieldValue = channelName;
    const generalId = this.pk_ChannelId || '';

    this.channelMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ChannelDetail.get('channelName')?.setErrors({ duplicate: response.message });
        } else {
          // Only clear duplicate error, preserve other validation errors
          const currentErrors = this.ChannelDetail.get('channelName')?.errors;
          if (currentErrors && currentErrors['duplicate']) {
            delete currentErrors['duplicate'];
            this.ChannelDetail.get('channelName')?.setErrors(
              Object.keys(currentErrors).length > 0 ? currentErrors : null
            );
          }
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.ChannelDetail.get('channelName')?.setErrors({ 
          duplicate: 'Error checking channel name availability.' 
        });
      }
    });
  }


    // Check duplicate for CompanyName
  checkDuplicateChannelCompanyName(companyName: string): void {
    const fieldName = 'CompanyName';
    const fieldValue = companyName;
    const generalId = this.pk_ChannelId || '';

    this.channelMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ChannelDetail.get('companyName')?.setErrors({ duplicate: response.message });
        } else {
          // Only clear duplicate error, preserve other validation errors
          const currentErrors = this.ChannelDetail.get('companyName')?.errors;
          if (currentErrors && currentErrors['duplicate']) {
            delete currentErrors['duplicate'];
            this.ChannelDetail.get('companyName')?.setErrors(
              Object.keys(currentErrors).length > 0 ? currentErrors : null
            );
          }
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.ChannelDetail.get('channelName')?.setErrors({ 
          duplicate: 'Error checking channel name availability.' 
        });
      }
    });
  }

  checkDuplicate(channelCode: string): void {
    const fieldName = 'channelCode';
    const fieldValue = channelCode;
    const generalId = this.pk_ChannelId || '';

    this.channelMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.ChannelDetail.get('channelCode')?.setErrors({ duplicate: response.message });
        } else {
          this.ChannelDetail.get('channelCode')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.ChannelDetail.get('channelCode')?.setErrors({ 
          duplicate: 'Error checking channel availability.' 
        });
      }
    });
  }

  redirectToPage() {
    this.router.navigate(['/dash/payroll/payrolldashboard/ChannelMaster_list']);
  }

  onSubmit() {
    this.showError = true;
    this.submitted = true;
    debugger;
    if (this.ChannelDetail.invalid) {
      this.showError = true;
      return;
    }
    debugger;

    const data = {
      ...this.ChannelDetail.value,
      pk_ChannelId: this.pk_ChannelId
    };

    if (this.Isedit) {
      this.channelMasterService.update_ChannelMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/payroll/payrolldashboard/ChannelMaster_list");
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    } else {
      this.channelMasterService.add_ChannelMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/payroll/payrolldashboard/ChannelMaster_list");
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: (errorResponse) => {
          if (errorResponse.error && errorResponse.error.message.includes("duplicate")) {
            this.toastrService.error("Channel Name already exists.");
          } else {
            this.toastrService.error("An error occurred during form submission");
          }
        }
      });
    }
  }

  loadChannelMasterData(pk_ChannelId: string) {
    this.channelMasterService.getById_ChannelMaster(pk_ChannelId).subscribe({
      next: (res) => {
    this.ngxUILoaderService.start();

        if (res.isSuccess && res.data) {
          console.log("Fetched Channel Data:", res.data);
            var stateIdStr = res.data.fk_stateid + "";

          this.ChannelDetail.patchValue({
            channelCode: res.data.channelCode || '',
            channelName: res.data.channelName || '',
            companyName: res.data.companyName || '',
            contactPerson: res.data.contactPerson || '',
            contactNo: res.data.contactNo || '',
            emailId: res.data.emailId || '',
            address: res.data.address || '',
            pk_ChannelId: res.data.pk_ChannelId || '',
            isActive: res.data.isActive !== undefined ? res.data.isActive : true,
             userId: res.data.userId || '',
            location: res.data.location || '',
            city: res.data.city || '',
            officeType: res.data.officeType || '',
            password: res.data.password || '',
           fk_stateid: stateIdStr,
          });

          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load channel details.");
        }
                this.ngxUILoaderService.stop();

      },
      error: () => {
        this.toastrService.error("Error loading channel data.");
      }
    });
  }

  // For only number validation
  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric characters
    }
  }

  resetForm(): void {
    this.ChannelDetail.reset();
  }
}