import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashBoardService } from '../../HRservices/dash-board-detail.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-dashboard-master',
  standalone: true,
  imports: [FormsModule,RouterLink,ReactiveFormsModule,CommonModule,NgxPaginationModule,NgSelectModule],
  templateUrl: './dashboard-master.component.html',
  styleUrl: './dashboard-master.component.scss'
})
export class DashboardMasterComponent {

  dashboardForm!:FormGroup;
  submitted=false;
  Isedit=false;
  showError=false;
  pk_dashId!: number;
  constructor(private fb: FormBuilder,private httpservice: DashBoardService,private  toastrService: ToastrService,private router: Router,public encryption:EncryptionService,private route: ActivatedRoute) {}
  

  ngOnInit():void{
  this.dashboardForm=this.fb.group({
    description:['',[Validators.required]],
    dated:['',[Validators.required]],
    remarks:[''],
    active:[''],

  })
  this.pk_dashId = +this.encryption.decryptText(this.route.snapshot.params['pk_dashId']);
  if (this.pk_dashId) {
  this.Patchform(this.pk_dashId);
  this.Isedit = true; 
}
}

//submit form
submitForm(): void {

  if (this.dashboardForm.invalid) {
   // this.toastrService.error('Please fill all required fields.');
    this.showError = true;
    return;
  }

  const formData = {
    ...this.dashboardForm.value,
    
  };
  

  // ✅ **Check if perquisite exists (Update) or not (Insert)**
  if (this.pk_dashId) {
    // **UPDATE existing perquisite**
    const updateData = { ...formData, pk_dashId: this.pk_dashId};

    this.httpservice.update_dashboard(updateData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail updated successfully!');
          this.router.navigate(['dash/hr/hrdashboard/dashboar-master_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to update detail.');
        }
      },
      error: (err) => {
        console.error('Update API Error:', err);
        this.toastrService.error('Something went wrong while updating!');
      }
    });

  } else {
    // **INSERT new designation**
    this.httpservice.add_dashboard(formData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastrService.success(res.message || 'detail added successfully!');
          this.router.navigate(['/dash/hr/hrdashboard/dashboar-master_list']);
        } else {
          this.toastrService.error(res.message || 'Failed to add detail.');
        }
      },
      error: (err) => {
        console.error('Insert API Error:', err);
        this.toastrService.error('Something went wrong while adding!');
      }
    });
  }
}

// formatDateForInput(dateStr: string): string | null {
//     if (!dateStr) return null;
//     const date = new Date(dateStr);
//     const offset = date.getTimezoneOffset(); // Handle timezones correctly
//     const localDate = new Date(date.getTime() - offset * 60 * 1000);
//     return localDate.toISOString().split('T')[0]; // "yyyy-MM-dd"
//   }
//get by id and patch the value
Patchform(pk_dashId: number) {
   this.httpservice.get_dashboard_ById(this.pk_dashId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const rawDate = res.data.dated; // "03/04/2025"
        
          // Convert dd/MM/yyyy to yyyy-MM-dd
          const [day, month, year] = rawDate.split('/');
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
          this.dashboardForm.patchValue({
            description: res.data.description,
            dated:formattedDate,
             //dated: this.formatDateForInput(res.data.dated),
            active:res.data.active,
            remarks:res.data.remarks,
          
          });
          
  
          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load details.");
          
        }
       },
      error: () => {
        this.toastrService.error("Error loading data.");

  
      }
    });
  }
 


  

}
