import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { AmazonDspRateCardService, AmazonDspBlockRateCard } from '../Service/amazon-dsp-rate-card.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-amazon-dsp-rate-card-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './amazon-dsp-rate-card-list.component.html',
  styles: []
})
export class AmazonDspRateCardListComponent implements OnInit {
  rateCardList: AmazonDspBlockRateCard[] = [];
  allLoadedRateCards: AmazonDspBlockRateCard[] = [];
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(
    private rateCardService: AmazonDspRateCardService,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.loadRateCards();
    });

    this.loadRateCards();
  }

  loadRateCards(): void {
    this.isLoading = true;
    this.rateCardService.getAll(this.pageIndex, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          const list = response.data?.list || [];
          this.rateCardList = [...list];

          // Store base loaded rate cards when search term is empty
          if (!this.searchTerm || !this.searchTerm.trim()) {
            this.allLoadedRateCards = [...list];
          }

          this.totalItems = response.data?.totalCount || 0;
        } else {
          this.toastrService.error(response.message || 'Failed to fetch rate cards.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastrService.error('Error fetching rate cards from server.');
      }
    });
  }

  onSearch(): void {
    const term = (this.searchTerm || '').trim().toLowerCase();

    if (!term) {
      // Search cleared! Restore base loaded rate cards instantly
      if (this.allLoadedRateCards && this.allLoadedRateCards.length > 0) {
        this.rateCardList = [...this.allLoadedRateCards];
      }
      // Reload fresh page 1 from server to reset total items count
      this.pageIndex = 1;
      this.loadRateCards();
      return;
    }

    // Tier 1: Search locally in base loaded rate cards
    const localMatches = (this.allLoadedRateCards || []).filter(rc => {
      const loc = (rc.locationName || rc.locationID || '').toLowerCase();
      const blk = (rc.blockName || rc.block || '').toLowerCase();
      const veh = (rc.vehicleTypeName || rc.vehicleType || '').toLowerCase();
      const rate = (rc.rate ?? '').toString().toLowerCase();
      const eff = rc.effectiveFrom ? new Date(rc.effectiveFrom).toLocaleDateString('en-GB').toLowerCase() : '';

      return loc.includes(term) ||
        blk.includes(term) ||
        veh.includes(term) ||
        rate.includes(term) ||
        eff.includes(term);
    });

    if (localMatches.length > 0) {
      // Matches found in base loaded records => Display local matches without API call!
      this.rateCardList = localMatches;
    } else {
      // Not found in base loaded records => Trigger backend API search with debounce!
      this.searchSubject.next(this.searchTerm);
    }
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.loadRateCards();
  }

  editRateCard(id: any): void {
    if (!id) return;
    const encryptedId = this.encryptionService.encryptText(id.toString());
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/amazon_dsp_rate_card_form', encryptedId]);
  }

  

  exportToExcel(): void {
    this.rateCardService.getAll(1, 100000, this.searchTerm).subscribe({
      next: (res: any) => {
        const list = res?.data?.list || this.rateCardList;
        if (!list || list.length === 0) {
          this.toastrService.warning('No data available to export.');
          return;
        }

               const exportData = list.map((item: any, index: number) => ({
        
          'Location Name': item.locationName || item.locationID || '',
           'Block': item.blockName || item.block || '',
          'Vehicle Type': item.vehicleTypeName || item.vehicleType || '',
          'Rate': item.rate || '',
          'Effective From': item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleDateString('en-GB') : '',
         'Inserted By': item.insertedByName || '',
         'Inserted Date': item.insertedDate ? new Date(item.insertedDate).toLocaleDateString('en-GB') : '',
'Updated By': item.updatedByName || '',
'Updated Date': item.updatedDate ? new Date(item.updatedDate).toLocaleDateString('en-GB') : ''
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

        // Auto-size columns based on max content length (header + all row values)
        const headers = Object.keys(exportData[0]);
        worksheet['!cols'] = headers.map(key => {
          const headerLen = key.length;
          const maxDataLen = exportData.reduce((max: number, row: any) => {
            const len = (row[key] ?? '').toString().length;
            return len > max ? len : max;
          }, 0);
          return { wch: Math.max(headerLen, maxDataLen) + 2 };
        });

        const workbook: XLSX.WorkBook = {
          Sheets: { 'AmazonDspRateCards': worksheet },
          SheetNames: ['AmazonDspRateCards']
        };

        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
        });

        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        });

        FileSaver.saveAs(data, 'Amazon_DSP_BlockRateCard.xlsx');
        this.toastrService.success('Exported to Excel successfully!');
      },
      error: (err: any) => {
        console.error(err);
        this.toastrService.error('Failed to export rate cards.');
      }
    });
  }
}
