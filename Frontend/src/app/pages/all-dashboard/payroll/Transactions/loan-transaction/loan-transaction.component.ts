import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { LoanTransactionService } from '../../services/loan-transaction.service';
import { formatDateForInput } from '../../../../../healpers/commonlib';

@Component({
  selector: 'app-loan-transaction',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgSelectModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent],
  templateUrl: './loan-transaction.component.html',
  styleUrl: './loan-transaction.component.scss',
})
export class LoanTransactionComponent {
  loanTransForm!: FormGroup;
  showError = false;
  submitted = false;
  id: string = '';
  isEditMode: boolean = false;
  EmployeeList: { name: string; value: string }[] = [];
  LoanList: { name: string; value: string }[] = [];
  LoanAllotmentList: { name: string; value: string }[] = [];

  route = inject(ActivatedRoute);
  pageNo = 1;
  pageSizes = 100;
  currentSearch = '';
  loadingEmployees = false;
  initialEmployeeList: any[] = [];
  searchTimer: any;

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

  toastrService: any;

  constructor(
    private fb: FormBuilder,
    private loanTransactionService: LoanTransactionService,
    private toastr: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    this.loanTransForm = this.fb.group({
      fk_empid: [null, [Validators.required]],
      fk_allotid: [''],
      ldated: ['', [Validators.required]],
      remarks: [''],
      fk_headid: [null, [Validators.required]],
      lamount: [null, [Validators.required]],
      InstalmentAmount: [null, [Validators.required]],
      noOfInstalments: [{ value: 0, disabled: true }],
      leftInstalments: [null, [Validators.required]],
      balAmount: [{ value: 0, disabled: true }]

    });
    this.getEmployees();
    this.getLoanAllotment('LoanAllotment');
    this.getLoan('Loan');

    this.route.paramMap.subscribe((params) => {
      const id = params.get('pk_lid');
      if (id) {
        this.id = this.encryptionService.decryptText(id.toString());
        this.isEditMode = true;
        this.getLoanTransactionById(this.id);
      }
    });

  }



  calculateValues(): void {
    const total = this.loanTransForm.value.lamount || 0;
    const perInstallment = this.loanTransForm.value.InstalmentAmount || 0;
    let paidInstallments = this.loanTransForm.value.leftInstalments || 0;

    if (total > 0 && perInstallment > 0) {
      let noOfInstallments = Math.floor(total / perInstallment);

      if (noOfInstallments < paidInstallments) {
        paidInstallments = noOfInstallments;
        this.loanTransForm.patchValue({
          leftInstalments: noOfInstallments
        });
      }

      let balAmount = perInstallment * paidInstallments;

      this.loanTransForm.patchValue({
        noOfInstalments: noOfInstallments,
        balAmount: balAmount
      });




    } else {
      this.loanTransForm.patchValue({
        noOfInstalments: 0,
        balAmount: total
      });
    }

   }




  getLoanTransactionById(pk_lid: string): void {
    this.loanTransactionService.get_LoanTransactionById(pk_lid).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const mst = res.data.loanTransactionMst;
          const details = res.data.loanTransactionDetails;

          this.loanTransForm.patchValue({
            fk_empid: mst.fk_empid,
            fk_headid: mst.fk_headid,
            fk_allotid: mst.fk_allotid,
            ldated: formatDateForInput(mst.ldated),
            remarks: mst.remarks,
            lamount: details.lamount,
            InstalmentAmount: details.instalmentAmount,
            noOfInstalments: details.noOfInstalments,
            leftInstalments: details.leftInstalments,
            balAmount: details.balAmount,
          });
          this.id = mst.pk_lid;
        } else {
          this.toastr.error(res.message || 'Failed to fetch data');
        }
      },
      error: (err) => {
        console.error('Error fetching transaction by ID:', err);
        this.toastr.error('Something went wrong while fetching data');
      },
    });
  }

  getLoan(fieldName: string): void {
    this.loanTransactionService.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.LoanList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.LoanList = [];
          this.toastrService.error(res.message, 'Error');
        }
      },
      error: () => {
        this.LoanList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      },
    });
  }
  getLoanAllotment(fieldName: string): void {
    this.loanTransactionService.getEmployee(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.LoanAllotmentList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.LoanAllotmentList = [];
          this.toastrService.error(res.message, 'Error');
        }
      },
      error: () => {
        this.LoanAllotmentList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      },
    });
  }

  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }
  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  // getEmployees(): void {
  //   this.loanTransactionService. get_Employees_Ddl(this.employeeFilters).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess) {
  //         // this.employeeList = res.data;
  //         this.EmployeeList = res.data.map((emp: any) => ({
  //           name: emp.name,
  //           value: emp.value,
  //         }));
  //       } else {
  //         this.EmployeeList = [];
  //         this.toastrService.error(res.message, 'Error');
  //       }
  //     },
  //     error: (error) => {
  //       this.EmployeeList = [];
  //       this.toastrService.error('Failed to retrieve employees', 'Error');
  //     },
  //   });
  // }

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

  onSubmit(): void {
    this.submitted = true;
    if (this.loanTransForm.invalid) {
      this.showError = true;
      return;
    }
    const formValue = this.loanTransForm.getRawValue();
    // Prepare the actual payload structure
    const payload = {
      loanTransactionMst: [
        {
          pk_lid: this.isEditMode ? this.id : '',
          loancode: formValue.loancode,
          loantype: formValue.loantype,
          fk_headid: formValue.fk_headid,
          fk_allotid: formValue.fk_allotid,
          ldated: formValue.ldated,
          orderno: formValue.orderno,
          fk_empid: formValue.fk_empid || null,
          remarks: formValue.remarks || null,
          fk_insUserID: formValue.fk_insUserID || null,
          fk_updUserID: formValue.fk_updUserID || null,
          fk_insDateID: formValue.fk_insDateID || null,
          fk_updDateID: formValue.fk_updDateID || null,
          timestamp: null
        }
      ],
      loanTransactionDetails: [
        {
          fk_lid: this.isEditMode ? this.id : '',
          fk_headid: formValue.fk_headid,
          lamount: formValue.lamount || 0,
          InstalmentAmount: formValue.InstalmentAmount || 0,
          noOfInstalments: formValue.noOfInstalments || 0,
          leftInstalments: formValue.leftInstalments || 0,
          balAmount: formValue.balAmount || 0,
          fk_updUserID: formValue.fk_updUserID || 'string',
          fk_updDateID: formValue.fk_updDateID || 'string'
        }
      ]
    }



    if (this.isEditMode) {
      this.loanTransactionService.update_LoanTransaction(this.id, payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message || 'Updated successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/loanTransaction_list']);
          } else {
            this.toastr.error(res.message || 'Update failed');
          }
        },
        error: (err) => {
          console.error('Error updating transaction:', err);
          this.toastr.error('Something went wrong while updating');
        },
      });
    } else {
      this.loanTransactionService.add_LoanTransaction(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message || 'Insert successfully!');
            this.router.navigate(['/dash/payroll/payrolldashboard/loanTransaction_list']);
          } else {
            this.toastr.error(res.message || 'Creation failed');
          }
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.toastr.error('Something went wrong while creating');
        },
      });
    }
  }


  resetForm(): void {
    this.loanTransForm.reset();
    this.submitted = false;
    this.showError = false;
  }

}
