import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CandidateMasterService } from '../../recruitment/RecruitServices/candidate-master.service';
import { EmployeeFactBoxComponent } from '../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-employee-other-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink, EmployeeFactBoxComponent],
  templateUrl: './employee-other-details.component.html',
  styleUrl: './employee-other-details.component.scss'
})
export class EmployeeOtherDetailsComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  ngxUILoaderService = inject(NgxUiLoaderService);
  currentStep: number = 3;


  goToStep(step: number, route: string): void {
    this.currentStep = step;
    this.router.navigate([route]);
  }
  EmployeeForm!: FormGroup;
  oldPic: string = '';
  picImageUrl: string = '';
  picFileName: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  fileError: string | null = null;

  showError = false;
  submitted = false;
  pk_empid!: string;
  Isedit = false;
  zones: any[] = [];

  constructor(private fb: FormBuilder, private employeeMasterService: EmployeeMasterService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, public encryptionService: EncryptionService, private service: CandidateMasterService) { }

  ngOnInit() {
    this.EmployeeForm = this.fb.group({
      pk_empid: [''],
      pf_app: [false],
      esi_app: [false],
      pffixedamount: [0],
      pfno: [null],
      inESICycle: [false],
      proftax_app: [false],
      volpf_app: [false],
      esino: [null],
      volpfTypeAmt: [0],
      isreverse: [false],
      pfmaxlimit_app: [false],
      lwfapplicable: [false],
      volpfType: [''],
      empcode: [''],
      empname: [''],
      uanNo: [null],
      policy_app: [false],
      policyNo: [''],
      policyDate: [''],
      policyAmount: [''],
      tillValid: [''],
      policyImage: [null],
      esiZone: [''],
      NomineeName: [''],
      NomineeRelation: [''],
      NomineeMobileNo: ['', [Validators.pattern('^[0-9]{10}$')]]
    });

    this.route.paramMap.subscribe(params => {
      const encryptedId = params.get('pk_empid');
      if (encryptedId) {
        this.pk_empid = this.encryptionService.decryptText(encryptedId);
        this.EmployeeForm.patchValue({ pk_empid: this.pk_empid });

        if (this.pk_empid && this.pk_empid !== 'undefined') {
          this.loadEmployeeOtherDetailsData(this.pk_empid);
          this.Isedit = true;
        }
      }
    });

    this.getZoneList('Zone');
  }

  getZoneList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          this.zones = res.data.map((zone: any) => ({
            name: zone.name,
            value: zone.value
          }));
        } else {
          this.toastrService.error("Failed to load Zone list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        this.toastrService.error("Error fetching Zone list.");
        console.error('Failed to load zones:', err);
      }
    });
  }
  restrictInputDecimal(event: KeyboardEvent) {
    const pattern = /^[0-9to.]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }
  // onSubmit(): void {
  //   this.submitted = true;


  //   if (this.EmployeeForm.invalid) {
  //     this.toastrService.error('Please fill all required fields', 'Validation Error');
  //     this.showError = true;
  //     return;
  //   }

  //   // Ensure the correct form values are used
  //   const updatedData = this.EmployeeForm.value;

  //   console.log('Submitting Data:', updatedData);

  //   this.employeeMasterService.update_employeeOtherDetails(updatedData).subscribe({
  //     next: (res) => {
  //       console.log('API Response:', res);
  //       if (res?.isSuccess) {
  //         this.toastrService.success('Employee Other Details updated successfully!', 'Success');
  //         //this.router.navigateByUrl("/dash/payroll/payrolldashboard/EmployeeHead");
  //        // this.goTohead();
  //       } else {
  //         this.toastrService.error(res?.message || 'Update Failed', 'Error');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('API Error:', err);
  //       this.toastrService.error(err?.error?.message || 'Failed to update employee other details', 'Error');
  //     }
  //   });
  // }

  onFileSelect(event: any): void {
    // Reset old state every time a new file is chosen
    this.fileError = null;
    this.selectedFile = null;
    this.imagePreview = null;

    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    // ✅ Validate type and extension
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      this.fileError = 'Only JPG, JPEG, or PNG images are allowed.';
      this.EmployeeForm.patchValue({ policyImage: null });
      event.target.value = ''; // clear file input value
      return;
    }

    this.selectedFile = file;
    this.picFileName = '';
    this.picImageUrl = '';
    this.EmployeeForm.patchValue({ policyImage: file });

    // ✅ Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);

    console.log('Selected file:', file.name);
  }


  onSubmit(): void {

    if (this.EmployeeForm.invalid) {
      this.showError = true;
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return;
    }

    const formValues = this.EmployeeForm.value;
    console.log('Final Employee Other Details Form Values:', formValues);

    // ✅ Create FormData and append all fields
    const formData = new FormData();
    formData.append('pk_empid', formValues.pk_empid);
    formData.append('pf_app', formValues.pf_app);
    formData.append('pffixedamount', formValues.pffixedamount);
    formData.append('esi_app', formValues.esi_app);
    formData.append('pfno', formValues.pfno || '');
    formData.append('inESICycle', formValues.inESICycle || false);
    formData.append('proftax_app', formValues.proftax_app || false);
    formData.append('volpf_app', formValues.volpf_app);
    formData.append('esino', formValues.esino || '');
    formData.append('volpfTypeAmt', formValues.volpfTypeAmt);
    formData.append('isreverse', formValues.isreverse || false);
    formData.append('pfmaxlimit_app', formValues.pfmaxlimit_app);
    formData.append('volpfType', formValues.volpfType || '');
    formData.append('empcode', formValues.empcode || '');
    formData.append('empname', formValues.empname || '');
    formData.append('lwfapplicable', formValues.lwfapplicable || false);
    formData.append('uanNo', formValues.uanNo || '');


    // ✅ Handle Policy Fields Conditionally
    const isPolicy = !!formValues.policy_app;
    formData.append('policy_app', isPolicy ? 'true' : 'false');
    formData.append('policyNo', isPolicy ? formValues.policyNo || '' : '');
    formData.append('policyDate', isPolicy ? formValues.policyDate || '' : '');
    formData.append('policy_amount', isPolicy ? formValues.policyAmount || '' : '');
    formData.append('policyTillValid', isPolicy ? formValues.tillValid || '' : '');
    formData.append('esiZone', formValues.esiZone || '');
    formData.append('NomineeName', formValues.NomineeName || '');
    formData.append('NomineeRelation', formValues.NomineeRelation || '');
    formData.append('NomineeMobileNo', formValues.NomineeMobileNo || '');


    // formData.append('policy_app', formValues.policy_app|| false);
    // formData.append('policyNo', formValues.policyNo || '');
    // formData.append('policyDate', formValues.policyDate || '');
    // formData.append('policy_amount', formValues.policyAmount || '');
    // formData.append('policyTillValid', formValues.tillValid || '');

    // ✅ Append file if selected
    if (this.selectedFile) {
      formData.append('FileBytes', this.selectedFile);
    }


    // ✅ Call update API
    this.employeeMasterService.update_employeeOtherDetails(formData).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastrService.success('Employee Other Details updated successfully!', 'Success');
          if (this.factBox) {
            this.factBox.refresh();
          }
          // Optionally: this.goTohead();
        } else {
          this.toastrService.error(res.message || 'Failed to update Employee Other Details');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastrService.error(err?.error?.message || 'Something went wrong while updating details');
      }
    });
  }
  loadEmployeeOtherDetailsData(pk_empid: string) {
    this.employeeMasterService.getById_employeeOtherDetails(pk_empid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          console.log("Fetched EmployeeOtherDetails Data:", res.data);  // Debugging ke liye

          this.EmployeeForm.patchValue({
            pk_empid: this.pk_empid,
            pf_app: res.data.pf_app,
            esi_app: res.data.esi_app,
            pffixedamount: res.data.pffixedamount,
            lwfapplicable: res.data.lwfapplicable ?? false,
            pfno: res.data.pfno,
            inESICycle: res.data.inESICycle,
            proftax_app: res.data.proftax_app,
            volpf_app: res.data.volpf_app,
            esino: res.data.esino,
            volpfTypeAmt: res.data.volpfTypeAmt,
            isreverse: res.data.isreverse,
            pfmaxlimit_app: res.data.pfmaxlimit_app,
            volpfType: res.data.volpfType,
            empcode: res.data.empcode,
            empname: res.data.empname,
            uanNo: res.data.uanNo,
            policy_app: res.data.policy_app,
            policyNo: res.data.policyNo,
            policyAmount: res.data.policy_amount,     // name fixed
            policyDate: res.data.policyDate ? res.data.policyDate.split('T')[0] : null,
            tillValid: res.data.policyTillValid ? res.data.policyTillValid.split('T')[0] : null,
            esiZone: res.data.esiZone || '',
            NomineeName: res.data.nomineeName || res.data.NomineeName || '',
            NomineeRelation: res.data.nomineeRelation || res.data.NomineeRelation || '',
            NomineeMobileNo: res.data.nomineeMobileNo || res.data.NomineeMobileNo || ''
          });
          this.oldPic = res.data.policyImagePath || '';
          this.picFileName = res.data.policyImagePath;
          if (this.picFileName) {
            this.service.getImage(this.picFileName).subscribe({

              next: (blob) => {
                this.picImageUrl = URL.createObjectURL(blob);
              },
              error: (err) => {
                console.error('Failed to load image:', err);
                this.picImageUrl = '';
              }
            });
          }

          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load EmployeeOtherDetails details.");
        }
      },
      error: () => {
        this.toastrService.error("Error loading EmployeeOtherDetails data.");
      }
    });
  }


  resetForm(): void {
    this.EmployeeForm.reset();
  }
  goToAttendance() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`]);

    } else {
      alert('Please complete Employee Master first');
    }
  }
  goToEmployeeMst() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`]);
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToOtherDetails() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`]);
      //alert('Please complete Employee Attendance first');

    } else {
      alert('Please complete Employee Shift Details first');
    }
  }
  goTohead() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`]);
      // alert('Please complete Employee Other Details first');

    } else {
      alert('Please complete Compliance Details first');
    }
  }

  goToDemographic() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${encryptedId}`], {
        queryParams: { from: 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToQualification() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
        queryParams: { from: 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToExperience() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
        queryParams: { from: 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }
}

