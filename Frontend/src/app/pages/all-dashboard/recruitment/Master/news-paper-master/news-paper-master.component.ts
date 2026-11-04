import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NewsPaperMasterService } from '../../RecruitServices/news-paper-master.service';

@Component({
  selector: 'app-news-paper-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './news-paper-master.component.html',
  styleUrl: './news-paper-master.component.scss'
})
export class NewsPaperMasterComponent {
  newsPaperForm!: FormGroup;
  submitted = false;
  showerror = false;
  id: string | null = null;
  isEditMode: boolean = false;
  route = inject(ActivatedRoute);

  constructor(
    private fb: FormBuilder,
    private newsPaperMasterService: NewsPaperMasterService,
    private toastrService: ToastrService,
    private router: Router,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.newsPaperForm = this.fb.group({
      newspaperName: ['', [Validators.required, Validators.maxLength(255)]],
      contactperson1: ['', Validators.maxLength(100)],
      contactno1: ['', Validators.maxLength(12)],
      contactperson2: ['', Validators.maxLength(100)],
      contactno2: ['', Validators.maxLength(12)]
    });

    this.newsPaperForm.get('newspaperName')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkNewsPaperAvailability(value);
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.id = id;
        this.isEditMode = true;
        this.getNewsPaperById(this.encryptionService.decryptText(id));
      }
    });
  }

  checkNewsPaperAvailability(newspaperName: string): void {
    const fieldName = 'NewsPaper';
    const fieldValue = newspaperName;
    const generalId = this.id ? this.encryptionService.decryptText(this.id) : '';

    this.newsPaperMasterService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.newsPaperForm.get('newspaperName')?.setErrors({ duplicate: response.message });
        } else {
          this.newsPaperForm.get('newspaperName')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Duplicate Check API Error:', err);
        this.newsPaperForm.get('newspaperName')?.setErrors({ duplicate: 'Error checking availability.' });
      }
    });
  }

  getNewsPaperById(newspaperId: string) {
    this.newsPaperMasterService.getNewsPaperById(newspaperId).subscribe(
      (response) => {
        if (response.isSuccess && response.data) {
          this.newsPaperForm.patchValue({
            newspaperName: response.data.newspaperName,
            contactperson1: response.data.contactperson1,
            contactno1: response.data.contactno1,
            contactperson2: response.data.contactperson2,
            contactno2: response.data.contactno2
          });
        } else {
          console.error('Failed to fetch NewsPaper:', response.message);
          this.toastrService.error(response.message || 'Failed to fetch news paper.');
        }
      },
      (error) => {
        console.error('Error fetching NewsPaper:', error);
        this.toastrService.error('Error fetching news paper.');
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.newsPaperForm.invalid) {
      this.showerror = true;
      return;
    }
    const formData = this.newsPaperForm.value;
    if (this.isEditMode && this.id) {
      const newspaperId = this.encryptionService.decryptText(this.id);
      this.newsPaperMasterService.updateNewsPaper(newspaperId, { pk_newspaperId: newspaperId, ...formData }).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'NewsPaper updated successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/newsPaper-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        },
        error => {
          console.error('Error updating NewsPaper:', error);
          this.toastrService.error('Error updating news paper.');
        }
      );
    } else {
      this.newsPaperMasterService.add_NewspaperMaster(formData).subscribe(
        response => {
          if (response.isSuccess) {
            this.toastrService.success(response.message || 'NewsPaper created successfully!');
            this.router.navigate(['/dash/recruitment/recruitmentdashboard/newsPaper-master_list']);
          } else {
            this.toastrService.error(response.message);
          }
        },
        error => {
          console.error('Error creating NewsPaper:', error);
          this.toastrService.error('Error creating news paper.');
        }
      );
    }
  }

  resetForm(): void {
    this.newsPaperForm.reset();
    this.submitted = false;
    this.showerror = false;
    this.id = null;
    this.isEditMode = false;
  }
}
