import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';

//import { TravelExpenceServicesService } from '../services/travel-expence-services.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';
import { TravelExpenceServicesService } from '../TravelService/travel-expence-services.service';


@Component({
  selector: 'app-travel-mode-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxPaginationModule, RouterLink],
  templateUrl: './travel-mode-master.component.html',
  styleUrl: './travel-mode-master.component.scss'
})
export class TravelModeMasterComponent {
  TravelMaster!: FormGroup;
  submitted = false;
  showError = false;
  pk_travelmodeID!: string;
  Isedit = false;


  constructor(private fb: FormBuilder, private travelExpenceServicesService: TravelExpenceServicesService, private toastrService: ToastrService, private router: Router, private route: ActivatedRoute, private encryptionService: EncryptionService) { }


  ngOnInit(): void {

    this.TravelMaster = this.fb.group({
      remarks: ['', [Validators.required]],
      description: ['', [Validators.required]],
      isActive:[false],
      isAir:[false] //ANAJLI 11 FEB 2026
    });


    this.pk_travelmodeID = this.encryptionService.decryptText(this.route.snapshot.params['pk_travelmodeID'].toString());
    
    if (this.pk_travelmodeID && this.pk_travelmodeID !== 'undefined') {
      this.loadFunctionalMasterData(this.pk_travelmodeID);
      this.Isedit = true;
    }
  }
  //Duplecacy Check
  /*
  checkDuplicate(description: string): void {
  const fieldName = 'FunctionalDescription';
  const fieldValue = description;
  const generalId = this.pk_travelmodeID || '';

  this.travelExpenceServicesService.CheckDuplicateValue(fieldName, fieldValue, generalId).subscribe({
    next: (response) => {
      if (response && response.isSuccess === false) {
        this.TravelMaster.get('description')?.setErrors({ duplicate: response.message });
      } else {
        this.TravelMaster.get('description')?.setErrors(null);
      }
    },
    error: (err) => {
      console.error('Duplicate Check API Error:', err);
      this.TravelMaster.get('description')?.setErrors({ duplicate: 'Error checking TravelMaster availability.' });
    }
  });
  }*/

  onSubmit() {

    if (this.TravelMaster.invalid) {
      this.showError = true;
      return;
    }

    const data = {
      ...this.TravelMaster.value,
    };


    if (this.Isedit) {
      const data = {
        travel: [{
          ...this.TravelMaster.value,
          pk_travelmodeID: Number(this.pk_travelmodeID)
        }]
      };
      debugger

      this.travelExpenceServicesService.update_travelModeMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
         
            this.toastrService.success(result.message);
            this.router.navigateByUrl("/dash/travel_expense/travel_expensedashboard/travel_mode_master_list");
          }
          else {
            this.toastrService.error(result.message);
          }
        },

        error: () => {
          // Error handling in case of a failure during form submission
          this.toastrService.error('An error occurred during form submission');
        }
      })
    }

    else {
      this.travelExpenceServicesService.add_travelModeMaster(data).subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.toastrService.success(result.message);
              this.router.navigateByUrl("/dash/travel_expense/travel_expensedashboard/travel_mode_master_list");

          } else {
            this.toastrService.error(result.message);
          }
        },
        error: () => {
          // Error handling in case of a failure during form submission
          this.toastrService.error('An error occurred during form submission');
        }
      })

    }
  }

  loadFunctionalMasterData(pk_travelmodeID: string) {
    this.travelExpenceServicesService.getById_travelModeMaster(pk_travelmodeID).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {

          this.TravelMaster.patchValue({
            remarks: res.data.remarks,
            isActive: res.data.isActive,
            description: res.data.classname,
            isAir: res.data.isAir // ANAJLI 11 FEB 2026
          });


          this.Isedit = true;
        } else {
          this.toastrService.error("Failed to load Travel Mode Master details.");
        }
      },

      error: () => {
        this.toastrService.error("Error loading Travel Mode Master data.");
      }
    });
  }

  resetForm(): void {
    this.TravelMaster.reset();
  }

}
