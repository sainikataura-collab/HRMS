import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CompanyConfig {
  // Mandatory fields
  lifeinsuranceMandatory: boolean;
  lifeinsuranceVerification: boolean;
  lifeinsuranceVisible: boolean;
  panMandatory: boolean;
  aadhaarMandatory: boolean;
  basicInfoMandatory: boolean;
  qualificationMandatory: boolean;
  experienceMandatory: boolean;
  familyMandatory: boolean;
  voterMandatory: boolean;
  bankAccountMandatory: boolean;
  drivingLicenceMandatory: boolean;
  vehicleInsuranceMandatory: boolean;
  vehicleRCMandatory: boolean;
  vendorGstMandatory: boolean;
  signatureMandatory: boolean;
  photographMandatory: boolean;
  eshramMandatory: boolean;
  ayushmanMandatory: boolean;
  photographLivecapture: boolean;
  
  // Verification fields
  panVerification: boolean;
  aadhaarVerification: boolean;
  voterVerification: boolean;
  bankAccountVerification: boolean;
  eshramVerification: boolean;
  ayushmanVerification: boolean;
  
  // Visibility fields (NEW)
  panVisible: boolean;
  aadhaarVisible: boolean;
  basicInfoVisible: boolean;
  qualificationVisible: boolean;
  experienceVisible: boolean;
  familyVisible: boolean;
  voterVisible: boolean;
  bankAccountVisible: boolean;
  drivingLicenceVisible: boolean;
  vehicleInsuranceVisible: boolean;
  vehicleRCVisible: boolean;
  vendorGstVisible: boolean;
  signatureVisible: boolean;
  photographVisible: boolean;
  eshramVisible: boolean;
  ayushmanVisible: boolean;

  // OCR fields
  panOcr?: boolean;
  aadhaarOcr?: boolean;
  voterOcr?: boolean;
  is_stamp?: string;
  companyLogo?: string;
  companyName?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CompanyConfigService {
  private configSubject = new BehaviorSubject<CompanyConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  constructor() {}

  setConfig(config: CompanyConfig): void {
    this.configSubject.next(config);
  }

  getConfig(): CompanyConfig | null {
    return this.configSubject.value;
  }

  // Default config if API fails
  getDefaultConfig(): CompanyConfig {
     return {
      lifeinsuranceMandatory: false,
  lifeinsuranceVerification: false,
  lifeinsuranceVisible: false,
      // Mandatory
      panMandatory: false,
      aadhaarMandatory: false,
      basicInfoMandatory: false,
      qualificationMandatory: false,
      experienceMandatory: false,
      familyMandatory: false,
      voterMandatory: false,
      bankAccountMandatory: false,
      drivingLicenceMandatory: false,
      vehicleInsuranceMandatory: false,
      vehicleRCMandatory: false,
      vendorGstMandatory: false,
      signatureMandatory: false,
      photographMandatory: false,
      eshramMandatory: false,
      ayushmanMandatory: false,
      
      // Verification
      panVerification: false,
      aadhaarVerification: false,
      voterVerification: false,
      bankAccountVerification: false,
      eshramVerification: false,
      ayushmanVerification: false,
      
      // Visibility (NEW)
      panVisible: true,
      aadhaarVisible: true,
      basicInfoVisible: true,
      qualificationVisible: true,
      experienceVisible: true,
      familyVisible: true,
      voterVisible: false,
      bankAccountVisible: false,
      drivingLicenceVisible: false,
      vehicleInsuranceVisible: false,
      vehicleRCVisible: false,
      vendorGstVisible: false,
      signatureVisible: false,
      photographVisible: false,
      eshramVisible: false,
      ayushmanVisible: false,
      photographLivecapture:false
    };
  }

  // Check if any section is mandatory
  isAnySectionMandatory(): boolean {
    const config = this.getConfig();
    if (!config) return false;
    
    return  config.lifeinsuranceMandatory ||
     config.panMandatory ||
           config.aadhaarMandatory ||
           config.basicInfoMandatory ||
           config.qualificationMandatory ||
           config.experienceMandatory ||
           config.familyMandatory ||
           config.voterMandatory ||
           config.bankAccountMandatory ||
           config.drivingLicenceMandatory ||
           config.vendorGstMandatory ||
           config.signatureMandatory ||
           config.photographMandatory ||
           config.eshramMandatory ||
           config.ayushmanMandatory;
  }
}