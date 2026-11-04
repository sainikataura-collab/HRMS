import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { CtcConfigService } from '../../services/ctc-config.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-ctc-configuration-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxPaginationModule],
  templateUrl: './ctc-configuration-list.component.html',
  styleUrl: './ctc-configuration-list.component.scss'
})
export class CtcConfigurationListComponent implements OnInit {
  // Inject dependencies
  private ctcConfigService = inject(CtcConfigService);
  private toastrService = inject(ToastrService);
  private ngxUILoaderService = inject(NgxUiLoaderService);
  private router = inject(Router);
  public encryptionService = inject(EncryptionService);

  // States
  searchText: string = '';
  configList: any[] = [];
  pageIndex: number = 1;
  pageSize: number = 8;
  totalItems: number = 0;

  // Master lists for translating ID CSVs
  locationList: { name: string; value: string }[] = [];
  departmentList: { name: string; value: string }[] = [];
  categoryList: { name: string; value: string }[] = [];
  gradeList: { name: string; value: string }[] = [];

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadConfigs();
  }

  loadDropdowns(): void {
    const fields = [
      { name: 'Location', target: 'locationList' },
      { name: 'Department', target: 'departmentList' },
      { name: 'Category', target: 'categoryList' },
      { name: 'Grade', target: 'gradeList' }
    ];

    fields.forEach(f => {
      this.ctcConfigService.getDropdownList(f.name).subscribe({
        next: (res) => {
          if (res?.isSuccess && res.data?.length) {
            (this as any)[f.target] = res.data.map((item: any) => ({
              name: item.name,
              value: item.value
            }));
          }
        }
      });
    });
  }

  loadConfigs(): void {
    this.ngxUILoaderService.start();
    this.ctcConfigService.getCTCConfigs(this.pageIndex - 1, this.pageSize, this.searchText).subscribe({
      next: (res) => {
        if (res?.isSuccess) {
          this.configList = res.data || [];
          this.totalItems = res.totalCount || 0;
        } else {
          this.toastrService.error(res?.message || 'Failed to retrieve CTC configurations.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Error loading CTC configs:', err);
        this.toastrService.error('An error occurred while loading CTC configurations.');
        this.ngxUILoaderService.stop();
      }
    });
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.loadConfigs();
  }

  onPageChange(event: number): void {
    this.pageIndex = event;
    this.loadConfigs();
  }

  getNamesArray(idsStr: string, list: { name: string; value: string }[]): string[] {
    if (!idsStr) return [];
    const ids = idsStr.split(',').map(id => id.trim()).filter(id => id.length > 0);
    return ids
      .map(id => {
        const found = list.find(item => item && item.value && item.value.toString() === id);
        return found ? found.name : id;
      })
      .map(name => name ? name.trim() : '')
      .filter(name => name.length > 0);
  }

  getShortNames(idsStr: string, list: { name: string; value: string }[]): string {
    const names = this.getNamesArray(idsStr, list);
    if (names.length === 0) return 'All';
    if (names.length <= 2) return names.join(', ');
    return names.slice(0, 2).join(', ');
  }

  hasMoreNames(idsStr: string, list: { name: string; value: string }[]): boolean {
    const names = this.getNamesArray(idsStr, list);
    return names.length > 2;
  }

  getMoreCount(idsStr: string, list: { name: string; value: string }[]): number {
    const names = this.getNamesArray(idsStr, list);
    return names.length - 2;
  }

  getAllNames(idsStr: string, list: { name: string; value: string }[]): string {
    const names = this.getNamesArray(idsStr, list);
    return names.join(', ');
  }

  isUpdate(id: any): void {
    const encryptedId = this.encryptionService.encryptText(id.toString());
    this.router.navigateByUrl(`/dash/user/userdashboard/CtcConfiguration/${encryptedId}`);
  }

  deleteConfig(id: any, name: string): void {
    if (confirm(`Are you sure you want to delete the configuration "${name}"?`)) {
      this.ngxUILoaderService.start();
      this.ctcConfigService.deleteCTCConfig(id).subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.toastrService.success(res.message || 'CTC Configuration deleted successfully.');
            this.loadConfigs();
          } else {
            this.toastrService.error(res?.message || 'Failed to delete configuration.');
          }
          this.ngxUILoaderService.stop();
        },
        error: (err) => {
          console.error('Error deleting CTC config:', err);
          this.toastrService.error('An error occurred during deletion.');
          this.ngxUILoaderService.stop();
        }
      });
    }
  }
}
