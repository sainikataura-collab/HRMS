import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';

import { forEach } from 'mathjs';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { formatDateForInput } from '../../../../healpers/commonlib';
import { EmployeeFactBoxComponent } from '../shared/employee-fact-box/employee-fact-box.component';

@Component({
  selector: 'app-employee-head',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectComponent, CommonModule, FormsModule, RouterLink, EmployeeFactBoxComponent],
  templateUrl: './employee-head.component.html',
  styleUrl: './employee-head.component.scss'
})
export class EmployeeHeadComponent {
  isFactBoxOpen: boolean = true;
  @ViewChild(EmployeeFactBoxComponent) factBox?: EmployeeFactBoxComponent;

  toggleFactBox(): void {
    this.isFactBoxOpen = !this.isFactBoxOpen;
  }

  currentStep: number = 4;

  glposting = [
    { name: '--Select GL Posting--', value: '' },
    { name: "Indirect", value: "I" },
    { name: "Direct", value: "D" },
    { name: "SGA ", value: "S" },
  ];
  goToStep(step: number, route: string): void {
    this.currentStep = step;
    this.router.navigate([route]);
  }

  ngxUILoaderService = inject(NgxUiLoaderService);
  EmployeeForm!: FormGroup;
  Location: { label: string, value: string }[] = [];
  Grade: { label: string, value: string }[] = [];
  headList = new FormArray<FormGroup>([]);
  head1List = new FormArray<FormGroup>([]); // 🛑 Type defined
  head2List = new FormArray<FormGroup>([]);

  RetentionFrequency = [
    { name: '--Select RetentionFrequency--', value: '' },
    { "name": "Quaterly", "value": "1" },
    { "name": "Half Yearly", "value": "2" },
    { "name": "Annually", "value": "3" },
  ];



  showError = false;
  showErrorhead = false;
  submitted = false;
  pk_empid!: string;
  Isedit = false;
  fromSource: string = '';
  headForm!: FormGroup;

  constructor(private fb: FormBuilder, private employeeMasterService: EmployeeMasterService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, public encryptionService: EncryptionService) { }

  ngOnInit() {
    this.initializeForms();
    this.getHeadList();
    this.splitHeadList();
    this.splitHeadList();

    this.getLocationList('Location')
    this.getGradeList('Grade')

    // this.pk_empid = this.encryptionService.decryptText(this.route.snapshot.params['pk_empid']);

    // this.EmployeeForm.patchValue({ pk_empid: this.pk_empid });

    // if (this.pk_empid && this.pk_empid !== 'undefined') {
    //   this.loadEmployeeheadData(this.pk_empid);
    //   this.Isedit = true; 
    // }

    this.fromSource = this.route.snapshot.queryParamMap.get('from') || '';

    this.route.paramMap.subscribe(params => {
      const encryptedId = params.get('pk_empid');
      if (encryptedId) {
        this.pk_empid = this.encryptionService.decryptText(encryptedId);
        this.EmployeeForm.patchValue({ pk_empid: this.pk_empid });

        if (this.pk_empid && this.pk_empid !== 'undefined') {
          this.loadEmployeeheadData(this.pk_empid);
          this.Isedit = true;
        }
      }
    });

    console.log("empidss", this.pk_empid)

  }
  initializeForms() {
    this.EmployeeForm = this.fb.group({
      ctc: [''],
      VariableCTCAmount: [''],
      amount: [''],
      empcode: [''],
      empname: ['']
    });

    this.headForm = this.fb.group({
      basedon: [''],
      locid: ['', Validators.required],
      amount: [null, Validators.required],
      FixedIncomeTax: [0],
      fkGradeId: ['', Validators.required],
      ESOPS: [''],
      JoiningBonus: [''],
      RetentionBonus: [''],
      glposting: [''],
      RetentionFrequency: [''],
      earningHeads: this.fb.array([]),
      deductionHeads: this.fb.array([]),


    });

    this.head1List = this.headForm.get('earningHeads') as FormArray;
    this.head2List = this.headForm.get('deductionHeads') as FormArray;

  }
  getLocationList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Location = res.data.map((fk_locid: any) => ({
            name: fk_locid.name,
            value: fk_locid.value
          }));
        } else {
          this.toastrService.error("Failed to load Location list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Location list.");
      }
    });
  }

  getGradeList(fieldName: string) {
    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Grade = res.data.map((pk_classid: any) => ({
            name: pk_classid.name,
            value: pk_classid.value
          }));
        } else {
          this.toastrService.error("Failed to load Grade list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Grade list.");
      }
    });
  }

  get earningHeads(): FormArray {
    return this.headForm.get('earningHeads') as FormArray;
  }

  get deductionHeads(): FormArray {
    return this.headForm.get('deductionHeads') as FormArray;
  }


  restrictInputDecimal(event: KeyboardEvent) {
    const pattern = /^[0-9to.]$/;
    const inputChar = event.key;

    if (!pattern.test(inputChar)) {
      event.preventDefault(); // Prevent invalid characters from being typed
    }
  }
  splitHeadList() {

    this.head1List = new FormArray(
      this.headList.controls.filter((item) => item.get('type')?.value === 'earning')
    );

    this.head2List = new FormArray(
      this.headList.controls.filter((item) => item.get('type')?.value === 'deduction')
    );

  }



  getHeadList() {
    this.submitted = true;
    if (this.headForm.invalid) {
      this.showErrorhead = true;
      return;
    }

    const data = { ...this.headForm.value, fk_empId: this.pk_empid };

    this.earningHeads.clear();
    this.deductionHeads.clear();

    this.employeeMasterService.add_employeeHead(data).subscribe((response: any) => {
      if (response.statusCode === 200) {
        const head1List: any[] = response.data.head1 || [];
        const head2List: any[] = response.data.head2 || [];

        head1List.forEach((item: any) => {
          const group = this.fb.group({
            fk_headid: item.pkHeadId,
            shortDesc: item.shortDesc,
            amount: item.amount,
            effectDate: formatDateForInput(item.effectDate),
            type: 'earning'
          });
          this.earningHeads.push(group);
        });

        head2List.forEach((item: any) => {
          const group = this.fb.group({
            fk_headid: item.pkHeadId,
            shortDesc: item.shortDesc,
            amount: item.amount,
            effectDate: formatDateForInput(item.effectDate),
            type: 'deduction'
          });
          this.deductionHeads.push(group);
        });
      }
    });
  }
  get totalEarningCount(): number {
    let total = 0;

    this.headForm.get('earningHeads')?.value.forEach((item: any) => {
      total += Number.parseFloat(item.amount);
    });

    return total || 0;
  }

  get totalDeductionCount(): number {

    let total = 0;

    this.headForm.get('deductionHeads')?.value.forEach((item: any) => {
      total += Number.parseFloat(item.amount);
    });

    return total || 0;
  }


  onSubmit(): void {
    if (this.EmployeeForm.invalid || this.headForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      this.showError = true;
      this.showErrorhead = true;
      console.log('Form is invalid!');
      return;
    }

    const earningHeadControls = this.earningHeads.controls;
    const deductionHeadControls = this.deductionHeads.controls;

    const employeehead = [...earningHeadControls, ...deductionHeadControls]
      .map((control: AbstractControl) => {
        const val = control.value;

        return {
          fk_empid: this.pk_empid,
          fk_headid: val.fk_headid,
          amount: Number(val.amount),
          effectdate: val.effectDate
        };
      })

    const payload = {
      employeehead,
      employeeHeadMst: {
        pk_empid: this.pk_empid,
        amount: Number(this.headForm.value.amount),
        ctc: Number(this.headForm.value.amount),
        variableCTCAmount: Number(this.headForm.value.amount),
        basedon: this.headForm.value.basedon,
        locId: this.headForm.value.locid,
        fkGradeId: this.headForm.value.fkGradeId,
        joiningBonus: Number(this.headForm.value.JoiningBonus),
        retentionBonus: Number(this.headForm.value.RetentionBonus),
        esops: Number(this.headForm.value.ESOPS),
        retentionFrequency: this.headForm.value.RetentionFrequency,
        glposting: this.headForm.value.glposting,
        FixedIncomeTax: this.headForm.value.FixedIncomeTax || 0

      }
    };

    console.log('Payload Sent:', payload);

    this.employeeMasterService.update_employeeHeadDetails(payload).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.toastrService.success('Employee Head updated successfully!', 'Success');
          if (this.factBox) {
            this.factBox.refresh();
          }
          // this.router.navigateByUrl("/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list");
        } else {
          this.toastrService.error(res?.message || 'Update Failed', 'Error');
        }
      },
      error: (err) => {
        this.toastrService.error(err?.error?.message || 'Failed to update employee attendance', 'Error');
      }
    });
  }

  loadEmployeeheadData(pk_empid: string) {
    this.employeeMasterService.getById_employeeHeadDetails(pk_empid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data;
          // Patch EmployeeForm values
          this.EmployeeForm.patchValue({
            ctc: data.employeeHeadMst?.ctc || '0',
            amount: data.employeeHeadMst?.ctc || '0',
            VariableCTCAmount: data.employeeHeadMst?.variableCTCAmount || '0',
            empcode: data.employeeHeadMst?.empcode || '',
            empname: data.employeeHeadMst?.empname || ''
          });

          // Patch headForm values
          this.headForm.patchValue({
            basedon: data.employeeHeadMst?.basedon || '',
            locid: data.employeeHeadMst?.fk_locid || '',
            amount: data.employeeHeadMst?.ctc || '',
            fkGradeId: data.employeeHeadMst?.fk_classid || '',
            ESOPS: data.employeeHeadMst?.esops || '',
            JoiningBonus: data.employeeHeadMst?.joiningBonus || '',
            RetentionBonus: data.employeeHeadMst?.retentionBonus || '',
            RetentionFrequency: data.employeeHeadMst?.retentionFrequency || '',
            glposting: data.employeeHeadMst?.glposting || '',
            FixedIncomeTax: data.employeeHeadMst?.fixedIncomeTax || 0

          });

          this.earningHeads.clear();
          this.deductionHeads.clear();



          const formatDate = (dateStr: string | null | undefined): string => {
            if (!dateStr || dateStr.startsWith('1900-01-01')) return '';

            const date = new Date(dateStr);

            // Convert to local date to prevent 1-day shift
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            return `${year}-${month}-${day}`;
          };


          // Patch earning heads
          (data.earning || []).forEach((item: any) => {
            const group = new FormGroup({
              fk_headid: new FormControl(item.pk_headid),
              shortDesc: new FormControl(item.shortDesc),
              amount: new FormControl(item.amount),
              effectDate: new FormControl(formatDateForInput(item.effectdate)),
              type: new FormControl('earning')

            });

            this.earningHeads.push(group);
          });

          // Patch deduction heads
          (data.deduction || []).forEach((item: any) => {
            const group = new FormGroup({
              fk_headid: new FormControl(item.pk_headid),
              shortDesc: new FormControl(item.shortDesc),
              amount: new FormControl(item.amount),
              effectDate: new FormControl(formatDateForInput(item.effectdate)),
              type: new FormControl('deduction')
            });

            this.deductionHeads.push(group);
          });
        } else {
          this.toastrService.error('Failed to load employee head data.');
        }
      },
      error: (err) => {
        this.toastrService.error(err?.message || 'Error fetching data.');
      }
    });
  }



  resetForm(): void {
    this.EmployeeForm.reset();
  }
  clearForm(): void {
    this.headForm.reset();
  }
  // goToAttendance() {
  //   if (this.pk_empid) {
  //     this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeAttendance/${this.pk_empid}`]);

  //   } else {
  //     alert('Please complete Employee Master first');
  //   }
  // }

  // goToAttendance() {
  //   if (this.pk_empid) {
  //     const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
  //     this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeAttendance/${encryptedId}`]);
  //   } else {
  //     alert('Please complete Employee Master first');
  //   }
  // }

  // goToEmployeeMst() {

  //   if (this.pk_empid) {
  //     const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
  //     this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeMst/${encryptedId}`]);
  //   } else {
  //     alert('Please complete Employee Master first');
  //   }
  // }

  // goToOtherDetails() {
  //   if (this.pk_empid) {
  //     const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

  //     this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeOtherDetails/${encryptedId}`]);

  //   } else {
  //     alert('Please complete Employee Master first');
  //   }
  // }
  // goTohead() {
  //   if (this.pk_empid) {
  //     const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
  //     this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeHead/${encryptedId}`]);

  //   } else {
  //     alert('Please complete Employee Master first');
  //   }
  // }

  //       goToAttendance() {
  //         if (this.pk_empid) {
  //           const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

  //           this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeAttendance/${encryptedId}`]);

  //         } else {
  //           alert('Please complete Employee Master first');
  //         }
  //       }
  //       goToEmployeeMst() {
  //         if (this.pk_empid) {
  //           const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

  //           this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeMst/${encryptedId}`]);
  //         } else {
  //           alert('Please complete Employee Master first');
  //         }
  //       }

  //       goToOtherDetails() {
  //         if (this.pk_empid) {
  //           const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();

  // this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeOtherDetails/${encryptedId}`]);
  // //alert('Please complete Employee Attendance first');

  //         } else {
  //           alert('Please complete Employee Master first');
  //         }
  //       }
  //       goTohead() {
  //         if (this.pk_empid) {
  //           const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
  //           this.router.navigate([`/dash/payroll/payrolldashboard/EmployeeHead/${encryptedId}`]);
  //          // alert('Please complete Employee Other Details first');

  //         } else {
  //           alert('Please complete Employee Master first');
  //         }
  //       }

  goToAttendance() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeAttendance/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToEmployeeMst() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeMst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToOtherDetails() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeOtherDetails/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Shift Details first');
    }
  }

  goTohead() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/EmployeeHead/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Compliance Details first');
    }
  }

  goToDemographic() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToQualification() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  goToExperience() {
    if (this.pk_empid) {
      const encryptedId = this.encryptionService.encryptText(this.pk_empid).toString();
      this.router.navigate([`/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details/${encryptedId}`], {
        queryParams: { from: this.fromSource || 'employee_list', isEmp: 'true' }
      });
    } else {
      alert('Please complete Employee Master first');
    }
  }

  onBack() {
    if (this.fromSource === 'demographic_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/DemographicDetails_list']);
    } else if (this.fromSource === 'qualification_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/HR_EmployeeQualification_Mst_list']);
    } else if (this.fromSource === 'experience_list') {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/SAL_EmployeePreviousJob_Details_list']);
    } else {
      this.router.navigate(['/dash/adminEmployeeManagement/adminEmployeeManagementdashboard/Employee_list']);
    }
  }

}





