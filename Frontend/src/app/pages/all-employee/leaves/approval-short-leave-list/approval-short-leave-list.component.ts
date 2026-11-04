
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LeavereqService } from '../Service/leavereq.service';
import { RouterLink ,Router} from '@angular/router';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-approval-short-leave-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './approval-short-leave-list.component.html',
  styleUrl: './approval-short-leave-list.component.scss'
})
export class ApprovalShortLeaveListComponent {
searchText: string = '';
filteredList: any[] = []; // Initialize with an empty array
ngOnInit(): void {
 this.getAttendanceData()
}
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private httpAttendanceService: LeavereqService,
    private router: Router,
    public encryption:EncryptionService
  ) {}

getAttendanceData() {
  this.loader.start();

  this.httpAttendanceService.GetallApprovalShortLeaveList().subscribe({
    next: (res) => {
      if(res.isSuccess) {
        res.data.map((e: { pk_shortLeaveId: { toString: () => any; }; })=> {
          return {...e, pk_shortLeaveId : e.pk_shortLeaveId.toString()}
        })
      this.filteredList = res?.data || [];
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
    return this.filteredList; // Return the full list if search text is empty
  }

  return this.filteredList.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(this.searchText.toLowerCase())
    ) 
  );
}


GoToApproval(pk_shortLeaveId: number) {
   const encryptedId = this.encryption.encryptText(pk_shortLeaveId.toString());
   this.router.navigate(['/dash/leaves/leavesdashboard/ApprovalshortLeave', encryptedId]);
}

}