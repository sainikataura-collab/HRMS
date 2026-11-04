import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingPlanningService } from '../services/training-planning.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TrainingCalendarService } from '../services/training-calendar.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../shared/services/encryption.service';
declare var bootstrap: any;



@Component({
  selector: 'app-admin-emp-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './admin-emp-attendance.component.html',
  styleUrl: './admin-emp-attendance.component.scss'
})
export class AdminEmpAttendanceComponent {



  employeeId: string = '';
  programId: number | null = null;
  subProgramId: number | null = null;
  trainingData: any = null;

  isLoading: boolean = true;
  errorMessage: string = '';
  showAll: boolean = false;

  searchText: string = '';


  attendanceForm!: FormGroup;
  selectedAttendance: any = null;
  isSaving = false;
  markAttendanceModal: any;


  selectedEmpId!: string;      // string type
  selectedPlanningId!: number;

  attendanceStatus = [
    { name: '-- Select Status --', value: '' },
    { name: 'Present', value: 'P' },
    { name: 'Absent', value: 'A' }
  ];


  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingPlanningService,
    private Service: TrainingCalendarService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private encriptService: EncryptionService
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {

      const decryptedEmpId = this.encriptService.decryptText(params['pk_empid']);
      const decryptedProgramId = this.encriptService.decryptText(params['programId']);
      const decryptedSubProgramId = this.encriptService.decryptText(params['subprogramId']);

      // Convert to number if needed
      this.employeeId = decryptedEmpId;
      this.programId = Number(decryptedProgramId);
      this.subProgramId = Number(decryptedSubProgramId);


      // this.employeeId = params['pk_empid'];
      // this.programId = +params['programId'] || null;
      // this.subProgramId = +params['subprogramId'] || null;

      if (this.employeeId) {
        this.loadTrainingData(this.employeeId, this.programId, this.subProgramId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'No employee ID provided';
      }
    });

    this.attendanceForm = this.fb.group({
      attendanceStatus: ['', Validators.required],
      attendanceDateTime: [''],
      remarks: ['']
    });
  }


  loadTrainingData(empId: string, programId: number | null, subProgramId: number | null): void {
    this.isLoading = true;

    this.trainingService.getAttendance(empId, programId, subProgramId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.trainingData = {
            ...response.data.programs,
            attendance: (response.data.empAttandance || []).map((a: any) => ({
              ...a,
              attendanceDate: new Date(a.attendanceDate),
              attendanceTime: new Date(a.attendanceTime)
            }))
          };
        } else {
          this.errorMessage = 'No training data found';
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error loading training data';
        this.isLoading = false;
      }
    });
  }


  // loadTrainingData(empId: string): void {
  //   this.isLoading = true;
  //   this.trainingService.getAttendance(empId).subscribe({
  //     next: (response) => {
  //       if (response && response.data) {
  //         // Merge program and attendance data
  //         this.trainingData = {
  //           ...response.data.programs,
  //           attendance: response.data.empAttandance || []
  //         };
  //       } else {
  //         this.errorMessage = 'No training data found';
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Error loading training data';
  //       this.isLoading = false;
  //     }
  //   });
  // }



  // formatDate(dateString: string): string {
  //   if (!dateString) return '-';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-GB', {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric'
  //   });
  // }

  // formatDateTime(dateString: string): string {
  //   if (!dateString) return '-';
  //   const date = new Date(dateString);
  //   return date.toLocaleString('en-GB', {
  //     day: '2-digit',
  //     month: 'short',
  //     year: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Present': return 'bg-success';
      case 'Absent': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }





  // Computed property for filtered & sliced attendance
  get filteredAttendances() {
    if (!this.trainingData?.attendance) return [];

    const search = this.searchText.toLowerCase();

    // Filter based on searchText
    const filtered = this.trainingData.attendance.filter((record: any) =>
      (record.fk_empId || '').toLowerCase().includes(search) ||
      (record.attendanceStatus || '').toLowerCase().includes(search) ||
      (record.attendanceDate
        ? new Date(record.attendanceDate).toLocaleDateString('en-GB').includes(search)
        : false)
    );

    // If showAll is false, show only first 3 records
    return this.showAll ? filtered : filtered.slice(0, 3);
  }

  // Toggle showAll flag
  toggleViewAll() {
    this.showAll = !this.showAll;
  }

  openMarkAttendanceModal(att: any) {
    this.selectedAttendance = att;
    this.selectedEmpId = att.fk_empId;
    this.selectedPlanningId = att.pk_planningId;

    let formattedDateTime = '';
    if (att.attendanceDate) {
      const d = new Date(att.attendanceDate); // JS parses MM/dd/yyyy correctly

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');  // pad seconds
      // THIS FORMAT WORKS FOR datetime-local input
      formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    this.attendanceForm.patchValue({
      attendanceStatus: att.attendanceStatus !== 'Not Marked' ? att.attendanceStatus :'',
      attendanceDateTime: formattedDateTime,
      //attendanceDateTime: '',
      remarks: att.remarks || ''
    });

    const modal = new bootstrap.Modal(document.getElementById('markAttendanceModal'));
    modal.show();
  }


  saveAttendance() {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }
    const payload = {
      fk_empId: this.selectedEmpId,
      pk_planningId: this.selectedPlanningId,
      attendanceStatus: this.attendanceForm.value.attendanceStatus,
      attendanceDate: this.attendanceForm.value.attendanceDateTime,
      // attendanceDate: attendanceDate,
      remarks: this.attendanceForm.value.remarks
    };

    this.Service.Attendance_ByAdmin(payload).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success(res.message);
            // ✅ Close modal after successful save
        const modalElement = document.getElementById('markAttendanceModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
       this.loadTrainingData(this.employeeId, this.programId, this.subProgramId);


        } else {
          this.toastr.warning(res.message);
        }
      },
      error: (err) => {
        this.toastr.error('Error marking attendance.');
        console.error(err);
      }
    });
  }
}
