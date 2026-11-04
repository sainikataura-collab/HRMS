import { Component, OnInit, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeMasterService } from '../../payroll/services/employee-master.service';
import { EmployeeService } from '../../payroll/services/employee.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.scss'
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeMasterService = inject(EmployeeMasterService);
  private employeeService = inject(EmployeeService);
  private toastr = inject(ToastrService);
  private loader = inject(NgxUiLoaderService);
  private encryptionService = inject(EncryptionService);

  empId: string = '';
  profileData: any = null;
  profileImageUrl: string | null = null;
  activeTab: string = 'personal'; // personal, salary, attendance

  @Input() inputEmpId?: string;
  isModalView: boolean = false;

  ngOnInit(): void {
    if (this.inputEmpId) {
      this.isModalView = true;
      this.empId = this.inputEmpId;
      this.loadProfileData();
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['id']) {
          const encryptedId = params['id'];
          this.empId = this.encryptionService.decryptText(encryptedId).toString();
          this.loadProfileData();
        } else {
          this.toastr.error('Employee ID not found in URL.');
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputEmpId'] && !changes['inputEmpId'].isFirstChange()) {
      if (this.inputEmpId) {
        this.empId = this.inputEmpId;
        this.loadProfileData();
      }
    }
  }

  loadProfileData(): void {
    this.loader.start();
    this.employeeMasterService.getEmployeeProfileView(this.empId).subscribe({
      next: (res: any) => {
        this.loader.stop();
        if (res.isSuccess) {
          this.profileData = res.data;
          if (this.profileData?.imageFileName) {
            this.loadImage(this.profileData.imageFileName);
          }
        } else {
          this.toastr.error(res.message || 'Failed to load profile.');
        }
      },
      error: (err: any) => {
        this.loader.stop();
        this.toastr.error('An error occurred while loading the profile.');
        console.error(err);
      }
    });
  }

  loadImage(filename: string): void {
    this.employeeService.getImage(filename).subscribe({
      next: (blob: Blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.profileImageUrl = objectURL;
      },
      error: (err: any) => {
        console.error('Failed to load image', err);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
