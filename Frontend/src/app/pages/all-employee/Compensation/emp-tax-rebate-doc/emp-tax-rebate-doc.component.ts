import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonSearchComponent } from '../../../all-dashboard/payroll/Employee/common-search/common-search.component';
import { ToastrService } from 'ngx-toastr';
import { LeaveTransactionService } from '../../../all-dashboard/payroll/services/leave-transaction.service';
import { LeavereqService } from '../../leaves/Service/leavereq.service';
import { CompensationService } from '../Service/compensation.service';
import { number } from 'mathjs';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { Console } from 'node:console';

@Component({
  selector: 'app-emp-tax-rebate-doc',
  standalone: true,
  imports: [NgSelectComponent, CommonModule, FormsModule, NgxPaginationModule, ReactiveFormsModule, CommonSearchComponent, RouterLink],
  templateUrl: './emp-tax-rebate-doc.component.html',
  styleUrl: './emp-tax-rebate-doc.component.scss'
})
export class EmpTaxRebateDocComponent {
  RebateDocForm!: FormGroup;
  IsSubsection = false
  submitted = false;
  isEditMode: boolean = false;
  showError = false;
  pk_docid: number = 0;
  Dec_Amt: number = 0;
  documentStatusList = [
    { label: 'Undertaking', value: 'U' },
    { label: 'Submitted', value: 'S' }
  ];
  sectionList: any[] = [];
  subsectionList: any[] = [];
  maxLimit: number | null = null;
  subMaxLimit: number | null = null;
  ImageUrl: string = '';
  FileName: string = '';
  ImagePath: string = '';
  oldfile: string = '';
    filemeassage: string = '';
  selectedFile: File | null = null;
  constructor(private fb: FormBuilder,
    private compensationService: CompensationService,
    private toastrService: ToastrService,
    private router: Router,
    private rout: ActivatedRoute,
    public encryptionService: EncryptionService) { }
  ngOnInit() {

    // Check if ID is provided in the route
    this.rout.paramMap.subscribe((params) => {
      const pk_docid = params.get('pk_docid');
      if (pk_docid) {
        this.pk_docid = +this.encryptionService.decryptText(pk_docid);
        this.isEditMode = true;
        this.getDataById(this.pk_docid);
      }
    });
    this.RebateDocForm = this.fb.group({
      pk_docid: [0],
      section: ['', Validators.required],
      Subsection: [''],
      documentStatus: ['', Validators.required],
      documentAmt: ['', [Validators.required,Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      remarks: [''],
      billNo: [''],
      billDate: [''],
      filepath: [''],
      fk_empid: [''],
      fk_finid: ['']
    });

    this.compensationService.getsectionddl().subscribe({
      next: (res) => {
        this.sectionList = res.data;
      },
      error: (err) => {
        console.error('Failed to load sections', err);
      }
    });

        this.RebateDocForm.get('documentStatus')?.valueChanges.subscribe(value => {
          if (value === 'S') {
            this.RebateDocForm.controls['billNo'].setValidators([
              Validators.required,
              Validators.maxLength(50)
            ]);
          } else {
            this.RebateDocForm.controls['billNo'].clearValidators();
            this.RebateDocForm.controls['billNo'].setValue('');  // Optional: clear value
          }
          this.RebateDocForm.controls['billNo'].updateValueAndValidity();
        });
  }

  convertToISODate(ddmmyyyy: string): string {
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  getDataById(pk_docid: number): void {

    this.compensationService.getByIdrebateDoc(pk_docid).subscribe({
      next: (res) => {
        if (res?.isSuccess && res?.data) {
            const date = res.data.billdate ? this.convertToISODate(res.data.billdate) : null;
           const fk_subsecid = res.data.fk_subsecid ;
           const billno = res.data.billno;
          const section = res.data.fk_secid
          const docsub_Amt = res.data.docsub_Amt
          const docsub_status = res.data.docsub_status
          this.Dec_Amt = res.data.UnderTaking_Amt || 0
          this.oldfile = res.data.filename || '';
      this.ImageUrl = this.oldfile;  // Just store the filename for now
      console.log("hh", this.ImageUrl);
          this.RebateDocForm.patchValue(
            {
              ...res.data,
              billDate: date,
              section: section,
              documentAmt: docsub_Amt,
              documentStatus: docsub_status,
              billNo: billno,
              //   Subsection:fk_subsecid,
              // Dec_Amt:UnderTaking_Amt
            });
          this.onSectionChange(section);
          // setTimeout(() => {
          //   this.RebateDocForm.patchValue({
          //     Subsection: fk_subsecid
          //   });
          // }, 100);
          setTimeout(() => {
  this.RebateDocForm.patchValue({ Subsection: fk_subsecid });

  if (this.subsectionList.length > 0) {
    this.RebateDocForm.controls['Subsection'].setValidators(Validators.required);
  } else {
    this.RebateDocForm.controls['Subsection'].clearValidators();
  }
  this.RebateDocForm.controls['Subsection'].updateValueAndValidity();
}, 100);
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      }
    });
  }
download(filename: string): void {
  this.compensationService.getrebateDoc(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace(/[\s()]/g, '_');
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Failed to load file:', err);
    }
  });
}

  
  onFileChange(event: any): void {
    debugger
    const file = event.target.files[0];
    if (file) {

        const fileType = file.type;
    if (fileType.startsWith('image/')) {
     this.filemeassage="Image type file is not allow!"
      event.target.value = ''; 
        setTimeout(() => {
        this.filemeassage = '';
      }, 2000);
      return;
    }
    

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      event.target.value = ''; 
      return;
    }
      this.selectedFile = file;
      this.FileName = file.name;
      this.RebateDocForm.patchValue({ filepath: file.name });

      // Optional: Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
       'this.ImageUrl = e.target.result;' 
      };
      reader.readAsDataURL(file);
    }
  }

  onSectionChange(selected: any): void {
    if (selected && selected.Description !== undefined) {
      this.maxLimit = selected.Description;
    } else {
      this.maxLimit = null;
    }
    selected = this.RebateDocForm.get('section')?.value;
    this.compensationService.getsubsectionddl(selected).subscribe({
      next: (res) => {
           this.subsectionList = res.data || [];
        if (this.subsectionList.length > 0) {
   this.IsSubsection = true;
        this.RebateDocForm.controls['Subsection'].setValidators(Validators.required);
        }
        else {
          this.IsSubsection = false
         this.RebateDocForm.controls['Subsection'].clearValidators();
        this.RebateDocForm.patchValue({ Subsection: '' });
          this.subMaxLimit = null; // clear limit

        }
        
      this.RebateDocForm.controls['Subsection'].updateValueAndValidity();
      }
    })
  }

  onSubSectionChange(subCode: any): void {
    // const selected = this.subsectionList.find(x => x.Value === subCode);
    // this.subMaxLimit = selected?.Description ?? null;

    if (subCode && subCode.Description !== undefined) {
      this.subMaxLimit = subCode.Description;
    } else {
      this.subMaxLimit = null;
    }
  }
  resetForm() { }
  // onSubmit(){}

  onSubmit(): void {
    this.submitted = true;
    if (this.RebateDocForm.invalid) {
      this.showError = true;
      return;
    }
    const formValues = this.RebateDocForm.value;
    const formData = new FormData();
    formData.append('fk_empid', formValues.fk_empid || '');
    formData.append('fk_finid', formValues.fk_finid || '');
    if(this.isEditMode){
    formData.append('pk_docid', this.isEditMode ? this.pk_docid.toString() : '');
    }
   
    formData.append('fk_secid', formValues.section);
    formData.append('fk_subsecid', formValues.Subsection||'');
    formData.append('docsub_status', formValues.documentStatus);
    formData.append('docsub_Amt', formValues.documentAmt);
    formData.append('remarks', formValues.remarks || '');
    formData.append('billno', formValues.billNo || '');
    if (formValues.billDate) {
      const dateObj = new Date(formValues.billDate);
      const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
      formData.append('billdate', formattedDate);
    } else {
      formData.append('billdate', '');
    }

    if (this.selectedFile) {
      formData.append('filepath', this.selectedFile); // New file
    } else if (this.oldfile) {
      formData.append('attachment', this.oldfile); // Use old file
    }
    // Step 5: API call (add/update)
    if (this.isEditMode && this.pk_docid) {
      this.compensationService.Update_RebateDocument(formData).subscribe(
        (response) => {
          if (response.isSuccessfull) {
              this.toastrService.success('Tax rebate document updated successfully!');
            this.router.navigate(['/dash/reimbursement/reimbursementdashboard/RebateDocumentList']);

          } else {
             this.toastrService.warning('Failed to update Tax rebate document');

          }
        },
        (error) => {
          console.error('Update Error:', error);
          this.toastrService.error('Error updating appreciation');
        }
      );
    } else {
      this.compensationService.insert_RebateDocument(formData).subscribe(
        (response) => {
          if (response.isSuccessfull) {
             this.toastrService.success('Tax rebate document insert successfully!');
            this.router.navigate(['/dash/reimbursement/reimbursementdashboard/RebateDocumentList']);

          } else {
             this.toastrService.warning('Failed to insert Tax rebate document');

          }
        },
        (error) => {
          console.error('Create Error:', error);
          this.toastrService.error('Error creating appreciation');
        }
      );
    }
  }

}
