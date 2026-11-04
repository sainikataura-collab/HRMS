import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { LocationMasterService } from '../../services/location-master.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { DropdownService } from '../../../../../shared/services/dropdown.service';
import { CompanyParameterService } from '../../../payroll/services/company-parameter.service';


@Component({
  selector: 'app-location-master',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './location-master.component.html',
  styleUrl: './location-master.component.scss'
})
export class LocationMasterComponent {
  UserDetails!: FormGroup;

  submited = false;
  Isedit = false;
  isLMVendorExpense = false;
  pk_locid: string = '';
  EmployeeList: { name: string; value: string }[] = [];
  LocationList: { name: string; value: string }[] = [];
  ZoneList: { name: string; value: string }[] = [];
  cityList: { name: string; value: string }[] = [];
  stateList: { name: string; value: string }[] = [];
  allLocationsData: any[] = [];

  id!: number;

  basedon = [
    { name: 'Basic', value: 'B' },
    { name: 'Gross', value: 'G' },
  ];

  Atsource = [
    { name: 'Biometric', value: 'B' },
    { name: 'Mobimetrics', value: 'M' },
  ];

  // offictype = [
  //   { name: 'Head office', value: '1' },
  // ];
   officetype: { name: string; value: string }[] = [];

  ngxUILoaderService = inject(NgxUiLoaderService);

  constructor(
    private fb: FormBuilder,
    private locationMasterService: LocationMasterService,
    private companyParameterService: CompanyParameterService,
    private toastrService: ToastrService,
    private router: Router,
    public encryption: EncryptionService,
    private route: ActivatedRoute,
    private dropdownService: DropdownService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.UserDetails = this.fb.group({
      code: [''],
      locationCode: [''],
      fk_locid: [''],
      fk_officeid: [null, [Validators.required]],
      fk_stateid: [null], //added
      fk_zoneId: [null, [Validators.required]],
      fk_cityid: [null, [Validators.required]],
      locname: ['', [Validators.required]],
      bonusbasedon: [null, [Validators.required]],
      email: [''],
      phone: [''],
      fax: [''],
      dailyAttAllow: false,
      dailyAttAllowEmp: false,
      loginallow: false,
      address: [''],
      fk_ContactempId: [null],
      remarks: [''],
      longitude: [''],
      latitude: [''],
      attendanceSource: [null],
      distance: [''],
      fk_areaId: [''],
      machineID: [''],
      ERPCode: [''],
      isActive: true,
      amUsername: [''],
      rmUsername: [''],
      areaManagerEmail: [[]],
      regionalManagerEmail: [[]],
    });

    this.loadCompanyConfig();

    
    this.getEmployeelist('Employee');
    this.getLocationlist('Location');
    this.getOfficelist('OfficeType');
    this.getzone('Zone');
    this.getStatelist('State'); 
    this.getcity('City');
    this.loadAllLocationsForMapping();

    this.getIsLMVendorExpense();

    // --add: State change hone par hi city list ko filter karo (user-driven only)
    this.UserDetails.get('fk_stateid')?.valueChanges.subscribe(value => {
      if (value) {
        this.locationMasterService.CityByState(value).subscribe(res => {
          this.cityList = res?.data || [];
        });
      } else {
        this.getcity('City');   // state clear ho to wapas full list dikhao
      }
    });

    const encryptedId = this.route.snapshot.paramMap.get('pk_locid');
    if (encryptedId) {
      this.pk_locid = this.encryption.decryptText(encryptedId);
      this.Isedit = true;
      this.patchFormForEdit(this.pk_locid);
    }
  }


  
  loadCompanyConfig(): void {
    const compId =
      sessionStorage.getItem('fk_CompanyCode') ||
      sessionStorage.getItem('companyCode') ||
      sessionStorage.getItem('companyId') ||
      localStorage.getItem('companyId') ||
      '';

    console.log('Location Master - Finding compId:', {
      fk_CompanyCode: sessionStorage.getItem('fk_CompanyCode'),
      companyCode: sessionStorage.getItem('companyCode'),
      companyId: sessionStorage.getItem('companyId'),
      resolvedCompId: compId
    });



  }

  getIsLMVendorExpense() {

    this.locationMasterService.getIsLMVendorExpense().subscribe({
      next: (res: any) => {
        console.log('Location Master - Company Config API Response:', res);
        if (res?.isSuccess && res?.data) {
          const data = res.data;
          const flag = data?.isLMVendorExpense;
          this.isLMVendorExpense = flag;

          this.cdr.detectChanges();
        }
        console.log("isLMVendorExpense : " + this.isLMVendorExpense);

      },
      error: (err) => {
        console.error('Location Master - Error loading company config:', err);
      }

    })
  }


  getOfficelist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.officetype = res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load office list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching office list:", err);
        this.toastrService.error("Error fetching office list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  
  

  onSubmit() {
    if (this.UserDetails.invalid) {
      this.submited = true;
      return;
    }
    const formVal = this.UserDetails.value;
    const locCode = formVal.locationCode || formVal.code || '';
    const areaMgrEmailStr = Array.isArray(formVal.areaManagerEmail)
      ? formVal.areaManagerEmail.join(',')
      : (formVal.areaManagerEmail || '');
    const regMgrEmailStr = Array.isArray(formVal.regionalManagerEmail)
      ? formVal.regionalManagerEmail.join(',')
      : (formVal.regionalManagerEmail || '');

    const data = {
      ...formVal,
      code: locCode,
      locationCode: locCode,
      Code: locCode,
      LocationCode: locCode,
      amUsername: formVal.amUsername || '',
      AmUsername: formVal.amUsername || '',
      rmUsername: formVal.rmUsername || '',
      RmUsername: formVal.rmUsername || '',
      areaManagerEmail: areaMgrEmailStr,
      AreaManagerEmail: areaMgrEmailStr,
      regionalManagerEmail: regMgrEmailStr,
      RegionalManagerEmail: regMgrEmailStr,
      fk_officeid: Number(this.UserDetails.get('fk_officeid')?.value),
      fk_stateid: Number(this.UserDetails.get('fk_stateid')?.value),
      dailyAttAllowEmp: true,
    };

    console.log('Submit Location Payload:', data);

    if (this.Isedit) {
      const updateData = {
        ...data,
        pk_locid: this.pk_locid
      };
      this.locationMasterService.update_location(updateData).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.dropdownService.triggerLocationReload();
            this.toastrService.success(result.message || 'detail updated successfully!');
            this.router.navigate(['/dash/user/userdashboard/locationMaster_list']);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    } else {
      this.locationMasterService.add_location(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.dropdownService.triggerLocationReload();
            this.toastrService.success(result.message || 'detail added successfully!');
            this.router.navigate(['/dash/user/userdashboard/locationMaster_list']);
          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          this.toastrService.error('An error occurred during form submission');
        }
      });
    }
  }

  getEmployeelist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.EmployeeList = res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load employee list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching employee list:", err);
        this.toastrService.error("Error fetching employee list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getLocationlist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getlocation(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.LocationList = res.data.map((Emp: any) => ({
            name: Emp.name,
            value: Emp.value
          }));
        } else {
          this.toastrService.error("Failed to load location list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching location list:", err);
        this.toastrService.error("Error fetching location list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

   getStatelist(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getcommondropdown(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.stateList = res.data.map((state: any) => ({   // --fix
            name: state.name,
            value: state.value
          }));
        } else {
          this.toastrService.error("Failed to load state list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching state list:", err);
        this.toastrService.error("Error fetching state list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
}

  getzone(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getcommondropdown(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.ZoneList = res.data.map((zone: any) => ({
            name: zone.name,
            value: zone.value
          }));
        } else {
          this.toastrService.error("Failed to load zone list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching zone list:", err);
        this.toastrService.error("Error fetching zone list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  getcity(fieldName: string) {
    this.ngxUILoaderService.start();
    this.locationMasterService.getcommondropdown(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          this.cityList = res.data.map((zone: any) => ({
            name: zone.name,
            value: zone.value
          }));
        } else {
          this.toastrService.error("Failed to load city list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching city list:", err);
        this.toastrService.error("Error fetching city list. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  patchFormForEdit(locId: string): void {
    this.ngxUILoaderService.start();
    this.locationMasterService.getlocationById(locId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const data = res.data;
          const locCode = data.locationCode || data.code || data.LocationCode || data.Code || '';
          const amUser = data.amUsername || data.AmUsername || '';
          const rmUser = data.rmUsername || data.RmUsername || '';
          const amEmail = data.areaManagerEmail || data.AreaManagerEmail || '';
          const rmEmail = data.regionalManagerEmail || data.RegionalManagerEmail || '';

          this.UserDetails.patchValue({
            code: locCode,
            locationCode: locCode,
            fk_locid: data.fk_locid,
            fk_officeid: String(data.fk_officeid),
            fk_zoneId: data.fk_zoneId,
            fk_stateid: String(data.fk_stateid),  
            fk_cityid: data.fk_cityid,
            locname: data.locname,
            bonusbasedon: data.bonusbasedon,
            email: data.email,
            phone: data.phone,
            fax: data.fax,
            dailyAttAllow: data.dailyAttAllow,
            dailyAttAllowEmp: data.dailyAttAllowEmp,
            loginallow: data.loginallow,
            address: data.address,
            fk_ContactempId: data.fk_ContactempId,
            remarks: data.remarks,
            longitude: data.longitude,
            latitude: data.latitude,
            attendanceSource: data.attendanceSource,
            distance: data.distance,
            fk_areaId: data.fk_areaId,
            machineID: data.machineID,
            ERPCode: data.ERPCode,
            isActive: data.isActive,
            amUsername: amUser,
            rmUsername: rmUser,
            areaManagerEmail: Array.isArray(amEmail)
              ? amEmail
              : (amEmail ? amEmail.split(',') : []),
            regionalManagerEmail: Array.isArray(rmEmail)
              ? rmEmail
              : (rmEmail ? rmEmail.split(',') : []),
          }, { emitEvent: false });
        } else {
          this.toastrService.error("Failed to load location details for edit.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error loading location details:", err);
        this.toastrService.error("Error loading location details. Please try again.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 48 || charCode > 57) && charCode !== 46 && charCode !== 45) {
      event.preventDefault();
    }
  }

  validateDecimal(event: KeyboardEvent) {
    this.validateNumber(event);
  }

  checkDesignationAvailability(locname: string): void {
    const fieldName = 'Location';
    const fieldValue = locname;
    const generalId = this.pk_locid || '';

    this.locationMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.UserDetails.get('locname')?.setErrors({ duplicate: response.message });
        } else {
          this.UserDetails.get('locname')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.UserDetails.get('locname')?.setErrors({ duplicate: 'Error checking location availability.' });
      }
    });
  }

  checkLocationCodeAvailability(code: string): void {
    const trimmedCode = code?.toString().trim();
    if (!trimmedCode) {
      const currentErrors = this.UserDetails.get('code')?.errors;
      if (currentErrors) {
        delete currentErrors['duplicate'];
        if (Object.keys(currentErrors).length === 0) {
          this.UserDetails.get('code')?.setErrors(null);
        } else {
          this.UserDetails.get('code')?.setErrors(currentErrors);
        }
      }
      return;
    }

    const generalId = this.pk_locid || '';
    const duplicateLoc = this.allLocationsData?.find(
      (loc: any) =>
        (loc.locationCode || loc.code) &&
        (loc.locationCode || loc.code).toString().trim().toLowerCase() === trimmedCode.toLowerCase() &&
        loc.pk_locid?.toString() !== generalId.toString()
    );

    if (duplicateLoc) {
      this.UserDetails.get('code')?.setErrors({ duplicate: 'Location Code already exists.' });
      return;
    } else {
      const currentErrors = this.UserDetails.get('code')?.errors;
      if (currentErrors?.['duplicate']) {
        delete currentErrors['duplicate'];
        if (Object.keys(currentErrors).length === 0) {
          this.UserDetails.get('code')?.setErrors(null);
        } else {
          this.UserDetails.get('code')?.setErrors(currentErrors);
        }
      }
    }

    const fieldName = 'LocationCode';
    this.locationMasterService.CheckDuplicateValue(fieldName, trimmedCode, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.UserDetails.get('code')?.setErrors({ duplicate: response.message || 'Location Code already exists.' });
        }
      },
      error: (err) => {
        console.error('Duplicate Location Code check error:', err);
      }
    });
  }

  loadAllLocationsForMapping(): void {
    this.locationMasterService.get_location(0, 10000, '').subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          this.allLocationsData = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading locations for manager mapping:', err);
      }
    });
  }

  private parseEmailArray(emails: any): string[] {
    if (Array.isArray(emails)) return emails;
    if (typeof emails === 'string' && emails.trim()) {
      return emails.split(',').map(e => e.trim()).filter(e => e.length > 0);
    }
    return [];
  }

  onLocationCodeChange(): void {
    const codeVal = (this.UserDetails.get('locationCode')?.value || this.UserDetails.get('code')?.value)?.toString().trim();
    if (!codeVal || !this.allLocationsData || this.allLocationsData.length === 0) {
      return;
    }

    const matchedLoc = this.allLocationsData.find(
      (loc: any) => {
        const itemCode = (loc.locationCode || loc.code)?.toString().trim().toLowerCase();
        return itemCode && itemCode === codeVal.toLowerCase();
      }
    );

    if (matchedLoc) {
      const patchData: any = {};
      if (matchedLoc.amUsername) {
        patchData.amUsername = matchedLoc.amUsername;
      }
      if (matchedLoc.rmUsername) {
        patchData.rmUsername = matchedLoc.rmUsername;
      }
      if (matchedLoc.areaManagerEmail) {
        patchData.areaManagerEmail = this.parseEmailArray(matchedLoc.areaManagerEmail);
      }
      if (matchedLoc.regionalManagerEmail) {
        patchData.regionalManagerEmail = this.parseEmailArray(matchedLoc.regionalManagerEmail);
      }

      if (Object.keys(patchData).length > 0) {
        this.UserDetails.patchValue(patchData);
        this.toastrService.info('Area Manager & Regional Manager auto-filled for Location Code.');
      }
    }
  }

  onAreaManagerChange(): void {
    const amVal = this.UserDetails.get('amUsername')?.value?.toString().trim();
    if (!amVal || !this.allLocationsData || this.allLocationsData.length === 0) {
      return;
    }

    const matchedLoc = this.allLocationsData.find(
      (loc: any) => loc.amUsername && loc.amUsername.toString().trim().toLowerCase() === amVal.toLowerCase() && loc.rmUsername
    );

    if (matchedLoc) {
      const patchData: any = {};
      if (matchedLoc.rmUsername) {
        patchData.rmUsername = matchedLoc.rmUsername;
      }
      if (matchedLoc.regionalManagerEmail) {
        patchData.regionalManagerEmail = this.parseEmailArray(matchedLoc.regionalManagerEmail);
      }

      if (Object.keys(patchData).length > 0) {
        this.UserDetails.patchValue(patchData);
        this.toastrService.info('Regional Manager auto-filled for selected Area Manager.');
      }
    }
  }

  addEmailTag(controlName: string, inputEl: HTMLInputElement): void {
    const value = inputEl.value?.trim();
    if (!value) return;

    const currentArr: string[] = Array.isArray(this.UserDetails.get(controlName)?.value)
      ? [...this.UserDetails.get(controlName)?.value]
      : [];

    if (!currentArr.includes(value)) {
      currentArr.push(value);
      this.UserDetails.get(controlName)?.setValue(currentArr);
      this.UserDetails.get(controlName)?.markAsDirty();
    }
    inputEl.value = '';
  }

  addEmailTagOnBlur(controlName: string, inputEl: HTMLInputElement): void {
    this.addEmailTag(controlName, inputEl);
  }

  removeEmailTag(controlName: string, index: number): void {
    const currentArr: string[] = Array.isArray(this.UserDetails.get(controlName)?.value)
      ? [...this.UserDetails.get(controlName)?.value]
      : [];

    if (index >= 0 && index < currentArr.length) {
      currentArr.splice(index, 1);
      this.UserDetails.get(controlName)?.setValue(currentArr);
      this.UserDetails.get(controlName)?.markAsDirty();
    }
  }

  onEmailInputKeydown(event: KeyboardEvent, controlName: string, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addEmailTag(controlName, inputEl);
    } else if (event.key === 'Backspace' && !inputEl.value) {
      const currentArr: string[] = Array.isArray(this.UserDetails.get(controlName)?.value)
        ? [...this.UserDetails.get(controlName)?.value]
        : [];
      if (currentArr.length > 0) {
        this.removeEmailTag(controlName, currentArr.length - 1);
      }
    }
  }
}