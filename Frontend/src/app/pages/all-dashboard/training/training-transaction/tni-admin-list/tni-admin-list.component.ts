import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TniService } from '../../services/tni.service';


@Component({
  selector: 'app-tni-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './tni-admin-list.component.html',
  styleUrls: ['./tni-admin-list.component.scss']   // ✅ Corrected (was styleUrl)
})
export class TniAdminListComponent {
  data: any[] = [];



  totalCount: number = 0;
  pageindex: number = 1;
  pagesize: number = 10;

  searchText: string = '';

  // 🔹 Filters (bound with HTML)
  filter: any = {
    status: '',
    priority: '',
    // fromdat: '',
    // toDate: '',
    search: ''
  };

  constructor(
    private trainingService: TniService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getList();
  }

  // 🔹 Fetch List with Filters + Pagination
  getList() {
    this.trainingService.getList(this.filter).subscribe({
      next: (res: any) => {
        //this.ngxUILoaderService.stop();

        if (res && res.statusCode === 200) {
          // Bind grid data
          this.data = res.data || [];
          // Use top-level totalCount for pagination
          this.totalCount = res.totalCount || 0;
        } else {
          this.data = [];
          this.totalCount = 0;
        }
      },
      error: (err) => {
        //this.ngxUILoaderService.stop();
        this.toastr.error('Something went wrong while fetching TNI list');
        console.error('Error fetching TNI Admin List:', err);
      }
    });
  }

  filteredData() {
    if (!this.searchText) {
      return this.data;
    }

    const searchTextLower = this.searchText.toLowerCase();
    return this.data.filter(shift =>
      shift.programName?.toLowerCase().includes(searchTextLower) ||
      shift.subProgramName?.toLowerCase().includes(searchTextLower)

    );
  }


  // 🔹 Reset Filters
  resetFilters(): void {
    this.filter = {
      status: '',
      priority: '',
      proposedTimeline: '',
      toDate: '',
      search: ''
    };
    this.pageindex = 1;
    this.getList();
  }

  // 🔹 Pagination Change
  onPageChange(page: number): void {
    this.pageindex = page;
    this.getList();
  }


  takeAction(pk_TNIId: number, lineId: number, action: string, adminComments?: string) {
    const body = {
      pk_TNIId: pk_TNIId,
      TNILineId: lineId,          // ✅ send LineId
      action: action,
      adminComments: adminComments
    };

    this.trainingService.takeAction(body).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastr.success(`TNI ${action} successfully!`);
          this.getList(); // refresh list
        } else {
          this.toastr.error(res.message || 'Action failed');
        }
      },
      error: (err) => {
        this.toastr.error('Something went wrong!');
        console.error(err);
      }
    });
  }



  createPlanning(item: any) {
    // navigate to planning create page, pass tniId
    this.router.navigate(['/dash/training/trainingdashboard/TrainingPlanning'], {
      queryParams: {
        tniId: item.pk_TNIId,
        subProgramId: item.fk_subprogramId,

      }
    });
  }

}
