import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';


import { ToastrService } from 'ngx-toastr';
import { LeaveTransactionService } from '../../payroll/services/leave-transaction.service';

@Component({
  selector: 'app-pending-leave-od',
  standalone: true,
  imports: [CommonModule, FormsModule,NgxPaginationModule],
  templateUrl: './pending-leave-od.component.html',
  styleUrl: './pending-leave-od.component.scss'
})
export class PendingLeaveODComponent {
  searchText: string = '';

  sortByLeaveType = false;
  pk_LeaveappId!:Number;

  selectedView: string = 'pending';   // pending | regularization | shortleave

 pendingAttendance:any[]=[]
 viewPanelVisible: boolean = false;
 leaves: any[] = [];

 
 
  constructor( private leavetransactionService:LeaveTransactionService ,private toastr: ToastrService) { }

  ngOnInit(): void {
    // Ideally, fetch pending leaves from API here
   this.loadPendingLeaves();
  }

  loadPendingLeaves(): void {
    this.leavetransactionService.getPendingLeave().subscribe({
      next: (res) => {
        if (res?.data?.leaves) {
          console.log('Pending Leaves:', this.leaves);
          this.leaves = res.data.leaves;
          this.pk_LeaveappId = res.data.leaves[0]?.pk_leaveappid;

          console.log("Check Pk_LeaveappId",this.pk_LeaveappId);
          this.viewPanelVisible = res.data.viewpnl === 'Y';
        }
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
      }
    });
  }



  deleteLeaveType(leaveid:string) {

    if (confirm('Are you sure you want to delete this record?')) {
        this.leavetransactionService.delete_PendingLeave(leaveid ).subscribe(
          (response: any) => {
            if (response.isSuccess) {
              this.toastr.success(response.message || 'Record deleted successfully');
    
                this.loadPendingLeaves(); // Refresh the list
            } else {
              this.toastr.error(response.message, 'Error');
            }
        },
        (errorMessage) => {
            console.error('Error deleting record', errorMessage);
            this.toastr.error(errorMessage, 'Error');
           
        }
        );
    }
    }

  approveLeave(pk_leaveappid: any): void {
    debugger;
    if (!confirm("Are you sure you want to submit this record?")) {
      return;
      } 
  
    // // Create the full payload as you showed
    // const payload = {
    //   leaveApply: {
    //     Pk_LeaveappId: this.pk_LeaveappId,
    //     Fk_Empid: "string",  // Replace with actual employee ID if available
    //     Fk_Finid: "string",
    //     Fk_Leaveid: "string",
    //     FromDate: new Date().toISOString(),  // Or set your correct date
    //     ToDate: new Date().toISOString(),
    //     TotDays: 0,
    //     Remarks: "string",
    //     Status: "string"  // Example: set status to Approved
    //   },
    //   leaveApplyDetails: [
    //     {
    //       Fk_LeaveappId: pk_leaveappid,
    //       Sno: 0,
    //       Fk_Leaveid: "string",
    //       Dated: new Date().toISOString(),
    //       ClubCase: "string",
    //       CoverCase: "string",
    //       IsHalfDay: true,
    //       Remarks: "string",
    //       HalfDayStatus: "string"
    //     }
    //   ],
    //   leavesTakenMst: {
    //     fk_empid: "string",
    //     pk_leavetakenid: "string",
    //     fk_leaveappid: pk_leaveappid,
    //     fk_finid: "string",
    //     fk_leaveid: 0,
    //     fromdate: new Date().toISOString(),
    //     todate: new Date().toISOString(),
    //     leavetaken: 0,
    //     remarks: "string",
    //     isLateComing: true,
    //     fk_UserID: "string",
    //     fk_LocID: "string"
    //   },
    //   leavesTakenDetails: [
    //     {
    //       sno: 0,
    //       fk_leaveid: 0,
    //       dated: new Date().toISOString(),
    //       clubcase: "string",
    //       covercase: "string",
    //       isHalfDay: true,
    //       remarks: "string",
    //       halfDayStatus: "string",
    //       halfDayClub: "string"
    //     }
    //   ],
    //   employeeLeaveApprovedByDetails: {
    //     fk_Empid: "string",
    //     orderNo: 0,
    //     fk_ApprovedById: "string"
    //   },
    //   employeeLeaveDetails: {
    //     fk_Empid: "string",
    //     fk_Leaveid: "string",
    //     leaveAvailed: 0
    //   }
    // };
  
    // Now pass the whole payload
    this.leavetransactionService.ApprovePendingLeave(pk_leaveappid).subscribe(
      (response: any) => {
        if (response.isSuccess) {
            this.toastr.success(response.message || 'Record approved successfully'); 
             this.loadPendingLeaves();
        } else {
          this.toastr.error(response.message);
        }
      },
      (error: any) => {
        this.toastr.error('An error occurred while approving the leave.');
      }
    );
  }
  
  // approveLeave(pk_leaveappid: any): void {
  //   debugger
  //   this.leavetransactionService.ApprovePendingLeave(pk_leaveappid).subscribe(
  //     (response: any) => {
  //       if (response.isSuccess) {
  //         this.toastr.success(response.message);
  //       } else {
  //         this.toastr.error(response.message);
  //       }
  //     },
  //     (error: any) => {
  //       // Handle errors (e.g., network issues)
  //       this.toastr.error('An error occurred while approving the leave.');
  //     }
  //   );
  // }
  




  get filteredLeaves() {
    if (!this.searchText) return this.leaves;
    const text = this.searchText.toLowerCase();
    return this.leaves.filter(item =>
      item.empcode?.toLowerCase().includes(text) ||
      item.empname?.toLowerCase().includes(text) ||
      item.locname?.toLowerCase().includes(text) ||
      item.shortdesc?.toLowerCase().includes(text)
    );
  }
}
  
  










  // approve(list: any[], index: number) {
  //   alert(`Approved: ${list[index].empName}`);
  //   list.splice(index, 1);
  // }


 // pendingLeaves: any[] = [
  //   {
  //     empCode: 'EMP001',
  //     empName: 'RADHA',
  //     location: 'Sonbhadra',
  //     leaveType: 'Sick Leave',
  //     fromDate: '2025-04-05',
  //     toDate: '2025-04-07',
  //     leaveDays: 3
  //   },
  //   {
  //     empCode: 'EMP002',
  //     empName: 'MADAV',
  //     location: 'Varanasi',
  //     leaveType: 'OD',
  //     fromDate: '2025-04-06',
  //     toDate: '2025-04-06',
  //     leaveDays: 1
  //   },
  //   {
  //     empCode: 'EMP003',
  //     empName: 'MANAVI',
  //     location: 'Varanasi',
  //     leaveType: 'CL',
  //     fromDate: '2025-04-06',
  //     toDate: '2025-04-06',
  //     leaveDays: 1
  //   }
  //   // add more dummy data as needed
  // ];





 // regularizationRequests = [
  //   { empCode: 'EMP003', empName: 'Sita Ram', fromDate: '2025-04-05',toDate: '2025-04-06', reason: 'Missed Punch due to system error',status: 'Pending' },
  //   { empCode: 'EMP004', empName: 'Lakshmi Bai',fromDate: '2025-04-05',toDate: '2025-04-06', reason: 'Field Work',status: 'Pending' },
  // ];

  // shortLeaves = [
  //   { empCode: 'EMP005', empName: 'Bharat Singh', leaveType: 'Sick Leave', date: '2025-04-07', time: '2 Hours', reason: 'Bank Work' },
  //   { empCode: 'EMP006', empName: 'Gita Kumari', leaveType: 'Sick Leave',  date: '2025-04-06',time: '1.5 Hours', reason: 'Doctor Visit' },
  // ];

  // viewOptions = [
  //   { label: 'Pending Attendance', value: 'pending' },
  //   { label: 'Regularization Requests', value: 'regularization' },
  //   { label: 'Short Leaves', value: 'shortleave' }
  // ];



  // getFiltered(list: any[]) {
  //   if (!this.searchText) return list;
  //   const search = this.searchText.toLowerCase();
  //   return list.filter(leave =>
  //     leave.empCode.toLowerCase().includes(search) ||
  //     leave.empName.toLowerCase().includes(search)
  //   );
  // }

  // approveLeave(index: number): void {
  //   alert(`Leave approved for ${this.pendingLeaves[index].empName}`);
  //   this.pendingLeaves.splice(index, 1);
  // }

  // deleteLeave(index: number): void {
  //   if (confirm("Are you sure you want to delete this leave request?")) {
  //     this.pendingLeaves.splice(index, 1);
  //   }
  // }


  // toggleSortByLeaveType() {
  //   this.sortByLeaveType = !this.sortByLeaveType;
  // }


  // get filteredLeaves() {
  //   let result = [...this.pendingLeaves];

  //   if (this.searchText) {
  //     const search = this.searchText.toLowerCase();
  //     result = result.filter(item =>
  //       item.empCode.toLowerCase().includes(search) ||
  //       item.empName.toLowerCase().includes(search) ||
  //       item.location.toLowerCase().includes(search) ||
  //       item.leaveType.toLowerCase().includes(search)
  //     );
  //   }

  //   if (this.sortByLeaveType) {
  //     result.sort((a, b) => a.leaveType.localeCompare(b.leaveType));
  //   }

  //   return result;
  // }