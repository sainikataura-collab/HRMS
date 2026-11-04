import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { LWFSlabMasterService } from '../../../services/lwf-slab-master.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../../../shared/services/encryption.service';
import { formatDateForInput } from '../../../../../../healpers/commonlib';

@Component({
  selector: 'app-lwf-slab-mst',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,NgSelectComponent,RouterLink],
  templateUrl: './lwf-slab-mst.component.html',
  styleUrl: './lwf-slab-mst.component.scss'
})
export class LwfSlabMstComponent {

  lwdSlabForm!:FormGroup;
  Isedit=false;
  

  // pk_slabid:string='';
  slabid: number = 0;

 showError=false;



StateList: { label: string, value: number }[]  = [];


  EffectiveS=[
    // { name: 'select Head', value: '' },
    { name: 'Monthly', value: 'M' },
    { name: 'Quarterly', value: 'O' },
    { name: 'Half yearly', value: 'H' },
    { name: 'Yearly', value: 'Y' },

  ]

  constructor(private fb:FormBuilder, private lwfSlabService:LWFSlabMasterService,private toastrService:ToastrService,private router:Router,private route:ActivatedRoute,private encryptionService:EncryptionService){}

  ngOnInit():void{
 this.lwdSlabForm=this.fb.group({
  fk_stateid:[null,[Validators.required]],
  pk_slabid: [null],

  effecttype:[null,[Validators.required]],
  effectivefrom:[null,[Validators.required]],

  sno:[null,[Validators.required]],
  amt:[null,[Validators.required]],
  emrmultiple:[null,[Validators.required]],
  SlabPercent:[0]
 });

 this.getStateList('State');

 
  this.slabid= Number.parseInt(this.encryptionService.decryptText(this.route.snapshot.params['pk_slabid']))

 if (this.slabid) {
  this.getLwfByid(this.slabid);
  this.Isedit = true; 
}

  }



    getStateList(fieldName: string) {

      // this.ngxUILoaderService.start(); // Start loader before API call
    
      this.lwfSlabService.getStateList(fieldName).subscribe({
          next: (res) => {


              if (res.isSuccess && res.data) {
                res.data = res.data.slice(1);
                  this.StateList = res.data.map((fk_stateid: any) => ({
                    name: fk_stateid.name,
                      value: fk_stateid.value
                  }));
              } else {
                  this.toastrService.error("Failed to load HOD list.");
              }
              // Stop loader after response
    
          },
          error: (err) => {
              console.error("Error fetching HOD list:", err);
              this.toastrService.error("Error fetching level list.");
              
          }
      });
    }

    // formatDate(dateStr: string): string {
    //   if (dateStr) {
    //     const [day, month, year] = dateStr.split('/');
    //     return `01-${month}-${year}`;
    //   }
    //   return '';
    // }

    formatDate(dateStr: string): string {
      if (dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`; // Format to YYYY-MM-DD
      }
      return '';
    }
    

    getLwfByid(pk_slabid: number) {

      this.lwfSlabService.getLwfSlabById(pk_slabid).subscribe({
        next: (res) => {
          if (res.isSuccess && res.data) {
            const formattedDate = formatDateForInput(res.data.mmyyyy);
            var stateIdStr = res.data.fk_stateid + "";
          this.lwdSlabForm.patchValue({
            pk_slabid:res.data.pk_slabid, 
            fk_stateid: stateIdStr,
          effecttype: res.data.effecttype,
          effectivefrom: formattedDate,  // Properly formatted date
          sno: res.data.sno,
          amt: res.data.amt,
          emrmultiple: res.data.emrmultiple,
          SlabPercent:res.data.slabPercent,
          });
          this.Isedit = true;
          } else {
            this.toastrService.error("Failed to load LWF details.");
          }
        },
        error: () => {
          this.toastrService.error("Error loading LWF data.");
        }
      });
    }





    submitForm(): void {
      if (this.lwdSlabForm.invalid) {
       // this.toastrService.error('Please fill all required fields.');
        this.showError = true;
        return;
      }
      // const pkSlabId = Number.parseInt(this.lwdSlabForm.value.pk_slabid);

      const formData = {
        ...this.lwdSlabForm.value,
        pk_slabid: Number(this.lwdSlabForm.value.pk_slabid), 
        companyId: sessionStorage.getItem('companyId'),
        locId: sessionStorage.getItem('locationID'),
        userId: sessionStorage.getItem('fk_UserID'),
        fk_cityid:Number.parseInt(this.lwdSlabForm.value.fk_stateid),
      };
  
      //  **Check if designationId exists (Update) or not (Insert)**
      if (this.slabid) {
        console.log(typeof this.slabid )
        // **UPDATE existing designation**
        const updateData = { ...formData,pk_slabid: Number(this.slabid)};
  
        this.lwfSlabService.update_LwfSalb(updateData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'LWF updated successfully!');
              this.router.navigate(['/dash/user/userdashboard/Lwf_Slab_Master_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to update LWF.');
            }
          },
          error: (err) => {
            console.error('Update API Error:', err);
            this.toastrService.error('Something went wrong while updating!');
          }
        });
  
      } else {
      
        this.lwfSlabService.add_LwfSalb(formData).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.toastrService.success(res.message || 'Designation added successfully!');
              this.router.navigate(['/dash/user/userdashboard/Lwf_Slab_Master_list']);
            } else {
              this.toastrService.error(res.message || 'Failed to add LWF.');
            }
          },
          error: (err) => {
            console.error('Insert API Error:', err);
            this.toastrService.error('Something went wrong while adding!');
          }
        });
      }
  }
  

}

