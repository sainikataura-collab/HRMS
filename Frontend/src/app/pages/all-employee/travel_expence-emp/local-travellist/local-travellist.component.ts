import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';

import { NgxUiLoaderService } from "ngx-ui-loader";
import { LocalTravelService } from "../Services/local-travel.service";
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-local-travellist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    RouterLink
  ],
  templateUrl: './local-travellist.component.html',
  styleUrl: './local-travellist.component.scss'
})
export class LocalTravellistComponent {

  searchText: string = "";
  travelList: any[] = [];

  page: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private service: LocalTravelService,
    private router: Router,    private encryptionService: EncryptionService // ✅ INJECT ENCRYPTION SERVICE

  ) {}

  ngOnInit(): void {
    this.getTravelList();
  }

  //  GET LIST
  getTravelList() {

    this.loader.start();

    this.service.getAllLocalTravel().subscribe({
      next: (res:any) => {

        if (res?.isSuccess) {
          this.travelList = res.data || [];
          this.totalItems = this.travelList.length;
        } else {
          this.travelList = [];
        }

        this.loader.stop();
      },
      error: () => {
        this.loader.stop();
        this.toastr.error('Failed to load travel list');
      }
    });
  }

  //  SEARCH
  filteredData() {

    if (!this.searchText) return this.travelList;

    const text = this.searchText.toLowerCase();

    return this.travelList.filter(x =>
      x.dated?.toLowerCase().includes(text) ||
      x.amount?.toString().includes(text) ||
      x.status?.toLowerCase().includes(text)
    );
  }

  onSearchTextChanged() {
    this.page = 1;
  }

  //  PAGINATION
  onPageChange(page: number) {
    this.page = page;
  }

  //  VIEW
  isEdit(pk_localtravelId : number) {
   // alert(pk_localtravelId);
    const encryptedId = this.encryptionService.encryptText(pk_localtravelId.toString());
      this.router.navigate([
        '/dash/travelexpence_emp/travelexpence_empdashboard/localtravel',
        encryptedId
    ]);
  }

 


  //  PRINT
 printTravel(id: number) {

  this.loader.start();

  this.service.getLocalTravelById(id).subscribe({
    next: (res: any) => {

      this.loader.stop();

      if (res?.isSuccess) {

        // 👉 Print page open
        window.open(`/api/travel/print/${id}`, '_blank');

      } else {
        this.toastr.error("Record not found");
      }
    },
    error: () => {
      this.loader.stop();
      this.toastr.error("Error while fetching record");
    }
  });
}



// In local-travel-list.component.ts (or wherever you're calling from)

isDownloading: boolean = false;

/**
 * Download PDF for a local travel record
 */
downloadPdf(pk_localtravelId: number, employeeId?: string): void {
  this.isDownloading = true;
  
  this.service.printPdf(pk_localtravelId).subscribe({
    next: (res: Blob) => {
      // ✅ Create blob with PDF type
      const blob = new Blob([res], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // ✅ Create download link
      const a = document.createElement('a');
      a.href = url;
      
      // ✅ Generate filename
      const fileName = `LocalTravel_${employeeId || pk_localtravelId}_${this.getFormattedDate()}.pdf`;
      a.download = fileName;
      
      // ✅ Trigger download
      document.body.appendChild(a);
      a.click();
      
      // ✅ Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      this.isDownloading = false;
      this.toastr.success('PDF downloaded successfully');
    },
    error: (err) => {
      console.error('PDF Download failed', err);
      this.isDownloading = false;
      this.toastr.error('Failed to download PDF');
    }
  });
}

/**
 * Helper: Get formatted date for filename
 */
private getFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

}
