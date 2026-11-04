declare const html2pdf: any;
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import * as XLSX from 'xlsx';
import { ApproveManpowerRequisitionService } from '../Service/approve-manpower-requisition.service';
import { ManpowerRequisitionService } from '../Service/manpower-requisition.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';


@Component({
  selector: 'app-approve-manpower-requisition-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, RouterLink],
  templateUrl: './approve-manpower-requisition-list.component.html',
  styleUrls: ['./approve-manpower-requisition-list.component.scss'],
})
export class ApproveManpowerRequisitionListComponent {
  pendingList: any[] = [];
  submittedList: any[] = [];
  searchText: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  Showpdf: boolean = false;
  today: Date = new Date();
  selectedItemForPDF: any = null;
  // selectedItem: any = null;

  constructor(
    private approvalService: ApproveManpowerRequisitionService,
    private manpowerService: ManpowerRequisitionService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.loaderService.start();
    this.fetchApprovalLists();
    this.loaderService.stop();
  }



  fetchApprovalLists(): void {
  this.approvalService.getAllManpowerApprovals().subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.pendingList = res.data?.manPowerApproveMstFristSecond || [];
        this.submittedList = res.data?.manPowerApproveMstFrist || [];

        if (this.pendingList.length > 0) {
          this.selectedItemForPDF = this.pendingList[0]; // ✅ pick 1st item by default
        }

      } else {
        this.toastrService.error(res.message || 'Failed to fetch approval lists');
      }
    },
    error: (err) => {
      console.error('Error:', err);
      this.toastrService.error('Something went wrong while loading approvals');
    },
  });
}

getManpowerDetailsForPDF(id: number): void {
  this.loaderService.start();
  this.manpowerService.getManpowerById(id).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        this.selectedItemForPDF = {
          ...res.data.manpowerMst,
          qualifications: res.data.manpowerQualification || [],
          specializations: res.data.manpowerSpecialization || []
        };
        setTimeout(() => this.generatePDF(), 300); // delay to update DOM before PDF
      } else {
        this.toastrService.error(res.message || 'Failed to load requisition details for PDF');
      }
      this.loaderService.stop();
    },
    error: (err) => {
      console.error('Error loading requisition for PDF:', err);
      this.toastrService.error('Error loading requisition');
      this.loaderService.stop();
    }
  });
}



generatePDFFromRecord(item: any): void {
  this.selectedItemForPDF = item;
  setTimeout(() => this.generatePDF(), 300); // delay to update view before print
}

  downloadExcel(): void {
    this.approvalService.downloadApprovalExcel().subscribe({
      next: (res) => {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res.data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Job Requisition Approvals');
        XLSX.writeFile(wb, 'Job_Requisition_Approval_List.xlsx');
      },
      error: (err) => {
        console.error('Excel download failed:', err);
        this.toastrService.error('Failed to download Excel');
      },
    });
  }







  view(pk_ReqId: number): void {
    const encryptedId = this.encryptionService.encryptText(pk_ReqId.toString());
    this.router.navigate([
      '/dash/emp-recruitment/emp-recruitmentdashboard/ManpowerRequisitionApproval',
      encryptedId,
    ]);
  }

  // print(pk_ReqId: number): void {
  //   // 🔸 implement your print logic or navigation
  //   this.toastrService.info(`Print logic not implemented. Selected ReqID: ${pk_ReqId}`);
  // }



   edit(pk_ReqId: number): void {
    const encryptedId = this.encryptionService.encryptText(pk_ReqId.toString());
    this.router.navigate([
       '/dash/emp-recruitment/emp-recruitmentdashboard/ApproveManpowerRequisition',
      encryptedId,
    ]);
  }

  filteredPendingList() {
    if (!this.searchText) return this.pendingList;
    const lower = this.searchText.toLowerCase();
    return this.pendingList.filter(
      (item) =>
        item.mrfcode?.toLowerCase().includes(lower) ||
        item.empName?.toLowerCase().includes(lower) ||
        item.empCode?.toLowerCase().includes(lower) ||
        item.designation?.toLowerCase().includes(lower) ||
        item.location?.toLowerCase().includes(lower) ||
        item.jobtitle?.toLowerCase().includes(lower) ||
        item.department?.toLowerCase().includes(lower) ||
        item.status?.toLowerCase().includes(lower) ||
        item.dated?.toLowerCase().includes(lower) || // in case you want to search by date string
        item.no_Of_Post?.toString().includes(lower) ||
        item.experience_From?.toString().includes(lower) ||
        item.experience_To?.toString().includes(lower)
    );
  }

  filteredSubmittedList() {
    if (!this.searchText) return this.submittedList;
    const lower = this.searchText.toLowerCase();
    return this.submittedList.filter(
      (item) =>
        item.mrfcode?.toLowerCase().includes(lower) ||
        item.empName?.toLowerCase().includes(lower) ||
        item.empCode?.toLowerCase().includes(lower) ||
        item.designation?.toLowerCase().includes(lower) ||
        item.location?.toLowerCase().includes(lower) ||
        item.jobtitle?.toLowerCase().includes(lower) ||
        item.department?.toLowerCase().includes(lower) ||
        item.status?.toLowerCase().includes(lower) ||
        item.dated?.toLowerCase().includes(lower) ||
        item.no_Of_Post?.toString().includes(lower) ||
        item.experience_From?.toString().includes(lower) ||
        item.experience_To?.toString().includes(lower)
    );
  }


    // 
  generatePDF(): void {
    // this.selectedItem = item;
    this.Showpdf = true
    const element = document.getElementById('pdf-content') as HTMLElement;

    // Ensure the page scrolls to the top before rendering
    window.scrollTo(0, 0);

    const opt = {
      margin:[5,1,5,1], // top, left, bottom, right
      filename: 'Requisition Approval.pdf',
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
