export interface kyc{

        userId: string;                
        userTypeId: number;           
        aadhaarNo: string;          
        aadhaarName: string;           
        aadhaarAddress: string;        
        aadhaarDob:  Date;          
        panNo: string;               
        panName: string;           
        panDob: Date;          
        gstNo: string;              
        gstCompanyName: string;        
        gstCompanyRegisteredDate: Date; 
      
}
export interface statList{
        message(message: any): unknown;
        isSuccess: any;
        documentNo:string,
        data:[];
        name:string;
        value:string;
        label:string;
    
    }
    export interface StateFilter{
        documentNo:string,
        data:object;
        name:string;
        value:string;
        label:string;
    
    }
    interface UserProfile {
  customerName: string;
  emailId: string;
  mobileNo: string;
  userType: string;
  customerCode: string;
  aadhaarNo?: string;
  aadhaarDob?: string;
  aadhaarName?: string;
  aadhaarAddress?: string;
  aadhaarBackImage?: string;
  aadhaarFrontImage?: string;
  panNo?: string;
  panDob?: string;
  panName?: string;
  panCardImage?: string;
  pincode?: string;
  cityName?: string;
  stateName?: string;
  permanentAddress?: string;
  address1?: string;
  aadhaarVerified?: string;
  panVerified?: string;
  kycVerified?: string;
}
