import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';

@Component({
  selector: 'app-pendding-shortleave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pendding-shortleave.component.html',
  styleUrl: './pendding-shortleave.component.scss'
})
export class PenddingShortleaveComponent {

searchText3: string = '';
ShortLeaveList: any[] = [];
constructor(private loader: NgxUiLoaderService, private leavetransactionService: LeaveTransactionService, private toastr: ToastrService) { }

ngOnInit(): void {
    // Ideally, fetch pending leaves from API here
    this.GetShortLeave()
  }

GetShortLeave(){
  this.loader.start()
  this.leavetransactionService.getShortLeavePendingLeave().subscribe({
      next: (res) => {
        if (res.data) {

          this.ShortLeaveList = res.data;
this.loader.stop()
        }
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
        this.loader.stop()
      }
    });
}


  get filteredLeaves3() {
    if (!this.searchText3) return this.ShortLeaveList;
    const text = this.searchText3.toLowerCase();
    return this.ShortLeaveList.filter(item =>
      item.empcode?.toLowerCase().includes(text) ||
      item.empname?.toLowerCase().includes(text) ||
      item.Status?.toLowerCase().includes(text) ||
      item.totalhours?.toLowerCase().includes(text)
    );
  }


   approveOrRejectShortLeave(pk_shortLeaveId: string, action: 'approve' | 'reject'): void {
  const approvalOrder = action === 'approve' ? 2 : 1; // 2 = Approve, 1 = Reject

  const confirmMsg = action === 'approve' 
    ? 'Are you sure you want to approve this short leave?' 
    : 'Are you sure you want to reject this short leave?';

  // Ask for confirmation
  if (!confirm(confirmMsg)) {
    return; // exit if user cancels
  }
  this.leavetransactionService
    .approveOrRejectShortLeave(pk_shortLeaveId, approvalOrder)
    .subscribe(res => {
      if (res.isSuccess) {
        this.toastr.success(res.message, action === 'approve' ? "Approved" : "Rejected");
        this.GetShortLeave(); // refresh grid/list
      } else {
        this.toastr.error(res.message, "Error");
      }
    });
}

}