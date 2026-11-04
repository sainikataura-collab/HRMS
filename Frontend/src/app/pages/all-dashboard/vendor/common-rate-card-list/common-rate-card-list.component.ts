import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx-js-style';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { EncryptionService } from '../../../../shared/services/encryption.service';
import { CommonRateCardService } from '../common-rate-card.service';

@Component({
  selector: 'app-common-rate-card-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './common-rate-card-list.component.html',
  styles: []
})
export class CommonRateCardListComponent implements OnInit {
  rateCards: any[] = [];
  allLoadedRateCards: any[] = [];
  searchText: string = '';
  searchTerm: string = '';
  pageIndex: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isLoading: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(
    private rateCardService: CommonRateCardService,
    private toastr: ToastrService,
    private router: Router,
    public encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 1;
      this.getRateCards();
    });

    this.getRateCards();
  }

  getRateCards(): void {
    this.isLoading = true;
    this.rateCardService.getAll(this.pageIndex - 1, this.pageSize, this.searchTerm).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.isSuccess && res?.data) {
          let list: any[] = [];
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (Array.isArray(res.data.list)) {
            list = res.data.list;
          }
          this.rateCards = list.map(rc => {
             rc.configuredRates = this.parseConfiguredRates(rc);
             return rc;
          });

          // Store base loaded rate cards when search term is empty
          if (!this.searchTerm || !this.searchTerm.trim()) {
            this.allLoadedRateCards = [...list];
          }

          this.totalItems = res.totalCount || res.data?.totalCount || this.rateCards.length;
        } else {
          this.rateCards = [];
          this.totalItems = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.rateCards = [];
        this.totalItems = 0;
        this.toastr.error(err?.error?.message || 'Error loading Rate Cards.', 'Error');
      }
    });
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.getRateCards();
  }

  onSearch(): void {
    const term = (this.searchText || '').trim().toLowerCase();

    if (!term) {
      // Search cleared! Restore base loaded rate cards instantly
      if (this.allLoadedRateCards && this.allLoadedRateCards.length > 0) {
        this.rateCards = [...this.allLoadedRateCards];
      }
      this.searchTerm = '';
      this.pageIndex = 1;
      this.getRateCards();
      return;
    }

    // Tier 1: Search locally in base loaded rate cards
    const localMatches = (this.allLoadedRateCards || []).filter((rc: any) => {
      const client = (rc.ClientName || '').toLowerCase();
      const model = (rc.ModelName || '').toLowerCase();
      const fhrId = (rc.FHRID || '').toLowerCase();
      const location = (rc.LocationName || '').toLowerCase();
      const largeVehicle = (rc.Large_VehicleTypeName || '').toLowerCase();
      const vehicle = (rc.VehicleTypeName || '').toLowerCase();
      const effectiveFrom = (this.formatDateDMY(rc.EffectiveFrom) || '').toLowerCase();

      return client.includes(term) ||
        model.includes(term) ||
        fhrId.includes(term) ||
        location.includes(term) ||
        largeVehicle.includes(term) ||
        vehicle.includes(term) ||
        effectiveFrom.includes(term);
    });

    if (localMatches.length > 0) {
      // Matches found in base loaded records => Display local matches without API call!
      this.rateCards = localMatches;
    } else {
      // Not found in base loaded records => Trigger backend API search with debounce!
      this.searchTerm = this.searchText ? this.searchText.trim() : '';
      this.searchSubject.next(this.searchTerm);
    }
  }

  isUpdate(pk_RateCardID: string): void {
    this.router.navigate(['/dash/vendor_management/vendor_managementdashboard/common_rate_card', pk_RateCardID]);
  }

  onEditClick(item: any): void {
    const rawId = item?.pk_RateCardID ?? item?.pk_RateCardId ?? item?.pk_rateCardID ?? item?.pk_ratecardid ?? item?.id ?? item?.PK_RateCardID;
    if (rawId !== null && rawId !== undefined && rawId !== '') {
      try {
        const encrypted = this.encryptionService.encryptText(rawId.toString());
        this.isUpdate(encrypted);
      } catch (err) {
        this.isUpdate(rawId.toString());
      }
    }
  }

  editRateCard(item: any): void {
    this.onEditClick(item);
  }

  deleteRateCard(id: number | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this Rate Card?')) {
      this.rateCardService.delete(id).subscribe({
        next: (res: any) => {
          if (res?.isSuccess) {
            this.toastr.success('Rate card deleted successfully.', 'Deleted');
            this.getRateCards();
          } else {
            this.toastr.error(res?.message || 'Failed to delete rate card.', 'Error');
          }
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message || 'Server error occurred while deleting.', 'Error');
        }
      });
    }
  }

  cleanVehicleName(rawName: string): string {
    if (!rawName) return '';
    let name = rawName.toString().trim();
    if (name.includes(':')) {
      const parts = name.split(':');
      name = parts[parts.length - 1].trim();
    }
    return name;
  }

  formatDateDMY(dateVal: any): string {
    if (!dateVal) return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal.toString();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateVal.toString();
    }
  }

  exportToExcel(): void {
    this.rateCardService.getAll(0, 100000, this.searchTerm).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.list) ? res.data.list : []);
        
        if (list.length === 0) {
          this.toastr.warning('No rate card data found to export.', 'No Data');
          return;
        }

        const formatDateTime = (dateVal: any) => {
          if (!dateVal) return '-';
          try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return dateVal.toString();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
          } catch {
            return dateVal.toString();
          }
        };

        const exportData = list.map((rc: any, idx: number) => {
          const rates = rc.configuredRates || this.parseConfiguredRates(rc);
          const configuredRatesStr = rates.map((r: any) => `[ ${r.name.toUpperCase()} - ${r.type.toUpperCase()} ] : ${r.value}`).join(' \r\n\r\n ');

          return {
            'S.No': idx + 1,
            'Client': rc.ClientName || rc.clientName || '-',
            'Model': rc.ModelName || rc.modelName || '-',
            'Vehicle Type': this.cleanVehicleName(rc.Large_VehicleTypeName || rc.large_VehicleTypeName || rc.VehicleTypeName || rc.vehicleTypeName || rc.AmazonEdsp_VehicleTypeName || rc.amazonEdsp_VehicleTypeName || '-'),
            'FHR ID': rc.FHRID || rc.fhrid || '-',
            'Location': rc.LocationName || rc.locationName || '-',
            'Effective From': this.formatDateDMY(rc.EffectiveFrom || rc.effectiveFrom),
            'Status': rc.Status || rc.status || 'Active',
            'Configured Rates & Values': configuredRatesStr || '-',
            'Entry By': rc.AssignBy || rc.assignBy || '-',
            'Entry Date': formatDateTime(rc.AssignDate || rc.assignDate),
            'Update By': rc.UpdateBy || rc.updateBy || '-',
            'Update Date': formatDateTime(rc.UpdateDate || rc.updateDate)
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const colWidths = [];

        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
            if (!worksheet[cellRef]) continue;

            const cellStr = worksheet[cellRef].v ? worksheet[cellRef].v.toString() : '';

            if (R === 0) {
              worksheet[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { patternType: "solid", fgColor: { rgb: "007BFF" } },
                alignment: { vertical: "center", horizontal: "center" }
              };
              maxWidth = Math.max(maxWidth, cellStr.length + 5);
            } else {
              if (C === 8) { 
                worksheet[cellRef].s = { alignment: { wrapText: true, vertical: "top" } };
                maxWidth = 60; 
              } else {
                worksheet[cellRef].s = { alignment: { vertical: "center" } };
                maxWidth = Math.max(maxWidth, cellStr.length + 2);
              }
            }
          }
          colWidths[C] = { wch: Math.min(maxWidth, 100) };
        }
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CommonRateCards');

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        FileSaver.saveAs(data, `Common_Rate_Cards_${this.formatDateDMY(new Date())}.xlsx`);
        this.toastr.success('Rate cards exported to Excel successfully!', 'Export Success');
      },
      error: () => {
        this.toastr.error('Failed to export rate cards.', 'Export Error');
      }
    });
  }

  formatRateForExport(rc: any, type: string): string {
    if (!rc) return '-';
    const rType = rc[`${type}_RateType`] ?? rc[`${type.toLowerCase()}_RateType`];
    if (!rType) return '-';

    if (rType === 'Fixed') {
      let val = rc[`${type}_Rate`] ?? rc[`${type.toLowerCase()}_Rate`];
      if (type === 'Shopsy') {
        val = rc['Shopsy_Deduction_Rate'] ?? rc['shopsy_Deduction_Rate'] ?? rc['shopsy_Rate'] ?? val;
      }
      return `Fixed (₹ ${Number(val || 0).toFixed(2)})`;
    } else if (rType === 'Slab') {
      const slab = rc[`${type}_SlabExpr`] ?? rc[`${type.toLowerCase()}_SlabExpr`];
      return `Slab (${slab || '0'})`;
    } else if (rType === 'Percentage') {
      const val = rc[`${type}_Rate`] ?? rc[`${type.toLowerCase()}_Rate`];
      return `Percentage (${val || 0}%)`;
    } else if (rType === 'Base Rate') {
      return 'Base Rate';
    }
    return '-';
  }

  parseConfiguredRates(item: any): Array<{ name: string; type: string; value: string; isFixed: boolean }> {
    if (!item) return [];
    const rates: Array<{ name: string; type: string; value: string; isFixed: boolean }> = [];

    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null) return item[k];
      }
      return null;
    };

    // 1. Normal Rate
    const normalType = getVal(['Normal_RateType', 'normal_RateType', 'normalRateType']);
    const normalRate = getVal(['Normal_Rate', 'normal_Rate', 'normalRate']);
    const normalSlab = getVal(['Normal_SlabExpr', 'normal_SlabExpr', 'normalSlabExpr']);
    if (normalType === 'Fixed') {
      rates.push({ name: 'Normal', type: 'Fixed', value: `₹ ${Number(normalRate || 0).toFixed(2)}`, isFixed: true });
    } else if (normalType === 'Slab') {
      rates.push({ name: 'Normal', type: 'Slab', value: (normalSlab && normalSlab !== '') ? normalSlab : '0', isFixed: false });
    }

    // 2. Pickup Rate
    const pickupType = getVal(['Pickup_RateType', 'pickup_RateType', 'pickupRateType']);
    const pickupRate = getVal(['Pickup_Rate', 'pickup_Rate', 'pickupRate']);
    const pickupSlab = getVal(['Pickup_SlabExpr', 'pickup_SlabExpr', 'pickupSlabExpr']);
    if (pickupType === 'Fixed') {
      rates.push({ name: 'Pickup', type: 'Fixed', value: `₹ ${Number(pickupRate || 0).toFixed(2)}`, isFixed: true });
    } else if (pickupType === 'Slab') {
      rates.push({ name: 'Pickup', type: 'Slab', value: (pickupSlab && pickupSlab !== '') ? pickupSlab : '0', isFixed: false });
    }

    // 3. RTO Rate
    const rtoType = getVal(['Rto_RateType', 'rto_RateType', 'rtoRateType']);
    const rtoRate = getVal(['Rto_Rate', 'rto_Rate', 'rtoRate']);
    const rtoSlab = getVal(['Rto_SlabExpr', 'rto_SlabExpr', 'rtoSlabExpr']);
    if (rtoType === 'Fixed') {
      rates.push({ name: 'RTO', type: 'Fixed', value: `₹ ${Number(rtoRate || 0).toFixed(2)}`, isFixed: true });
    } else if (rtoType === 'Slab') {
      rates.push({ name: 'RTO', type: 'Slab', value: (rtoSlab && rtoSlab !== '') ? rtoSlab : '0', isFixed: false });
    }

    // 4. DTO Rate
    const dtoType = getVal(['Dto_RateType', 'dto_RateType', 'dtoRateType']);
    const dtoRate = getVal(['Dto_Rate', 'dto_Rate', 'dtoRate']);
    const dtoSlab = getVal(['Dto_SlabExpr', 'dto_SlabExpr', 'dtoSlabExpr']);
    if (dtoType === 'Fixed') {
      rates.push({ name: 'DTO', type: 'Fixed', value: `₹ ${Number(dtoRate || 0).toFixed(2)}`, isFixed: true });
    } else if (dtoType === 'Slab') {
      rates.push({ name: 'DTO', type: 'Slab', value: (dtoSlab && dtoSlab !== '') ? dtoSlab : '0', isFixed: false });
    }

    // 5. FM Rate
    const fmType = getVal(['Fm_RateType', 'fm_RateType', 'fmRateType']);
    const fmRate = getVal(['Fm_Rate', 'fm_Rate', 'fmRate']);
    const fmSlab = getVal(['Fm_SlabExpr', 'fm_SlabExpr', 'fmSlabExpr']);
    if (fmType === 'Fixed') {
      rates.push({ name: 'FM', type: 'Fixed', value: `₹ ${Number(fmRate || 0).toFixed(2)}`, isFixed: true });
    } else if (fmType === 'Slab') {
      rates.push({ name: 'FM', type: 'Slab', value: (fmSlab && fmSlab !== '') ? fmSlab : '0', isFixed: false });
    }

    // 6. MFN Rate
    const mfnType = getVal(['MFN_RateType', 'mfN_RateType', 'mfn_RateType', 'mfnRateType']);
    const mfnRate = getVal(['MFN_Rate', 'mfN_Rate', 'mfn_Rate', 'mfnRate']);
    const mfnSlab = getVal(['MFN_SlabExpr', 'mfN_SlabExpr', 'mfn_SlabExpr', 'mfnSlabExpr']);
    if (mfnType === 'Fixed') {
      rates.push({ name: 'MFN', type: 'Fixed', value: `₹ ${Number(mfnRate || 0).toFixed(2)}`, isFixed: true });
    } else if (mfnType === 'Slab') {
      rates.push({ name: 'MFN', type: 'Slab', value: (mfnSlab && mfnSlab !== '') ? mfnSlab : '0', isFixed: false });
    }

    // Incentive Rate
    const incentiveType = getVal(['Incentive_RateType', 'incentive_RateType', 'incentiveRateType']);
    const incentiveRate = getVal(['Incentive_Rate', 'incentive_Rate', 'incentiveRate']);
    const incentiveSlab = getVal(['Incentive_SlabExpr', 'incentive_SlabExpr', 'incentiveSlabExpr']);
    if (incentiveType === 'Fixed') {
      rates.push({ name: 'Incentive', type: 'Fixed', value: `₹ ${Number(incentiveRate || 0).toFixed(2)}`, isFixed: true });
    } else if (incentiveType === 'Slab') {
      rates.push({ name: 'Incentive', type: 'Slab', value: (incentiveSlab && incentiveSlab !== '') ? incentiveSlab : '0', isFixed: false });
    }

    // Van Rate
    const vanType = getVal(['Van_RateType', 'van_RateType', 'vanRateType']);
    const vanRate = getVal(['Van_Rate', 'van_Rate', 'vanRate']);
    const vanSlab = getVal(['Van_SlabExpr', 'van_SlabExpr', 'vanSlabExpr']);
    if (vanType === 'Fixed') {
      rates.push({ name: 'Van', type: 'Fixed', value: `₹ ${Number(vanRate || 0).toFixed(2)}`, isFixed: true });
    } else if (vanType === 'Slab') {
      rates.push({ name: 'Van', type: 'Slab', value: (vanSlab && vanSlab !== '') ? vanSlab : '0', isFixed: false });
    }

    // Shopsy Rate
    const shopsyType = getVal(['Shopsy_RateType', 'shopsy_RateType', 'shopsyRateType']);
    const shopsyRate = getVal(['Shopsy_Deduction_Rate', 'shopsy_Deduction_Rate', 'shopsyDeductionRate', 'Shopsy_Rate', 'shopsy_Rate']);
    const shopsySlab = getVal(['Shopsy_SlabExpr', 'shopsy_SlabExpr', 'shopsySlabExpr']);
    if (shopsyType === 'Fixed') {
      rates.push({ name: 'Shopsy', type: 'Fixed', value: `₹ ${Number(shopsyRate || 0).toFixed(2)}`, isFixed: true });
    } else if (shopsyType === 'Slab') {
      rates.push({ name: 'Shopsy', type: 'Slab', value: (shopsySlab && shopsySlab !== '') ? shopsySlab : '0', isFixed: false });
    }

    // U2S Rate
    const u2sType = getVal(['U2S_RateType', 'u2S_RateType', 'u2s_RateType', 'u2sRateType']);
    const u2sRate = getVal(['U2S_Rate', 'u2S_Rate', 'u2s_Rate', 'u2sRate']);
    if (u2sType === 'Percentage') {
      rates.push({ name: 'U2S', type: 'Percentage', value: `${u2sRate !== null && u2sRate !== '' ? u2sRate : '0'}%`, isFixed: false });
    } else if (u2sType === 'Fixed') {
      rates.push({ name: 'U2S', type: 'Fixed', value: `₹ ${Number(u2sRate || 0).toFixed(2)}`, isFixed: true });
    }

    // Prexo Rate
    const prexoType = getVal(['Prexo_RateType', 'prexo_RateType', 'prexoRateType', 'Proxo_RateType', 'proxo_RateType']);
    const prexoRate = getVal(['Prexo_Rate', 'prexo_Rate', 'prexoRate', 'Proxo_Rate', 'proxo_Rate']);
    if (prexoType === 'Fixed') {
      rates.push({ name: 'Prexo', type: 'Fixed', value: `₹ ${Number(prexoRate || 0).toFixed(2)}`, isFixed: true });
    }

    // Grocery Rate
    const groceryType = getVal(['Grocery_RateType', 'grocery_RateType', 'groceryRateType']);
    const groceryRate = getVal(['Grocery_Rate', 'grocery_Rate', 'groceryRate']);
    if (groceryType === 'Base Rate') {
      rates.push({ name: 'Grocery', type: 'Base Rate', value: 'Base Rate', isFixed: false });
    } else if (groceryType === 'Fixed') {
      rates.push({ name: 'Grocery', type: 'Fixed', value: `₹ ${Number(groceryRate || 0).toFixed(2)}`, isFixed: true });
    }

    return rates;
  }
}
