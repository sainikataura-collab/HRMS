declare const html2pdf: any;
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { ManpowerRequisitionService } from '../Service/manpower-requisition.service';


@Component({
  selector: 'app-manpower-requisition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './manpower-requisition-list.component.html',
  styleUrl: './manpower-requisition-list.component.scss'
})
export class ManpowerRequisitionListComponent {
 manpowerList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  Showpdf: boolean = false;
  today: Date = new Date();
  selectedItemForPDF: any = null;

  constructor(
    private manpowerService: ManpowerRequisitionService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.getAllManpower();
    // this.getAllManpowerPdf();
    this.loaderService.stop();
  }
 getAllManpower(): void {
    this.manpowerService.getAllManpower(this.pageIndex - 1, this.pageSize).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.manpowerList = res.data;
          this.totalItems = res.totalCount || res.data.length;
        } else {
          this.toastrService.error(res.message || 'Failed to fetch job requisitions');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastrService.error('Something went wrong');
      }
    });
  }
// getAllManpowerPdf(): void {
//   this.manpowerService.getAllManpower(this.pageIndex - 1, this.pageSize).subscribe({
//     next: (res) => {
//       if (res.isSuccess) {
//         this.manpowerList = res.data;
//         this.totalItems = res.totalCount || res.data.length;

//         // ✅ Pehla item PDF ke liye set karein
//         if (this.manpowerList.length > 0) {
//           this.selectedItemForPDF = this.manpowerList[0];
//         }
//       } else {
//         this.toastrService.error(res.message || 'Failed to fetch job requisitions');
//       }
//     },
//     error: (err) => {
//       console.error('Error:', err);
//       this.toastrService.error('Something went wrong');
//     }
//   });
// }

generatePDFFromId(pk_ReqId: number): void {
  this.Showpdf = false; // ensure old PDF section hides
  this.manpowerService.getManpowerById(pk_ReqId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.selectedItemForPDF = res.data.manpowerMst;
        this.Showpdf = true; // trigger PDF section

        // 👇 Wait for DOM to update and render PDF
        setTimeout(() => this.generatePDF(), 300);
      } else {
        this.toastrService.error(res.message || 'Failed to fetch requisition');
      }
    },
    error: (err) => {
      console.error('PDF fetch error:', err);
      this.toastrService.error('Something went wrong while fetching PDF data');
    }
  });
}

// generatePDFFromRecord(item: any): void {
//   this.selectedItemForPDF = item;
//   // 👇 ensure the view (like HTML content) is updated before generating PDF
//   setTimeout(() => this.generatePDF(), 300);
// }


  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getAllManpower();
  }

  edit(pk_ReqId: number): void {
    const encryptedId = this.encryptionService.encryptText(pk_ReqId.toString());
    this.router.navigate(['/dash/emp-recruitment/emp-recruitmentdashboard/ManpowerRequisition', encryptedId]);
  }

  delete(pk_ReqId: number): void {
    if (confirm('Are you sure you want to delete this requisition?')) {
      this.manpowerService.deleteManpower(pk_ReqId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message || 'Requisition deleted successfully');
            this.getAllManpower();
          } else {
            this.toastrService.error(res.message || 'Failed to delete requisition');
          }
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toastrService.error('Error deleting requisition');
        }
      });
    }
  }

  downloadExcel(): void {
    this.manpowerService.downloadExcel().subscribe({
      next: (res) => {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Job Requisition');
        XLSX.writeFile(wb, 'Job_Requisition_List.xlsx');
      },
      error: (err) => {
        console.error('Excel download failed:', err);
        this.toastrService.error('Failed to download Excel');
      }
    });
  }

 filteredData() {
  if (!this.searchText) return this.manpowerList;

  const lower = this.searchText.toLowerCase();

  return this.manpowerList.filter(data =>
    data.mrfcode?.toString().toLowerCase().includes(lower) ||
    data.dated?.toString().toLowerCase().includes(lower) ||
    data.jobTitle?.toLowerCase().includes(lower) ||
    data.location?.toLowerCase().includes(lower) ||
    data.department?.toLowerCase().includes(lower) ||
    data.designation?.toLowerCase().includes(lower) ||
    data.no_Of_Post?.toString().toLowerCase().includes(lower) ||
    data.experience_From?.toString().toLowerCase().includes(lower) ||
    data.experience_To?.toString().toLowerCase().includes(lower) ||
    data.status?.toString().toLowerCase().includes(lower)
  );
}



// pdf download
  generatePDF(): void {
    // this.selectedItem = item;
    this.Showpdf = true
    const element = document.getElementById('pdf-content') as HTMLElement;

    // Ensure the page scrolls to the top before rendering
    window.scrollTo(0, 0);

    const opt = {
      margin:[5,1,5,1], // top, left, bottom, right
      filename: 'Job Requisition.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        scrollY: 0 // Prevent scroll-based displacement
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { avoid: 'tr' } // Optional: prevents breaks inside rows
    };

    if (element) {
      html2pdf().from(element).set(opt).save();
    } else {
      console.error("Element not found for PDF generation");
    }
  }

}
