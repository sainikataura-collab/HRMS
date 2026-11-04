import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ManpowerRequisitionService } from '../Service/manpower-requisition.service';

@Component({
  selector: 'app-manpower-requisition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './manpower-requisition.component.html',
  styleUrl: './manpower-requisition.component.scss',
})
export class ManpowerRequisitionComponent {
  ManpowerForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  pk_ReqId: number = 0; // ✅ Make it a number type
  pk_reqid: number = 0; // ✅ Make it a number type

  Department: { label: string; value: string }[] = [];
  Designation: { name: string; value: string }[] = [];
  Location: { label: string; value: string }[] = [];
  Grade: { name: string; value: string }[] = [];
  Cost: { name: string; value: string }[] = [];
  Employee: { name: string; value: string }[] = [];

  Qualification: { name: string; value: string }[] = [];
  Specialization: { name: string; value: string }[] = [];
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private manpowerService: ManpowerRequisitionService,
    private encryptionService: EncryptionService
  ) {}

  ReasonofRequirement = [
    { name: 'Replacement', value: 'Replacement' },
    { name: 'New Position', value: 'New Position' },
  ];

  reasonOfReplacementList = [
    { name: 'Transfer', value: 'Transfer' },
    { name: 'Resignation', value: 'Resignation' },
    { name: 'Termination', value: 'Termination' },
  ];

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_ReqId');
      if (id) {
        this.pk_ReqId = +this.encryptionService.decryptText(id);
        this.isEditMode = true;
        this.getRequisitionById(this.pk_ReqId);
      }
    });

    this.getDesignationList('Designation');
    this.getLocationList('Location');
    this.getDepartmentList('Department');
    this.getGradeList('Grade');
    this.getCostList('CostCenter');
    this.getEmployeeList('Employee');
    this.getQualificationList('Qualification'); // 👈 For Comm_Qualification_SelForddl
    this.getSpecializationList('Specialization');

    this.ManpowerForm.get('Reason_of_Requirement')?.valueChanges.subscribe(
      (value) => {
        const replacementControl = this.ManpowerForm.get(
          'Reason_of_Replacement'
        );

        if (value === 'Replacement') {
          replacementControl?.enable();
          if (!replacementControl?.value) {
            replacementControl?.setValue(''); // 👈 Default value if not set
          }
          replacementControl?.setValidators([Validators.required]);
        } else {
          replacementControl?.setValue(''); // 👈 Keep value but disable it
          replacementControl?.disable();
          replacementControl?.clearValidators();
        }

        replacementControl?.updateValueAndValidity();
      }
    );
  }

  initializeForm(): void {
    this.ManpowerForm = this.fb.group({
      pk_reqid: [0], // ✅ Initialize as 0 for new requisitions
      dated: [''],
      fk_locid: ['', Validators.required],
      fk_deptid: ['', Validators.required],
      fk_desgid: ['', Validators.required],
      fk_classid: ['', Validators.required],
      jobtitle: ['', Validators.required],
      No_of_post: ['', Validators.required],
      fk_costcentreid: ['', Validators.required],
      Reason_of_Requirement: ['', Validators.required],
      Reason_of_Replacement: [{ value: 'Transfer', disabled: true }],
      Justification_of_Position: [''],
      Position_Reports_To: [''],
      fk_qualiId: [[]],
      fk_specializationId: [[]],
      Experience_From: ['', Validators.required],
      Experience_To: ['', Validators.required],
      CTC_From: ['', Validators.required],
      CTC_To: ['', Validators.required],
      Roles_Responsibilities: ['', Validators.required],
      Technical_Skills: [''],
      Behavioral_Skills: [''],
      Additional_Qualities: [''],

      // ✅ Required fields for dropdowns
      //  Reason_of_Requirement: ['Replacement', Validators.required],
      //  Reason_of_Replacement: [{ value: 'Transfer', disabled: true }],
    });
  }

  getDesignationList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Designation = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Designation list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Designation list:', err);
        this.toastrService.error('Error fetching Designation list.');
      },
    });
  }

  getLocationList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Location = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Location list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Location list:', err);
        this.toastrService.error('Error fetching Location list.');
      },
    });
  }

  getDepartmentList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Department = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Department list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Department list:', err);
        this.toastrService.error('Error fetching Department list.');
      },
    });
  }

  getGradeList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Grade = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Grade list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Grade list:', err);
        this.toastrService.error('Error fetching Grade list.');
      },
    });
  }

  getCostList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Cost = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Cost Center list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Cost Center list:', err);
        this.toastrService.error('Error fetching Cost Center list.');
      },
    });
  }

  getEmployeeList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Employee = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Employee list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Employee list:', err);
        this.toastrService.error('Error fetching Employee list.');
      },
    });
  }

  getQualificationList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Qualification = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Qualification list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Qualification list:', err);
        this.toastrService.error('Error fetching Qualification list.');
      },
    });
  }

  getSpecializationList(fieldName: string) {
    this.manpowerService.getDropdownData(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Specialization = res.data.map((item: any) => ({
            name: item.name,
            value: item.value,
          }));
        } else {
          this.toastrService.error('Failed to load Specialization list.');
        }
      },
      error: (err) => {
        console.error('Error fetching Specialization list:', err);
        this.toastrService.error('Error fetching Specialization list.');
      },
    });
  }

  getRequisitionById(id: number): void {
    this.manpowerService.getManpowerById(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data.manpowerMst;
          const qualificationList = res.data.manpowerQualification || [];
          const specializationList = res.data.manpowerSpecialization || [];

          this.ManpowerForm.patchValue({
            pk_reqid: data.pk_reqid,
            dated: this.formatDateForInput(data.dated),
            fk_locid: data.fk_locid,
            fk_deptid: data.fk_deptid,
            fk_desgid: data.fk_desgid,
            fk_classid: data.fk_classid,
            jobtitle: data.jobtitle,
            No_of_post: data.no_of_post,
            fk_costcentreid:
              data.fk_costcentreid != null
                ? data.fk_costcentreid.toString()
                : null,
            Reason_of_Requirement: data.reason_of_Requirement,
            Reason_of_Replacement: data.reason_of_Replacement,
            Justification_of_Position: data.justification_of_Position,
            Position_Reports_To: data.position_Reports_To,
            fk_qualiId: qualificationList.map((q: any) => q.fk_qualiId),
            fk_specializationId: specializationList.map(
              (s: any) => s.fk_specializationId
            ),
            Experience_From: data.experience_From,
            Experience_To: data.experience_To,
            CTC_From: data.ctC_From,
            CTC_To: data.ctC_To,
            Roles_Responsibilities: data.roles_Responsibilities,
            Technical_Skills: data.technical_Skills,
            Behavioral_Skills: data.behavioral_Skills,
            Additional_Qualities: data.additional_Qualities,
          });

          // Handle enabling/disabling replacement dropdown
          const reqType = data.reason_of_Requirement;
          const replacementControl = this.ManpowerForm.get(
            'Reason_of_Replacement'
          );
          if (reqType === 'Replacement') {
            replacementControl?.enable();
          } else {
            replacementControl?.disable();
          }
        } else {
          this.toastrService.error(res.message || 'Failed to load requisition');
        }
      },
      error: (err) => {
        console.error('Error fetching requisition:', err);
        this.toastrService.error('Error fetching requisition');
      },
    });
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    const date = new Date(+year, +month - 1, +day);
    if (isNaN(date.getTime())) return null;

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  //   onSubmit(): void {
  //   this.submitted = true;

  //   if (this.ManpowerForm.invalid) {
  //     this.toastrService.error('Please fill all required fields.');
  //     return;
  //   }

  //   const formData = new FormData();
  //   const values = this.ManpowerForm.value; // ✅ includes disabled fields like Reason_of_Replacement

  //   // for (const key in values) {
  //   //   if (Array.isArray(values[key])) {
  //   //     values[key].forEach((val: string) => formData.append(key, val));
  //   //   } else if (values[key] !== null && values[key] !== undefined) {
  //   //     formData.append(key, values[key]);
  //   //   }
  //   // }

  //   const apiCall = this.isEditMode
  //     ? this.manpowerService.updateManpower(formData)
  //     : this.manpowerService.insertManpower(formData);

  //   apiCall.subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.toastrService.success(res.message || 'Successfully submitted!');
  //         this.router.navigate(['/dash/recruitment/requisition-list']);
  //       } else {
  //         this.toastrService.error(res.message || 'Submission failed');
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Submission error:', err);
  //       this.toastrService.error('Submission failed due to a server error.');
  //     },
  //   });
  // }

  onSubmit(): void {
  
    if (this.ManpowerForm.invalid) {
      this.submitted = true;
      return;
    }
    const values = this.ManpowerForm.getRawValue();
    const pk_reqid = values.pk_reqid; // ✅ use this later

    // ✨ Build manpowerMst object
    const manpowerMst = {
      pk_reqid: values.pk_reqid, // ✅ important for update
      jobtitle: values.jobtitle,
      fk_locid: values.fk_locid,
      fk_deptid: values.fk_deptid,
      fk_desgid: values.fk_desgid,
      fk_classid: values.fk_classid,
      dated: values.dated,
      approvaldate: values.approvaldate,
      no_of_post: values.No_of_post,
      experience_From: values.Experience_From,
      experience_To: values.Experience_To,
      age_From: values.Age_From,
      age_To: values.Age_To,
      ctC_From: values.CTC_From,
      ctC_To: values.CTC_To,
      status: values.status || 'P',
      final_approval: values.final_approval || 0,
      current_approval: values.current_approval || 0,
      remarks: values.Remarks,
      remarks1: values.Remarks1,
      remarks2: values.Remarks2,
      quali: values.quali,
      spacli: values.spacli,
      fk_empid: values.fk_empid,
      cancelDate: values.CancelDate,
      mrfcode: values.Mrfcode,
      fk_costcentreid: values.fk_costcentreid,
      reason_of_Requirement: values.Reason_of_Requirement,
      reason_of_Replacement: values.Reason_of_Replacement,
      justification_of_Position: values.Justification_of_Position,
      position_Reports_To: values.Position_Reports_To,
      roles_Responsibilities: values.Roles_Responsibilities,
      technical_Skills: values.Technical_Skills,
      behavioral_Skills: values.Behavioral_Skills,
      additional_Qualities: values.Additional_Qualities,
      timestamp: values.Timestamp,
    };

    // ✨ Qualification & Specialization
    const manpowerQualification = (values.fk_qualiId || []).map(
      (qualiId: number) => ({
        fk_reqid: values.pk_reqid,
        fk_qualiId: qualiId, // ✅ use the current id
      })
    );

    const manpowerSpecialization = (values.fk_specializationId || []).map(
      (specId: string) => ({
        fk_reqid: values.pk_reqid,
        fk_specializationId: specId, // ✅ use the current id
      })
    );

    // 👇 Final Payload
    const payload = {
      manpowerMst,
      manpowerQualification,
      manpowerSpecialization,
    };

    // 🌐 API Call
    const apiCall = this.isEditMode
      ? this.manpowerService.updateManpower(payload, values.pk_reqid)
      : this.manpowerService.insertManpower(payload);

    apiCall.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'Successfully submitted!');
          this.router.navigate([
            '/dash/emp-recruitment/emp-recruitmentdashboard/ManpowerRequisitionList',
          ]);
        } else {
          this.toastrService.error(res.message || 'Submission failed');
        }
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.toastrService.error('Submission failed due to a server error.');
      },
    });
  }
}
