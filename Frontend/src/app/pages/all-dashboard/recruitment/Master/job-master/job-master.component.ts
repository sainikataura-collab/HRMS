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
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { JobMasterService } from '../../RecruitServices/job-master.service';

@Component({
  selector: 'app-job-master',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule,
    NgxPaginationModule,
  ],
  templateUrl: './job-master.component.html',
  styleUrl: './job-master.component.scss',
})
export class JobMasterComponent {
  JObMaster_details!: FormGroup;
  submitted = false;
  showError = false;
  Isedit = false;
  pk_JobId: string = '';
  isEditMode: boolean = false;


  AppSelectName: File | null = null; 
  AppImageUrl: string = '';
  AppImagePath: string = '';
  Appoldfile: string = '';

  JobSelectName: File | null = null;  
  JobImageUrl: string = '';
  JobImagePath: string = '';
  Joboldfile: string = '';


  
  selectedEmployee: string[] = [];
  selectedSpecialization: string[] = [];
  selectedQualification: string[] = [];
  EmployeeList: { name: string; value: string }[] = [];
  Designation: { label: string; value: string }[] = [];
  Department: { label: string; value: string }[] = [];
  Location: { label: string; value: string }[] = [];
  Cost: { label: string; value: string }[] = [];
  JobRequisition: { label: string; value: string }[] = [];
  Specialization: { name: string; value: string }[] = [];
  Qualification: { name: string; value: string }[] = [];
  selectedSpecIds: string[] = [];
  selectedEmpIds: string[] = [];
  selectedQualiIds: string[] = [];
  router = inject(Router);
  route = inject(ActivatedRoute);

  // Default filter structure
  employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    empStatus: '',
  };

  selects = [
    { name: 'HOD office', value: 'HOD office' },
    { name: 'Admin', value: 'Admin' },
  ];

  pageTypes = [
    { name: '10th', controlName: 'Highschool' },
    { name: '12th', controlName: 'Inter' },
    { name: 'Btech', controlName: 'Btech' },
    { name: 'Other', controlName: 'other' },
  ];

  pageType = [
    { name: 'Training', controlName: 'Training' },
    { name: 'Development', controlName: 'Development' },
    { name: 'Other', controlName: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private jobMasterService: JobMasterService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const pk_JobId = params.get('pk_JobId');
      if (pk_JobId) {
        this.pk_JobId = this.encryptionService.decryptText(pk_JobId);
        this.isEditMode = true;
        this.getJobById(this.pk_JobId);
      }
    });

    this.getEmployees();
    this.getDesignationList('Designation');
    this.getLocationList('Location');
    this.getDepartmentList('Department');
    this.getCostList('CostCenter');
    this.getJobRequisitionList('JobRequisition');
    this.getQualificationList('Qualification');
    this.getSpecializationList('Specialization');
  }

  initializeForm(): void {
    this.JObMaster_details = this.fb.group({
      pk_JobId: [''],
      fk_reqid: [null, Validators.required],
      dated: [''],
      RequisitionBy: [''],
      approvaldate: [''],
      ApprovedBy: [''],
      ForLocation: [''],
      RequisitionRemark: [''],
      Notification_no: ['', Validators.required],
      ApprovalRemark: [''],
      Job_title: ['', Validators.required],
      fk_deptId: ['', Validators.required],
      fk_cost_centre_id: ['', Validators.required],
      fk_desgid: ['', Validators.required],
      fk_locid: ['', Validators.required],
      No_of_post: ['', Validators.required],
      interviewround: ['', Validators.required],
      Job_opening_date: ['', Validators.required],
      Job_closing_date: ['', Validators.required],
      Experience_From: ['', Validators.required],
      Experience_To: ['', Validators.required],
      Age_From: [''],
      Age_To: [''],
      CTC_From: [''],
      CTC_To: [''],
      Application_form_path: [''],
      Job_details_path: [''],
      Remarks: [''],
      job_closed: false,
      forRequirement: [''],
      remarksCaused: [''],
      tatDays: ['', Validators.required],
      jobResponsibilities: [''],
      Appfilepath: [''],
      Jobfilepath: [''],
      fk_qualiId: [[]],
      fk_specializationId: [[]],
      fk_empId: [[]],
      postToNaukri: [false],
      postToIndeed: [false],
    });
  }

  ApponFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.AppSelectName = file;
      this.AppImagePath = '';
      this.AppImageUrl = '';
    }
  }
  JobonFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.JobSelectName = file;
      this.JobImagePath = '';
      this.JobImageUrl = '';
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedEmployee = [];
    } else {
      this.selectedEmployee = this.EmployeeList.map((loc) => loc.value);
    }
    this.JObMaster_details.patchValue({ pk_empid: this.selectedEmployee });
  }
  isAllSelected(): boolean {
    return this.selectedEmployee.length === this.EmployeeList.length;
  }

  getEmployeeDisplayText(): string {
    if (this.isAllSelected()) {
      return 'All Selected';
    } else if (this.selectedEmployee.length === 1) {
      // Sirf ek value select ho tab uska naam dikhana hai
      return (
        this.EmployeeList.find(
          (item) => item.value === this.selectedEmployee[0]
        )?.name || '--Select Locations--'
      );
    } else if (this.selectedEmployee.length > 1) {
      // Multiple values select ho to pehla naam + "..."
      const firstSelected = this.EmployeeList.find(
        (item) => item.value === this.selectedEmployee[0]
      )?.name;
      return firstSelected ? `${firstSelected}...` : '--Select Employee--';
    } else {
      return '--Select Employee--';
    }
  }

  toggleEmployee(EmployeeList: string) {
    if (this.selectedEmployee.includes(EmployeeList)) {
      this.selectedEmployee = this.selectedEmployee.filter(
        (item) => item !== EmployeeList
      );
    } else {
      this.selectedEmployee.push(EmployeeList);
    }
    this.JObMaster_details.patchValue({ pk_empid: this.selectedEmployee });
  }


 
 
 

  toggleQualification(value: string) {
    if (this.selectedQualification.includes(value)) {
      this.selectedQualification = this.selectedQualification.filter(
        (item) => item !== value
      );
    } else {
      this.selectedQualification.push(value);
    }
    this.JObMaster_details.patchValue({
      pk_qualiId: this.selectedQualification,
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

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees();
  }

  getEmployees(): void {
    this.jobMasterService.get_Employees_Ddl(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.EmployeeList = [];
          this.toastrService.error(res.message, 'Error');
        }
      },
      error: (error) => {
        this.EmployeeList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      },
    });
  }
  getQualificationList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Qualification = res.data.map((pk_qualiId: any) => ({
            name: pk_qualiId.name,
            value: pk_qualiId.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }
  getSpecializationList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Specialization = res.data.map((pk_specializationId: any) => ({
            name: pk_specializationId.name,
            value: pk_specializationId.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }

  getDesignationList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Designation = res.data.map((pk_desgid: any) => ({
            name: pk_desgid.name,
            value: pk_desgid.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }
  getLocationList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Location = res.data.map((pk_locid: any) => ({
            name: pk_locid.name,
            value: pk_locid.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }
  getDepartmentList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Department = res.data.map((pk_depid: any) => ({
            name: pk_depid.name,
            value: pk_depid.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }
  getCostList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Cost = res.data.map((pk_cost_centre_id: any) => ({
            name: pk_cost_centre_id.name,
            value: pk_cost_centre_id.value,
          }));
        } else {
          this.toastrService.error('Failed to load HOD list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }
  getJobRequisitionList(fieldName: string) {
    this.jobMasterService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {

          this.JobRequisition = res.data.map((pk_reqid: any) => ({
            name: pk_reqid.name,
            value: pk_reqid.value,
          }));

        } else {
          this.toastrService.error('Failed to load JobRequisition list.');
        }
      },
      error: (err) => {
        console.error('Error fetching HOD list:', err);
        this.toastrService.error('Error fetching level list.');
      },
    });
  }

  getJobById(pk_jobId: string) {
    this.jobMasterService.getJobMasterById(pk_jobId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          const jobMst = response.data.newjobMst;

             // Patch multi-select data
          this.selectedQualiIds = response.data.newjobQualification.map(
            (x: { fk_qualiId: number }) => x.fk_qualiId.toString()
          );
          this.selectedSpecIds = response.data.newjobSpecialization.map(
            (x: { fk_specializationId: string }) => x.fk_specializationId
          );
          this.selectedEmpIds = response.data.newjobInterviewPanel.map(
            (x: { fk_empId: string }) => x.fk_empId
          );

           console.log('selectedQualiIds:', this.selectedQualiIds);
           console.log('selectedSpecIds:', this.selectedSpecIds);
           console.log('selectedEmpIds:', this.selectedEmpIds);

          this.JObMaster_details.patchValue({
            pk_JobId: jobMst.pk_JobId,
            fk_reqid: String(jobMst.fk_reqid),
            Notification_no: jobMst.notification_no,
            Job_title: jobMst.job_title,
            fk_desgid: jobMst.fk_desgid,
            ForLocation: jobMst.forlocation,
            No_of_post: jobMst.no_of_post,
            Job_opening_date: this.formatDateForInput(jobMst.job_opening_date),
            Job_closing_date: this.formatDateForInput(jobMst.job_closing_date),
            Experience_From: jobMst.experience_From,
            Experience_To: jobMst.experience_To,
            Age_From: jobMst.age_From,
            Age_To: jobMst.age_To,
            CTC_From: jobMst.ctC_From,
            CTC_To: jobMst.ctC_To,
            Remarks: jobMst.remarks,
            fk_deptId: jobMst.fk_deptId,
            fk_cost_centre_id: String(jobMst.fk_cost_centre_id),
            job_closed: jobMst.job_closed,
            interviewround: jobMst.interviewround,
            fk_locid: jobMst.fk_locid,
            forRequirement: jobMst.forRequirement,
            remarksCaused: jobMst.remarksCaused,
            tatDays: jobMst.tatDays,
            jobResponsibilities: jobMst.jobResponsibilities,
            Appfilepath: jobMst.application_form_path,
            Jobfilepath: jobMst.job_details_path,
            fk_qualiId: this.selectedQualiIds,
            fk_specializationId: this.selectedSpecIds,
            fk_empId: this.selectedEmpIds,
            postToNaukri: jobMst.postToNaukri || false,
            postToIndeed: jobMst.postToIndeed || false
          });

          this.Appoldfile = jobMst.application_form_path || '';
         this.AppImagePath = jobMst.application_form_path ;
       if (this.AppImagePath) {
        this.jobMasterService.getImage(this.AppImagePath).subscribe({
          
          next: (blob) => {
            this.AppImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load image:', err);
            this.AppImageUrl = '';
          }
        });
      }

       this.Joboldfile = jobMst.job_details_path || '';
         this.JobImagePath = jobMst.job_details_path ;
       if (this.JobImagePath) {
        this.jobMasterService.getImage(this.JobImagePath).subscribe({
          
          next: (blob) => {
            this.JobImageUrl = URL.createObjectURL(blob);
          },
          error: (err) => {
            console.error('Failed to load image:', err);
            this.JobImageUrl = '';
          }
        });
      }
        } else {
          this.toastrService.error(
            response.message || 'Failed to fetch job data'
          );
        }
      },
      (error) => {
        console.error('Error fetching job:', error);
        this.toastrService.error('Error fetching job data');
      }
    );
  }

  toggleAllSelection(event: any) {
    const isChecked = event.target.checked;
    let updatedValues: any = { all: isChecked };

    this.pageTypes.forEach((item) => {
      updatedValues[item.controlName] = isChecked;
    });

    this.JObMaster_details.patchValue(updatedValues);
  }

  toggleSelection(event: any, controlName: string) {
    const isChecked = event.target.checked;
    this.JObMaster_details.get(controlName)?.setValue(isChecked);

    const allSelected = this.pageTypes.every(
      (item) => this.JObMaster_details.get(item.controlName)?.value
    );
    this.JObMaster_details.get('all')?.setValue(allSelected);
  }

  toggleAllSelection2(event: any) {
    const isChecked = event.target.checked;
    let updatedValues: any = { all1: isChecked };

    this.pageType.forEach((item) => {
      updatedValues[item.controlName] = isChecked;
    });

    this.JObMaster_details.patchValue(updatedValues);
  }

  toggleSelection2(event: any, controlName: string) {
    const isChecked = event.target.checked;
    this.JObMaster_details.get(controlName)?.setValue(isChecked);

    const allSelected = this.pageType.every(
      (item) => this.JObMaster_details.get(item.controlName)?.value
    );
    this.JObMaster_details.get('all1')?.setValue(allSelected);
  }

  resetForm(): void {
    this.JObMaster_details.reset();
    this.submitted = false;
    this.showError = false;
  }

  onSubmit(): void {
    if (this.JObMaster_details.invalid) {
      this.showError = true;
      return;
    }
    const formValues = this.JObMaster_details.value;
    const formData = new FormData();
    // ✅ Append Main Job Master fields
    formData.append(
      'pk_JobId',
      this.isEditMode ? this.pk_JobId.toString() : '0'
    );
    formData.append('fk_reqid', formValues.fk_reqid || '');
    formData.append('dated', formValues.dated || '');
    formData.append('RequisitionBy', formValues.RequisitionBy || '');
    formData.append('approvalDate', formValues.approvalDate || '');
    formData.append('ApprovedBy', formValues.ApprovedBy || '');
    formData.append('ForLocation', formValues.ForLocation || '');
    formData.append('RequisitionRemark', formValues.RequisitionRemark || '');
    formData.append('Notification_no', formValues.Notification_no || '');
    formData.append('ApprovalRemark', formValues.ApprovalRemark || '');
    formData.append('Job_title', formValues.Job_title || '');
    formData.append('fk_deptId', formValues.fk_deptId || '');
    formData.append('fk_cost_centre_id', formValues.fk_cost_centre_id || '0');
    formData.append('fk_desgid', formValues.fk_desgid || '');
    formData.append('forlocation', formValues.forlocation || '');
    formData.append('fk_locid', formValues.fk_locid || '');
    formData.append('No_of_post', formValues.No_of_post || '0');
    formData.append('interviewround', formValues.interviewround || '0');
    formData.append('Job_opening_date', formValues.Job_opening_date || '');
    formData.append('Job_closing_date', formValues.Job_closing_date || '');
    formData.append('Experience_From', formValues.Experience_From || '0');
    formData.append('Experience_To', formValues.Experience_To || '0');
    formData.append('Age_From', formValues.Age_From || '0');
    formData.append('Age_To', formValues.Age_To || '0');
    formData.append('CTC_From', formValues.CTC_From || '0');
    formData.append('CTC_To', formValues.CTC_To || '0');
    formData.append(
      'Application_form_path',
      formValues.Application_form_path || ''
    );
    formData.append('Job_details_path', formValues.Job_details_path || '');
    formData.append('Remarks', formValues.Remarks || '');
    formData.append('job_closed', formValues.job_closed ?? false);
    formData.append('forRequirement', formValues.forRequirement || '');
    formData.append('remarksCaused', formValues.remarksCaused || '');
    formData.append('tatDays', formValues.tatDays || '0');
    formData.append(
      'jobResponsibilities',
      formValues.jobResponsibilities || ''
    );
    formData.append('postToNaukri', formValues.postToNaukri ? 'true' : 'false');
    formData.append('postToIndeed', formValues.postToIndeed ? 'true' : 'false');

    // ✅ Static Info
    formData.append('fk_insUserID', 'GU-1');
    formData.append('fk_updUserID', 'GU-1');
    formData.append('fk_insDateID', 'GU-1');
    formData.append('fk_updDateID', 'GU-1');
    formData.append('fk_userid', 'GU-1');
    formData.append('fk_companyId', 'GU-1');

    // ✅ Append Qualification (array)
    (formValues.fk_qualiId || []).forEach((id: string) => {
      formData.append('fk_qualiId', id);
    });

    // ✅ Append Specialization (array)
    (formValues.fk_specializationId || []).forEach((id: string) => {
      formData.append('fk_specializationId', id);
    });

    // ✅ Append Employee IDs (array)
    (formValues.fk_empId || []).forEach((id: string) => {
      formData.append('fk_empId', id);
    });



if (this.isEditMode) {
    if (this.AppSelectName) {
      formData.append('Appfilepath', this.AppSelectName);
      formData.append('UpdAppChange', 'Y');
    } else {
      formData.append('UpdJobChange', 'N');
      if (this.Appoldfile) {
        formData.append('Application_form_path', this.Appoldfile);
      }
    }
  } else {
    if (this.AppSelectName) {
      formData.append('Appfilepath', this.AppSelectName);
    }
  }

  if (this.isEditMode) {
    if (this.JobSelectName) {
      formData.append('Jobfilepath', this.JobSelectName);
      formData.append('UpdJobChange', 'Y');
    }
    else {
      formData.append('UpdJobChange', 'N');
      if (this.Joboldfile) {
        formData.append('Job_details_path', this.Joboldfile);
      }
    }
  }
  else {
    if (this.JobSelectName) {
      formData.append('Jobfilepath', this.JobSelectName);
    }
  }






    // ✅ Optional: Add full form as JSON string (if needed)
    formData.append('item', JSON.stringify(formValues));

    // ✅ API call
    const apiCall = this.isEditMode
      ? this.jobMasterService.updateJobMaster(formData)
      : this.jobMasterService.addJobMaster(formData);

    apiCall.subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message);
          this.router.navigate([
            '/dash/recruitment/recruitmentdashboard/jobMaster_list',
          ]);
        } else {
          this.toastrService.error(res.message);
        }
      },
      error: () => {
        this.toastrService.error(
          `Something went wrong while ${
            this.isEditMode ? 'updating' : 'adding'
          }!`
        );
      },
    });
  }
}
