import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { KraService } from '../RecruitServices/kra.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-rolewise-kra-import',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './rolewise-kra-import.component.html',
  styleUrl: './rolewise-kra-import.component.scss'
})
export class RolewiseKraImportComponent {
  ImportrolewiseKraForm!: FormGroup;
  selectedFile: File | null = null;
  validRecords: any[] = [];
  invalidRecords: any[] = [];
  allRecords: any;




  constructor(private fb: FormBuilder,

    private KRAService: KraService,

    private toastrService: ToastrService,
    private Loader: NgxUiLoaderService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.ImportrolewiseKraForm = this.fb.group({
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
        this.ImportrolewiseKraForm.patchValue({ file: file });
        this.ImportrolewiseKraForm.get('file')?.setErrors(null);
      } else {
        this.selectedFile = null;
        this.ImportrolewiseKraForm.patchValue({ file: null });
        this.ImportrolewiseKraForm.get('file')?.setErrors({ pattern: true });
        this.ImportrolewiseKraForm.get('file')?.markAsTouched();
      }
    }
  }

  exportTemplate() {
    const headers = [
      "RoleName", "KRA", "KPA", "KPI", "TargetValue", "Weightage"
    ];

    const sampleRow = {
   
      RoleName: "",
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
    XLSX.utils.book_append_sheet(wb, ws, 'Rolewise KRA Template');

    XLSX.writeFile(wb, 'Rolewise_KRA_Template.xlsx');
  }












  onSubmit(): void {
    if (!this.selectedFile) {
      this.ImportrolewiseKraForm.get('file')?.setErrors({ required: true });
      this.ImportrolewiseKraForm.get('file')?.markAsTouched();
    }

    if (this.ImportrolewiseKraForm.invalid) {
      this.ImportrolewiseKraForm.markAllAsTouched();
      return;
    }
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile!, this.selectedFile!.name);
      this.Loader.start();
      this.KRAService.importRolewiseKRA(formData).subscribe({
        next: (res) => {
          this.Loader.stop();
          if (res.isSuccess) {
            this.toastrService.success("Rolewise KRA Data Imported.");

            if (Array.isArray(res.data)) {
              // this.validRecords = res.data.filter((item: any) => item.Status === 'Valid');
              // this.invalidRecords = res.data.filter((item: any) => item.Status !== 'Valid');

               // Merge into one array for table
            this.allRecords = res.data.map((item: any,index:number) => ({
              sr_num: index + 1,
              ...item,
              StatusWord: item.Status.split(' ')[0] // e.g., 'Valid' from 'Valid - Success'
            }));

            }
          } else {
            this.toastrService.error(res.Message);
          }
        }

        ,
        error: (err) => {
          this.Loader.stop();
          this.toastrService.error(err.Message);
        }
      }

      );
    }




  }

  onReset(): void {
    this.ImportrolewiseKraForm.reset();
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }






}
