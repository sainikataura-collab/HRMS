import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmployeeMasterService } from '../../../payroll/services/employee-master.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { forkJoin } from 'rxjs';
import { TrainingPlanningService } from '../../services/training-planning.service';
import { number } from 'mathjs';

@Component({
  selector: 'app-training-planning',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectModule,],

  templateUrl: './training-planning.component.html',
  styleUrl: './training-planning.component.scss'
})
export class TrainingPlanningComponent {

  trainingForm!: FormGroup;
  trainingId: number | null = null;
  showError = false;
  ngxUILoaderService = inject(NgxUiLoaderService);


  trainerList = [
    { name: '-- Select Trainer --', value: '' },
    { name: 'Internal', value: 'internal' },
    { name: 'External', value: 'external' }
  ];

  modeList = [
    { name: '-- Select location --', value: '' },

    { name: 'Offline', value: 'Offline' },
    { name: 'Online', value: 'online' }
  ];

  audienceTypes = [
    { name: '-- Select audienceType --', value: '' },

    { name: 'Department', value: 'D' },
    { name: 'Role', value: 'R' },
    { name: 'Employees', value: 'E' }
  ];

  Department: { name: string, value: string }[] = [];
  Programddl: { name: string, value: string }[] = [];
  Roles: { name: string, value: string }[] = [];
  employees: { name: string, value: string }[] = [];
  institutes: { name: string, value: string }[] = [];
  SubProgram: { name: string, value: string }[] = [];

  showInstituteDropdown: boolean = false;
  showemployeeDropdown: boolean = false;
  showLocation: boolean = false;
  selectedmode: string | null = null;



  selectedTrainerType: string | null = null;
  selectedAudienceType!: string;


  planningid: number | null = null;
  //programid!: number;

  currentList: any[] = [];
  approvedTNIList: any[] = [];
  selectedTniDetails: any = null;
  Isedit = false;




  constructor(
    private fb: FormBuilder,
    private employeeMasterService: EmployeeMasterService,
    private toastrService: ToastrService,
    private trainingPlanningService: TrainingPlanningService,
    private encryptionService: EncryptionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }



  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      const tniId = params['tniId'];
      const subProgramId = params['subProgramId'];
      const tniLineId = params['tniLineId']; // optional
      // this.loadApprovedTNI(Number(subProgramId), tniId);


    });

    // Initialize form
    this.trainingForm = this.fb.group({
      fk_tniId: [null],
      programId: [null,Validators.required],
      programName: [''],
      subProgramId: [null,Validators.required],
      subProgramName: [''],
      trainer: ['', Validators.required],
      trainername: [''],
      dateTime: ['', Validators.required],
      duration: ['', Validators.required],
      mode: ['', Validators.required],
      location: ['', Validators.required],
      institute: [null],
      trainingcharge: [,],
      audienceValues: [[]],
      isApproved: [false]
    });

    // Subscribe to trainer changes to show/hide institute dropdown
    this.trainingForm.get('trainer')?.valueChanges.subscribe(trainerValue => {
      this.onTrainerChange(trainerValue);
    });
    this.trainingForm.get('mode')?.valueChanges.subscribe(modeValue => {
      this.OnModeChange(modeValue);
    });

    this.trainingForm.get('programId')?.valueChanges.subscribe((programId) => {
      const programIdNum = Number(programId); 
      this.SubProgram = [];
      this.trainingForm.patchValue({ subProgramId: null });
      if (programIdNum) {
        this.loadSubPrograms(programIdNum); 
      }
    });
    
    // Load all dropdown data first, then check for edit mode
    this.loadAllDropdownData();
  }

  loadAllDropdownData() {
    this.ngxUILoaderService.start();
    // Load all dropdown data simultaneously using forkJoin
    forkJoin({
      departments: this.employeeMasterService.get_DropdownList('Department'),
      roles: this.employeeMasterService.get_DropdownList('RoleName'),
      employees: this.employeeMasterService.get_DropdownList('Employee'),
      institutes: this.employeeMasterService.get_DropdownList('Institute'),
      Programddl: this.employeeMasterService.get_DropdownList('TNIPrograms')
    }).subscribe({
      next: (results) => {
        // Process Department data
        if (results.departments.isSuccess && results.departments.data) {
          this.Department = results.departments.data.map((dept: any) => ({
            name: dept.name,
            value: dept.value
          }));
        }

        // Process Roles data
        if (results.roles.isSuccess && results.roles.data) {
          this.Roles = results.roles.data.map((role: any) => ({
            name: role.name,
            value: role.value
          }));
        }

        // Process Employees data
        if (results.employees.isSuccess && results.employees.data) {
          this.employees = results.employees.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value
          }));
        }
        // Process Institutes data
        if (results.institutes.isSuccess && results.institutes.data) {
          this.institutes = results.institutes.data.map((institute: any) => ({
            name: institute.name,
            value: institute.value
          }));
        }

        // Process Program data
        if (results.Programddl.isSuccess && results.Programddl.data) {
          this.Programddl = results.Programddl.data.map((Program: any) => ({
            name: Program.name,
            value: Program.value
          }));
        }
        this.ngxUILoaderService.stop();

        // ✅ After all dropdowns are ready, now call approved TNI
        // const tniId = Number(this.route.snapshot.queryParams['tniId']);
        // const subProgramId = Number(this.route.snapshot.queryParams['subProgramId']);
        // this.loadApprovedTNI(subProgramId, tniId);



        // After all dropdown data is loaded, check for edit mode
        this.planningid = Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['planningid']));

        if (this.planningid && !isNaN(this.planningid)) {
          this.getTrainingPlanningById(this.planningid);
          this.Isedit = true;
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        this.toastrService.error("Error loading dropdown data.");
        console.error(err);
      }
    });
  }


  loadSubPrograms(programId: number) {
    this.trainingPlanningService.getTni_Subprogram(programId).subscribe((res) => {
      if (res?.isSuccess && res.data) {
        this.SubProgram = res.data.map((item: any) => ({
          name: item.name,
          value: item.value ? Number(item.value) : null   // 👈 convert to number
        }));
      } else {
        this.SubProgram = [];
      }
    });
  }


  preventInvalidKeys(event: KeyboardEvent) {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}


  onAudienceTypeChange(type: string, patchValues: any[] = []) {
    this.selectedAudienceType = type;

    if (type === 'D' || type === 'TEAM') this.currentList = this.Department;
    else if (type === 'R') this.currentList = this.Roles;
    else if (type === 'E') this.currentList = this.employees;

    if (patchValues.length > 0) {
      this.cdr.detectChanges(); // make sure ng-select updates
      this.trainingForm.patchValue({ audienceValues: patchValues });
    } else {
      this.trainingForm.patchValue({ audienceValues: [] });
    }
  }


  OnModeChange(modevalue: string) {
    this.selectedmode = modevalue;
    this.showLocation = modevalue === 'Offline';
    if (this.showLocation) {
      this.trainingForm.get('location')?.setValidators([Validators.required])
    }
    else {
      // Remove validation and clear value when internal trainer is selected
      this.trainingForm.get('location')?.clearValidators();
      this.trainingForm.patchValue({ location: '' });

    }
    this.trainingForm.get('location')?.updateValueAndValidity();

    // 👇 Force UI refresh immediately
    this.cdr.detectChanges();


  }


  onTrainerChange(trainerValue: string) {
    this.selectedTrainerType = trainerValue;
    this.showInstituteDropdown = trainerValue === 'external';
    this.showemployeeDropdown = trainerValue === 'internal';

    if (this.showInstituteDropdown) {
      // Make institute required when external trainer is selected
      this.trainingForm.get('institute')?.setValidators([Validators.required]);
    }
    else if (this.showemployeeDropdown) {
      this.trainingForm.get('trainername')?.setValidators([Validators.required])
    }

    else {
      // Remove validation and clear value when internal trainer is selected
      // ✅ None selected → clear both
      this.trainingForm.get('institute')?.clearValidators();
      this.trainingForm.get('trainername')?.clearValidators();
      this.trainingForm.patchValue({ institute: '', trainername: '' });

    }
    this.trainingForm.get('institute')?.updateValueAndValidity();
    this.trainingForm.get('trainername')?.updateValueAndValidity();
    // 👇 Force UI refresh immediately
    this.cdr.detectChanges();
  }

  // getInstituteList(fieldName: string) {
  //   this.employeeMasterService.get_DropdownList(fieldName).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess && res.data) {
  //         this.institutes = res.data.map((institute: any) => ({
  //           name: institute.name,
  //           value: institute.value
  //         }));
  //       } else {
  //         this.toastrService.error("Failed to load Institute list.");
  //       }
  //     },
  //     error: (err) => {
  //       this.toastrService.error("Error fetching Institute list.");
  //     }
  //   });
  // }
 





  


  getTrainingPlanningById(pk_planningId: number) {
    this.ngxUILoaderService.start();

    this.trainingPlanningService.getByid_trainingPlanning(pk_planningId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const training = res.data.training;
          const audienceDetails = res.data.audienceTypeDetails || [];

          // Patch main training fields
          this.trainingForm.patchValue({
            pk_planningId: training.pk_planningId,
            title: training.trainingTitle,
            trainer: training.trainer,
            location: training.location,
            duration: training.duration,
            institute: training.fk_InstituteId || '', // Add institute field
            trainingcharge: training.trnCharge || '', // Add trnCharge field
            isApproved: training.approval,
            dateTime: training.trainingDateTime
          });
          // Set trainer type and show institute dropdown if needed
          this.selectedTrainerType = training.trainer;
          this.showInstituteDropdown = training.trainer === 'external';

          // Update institute field validation based on trainer type
          if (this.showInstituteDropdown) {
            this.trainingForm.get('institute')?.setValidators([Validators.required]);
          } else {
            this.trainingForm.get('institute')?.clearValidators();
          }
          this.trainingForm.get('institute')?.updateValueAndValidity();


          // Prepare audience values based on target audience type
          let audienceValues: string[] = [];
          if (training.targetAudienceType === 'D') {
            audienceValues = audienceDetails
              .map((a: any) => a.fk_depId?.toString())
              .filter((v: any) => v);
          } else if (training.targetAudienceType === 'R') {
            audienceValues = audienceDetails
              .map((a: any) => a.fk_roleId?.toString())
              .filter((v: any) => v);
          } else if (training.targetAudienceType === 'E') {
            audienceValues = audienceDetails
              .map((a: any) => a.fk_empId?.toString())
              .filter((v: any) => v);
          }

          // Set audience type and patch values
          this.onAudienceTypeChange(training.targetAudienceType, audienceValues);
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load training details.");
        }

        this.ngxUILoaderService.stop();
      },
      error: () => {
        this.toastrService.error("Error loading training data.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  onSubmit() {

    if (this.trainingForm.invalid) {
      this.showError = true;
      return;
    }

    const formValue = this.trainingForm.value;
    let audienceDetails: any[] = [];

    // Build audience details based on selected audience type
    if (this.selectedAudienceType === 'D') {
      audienceDetails = formValue.audienceValues.map((id: any) => ({
        fk_depId: id,
        fk_roleId: null,
        fk_empId: null
      }));
    } else if (this.selectedAudienceType === 'R') {
      audienceDetails = formValue.audienceValues.map((id: any) => ({
        fk_depId: null,
        fk_roleId: id,
        fk_empId: null
      }));
    } else if (this.selectedAudienceType === 'E') {
      audienceDetails = formValue.audienceValues.map((id: any) => ({
        fk_depId: null,
        fk_roleId: null,
        fk_empId: id
      }));
    }
debugger
    const payload = {
      training: {
        pk_planningId: this.planningid ?? 0,
        fk_TNIId: formValue.fk_tniId,    
        fk_programId: Number(formValue.programId || null),      // ✅ Added Program Id
        fk_subprogramId: formValue.subProgramId || null,
        trainer: formValue.trainer,
        trainerName: formValue.trainername,
        location: formValue.location,
        mode: formValue.mode,
        duration: (formValue.duration).toString(),
        fk_InstituteId: formValue.institute || null,
        trnCharge: formValue.trainingcharge || null,
        approval: formValue.isApproved,
        trainingDateTime: formValue.dateTime,
        targetAudienceType: this.selectedAudienceType
      },
      audienceDetails
    };

    // Determine if this is an update or insert operation
    if (this.Isedit) {
      // Update existing training
      this.trainingPlanningService.update_trainingPlanning(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success('Training updated successfully');
            this.router.navigate(['/dash/training/trainingdashboard/TrainingPlanning_List']);
          } else {
            this.toastrService.error(res.message || 'Failed to update training');
          }
        },
        error: (err) => {
          this.toastrService.error('Error while updating training');
          console.error(err);
        }
      });
    } else {
      // Insert new training
      this.trainingPlanningService.add_TrainingPlanning(payload).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.toastrService.success('Training saved successfully');
            // this.trainingForm.reset();
            // this.trainingId = null;
            // this.Isedit = false;
            this.router.navigate(['/dash/training/trainingdashboard/TrainingPlanning_List']);

          } else {
            this.toastrService.error(res.message || 'Failed to save training');
          }
        },
        error: (err) => {
          this.toastrService.error('Error while saving training');
          console.error(err);
        }
      });
    }
  }

  resetForm() {
    this.trainingForm.reset();
    this.selectedAudienceType = '';
    this.currentList = [];
    this.showError = false;
    this.Isedit = false;
    this.planningid = null;
  }







  // loadApprovedTNI(subProgramId?: number, tniId?: number) {
  //   this.trainingPlanningService.getApprovedTNI(subProgramId, tniId).subscribe({
  //     next: (res: any) => {
  //       if (res.isSuccess && res.data.length > 0) {
  //         const firstTni = res.data[0];
  //         this.approvedTNIList = res.data;

  //         // Patch program + subprogram
  //         this.trainingForm.patchValue({
  //           fk_tniId: firstTni.pk_TNIId,
  //           programName: firstTni.lineItems?.[0]?.programName || '',
  //           programId: firstTni.lineItems?.[0]?.fk_programId || '',
  //           subProgramId: firstTni.lineItems?.[0]?.fk_subprogramId || '',
  //           subProgramName: firstTni.lineItems?.[0]?.subProgramName || ''
  //         });

  //         // Patch radio button & audience list
  //         this.selectedAudienceType = firstTni.targetAudience;

  //         // ✅ Pass audienceIds to patch the ng-select after currentList is ready
  //         const audienceIds = firstTni.audienceIds || [];
  //         this.onAudienceTypeChange(this.selectedAudienceType, audienceIds);
  //       } else {
  //         this.approvedTNIList = [];
  //         console.warn('No approved TNI:', res.message);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching approved TNI:', err);
  //     }
  //   });
  // }
}