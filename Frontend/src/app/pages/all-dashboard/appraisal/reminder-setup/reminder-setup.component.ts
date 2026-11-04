import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { appraisalService } from '../appraisal.service';

@Component({
  selector: 'app-reminder-setup',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reminder-setup.component.html',
  styleUrl: './reminder-setup.component.scss'
})
export class ReminderSetupComponent {
  reminderForm: FormGroup;

  // Dynamic label list
  reminderLabels: string[] = [
    'KRA Intimation Alert',
    'KRA Approval Alert',
    'KRA Pending Alert',
    'Re-Intimation Alert',
    'Approval Pending Alert',
    'Final Approval Alert'
  ];

  constructor(private fb: FormBuilder, private reminderService:appraisalService, private toastrService: ToastrService,) {
    this.reminderForm = this.fb.group({
      reminders: this.fb.array(this.reminderLabels.map(label => this.createReminder(label)))
    });
  }

  get reminders(): FormArray {
    return this.reminderForm.get('reminders') as FormArray;
  }

  createReminder(defaultMessage: string): FormGroup {
    return this.fb.group({
      alert: [''],     // Custom message input
      active: [false], // Switch
      count: [0]       // Count input
    });
  }


//   onSubmit() {
//   const rawData = this.reminderForm.value.reminders;

//   const formattedData = rawData.map((item: any, index: number) => ({
//     Alert: this.reminderLabels[index],   // Label to be saved in DB
//     Message: item.alert,                 // User input
//     IsActive: item.active,               // true/false
//     AlertCount: item.count               // number
//   }));

//   const payload = {
//     reminderSetupMst: formattedData      // ✅ Wrap array in object
//   };

  
//   this.reminderService.add_Reminder_Setup(payload).subscribe({
//     next: (res) => {
//      if(res.isSuccess)
//      {
//        this.toastrService.success(res.message || 'Reminders saved successfully!');
//      }

//      // Reset and reinitialize form
//       this.reminderForm.reset();
//       this.reminderForm.setControl(
//         'reminders',
//         this.fb.array(this.reminderLabels.map(label => this.createReminder(label)))
//       );
     
//     },
//     error: (err) => {
//      this.toastrService.error("Error fetching class list. Please try again.");
     
//     }
//   });
// }
onSubmit() {
  const rawData = this.reminderForm.value.reminders;

  const formattedData = rawData.map((item: any, index: number) => ({
    Alert: this.reminderLabels[index],
    Message: item.alert,
    IsActive: item.active,
    AlertCount: item.count
  }));

  const payload = {
    reminderSetupMst: formattedData
  };

  this.reminderService.add_Reminder_Setup(payload).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        this.toastrService.success(res.message || 'Reminders saved successfully!');
        
        // Reset and reinitialize form
        this.reminderForm.reset();
        this.reminderForm.setControl(
          'reminders',
          this.fb.array(this.reminderLabels.map(label => this.createReminder(label)))
        );
      } else {
        this.toastrService.error(res.message || 'Failed to save reminders.');
      }
    },
    error: (err) => {
      this.toastrService.error("Failed to save reminders. Please try again.");
      console.error(err);
    }
  });
}


}

