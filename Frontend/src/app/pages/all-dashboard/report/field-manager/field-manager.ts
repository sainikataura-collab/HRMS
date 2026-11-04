import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReportService, SchemaData, FieldDefinition, ModelResponse } from '../services/report';

@Component({
  selector: 'app-field-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-manager.html',
  styleUrls: ['./field-manager.css']
})
export class FieldManagerComponent implements OnInit {

  reportNames: string[] = [];
  selectedReport: string = '';

  // Holds the original, unmodified data from the API
  schemaData: SchemaData[] = []; 
  // Holds the data currently displayed in the view after filtering
  filteredSchemaData: SchemaData[] = [];
  
  // Properties to store the text from the filter inputs
  tableFilterText: string = '';
  columnFilterText: string = '';

  activeFields: { [tableName: string]: { [columnName: string]: boolean } } = {};
  isLoading = false;
  
  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getReportList().subscribe((response: ModelResponse) => {
      if (response.isSuccess && response.data) {
        this.reportNames = response.data;
      }
    });
  }

  onReportSelect(): void {
    if (!this.selectedReport) {
      this.schemaData = [];
      this.filteredSchemaData = [];
      return;
    }
    this.isLoading = true;
    
    forkJoin({
      schemaResponse: this.reportService.getDatabaseSchema(),
      availableFieldsResponse: this.reportService.getAvailableFieldsForReport(this.selectedReport)
    }).subscribe(({ schemaResponse, availableFieldsResponse }) => {
      if (schemaResponse.isSuccess && availableFieldsResponse.isSuccess) {
        // Store the original schema data
        this.schemaData = schemaResponse.data;
        this.initializeCheckboxes(availableFieldsResponse.data);
        // Apply any existing filters to the new data
        this.applyFilters(); 
      }
      this.isLoading = false;
    });
  }

  createNewReport(): void {
    const reportName = prompt('Please enter the name for the new report:');
    if (reportName && reportName.trim() !== '') {
      this.reportService.createReport(reportName.trim()).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            alert(`Report '${response.data.reportName}' created successfully!`);
            this.reportNames.push(response.data.reportName);
            this.selectedReport = response.data.reportName;
            this.onReportSelect();
          } else {
            alert(`Error: ${response.message}`);
          }
        },
        error: (err) => {
          alert(`Failed to create report: ${err.error.message || 'Server error'}`);
        }
      });
    }
  }

  initializeCheckboxes(availableFields: FieldDefinition[]): void {
    this.activeFields = {}; // Reset
    for (const table of this.schemaData) {
      this.activeFields[table.tablename] = {};
      for (const field of table.fields) {
        const isChecked = availableFields.some(af => af.tableName === table.tablename && af.columnName === field);
        this.activeFields[table.tablename][field] = isChecked;
      }
    }
  }

  // UPDATED: This method now calls the central applyFilters method
  filterTables(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableFilterText = filterValue;
    this.applyFilters();
  }

  // NEW: This method handles the new column filter input
  filterColumns(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.columnFilterText = filterValue;
    this.applyFilters();
  }

  // NEW: A central method to handle all filtering logic
  applyFilters(): void {
    // Start with a fresh copy of the original data
    let data = JSON.parse(JSON.stringify(this.schemaData));

    // 1. Filter by table name if there is text in the table filter
    if (this.tableFilterText) {
      data = data.filter((table: any) => 
        table.tablename.toLowerCase().includes(this.tableFilterText.toLowerCase())
      );
    }

    // 2. Filter by column name if there is text in the column filter
    if (this.columnFilterText) {
      data = data.map((table: any) => {
        const filteredFields = table.fields.filter((field: string) => 
          field.toLowerCase().includes(this.columnFilterText.toLowerCase())
        );
        return { ...table, fields: filteredFields };
      }).filter((table: any) => table.fields.length > 0); // Remove tables with no matching fields
    }

    this.filteredSchemaData = data;
  }

  saveChanges(): void {
    if (!this.selectedReport) {
      alert('Please select a report first.');
      return;
    }
    const fieldsToSave: { tableName: string, columnName: string }[] = [];
    for (const tableName in this.activeFields) {
      for (const columnName in this.activeFields[tableName]) {
        if (this.activeFields[tableName][columnName]) {
          fieldsToSave.push({ tableName, columnName });
        }
      }
    }

    this.reportService.updateAvailableFieldsForReport(this.selectedReport, fieldsToSave).subscribe(response => {
      if (response.isSuccess) {
        alert('Available fields updated successfully!');
      }
    });
  }
}