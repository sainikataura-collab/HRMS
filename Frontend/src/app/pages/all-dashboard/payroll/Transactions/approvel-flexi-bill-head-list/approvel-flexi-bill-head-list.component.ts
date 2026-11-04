import { Component } from '@angular/core';
import { FlexiBillApprovalService } from '../TransactionService/flexi-bill-approval.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonSearchComponent } from '../../Employee/common-search/common-search.component';
import { NgSelectComponent } from '@ng-select/ng-select';



@Component({
  selector: 'app-approvel-flexi-bill-head-list',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,CommonSearchComponent],
  templateUrl: './approvel-flexi-bill-head-list.component.html',
  styleUrl: './approvel-flexi-bill-head-list.component.scss'
})
export class ApprovelFlexiBillHeadListComponent {

  pendingList: any[] = [];
  submittedList: any[] = [];
  EmployeeForm!: FormGroup;

 


  constructor(
    private FlexiBillService: FlexiBillApprovalService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.EmployeeForm = this.fb.group({
      empCode: [''],
      empCodeManual: [''],
      empName: [''],
      selectedDepartments: [[]],
      SelectedDesignation: [''],
      selectedLocations: [[]],
      SelectedNature: [''],
      SelectedCity: [''],
      sortBy: [''],
      userId: [''],
      empStatus: [''],
      leftStatus: ['']  // ✅ always send Y
    });
  }
 
 handleFilters(filters: any): void {
    this.EmployeeForm.patchValue(filters);
    this.getList(); // Fetch updated data
  }

  download(filename: string): void {
  this.FlexiBillService.getImage(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Failed to download file:', err);

    }
  });
}

  // Fetch flexi bill list from API based on filters
  getList(): void {
    const filters = this.EmployeeForm.value;
    this.loaderService.start();

    this.FlexiBillService.get_FlexiBill_List(filters).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.pendingList = res.data.pendingBills || [];
          this.submittedList = res.data.approvedBills || [];
        } else {
         console.log("Mmmm.. something went wrong call api on pageload")
        }
        this.loaderService.stop();
      },
      error: (err) => {
        console.error('Error fetching flexi bill list:', err);
        this.toastrService.error('Server error occurred.');
        this.loaderService.stop();
      }
    });
  }


  edit(fk_flexibillId: number): void {
  const encryptedId = this.encryptionService.encryptText(fk_flexibillId.toString());

  this.router.navigate([
    '/dash/payroll/payrolldashboard/Flexi-bill-Approval',
    encryptedId
  ]);
}

}