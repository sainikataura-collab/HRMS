import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { LoanTransactionService } from '../../services/loan-transaction.service';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';

@Component({
  selector: 'app-loan-transaction-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgSelectModule, NgxPaginationModule, ReactiveFormsModule,CommonSearchComponent],
  templateUrl: './loan-transaction-list.component.html',
  styleUrl: './loan-transaction-list.component.scss'
})
export class LoanTransactionListComponent {
  loanTranForm!: FormGroup;
  showError = false;
  submitted = false;
  EmployeeList: { name: string; value: string }[] = [];

  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  fk_empid: string  = '';
  selectedEmpId: string | null = null;

  list: any[] = [];
  searchText: string = '';
   pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;

  constructor(
    private fb: FormBuilder,
    private loanTransactionService: LoanTransactionService,
    private toastrService: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

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
    search: '',
    pageNo: 1,
    pageSizes: 100
  };
  ngOnInit() {
    this.loanTranForm = this.fb.group({});
   //this.getEmployees();
    this.getLoanTransactionDetails();
  }

  onEmpidChange(event:any): void {
      this.list = [];
     this.fk_empid =  event.value;
    this.getLoanTransactionDetails();
  }

  filteredData() {
    if (!this.searchText) return this.list;
    const searchTextLower = this.searchText.toLowerCase();
    return this.list.filter(tran =>
      tran.pk_lid?.toLowerCase().includes(searchTextLower) ||
      tran.empcode?.toLowerCase().includes(searchTextLower) ||
      tran.empname?.toLowerCase().includes(searchTextLower) 
    );
  }

  // getEmployees(fieldName: string): void {
  //   this.loanTransactionService.getEmployee(fieldName).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         this.EmployeeList = res.data.map((emp: any) => ({
  //           name: emp.name,
  //           value: emp.value,
  //         }));
  //       } else {
  //         this.EmployeeList = [];
  //         this.toastrService.error(res.message, 'Error');
  //       }
  //     },
  //     error: () => {
  //       this.EmployeeList = [];
  //       this.toastrService.error('Failed to retrieve employees', 'Error');
  //     },
  //   });
  // }

   handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }
   getEmployees(): void {

    this.loadingEmployees = true;

    this.employeeFilters = {
      ...this.employeeFilters,

      search: this.currentSearch,

      pageNo: this.pageNo,

      pageSizes: this.pageSizes
    };

    this.loanTransactionService
      .get_Employees_Ddl(this.employeeFilters)
      .subscribe({

        next: (res) => {


          if (res.isSuccess) {

            this.EmployeeList =
              res.data.map((emp: any) => ({

                name: emp.name,

                value: emp.value

              }));

            if (!this.currentSearch) {

              this.initialEmployeeList =
                [
                  ...this.EmployeeList
                ];

            }
          }

          this.loadingEmployees = false;

        },

        error: () => {

          this.loadingEmployees = false;

          this.EmployeeList = [];

        }

      });

  }
  

  onEmployeeSearch(event: any) {

    const search =
      (event.term || '')
        .trim()
        .toLowerCase();

    clearTimeout(
      this.searchTimer
    );

    // blank
    if (!search) {
      this.EmployeeList =
        [
          ...this.initialEmployeeList
        ];

      this.loadingEmployees = false;
      return;

    }

    // local check
    const local =
      this.initialEmployeeList
        .filter(x =>

          x.name
            .toLowerCase()
            .includes(search)

        );

    if (local.length > 0) {

      this.EmployeeList =
        local;
      this.loadingEmployees = false;
      return;

    }

    // not found
    this.loadingEmployees = true;
    this.searchTimer =
      setTimeout(() => {
        this.currentSearch = search;
        this.pageNo = 1;
        this.getEmployees();

      }, 100);

  }
  getLoanTransactionDetails() {
    const empId = this.fk_empid ?? null;
    this.loanTransactionService.get_All_LoanTransaction(empId, this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.list = res.data;
          this.totalItems = res.totalCount;
        } else {
          this.list = [];
          this.totalItems = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching Loan Transactions:', err);
        this.toastrService.error('An error occurred while fetching loan transaction data');
      }
    });
  }

  deleteLoanTransaction(id: string): void {
    if (confirm('Are you sure you want to delete this loan transaction?')) {
      this.loanTransactionService.delete_LoanTransaction(id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Loan Transaction deleted successfully');
            this.getLoanTransactionDetails(); // ✅ Refresh list
          } else {
            this.toastrService.error(response.message || 'Failed to delete loan transaction');
          }
        },
        error: (error) => {
          console.error('Error deleting record:', error);
          this.toastrService.error('Failed to delete loan transaction record');
        }
      });
    }
  }

  editLoanTransaction(pk_lid: any): void {
    this.router.navigate(['/dash/payroll/payrolldashboard/loanTransaction', pk_lid]);
  }

  onPageChange(event: number):void {
      this.pageIndex = event;
      this.getLoanTransactionDetails();
    }

}
