import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RouterLink ,Router} from '@angular/router';
import { LeavereqService } from '../Service/leavereq.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';



@Component({
  selector: 'app-comp-off-request-approvallist',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './comp-off-request-approvallist.component.html',
  styleUrl: './comp-off-request-approvallist.component.scss'
})
export class CompOffRequestApprovallistComponent {
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
    public encryptionService:EncryptionService
    
  ) {}

getAttendanceData() {
  this.loader.start();

  this.httpAttendanceService.getAllCompOffApprovals().subscribe({
    next: (res) => {
      if(res.isSuccess) {
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


filteredData(): any[] {
  if (!this.searchText) return this.filteredList;

  const text = this.searchText.toLowerCase();

  return this.filteredList.filter(req =>
    req.dated?.toLowerCase().includes(text) ||
    req.compoffdate?.toLowerCase().includes(text) ||
    req.compoffdays?.toLowerCase().includes(text) ||
    req.fromtime?.toLowerCase().includes(text) ||
    req.totime?.toLowerCase().includes(text) ||
    req.totalhours?.toLowerCase().includes(text) ||
    req.totdays?.toLowerCase().includes(text) ||
    req.reason?.toLowerCase().includes(text) ||
    req.remarks?.toLowerCase().includes(text) ||
    req.status?.toLowerCase().includes(text) ||
    req.empcode?.toLowerCase().includes(text) ||
    req.empname?.toLowerCase().includes(text) ||
    req.intime?.toLowerCase().includes(text) ||
    req.outtime?.toLowerCase().includes(text)
  );
}



GoToApproval(pk_applycompoffId: number) {
   const encryptedId = this.encryptionService.encryptText(pk_applycompoffId.toString());

 this.router.navigate(['/dash/leaves/leavesdashboard/CompOffRequestApproval', encryptedId]);
}

}
