import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../Services/attendance.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-emp-approve-regularization-update',
  standalone: true,
  imports: [NgSelectComponent, CommonModule, FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent, RouterLink],
  templateUrl: './emp-approve-regularization-update.component.html',
  styleUrl: './emp-approve-regularization-update.component.scss'
})
export class EmpApproveRegularizationUpdateComponent {
  approvereguForm!: FormGroup;
  pk_inoutid: number | null = null;
  showError = false;
   Approvestatuslist=[
    //{name: '--select Grade --', Value:0},
    {name:'Select Status',value:0},
    {name:'Approve',value:1}, 
     {name:' Disapprove',value:-1},]
  constructor(private fb: FormBuilder, private regularService: AttendanceService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
        public encryptionService:EncryptionService
  ) { }

  ngOnInit(): void {
    //this.pk_inoutid = this.route.snapshot.paramMap.get('pk_inoutid') || ''
     this.pk_inoutid = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['pk_inoutid']));

    this.approvereguForm = this.fb.group({
      Intime: [''],
      Outtime: [''],
      Type: [''],
      RegularizeType: [''],
      empcode: [''],
      empname: [''],
      attenDate: [''],
      Remarks: [''],
      ApproveRemarks: ['',Validators.required],
      ApproveStatus: [0,Validators.required]
    });
    if (this.pk_inoutid != null)
      this.getDataById(this.pk_inoutid);
  }

  convertToISODate(ddmmyyyy: string): string {
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  getDataById(pk_inoutid: number): void {

    this.regularService.getById_ApproveRegularization(pk_inoutid).subscribe({
      next: (res) => {
        if (res?.isSuccess && res?.data) {
          const date = this.convertToISODate(res.data.attenDate)

          this.approvereguForm.patchValue(
            {
              ...res.data,
              attenDate: date
            }
          );
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }


  update() {
    debugger
    if (this.approvereguForm.invalid) {
      this.showError = true;
      window.scrollTo(0, 0);
      return;
    }
    // const now = new Date();
    // const year = now.getFullYear();
    // const month = String(now.getMonth() + 1).padStart(2, '0');
    // const day = String(now.getDate()).padStart(2, '0');
    // const formattedCurrentDate = `${day}/${month}/${year}`;
    const payload = {

      regularizeId: 0,
       pk_inoutid: this.pk_inoutid || "0",
      dated: this.approvereguForm.value.attenDate,
      regularizedStatus: 1,
      pk_empId: '',
      isApproved: true,
      approvalStatus: this.approvereguForm.value.ApproveStatus,
      approvalRemarks: this.approvereguForm.value.ApproveRemarks,
      isDisapproved: false

    };

    console.log("Final Payload to Submit", payload);

    this.regularService.Update_ApproveRegularization(payload).subscribe(
      res => {
        this.toastr.success(res.message);
        this.approvereguForm.reset();

        this.showError = false;
      },
      err => {
        this.toastr.error("Error while submitting leave");
      }
    );
  }

}
