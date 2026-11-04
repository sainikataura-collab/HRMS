

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { HrmanagementService } from '../../hr/hr-management/hrmanagement.service';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { DueclearencemasterService } from '../Service/dueclearencemaster.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';

@Component({
  selector: 'app-dueclearencemaster',
  standalone: true,
  imports: [FormsModule, RouterLink, ReactiveFormsModule, CommonModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './dueclearencemaster.component.html',
  styleUrl: './dueclearencemaster.component.scss'
})
export class DueclearencemasterComponent {
  Dueclearencemasterform!: FormGroup;
  parameterForm!: FormGroup;
  submitted = false;
  parameterSubmitted = false;
  Department: { label: string, value: string }[] = [];
  parametersList: any[] = []; // Store added parameters
  showError = false;
  isEdit = false;
  pk_clsdeptId: number = 0;
  isEditingParameter = false; // ✅ NEW: Track if we're editing a parameter
  editingParameterIndex: number = -1; // ✅ NEW: Track which parameter is being edited
  approvalEmployees: { name: string, value: string }[] = [];
  initialEmployeeList: { name: string, value: string }[] = [];
  loadingEmployees = false;
  currentSearch = '';
  pageNo = 1;
  pageSize = 100;
  searchTimer: any;

  constructor(
    private fb: FormBuilder,
    private employeeMasterService: EmployeeMasterService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private httpservice: DueclearencemasterService,
    public encryption: EncryptionService,
    private ngxUILoaderService: NgxUiLoaderService,
    private leaveTransactionService: LeaveTransactionService
  ) { }

  ngOnInit() {
    // Main Due Clearance Form
    this.Dueclearencemasterform = this.fb.group({
      fk_deptid: [null, [Validators.required]],
      fk_empid: [null, [Validators.required]],
      IsActive: [false],
    });

    // Parameters Form
    this.parameterForm = this.fb.group({
      Description: ['', Validators.required],
      orderno: [''],
      IsActive: [false],
    });

    // check edit mode
    this.pk_clsdeptId = Number(this.encryption.decryptText(this.route.snapshot.params['pk_clsdeptId'] ?? ''));

    if (this.pk_clsdeptId && this.pk_clsdeptId > 0) {
      this.isEdit = true;
      // In edit mode, getAllEmployees will be called from populateFormData with the saved empId
      this.getClearanceById(this.pk_clsdeptId);
    } else {
      // New record: load employees immediately
      this.getAllEmployees();
    }

    this.getDepartmentList('Department');
  }

  getClearanceById(pk_clsdeptId: number): void {
    this.ngxUILoaderService.start();

    this.httpservice.getByIdClearanceUser(pk_clsdeptId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          // Debug: log to verify fk_empid is returned from the DB
          console.log('[Edit Mode] clearanceDepartment from API:', res.data.clearanceDepartment);
          this.populateFormData(res.data);
        } else {
          this.toastrService.error(res.message || 'Failed to load clearance details.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error loading clearance data:', err);
        this.toastrService.error('Error loading clearance data.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  populateFormData(data: any): void {

    if (data.clearanceDepartment) {

      // Only patch non-dropdown values immediately
      // fk_empid is set by getAllEmployees AFTER the list loads to avoid blank+cross in ng-select
      this.Dueclearencemasterform.patchValue({
        fk_deptid: data.clearanceDepartment.fk_deptid,
        IsActive: data.clearanceDepartment.isActive
      });

      // Load employees — sets fk_empid once the matching item is in the list
      this.getAllEmployees(data.clearanceDepartment.fk_empid);
    }

    // Populate Parameters
    if (data.transactions && Array.isArray(data.transactions)) {
      this.parametersList = data.transactions.map((transaction: any) => ({
        Description: transaction.description,
        orderno: transaction.orderno,
        IsActive: transaction.isActive,
        pk_deptTrnId: transaction.pk_depttrnid
      }));
    }
  }

  // ✅ UPDATED: Add or Update parameter
  addParameter() {
    this.parameterSubmitted = true;

    if (this.parameterForm.invalid) {
      // this.toastrService.error('Please fill out all required parameter fields!');
      return;
    }

    const parameter = {
      ...this.parameterForm.value,
      id: Date.now() // Temporary ID for frontend management
    };

    if (this.isEditingParameter && this.editingParameterIndex >= 0) {
      // ✅ Update existing parameter
      this.parametersList[this.editingParameterIndex] = parameter;
      this.toastrService.success('Parameter updated successfully!');
      this.isEditingParameter = false;
      this.editingParameterIndex = -1;
    } else {
      // ✅ Add new parameter
      this.parametersList.push(parameter);
      this.toastrService.success('Parameter added to list successfully!');
    }

    // Reset the parameter form
    this.resetParameterForm();
  }

  // Remove parameter from list
  removeParameter(index: number) {
    this.parametersList.splice(index, 1);
    this.toastrService.info('Parameter removed from list');
  }

  // ✅ UPDATED: Edit parameter
  editParameter(index: number) {
    const parameter = this.parametersList[index];
    this.parameterForm.patchValue(parameter);
    this.isEditingParameter = true;
    this.editingParameterIndex = index;

  }

  // ✅ NEW: Cancel parameter editing
  cancelParameterEdit() {
    this.resetParameterForm();
    this.isEditingParameter = false;
    this.editingParameterIndex = -1;

  }

  // ✅ NEW: Reset parameter form helper
  resetParameterForm() {
    this.parameterForm.reset();
    this.parameterForm.patchValue({ IsActive: false });
    this.parameterSubmitted = false;
  }

  // ✅ Updated submit method to handle both create and update
  submit() {
    this.submitted = true;

    if (this.Dueclearencemasterform.invalid) {
      return;
    }

    if (this.parametersList.length === 0) {
      this.toastrService.warning('Please add at least one parameter before submitting!');
      return;
    }

    // ✅ Prepare payload differently for create vs update
    const payload = {
      ClearanceDepartment: {
        ...this.Dueclearencemasterform.value,
        ...(this.isEdit && { pk_clsdeptId: this.pk_clsdeptId }) // Add ID for update
      },
      Transactions: this.parametersList.map(param => {
        const { id, ...paramWithoutId } = param; // Remove temporary frontend ID
        return paramWithoutId;
      })
    };



    this.ngxUILoaderService.start();

    // ✅ Choose appropriate service method based on edit mode
    const serviceCall = this.isEdit
      ? this.httpservice.updateClearance(payload)
      : this.httpservice.addClearance(payload);

    serviceCall.subscribe({
      next: (response) => {
        console.log('API Response:', response);
        const successMessage = this.isEdit
          ? 'Due clearance updated successfully!'
          : 'Due clearance created successfully!';

        this.toastrService.success(successMessage);

        // Navigate back to list
        this.router.navigate(['/dash/exit/exitdashboard/due_clearance_list']);
      },
      error: (error) => {
        console.error('API Error:', error);
        const errorMessage = this.isEdit
          ? 'Error updating due clearance record'
          : 'Error saving due clearance record';

        this.toastrService.error(errorMessage);
      },
      complete: () => {
        this.ngxUILoaderService.stop();
      }
    });
  }

  getDepartmentList(fieldName: string) {
    this.ngxUILoaderService.start();

    this.employeeMasterService.get_DropdownList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.Department = res.data.map((dept: any) => ({
            name: dept.name,
            value: dept.value
          }));
        } else {
          this.toastrService.error("Failed to load Department list.");
        }
      },
      error: (err) => {
        this.toastrService.error("Error fetching Department list.");
        console.error('Department API Error:', err);
      },
      complete: () => {
        this.ngxUILoaderService.stop();
      }
    });
  }

  resetForm(): void {
    this.Dueclearencemasterform.reset();
    this.resetParameterForm(); // ✅ Use the helper method
    this.parametersList = [];
    this.submitted = false;
    this.isEditingParameter = false; // ✅ Reset editing state
    this.editingParameterIndex = -1;

    // Reset default values
    this.Dueclearencemasterform.patchValue({ IsActive: false });
    this.parameterForm.patchValue({ IsActive: false });


  }

  getAllEmployees(selectedEmpId?: string): void {

    this.pageNo = 1;
    this.currentSearch = '';
    this.loadingEmployees = true;

    const filters = {
      empStatus: "B",
      pageNo: 1,
      // In edit mode load all employees so the saved approver is always found.
      // In create mode load paginated (infinite scroll handles more).
      pageSize: selectedEmpId ? 100000 : this.pageSize
    };

    this.leaveTransactionService.getEmpList(filters).subscribe({
      next: (res: any) => {

        if (res.isSuccess && res.data) {

          this.approvalEmployees = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));

          this.initialEmployeeList = [...this.approvalEmployees];

          if (selectedEmpId) {
            // Defer by one tick so ng-select renders items before value is set
            setTimeout(() => {
              this.Dueclearencemasterform.patchValue({ fk_empid: selectedEmpId });
            });
          }
        }

        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }

  loadEmployees(isScroll = false): void {
    if (isScroll && this.loadingEmployees) return;
    this.loadingEmployees = true;

    const filters = {
      empStatus: "B",
      search: this.currentSearch,
      pageNo: this.pageNo,
      pageSize: this.pageSize
    };

    this.leaveTransactionService.getEmpList(filters).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          const mapped = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));

          if (isScroll) {
            this.approvalEmployees = [...this.approvalEmployees, ...mapped];
          } else {
            this.approvalEmployees = mapped;
            if (!this.currentSearch) {
              this.initialEmployeeList = [...mapped];
            }
          }
        } else {
          if (!isScroll) {
            this.approvalEmployees = [];
          }
        }
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }

  fetchAndAddEmployee(empId: string): void {
    const filters = {
      search: empId,   // search across name/code fields to locate by PK
      empStatus: "B",
      pageNo: 1,
      pageSize: 10
    };
    this.leaveTransactionService.getEmpList(filters).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data && res.data.length > 0) {
          // Find the exact match by value (PK)
          const match = res.data.find((emp: any) => emp.value === empId) || res.data[0];
          const newEmp = { name: match.name, value: match.value };

          // Prepend to lists so it's visible immediately
          this.approvalEmployees = [newEmp, ...this.approvalEmployees];
          this.initialEmployeeList = [newEmp, ...this.initialEmployeeList];

          this.Dueclearencemasterform.patchValue({
            fk_empid: empId
          });
        }
      }
    });
  }

  onScrollToEnd(): void {
    this.pageNo++;
    this.loadEmployees(true);
  }

  onEmployeeSearch(event: any): void {
    const search = (event.term || '').trim().toLowerCase();
    clearTimeout(this.searchTimer);

    if (!search) {
      this.approvalEmployees = [...this.initialEmployeeList];
      this.currentSearch = '';
      this.pageNo = 1;
      this.loadingEmployees = false;
      return;
    }

    const local = this.initialEmployeeList.filter(x =>
      x.name.toLowerCase().includes(search) ||
      x.value.toLowerCase().includes(search)
    );

    if (local.length > 0) {
      this.approvalEmployees = local;
      this.loadingEmployees = false;
      return;
    }

    this.loadingEmployees = true;
    this.searchTimer = setTimeout(() => {
      this.currentSearch = search;
      this.pageNo = 1;
      this.loadEmployees(false);
    }, 300);
  }

}
