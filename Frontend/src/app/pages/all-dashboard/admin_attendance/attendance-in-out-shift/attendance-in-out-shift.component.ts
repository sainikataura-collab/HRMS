import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { forkJoin } from 'rxjs';
import { MonthlyRentDetailService } from '../../payroll/services/monthly-rent-detail.service';
import { CommonSearchComponent } from '../../payroll/Employee/common-search/common-search.component';
import { DropdownService } from '../../../../shared/services/dropdown.service';
@Component({
  selector: 'app-attendance-in-out-shift',
  standalone: true,
  imports: [NgSelectComponent,CommonModule,FormsModule,NgxPaginationModule,ReactiveFormsModule,CommonSearchComponent],
  templateUrl: './attendance-in-out-shift.component.html',
  styleUrl: './attendance-in-out-shift.component.scss'
})
export class AttendanceInOutShiftComponent {
  dayKeys: string[] = [];
  EmployeeForm!: FormGroup;
  submitted=false;
  showError =false;
dateHeaders: Date[] = [];
allEmployees: any[] = []; // original unfiltered data
  AttendanceForm!: FormGroup; // Add this
  fiterData={};
  isDataLoaded = false; // Tracks if API was called at least once
  shiftdetails:any[]=[];
AttendanceStatusDataList:any[]=[];
  shiftHour:string='';
  selectedAttendance: any = null;
  showModal: boolean = false;
  firstEmployee: any; // For getting date from first employee
  previousIsLeave=false;
    Contractor: { name: string, value: string }[] = []; 
// For table 1
pageIndex: number = 1;
pageSize: number = 10;
months:any[]=[];
natureOptions: any[] = [];
attendanceData: any = {};
shiftList:any[]=[];
searchText= '';
minDate:string='';
employeeList: any[] = [];
totalCount=0;
years:any[]=[];
   isContractApplicable= false;

  constructor(private fb: FormBuilder,
    private  toastrService: ToastrService,
    private router: Router,
    private httpservice :MonthlyRentDetailService,
    private Loader:NgxUiLoaderService,
   private dropdownService: DropdownService

  ) {}
  
 
ngOnInit() {
  this.isContractApplicable =   sessionStorage.getItem('ContractApplicable')=="true" ? true:false;

  this.EmployeeForm = this.fb.group({
   
    FkMonthId: [null, Validators.required],
    FkYearId: [null, Validators.required],
     fk_costcentreid: [null],
    empCode: [''],
    empName: [''],
    selectedLocations: [[]],
    selectedDepartments: [[]],
    selectedDesignation: [''],
    selectedNature: [''],
    selectedCity: [''],
    sortBy: [''],
    empStatus: [null],
    Fk_FinId: [''],
    Fk_CompanyId: [''],
  });

  this.AttendanceForm = this.fb.group({
     pk_empid:[''],
    in: [''],
    out: [''],
    workhour: [{ value: '', disabled: true }],
    status: [''],
    shift: [''], 
    ot: [{value: '', disabled: true }],
    OTlapsed:[false],
    ShiftActualTime:[false],
    OTLapsedHours:['', [
      Validators.required,
      Validators.pattern(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/) // HH:mm 00–23:59
    ]],

    //OTLeftHour:[{value: '', disabled: true }],

    TotalOTHour:[{value: '', disabled: true }],

    //newly added by pp 12-09-2025
     shortleaveLapsed:[false],
      LatecomingLapsed:[false],
       onlyot:[false],
      Remark:[''],
    dated: [''],
    empcode: [''],
   
    outTimeDate: [null, Validators.required],
  });
  this.Loader.start();
  forkJoin([
    this.httpservice.getCommanList('Month'),
    this.httpservice.getCommanList('Year'),
    this.httpservice.getCommanList('CostCenter'),
    this.httpservice.getCommanList('shift'),
    this.httpservice.AttendanceStatusList()
  ]).subscribe({
    next: ([monthsRes, yearsRes,Contractorres,shiftRes,StatusRes]) => {
      this.months = monthsRes.data;
      this.years = yearsRes.data;
      this.Contractor=Contractorres.data;
      this.shiftList = shiftRes.data;
   this.AttendanceStatusDataList = this.AttendanceStatusDataList = StatusRes.data.map((item: any) => ({
      name: item.dayStatus,
      value: item.dayStatus,   // what gets stored in the form
     isLeave: item.isLeave,
     isHalfday: item.isHalfday,
     leaveId: item.leaveId
    }))
   //console.log('thisios sdf',this.AttendanceStatusDataList );
      this.Loader.stop();
    },
    error: () => {
      this.toastrService.error("Failed to load data");
      this.Loader.stop();
    }
  });
  this.onTimeChange();
  this.AttendanceForm.get('OTLapsedHours')!.valueChanges.subscribe(() => {
  this.calculateOTHours();
  
});

this.AttendanceForm.get('onlyot')!.valueChanges.subscribe(() => {
  this.calculateWorkHours();
});

}


formatTimeOnBlur(fieldName: string): void {
  const control = this.AttendanceForm.get(fieldName);
  if (!control) return;

  let val = (control.value ?? '').toString().trim();

  if (!val) {
    control.setValue('00:00', { emitEvent: false });
    return;
  }

  let hours = '00';
  let minutes = '00';

  if (val.startsWith(':')) {
    // Input like :15 → treat as minutes
    minutes = val.slice(1).padStart(2, '0').slice(0,2);
  } else if (/^\d+$/.test(val)) {
    // Only digits → last two digits = minutes, rest = hours
    if (val.length <= 2) {
      hours = val.padStart(2, '0');
    } else {
      minutes = val.slice(-2);
      hours = val.slice(0, -2).padStart(2, '0');
    }
  } else if (/^\d+:\d+$/.test(val)) {
    // Already in HH:MM format
    [hours, minutes] = val.split(':');
  }

  // Cap hours and minutes
  const hNum = Math.min(parseInt(hours, 10), 23);
  const mNum = Math.min(parseInt(minutes, 10), 59);

  control.setValue(`${hNum.toString().padStart(2, '0')}:${mNum.toString().padStart(2, '0')}`, { emitEvent: false });
}







calculateOTHours(): void {
  const otRaw = (this.AttendanceForm.get('ot')?.value ?? '').toString().trim();
  const lapsedRaw = (this.AttendanceForm.get('OTLapsedHours')?.value ?? '').toString().trim();

  // If a plain number <= HOURS_AS_HOURS_THRESHOLD is entered treat it as hours,
  // otherwise treat plain numbers as minutes (useful to distinguish 8 -> 8 hours, 30 -> 30 minutes).
  const HOURS_AS_HOURS_THRESHOLD = 23;

  const parseToMinutes = (val: string): number => {
    if (!val) return 0;
    const s = val.toLowerCase().trim();

    // HH:mm or H:mm
    if (s.includes(':')) {
      const [hStr = '0', mStr = '0'] = s.split(':');
      const h = parseInt(hStr, 10) || 0;
      const m = parseInt(mStr, 10) || 0;
      return Math.max(0, h * 60 + m);
    }

    // minutes with suffix like "30m" or "45min"
    const minSuffix = s.match(/^(\d+(\.\d+)?)\s*(m|min|mins)$/);
    if (minSuffix) return Math.round(parseFloat(minSuffix[1]));

    // decimal hours e.g. "1.5" => 1 hour 30 minutes
    if (s.includes('.') && !isNaN(Number(s))) {
      return Math.round(Number(s) * 60);
    }

    // plain integer string
    if (/^\d+$/.test(s)) {
      const n = parseInt(s, 10);
      // heuristic: small numbers (<= HOURS_AS_HOURS_THRESHOLD) are hours, larger numbers are minutes
      if (n <= HOURS_AS_HOURS_THRESHOLD) return n * 60;
      return n;
    }

    // try to extract any number as minutes fallback
    const anyNum = parseFloat(s.replace(/[^\d.]/g, ''));
    return isNaN(anyNum) ? 0 : Math.round(anyNum);
  };

  const toHHMM = (mins: number): string => {
    mins = Math.max(0, Math.round(mins));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const otMinutes = parseToMinutes(otRaw);
  const lapsedMinutes = parseToMinutes(lapsedRaw);

  const leftMinutes = Math.max(otMinutes - lapsedMinutes, 0);

  this.AttendanceForm.patchValue({
    //OTLeftHour: toHHMM(leftMinutes),
    // I assume TotalOTHour should show original OT — change to toHHMM(leftMinutes) if you want otherwise.
  // TotalOTHour: toHHMM(otMinutes),
      TotalOTHour: toHHMM(leftMinutes),
  }, { emitEvent: false });
}

shiftdata(event :any)
{
  const value = typeof event === 'object' && 'value' in event ? event.value : event;
  this.httpservice.shiftDatabyName(value).subscribe({
next:(res)=>{
 this.shiftdetails=res.data
this.shiftHour=this.shiftdetails[0].shiftHour
this.calculateWorkHours();

}
  })
}


onTimeChange(): void {
  this.AttendanceForm.get('in')!.valueChanges.subscribe(() => {
    this.calculateWorkHours();
  });

  this.AttendanceForm.get('out')!.valueChanges.subscribe(() => {
    this.calculateWorkHours();
  });

  this.AttendanceForm.get('outTimeDate')!.valueChanges.subscribe(() => {
    this.calculateWorkHours();
  });
  
}

getShiftHoursAndMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins}`;
}


// calculateWorkHours(): void {

  
//   const inTime = this.AttendanceForm.get('in')?.value;
//   const outTime = this.AttendanceForm.get('out')?.value;
//   const shiftHour = parseFloat(this.shiftHour || '0');
//   const inDateRaw = this.AttendanceForm.get('dated')?.value;
//   const outDateRaw = this.AttendanceForm.get('outTimeDate')?.value;

//   if (inTime && outTime && inDateRaw && outDateRaw && shiftHour > 0) {
//     const inDate = new Date(`${inDateRaw} ${inTime}`);
//     const outDate = new Date(`${outDateRaw} ${outTime}`);

//     if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
//       const durationMs = outDate.getTime() - inDate.getTime();
//       const totalMinutes = Math.floor(durationMs / (1000 * 60));
//       const shiftMinutes = Math.floor(shiftHour);

//       const effectiveWorkMinutes = Math.min(totalMinutes, shiftMinutes);
//       const overtimeMinutes = Math.max(totalMinutes - shiftMinutes, 0);

//       // Format working hours (capped to shift)
//       const workHours = Math.floor(effectiveWorkMinutes / 60);
//       const workMins = effectiveWorkMinutes % 60;
//       const formattedWorkDuration = `${workHours.toString().padStart(2, '0')}:${workMins.toString().padStart(2, '0')}`;

//       // Format OT
//       const otHours = Math.floor(overtimeMinutes / 60);
//       const otMins = overtimeMinutes % 60;
//       const formattedOt = `${otHours.toString().padStart(2, '0')}:${otMins.toString().padStart(2, '0')}`;

//       this.AttendanceForm.patchValue({
//         workhour: formattedWorkDuration,
//         ot: formattedOt,
//       });
//       this.calculateOTHours();
//     }
//   } else {
//     this.AttendanceForm.patchValue({
//       workhour: '',
//       ot: ''
//     });
//   }
// }

calculateWorkHours(): void {
  const inTime = this.AttendanceForm.get('in')?.value;
  const outTime = this.AttendanceForm.get('out')?.value;
  const shiftHour = parseFloat(this.shiftHour || '0');
  const inDateRaw = this.AttendanceForm.get('dated')?.value;
  const outDateRaw = this.AttendanceForm.get('outTimeDate')?.value;
  const onlyOTChecked = this.AttendanceForm.get('onlyot')?.value;

  if (inTime && outTime && inDateRaw && outDateRaw && shiftHour > 0) {
    const inDate = new Date(`${inDateRaw} ${inTime}`);
    const outDate = new Date(`${outDateRaw} ${outTime}`);

    if (!isNaN(inDate.getTime()) && !isNaN(outDate.getTime())) {
      const durationMs = outDate.getTime() - inDate.getTime();
      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const shiftMinutes = Math.floor(shiftHour);

      // ✅ PEHLE WALA CALCULATION (always calculate this)
      // const effectiveWorkMinutes = Math.min(totalMinutes, shiftMinutes);
      // const overtimeMinutes = Math.max(totalMinutes - shiftMinutes, 0);
      let effectiveWorkMinutes: number;
      let finalOTMinutes: number;

      if (onlyOTChecked) {
        // ✅ onlyot CHECKED: workhour = 0, ot = total time
        effectiveWorkMinutes = 0;
        finalOTMinutes = totalMinutes; // pura time OT mein
      } else {
        // ✅ NORMAL CALCULATION
        effectiveWorkMinutes = Math.min(totalMinutes, shiftMinutes);
        finalOTMinutes = Math.max(totalMinutes - shiftMinutes, 0);
      }

      // Format working hours
      const workHours = Math.floor(effectiveWorkMinutes / 60);
      const workMins = effectiveWorkMinutes % 60;
      const formattedWorkDuration = `${workHours.toString().padStart(2, '0')}:${workMins.toString().padStart(2, '0')}`;

      // ✅ OT CALCULATION
      // let finalOTMinutes = overtimeMinutes;

      // // If onlyot is checked, ADD workhour minutes to OT
      // if (onlyOTChecked) {
      //   finalOTMinutes = overtimeMinutes + effectiveWorkMinutes;
      // }

      // Format final OT
      const otHours = Math.floor(finalOTMinutes / 60);
      const otMins = finalOTMinutes % 60;
      const formattedOt = `${otHours.toString().padStart(2, '0')}:${otMins.toString().padStart(2, '0')}`;

      this.AttendanceForm.patchValue({
        workhour: formattedWorkDuration,
        ot: formattedOt,
      }, { emitEvent: false });
      
      this.calculateOTHours();
    }
  } else {
    this.AttendanceForm.patchValue({
      workhour: '',
      ot: ''
    }, { emitEvent: false });
  }
}


  handleFilters(filters: any) {
    this.EmployeeForm.patchValue(filters);

  }
  inoutForAllDataList() {
    // Clone and sanitize form data
    const formData = { ...this.EmployeeForm.value };
  
    Object.keys(formData).forEach(key => {
      if (formData[key] === null) {
        formData[key] = '';
      }
    });
  
    const payload = {
      pageIndex: this.pageIndex - 1,
      pageSize: this.pageSize,
      ...formData // spread form values into the request body
    };
  
    this.Loader.start();
    this.httpservice.AttendanceDetailsinoutForAll(payload).subscribe({
      next: (res: any) => {
        this.Loader.stop();
        this.isDataLoaded = true; // mark that data load attempt happened
        if (res.isSuccess && res.data && res.data.length > 0) {
          this.employeeList = res.data;
          this.allEmployees = res.data; // for filtering
          this.firstEmployee = res.data.length > 0 ? res.data[0] : null;
          this.totalCount = res.totalCount;

          const selectedMonth = this.EmployeeForm.value.FkMonthId;
          const selectedYear = this.EmployeeForm.value.FkYearId;
          //newld added by pp
           const selected_fk_costcentreid = this.EmployeeForm.value.fk_costcentreid;
         

          this.dateHeaders = this.generateDatesForMonthYear(selectedMonth, selectedYear, res.documentNo);
          this.dayKeys = this.generateDayKeys(selectedMonth, selectedYear, res.documentNo);

        } else {
          this.employeeList = [];
          this.totalCount = 0;
          this.toastrService.info('No records found.');
        }
      },
      error: (err) => {
        this.isDataLoaded = true;
        this.toastrService.error(err.message);
        this.Loader.stop();
      }
    });
  }
  
  

  openAttendanceModal(emp: any, dayKey: string): void {
    const data = emp[dayKey];
    this.selectedAttendance = {
      pk_empid: emp.pk_empid,
      employeeName: emp.empname,
      empcode: emp.empcode,
      date: dayKey,
      in: (this.getFieldData(data, 'in') || '').replace(':00', ''),
      out: (this.getFieldData(data, 'out') || '').replace(':00', ''),
      workhour: this.getFieldData(data, 'workhour'),
      status: this.getFieldData(data, 'daystatus'),
      shift: this.getFieldData(data, 'shiftName'),
      ot: this.getFieldData(data, 'OThour'),
     
      dated: this.getFieldData(data, 'dated'),
      outTimeDate: this.getFieldData(data, 'outTimeDate'),
      pk_shiftId: this.getFieldData(data, 'pk_shiftId'),
        OTlapsed: Number(this.getFieldData(data, 'OTlapsed') ||0),
       LatecomingLapsed: Number(this.getFieldData(data, 'LatecomingLapsed') ||0),
         shortleaveLapsed: Number(this.getFieldData(data, 'shortleaveLapsed') ||0),
           onlyot: Number(this.getFieldData(data, 'onlyot') ||0),
           ShiftActualTime: Number(this.getFieldData(data, 'ShiftActualTime') ||0),
           
           OTLapsedHours: this.getFieldData(data, 'OTLapsedHours'),
        //  OTLeftHour: this.getFieldData(data, 'OTLeftHour'),
         TotalOTHour: this.getFieldData(data, 'TotalOTHour'),
           Remark: this.getFieldData(data, 'Remark'),


             

      

    };
  
this.AttendanceForm.reset();
const parsedDate = new Date(this.selectedAttendance.dated);
const formattedDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000)
.toISOString()
.split('T')[0];

console.log('this i sfdsfdsf ',this.selectedAttendance)
    this.AttendanceForm.patchValue({
      in: this.selectedAttendance.in || '',
      out: this.selectedAttendance.out,
      workhour: this.selectedAttendance.workhour,
      status: this.selectedAttendance.status,
      shift: this.selectedAttendance.pk_shiftId,
      ot: this.selectedAttendance.ot,
      dated: formattedDate ,
      // OTlapsed: Number(this.selectedAttendance.OTlapsed) ||0,
      OTlapsed: this.selectedAttendance.OTlapsed === 1,
      
      LatecomingLapsed: this.selectedAttendance.LatecomingLapsed === 1,
      
      shortleaveLapsed: this.selectedAttendance.shortleaveLapsed === 1,
        onlyot: this.selectedAttendance.onlyot === 1,
       ShiftActualTime: this.selectedAttendance.ShiftActualTime === 1,
      OTLapsedHours: this.selectedAttendance.OTLapsedHours,
     //  OTLeftHour: this.selectedAttendance.OTLeftHour,
     
        TotalOTHour: this.selectedAttendance.TotalOTHour,
        Remark: this.selectedAttendance.Remark,
      empcode:this.selectedAttendance.empcode,
      outTimeDate: this.selectedAttendance.outTimeDate || formattedDate,
       pk_empid:this.selectedAttendance.pk_empid,
    });

    if (this.selectedAttendance.pk_shiftId) {
      this.shiftdata(this.selectedAttendance.pk_shiftId);
    }
   
    this.showModal = true;
  const oldStatus = this.AttendanceStatusDataList.find(s => s.value === this.selectedAttendance.status);
this.previousIsLeave = oldStatus?.isLeave
console.log('previousIsLeave', this.previousIsLeave);  // Should log 0 or 1
  }

  
  
onPageChange(event: number): void {
  this.pageIndex = event;
  this.inoutForAllDataList();
}


getFieldData(field: string, type: string): string {
  if (!field) return '';
  const parts = field.split('#');
  switch (type) {
    case 'in': return parts[0] || '';
    case 'out': return parts[1];
    case 'workhour': return parts[2];
    case 'daystatus': return parts[3];
     case 'OThour': return parts[4];
    
    case 'shiftName': return parts[5];

    case 'outTimeDate': return parts[6];
    case 'pk_shiftId': return parts[7];
    
    case 'dated': return parts[8];
     case 'OTlapsed': return parts[9];
      case 'shortleaveLapsed': return parts[10];
       case 'onlyot': return parts[11];
       case 'LatecomingLapsed': return parts[12];
         case 'OTLapsedHours': return parts[13];
        case 'ShiftActualTime': return parts[14];
       // case 'OTLeftHour': return parts[14];
        case 'TotalOTHour': return parts[15];
         case 'Remark': return parts[16];
    default: return '';
  }
}
getDateFromField(field: string): string {
  return field ? field.split('#')[8] : '';
}





SaveChanges() {
  debugger
  this.submitted = true;
  this.showError = true;

  if (this.AttendanceForm.invalid) return;

  const formData = this.AttendanceForm.getRawValue();
  const selectedShift = this.shiftList.find(x => x.value === formData.shift);
  const shiftName = selectedShift ? selectedShift.name : '';
  const statusItem = this.AttendanceStatusDataList.find(s => s.value === formData.status)!;
  const payload = {
    pk_empid:formData.pk_empid,
    EmpCode: formData.empcode,
    Dated: formData.dated,
    InTime: formData.in,
    OutTime: formData.out,
    ShiftName: shiftName,
    DayStatus:  formData.status,
    WorkHour: formData.workhour,
    OutTimeDate: formData.outTimeDate,
    OThour: formData.TotalOTHour,
    // OTlapsed: formData.OTlapsed,
    OTlapsed: formData.OTlapsed ? 1 : 0,
    LatecomingLapsed: formData.LatecomingLapsed ? 1 : 0,
    shortleaveLapsed: formData.shortleaveLapsed ? 1 : 0,
     onlyot: formData.onlyot ? 1 : 0,
    ShiftActualTime: formData.ShiftActualTime ? 1 : 0,
     OTLapsedHours: formData.OTLapsedHours,
     // OTLeftHour: formData.OTLeftHour,
       TotalOTHour: formData.ot,
         Remark: formData.Remark,
    IsLeave:    statusItem.isLeave,
    IsHalfday:  statusItem.isHalfday,
    LeaveId:    statusItem.leaveId

  };
    
  if (this.previousIsLeave === true) {
    const confirmOverwrite = confirm("Leave already applied. Do you want to overwrite?");
    if (!confirmOverwrite) {
      return;
    }
  }

  this.httpservice.UpdateAttendanceInOut(payload).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        document.getElementById('modalCloseBtn')?.click();

       // ✅ UPDATE THE EMPLOYEE DATA LOCALLY
       const index = this.employeeList.findIndex(emp => emp.empcode === formData.empcode);
       if (index !== -1) {
         const formatted = [
           formData.in,
           formData.out,
           formData.workhour,
           formData.status,
           formData.TotalOTHour,
          
          //  this.shiftList.find(s => s.value === formData.shift)?.label || '',
          shiftName,
           formData.outTimeDate,
           formData.shift,
           formData.dated,
           formData.OTlapsed ? 1 : 0,
           formData.shortleaveLapsed ? 1 : 0,
           formData.onlyot ? 1 : 0,
           formData.LatecomingLapsed ? 1 : 0,
           formData.OTLapsedHours,
          
             formData.ShiftActualTime ? 1 : 0,
             // formData.OTLeftHour,
          
               formData.ot,
            formData.Remark,
             
         ].join('#');

         this.employeeList[index][this.selectedAttendance.date] = formatted;
       }

      

        this.toastrService.success(res.message);
      } else {
        this.toastrService.error(res.message);
      }
    }
  });
}

checkOutTimeDateLimit() {
  const dated = new Date(this.AttendanceForm.get('dated')?.value);
  const outTime = new Date(this.AttendanceForm.get('outTimeDate')?.value);

  if (outTime < dated) {
    const corrected = dated.toISOString().split('T')[0];
    this.AttendanceForm.get('outTimeDate')?.patchValue(corrected);
  }
}

generateDayKeys(month: number, year: number, cycleType: '26-25' | '1-31'): string[] {
  const dayKeys: string[] = [];
 
  if (cycleType === '1-31') {
    // Start date = 1st of current month
    const start = new Date(year, month - 1, 1);
    // End date = last day of current month
    const lastDay = new Date(year, month, 0).getDate();
    const end = new Date(year, month - 1, lastDay);
    // Generate all dates between start and end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dayNumber = currentDate.getDate(); // Gives 1 - 31
      dayKeys.push(`D${dayNumber}`);
    }
  } 
  else if (cycleType === '26-25') {

    const start = new Date(year, month - 2, 26); // month-2 because JS Date is 0-based
    // End date = 25th of current month
    const end = new Date(year, month - 1, 25);

    // Generate all dates between start and end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dayNumber = currentDate.getDate(); // Gives 1 - 31
      dayKeys.push(`D${dayNumber}`);
    }

  }

  return dayKeys;
}

generateDatesForMonthYear(month: number, year: number, cycleType: '26-25' | '1-31'): Date[] {
  const dates: Date[] = [];
  if (cycleType === '26-25') {
    // Start date = 26th of previous month
    const start = new Date(year, month - 2, 26); // month-2 because JS Date is 0-based
    // End date = 25th of current month
    const end = new Date(year, month - 1, 25);

    // Generate all dates between start and end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
  } else if (cycleType === '1-31') {
    // Start date = 1st of current month
    const start = new Date(year, month - 1, 1);
    // End date = last day of current month
    const lastDay = new Date(year, month, 0).getDate();
    const end = new Date(year, month - 1, lastDay);

    // Generate all dates between start and end
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
  }
  return dates;
}

  onSubmit() {
    this.submitted = true;
    this.showError = true;
    if (this.EmployeeForm.invalid) {
      return;
    }
    const empCode = this.EmployeeForm.get('sortBy')?.value;
    const selectedDepartments = this.EmployeeForm.get('selectedDepartments')?.value;
    const selectedLocations = this.EmployeeForm.get('selectedLocations')?.value;
    if (!empCode || empCode.trim() === '') {
      this.toastrService.warning('Please select sortBy', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }
    if (!selectedDepartments || selectedDepartments.length === 0) {
      this.toastrService.warning('Please select at least one Department', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }
    if (!selectedLocations || selectedLocations.length === 0) {
      this.toastrService.warning('Please select at least one Location', '', {
        positionClass: 'toast-center-center'
      });
      return;
    }

    this.inoutForAllDataList();
  }
   
  //  filterApply()
  //  {
  //   debugger
  //   if (this.searchText.trim()) {
  //     this.employeeList = this.employeeList.filter(emp => 
  //       emp.empname.toLowerCase().includes(this.searchText.toLowerCase()) ||
  //       emp.empcode.toLowerCase().includes(this.searchText.toLowerCase())
  //     );
  //   }
  //  }

  filterApply() {
    debugger
    const text = this.searchText?.toLowerCase() || '';
    this.employeeList = this.allEmployees.filter(emp =>
      emp.empname?.toLowerCase().includes(text) ||
      emp.empcode?.toLowerCase().includes(text)
    );
  }
}