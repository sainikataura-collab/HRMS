import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { ProgramService } from '../../services/program.service';
import { TrainingCalendarService } from '../../services/training-calendar.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-training-meterial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectComponent, RouterLink],
  templateUrl: './training-meterial.component.html',
  styleUrl: './training-meterial.component.scss'
})
export class TrainingMeterialComponent {

  materialForm!: FormGroup;
  showError = false;
  selectedFileName: string = '';
  selectedFile: File | null = null;
  isEdit = false;
  pk_materialId: number | null = null

  // // Mock dropdown data (you can load from API later)
  // trainingPrograms = [
  //   { id: 1076, name: 'GU-41 - Safety Training' },
  //   { id: 1077, name: 'GU-48 - Technical Skills' },
  //   { id: 1078, name: 'GU-27 - Leadership Development' }
  // ];

  // planningSessions = [
  //   { id: 10034, name: 'GU-62 - October Session' },
  //   { id: 10035, name: 'GU-79 - November Session' },
  //   { id: 10036, name: 'GU-80 - December Session' }
  // ];

  materialTypes = [
    { id: '', name: 'Select Meterial Type' },
    { id: 'video', name: 'Video File' },
    { id: 'youtube', name: 'YouTube Link' },
    { id: 'link', name: 'External Link' },
    { id: 'document', name: 'Document/PDF' }
  ];

  trainingPrograms: { label: string, value: string }[] = [];

  //  programddl: { label: string, value: string }[]  = []; 

  constructor(private fb: FormBuilder, private Service: ProgramService, private toastrService: ToastrService,
    private calendarService: TrainingCalendarService, private ngxUILoaderService: NgxUiLoaderService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.pk_materialId = this.route.snapshot.params['pk_materialId']
    debugger
    if (this.pk_materialId && this.pk_materialId) {
      this.get_MeterialById(this.pk_materialId);
      this.isEdit = true;
      // this.SubDeptMstForm.get('fk_deptid')?.disable();
    }
    this.initializeForm();
    this.plannedList('PlannedProgram')


  }
  /** -------------------------
   * ✅ Initialize Reactive Form
   * -------------------------- */

  initializeForm() {
    this.materialForm = this.fb.group({
      fk_planningId: [null, Validators.required],
      // sessionId: [''],
      materialTitle: ['', Validators.required],
      materialType: ['', Validators.required],

      description: [''],
      isActive: [false],
      materialUrl: [''],
      file: [null]
    });

  }

  get_MeterialById(pk_materialId: number) {
    this.ngxUILoaderService.start(); // Start loader before API call
    this.calendarService.get_MeterialById(pk_materialId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const material = res.data;

          // ✅ Patch all form fields correctly
          this.materialForm.patchValue({
            fk_planningId: material.fk_planningId.toString(),
            materialType: material.materialType,
            materialTitle: material.materialTitle,
            description: material.description,

            isActive: material.active.toString(), // ✅ Direct boolean value,
            materialUrl: material.materialUrl
          });

          // ✅ File handling (optional)

          if (material.materialPath) {
            this.selectedFileName = material.materialPath.split('\\').pop()!;
          }
          this.ngxUILoaderService.stop();
        }

        else {
          this.toastrService.warning(res.message || "No data found.");
          this.ngxUILoaderService.stop();
        }
      },
      error: () => {
        this.toastrService.error("Error loading Training Material data.");
        this.ngxUILoaderService.stop();
      }
    });
  }



  plannedList(fieldName: string) {


    this.Service.getCommonList(fieldName).subscribe({
      next: (res) => {

        if (res.isSuccess && res.data) {
          res.data = res.data.slice(1);
          this.trainingPrograms = res.data.map((fk_planningId: any) => ({
            name: fk_planningId.name,
            value: fk_planningId.value
          }));
        }
        else {
          this.toastrService.warning("Failed to load complete program-subprogram  list.");
        }
        // Stop loader after response

      },
      error: (err) => {
        console.error("Error fetching content list:", err);
        this.toastrService.error("Error fetching content list.");

      }
    });
  }



  onMaterialTypeChange(): void {
    const type = this.materialForm.get('materialType')?.value;

    if (type === 'video' || type === 'document') {
      // Require file, clear URL validation
      this.materialForm.get('materialUrl')?.clearValidators();
      this.materialForm.get('file')?.setValidators([Validators.required]);
    } else {
      // Require URL, clear file validation
      this.materialForm.get('file')?.clearValidators();
      this.materialForm.get('materialUrl')?.setValidators([Validators.required]);
    }

    this.materialForm.get('materialUrl')?.updateValueAndValidity();
    this.materialForm.get('file')?.updateValueAndValidity();
  }




  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.materialForm.patchValue({ file });
    }
  }


  // ✅ Save/Submit material
  SaveMaterial(): void {
    debugger

    if (this.materialForm.invalid) {
      this.showError = true;

      // this.toastrService.warning('Please fill all required fields.');
      return;
    }

    const materialType = this.materialForm.value.materialType;

    // Validate based on material type
    if ((materialType === 'video' || materialType === 'document' || materialType === 'file') && !this.selectedFile) {
      this.toastrService.warning('Please upload a file for selected material type.');
      return;
    }
    if ((materialType === 'link' || materialType === 'youtube') && !this.materialForm.value.materialUrl) {
      this.toastrService.warning('Please enter a valid URL.');
      return;
    }


    // Build FormData
    const formData = new FormData();
    debugger
    if (this.isEdit && this.pk_materialId) {
      formData.append('pk_materialId', this.pk_materialId.toString());
    }
    // formData.append('sessionId', this.materialForm.value.sessionId);
    formData.append('fk_planningId', this.materialForm.value.fk_planningId);
    formData.append('materialType', this.materialForm.value.materialType);
    formData.append('materialTitle', this.materialForm.value.materialTitle);
    formData.append('materialUrl', this.materialForm.value.materialUrl || '');
    formData.append('description', this.materialForm.value.description || '');
    formData.append('isActive', this.materialForm.value.isActive);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    // ✅ Decide Insert or Update
    const apiCall = this.isEdit
      ? this.calendarService.UpdateMaterial(formData)
      : this.calendarService.MeterialUpload(formData);

    // 🧭 API Call
    apiCall.subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || (this.isEdit ? 'Material updated successfully.' : 'Material inserted successfully.'));
          // Optionally reset or navigate back
          this.router.navigate(['/dash/training/trainingdashboard/Training_content_list']);
        } else {
          this.toastrService.warning(res.message || 'Failed to save training material.');
        }

      },
      error: (err) => {
        console.error('Error:', err);
        this.toastrService.error('Server error while saving material.');
      }
    });


    // this.calendarService.MeterialUpload(formData).subscribe({
    //   next: (res: any) => {

    //     if (res.isSuccess) {
    //       this.toastrService.success(res.message || 'Training material inserted successfully.');
    //       // this.resetForm();
    //     } else {
    //       this.toastrService.error(res.message || 'Failed to insert training material.');
    //     }
    //   },
    //   error: (err) => {
    //     console.error(' Error:', err);
    //     this.toastrService.error('Server error while uploading material.');
    //   }
    // });


  }






  /** ----------------------------------
   * ✅ Reset Form
   * ---------------------------------- */
  // resetForm(): void {
  //   this.materialForm.reset({
  //     trainingId: '',
  //     // planningId: '',
  //     materialTitle: '',
  //     materialType: '',
  //     duration: '',
  //     displayOrder: 0,
  //     description: '',
  //     mandatory: 0,
  //     isActive: 1,
  //     materialUrl: '',
  //     file: null
  //   });
  //   this.selectedFileName = '';
  //   this.selectedFile = null;
  //   this.showError = false;
  // }


}