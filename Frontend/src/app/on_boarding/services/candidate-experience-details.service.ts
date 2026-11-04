// candidate-experience-details.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateExperienceDetailService {
  private apiUrl = `${environment.baseURL1}/CandidateExperienceDetails`;


  constructor(private http: HttpClient) {}

   Save_LifeInsurance(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/LifeInsurance`;
    return this.http.post(url, formData, { headers: this.getHeaders() });
  }

  Get_LifeInsurance_ById(): Observable<any> {
    const url = `${this.apiUrl}/GetLifeInsuranceById`;
    return this.http.get(url, { headers: this.getHeaders() });
  }


  scanPanCardWithOcr(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.baseURL1}/ocr/scan-pan`;
    return this.http.post<any>(url, formData);
  }

  scanAadhaarCardWithOcr(file: File, side: string = 'front', expectedAadhaarNo?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('side', side);
    if (expectedAadhaarNo) {
      formData.append('expectedAadhaarNo', expectedAadhaarNo);
    }
    const url = `${environment.baseURL1}/ocr/scan-aadhaar`;
    return this.http.post<any>(url, formData);
  }

  scanVoterCardWithOcr(file: File, side: string = 'front'): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('side', side);
    const url = `${environment.baseURL1}/ocr/scan-voter`;
    return this.http.post<any>(url, formData);
  }

  // NO DECRYPTION - Use URL-safe key directly
  private getHeaders(): HttpHeaders {
    const candidateKey = sessionStorage.getItem('candidateKey') || '';
    
    return new HttpHeaders({
      'X-Candidate-Key': candidateKey
    });
  }

  getCandidateExperienceList(pageIndex: number, pageSize: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      { headers: this.getHeaders() }
    );
  }

  getCandidateExperienceById(pk_cpjobid: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pk_cpjobid}`, { headers: this.getHeaders() });
  }

  add_CandidateExperienceDetails(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  update_CandidateExperienceDetails(formData: FormData): Observable<any> {
    return this.http.put(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  delete_CandidateExperience(pk_cpjobid: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${pk_cpjobid}`, { headers: this.getHeaders() });
  }


  Verify_Aadhaar(AadhaarNo: string) {
    const data = { AadhaarNo };
    const view_url = `${this.apiUrl}${environment.Setting.verifyAadhaarGENoTP}`;
    return this.http.post<any>(view_url, data, { headers: this.getHeaders() }).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  Verify_Aadhaar_Submit_OTP(data: { client_id: string; otp: string }) {
    const view_url = `${this.apiUrl}${environment.Setting.verifyAadhaarSubOTP}`;
    return this.http.post<any>(view_url, data, { headers: this.getHeaders() }).pipe(
      map((response: any) => response)
    );
  }

  Get_Aadhaar_ById(id: any) {
    const url = `${this.apiUrl}${environment.Setting.getAadhaarById}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
  }

  Get_Pan_ById(id: any) {
    const url = `${this.apiUrl}${environment.Setting.getPanById}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
  }

  // PAN NO verification method
  Verify_PAN(panNo: string, userId: string) {
    const data = { panNo, userId };
    const view_url = `${this.apiUrl}${environment.Setting.verifyPAN}`;
    return this.http.post<any>(view_url, data, { headers: this.getHeaders() }).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  verifypan(data: any) {
    const view_url = `${this.apiUrl}${environment.Setting.verifypAN}`;
    return this.http.post<any>(view_url, data, { headers: this.getHeaders() }).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  Save_BasicInfo(data: any) {
    const view_url = `${this.apiUrl}${environment.Setting.InsertBasicInfo}`;
    return this.http.post<any>(view_url, data, { headers: this.getHeaders() }).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }

  Get_BasicInfo() {
    const url = `${this.apiUrl}${environment.Setting.BasicInfoById}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
  }  


   // API call to fetch levels dynamically
    getStateList(fieldName: string): Observable<any> {
      const view_url = `${this.apiUrl}${environment.Setting.DropdownList}/${fieldName}`;
      return this.http.get(view_url,{ headers: this.getHeaders() });
    }


  
  getcityByStateId(StateId: string): Observable<any> {
    const view_url = `${this.apiUrl}${environment.Setting.CityDropdownListByStateId}/${StateId}`;
    return this.http.get<any>(view_url,{headers:this.getHeaders()});
  }


    verifyaadhaar(data: any) {

    const view_url = `${this.apiUrl}${environment.Setting.verifyAadhaar}`;
    return this.http.post<any>(view_url, data,{headers:this.getHeaders()}).pipe(
      map((kyc: any) => {
        return kyc;
      })
    );
  }


    getImageOnboard(imageName: string): Observable<Blob> {
           const view_url = `${this.apiUrl}${environment.Setting.User_image }/${imageName}`;
            return this.http.get(view_url, { responseType: 'blob',headers:this.getHeaders() },);
    }

     getMandatoryDetails(): Observable<any> {
    const view_url = `${this.apiUrl}/get-mandatory-settings`;
    return this.http.get<any>(view_url,{headers:this.getHeaders()});
  }


  
getCandidateFamilyList(pageIndex: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}${environment.Setting.GetAllFamily}?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getCandidateFamilyById(pk_familyid: number): Observable<any> {
    const url = `${this.apiUrl}${environment.Setting.GetByIdFamily}/${pk_familyid}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  add_CandidateFamilyDetails(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}${environment.Setting.AddFamily}`;
    return this.http.post(url, formData, { headers: this.getHeaders() });
  }

  update_CandidateFamilyDetails(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}${environment.Setting.UpdateFamily}`;
    return this.http.put(url, formData, { headers: this.getHeaders() });
  }

  delete_CandidateFamily(pk_familyid: number): Observable<any> {
    const url = `${this.apiUrl}${environment.Setting.DeleteFamily}${pk_familyid}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }

  verifyBank(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifyBank}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_Bank_ById(id: any) {
  const url = `${this.apiUrl}${environment.Setting.getBankById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

verifyVoter(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifyVoter}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_Voter_ById(id: any) {
  const url = `${this.apiUrl}${environment.Setting.getVoterById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

//added code 7Sept 2026 starts
verifyDrivingLicence(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifyDrivingLicence}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_DrivingLicence_ById() {
  const url = `${this.apiUrl}${environment.Setting.getDrivingLicenceById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

verifyVendorGST(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifyVendorGST}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_VendorGST_ById() {
  const url = `${this.apiUrl}${environment.Setting.getVendorGSTById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

verifySignature(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifySignature}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_Signature_ById() {
  const url = `${this.apiUrl}${environment.Setting.getSignatureById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

verifyPhotograph(formData: FormData) {
  const view_url = `${this.apiUrl}${environment.Setting.verifyPhotograph}`;
  return this.http.post<any>(view_url, formData, { headers: this.getHeaders() }).pipe(
    map((response: any) => response)
  );
}

Get_Photograph_ById() {
  const url = `${this.apiUrl}${environment.Setting.getPhotographById}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}

Get_VendorAgreementDetails() {
  const url = `${this.apiUrl}${environment.Setting.getVendorAgreementDetails}`;
  return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(map((res) => res));
}


  // Eshram API
  Save_Eshram(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/Eshram`;
    return this.http.post(url, formData, { headers: this.getHeaders() });
  }

  Get_Eshram_ById(): Observable<any> {
    const url = `${this.apiUrl}/GetEshramById`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Ayushman API
  Save_Ayushman(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/Ayushman`;
    return this.http.post(url, formData, { headers: this.getHeaders() });
  }

  Get_Ayushman_ById(): Observable<any> {
    const url = `${this.apiUrl}/GetAyushmanById`;
    return this.http.get(url, { headers: this.getHeaders() });
  }


CheckDuplicate(
  fieldName: string,
  fieldValue: string,
  generalId?: string
): Observable<any> {

  const url =
    `${this.apiUrl}${environment.Setting.checkduplicat}/${encodeURIComponent(fieldName)}` +
    `?fieldNameQuery=${encodeURIComponent(fieldName)}` +
    `&fieldValue=${encodeURIComponent(fieldValue)}` +
    (generalId ? `&generalId=${encodeURIComponent(generalId)}` : '');

  return this.http.get<any>(url, {
    headers: this.getHeaders()
  }).pipe(
    map((res) => res)
  );
}

//added code 7Sept 2026 ENDS
}