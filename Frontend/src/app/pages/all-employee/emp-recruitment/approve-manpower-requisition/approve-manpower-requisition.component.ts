import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ManpowerRequisitionService } from '../Service/manpower-requisition.service';
import { ApproveManpowerRequisitionService } from '../Service/approve-manpower-requisition.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';


@Component({
  selector: 'app-approve-manpower-requisition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './approve-manpower-requisition.component.html',
  styleUrl: './approve-manpower-requisition.component.scss',
})
export class ApproveManpowerRequisitionComponent implements OnInit {
  ManpowerForm!: FormGroup;
  pk_reqid: number = 0;
  submitted = false;
  isLoading = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  Department: { name: string; value: string }[] = [];
  Location: { name: string; value: string }[] = [];
  Designation: { name: string; value: string }[] = [];
  Grade: { name: string; value: string }[] = [];
  Cost: { name: string; value: string }[] = [];
  Employee: { name: string; value: string }[] = [];
  Qualification: { name: string; value: string }[] = [];
  Specialization: { name: string; value: string }[] = [];
  toastrService: any;
  manpowerData: any = {}; // 👈 full data yahan rakhenge

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private manpowerService: ManpowerRequisitionService,
    private approvalService: ApproveManpowerRequisitionService,
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
    this.initForm();
debugger
    // this.pk_reqid = Number((this.route.snapshot.paramMap.get('pk_ReqId')));
    // if (this.pk_reqid) {
    //   this.getManpowerDetails(this.pk_reqid);
    // }

     this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_ReqId');
      if (id) {
        this.pk_reqid = +this.encryptionService.decryptText(id);
        
        this.getManpowerDetails(this.pk_reqid);
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
    
    this.loadAllDropdowns().then(() => {
      this.getManpowerDetails(this.pk_reqid);
    });

    this.ManpowerForm.get('Reason_of_Requirement')?.valueChanges.subscribe(
      (value) => {
        const replacementControl = this.ManpowerForm.get(
          'Reason_of_Replacement'
        );

        if (value === 'Replacement') {
          replacementControl?.enable();
          if (!replacementControl?.value) {
            replacementControl?.setValue('Transfer'); // 👈 Default value if not set
          }
          replacementControl?.setValidators([Validators.required]);
        } else {
          replacementControl?.setValue('Transfer'); // 👈 Keep value but disable it
          replacementControl?.disable();
          replacementControl?.clearValidators();
        }

        replacementControl?.updateValueAndValidity();
      }
    );
  }

  initForm(): void {
    this.ManpowerForm = this.fb.group({
      pk_reqid: [{ value: 0, disabled: true }],
      dated: [{ value: '', disabled: true }],
      fk_locid: [{ value: '', disabled: true }],
      fk_deptid: [{ value: '', disabled: true }],
      fk_desgid: [{ value: '', disabled: true }],
      fk_classid: [{ value: '', disabled: true }],
      jobtitle: [{ value: '', disabled: true }],
      No_of_post: [{ value: '', disabled: true }],
      fk_costcentreid: [{ value: '', disabled: true }],
      Reason_of_Requirement: [{ value: 'Replacement', disabled: true }],
      Reason_of_Replacement: [{ value: '', disabled: true }],
      Justification_of_Position: [{ value: '', disabled: true }],
      Position_Reports_To: [{ value: '', disabled: true }],
      fk_qualiId: [{ value: [], disabled: true }],
      fk_specializationId: [{ value: [], disabled: true }],
      Experience_From: [{ value: '', disabled: true }],
      Experience_To: [{ value: '', disabled: true }],
      CTC_From: [{ value: '', disabled: true }],
      CTC_To: [{ value: '', disabled: true }],
      Roles_Responsibilities: [{ value: '', disabled: true }],
      Technical_Skills: [{ value: '', disabled: true }],
      Behavioral_Skills: [{ value: '', disabled: true }],
      Additional_Qualities: [{ value: '', disabled: true }],

      // ✅ These remain enabled
      pk_reqtrnid: [0],
      fk_reqid: [0],
      fk_empId: [null],
      approvelOrder: ['', Validators.required],
      remarks: [null, Validators.required],
      isActive: ['true'],
    });
  }

  loadAllDropdowns(): Promise<void> {
    const dropdownFields = [
      { method: 'getDesignationList', name: 'Designation' },
      { method: 'getLocationList', name: 'Location' },
      { method: 'getDepartmentList', name: 'Department' },
      { method: 'getGradeList', name: 'Grade' },
      { method: 'getCostList', name: 'CostCenter' },
      { method: 'getEmployeeList', name: 'Employee' },
      { method: 'getQualificationList', name: 'Qualification' },
      { method: 'getSpecializationList', name: 'Specialization' },
    ];

    const promises = dropdownFields.map((field) => {
      return new Promise<void>((resolve) => {
        (this as any)[field.method](field.name, resolve);
      });
    });

    return Promise.all(promises).then(() => {});
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

  getManpowerDetails(id: number): void {
    debugger
    this.isLoading = true;

    this.manpowerService.getManpowerById(id).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const data = res.data.manpowerMst;
          const qualificationList = res.data.manpowerQualification || [];
          const specializationList = res.data.manpowerSpecialization || [];

          this.manpowerData = data; // ✅ Store for later use

          this.ManpowerForm.patchValue({
            pk_reqid: data.pk_reqid,
            dated: this.formatDateForInput(data.dated),
            fk_locid: data.fk_locid?.toString(),
            fk_deptid: data.fk_deptid?.toString(),
            fk_desgid: data.fk_desgid?.toString(),
            fk_classid: data.fk_classid?.toString(),
            jobtitle: data.jobtitle,
            No_of_post: data.no_of_post,
            fk_costcentreid: data.fk_costcentreid?.toString(),
            Reason_of_Requirement: data.reason_of_Requirement,
            Reason_of_Replacement: data.reason_of_Replacement,
            Justification_of_Position: data.justification_of_Position,
            Position_Reports_To: data.position_Reports_To?.toString(),
            fk_qualiId: qualificationList.map((q: any) =>
              q.fk_qualiId.toString()
            ),
            fk_specializationId: specializationList.map((s: any) =>
              s.fk_specializationId.toString()
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

          // 🔁 Toggle Reason_of_Replacement field
          const replacementControl = this.ManpowerForm.get(
            'Reason_of_Replacement'
          );
          if (data.reason_of_Requirement === 'Replacement') {
            replacementControl?.enable();
          } else {
            replacementControl?.disable();
          }
        } else {
          this.toastr.error(
            res.message || 'Failed to load requisition details'
          );
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading requisition:', err);
        this.toastr.error('Error loading requisition');
        this.isLoading = false;
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

  // Helper methods
  getDepartmentName(id: string): string {
    const item = this.Department.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getLocationName(id: string): string {
    const item = this.Location.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getDesignationName(id: string): string {
    const item = this.Designation.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getGradeName(id: string): string {
    const item = this.Grade.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getCostCentreName(id: string): string {
    const item = this.Cost.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getEmployeeName(id: string): string {
    const item = this.Employee.find((x) => x.value === id);
    return item ? item.name : '';
  }

  getQualificationNames(ids: string[]): string {
    return this.Qualification.filter((x) => ids.includes(x.value))
      .map((x) => x.name)
      .join(', ');
  }

  getSpecializationNames(ids: string[]): string {
    return this.Specialization.filter((x) => ids.includes(x.value))
      .map((x) => x.name)
      .join(', ');
  }

  getReasonName(val: string): string {
    const item = this.ReasonofRequirement.find((x) => x.value === val);
    return item ? item.name : '';
  }

  getReplacementReason(val: string): string {
    const item = this.reasonOfReplacementList.find((x) => x.value === val);
    return item ? item.name : '';
  }

  updateApprove(): void {
    if (this.ManpowerForm.invalid) {
      this.submitted = true;
      return;
    }
    const isConfirmed = window.confirm(
      'Are you sure you want to approve this request?'
    );
    if (!isConfirmed) {
      return;
    }

    const values = this.ManpowerForm.getRawValue();

    const payload = {
      jobRequisitionApproval: [
        {
          //pk_reqtrnid: values.pk_reqtrnid,
          fk_reqid: this.manpowerData.pk_reqid,
          fk_empId: this.manpowerData.fk_empid,
          // dated: this.manpowerData.dated,
          approvelOrder: +values.approvelOrder, // convert to number if needed
          remarks: values.remarks,
        },
      ],
    };

    this.approvalService.insertManpowerApproval(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(
            res.message || 'Approval submitted successfully.'
          );
          this.router.navigate([
            '/dash/emp-recruitment/emp-recruitmentdashboard/ApproveManpowerRequisitionList',
          ]);
        } else {
          this.toastr.error(res.message || 'Approval submission failed.');
        }
      },
      error: (err) => {
        console.error('Approval error:', err);
        this.toastr.error('Something went wrong while submitting approval.');
      },
    });
  }

  goBack(): void {
    this.router.navigate([
      '/dash/emp-recruitment/emp-recruitmentdashboard/ManpowerApprovalList',
    ]);
  }
}
