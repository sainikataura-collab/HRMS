


import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';
import { RouterLink ,Router} from '@angular/router';


@Component({
  selector: 'app-approved-leave-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './approved-leave-list.component.html',
  styleUrl: './approved-leave-list.component.scss'
})
export class ApprovedLeaveListComponent {
leaveList:any[]=[
  {
    requestDate: '14/11/2024',
    leaveType: 'EL',
    empCode: 'PP970',
    empName: 'Maan Singh',
    fromDate: '14/11/2024',
    toDate: '14/11/2024',
    totalDays: 1,
    reason: 'Personal work',
    approvalDate: '13/06/2025',
    approvalRemarks: 'edfssfd'
  },
  {
    requestDate: '14/11/2024',
    leaveType: 'CL',
    empCode: 'PP973',
    empName: 'Ashif Ali',
    fromDate: '14/11/2024',
    toDate: '14/11/2024',
    totalDays: 0.5,
    reason: 'Personal work',
    approvalDate: '13/06/2025',
    approvalRemarks: 'ok'
  }
];
  ApprovedleaveList: any[] = []; // Initialize with an empty array

  searchText: string = '';


  ngOnInit(): void {
   this.getAttendanceData()
  }
    constructor(
      private fb: FormBuilder,
      private toastr: ToastrService,
      private loader: NgxUiLoaderService,
      private httpAttendanceService: LeavereqService,
      private router: Router
      
    ) {}
getAttendanceData() {
  this.loader.start();

  this.httpAttendanceService.GetallApprovedDisapporvedLeaveList().subscribe({
    next: (res) => {
      if(res.isSuccess) {
      this.ApprovedleaveList = res?.data || [];
      this.loader.stop();
      }
      else{
        this.loader.stop();
        this.toastr.error(res.message || 'Failed to load data');
      }
    },
    error: (err) => {
      console.error('short Leave fetch error:', err);
      this.loader.stop();
      this.toastr.error('Failed to load attendance data');
    }
  });
}


filteredData() {
  if (!this.searchText) {
    return this.ApprovedleaveList; // Return the full list if search text is empty
  }

  return this.ApprovedleaveList.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(this.searchText.toLowerCase())
    ) 
  );
}
}

