import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalaryPayStoppedService } from '../../services/pay-stopped.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SalarySleepMessageService } from '../../services/salary-sleep-message.service';

@Component({
  selector: 'app-salary-sleep-message',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './salary-sleep-message.component.html',
  styleUrl: './salary-sleep-message.component.scss'
})
export class SalarySleepMessageComponent {
  salarySlipForm!: FormGroup;
  ngxUILoaderService = inject(NgxUiLoaderService);
  toastrService: any;
  fk_empid!: string;
  searchText = signal('');
  currentYear: number | undefined;
 
  // months: { sno: number; month: string; year: number; message: string }[] = [];
  months: { sno: number; month: string; year: number; message: string }[] = [];

  commonMessage: string = "";

  constructor(private fb: FormBuilder, private SalMonthSlipService: SalaryPayStoppedService, private MesaageService:SalarySleepMessageService) {
   
  }

  ngOnInit() {
    this.salarySlipForm = this.fb.group({
      slips: this.fb.array([])  // ⬅️ Table data as FormArray
     });
     this.generateMonthList();
}


generateMonthList() {
  this.ngxUILoaderService.start();

  const month = "Month";
  this.SalMonthSlipService.getMonthlist(month).subscribe({
    next: (res) => {
      if (res?.isSuccess && res.data?.length) {
        console.log("Original month list from API:", res);

        const financialMonthOrder = [
          'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
          'OCTOBER', 'NOVEMBER', 'DECEMBER',
          'JANUARY', 'FEBRUARY', 'MARCH'
        ];

        // 🌟 Get Financial Year Start from sessionStorage
        const dateStr = sessionStorage.getItem('financialDate1'); // "01 Apr 2025"
        let currentYear = new Date().getFullYear(); // fallback

        if (dateStr) {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            currentYear = parsedDate.getFullYear(); // 2025
          }
        }

        // ✅ Sort and map months according to financial year
        const orderedMonths = financialMonthOrder.map(monthName =>
          res.data.find((m: any) => m.name.toUpperCase() === monthName)
        ).filter(Boolean);

        this.months = orderedMonths.map((month: any, index: number) => {
          let year = currentYear;
          if (['JANUARY', 'FEBRUARY', 'MARCH'].includes(month.name.toUpperCase())) {
            year += 1; // Next calendar year for Jan–Mar
          }
          return {
            sno: index + 1,
            month: month.name,
            year: year,
            message: ""
          };
        });

        // 🧩 Bind to FormArray
        const controlArray = this.salarySlipForm.get('slips') as FormArray;
        controlArray.clear();

        this.months.forEach((month) => {
          controlArray.push(this.fb.group({
            fk_monthId: [month.month],
            fk_yearId: [month.year],
            message: ['']
          }));
        });

        console.log("Final months:", this.months);
      } else {
        this.toastrService.error("Failed to load month list.");
      }
      this.ngxUILoaderService.stop();
    },
    error: (err) => {
      console.error("Error fetching month list:", err);
      this.toastrService.error("Error fetching month list. Please try again.");
      this.ngxUILoaderService.stop();
    }
  });
}




fillAll() {
  this.monthsFormArray.controls.forEach(control => {
    control.get('message')?.setValue(this.commonMessage);
  });
}



  get monthsFormArray(): FormArray {
    return this.salarySlipForm.get('slips') as FormArray;
  }

  


  mapMonthNameToNumber(monthName: string): string {
    const monthMap: { [key: string]: string } = {
      'JANUARY': '1',
      'FEBRUARY': '2',
      'MARCH': '3',
      'APRIL': '4',
      'MAY': '5',
      'JUNE': '6',
      'JULY': '7',
      'AUGUST': '8',
      'SEPTEMBER': '9',
      'OCTOBER': '10',
      'NOVEMBER': '11',
      'DECEMBER': '12'
    };
    return monthMap[monthName.toUpperCase()] || '0';
  }

  // ✅ Method to get fk_finid from sessionStorage
// getFinIdFromSession(): string {
//   const date1 = sessionStorage.getItem('financialDate1');
//   const date2 = sessionStorage.getItem('financialDate2');

//   if (date1 && date2) {
//     const year1 = new Date(date1).getFullYear();
//     const year2 = new Date(date2).getFullYear();
//     return `${year1}-${year2}`;  // e.g., "2025-2026"
//   }
//   return '';
// }


  submit() {
    if (this.salarySlipForm.invalid) {
      window.scrollTo(0, 0);
      return;
    }
  
    this.ngxUILoaderService.start(); // Start loader
  
     const raw = this.salarySlipForm.getRawValue();
    // const fk_finid = this.getFinIdFromSession();
  
    const monthlySalSlip = raw.slips.map((item: any) => ({
      // fk_finid: fk_finid,
      fk_monthId: Number(this.mapMonthNameToNumber(item.fk_monthId)),
      fk_yearId: Number(item.fk_yearId),
      message: item.message
    }));
  
    const payload = {
      monthlySalSlip
    };
 
    this.MesaageService.MonthSalSlip_Insert(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ngxUILoaderService.stop();
          this.toastrService.success(res.message || 'Details added successfully!');

          this.resetForm();
        } else {
          this.toastrService.error(res.message || 'Failed to add details.');
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
        this.ngxUILoaderService.stop();
      }
    });
  }
  


  






  resetForm() {
    this.salarySlipForm.reset();
    this.monthsFormArray.clear();
    this.generateMonthList();
  }
}