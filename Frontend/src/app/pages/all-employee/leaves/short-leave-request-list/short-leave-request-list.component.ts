import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';
import { RouterLink ,Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-short-leave-request-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './short-leave-request-list.component.html',
  styleUrl: './short-leave-request-list.component.scss'
})
export class ShortLeaveRequestListComponent {
searchText: string = '';
filteredAttendanceList: any[] = []; // Initialize with an empty array
caption: string = 'Short Leave Request List';
showAddButton: boolean = true;

type: string = '';
// status: string = '';
month: number | null = null;
  year: number | null = null;


ngOnInit(): void {
   this.route.queryParams.subscribe(params => {
   
   this.type = params['type'];
    
        // this.status = params['status'] ?? null;

    this.month = params['month'] ? Number(params['month']) : null;
    this.year  = params['year'] ? Number(params['year']) : null;


      
    // Change caption if coming from dashboard
    if (this.type === 'attendance') {
      this.caption = 'Short leave Details';
      this.showAddButton = false;
    } else {
      this.caption = 'Short Leave Request List';
      this.showAddButton = true;
    }
  });

 this.getAttendanceData()
}
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpAttendanceService: LeavereqService,
    private router: Router,
    private route:ActivatedRoute
    
  ) {}

getAttendanceData() {
  this.loader.start();

  this.httpAttendanceService.GetallShortLeaveList(this.month ?? null,
  this.year ?? null).subscribe({
    next: (res) => {
      if(res.isSuccess) {
      this.filteredAttendanceList = res?.data || [];
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
    return this.filteredAttendanceList; // Return the full list if search text is empty
  }

  return this.filteredAttendanceList.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(this.searchText.toLowerCase())
    ) 
  );
}


viewRequest(pk_shortLeaveId: number) {
 this.router.navigate(['/dash/leaves/leavesdashboard/shortLeaveView', pk_shortLeaveId]);
}

onDeleteShortLeave(pk_shortLeaveId: string) {
    if (confirm("Are you sure you want to delete this Short leave application?")) {
      this.httpAttendanceService.DeleteShortLeave(pk_shortLeaveId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastr.success(res.message);
            this.getAttendanceData(); // ✅ Refresh after delete
          } else {
            this.toastr.error(res.message);
          }
        },
        error: (err) => {
          this.toastr.error("Error deleting leave application");
          console.error(err);
        }
      });
    }
}
}