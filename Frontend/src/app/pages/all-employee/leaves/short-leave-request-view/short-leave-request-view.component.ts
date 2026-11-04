import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LeavereqService } from '../Service/leavereq.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-short-leave-request-view',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './short-leave-request-view.component.html',
  styleUrl: './short-leave-request-view.component.scss'
})
export class ShortLeaveRequestViewComponent {
pk_shortLeaveId: number | null = null;
shortLeaveData!: any;


constructor(
  private ActivatedRoute: ActivatedRoute,
  private httpAttendanceService: LeavereqService,
 private loader: NgxUiLoaderService,
) { }

ngOnInit(): void {
    this.loader.start();
  const idParam = this.ActivatedRoute.snapshot.paramMap.get('pk_shortLeaveId');
  this.pk_shortLeaveId = Number(idParam);
  if (!isNaN(this.pk_shortLeaveId) && this.pk_shortLeaveId > 0) {

    this.getShortLeaveById(this.pk_shortLeaveId); // Call your service here
  } else {
    console.error('Invalid or missing short leave ID:', idParam);
 
  }
    this.loader.stop();
}

getShortLeaveById(id: number): void {
  this.httpAttendanceService.getShortLeaveById(id).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.shortLeaveData = res.data; // Assign the data to the shortLeaveList
      } else {
        console.error('Failed to fetch short leave data:', res.message);
      }
    },
    error: (err) => {
      console.error('Error fetching short leave data:', err);
    }
  });
}

}