import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink ,Router, ActivatedRoute} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExternalMemberService } from '../RecruitServices/external-member.service';
import { EncryptionService } from '../../../../shared/services/encryption.service';

@Component({
  selector: 'app-external-member',
  standalone: true,
  imports: [RouterLink,CommonModule,ReactiveFormsModule],
  templateUrl: './external-member.component.html',
  styleUrl: './external-member.component.scss'
})
export class ExternalMemberComponent {
externalMemberDetails!:FormGroup;
isedit=false;
submitted=false;
showerror=false;
id!:number;
Pk_ExMemberId:string='';
constructor(private fb:FormBuilder,private toastrservice:ToastrService,private router:Router,private service:ExternalMemberService,public encryption:EncryptionService,private route: ActivatedRoute){}
ngOnInit():void{
this.externalMemberDetails=this.fb.group({
  member_name:['',[Validators.required]],
  department:['',[Validators.required]],
  designation:['',[Validators.required]],
  address:[''],
  phone:[''],
  mobile:[''],
  email:[''],
  remarks:['']
})

this.Pk_ExMemberId = this.encryption.decryptText(this.route.snapshot.params['pk_exMemberId']);
   if (this.Pk_ExMemberId) {
   this.patchform(this.Pk_ExMemberId);
   this.isedit = true; 
   }
}
onSubmit()
{
 
  if(this.externalMemberDetails.invalid)
  {
     this.showerror=true;
     return;
  }
    const data={
      ...this.externalMemberDetails.value
    };

    if(this.isedit)
    {
      const updateData = { ...data, Pk_ExMemberId: this.Pk_ExMemberId};
  
      this.service.update_externalMember(updateData).subscribe({
        next:(result)=>{
           if(result.isSuccess)
            {
              this.toastrservice.success(result.message || 'detail updated successfully!');
              this.router.navigate(['/dash/recruitment/recruitmentdashboard/externalMember_list'])
            }  
            else
            {
               this.toastrservice.error(result.message || 'Failed to update detail  ');
            }           
          },
          error: () => {
            // Error handling in case of a failure during form submission
            this.toastrservice.error('An error occurred during form submission');
          }

      })
    }

    else{
          this.service.add_externalMember(data).subscribe({
          next:(result)=>{
             if(result.isSuccess)
             {
               this.toastrservice.success(result.message || 'detail added successfully!');  
               this.router.navigate(['/dash/recruitment/recruitmentdashboard/externalMember_list']);
             }
             else{
                this.toastrservice.error(result.message || 'Failed to add detail  ');
             }
        },
          error:()=>{
             this.toastrservice.error('An error occured during form submission');

          }


          })

    }

}

patchform(Pk_ExMemberId: string): void {
  this.service.get_externalMemberByid(Pk_ExMemberId).subscribe({
    next: (res) => {
      if (res && res.data) {
        this.externalMemberDetails.patchValue(res.data);
      } else {
        this.toastrservice.error('No data found for the selected member.');
      }
    },
    error: () => {
      this.toastrservice.error('Error fetching member details.');
    }
  });
}


validateNumber(event: KeyboardEvent) {
  const charCode = event.key.charCodeAt(0);
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // Block non-numeric characters
  }
}
onReset():void
{
this.externalMemberDetails.reset();
}

}
