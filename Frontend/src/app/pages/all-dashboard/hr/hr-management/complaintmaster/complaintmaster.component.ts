import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { HremployeeComplaintService } from '../../HRservices/hremployee-complaint.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-complaintmaster',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule,
    CommonSearchComponent,
  ],

  templateUrl: './complaintmaster.component.html',
  styleUrl: './complaintmaster.component.scss',
})
export class ComplaintmasterComponent {
  ComplaintmasterForm!: FormGroup;
  EmployeeList: { name: string; value: string }[] = [];
  submitted = false;
  showError = false;
  pk_complaintId: string = '';
  isEditMode: boolean = false;
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
    userId: '',
    empStatus: '',
  };

  constructor(
    private fb: FormBuilder,
    private hremployeeComplaintService: HremployeeComplaintService,
    private toastrService: ToastrService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.initializeForm();

    debugger
    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const pk_complaintId = params.get('pk_complaintId');
      if (pk_complaintId) {
        this.pk_complaintId = this.encryptionService.decryptText(pk_complaintId);
        this.isEditMode = true;
        this.getEmployeeComplaintById(this.pk_complaintId);
      }
    });

    this.getEmployees();
  }

  initializeForm(): void {
    this.ComplaintmasterForm = this.fb.group({
      EmpCode: ['', Validators.required],
      ComplaintDate: ['', Validators.required],
      detailsInc: ['', Validators.required],
      raisdComp: ['', Validators.required],
      CommPersion: [''],
      CommPersonRaised: ['', Validators.required],
      CommfirstReport: [''],
      CommSecoundReport: [''],
      CommHOD: [''],
      CommManager: [''],
      CommGMHR: [''],
      CommManagemant: [''],
      FinalDesion: [''],
      fk_userId: [''],
      fk_locId: [''],
    });
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
  
    const parts = dateStr.split('/');
    console.log(parts);
    if (parts.length !== 3) return null;
  
    const [day, month, year] = parts;
    console.log(day, month, year);
    const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
    console.log(date);
    if (isNaN(date.getTime())) return null; // still safe check
  
    const offset = date.getTimezoneOffset();
    console.log(offset);
    const localDate = new Date(date.getTime() - offset * 60000);
    console.log(localDate);
    return localDate.toISOString().split('T')[0]; // final output
  }

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  getEmployees(): void {
    this.hremployeeComplaintService.get_Employees_Ddl(this.employeeFilters).subscribe({
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

  getEmployeeComplaintById(pk_complaintId: string) {
    this.hremployeeComplaintService.getEmployeeComplaintById(pk_complaintId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.ComplaintmasterForm.patchValue({
            EmpCode: response.data.fk_empid,
            ComplaintDate: this.formatDateForInput(response.data.complaintDate),
            detailsInc: response.data.complaintDetails,
            raisdComp: response.data.fk_empRaisedid,
            CommPersion: response.data.commentWhomPerson,
            CommPersonRaised: response.data.commentRaisedPerson,
            CommfirstReport: response.data.commentFReporting,
            CommSecoundReport: response.data.commentSReporting,
            CommHOD: response.data.commentHOD,
            CommManager: response.data.commentManager,
            CommGMHR: response.data.commentGMHR,
            CommManagemant: response.data.commentManagement,
            FinalDesion: response.data.finalDecision
          });
        } else {
          this.toastrService.error(
            response.message || 'Failed to fetch complaint data'
          );
        }
      },
      (error) => {
        console.error('Error fetching complaint:', error);
        this.toastrService.error('Error fetching complaint data');
      }
    );
  }

  resetForm(): void {
    this.ComplaintmasterForm.reset();
    this.submitted = false;
    this.showError = false;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.ComplaintmasterForm.invalid) {
      this.showError = true;
      return;
    }

    // Convert Form Data to Expected Payload Format
    const payload = {
      pk_complaintId: this.isEditMode ? this.pk_complaintId : '',
      ...this.ComplaintmasterForm.value,
    };

    if (this.isEditMode && this.pk_complaintId) {
      // Update existing complaint
      this.hremployeeComplaintService.updateEmployeeComplaint(payload).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(
              response.message || 'Complaint updated successfully!'
            );
            this.router.navigate(["/dash/hr/hrdashboard/HR_Employee_Complaint_Mst_list"]);
          } else {
            this.toastrService.error(
              response.message || 'Failed to update complaint'
            );
          }
        },
        (error) => {
          console.error('Update Error:', error);
          this.toastrService.error('Error updating complaint');
        }
      );
    } else {
      // Create new complaint
      this.hremployeeComplaintService.addEmployeeComplaint(payload).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(
              response.message || 'Complaint created successfully!'
            );
            this.router.navigate(["/dash/hr/hrdashboard/HR_Employee_Complaint_Mst_list"]);
          } else {
            this.toastrService.error(
              response.message || 'Failed to create complaint'
            );
          }
        },
        (error) => {
          console.error('Create Error:', error);
          this.toastrService.error('Error creating complaint');
        }
      );
    }
  }
}
