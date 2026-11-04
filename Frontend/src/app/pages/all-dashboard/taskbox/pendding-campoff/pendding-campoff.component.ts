import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';

@Component({
  selector: 'app-pendding-campoff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pendding-campoff.component.html',
  styleUrl: './pendding-campoff.component.scss'
})
export class PenddingCampoffComponent {
CompOfflist: any[] = [];
searchText2: string = '';


  constructor(private loader: NgxUiLoaderService, private leavetransactionService: LeaveTransactionService, private toastr: ToastrService) { }

ngOnInit(){
this.GetCampOff();
}




GetCampOff(){
  this.loader.start();
this.leavetransactionService.getCompoffPendingLeave().subscribe({
      next: (res) => {
        if (res.data) {

          this.CompOfflist = res.data;
this.loader.stop();
        }
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
        this.loader.stop();
      }
    })
  }


get filteredLeaves2() {
    if (!this.searchText2) return this.CompOfflist;
    const text = this.searchText2.toLowerCase();
    return this.CompOfflist.filter(item =>
      item.empcode?.toLowerCase().includes(text) ||
      item.empname?.toLowerCase().includes(text) ||
      item.Status?.toLowerCase().includes(text) ||
      item.totalhours?.toLowerCase().includes(text)
    );
  }


  ApproveOrRejectCompOff(pk_applycompoffId: number, action: 'approve' | 'reject'): void {
  const approvalOrder = action === 'approve' ? 2 : 1; // 2 = Approve, 1 = Reject
const confirmMsg = action === 'approve' 
    ? 'Are you sure you want to approve this short leave?' 
    : 'Are you sure you want to reject this short leave?';

  // Ask for confirmation
  if (!confirm(confirmMsg)) {
    return; // exit if user cancels
  }
  this.leavetransactionService
    .approveOrRejectCompOff(pk_applycompoffId, approvalOrder)
    .subscribe(res => {
      if (res.isSuccess) {
        this.toastr.success(res.message, action === 'approve' ? "Approved" : "Rejected");
        this.GetCampOff(); // refresh grid/list
      } else {
        this.toastr.error(res.message, "Error");
      }
    });
}

}