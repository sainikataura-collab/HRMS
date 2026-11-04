
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GeneralService } from '../../../../payroll/services/general.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-insert',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgSelectModule],
  templateUrl: './insert.component.html',
  styleUrl: './insert.component.scss'
})
export class InsertComponent implements OnInit {
  insertForm!: FormGroup;
  codeTypeId: string = '';
  submitted = false
  codeType: string = '';
  isCodeRequired: boolean = false;
  codeId: string = '';
  CompanyList: any[] = [];
  OrganizationId: string = '';
  codeTypeByName: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private generalService: GeneralService,
    private router: Router,
    private toastr: ToastrService

  ) { }


  ngOnInit(): void {
    this.codeId = this.route.snapshot.paramMap.get('id') || ''; // Get codeId (if editing)

    this.route.queryParams.subscribe(params => {
      this.codeTypeId = params['codeTypeId'] || ''; // Get codeTypeId
      this.codeType = params['codeType'] || ''; // Get codeType
      this.isCodeRequired = params['isCodeRequired'] === 'true'; // Get isCodeRequired
    });


    if (this.codeId) {
      this.getGeneralById()
    }
    this.initializeForm();
    // this.LoadOrganizationList();

  }


  // LoadOrganizationList(): void {
  //   this.generalService.getDdlList('Organization').subscribe(res => {
  //     if (res?.isSuccess) {
  //       this.CompanyList = res.data;
  //     }
  //   });
  // }


  onNameBlur(): void {
    const name = this.insertForm.get('name')?.value;
    if (name) {
      this.CheckDuplicateValue(name);
    }
  }

  // CheckDuplicateValue(codeDescription: string): void {
  //   const Description  = 'codeDescription';
  //   const codeTypeId = this.codeTypeId;
  //   const codeId = this.codeId || '';

  //   this.generalService.CheckDuplicateValueGeneral(Description , codeTypeId, codeId).subscribe({
  //     next: (response) => {
  //       const control = this.insertForm.get('codeDescription');
  //       if (response && response.isSuccess === false) {
  //         control?.setErrors({ duplicate: response.message });
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Duplicate Check API Error:', err);
  //       this.insertForm.get('codeDescription')?.setErrors({ duplicate: 'Error checking userName availability.' });
  //     }
  //   });
  // }


  CheckDuplicateValue(name: string): void {
    const codeTypeId = this.codeTypeId;
    const codeId = this.codeId || '';

    this.generalService.CheckDuplicateValueGeneral(name, codeTypeId, codeId).subscribe({
      next: (response) => {
        const control = this.insertForm.get('name');
        if (response && response.isSuccess === false) {
          control?.setErrors({ duplicate: response.message });
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.insertForm.get('name')?.setErrors({ duplicate: 'Error checking name availability.' });
      }
    });
  }

  getGeneralById() {

    this.generalService.generalGetby(this.codeId, this.codeTypeId,).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // this.insertForm.patchValue({ ...res.data });
          this.insertForm.patchValue({
            codeTypeId: res.data.codeTypeId,
            codeId: res.data.codeId,
            name: res.data.name,
            code: res.data.code,
            codeDescription: res.data.codeDescription,
            isActive: res.data.isActive
          });
          this.isCodeRequired = res.data.isCodeRequired;
          if (this.isCodeRequired) {
            this.insertForm.get('code')?.setValidators([Validators.required]);
          } else {
            this.insertForm.get('code')?.clearValidators();
          }
          this.insertForm.get('code')?.updateValueAndValidity();
        }
      }
    })
  }

  initializeForm(): void {
    this.insertForm = this.fb.group({
      codeTypeId: [this.codeTypeId], // Hidden field
      codeId: [''], // Default hidden
      name: ['', Validators.required], // Textbox
      code: [''], // Textbox
      codeDescription: [''], // Textbox
      isActive: [true] // Checkbox
    });

    if (this.isCodeRequired) {
      this.insertForm.get('code')?.setValidators([Validators.required]);
    } else {
      this.insertForm.get('code')?.clearValidators();
    }
    this.insertForm.get('code')?.updateValueAndValidity();
  }



  get validate() {
    return this.insertForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.insertForm.invalid) {
      return;
    }
    this.submitForm();
  }

  submitForm() {

    const formData = this.insertForm.value;
    if (this.codeId) {
      this.generalService.generalupdate(formData, this.codeId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success(response.message);
            this.router.navigate(['dash/user/userdashboard/general/list/', this.codeTypeId], { queryParams: { codeType: this.codeType } });
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.message);
        }
      });
    } else {
      this.generalService.generalPost(formData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastr.success(response.message);
            this.router.navigate(['dash/user/userdashboard/general/list/', this.codeTypeId], { queryParams: { codeType: this.codeType } });
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => {
          this.toastr.error(err.message);
        }
      });
    }
  }
}
