import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import * as FileSaver from 'file-saver';
import { CustomerRateCardService } from '../../services/customer-rate-card.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-rate-card-upload',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './customer-rate-card-upload.component.html',
  styleUrl: './customer-rate-card-upload.component.scss'
})
export class CustomerRateCardUploadComponent implements OnInit {
  importedData: any[] = [];
  searchControl = new FormControl('');
  searchText = '';
  filteredData: any[] = [];
  uploadedCount: number = 0;
  notUploadedCount: number = 0;
  currentFilter: 'All' | 'Uploaded' | 'Not Uploaded' = 'All';

  importForm!: FormGroup;
  selectedFile: File | undefined;
  
  dynamicColumns: string[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CustomerRateCardService,
    private loader: NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchText = value?.toLowerCase() || '';
      this.filterData();
    });

    this.importForm = this.fb.group({
      file: [null, [Validators.required, Validators.pattern(/\.(xlsx)$/i)]]
    });
  }

  // Export blank sample template Excel
  exportTemplate(): void {
    this.loader.start();
    this.service.getDynamicHeads().subscribe({
      next: (res) => {
        this.loader.stop();
        let earningHeads: string[] = [];
        if (res.isSuccess && res.data) {
          // Assuming data is an array of objects like { HeadName: 'Basic', pk_headid: 1 }
          earningHeads = res.data.map((h: any) => h.shortdesc || h.HeadName || h.headName || h.Name || h.description).filter(Boolean);
        }

        const headers = [
          'CustomerName',
          'LocationName',
          'CategoryName',
          'ServiceTypeName',
          'WorkDurationName'
        ];
        
        // Append dynamic heads
        earningHeads.forEach(head => headers.push(head));

        const sampleRow: any = {
          CustomerName: 'EMPOWER',
          LocationName: 'GGN',
          CategoryName: 'General',
          ServiceTypeName: 'Adhoc',
          WorkDurationName: '5 Hours'
        };

        // Default all earning heads to 0
        earningHeads.forEach(head => {
          sampleRow[head] = 0;
        });

        const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CustomerRateCard Template');

        XLSX.writeFile(wb, 'CustomerRateCard_Import_Template.xlsx');
      },
      error: (err) => {
        this.loader.stop();
        console.error('Failed to get dynamic heads', err);
        alert('Failed to get dynamic heads for the template.');
      }
    });
  }

  setFilter(filter: 'All' | 'Uploaded' | 'Not Uploaded'): void {
    this.currentFilter = filter;
    this.filterData();
  }

  filterData(): void {
    this.uploadedCount = this.importedData.filter(item => item.IsSuccess === true || item.Status === 'Uploaded' || item.Status === 'Updated' || item.Status === 'Success').length;
    this.notUploadedCount = this.importedData.length - this.uploadedCount;

    const lowerText = this.searchText.toLowerCase();
    this.filteredData = this.importedData.filter(item => {
      const matchesSearch = Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(lowerText)
      );

      let matchesStatus = true;
      const isSuccessStatus = item.IsSuccess === true || item.Status === 'Uploaded' || item.Status === 'Updated' || item.Status === 'Success';
      if (this.currentFilter === 'Uploaded') {
        matchesStatus = isSuccessStatus;
      } else if (this.currentFilter === 'Not Uploaded') {
        matchesStatus = !isSuccessStatus;
      }

      return matchesSearch && matchesStatus;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedFile = file;
      this.importForm.get('file')?.setValue(file);
    } else {
      this.importForm.get('file')?.setErrors({ pattern: true });
    }
  }

  resetForm(): void {
    this.importForm.reset();
    this.selectedFile = undefined;
    this.importedData = [];
    this.filteredData = [];
    this.dynamicColumns = [];
  }

  onSubmit(): void {
    if (this.importForm.invalid) {
      this.importForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.loader.start();
      this.service.uploadCustomerRateCardExcel(formData).subscribe({
        next: (res: any) => {
          this.loader.stop();
          this.importedData = res.data || res || [];
          
          if (this.importedData.length > 0) {
            // Extract dynamic columns from the first row (excluding internal fields like IsSuccess, Message, Status, RowIndex)
            const firstRow = this.importedData[0];
            const excludeCols = ['IsSuccess', 'Message', 'Status', 'RowIndex'];
            this.dynamicColumns = Object.keys(firstRow).filter(k => !excludeCols.includes(k));
          }
          
          this.filterData();
        },
        error: (err: any) => {
          console.error('Error uploading file:', err);
          this.loader.stop();
          alert(err.message || 'Error occurred while uploading Excel file.');
        }
      });
    }
  }

  downloadExcel(): void {
    if (this.filteredData.length === 0) {
        alert("No data available to export.");
        return;
    }

    const exportData = this.filteredData.map((row: any) => {
      const mappedRow: any = {
        Status: (row.IsSuccess === true || row.Status === 'Uploaded' || row.Status === 'Updated' || row.Status === 'Success') ? 'Uploaded' : (row.Message || row.Status || 'Failed')
      };
      
      // Append all dynamic columns
      this.dynamicColumns.forEach(col => {
        mappedRow[col] = row[col];
      });
      
      return mappedRow;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Results': worksheet },
      SheetNames: ['Results']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    FileSaver.saveAs(data, 'CustomerRateCard_Import_Result.xlsx');
  }
}
