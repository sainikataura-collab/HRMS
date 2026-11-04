import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrainingPlanningService } from '../../../all-dashboard/training/services/training-planning.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-training-calendar-view',
  standalone: true,
 imports: [CommonModule,RouterLink],
  templateUrl: './training-calendar-view.component.html',
  styleUrl: './training-calendar-view.component.scss'
})
export class TrainingCalendarViewComponent {
 ngxUILoaderService = inject(NgxUiLoaderService);

  trainingDetail: any;
   isLoading = true;

  constructor(private http: HttpClient,private route:ActivatedRoute,
            private trainingplanningService:TrainingPlanningService,private toastrService:ToastrService,private encriptService:EncryptionService
  ) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const tniId = this.encriptService.decryptText(params['tniId']);
    const programId = Number(this.encriptService.decryptText(params['programId']));
    const subProgramId =Number(this.encriptService.decryptText(params['subProgramId']));

    // 🔹 Ab API call karo with these params
    this.get_empviewid(programId, subProgramId);
  });
}

     get_empviewid(pk_programId: number,pk_subprogramId:number) {
           this.ngxUILoaderService.start(); // Start loader before API call

        this.trainingplanningService.getTNI_View(pk_programId,pk_subprogramId).subscribe({
          next: (res) => {
            if (res.isSuccess && res.data) {
                   this.ngxUILoaderService.stop(); // Start loader before API call

                // 🔹 Single object assign karo (list nahi)
              this.trainingDetail = res.data;
            }
             else 
             {
              console.log("Failed to load employee details.");
             }
      
          }
         
        });
      }


}
