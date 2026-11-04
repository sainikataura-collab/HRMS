import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../authentication/service/auth.service';
import { ToastrService } from 'ngx-toastr';

import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-emailverification',
  standalone: true,
  imports: [],
  templateUrl: './emailverification.component.html',
  styleUrl: './emailverification.component.scss'
})
export class EmailverificationComponent {
  ngxUILoaderService = inject(NgxUiLoaderService);
  constructor(private toastrService: ToastrService, private router:Router ,public authservice: AuthService, private route : ActivatedRoute){
    
  }
  token : string ="";
  registrationId : string="";
  message : string="";
  ngOnInit() {
    this.ngxUILoaderService.start();

    this.token=this.route.snapshot.queryParams['token'];
    this.registrationId=this.route.snapshot.queryParams['registrationId'];
    this.authservice.emailverification(this.token, this.registrationId).subscribe({
      next: (res) => {
       
        if (res.isSuccess) {
          //this.toastrService.success(res.message);
          alert(res.documentNo)
          sessionStorage.setItem('registerId', this.registrationId);
          this.router.navigate(['/auth/otp', 'register']);
          //this.toastrService.error('OTP',res.documentNo);
        } else {
          this.message = res.message;
          
         // this.toastrService.error(res.message);
         
        }
      },
      error: (err) => {
        // console.error('Error occurred: ', err);
        this.toastrService.error('An error occurred while processing your request. Please try again.');
      }
    });
    this.ngxUILoaderService.stop(); 
  }
}

