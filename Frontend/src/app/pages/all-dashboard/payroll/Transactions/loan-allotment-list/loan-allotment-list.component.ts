import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {FormBuilder,FormGroup,FormsModule,ReactiveFormsModule, Validators,} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { LoanAttotmentService } from '../../services/loan-attotment.service';

@Component({
  selector: 'app-loan-allotment-list',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule,NgSelectModule,NgxPaginationModule,ReactiveFormsModule,],
  templateUrl: './loan-allotment-list.component.html',
  styleUrl: './loan-allotment-list.component.scss'
})
export class LoanAllotmentListComponent {
  loanAllForm!: FormGroup;
  showError = false;
  submitted = false;
  EmployeeList: { name: string; value: string }[] = [];

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_empid: string | null = null; 
  list: any[] = []; // Initialize to an empty array
  searchText:string='';

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
  ngxUILoaderService: any;

  constructor(
    private fb: FormBuilder,
    private loanAllotmentService: LoanAttotmentService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.loanAllForm = this.fb.group({
    });
    this.getEmployees('Employee');
    this.fk_empid = null; // Initialize fk_empid to null
    this.getLoanAllotmentDetails()
  }

  onEmpidChange(fk_empid: string | null): void {
    this.fk_empid = fk_empid;
    console.log('Employee selected:', this.fk_empid ?? 'All Employees');
    this.list = [];
    this.getLoanAllotmentDetails();
  }


  filteredData() {
    if (!this.searchText) {
      return this.list;
    }
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(list =>
      list.empcode?.toLowerCase().includes(searchTextLower) ||
      list.empname?.toLowerCase().includes(searchTextLower)  
    );
  }

  getEmployees(feildName : string): void {
    this.loanAllotmentService.getEmployee(feildName).subscribe({
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

  getLoanAllotmentDetails() {
    // this.ngxUILoaderService.start();
    debugger
    const employeeId = this.fk_empid ?? null; // null if not selected
    this.loanAllotmentService.get_All_LoanAllotment(employeeId, this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          console.log('Loan Allotment Data:', res.data);
          this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          console.error('Failed to fetch Loan Allotment:', res.message);
          this.toastrService.error(res.message || 'Failed to load loan allotment list');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching Loan Allotment:', err);
        this.toastrService.error('An error occurred while fetching loan allotment data');
        // this.ngxUILoaderService.stop();
      }
    });
  }

  deleteLoanAllotment(id: string): void {
    if (confirm('Are you sure you want to delete this loan allotment?')) {
      this.loanAllotmentService.delete_LoanAllotment(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Loan Allotment deleted successfully');
            this.getLoanAllotmentDetails(); // ✅ List refresh
          } else {
            this.toastrService.error(response.message || 'Failed to delete loan allotment');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete loan allotment record');
        }
      });
    }
  }
  
  editLoanAllotment(pk_allotid: any): void {
    this.router.navigate(['/dash/payroll/payrolldashboard/loanAllotment', pk_allotid]);
  }
  
  


}
