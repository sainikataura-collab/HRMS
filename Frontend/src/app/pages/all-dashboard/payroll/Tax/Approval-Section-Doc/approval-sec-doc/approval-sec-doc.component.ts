import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {FormBuilder,FormGroup,ReactiveFormsModule, Validators,} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonSearchComponent } from '../../../Employee/common-search/common-search.component';
import { ApprovalSecDocService } from '../../../services/approval-sec-doc.service';


@Component({
  selector: 'app-approval-sec-doc',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgSelectModule,
    CommonSearchComponent,
    RouterLink
  ],
  templateUrl: './approval-sec-doc.component.html',
  styleUrl: './approval-sec-doc.component.scss',
})
export class ApprovalSecDocComponent {
  router = Inject(Router);
  ApprovalForm!: FormGroup;
  showSuggestions = false;
  fk_empid: string = '';

  locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'];
  departments = ['HR', 'Finance', 'Engineering', 'Marketing'];

  pendingList: any[] = [
    {
      billDate: '2024-02-14',
      section: 'HR',
      subSection: 'Payroll',
      amount: 5000,
      empCode: 'E001',
      empName: 'John Doe',
      branch: 'Delhi',
      financialYear: '2023-2024',
      file: 'file1.pdf',
    },
    {
      billDate: '2023-11-10',
      section: 'Finance',
      subSection: 'Audit',
      amount: 8000,
      empCode: 'E002',
      empName: 'Jane Smith',
      branch: 'Mumbai',
      financialYear: '2022-2023',
      file: 'file2.pdf',
    },
    {
      billDate: '2022-07-01',
      section: 'IT',
      subSection: 'Support',
      amount: 3000,
      empCode: 'E003',
      empName: 'Mark Lee',
      branch: 'Bangalore',
      financialYear: '2021-2022',
      file: 'file3.pdf',
    },
  ];

  // 🔹 Financial Year Options
  financialYears = [
    { id: 1, year: '2023-2024' },
    { id: 2, year: '2022-2023' },
    { id: 3, year: '2021-2022' },
    { id: 4, year: '2020-2021' },
  ];
  FinancialYear: { name: string, value: string }[] = [];
  approvalSectionDocListPending: any[] = [];
approvalSectionDocListApproved: any[] = [];
totalPendingItems: number = 0;
totalApprovedItems: number = 0;
  filteredPendingList: any[] = [];
  toastrService: any;
  totalItems: any;

  constructor(private fb: FormBuilder,private ApprovalSecDocService : ApprovalSecDocService) {}

  ngOnInit(): void {
    this.initializeForms();
    this.getAllApprovalSectionDocs();
     this.getFinancialYearList('FinancialYear')
  }

  initializeForms() {
    this.ApprovalForm = this.fb.group({
      code: [''],
      name: [''],
      location: [''],
      department: [''],
      financialYear: [''],
      status: [{ value: 'Current', disabled: true }, Validators.required],
    });
    this.filteredPendingList = [...this.pendingList];

    // this.ApprovalForm.get('code')?.valueChanges.pipe(debounceTime(300)).subscribe(value => {
    //   this.filterPendingList();
    // });
  }

  filterPendingList() {
    const formValues = this.ApprovalForm.value;
    this.filteredPendingList = this.pendingList.filter((emp) => {
      return (
        (!formValues.code ||
          emp.empCode.toLowerCase().includes(formValues.code.toLowerCase())) &&
        (!formValues.name ||
          emp.empName.toLowerCase().includes(formValues.name.toLowerCase())) &&
        (!formValues.status ||
          emp.status
            ?.toLowerCase()
            .includes(formValues.status.toLowerCase())) &&
        (!formValues.location ||
          emp.branch
            .toLowerCase()
            .includes(formValues.location.toLowerCase())) &&
        (!formValues.department ||
          emp.department
            ?.toLowerCase()
            .includes(formValues.department.toLowerCase())) &&
        (!formValues.financialYear ||
          emp.financialYear?.toString() === formValues.financialYear)
      );
    });
  }

  // approval-section-doc.component.ts

  getAllApprovalSectionDocs(): void {
    const filters = {
      fk_empid: this.fk_empid || '',
      ecode: '',
      location: '',
      department: '',
      ename: '',
      leftstatus: '',
      fk_companyId: '',
      fk_finid: ''
    };
  
    this.ApprovalSecDocService.ApprovalSectionDoc_GetAll(filters).subscribe({
      next: (response) => {
        console.log('Approval Section Docs retrieved:', response);
        if (response.isSuccess) {
          // Pending List
          this.approvalSectionDocListPending = response.data.pendingSectionDocMsts || [];
          this.totalPendingItems = this.approvalSectionDocListPending.length;
  
          // Approved List
          this.approvalSectionDocListApproved = response.data.approvalSectionDocMsts || [];
          this.totalApprovedItems = this.approvalSectionDocListApproved.length;
        } else {
          this.toastrService.warning(response.message || 'No records found.');
        }
      },
      error: (error) => {
        console.error('Error fetching Approval Section Docs:', error);
        this.toastrService.error('Something went wrong while fetching data.');
      }
    });
  }
  
  getFinancialYearList(fieldName: string) {
    this.ApprovalSecDocService.getdropDawn(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.FinancialYear = res.data.map((pk_finid: any) => ({
            name: pk_finid.name,
            value: pk_finid.value
          }));
        } else {
          this.toastrService.error("Failed to load FinancialYear list.");
        }
      },
      error: (err) => {
        console.error("Error fetching FinancialYear list:", err);
        this.toastrService.error("Error fetching FinancialYear list.");
      }
    });
  }
  

  selectCode(code: string) {
    this.ApprovalForm.patchValue({ code });
    this.showSuggestions = false;
  }
  clearFilters() {
    this.ApprovalForm.reset();
    this.filteredPendingList = [...this.pendingList];
  }
  search() {
    this.filterPendingList();
  }


  downloadPdf(fileName: string) {
  this.ApprovalSecDocService.Downloadfile(fileName).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => {
      alert('File download failed');
    }
  });
}

}
