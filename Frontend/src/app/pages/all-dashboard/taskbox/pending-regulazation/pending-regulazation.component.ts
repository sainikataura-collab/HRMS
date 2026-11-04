import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';


@Component({
  selector: 'app-pending-regulazation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-regulazation.component.html',
  styleUrl: './pending-regulazation.component.scss'
})
export class PendingRegulazationComponent {

  searchText3: string = '';
RegulizationList: any[] = [];
constructor(private loader: NgxUiLoaderService, private leavetransactionService: LeaveTransactionService, private toastr: ToastrService) { }

ngOnInit(): void {
    // Ideally, fetch pending leaves from API here
    this.getregulization()
  }

getregulization(){
  this.loader.start()
  this.leavetransactionService.getregulization().subscribe({
      next: (res) => {
        if (res.data) {

          this.RegulizationList = res.data;

        }
        this.loader.stop()
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
        this.loader.stop()
      }
    });
}


  get filteredLeaves3() {
    if (!this.searchText3) return this.RegulizationList;
    const text = this.searchText3.toLowerCase();
    return this.RegulizationList.filter(item =>
      item.empcode?.toLowerCase().includes(text) ||
      item.empname?.toLowerCase().includes(text) ||
      item.Status?.toLowerCase().includes(text) ||
      item.sdated?.toLowerCase().includes(text)
    );
  }


   approveOrReject(pk_inoutid: number, action: 'approve' | 'reject'): void {
  const approvalOrder = action === 'approve' ? 2 : 1; // 2 = Approve, 1 = Reject

  const confirmMsg = action === 'approve' 
    ? 'Are you sure you want to approve?' 
    : 'Are you sure you want to reject?';

  // Ask for confirmation
  if (!confirm(confirmMsg)) {
    return; // exit if user cancels
  }
    this.RegulizationList = [];
  this.leavetransactionService
    .approveOrReject(pk_inoutid, approvalOrder)
    .subscribe(res => {
      if (res.isSuccess) {
        this.toastr.success(res.message, action === 'approve' ? "Approved" : "Rejected");
         // refresh grid/list
          this.getregulization();
          this.RegulizationList=[];

      } 
      
     
      else {
        this.toastr.error(res.message, "Error");
      }
    });
    this.getregulization();
}


}
