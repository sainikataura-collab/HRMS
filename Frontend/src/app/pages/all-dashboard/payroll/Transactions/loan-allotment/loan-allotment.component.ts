import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {FormBuilder,FormGroup,FormsModule,ReactiveFormsModule, Validators,} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { LoanAttotmentService } from '../../services/loan-attotment.service';
import { formatDateForInput } from '../../../../../healpers/commonlib';

@Component({
  selector: 'app-loan-allotment',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule,NgSelectModule,NgxPaginationModule,ReactiveFormsModule,CommonSearchComponent,],
  templateUrl: './loan-allotment.component.html',
  styleUrl: './loan-allotment.component.scss',
})
export class LoanAllotmentComponent {
  loanAllForm!: FormGroup;
  showError = false;
  submitted = false;
  isEditMode: boolean = false;
  EmployeeList: { name: string; value: string }[] = [];
  id: string = '';
  Isedit = false;
  route = inject(ActivatedRoute);

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

  // filteredLocations: string[] = [...this.locations];
  constructor(
    private fb: FormBuilder,
    private loanAllotmentService: LoanAttotmentService,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService : EncryptionService
  ) {}

  ngOnInit() {
    this.loanAllForm = this.fb.group({
      fk_empid: [''],
      orderno: [''],
      dated: ['', [Validators.required]],
      requisitionAmt: ['', [Validators.required]],
      allotdated: ['', [Validators.required]],
      allotAmt: ['', [Validators.required]],
      remarks: [''],
    });
    this.getEmployees();
    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_allotid');
      if (id) {
        this.id = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getLoanAllotmentById(this.id);
      }
    });
  }

  


  getLoanAllotmentById(pk_allotid: string): void {
    this.loanAllotmentService.get_LoanAllotmentById(pk_allotid).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.loanAllForm.patchValue({
            fk_empid: response.data.fk_empid,
            orderno: response.data.orderno,
            dated: formatDateForInput(response.data.dated),
            requisitionAmt: response.data.requisitionAmt,
            allotdated: formatDateForInput(response.data.allotdated),
            allotAmt: response.data.allotAmt,
            remarks: response.data.remarks,
          });
  
          // Extra: If needed, set the internal ID for update
          this.id = response.data.pk_allotid;
          this.Isedit = true;
        } else {
          this.toastrService.error(response.message || 'Failed to fetch loan allotment data');
        }
      },
      error: (err) => {
        console.error('Error fetching loan allotment:', err);
        this.toastrService.error('Error fetching loan allotment data');
      }
    });
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset(); // Handle timezones correctly
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0]; // "yyyy-MM-dd"
  }

  // formatDateForInput(dateStr: string): string | null {
  //   if (!dateStr) return null;
  //   const parts = dateStr.split('/'); // "02/04/2025" → ["02", "04", "2025"]
  //   const day = parts[0];
  //   const month = parts[1];
  //   const year = parts[2];
  //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // → "2025-04-02"
  // }
  
  

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  getEmployees(): void {
    this.loanAllotmentService. get_Employees_Ddl(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          // this.employeeList = res.data;
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

  onSubmit(): void {
    debugger
    this.submitted = true;
    if (this.loanAllForm.invalid) {
      this.showError = true;
      return;
    }
    // ✅ Build Payload in required format (as array of object)
    const payload = [
      {
        pk_allotid: this.Isedit ? this.id : "", // send ID if editing, empty string if inserting
        ...this.loanAllForm.value,
      }
    ];
    if (this.Isedit) {
      // ✅ Update existing Loan Allotment
      this.loanAllotmentService.update_LoanAllotment(this.id, payload[0]).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Loan Allotment updated successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/loanAllotment_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to update loan allotment');
          }
        },
        error: (error) => {
          console.error('Update Error:', error);
          this.toastrService.error('Error updating loan allotment');
        }
      });
    } else {
      // ✅ Create new Loan Allotment
      this.loanAllotmentService.add_LoanAllotment(payload).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Loan Allotment created successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/loanAllotment_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to create loan allotment');
          }
        },
        error: (error) => {
          console.error('Create Error:', error);
          this.toastrService.error('Error creating loan allotment');
        }
      });
    }
  }
  
  

  resetForm(): void {
    this.loanAllForm.reset();
  }
}
