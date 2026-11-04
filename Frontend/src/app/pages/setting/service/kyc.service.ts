import { HttpClient } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { map, Observable } from "rxjs";
import { statList } from "../interface/kyc";

@Injectable({
  providedIn: 'root'
})
export class KycService {
  constructor(private http: HttpClient, private router: Router, public ngZone: NgZone) {

  }
  // // Aadhaar verification method
  // Verify_Aadhaar(aadhaarNo: string): Observable<any> {
  //   const apiUrl = `${environment.baseURL}${environment.Setting.verifyAadhaarGENoTP}`;
  //   return this.http.post<any>(apiUrl, aadhaarNo);
  // }

  // Verify_Aadhaar(AadhaarNo: string) {

  //   const data = {AadhaarNo};
  //   const view_url = `${environment.baseURL}${environment.Setting.verifyAadhaarGENoTP}`;
  //   return this.http.post<any>(view_url, data).pipe(
  //     map((kyc: any) => {
  //       return kyc;
  //     })
  //   );
  // }
  // Verify_Aadhaar_Submit_OTP(data: { client_id: string; otp: string }) {
  //   const view_url = `${environment.baseURL}${environment.Setting.verifyAadhaarSubOTP}`;
  //   return this.http.post<any>(view_url, data).pipe(
  //     map((response: any) => response) // Directly return the response
  //   );
  // }
  // Verify_Aadhaar(aadhaarNo: string, userId: string) {
  //   const data = { aadhaarNo, userId };
  //   const view_url = `${environment.baseURL}${environment.Setting.verifyAadhaar}`;
  //   return this.http.post<any>(view_url, data).pipe(
  //     map((kyc: any) => {
  //       return kyc;
  //     })
  //   );
  // }

  // Verify_Aadhaar_Submit_OTP(data: { client_id: string; otp: string }) {
  //   const view_url = `${environment.baseURL}${environment.Setting.verifyAadhaarSubOTP}`;
  //   return this.http.post<any>(view_url, data).pipe(
  //     map((response: any) => response) // Directly return the response
  //   );
  // }


  


  // Gst NO verification method
  Verify_GST(gstNo: string, userId: string) {
    const data = { gstNo, userId };
    const view_url = `${environment.baseURL}${environment.Setting.verifyGST}`;
    return this.http.post<any>(view_url, data).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  // KYC submission method
  Kyc(data: any) {

    const view_url = `${environment.baseURL}${environment.Setting.kyc}`;
    return this.http.post<any>(view_url, data).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  getStates() {
    const view_url = `${environment.baseURL}${environment.Setting.Statelist}`;

    this.http.get<any>(view_url).subscribe(res => {
      // console.log("inide",res)
    })
    return this.http.get<statList>(view_url);  // Returning any type
  }
  getcitylistbystateid(value: string): Observable<any> {
    const view_url = `${environment.baseURL}${environment.Setting.citylistbystateid}/${value}`;
    return this.http.get<any>(view_url);  // Returning any type
  }

  get_details(): Observable<any> {
    const view_url = `${environment.baseURL}${environment.Setting.Detail_Kyc}`;
    return this.http.get<any>(view_url); // Send the GET request with orderId as part of the URL
  }


  getImage(imageName: string): Observable<Blob> {
    const view_url = `${environment.baseURL}${environment.Setting.user_image}/${imageName}`;
    return this.http.get(view_url, { responseType: 'blob' });
  }
  getKycVerif(): Observable<any> {
    const view_url = `${environment.baseURL}${environment.Setting.Is_kyc_verified}`;
    return this.http.get<any>(view_url);
  }

  verifyaadhaar(data: any) {

    const view_url = `${environment.baseURL}${environment.Setting.verifyAadhaar}`;
    return this.http.post<any>(view_url, data).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }



}
