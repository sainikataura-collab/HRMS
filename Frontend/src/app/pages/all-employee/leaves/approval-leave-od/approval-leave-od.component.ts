import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';


@Component({
  selector: 'app-approval-leave-od',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterLink,FormsModule],
  templateUrl: './approval-leave-od.component.html',
  styleUrl: './approval-leave-od.component.scss'
})

export class ApprovalLeaveODComponent implements OnInit {
  leaveForm!: FormGroup;
  leaveRequests:any[]= [
    
  ];
  selectAll: boolean = false;
  isChecked: boolean = false;

  constructor(private fb: FormBuilder,
    private toster: ToastrService// Replace with actual ToasterService or similar service
    , private loader: NgxUiLoaderService, // Replace with actual loader service
    private httpAttendanceService: LeavereqService, // Replace with actual service to fetch leave requests
    private router: Router // Replace with actual router if needed
  ) {}

  ngOnInit(): void {
     this.leaveRequests = this.leaveRequests.map(item => ({ ...item, isChecked: false }));

    this.leaveForm = this.fb.group({
      remark: ['', Validators.required],
      selectedRequests: this.fb.array([])
    });

    this.getAttendanceData();
    
  }


  toggleSelectAll(event: any) {
  this.selectAll = event.target.checked;
  const selected = <FormArray>this.leaveForm.get('selectedRequests');
  selected.clear();

  this.leaveRequests.forEach(item => {
    item.isChecked = this.selectAll;
    if (this.selectAll) {
      selected.push(new FormControl(item.pk_leaveappid));
    }
  });
}


  onCheckboxChange(e: any, item: any) {
    debugger
    const selected = <FormArray>this.leaveForm.get('selectedRequests');
    if (e.target.checked) {
      selected.push(new FormControl(item.pk_leaveappid));
    } else {
      const index = selected.controls.findIndex(x => x.value === item.pk_leaveappid);
      if (index >= 0) selected.removeAt(index);
    }
  }

  
  
// approve(status: string) {

//   const selectedIds = this.leaveForm.value.selectedRequests;
//   const remark = this.leaveForm.value.remark;

//   if (!remark || selectedIds.length === 0) {
//     this.toster.warning("Please select at least one request and enter remarks.");
//     return;
//   }
//   const dbStatus = status === 'Approved' ? 'S' : 'C';
//   this.loader.start();
//   let completed = 0;
//   let failed = 0;

//   selectedIds.forEach((id: string, index: number) => {
//     const payload = {
//       fk_leaveappid: id,
//       remarks: remark,
//       status: dbStatus
//     };

//     this.httpAttendanceService.Isnert_ApprovalOdLeaveRequest(payload).subscribe({
//       next: (res) => {
//         if (res.isSuccess) {
//           completed++;
//         } else {
//           failed++;
//         }

//         if (index === selectedIds.length - 1) {
//           this.loader.stop();
//           if (completed > 0) {
//             const status = payload.status== 'S' ?'Approved' : 'DisApproved';
//             this.toster.success(`${completed} requests ${status} successfully.`);
//             this.getAttendanceData();
//           }
//           if (failed > 0) {
//             this.toster.error(`${failed} requests failed.`);
//           }
//         }
//       },
//       error: (err) => {
//         failed++;
//         if (index === selectedIds.length - 1) {
//           this.loader.stop();
//           this.toster.error(`${failed} requests failed.`);
//         }
//       }
//     });
//   });
// }


approve(status: string) {
  const selectedIds = this.leaveForm.value.selectedRequests;
  const remark = this.leaveForm.value.remark;

  if (!remark || selectedIds.length === 0) {
    this.toster.warning("Please select at least one request and enter remarks.");
    return;
  }

  const dbStatus = status === 'Approved' ? 'S' : 'C';

  this.loader.start();

  console.log('isssddddddd',selectedIds)
  const payload = {
    fk_leaveappids: selectedIds, // <-- send array
    remarks: remark,
    status: dbStatus
  };

  this.httpAttendanceService.Isnert_ApprovalOdLeaveRequest(payload).subscribe({
    next: (res) => {
      this.loader.stop();
      if (res.isSuccess) {
        const statusText = dbStatus === 'S' ? 'Approved' : 'DisApproved';
        this.toster.success(`Requests ${statusText} successfully.`);
         // Reset form after successful approve/disapprove
        this.leaveForm.reset({
          selectedRequests: [],
       
          remark: ''
        });

        // Reset selectAll state
  this.selectAll = false;

  // Reset checkboxes in leaveRequests
  this.leaveRequests.forEach(item => item.isChecked = false);
        // Optionally, refresh the attendance data
        this.getAttendanceData();
       
      } else {
        this.toster.error(res.message || 'Failed to update leave requests');
      }
    },
    error: () => {
      this.loader.stop();
      this.toster.error('Failed to update leave requests');
    }
  });
}


  getAttendanceData() {
  this.loader.start();

  this.httpAttendanceService.GetallApprovalOdLeaveList().subscribe({
    next: (res) => {
      if(res.isSuccess) {
      this.leaveRequests = res?.data || [];
      this.loader.stop();
      }
      else{
        this.loader.stop();
        this.toster.error(res.message || 'Failed to load data');
      }
    },
    error: (err) => {
      console.error('short Leave fetch error:', err);
      this.loader.stop();
      this.toster.error('Failed to load attendance data');
    }
  });
}

}




