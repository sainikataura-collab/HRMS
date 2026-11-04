import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { ReportService, ModelResponse, FieldDefinition, ReportFieldInfo } from '../services/report';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './admin-builder.html',
  styleUrls: ['./admin-builder.css']
})
export class AdminBuilderComponent implements OnInit {
  reportNames: string[] = [];
  selectedReport: string = '';
  saveSuccessMessage: string | null = null;
  
  // Master list of available fields
  availableFieldsForDrag: FieldDefinition[] = [];
  // The list that is actually displayed and filtered in the UI
  filteredAvailableFieldsForDrag: FieldDefinition[] = [];
  
  includedFieldsForDrag: ReportFieldInfo[] = [];
  private originalIncludedFields: ReportFieldInfo[] = [];

  private fieldsForCurrentReport: FieldDefinition[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getReportList().subscribe({
        next: (response) => {
            if (response.isSuccess) this.reportNames = response.data;
        }
    });
  }

  onReportSelect(): void {
    if (!this.selectedReport) {
      this.availableFieldsForDrag = [];
      this.filteredAvailableFieldsForDrag = [];
      this.includedFieldsForDrag = [];
      this.fieldsForCurrentReport = [];
      return;
    }
    forkJoin({
      available: this.reportService.getAvailableFieldsForReport(this.selectedReport),
      included: this.reportService.getIncludedFieldsForReport(this.selectedReport)
    }).subscribe(({ available, included }) => {
      if (available.isSuccess && included.isSuccess) {
        this.fieldsForCurrentReport = [...available.data];
        
        const includedFieldsData: ReportFieldInfo[] = included.data;
        
        this.includedFieldsForDrag = includedFieldsData.map(field => ({
            ...field,
            alias: field.alias || field.fieldName 
        })).sort((a, b) => a.orderIndex - b.orderIndex);

        this.originalIncludedFields = JSON.parse(JSON.stringify(this.includedFieldsForDrag));
        
        const includedFieldNames = new Set(this.includedFieldsForDrag.map(f => f.fieldName));
        this.availableFieldsForDrag = this.fieldsForCurrentReport.filter(f => !includedFieldNames.has(f.fieldName));
        this.filteredAvailableFieldsForDrag = [...this.availableFieldsForDrag];
      }
    });
  }

  filterAvailableFields(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (!filterValue) {
      this.filteredAvailableFieldsForDrag = [...this.availableFieldsForDrag];
      return;
    }
    this.filteredAvailableFieldsForDrag = this.availableFieldsForDrag.filter(field =>
      field.fieldName.toLowerCase().includes(filterValue)
    );
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const itemToMove: FieldDefinition = event.previousContainer.data[event.previousIndex];
      
      const newIncludedField: ReportFieldInfo = {
        fieldName: itemToMove.fieldName,
        tableName: itemToMove.tableName,
        columnName: itemToMove.columnName,
        dataType: itemToMove.dataType,
        alias: itemToMove.fieldName,
        orderIndex: event.currentIndex,
        isFilter: false
      };

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      event.container.data[event.currentIndex] = newIncludedField;
    }
  }

  // NEW: Method to move all visible available fields to the included list
  includeAllFields(): void {
    if (this.filteredAvailableFieldsForDrag.length === 0) {
      return;
    }

    // Transform each visible available field into a ReportFieldInfo object
    const fieldsToInclude = this.filteredAvailableFieldsForDrag.map((field, index) => ({
      fieldName: field.fieldName,
      tableName: field.tableName,
      columnName: field.columnName,
      dataType: field.dataType,
      alias: field.fieldName, // Default alias to the field name
      orderIndex: this.includedFieldsForDrag.length + index,
      isFilter: false
    }));

    // Add the newly created fields to the end of the included list
    this.includedFieldsForDrag.push(...fieldsToInclude);

    // Remove the moved fields from the master available list
    const movedFieldNames = new Set(this.filteredAvailableFieldsForDrag.map(f => f.fieldName));
    this.availableFieldsForDrag = this.availableFieldsForDrag.filter(f => !movedFieldNames.has(f.fieldName));

    // Clear the filtered list since all its items have now been moved
    this.filteredAvailableFieldsForDrag = [];
  }

  saveChanges(): void {
    if (!this.selectedReport) {
      alert('Please select a report to save.');
      return;
    }

    const payload: ReportFieldInfo[] = this.includedFieldsForDrag.map((field, index) => ({
      ...field,
      orderIndex: index
    }));

    this.reportService.updateIncludedFieldsForReport(this.selectedReport, payload).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.saveSuccessMessage = `Report '${this.selectedReport}' saved successfully!`;
          this.originalIncludedFields = JSON.parse(JSON.stringify(this.includedFieldsForDrag));
          setTimeout(() => { this.saveSuccessMessage = null; }, 3000);
        } else {
          alert(`Error saving report: ${response.message}`);
        }
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'A critical server error occurred.';
        alert(`Failed to save report: ${errorMessage}`);
        console.error(err);
      }
    });
  }

  moveField(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    moveItemInArray(this.includedFieldsForDrag, index, newIndex);
  }

  removeField(index: number): void {
    const [removedFieldInfo] = this.includedFieldsForDrag.splice(index, 1);
    const originalField = this.fieldsForCurrentReport.find(f => f.fieldName === removedFieldInfo.fieldName);
    if (originalField) {
      this.availableFieldsForDrag.push(originalField);
      this.filteredAvailableFieldsForDrag.push(originalField);
    }
  }
  
  resetReport(): void {
    if (!this.selectedReport) return;
    
    this.includedFieldsForDrag = JSON.parse(JSON.stringify(this.originalIncludedFields));
    
    const includedFieldNames = new Set(this.includedFieldsForDrag.map(f => f.fieldName));
    this.availableFieldsForDrag = this.fieldsForCurrentReport.filter(f => !includedFieldNames.has(f.fieldName));
    this.filteredAvailableFieldsForDrag = [...this.availableFieldsForDrag];
  }
  
  clearAllFields(): void {
    if (!this.selectedReport) return;

    this.availableFieldsForDrag = [...this.fieldsForCurrentReport];
    this.filteredAvailableFieldsForDrag = [...this.fieldsForCurrentReport];
    this.includedFieldsForDrag = [];
  }
  
  trackByFieldName(index: number, item: FieldDefinition | ReportFieldInfo): string {
    return item.fieldName;
  }
}
