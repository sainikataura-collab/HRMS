import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { CommonSearchComponent } from '../../../payroll/Employee/common-search/common-search.component';
import { HrAppreciationMasterService } from '../../HRservices/hr-appreciation-master.service';
import { EncryptionService } from '../../../../../shared/services/encryption.service';


@Component({
  selector: 'app-appreciation-master',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    NgxPaginationModule,
    NgSelectModule,
    CommonSearchComponent,
  ],
  templateUrl: './appreciation-master.component.html',
  styleUrl: './appreciation-master.component.scss'
})
export class AppreciationMasterComponent {
  FileName: string = '';
  ImageUrl: string = '';
  ImagePath: string = '';
  oldfile: string = '';
  selectedFile: File | null = null;
  AppreciationMasterform!: FormGroup;
  EmployeeList: { name: string; value: string }[] = [];
  submitted = false;
  showError = false;
  pk_appreciationId: number = 0;
  isEditMode: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);

  // Default filter structure
  employeeFilters = {
    empCode: '',
    empCodeManual: '',
    empName: '',
    selectedDepartments: [],
    selectedDesignation: '',
    selectedLocations: [],
    selectedNature: '',
    selectedCity: '',
    sortBy: '',
    empStatus: '',
  };

  Type = [
    { name: '--Select Type --', value: '' },
    { name: 'Appreciation', value: 'A' },
    { name: 'Shabash Card', value: 'S' },
  ];

  constructor(
    private fb: FormBuilder,
    private hrAppreciationMasterService: HrAppreciationMasterService,
    private toastrService: ToastrService,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit() {
    this.initializeForm();

    // Check if ID is provided in the route
    this.route.paramMap.subscribe((params) => {
      const pk_appreciationId = params.get('pk_appreciationId');
      if (pk_appreciationId) {
        this.pk_appreciationId = +this.encryptionService.decryptText(pk_appreciationId);
        this.isEditMode = true;
        this.getAppreciationById(this.pk_appreciationId);
      }
    });

    this.getEmployees();
  }

  initializeForm(): void {
    this.AppreciationMasterform = this.fb.group({
      type: ['', Validators.required],
      fk_empid: ['', Validators.required],
      fk_empApreid: ['', Validators.required],
      incidentDate: ['', Validators.required],
      incidentDetails: ['', Validators.required],
      filepath: [''],
    });
  }


  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.FileName = '';
      this.ImageUrl = '';
    }
  }
  formatDateForInput(dateStr: string): string | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    const date = new Date(+year, +month - 1, +day); // Month is 0-based in JS
    if (isNaN(date.getTime())) return null;

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  handleFilters(filters: any) {
    this.employeeFilters = filters;
    this.getEmployees(); // Refresh list with new filters
  }

  getEmployees(): void {
    this.hrAppreciationMasterService.get_Employees_Ddl(this.employeeFilters).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.EmployeeList = res.data.map((emp: any) => ({
            name: emp.name,
            value: emp.value,
          }));
        } else {
          this.EmployeeList = [];
          this.toastrService.error(res.message, 'Error');
        }
      },
      error: (error) => {
        this.EmployeeList = [];
        this.toastrService.error('Failed to retrieve employees', 'Error');
      },
    });
  }

  
//  filepath: string | null = null;
  getAppreciationById(pk_appreciationId: number) {
    this.hrAppreciationMasterService.getAppreciationById(pk_appreciationId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.AppreciationMasterform.patchValue({
            type: response.data.type,
            fk_empid: response.data.fk_empid,
            fk_empApreid: response.data.fk_empApreid,
            incidentDate: this.formatDateForInput(response.data.incidentDate),
            incidentDetails: response.data.incidentDetails,
            filepath: response.data.filename,
          });
          this.oldfile = response.data.filename; // Reset selected file
         this.FileName = response.data.filename;
         if (this.FileName) {
          this.hrAppreciationMasterService.getImage(this.FileName).subscribe({
            
            next: (blob) => {
              this.ImageUrl = URL.createObjectURL(blob);
            },
            error: (err) => {
              console.error('Failed to load image:', err);
              this.ImageUrl = '';
            }
          });
        }
        } else {
          this.toastrService.error(
            response.message || 'Failed to fetch appreciation data'
          );
        }
      },
      (error) => {
        console.error('Error fetching appreciation:', error);
        this.toastrService.error('Error fetching appreciation data');
      }
    );
  }

  resetForm(): void {
    this.AppreciationMasterform.reset();
    this.submitted = false;
    this.showError = false;
  }

  onSubmit(): void {
    debugger
    this.submitted = true;
    if (this.AppreciationMasterform.invalid) {
      this.showError = true;
      return;
    }
    const formValues = this.AppreciationMasterform.value;
    // Step 1: Create FormData object
    const formData = new FormData();
    // Step 2: Append form fields
    formData.append('pk_appreciationId', this.isEditMode ? this.pk_appreciationId.toString() : '');
    formData.append('type', formValues.type);
    formData.append('fk_empid', formValues.fk_empid);
    formData.append('fk_empApreid', formValues.fk_empApreid);
    formData.append('incidentDate', formValues.incidentDate);
    formData.append('incidentDetails', formValues.incidentDetails);
   // Optional field, can be empty
    if (this.selectedFile) {
      formData.append('filepath', this.selectedFile || ''); // New file uploaded
    } 
    else if (this.oldfile) {
      formData.append('attachment', this.oldfile); // No new file, use existing
      console.log("ghihi",this.oldfile)
    }
    // Step 5: API call (add/update)
    if (this.isEditMode && this.pk_appreciationId) {
      this.hrAppreciationMasterService.updateAppreciation(formData).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Appreciation updated successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/Appreciation_Mst_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to update appreciation');
          }
        },
        (error) => {
          console.error('Update Error:', error);
          this.toastrService.error('Error updating appreciation');
        }
      );
    } else {
      this.hrAppreciationMasterService.addAppreciation(formData).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Appreciation created successfully!');
            this.router.navigate(['/dash/hr/hrdashboard/Appreciation_Mst_list']);
          } else {
            this.toastrService.error(response.message || 'Failed to create appreciation');
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
