import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompanyParameterService } from '../../services/company-parameter.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ManualPunchBio } from '../../services/manual-puch-bio.service';

@Component({
  selector: 'app-company-parameter',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NgSelectComponent],
  templateUrl: './company-parameter.component.html',
  styleUrl: './company-parameter.component.scss',
})
export class CompanyParameterComponent {
  CompanyParameterForm!: FormGroup;
  ngxUILoaderService = inject(NgxUiLoaderService);
  showError = false;
  HeadList = []; //ADDED LR

  StateList: { name: string; value: string }[] = [];
  EmployeeList: { name: string; value: string }[] = [];

  pk_companyId: string = '';

  pfRoundoff = [
     { name: 'None', value: '1' },
    { name: '50 paise', value: '2' },
    { name: '1 rupee', value: '3' },
  ];
  eSIRoundOff = [
      { name: 'None', value: '1' },
    { name: '50 paise', value: '2' },
    { name: '1 rupee', value: '3' },
  ];
  
  Isedit = false;
  selectedStampFile: File | null = null;
  stampPreviewUrl: string | null = null;

  pf_basedon = [
    { name: 'PF Gross', value: '1' },
    { name: 'Paid Days', value: '2' },
  ];
  lwf_basedon = [
    { name: 'State wise', value: '1' },
    { name: 'Employee wise', value: '2' },
  ];

  OTDivideDaysType = [
    { name: 'Month Days', value: '1' },
    { name: 'Manual Days', value: '2' },
  ];
  constructor(
    private commanService: ManualPunchBio,
    private fb: FormBuilder,
    private Service: CompanyParameterService,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public encryption: EncryptionService
  ) {}

  ngOnInit(): void {
    this.CompanyParameterForm = this.fb.group({
      compcode: ['', [Validators.required]],
      compname: ['', [Validators.required]],
      ContactPerson: ['', [Validators.required]],
      email: ['', [Validators.required]],
      website: [''],
      address1: [''],
      address2: [''],
      phone: [''],
      mobile: [''],
      faxno: [''],
      regno: [''],
      pf_basedon: [null],
      lwf_basedon: [null],
      staxno: [''],
      tanno: [''],
      gst_no: [''],
      gst_state: [null],
      // addded by pp 23/02/2026
      isotprequired: [false],

      showclientdetails: [false],

      //added by pp 21/02/2026
      isvalidateemployee: [false],

      // pf details from here bit 20,50,1,numeric 8,18,

      pf_applicable: [''],

      pfno: [''],
      DBFFile_Code: [''],
      DBFFile_Extn: [''],
      volpf_applicable: [''],
      pf_percent: [0],
      pfmax_limit: [0],
      ac1_percent: [0],
      ac10_percent: [0],
      ac2_percent: [0],
      ac21_percent: [0],
      ac22_percent: [0],
      pension_limit: [0],
      pf_roundoff: [null],
      //  ESI Details bit, varchar 20,50
      esi_applicable: [''],
      esino: [''],
      esilocal_office: [''],

      esi_percent: [0],
      esi_emr_percent: [0],
      esimax_limit: [0],
      //smallint
      esi_roundoff: [null],

      // PT Details but varchar 20 varchar 1

      pt_applicable: [''],
      Contractor_Applicable: [false],
      Vendor_Applicable: [false], //added
      contractor_LabelName: ['Contractor Name'],
      pt_certno: [''],
      pto_circleno: [''],

      // Other Details bit,bit 8,2 18,2
      tds_applicable: [''],
      gratuity_applicable: [''],
      bonuspercent: [0],
      bonusmaxlimit: [0],

      // Top Most Senior Employee
      fk_empid: [null],
      //bit
      isAutoEmpcode: [''],
      //smallint
      maxEmpcode: [0],
      //varchar10
      prefixEmpcode: [''],
      //not found
      ReverseSalary: [''],

      fk_Bonusheadid: [null], //aded
      fk_OTheadid: [null], //aded
      fk_Basicheadid: [null], //aded
      fk_Incentiveheadid: [null], //aded
      multipleOT: [0], //added
      // OTGrossHead
      fk_OTGrossHeadId: [[]],
      fk_OtherRateHeadId: [[]],

      // Onboarding HR Email
      onboarding_hr_email: [''],

      // Onboarding Configuration
      pan_visible: [true],
      pan_mandatory: [false],
      pan_verification: [false],
      pan_ocr: [false],

      aadhaar_visible: [true],
      aadhaar_mandatory: [false],
      aadhaar_verification: [false],
      aadhaar_ocr: [false],

      eshram_visible: [false],
      eshram_mandatory: [false],
      eshram_verification: [false],

      ayushman_visible: [false],
      ayushman_mandatory: [false],
      ayushman_verification: [false],

      vehicle_insurance_visible: [false],
      vehicle_insurance_mandatory: [false],

      vehicle_rc_visible: [false],
      vehicle_rc_mandatory: [false],

       lifeinsurance_visible: [false],
      lifeinsurance_mandatory: [false],
      lifeinsurance_verification: [false],


      is_stamp: [''],

      basicinfo_visible: [true],
      basicinfo_mandatory: [false],

      qualification_visible: [true],
      qualification_mandatory: [false],

      experience_visible: [true],
      experience_mandatory: [false],

      family_visible: [true],
      family_mandatory: [false],

      voter_visible: [false],
      voter_mandatory: [false],
      voter_verification: [false],
      voter_ocr: [false],

      bankaccount_visible: [false],
      bankaccount_mandatory: [false],
      bankaccount_verification: [false],

      driving_licence_visible: [false],
      driving_licence_mandatory: [false],

      vendor_gst_visible: [false],
      vendor_gst_mandatory: [false],

      signature_visible: [false],
      signature_mandatory: [false],

      photograph_visible: [false],
      photograph_livecapture:[false],
      
      photograph_mandatory: [false],
      OTDivideDaysType:[null],
      OTDivideDays:[0],
      OTpf_gross_part:[false],
      OTesi_gross_part:[false],
      clientwiseEmpprefix:[false]
    });

    this.getEmployeeList('Employee');
    this.getStateList('State');
    const pk_companyId = this.route.snapshot.paramMap.get('pk_companyId');
    if (pk_companyId) {
      this.pk_companyId = this.encryption.decryptText(pk_companyId); // Decrypt if needed
      this.getCompanyById(this.pk_companyId);
      this.Isedit = true;
    }

    this.getHeadList(); //ADDED LR
  }

  onStampFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.selectedStampFile = file;

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.stampPreviewUrl = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  uploadStamp(companyId: string): void {
    if (!this.selectedStampFile || !companyId) return;

    const formData = new FormData();

    formData.append('CompanyId', companyId);
    formData.append('Stamp', this.selectedStampFile);

    this.Service.uploadCompanyStamp(formData).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log('Stamp uploaded successfully');
        } else {
          console.error('Stamp upload failed', res?.message);
        }
      },
      error: (err) => {
        console.error('Stamp upload error:', err);
      },
    });
  }

  //ADED LR STRART
  getHeadList() {
    this.commanService.getCommanList('head').subscribe({
      next: (res) => {
        res.data.splice(0, 1);
        this.HeadList = res.data;
        console.log('headlsit', this.HeadList);
      },
    });
  }

  //ADED LR SEMDS

  getStateList(fieldName: string) {
    this.commanService.getCommanList(fieldName).subscribe((res) => {
      this.StateList = res?.data || [];
    });
  }

  submitForm(): void {
    /*
         // Check if at least one form is visible
      const atLeastOneVisible = 
        this.CompanyParameterForm.get('pan_visible')?.value ||
        this.CompanyParameterForm.get('aadhaar_visible')?.value ||
        this.CompanyParameterForm.get('basicinfo_visible')?.value ||
        this.CompanyParameterForm.get('qualification_visible')?.value ||
        this.CompanyParameterForm.get('experience_visible')?.value ||
        this.CompanyParameterForm.get('family_visible')?.value ||
        this.CompanyParameterForm.get('voter_visible')?.value ||
        this.CompanyParameterForm.get('bankaccount_visible')?.value;
    
    
    
      if (!atLeastOneVisible) {
        this.toastrService.error('At least one onboarding form must be visible!', 'Validation Error');
        window.scrollTo(0, document.body.scrollHeight); // Scroll to bottom where onboarding section is
        return;
        
      }
    
      let emailOnboarding = this.CompanyParameterForm.get('onboarding_hr_email')?.value || '';
    
      if(emailOnboarding==''){
        this.toastrService.error('Onboarding HR email is required!', 'Validation Error');
        window.scrollTo(0, document.body.scrollHeight); // Scroll to bottom where onboarding section is
        return;
      }
        */

    if (this.CompanyParameterForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0);

      return;
    }

    const formValues = this.CompanyParameterForm.value;

    const formData = {
      saL_Company_Config: {
        ...this.CompanyParameterForm.value,
        pk_companyId: this.pk_companyId || '', 
        OTDivideDays:this.CompanyParameterForm.get('OTDivideDays')?.value || 0,
        contractor_LabelName: this.CompanyParameterForm.get(
          'Contractor_Applicable'
        )?.value
          ? this.CompanyParameterForm.get('contractor_LabelName')?.value ||
            'Contractor Name'
          : null,
        pf_roundoff: Number(
          this.CompanyParameterForm.get('pf_roundoff')?.value
        ),
        esi_roundoff: Number(
          this.CompanyParameterForm.get('esi_roundoff')?.value
        ),
        maxEmpcode: Number(this.CompanyParameterForm.get('maxEmpcode')?.value),
        fk_Bonusheadid: Number(
          this.CompanyParameterForm.get('fk_Bonusheadid')?.value
        ),
        fk_OTheadid: Number(
          this.CompanyParameterForm.get('fk_OTheadid')?.value
        ),
        fk_Basicheadid: Number(
          this.CompanyParameterForm.get('fk_Basicheadid')?.value
        ),
        fk_Incentiveheadid: Number(
          this.CompanyParameterForm.get('fk_Incentiveheadid')?.value
        ),
      },
      common_Client_Details: {
        // You can create another form group for these fields or hardcode/mock values for now
        ...this.CompanyParameterForm.value,
        fk_companyId: this.pk_companyId || '',
      },
      OTGrossHeadList: (formValues.fk_OTGrossHeadId || []).map((id: any) => ({
        otGrossHeadId: id,
      })),
      OtherRateHeadList: (formValues.fk_OtherRateHeadId || []).map(
        (id: any) => ({ otherRateHeadId: id })
      ),
    };

    if (this.pk_companyId) {
      this.Service.update_companyparameter(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // sessionStorage.setItem(
            //   'ContractApplicable',
            //   this.CompanyParameterForm.get('Contractor_Applicable')?.value
            // );

            // sessionStorage.setItem(
            //   'isotprequired',
            //   this.CompanyParameterForm.get('isotprequired')?.value
            // );
            //  sessionStorage.setItem(
            //   'isvalidateemployee',
            //   this.CompanyParameterForm.get('isvalidateemployee')?.value
            // );

            if (this.selectedStampFile && this.pk_companyId) {
              this.uploadStamp(this.pk_companyId);
            }

            this.toastrService.success(
              res.message || 'Detail updated successfully!'
            );
            this.router.navigate([
              '/dash/user/userdashboard/Compony-Parameter_list',
            ]);
          } else {
            this.toastrService.error(res.message || 'Failed to update detail.');
          }
        },
        error: (err) => {
          console.error('Update API Error:', err);
          this.toastrService.error('Something went wrong while updating!');
        },
      });
    } else {
      this.Service.add_companyparameter(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            // sessionStorage.setItem(
            //   'ContractApplicable',
            //   this.CompanyParameterForm.get('Contractor_Applicable')?.value
            // );
            //  sessionStorage.setItem(
            //   'isotprequired',
            //   this.CompanyParameterForm.get('isotprequired')?.value
            // );
            //  sessionStorage.setItem(
            //   'isvalidateemployee',
            //   this.CompanyParameterForm.get('isvalidateemployee')?.value
            // );
            this.toastrService.success(
              res.message || 'Detail added successfully!'
            );
            this.router.navigate([
              '/dash/user/userdashboard/Compony-Parameter_list',
            ]);
          } else {
            this.toastrService.error(res.message || 'Failed to add detail.');
          }
        },
        error: (err) => {
          console.error('Insert API Error:', err);
          this.toastrService.error('Something went wrong while adding!');
        },
      });
    }
  }

  getEmployeeList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data?.length) {
          console.log(res.data);
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.toastrService.error('Failed to load employee list.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching employee list:', err);
        this.toastrService.error(
          'Error fetching employee list. Please try again.'
        );
        this.ngxUILoaderService.stop();
      },
    });
  }

  getCompanyById(pk_companyId: string): void {
    this.ngxUILoaderService.start();

    this.Service.getById_companyparameter(pk_companyId).subscribe({
      next: (res) => {
        if (res?.isSuccess && res.data) {
          const config = res.data.saL_Company_Config;
          const client = res.data.common_Client_Details;
          const otGrossHeadIds = res.data.otGrossHeadList.map((item: any) =>
            String(item.otGrossHeadId)
          ); //added
          const otherRateHeadIds = res.data.otherRateHeadList.map((item: any) =>
            String(item.otherRateHeadId)
          ); //added

          this.CompanyParameterForm.patchValue({
            compcode: client.compcode,
            compname: client.compname,
            ContactPerson: client.contactperson,
            email: client.email,
            website: client.website,
            address1: client.address1,
            address2: client.address2,
            phone: client.phone,
            mobile: client.mobile,
            faxno: client.faxno,
            regno: client.regno,
            staxno: client.staxno,
            tanno: client.tanno,
            gst_no: client.gst_no,
            gst_state: client.gst_state,
            pf_applicable: config.pf_applicable,
            pfno: config.pfno,
            DBFFile_Code: config.dbfFile_Code,
            DBFFile_Extn: config.dbfFile_Extn,
            volpf_applicable: config.volpf_applicable,
            pf_basedon: config.pf_basedon,
            lwf_basedon: config.lwf_basedon,
            pf_percent: config.pf_percent,
            pfmax_limit: config.pfmax_limit,
            ac1_percent: config.ac1_percent,
            ac10_percent: config.ac10_percent,
            ac2_percent: config.ac2_percent,
            ac21_percent: config.ac21_percent,
            ac22_percent: config.ac22_percent,
            pension_limit: config.pension_limit,
            pf_roundoff: String(config.pf_roundoff),
            esi_applicable: config.esi_applicable,
            esino: config.esino,
            esilocal_office: config.esilocal_office,
            esi_percent: config.esi_percent,
            esi_emr_percent: config.esi_emr_percent,
            esimax_limit: config.esimax_limit,
            esi_roundoff: String(config.esi_roundoff),
            pt_applicable: config.pt_applicable,
            Contractor_Applicable: config.contractor_Applicable,
            Vendor_Applicable: config.vendor_Applicable,
            OTesi_gross_part: config.oTesi_gross_part,
            OTpf_gross_part: config.oTpf_gross_part,
            OTDivideDays: config.otDivideDays,
            OTDivideDaysType: config.otDivideDaysType,
            contractor_LabelName:
              config.contractor_LabelName || 'Contractor Name',
            isotprequired: config.isotprequired,
            showclientdetails: config.showclientdetails,

            isvalidateemployee: config.isvalidateemployee,
            pt_certno: config.pt_certno,
            pto_circleno: config.pto_circleno,
            tds_applicable: config.tds_applicable,
            gratuity_applicable: config.gratuity_applicable,
            bonuspercent: config.bonuspercent,
            bonusmaxlimit: config.bonusmaxlimit,
            fk_empid: config.fk_empid,
            isAutoEmpcode: config.isAutoEmpcode,
             clientwiseEmpprefix: config.clientwiseEmpprefix,
            // maxEmpcode: config.maxEmpcode,
            maxEmpcode: Number(config.maxEmpcode) || 0,
            prefixEmpcode: config.prefixEmpcode,
            ReverseSalary: config.reverseSalary,
            fk_OTGrossHeadId: otGrossHeadIds || [], //aded
            fk_OtherRateHeadId: otherRateHeadIds || [], //aded
            fk_Bonusheadid: config.fk_Bonusheadid?.toString(), //aded
            fk_OTheadid: config.fk_OTheadid?.toString(), //aded
            fk_Basicheadid: config.fk_Basicheadid?.toString(), //aded
            fk_Incentiveheadid: config.fk_Incentiveheadid?.toString(), //aded
            multipleOT: config.multipleOT, //added
            onboarding_hr_email: config.onboarding_hr_email || '',

            pan_visible: config.pan_visible ?? true,
            pan_mandatory: config.pan_mandatory ?? false,
            pan_verification: config.pan_verification ?? false,
            pan_ocr: config.pan_ocr ?? false,

            aadhaar_visible: config.aadhaar_visible ?? true,
            aadhaar_mandatory: config.aadhaar_mandatory ?? false,
            aadhaar_verification: config.aadhaar_verification ?? false,
            aadhaar_ocr: config.aadhaar_ocr ?? false,

            lifeinsurance_visible:  config.lifeinsurance_visible ?? true,
            lifeinsurance_mandatory: config.lifeinsurance_mandatory ?? false,
            lifeinsurance_verification: config.lifeinsurance_verification ?? false,

            basicinfo_visible: config.basicinfo_visible ?? true,
            basicinfo_mandatory: config.basicinfo_mandatory ?? false,

            qualification_visible: config.qualification_visible ?? true,
            qualification_mandatory: config.qualification_mandatory ?? false,

            experience_visible: config.experience_visible ?? true,
            experience_mandatory: config.experience_mandatory ?? false,

            family_visible: config.family_visible ?? true,
            family_mandatory: config.family_mandatory ?? false,

            voter_visible: config.voter_visible ?? false,
            voter_mandatory: config.voter_mandatory ?? false,
            voter_verification: config.voter_verification ?? false,
            voter_ocr: config.voter_ocr ?? false,

            bankaccount_visible: config.bankaccount_visible ?? false,
            bankaccount_mandatory: config.bankaccount_mandatory ?? false,
            bankaccount_verification: config.bankaccount_verification ?? false,

            driving_licence_visible:
              config.driving_licence_visible ??
              config.Driving_licence_visible ??
              false,
            driving_licence_mandatory:
              config.driving_licence_mandatory ??
              config.Driving_licence_mandatory ??
              false,

            vehicle_insurance_visible:
              config.vehicle_insurance_visible ??
              config.Vehicle_insurance_visible ??
              false,

            vehicle_insurance_mandatory:
              config.vehicle_insurance_mandatory ??
              config.Vehicle_insurance_mandatory ??
              false,

            vehicle_rc_visible:
              config.vehicle_rc_visible ?? config.Vehicle_rc_visible ?? false,

            vehicle_rc_mandatory:
              config.vehicle_rc_mandatory ??
              config.Vehicle_rc_mandatory ??
              false,

            vendor_gst_visible:
              config.vendor_gst_visible ?? config.Vendor_gst_visible ?? false,
            vendor_gst_mandatory:
              config.vendor_gst_mandatory ??
              config.Vendor_gst_mandatory ??
              false,

            signature_visible:
              config.signature_visible ?? config.Signature_visible ?? false,
            signature_mandatory:
              config.signature_mandatory ?? config.Signature_mandatory ?? false,

            photograph_visible:
              config.photograph_visible ?? config.Photograph_visible ?? false,
            photograph_mandatory:
              config.photograph_mandatory ??
              config.Photograph_mandatory ??
              false,
             photograph_livecapture:
              config.photograph_livecapture ??
              config.Photograph_livecapture ??
              false,
  

            eshram_visible: config.eshram_visible ?? false,
            eshram_mandatory: config.eshram_mandatory ?? false,
            eshram_verification: config.eshram_verification ?? false,

            ayushman_visible: config.ayushman_visible ?? false,
            ayushman_mandatory: config.ayushman_mandatory ?? false,
            ayushman_verification: config.ayushman_verification ?? false,

            is_stamp: config.is_stamp || '',
          });

          if (config.is_stamp) {
            const stamp = config.is_stamp;

            if (stamp.startsWith('http') || stamp.startsWith('data:')) {
              this.stampPreviewUrl = stamp;
            } else if (stamp.includes('/') || stamp.includes('\\')) {
              this.stampPreviewUrl = stamp;
            } else {
              this.Service.getImage(stamp).subscribe({
                next: (blob) => {
                  const reader = new FileReader();

                  reader.onload = () => {
                    this.stampPreviewUrl = reader.result as string;
                  };

                  reader.readAsDataURL(blob);
                },
              });
            }
          }
        } else {
          this.toastrService.error(
            res.message || 'Failed to load company details.'
          );
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('GetById Error:', err);
        this.toastrService.error('Something went wrong while loading data.');
        this.ngxUILoaderService.stop();
      },
    });
  }

  //for only number validation
  validateNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault(); // Block non-numeric characters
    }
  }

  //addded
  validateDecimalNumber(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);

    // Allow digits (0-9)
    const isDigit = charCode >= 48 && charCode <= 57;

    // Allow the decimal point (ASCII code 46)
    const isDecimal = charCode === 46;

    // Check if the input already contains a decimal point to prevent multiple ones
    const hasDecimal = (event.target as HTMLInputElement).value.includes('.');

    // Allow special keys like Backspace, Delete, Tab, Arrow keys, etc.
    const isSpecialKey = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
    ].includes(event.key);

    if (isSpecialKey) {
      return; // Do nothing for special keys
    }

    // Prevent input if it's not a digit, and if it's a decimal, check if one already exists
    if (!isDigit && !(isDecimal && !hasDecimal)) {
      event.preventDefault();
    }
  }

  checkDesignationAvailability(compcode: string): void {
    const fieldName = 'Comcode';
    const fieldValue = compcode;
    const generalId = this.pk_companyId || '';

    this.Service.CheckDuplicateValue(
      fieldName,
      fieldValue,
      generalId
    ).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.CompanyParameterForm.get('compcode')?.setErrors({
            duplicate: response.message,
          });
        } else {
          this.CompanyParameterForm.get('compcode')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.CompanyParameterForm.get('compcode')?.setErrors({
          duplicate: 'Error checking designation availability.',
        });
      },
    });
  }

  checkAvailability(compname: string): void {
    const fieldName = 'Comname';
    const fieldValue = compname;
    const generalId = this.pk_companyId || '';

    this.Service.CheckDuplicateValue(
      fieldName,
      fieldValue,
      generalId
    ).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.CompanyParameterForm.get('compname')?.setErrors({
            duplicate: response.message,
          });
        } else {
          this.CompanyParameterForm.get('compname')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.CompanyParameterForm.get('compname')?.setErrors({
          duplicate: 'Error checking designation availability.',
        });
      },
    });
  }
}
