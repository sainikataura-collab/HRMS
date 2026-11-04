import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { LevelMasterService } from '../../../services/level-master.service';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';

@Component({
  selector: 'app-level-master',
  standalone: true,
  imports: [CommonModule, NgSelectModule,ReactiveFormsModule],
  templateUrl: './level-master.component.html',
  styleUrl: './level-master.component.scss'
})
export class LevelMasterComponent {
  levelForm!: FormGroup;
  submitted = false;
  showError = false;
  levelId: string = '';
  isEditMode: boolean = false;
  reimbHeadList: any[] = [];
  route = inject(ActivatedRoute);
  

  constructor(
    private fb: FormBuilder,
    private levelmasterService:LevelMasterService,
    private toastrService: ToastrService,
    private router: Router,private encryptionService : EncryptionService
  ) {}  
 
  ngOnInit(): void {
    this.levelForm = this.fb.group({
      description: ['', [Validators.required, Validators.maxLength(150)]],
      Level: ['', [Validators.required]],
        VariablePayPercent: [null, [Validators.min(0), Validators.max(100)]],
         IsReimbursmentAllowed: [false],
          ReimbHeads: this.fb.array([])   // 👈 ADD THIS
      // Note: fk_companyId, fk_InsuserId, and Timestamp are typically handled server-side, so not included in the form
    });

    this.levelForm.get('description')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkOperationalAvailability(value);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('pk_levelid');
      if (id) {
        this.levelId = this.encryptionService.decryptText(id.toString()) ;
        this.isEditMode = true;
        this.getLevelById(this.levelId);
      }
    });
  }
  get reimbHeadsArray() {
  return this.levelForm.get('ReimbHeads') as any;
}

onReimbToggle(event: any) {
  const isChecked = event.target.checked;

  if (isChecked) {
    this.loadReimbHeads();
  } else {
    this.reimbHeadsArray.clear();
  }
}
loadReimbHeads() {
  this.levelmasterService.getReimbHeads().subscribe(res => {
    this.reimbHeadList = res.data;

    this.reimbHeadsArray.clear();

    this.reimbHeadList.forEach((head: any) => {
      this.reimbHeadsArray.push(this.fb.group({
        headId: [head.pk_headId],
        headName: [head.description],
        amount: [0]
      }));
    });
  });
}
  checkOperationalAvailability(description: string): void {
    const fieldName = 'Levell';
    const fieldValue = description;
    const generalId = this.levelId || '';

    this.levelmasterService.checkDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.levelForm.get('description')?.setErrors({ duplicate: response.message });
        } else {
          this.levelForm.get('description')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.levelForm.get('description')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  // getLevelById(id: string) {
  //   this.levelmasterService.getLevelById(id).subscribe(
  //     (response) => {
  //       if (response.isSuccess && response.data) {
  //         this.levelForm.patchValue({
  //           description: response.data.description,
  //            Level: response.data.level,
  //             VariablePayPercent: response.data.variablePayPercent,
  //              IsReimbursmentAllowed: response.data.isReimbursmentAllowed

               
  //         });
  //       } else {
  //         console.error('Failed to fetch Level:', response.message);
  //         this.toastrService.error(response.message || 'Failed to load level data');
  //       }
  //     },
  //     error => {
  //       console.error('Error fetching Level:', error);
  //       this.toastrService.error('Error loading level data');
  //     }
  //   );
  // }

  getLevelById(id: string) {
  this.levelmasterService.getLevelById(id).subscribe(
    (response) => {
      if (response.isSuccess && response.data) {

        // 1. Patch main form
        this.levelForm.patchValue({
          description: response.data.level.description,
          Level: response.data.level.level,
          VariablePayPercent: response.data.level.variablePayPercent,
          IsReimbursmentAllowed: response.data.level.isReimbursmentAllowed
        });

        // 2. Load reimb heads into FormArray
        if (response.data.reimbHeads && response.data.reimbHeads.length > 0) {

          this.reimbHeadsArray.clear();

          response.data.reimbHeads.forEach((head: any) => {
            this.reimbHeadsArray.push(this.fb.group({
              headId: [head.headId || null],
              headName: [head.HeadName],
              amount: [head.Amount || 0]
            }));
          });
        }

      } else {
        console.error('Failed to fetch Level:', response.message);
        this.toastrService.error(response.message || 'Failed to load level data');
      }
    },
    error => {
      console.error('Error fetching Level:', error);
      this.toastrService.error('Error loading level data');
    }
  );
}
  onSubmit(): void {
    this.submitted = true;
    if (this.levelForm.invalid) {
      this.showError = true;
      return;
    }
    debugger
    const formData = this.levelForm.value;
    if (this.isEditMode && this.levelId) {
      this.levelmasterService.updateLevel({pk_levelid: this.levelId, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Level updated successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to update level');
          }
        },
        error => {
          console.error('Error updating level:', error);
          this.toastrService.error('Error updating level data');
        }
      );
    
    } else {
      this.levelmasterService.addLevelMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'Level created successfully!');
            this.view();
          } else {
            this.toastrService.error(response.message || 'Failed to create level');
          }
        },
        error => {
          console.error('Error creating level:', error);
          this.toastrService.error('Error saving level data');
        }
      );
    }
  }

  view(): void {
    this.router.navigateByUrl("/dash/user/userdashboard/level-master_list");
  }

  resetForm(): void {
    this.levelForm.reset({
      description: ''
    });
    this.showError = false;
    this.submitted = false;
  }


}
