export interface Idepartment {

    id:number;
    srNo: number;
    department: string;
    
    active: boolean;
}
export interface Idesignation{

    id: number;
    srNo: number;
    designation: string;
    seniorityLevel: string;
    level: string;
    qualification: string;
    remark: string;
    active: boolean;
}

// leave-type.model.ts
export interface ILeaveType {
    LeaveNatureType: string;
    description: string;
    EmpNature: string;
    shortDescription: string;
    interestCalculate: boolean;
    Cashable: boolean;
    CarryForward: boolean;
    Maxcashable: number;
    CarryforweredLeaveLimit: number;
    formula: string;
    totalLeaveLimit: number;
    Amount: number;
    LeaveLimitPerInstance: number;
    MaxLeaveHold: number;
    FixedTimesIssue: number;
    NegativeBA: boolean;
    TotalTimesIssue: number;
    PfDeduction: boolean;
    displayOrder: number;
    LeaveBasedOn: string;
    NationalHoliday: boolean;
    MinBalanceholdtoencash: number;
    LeaveTypeP: string;
    IsConvertibleToOtherLeave: boolean;
    CalculateOnEarned: boolean;
  }

  export interface IRestrictedHoliday {
    year: number;
    holidayName: string;
    dated: string;
    isNationalHoliday: boolean;
    locations: string[];
  }
  
