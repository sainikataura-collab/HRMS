import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../HRservices/event.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../shared/services/encryption.service';
import { ProgramService } from '../../../training/services/program.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-event-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgSelectModule],
  templateUrl: './event-master.component.html',
  styleUrl: './event-master.component.scss'
})
export class EventMasterComponent {

  ngxUILoaderService = inject(NgxUiLoaderService);
  eventForm!: FormGroup;
  showError = false;
  Isedit = false;
  eventId: number | null = null;

  selectedDepartment: string[] = [];
  selectedLocation: string[] = [];
  department: { name: string, value: string }[] = [];
  location: { name: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private encryptionService: EncryptionService,
    private Service: ProgramService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      eventName: [null, Validators.required],
      eventDate: [null, Validators.required],
       eventVenue: [null, Validators.required],
      // fk_locId: [null, Validators.required],
      fk_deptId: [[]],
      fk_locId: [[]],
      isActive: [true]
    });

    this.getdeptList('Department');
    this.getlocList('Location');

    const encId = this.route.snapshot.params['pk_eventId'];
    if (encId) {
      this.eventId = Number.parseInt(this.encryptionService.decryptText(encId));
      if (this.eventId) {
        this.getEventDetailsById(this.eventId);
        this.Isedit = true;
      }
    }
  }

  // --- Get Department List ---
  getdeptList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getCommonList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.department = res.data.map((dept: any) => ({
            name: dept.name,
            value: dept.value
          }));
        } else {
          this.toastr.error("Failed to load Department list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching department list:", err);
        this.toastr.error("Error fetching Department list.");
        this.ngxUILoaderService.stop();
      }
    });
  }
  getlocList(fieldName: string) {
    this.ngxUILoaderService.start();
    this.Service.getCommonList(fieldName).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.location = res.data.map((fk_locid: any) => ({
            name: fk_locid.name,
            value: fk_locid.value
          }));
        } else {
          this.toastr.error("Failed to load Department list.");
        }
        this.ngxUILoaderService.stop();
      },
      error: (err) => {
        console.error("Error fetching department list:", err);
        this.toastr.error("Error fetching Department list.");
        this.ngxUILoaderService.stop();
      }
    });
  }

  // --- Multi-select Department Handlers ---
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedDepartment = [];
    } else {
      this.selectedDepartment = this.department.map(dep => dep.value);
    }
    this.eventForm.patchValue({ fk_deptId: this.selectedDepartment });
  }

  isAllSelected(): boolean {
    return this.selectedDepartment.length === this.department.length;
  }

  getLocationDisplayText(): string {
    if (this.isAllSelected()) {
      return "All Selected";
    } else if (this.selectedDepartment.length === 1) {
      return this.department.find(item => item.value === this.selectedDepartment[0])?.name || "--Select Department--";
    } else if (this.selectedDepartment.length > 1) {
      const firstSelected = this.department.find(item => item.value === this.selectedDepartment[0])?.name;
      return firstSelected ? `${firstSelected}...` : "--Select Department--";
    } else {
      return "--Select Department--";
    }
  }

  toggleLocation(deptValue: string) {
    if (this.selectedDepartment.includes(deptValue)) {
      this.selectedDepartment = this.selectedDepartment.filter(item => item !== deptValue);
    } else {
      this.selectedDepartment.push(deptValue);
    }
    this.eventForm.patchValue({ fk_deptId: this.selectedDepartment });
  }



 
 // for multi-select Location

// for multi-select Location

toggleSelectAllLoc() {
  if (this.isAllSelectedLoc()) {
    this.selectedLocation = [];
  } else {
    this.selectedLocation = this.location.map(dep => dep.value);
  }
  this.eventForm.patchValue({ fk_locId: this.selectedLocation });
}

isAllSelectedLoc(): boolean {
  return this.selectedLocation.length === this.location.length;
}

getLocationDisplayTextLoc(): string {
  if (this.isAllSelectedLoc()) {
    return "All Selected";
  } else if (this.selectedLocation.length === 1) {
    return this.location.find(item => item.value === this.selectedLocation[0])?.name || "--Select location--";
  } else if (this.selectedLocation.length > 1) {
    const firstSelected = this.location.find(item => item.value === this.selectedLocation[0])?.name;
    return firstSelected ? `${firstSelected}...` : "--Select location--";
  } else {
    return "--Select location--";
  }
}

toggleLoc(value: string) {
  if (this.selectedLocation.includes(value)) {
    this.selectedLocation = this.selectedLocation.filter(v => v !== value);
  } else {
    this.selectedLocation.push(value);
  }
  this.eventForm.patchValue({ fk_locId: this.selectedLocation });
}



  // --- Get Event details for Edit ---
  // getEventDetailsById(eventId: number) {
  //   this.eventService.getEventById(eventId).subscribe({
  //     next: (res) => {
  //       if (res.isSuccess && res.data) {
  //         const event = res.data.event;
  //         const details = res.data.eventDetails || [];

  //         this.eventForm.patchValue({
  //           eventName: event.eventName,
  //           eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
  //           eventVenue: event.eventVenue,
  //           isActive: event.isActive,
  //         });

  //         this.selectedDepartment = details.map((d: any) => d.fk_deptId);
  //         this.eventForm.patchValue({ fk_deptId: this.selectedDepartment });
  //         this.Isedit = true;
  //       } else {
  //         this.toastr.error('Failed to load event details.');
  //       }
  //     },
  //     error: () => {
  //       this.toastr.error('Error loading event details.');
  //     }
  //   });
  // }
  getEventDetailsById(eventId: number) {
  this.eventService.getEventById(eventId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.data) {
        const event = res.data.event;
        const deptdetails = res.data.depDetails || [];
        const locdetails = res.data.locDetails || [];

        // 🟢 Patch event main data
        this.eventForm.patchValue({
          eventName: event.eventName,
          eventDate: event.eventDate ? event.eventDate.split('T')[0] : '',
          eventVenue: event.eventVenue,
          isActive: event.isActive,

          // fk_locId: event.fk_locId
        });

        // 🟢 Extract department IDs
        this.selectedDepartment = deptdetails.map((d: any) => d.fk_deptId);
        this.eventForm.patchValue({ fk_deptId: this.selectedDepartment });

        this.selectedLocation = locdetails.map((d: any) => d.fk_locId);
        this.eventForm.patchValue({ fk_locId: this.selectedLocation });




        this.Isedit = true;
      } else {
        this.toastr.error('Failed to load event details.');
      }
    },
    error: () => {
      this.toastr.error('Error loading event details.');
    }
  });
}


  // --- Submit Form (Insert / Update) ---
  // submitForm(): void {
  //   this.showError = false;

  //   if (this.eventForm.invalid || this.selectedDepartment.length === 0) {
  //     this.showError = true;
  //     this.toastr.error("Please fill required fields and select at least one department.");
  //     return;
  //   }

  //   this.ngxUILoaderService.start();

  //   const eventPayload = {
  //     pk_eventId: this.eventId || 0,
  //     eventName: this.eventForm.value.eventName,
  //     eventDate: this.eventForm.value.eventDate,
  //     // eventVenue: this.eventForm.value.eventVenue,
  //     fk_locId: this.eventForm.value.fk_locId,
  //     isActive: this.eventForm.value.isActive,
  //     isActiveAlias: this.eventForm.value.isActive ? "Active" : "Inactive",
  //   };

  //   const eventDetails = this.selectedDepartment.map(deptId => ({
  //     fk_deptId: deptId,
    
  //   }));

  //   const payload = {
  //     event: eventPayload,
  //     eventDetails: eventDetails
  //   };

  //   if (this.eventId) {
  //     // --- Update ---
  //     this.eventService.update_event(payload).subscribe({
  //       next: (res) => {
  //         this.ngxUILoaderService.stop();
  //         if (res.isSuccess) {
  //           this.toastr.success(res.message);
  //           this.router.navigate(['/dash/hr/hrdashboard/event_list']);
  //         } else {
  //           this.toastr.error(res.message || 'Failed to update event.');
  //         }
  //       },
  //       error: (err) => {
  //         this.ngxUILoaderService.stop();
  //         console.error('Update Error:', err);
  //         this.toastr.error('Something went wrong while updating event.');
  //       }
  //     });
  //   } else {
  //     // --- Insert ---
  //     this.eventService.add_event(payload).subscribe({
  //       next: (res) => {
  //         this.ngxUILoaderService.stop();
  //         if (res.isSuccess) {
  //           this.toastr.success(res.message);
  //           this.router.navigate(['/dash/hr/hrdashboard/event_list']);
  //         } else {
  //           this.toastr.error(res.message || 'Failed to add event.');
  //         }
  //       },
  //       error: (err) => {
  //         this.ngxUILoaderService.stop();
  //         console.error('Insert Error:', err);
  //         this.toastr.error('Something went wrong while adding event.');
  //       }
  //     });
  //   }
  // }
submitForm(): void {
  this.showError = false;
  this.ngxUILoaderService.start();

  // --- 1️⃣ Prepare Main Event Object ---
  const eventPayload = {
    pk_eventId: this.eventId || 0,
    eventName: this.eventForm.value.eventName,
    eventDate: this.eventForm.value.eventDate,
    eventVenue: this.eventForm.value.eventVenue,
    
    isActive: this.eventForm.value.isActive,
  // isActiveAlias: this.eventForm.value.isActive ? "Active" : "Inactive",
  };

  // --- 2️⃣ Prepare Department List ---
  const departmentDetails = this.selectedDepartment.map((deptId: string) => ({
    fk_deptId: deptId,
     fk_eventId: this.eventId || 0,
  }));

  // --- 3️⃣ Prepare Location List ---
  const locationDetails = this.selectedLocation.map((locId: string) => ({
    fk_locId: locId,
     fk_eventId: this.eventId || 0,
  }));

  // --- 4️⃣ Final Payload Matching C# Model ---
  const payload = {
    event: eventPayload,
    departmentDetails: departmentDetails,
    locationDetails: locationDetails,
  };

  // --- 5️⃣ Insert or Update Logic ---
  if (this.eventId) {
    // ✅ Update existing event
    this.eventService.update_event(payload).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message);
          this.router.navigate(["/dash/hr/hrdashboard/event_list"]);
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        console.error("Update Error:", err);
        this.toastr.error("Something went wrong while updating event.");
      },
    });
  } else {
    // ✅ Insert new event
    this.eventService.add_event(payload).subscribe({
      next: (res) => {
        this.ngxUILoaderService.stop();
        if (res.isSuccess) {
          this.toastr.success(res.message );
          this.router.navigate(["/dash/hr/hrdashboard/event_list"]);
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.ngxUILoaderService.stop();
        console.error("Insert Error:", err);
        this.toastr.error("Something went wrong while adding event.");
      },
    });
  }
}


  // --- Duplicate Event Name Check ---
  checkEventAvailability(eventName: string): void {
    const fieldName = 'Event';
    const fieldValue = eventName;
    const generalId = this.eventId ?? 0;

    this.Service.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
      next: (response) => {
        if (response && response.isSuccess === false) {
          this.eventForm.get('eventName')?.setErrors({ duplicate: response.message });
        } else {
          this.eventForm.get('eventName')?.setErrors(null);
        }
      },
      error: () => {
        this.eventForm.get('eventName')?.setErrors({ duplicate: 'Error checking event availability.' });
      }
    });
  }

  resetForm(): void {
    this.eventForm.reset();
    this.selectedDepartment = [];
  }
}
