import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ModelResponse, ReportFieldInfo } from '../services/report';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-reports.html',
  styleUrls: ['./user-reports.css']
})
export class UserReportsComponent implements OnInit {
  allReportNames: string[] = [];
  filteredReportNames: string[] = [];
  reportFilter: string = '';

  // --- STATE FOR FILTER MODAL ---
  filterableFields: ReportFieldInfo[] = [];
  filterValues: { [key: string]: any } = {};
  distinctValues: { [key: string]: string[] } = {};
  isLoadingFilters = false;
  isDownloading = false;
  selectedReportForFilter: string | null = null;

  // --- State for custom multi-select dropdown ---
  activeDropdown: string | null = null;
  dropdownFilters: { [key: string]: string } = {};

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getReportList().subscribe((response: ModelResponse) => {
      if (response.isSuccess) {
        this.allReportNames = response.data.sort();
        this.filteredReportNames = this.allReportNames;
      }
    });
  }
  
  filterReports(): void {
    const filterText = this.reportFilter.toLowerCase();
    this.filteredReportNames = this.allReportNames.filter(name => 
      name.toLowerCase().includes(filterText)
    );
  }

  openFilterModal(reportName: string): void {
    this.selectedReportForFilter = reportName;
    this.isLoadingFilters = true;
    this.filterValues = {};
    this.distinctValues = {};
    this.dropdownFilters = {};

    this.reportService.getFilterableFieldsForReport(reportName).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.filterableFields = response.data;
          this.filterableFields.forEach(field => {
            const fieldType = field.dataType;
            
            if (fieldType === 'date' || fieldType === 'datetime' || fieldType === 'number') {
              this.filterValues[field.fieldName] = { type: fieldType, conditions: [{ operator: 'between', from: null, to: null }] };
            } else if (fieldType === 'text' || fieldType === 'multi-select-text') {
              this.filterValues[field.fieldName] = { type: 'multi-select-text', values: [] };
              this.dropdownFilters[field.fieldName] = '';
              this.fetchDistinctValues(field.tableName, field.columnName, field.fieldName);
            } else { // Handles 'boolean', 'contains-text', etc.
              this.filterValues[field.fieldName] = { type: fieldType, value: null };
            }
          });
        }
        this.isLoadingFilters = false;
      },
      error: (err) => {
        console.error("Failed to load filterable fields", err);
        this.isLoadingFilters = false;
      }
    });
  }

  fetchDistinctValues(tableName: string, columnName: string, fieldName: string): void {
    this.reportService.getDistinctFieldValues(tableName, columnName).subscribe(response => {
      if (response.isSuccess) {
        this.distinctValues[fieldName] = response.data.sort();
      }
    });
  }

  closeFilterModal(): void {
    this.selectedReportForFilter = null;
    this.filterableFields = [];
    this.activeDropdown = null;
  }

  addCondition(fieldName: string): void {
    this.filterValues[fieldName].conditions.push({ operator: 'between', from: null, to: null });
  }

  removeCondition(fieldName: string, index: number): void {
    this.filterValues[fieldName].conditions.splice(index, 1);
  }

  // --- Methods for custom multi-select dropdown ---

  toggleDropdown(fieldName: string, state: boolean): void {
    setTimeout(() => {
      this.activeDropdown = state ? fieldName : null;
    }, 150);
  }

  selectItem(fieldName: string, option: string): void {
    const currentValues = this.filterValues[fieldName].values;
    if (!currentValues.includes(option)) {
      currentValues.push(option);
    }
    this.dropdownFilters[fieldName] = '';
    this.activeDropdown = null;
  }

  removeSelectedItem(fieldName: string, itemToRemove: string): void {
    const currentValues = this.filterValues[fieldName].values;
    this.filterValues[fieldName].values = currentValues.filter((item: string) => item !== itemToRemove);
  }

  getFilteredOptions(fieldName: string): string[] {
    const allOptions = this.distinctValues[fieldName] || [];
    const selectedOptions = this.filterValues[fieldName].values || [];
    const filterText = this.dropdownFilters[fieldName]?.toLowerCase() || '';

    return allOptions.filter(option => 
      !selectedOptions.includes(option) && option.toLowerCase().includes(filterText)
    );
  }
  
  // **FIX:** Re-added the missing method to prevent template compilation error.
  filterDropdownOptions(fieldName: string): void {}

  downloadWithFilters(): void {
    if (!this.selectedReportForFilter) return;
    this.isDownloading = true;

    const finalFilters: any[] = [];

    for (const field of this.filterableFields) {
      const filterData = this.filterValues[field.fieldName];
      if (!filterData) continue;

      const type = filterData.type;

      if (type === 'multi-select-text') {
        if (filterData.values && filterData.values.length > 0) {
          finalFilters.push({
            fieldName: field.columnName,
            type: type,
            values: filterData.values,
            operator: '=' 
          });
        }
      } else if (type === 'date' || type === 'datetime' || type === 'number') {
        const validConditions = filterData.conditions.filter((c: any) => 
          c.from !== null && c.from !== undefined && c.from !== ''
        );
        
        for (const condition of validConditions) {
          let payload: any = {
            fieldName: field.columnName,
            values: [condition.from]
          };

          if (condition.operator === 'between') {
            if (!condition.to) continue;
            payload.type = `${type}-range`;
            payload.values = [{ from: condition.from, to: condition.to }];
            payload.operator = '=';
          } else {
            payload.type = `${type}-comparison`;
            payload.operator = this.mapOperatorToSymbol(condition.operator);
          }

          finalFilters.push(payload);
        }
      } else if (type === 'boolean' || type === 'contains-text') {
        if (filterData.value !== null && filterData.value !== undefined && filterData.value !== '') {
          finalFilters.push({
            fieldName: field.columnName,
            type: type,
            values: [String(filterData.value)],
            operator: '='
          });
        }
      }
    }

    console.log('Filters JSON sent to backend:', JSON.stringify(finalFilters, null, 2));

    this.reportService.downloadReport(this.selectedReportForFilter, finalFilters).subscribe({
      next: (blob: Blob) => {
        this.isDownloading = false;
        if (blob.type === "application/json") {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorResponse = JSON.parse(reader.result as string);
              alert(`Failed to generate report: ${errorResponse.message || 'An unknown server error occurred.'}`);
            } catch (e) {
              alert('An unexpected error occurred while parsing the server response.');
            }
          };
          reader.readAsText(blob);
        } else {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = `${this.selectedReportForFilter}.xlsx`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(objectUrl);
          a.remove();
          this.closeFilterModal();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isDownloading = false;
        const errorBlob = err.error;

        if (errorBlob instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorResponse = JSON.parse(reader.result as string);
              alert(`Failed to download report: ${errorResponse.message || 'An unknown server error occurred.'}`);
            } catch (e) {
              alert(`An unexpected error occurred. Server response: ${reader.result}`);
            }
          };
          reader.onerror = () => {
            alert('Could not read the server error response.');
          };
          reader.readAsText(errorBlob);
        } else {
          alert(`A network or unexpected error occurred: ${err.statusText}`);
        }
      }
    });
  }

  private mapOperatorToSymbol(operator: string): string {
    switch (operator) {
      case 'equals': return '=';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      case 'greaterThanOrEquals': return '>=';
      case 'lessThanOrEquals': return '<=';
      default: return '=';
    }
  }
}