import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PrograssionDetailService } from '../../performance/Service/prograssion-detail.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-rent-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './rent-details.component.html',
  styleUrl: './rent-details.component.scss'
})
export class RentDetailsComponent {
  form!: FormGroup;
  fillAmount = 0;
  selectedFile: File | null = null;
  pk_rentId!: string;
  Isedit = false;
  existingFileName: string = '';
  submitted = false;

  // months = [
  //   { label: 'APRIL', value: '4' },
  //   { label: 'MAY', value: '5' },
  //   { label: 'JUNE', value: '6' },
  //   { label: 'JULY', value: '7' },
  //   { label: 'AUGUST', value: '8' },
  //   { label: 'SEPTEMBER', value: '9' },
  //   { label: 'OCTOBER', value: '10' },
  //   { label: 'NOVEMBER', value: '11' },
  //   { label: 'DECEMBER', value: '12' },
  //   { label: 'JANUARY', value: '1' },
  //   { label: 'FEBRUARY', value: '2' },
  //   { label: 'MARCH', value: '3' }
  // ];


  financialMonths: any[] = [];



  constructor(
    private fb: FormBuilder,
    private httpService: PrograssionDetailService,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.form = this.fb.group({
      fk_empid: [''],
      fk_finid: [''],
      docsub_status: ['', Validators.required],
      remarks: [''],
      panNo: [''],
      landlordName: [''],
      landlordAddress: [''],
      rentDetailType: [''],
      landlordAccountNumber: [''],
      file: [''],
      monthlyRentList: this.fb.array([])
    });

    this.form.get('docsub_status')?.valueChanges.subscribe(() => {
      this.updateLandlordValidation();
    });

    const encryptedRentId = this.route.snapshot.params['pk_rentId'];

    // EDIT MODE
    if (encryptedRentId && encryptedRentId !== 'undefined') {
      this.pk_rentId = encryptedRentId;
      this.Isedit = true;
       this.loadFinancialYearMonths(this.Isedit,this.pk_rentId);
      // this.loadRentDetailsData(this.pk_rentId);
      
     
    }
    // INSERT MODE
    else {
      this.loadFinancialYearMonths(false,0);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.form.patchValue({ file: this.selectedFile.name });
    }
  }

  get monthlyRentList(): FormArray {
    return this.form.get('monthlyRentList') as FormArray;
  }


loadFinancialYearMonths(isEdit:boolean,pk_rentId:any): void {
  this.httpService.FinancialYearMonth().subscribe({
    next: (res: any) => {
      if (res.isSuccess && res.data) {
        this.financialMonths = res.data;
        this.buildMonthlyRentList(res.data);

        if(isEdit){
          this.loadRentDetailsData(pk_rentId);
        }
      } else {
        this.toastrService.error('No financial months found');
      }
    },
    error: () => {
      this.toastrService.error('Failed to load financial year months');
    }
  });
}
buildMonthlyRentList(data: any[]): void {
  this.monthlyRentList.clear();

  data.forEach(m => {
    this.monthlyRentList.push(
      this.fb.group({
        fk_empid: [''],
        fk_monthId: [m.fk_monthid],
        fk_yearId: [m.fk_yearid],
        rentamount: [0, Validators.required],
        remarks: ['']
      })
    );
  });
}


getMonthLabel(monthId: string): string {
  const found = this.financialMonths.find(m => m.fk_monthid === monthId);
  return found ? found.monthname : monthId;
}





  // initializeRentList(startYear: number): void {
  //   this.months.forEach((monthObj, index) => {
  //     const year = index < 9 ? startYear : startYear + 1;

  //     this.monthlyRentList.push(
  //       this.fb.group({
  //         fk_empid: [''],
  //         fk_monthId: [monthObj.value],
  //         fk_yearId: [year.toString()],
  //         rentamount: [0, Validators.required],
  //         remarks: ['']
  //       })
  //     );
  //   });
  // }

  fillAll(): void {
    if (this.fillAmount <= 0) {
      this.toastrService.warning('Please enter a valid amount to fill');
      return;
    }
    this.monthlyRentList.controls.forEach(ctrl => {
      ctrl.get('rentamount')?.setValue(+this.fillAmount.toFixed(2));
    });
    this.toastrService.success('All months filled successfully');
  }

  get totalAmount(): number {
    return this.monthlyRentList.value
      .map((r: any) => Number(r.rentamount) || 0)
      .reduce((a: number, b: number) => a + b, 0);
  }



  updateLandlordValidation(): void {
    const docStatus = this.form.get('docsub_status')?.value;
    const totalAmount = this.totalAmount;

    if (totalAmount > 100000 && docStatus == 'Y') {
      this.form.get('panNo')?.setValidators([
    Validators.required,
    Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  ]);
      this.form.get('landlordName')?.setValidators([Validators.required]);
      this.form.get('landlordAddress')?.setValidators([Validators.required]);
      this.form.get('rentDetailType')?.setValidators([Validators.required]);
 this.form.get('landlordAccountNumber')?.setValidators([Validators.required]);
      
        this.form.get('file')?.setValidators([Validators.required]);
  
    } else {
      this.form.get('panNo')?.clearValidators();
      this.form.get('landlordName')?.clearValidators();
      this.form.get('landlordAddress')?.clearValidators();
      this.form.get('rentDetailType')?.clearValidators();
      this.form.get('file')?.clearValidators();
      this.form.get('landlordAccountNumber')?.clearValidators();
    }

    this.form.get('panNo')?.updateValueAndValidity();
    this.form.get('landlordName')?.updateValueAndValidity();
    this.form.get('landlordAddress')?.updateValueAndValidity();
    this.form.get('rentDetailType')?.updateValueAndValidity();
    this.form.get('file')?.updateValueAndValidity();
    this.form.get('landlordAccountNumber')?.updateValueAndValidity();
  }

  loadRentDetailsData(pk_rentId: string): void {
    this.httpService.getRentDetailsById(pk_rentId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {

          console.log('Fetched Rent Details Data:', res);

          const master = res.data.masterData;
          const monthly = res.data.monthlyRentData;
          const landlord = res.data.landlordData;

          /* ---------------- MASTER DATA ---------------- */
          if (master) {
            this.form.patchValue({
              fk_empid: master.fk_empid,
              fk_finid: master.fk_finid,
              docsub_status: master.docsub_status || '',
              remarks: master.remarks || '',
              rentDetailType: master.rentdetailtype || ''
            });
          }

          /* ---------------- LANDLORD DATA ---------------- */
          if (landlord) {
            this.form.patchValue({
              panNo: landlord.PANNo || '',
              landlordName: landlord.LandLordName || '',
              landlordAddress: landlord.LandLordAddress || '',
              landlordAccountNumber: landlord.LandLordAccountNumber || ''
            });

            this.existingFileName = landlord.filename || '';

          }

          /* ---------------- MONTHLY RENT LIST ---------------- */
          this.monthlyRentList.clear();

          if (monthly && monthly.length > 0) {
            monthly.forEach((m: any) => {
              this.monthlyRentList.push(
                this.fb.group({
                  fk_empid: [master?.fk_empid || ''],
                  fk_monthId: [m.fk_monthid],
                  fk_yearId: [m.fk_yearid],
                  rentamount: [m.rentamount, Validators.required],
                  remarks: [m.remarks || '']
                })
              );
            });
          }

          this.Isedit = true;
          this.updateLandlordValidation();
        } else {
          this.toastrService.error('Failed to load rent details.');
        }
      },
      error: (err) => {
        console.error('Error loading rent details:', err);
        this.toastrService.error('Error loading rent details data.');
      }
    });
  }


  submit(): void {
    this.submitted = true;
    this.updateLandlordValidation();

    if (this.form.invalid) {
      this.toastrService.error('Please fill all required fields');
      return;
    }

    if (this.totalAmount <= 0) {
      this.toastrService.error('Total rent amount must be greater than zero');
      return;
    }

    const formValue = this.form.value;
    const formData = new FormData();

    const empId = formValue.fk_empid;

    // Top-level fields
    formData.append('fk_empid', empId);
    formData.append('fk_finid', formValue.fk_finid);
    formData.append('docsub_status', formValue.docsub_status);
    formData.append('remarks', formValue.remarks || '');

    // Add pk_rentId for update
    if (this.Isedit) {
      formData.append('pk_rentId', this.pk_rentId);
    }

    // Optional fields for landlord details
    if (this.totalAmount > 100000 && formValue.docsub_status == 'Y') {
      formData.append('rentdetailtype', formValue.rentDetailType || '');
      formData.append('PANNo', formValue.panNo || '');
      formData.append('LandLordName', formValue.landlordName || '');
      formData.append('LandLordAddress', formValue.landlordAddress || '');
      formData.append('LandLordAccountNumber', formValue.landlordAccountNumber || '');

      // If updating and no new file selected, use existing filename
      if (this.Isedit && !this.selectedFile && this.existingFileName) {
        formData.append('uploadFile', this.existingFileName);
      }
    }

    // Append each RentDetailList item individually
    formValue.monthlyRentList.forEach((item: any, index: number) => {
      formData.append(`RentDetailList[${index}].fk_empid`, empId);
      formData.append(`RentDetailList[${index}].fk_monthId`, item.fk_monthId);
      formData.append(`RentDetailList[${index}].fk_yearId`, item.fk_yearId);
      formData.append(`RentDetailList[${index}].rentamount`, item.rentamount?.toString() || '0');
      formData.append(`RentDetailList[${index}].remarks`, item.remarks || '');
    });

    // File if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    // Call appropriate API based on edit mode
    if (this.Isedit) {
      this.httpService.updateRentDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.router.navigateByUrl('/dash/reimbursement/reimbursementdashboard/RentDetailsList');
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: (err) => {
          console.error('❌ Update error:', err);
          this.toastrService.error('An error occurred during update');
        }
      });
    } else {
      this.httpService.addRentDetails(formData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success(res.message);
            this.router.navigateByUrl('/dash/reimbursement/reimbursementdashboard/RentDetailsList');
          } else {
            this.toastrService.error(res.message);
          }
        },
        error: (err) => {
          console.error('❌ Server error:', err);
          this.toastrService.error('An error occurred during form submission');
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset();
    this.monthlyRentList.clear();
    this.selectedFile = null;
    this.existingFileName = '';
    this.submitted = false;
    this.fillAmount = 0;
    this.loadFinancialYearMonths(false,0);
  }
}