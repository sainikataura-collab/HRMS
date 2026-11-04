import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { KraService } from '../RecruitServices/kra.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-emp-kra-import',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './emp-kra-import.component.html',
  styleUrls: ['./emp-kra-import.component.scss']
})
export class EmpKraImportComponent implements OnInit {
  ImportEmpKraForm!: FormGroup;
  selectedFile: File | null = null;
  validRecords: any[] = [];
  invalidRecords: any[] = [];
  allRecords: any;
  Num: any = 1;

  constructor(private fb: FormBuilder,

    private KRAService: KraService,

    private toastrService: ToastrService,
    private Loader: NgxUiLoaderService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ImportEmpKraForm = this.fb.group({
      file: [null, [Validators.required, Validators.pattern(/.*\.xlsx$/i)]]
    });

  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const isValid = file.name.toLowerCase().endsWith('.xlsx');

      if (isValid) {
        this.selectedFile = file;
        this.ImportEmpKraForm.patchValue({ file: file });
        this.ImportEmpKraForm.get('file')?.setErrors(null);
      } else {
        this.selectedFile = null;
        this.ImportEmpKraForm.patchValue({ file: null });
        this.ImportEmpKraForm.get('file')?.setErrors({ pattern: true });
        this.ImportEmpKraForm.get('file')?.markAsTouched();
      }
    }
  }





  exportTemplate() {
    const headers = [
      "EmpName", "empcode", "KRA", "KPA", "KPI", "TargetValue", "Weightage"
    ];

    const sampleRow = {
      EmpName: "",
      empcode: "",

      KRA: "",
      KPA: "",
      KPI: "",
      TargetValue: "",
      Weightage: ""
    };

    // Ensure row matches header order
    const orderedRow = headers.reduce((acc: any, key: string) => {
      acc[key] = (sampleRow as any)[key] || '';
      return acc;
    }, {});

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([orderedRow], { header: headers });
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KRA Template');

    XLSX.writeFile(wb, 'Employee_KRA_Template.xlsx');
  }











  onSubmit(): void {
    if (!this.selectedFile) {
      this.ImportEmpKraForm.get('file')?.setErrors({ required: true });
      this.ImportEmpKraForm.get('file')?.markAsTouched();
    }

    if (this.ImportEmpKraForm.invalid) {
      this.ImportEmpKraForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);

      this.Loader.start();

      this.KRAService.empWiseKRAImport(formData).subscribe({
        next: (res) => {
          this.Loader.stop();

          if (res.isSuccess) {
            this.toastrService.success("Rolewise KRA Data Imported.");

            if (Array.isArray(res.data)) {
              // Merge into one array for table
              this.allRecords = res.data.map((item: any, index: number) => ({
                sr_num: index + 1, // Add serial number starting from 1
                ...item,
                StatusWord: item.Status.split(' ')[0] // e.g., 'Valid' from 'Valid - Success'
              }));
            }

          } else {
            this.toastrService.error(res.Message);
          }
        },
        error: (err) => {
          this.Loader.stop();
          this.toastrService.error(err.Message);
        }
      });
    }
  }










  onReset(): void {
    this.ImportEmpKraForm.reset();
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
