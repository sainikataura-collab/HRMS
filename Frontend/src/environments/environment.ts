// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: true,

  baseURL1: 'http://localhost:5128/api/v1',
  baseURL: 'http://localhost:5128/api/v1',
  chatHub: 'http://localhost:5128/ChatHub',

  // baseURL: 'https://hrmsapi.empowerlogics.com/api/v1',
  // baseURL1: 'https://hrmsapi.empowerlogics.com/api/v1',
  // chatHub: 'https://hrmsapi.empowerlogics.com/ChatHub',

  encryptionSecretKey:
    'GC0GA3qAWuTspOkM4IdG1WtK1EO+SZNaqw+b+iEqu8OF1p6w3TcrQwcByE2G/0v+',

  CommonSearch: {
    DropdownList: '/General/dropdownList',
    LocationDropdownList: '/General/ddl/locations',
    // LocationDropdownList              :'/General/dropdownList/Location',
    Emp_DropdownList: '/General/Emp_dropdownList',
  },

  ReportBuilder: '/ReportBuilder',
  chatAPI: '/HRchat',

  Authentication: {
    getUserLocations: '/PageRights/GetUserLocations',
    getallMenubasedonUser: '/PageRights/GetUserFullMenu',
    ModuleList: '/General/ModuleList',
    get_Webpage: '/PageRights',
    add_pageRight: '/PageRights',
    GetUserAccessRights: '/PageRights/GetUserAccessRights',

    validateCompanyCode: '/User/validateCompanyCode',
    GetLocationByOfficeType: '/User/GetLocationByOfficeType',
    HrmsLogin: '/User/login',
    verify_otp: '/User/verify-otp',

    login: '/User/login/customer',
    verify_otp_login: '/User/login/customer/verify-otp',
    register: '/User/register/customer',
    verify_otp_register: '/User/register/customer/verify-otp',
    resend_otp: '/User/resend-otp',
    logout: '/User/logout',
    forgot_Password: '/User/customer/forgot-password',
    reset_password_token: '/User/customer/reset-password-token',
    emailverification: '/User/verify-email',
    refresh_token: '/User/token/refresh',
    HRChatNotification: '/HRchat'
  },
  Setting: {
    reset_password: '/User/reset-password',
    verify_old_password: '/User/verify-old-password',

    user_profile: '/User/customer/Profile',
    Is_kyc_verified: '/User/customer/is-kyc-verified',
    Statelist: '/Order/getStateList',
    citylistbystateid: '/Order/getCityListByState',
    Detail_Kyc: '/User/customer/kyc',


    // verifyAadhaarGENoTP: '/User/customer/verify-aadhaar/generate-otp',
    // verifyAadhaarSubOTP: '/User/customer/verify-aadhaar/submit-otp',
    // verifyAadhaar: '/User/customer/verify-aadhaar',

    verifyAadhaarGENoTP: '/verify-aadhaar/generate-otp',
    verifyAadhaarSubOTP: '/verify-aadhaar/submit-otp',
    verifyAadhaar: '/verify-aadhaar/Aadhaar',
    getAadhaarById: '/GetAadhaarById',

    verifyPAN: '/verify-pan',
    getPanById: '/GetPanById',
    verifypAN: '/verify-pan/PAN',


    verifyBank: '/verify-bank/Bank',
    getBankById: '/GetBankById',
    verifyVoter: '/verify-voter/Voter',
    getVoterById: '/GetVoterById',



    InsertBasicInfo: '/BasicInfo',
    BasicInfoById: '/BasicInfoById',
    CityDropdownListByStateId: '/CityDropdownList',
    DropdownList: '/dropdownList',
    User_image: '/images',


    GetByIdFamily: '/GetByIdFamily',
    AddFamily: '/AddFamily',
    UpdateFamily: '/updateFamily',
    DeleteFamily: '/deleteFamily',
    GetAllFamily: '/FamilyGetall',
    getCandidatefinalsummary: '/UserMaster/final-summary',
    getOnboardingMandatoryDetails: '/UserMaster/get-onboarding-mandatory',

    GetOnboardingCandidatelist: '/UserMaster/GetOnBoardingCandidates',
    getOnboardingDashboard: '/UserMaster/GetOnBoardingDashboardData',
    documentfile: '/UserMaster/documents',

    verifyGST: '/UserMaster/customer/verify-gst',
    kyc: '/User/customer/kyc',
    user_image: '/User/customer/images',

    //ADDED CODE 7SEPT 2026 starts    
    verifyDrivingLicence: '/verify-driving-licence/DrivingLicence',
    getDrivingLicenceById: '/GetDrivingLicenceById',
    verifyVendorGST: '/verify-vendor-gst/VendorGST',
    getVendorGSTById: '/GetVendorGSTById',
    verifySignature: '/verify-signature/Signature',
    getSignatureById: '/GetSignatureById',
    verifyPhotograph: '/verify-photograph/Photograph',
    getPhotographById: '/GetPhotographById',
    getVendorAgreementDetails: '/GetVendorAgreementDetails',
    checkduplicat: '/checkduplicat',
    //ADDED CODE 7Sept 2026 ends
  },

  payroll: {
    PreviewSalaryHeadComparison: '/ImportExcle/PreviewSalaryHeadComparison',
    PreviewSalaryOtherHeadComparison: '/ImportExcle/PreviewSalaryOtherHeadComparison',
    LocationbyZoneList: '/City/locationbyZoneList',
    DownloadSalarySlipPdf: '/ExportReport/DownloadSalarySlipPdf',

    IsLMVendorExpense: '/CompanyConfig/IsLMVendorExpense',
    // Shift Roster
    ShiftRoster_GetAll: '/ShiftRoster/GetAll',
    ShiftRoster_GetById: '/ShiftRoster/GetById',
    ShiftRoster_Insert: '/ShiftRoster/Insert',
    ShiftRoster_Update: '/ShiftRoster/Update',
    ShiftRoster_Delete: '/ShiftRoster/Delete',
    ShiftRoster_BulkInsert: '/ShiftRoster/BulkInsert',
    ShiftRoster_GetEmployees: '/ShiftRoster/GetEmployees',
    ShiftRoster_GetShifts: '/ShiftRoster/GetShifts',
    Get_tabAuditLogs: '/EmployeeMst/GetTabAuditLogs',

    UploadClientLogo: '/ClientMaster/UploadClientLogo',

    SaveDailyAttendance: '/DailyAttendance/SaveAttendance',
    GetDailyAttendance: '/DailyAttendance/GetAttendance',
    View_bill: '/ExportReport/ViewBillFormAsync',
    downloadViewBillReportlist: '/ExportReport/downloadViewBillReportlist',
    updateattendance: '/city/updateattendance',
    CTCConfig_insert: '/CTCConfig',
    CTCConfig_getall: '/CTCConfig',
    CTCConfig_getbyId: '/CTCConfig',
    CTCConfig_update: '/CTCConfig',
    CTCConfig_delete: '/CTCConfig',
    CTCConfig_heads: '/CTCConfig/heads',
    GenerateESIChallan: '/ExportReport/GenerateESIChallan',
    ExportImportIncentive: '/ImportExcle/ExportImportIncentive',
    ExportincentiveHead: '/ImportExcle/exportincentive',
    ImportincentiveHead: '/ImportExcle/ImportIncentiveHead',

    GetIncentiveProcessList: '/EmployeeRentDetail/autoIncentiveProcess',
    PostIncentiveProcess: '/EmployeeRentDetail/InsertautoIncentiveProcess',
    deleteIncentiveProcess: '/EmployeeRentDetail/deleteIncentiveProcess',

    downloadViewSalaryReportlistfor1: '/ExportReport/downloadViewSalaryReportlistforexporttype1',


    fnflist: '/FNF/getfnflist',

    Employee_GetAll_Ddlfor100: '/Employee/GetEmployeesForDropdownfor50',

    GetLTAProcessList: '/EmployeeRentDetail/autoLTAProcess',
    PostLTAProcess: '/EmployeeRentDetail/InsertautoLTAProcess',
    deleteLTAProcess: '/EmployeeRentDetail/deleteLTAProcess',

    CitybyStateList: '/City/CitybyStateList',
    User_image: '/CompanyConfig/images',

    reimb_heads: '/Level/reimb-heads',
    //Added New BY Raj 06May2026
    add_clientmaster: '/ClientMaster',
    get_All_clientmaster: '/ClientMaster/GetAll',
    getById_clientmaster: '/ClientMaster',
    update_clientmaster: '/ClientMaster',
    delete_clientmaster: '/ClientMaster',
    GetListBasedOnCodeType: '/General/GetListBasedOnCodeType',
    generalPost: '/General',
    GeneralUpdate: '/General',
    general: '/General',
    GetDdlListBasedOnCodeType: '/General/GetDdlListBasedOnCodeType',
    GetDdlList: '/General/GetDdlList',
    IsValueAvailableInLSPGeneral: '/General/IsValueAvailableInLSPGeneral',



    ImportCityMaster: '/ImportExcle/ImportCityMaster',
    ImportDesignationMaster: '/ImportExcle/ImportDesignationMaster',
    ImportDepartmentMaster: '/ImportExcle/ImportDepartmentMaster',
    ImportLocationMaster: '/ImportExcle/ImportLocationMaster',
    ImportClientMaster: '/ImportExcle/ImportClientMaster',
    ImportOutletMaster: '/ImportExcle/ImportOutletMaster',
    ImportBranchMaster: '/ImportExcle/ImportBranchMaster',



    GetleaveDashboard: '/LeaveDash/GetleaveDashboard',
    Taskboxdash: '/LeaveDash/GetTaskboxDashboard',
    GetEmpmanagementDashboard: '/LeaveDash/GetEmpmanagementDashboard',
    Attendancedash: '/LeaveDash/GetAttendanceDashboard',
    GetCDOList: '/ImportExcle/GetCDOList',
    ImportCDOExcel: '/ImportExcle/ImportCDO',
    ViewEmployeeReportlist: '/ExportReport/ViewEmployeeReportlist',
    downloadViewEmployeeReportlist: '/ExportReport/downloadViewEmployeeReportlist',

    downloadForm12Reportlist: '/ExportReport/downloadForm12Reportlist',

    GenerateGratuityPdf: '/ExportReport/GenerateGratuityStatementPdf',
    DownloadOverTimePdf: '/ExportReport/GenerateOvertimePdf',

    GenerateBonusRegisterPdf: '/ExportReport/GenerateBonusRegisterPdf',

    //ANJALI 
    DownloadMusterRollPdf: '/ExportReport/DownloadMusterRollPdf',
    DownloadFORMDPdf: '/ExportReport/DownloadFORMDPdf',
    Userdash: '/LeaveDash/GetUserDashboard',
    GetHRDashboard: '/LeaveDash/GetHRDashboard',
    getApprovedList: '/Emp_LeaveRequest/GetApprovedLeaves',
    LeaveReject: '/Emp_LeaveRequest/rejectlApprovedleave',
    ApproveOrRejectShortLeave: '/Emp_LeaveRequest/ApproveOrRejectShortLeave',
    ApproveOrRejectAttendance: '/Emp_LeaveRequest/ApproveOrRejectAttendance',
    approveOrRejectCompOff: '/CompOffRequest/ApproveOrRejectCompOff',
    GetCompoffPendingLeave: '/Emp_LeaveRequest/ApproveComOff',
    GetShortLeavePendingLeave: '/Emp_LeaveRequest/ApprovalshortLeave',

    GetAllAdminApprovalList: '/Emp_LeaveRequest/GetAdminApprovalList',

    LeaveTakenuploadexcel: '/ImportExcle/LeaveTakenuploadexcel',
    ExportImportSalaryOtherHeadList: '/ImportExcle/ExportImportSalaryOtherHeadList',
    ExportImportleaveList: '/ImportExcle/ExportImportLeaveList',
    ExportsalaryOtherHead: '/ImportExcle/ExportSalaryOthertHead',
    ImportSalaryOtherHead: '/ImportExcle/ImportSalaryOtherHead',
    GetsalaryPayoutList: '/SalaryPayout/GetsalaryPayoutList',
    ProcessSalaryPayout: '/SalaryPayout/ProcessSalaryPayout',
    DownloadSalaryPayoutReport: '/ExportReport/DownloadSalaryPayoutReport',
    DownloadSalaryPayoutPdf: '/ExportReport/DownloadSalaryPayoutPdf',


    ExportImportLeave: '/ImportExcle/ExporImportLeavetAsync',
    ImportLeave: '/ImportExcle/ImportLeave',

    Get_EmpOtherDetailsImpExp: '/ImportExcle/ImportExportEmpOtherDetailList',
    Import_EmpOtherDetailsImpExp: '/ImportExcle/ImportEmpOtherDetails',

    FlexiBillApprovalList: '/FlexiBill_Approval/GetFlexiBillList',
    FlexiBillApproval_Insert: '/FlexiBill_Approval/insert',
    FlexiBillApproval_getDetails: '/FlexiBill_Approval',

    LeaveList: '/General/LeaveList',

    General_IsValueAvailable: '/General/IsValueAvailable',
    IsValueAvailable: '/General/IsValueAvailable',

    DropdownList: '/General/dropdownList',
    Employee_GetAll: '/Employee/GetAllEmployees',
    Employee_GetAll_Ddl: '/Employee/GetEmployeesForDropdown',

    Account_insert: '/Account',
    Account_getall: '/Account',
    Account_update: '/Account',
    Account_getbyId: '/Account',
    Account_delete: '/Account',

    Level_insert: '/Level',
    Level_getall: '/Level',
    Level_update: '/Level',
    Level_getbyId: '/Level',
    Level_delete: '/Level',

    Regligion_insert: '/Regligion',
    Regligion_getall: '/Regligion',
    Regligion_update: '/Regligion',
    Regligion_getbyId: '/Regligion',
    Regligion_delete: '/Regligion',

    State_insert: '/State',
    State_getall: '/State',
    State_update: '/State',
    State_getbyId: '/State',
    State_delete: '/State',

    Operational_insert: '/OperationalDivision',
    Operational_getall: '/OperationalDivision',
    Operational_update: '/OperationalDivision',
    Operational_getbyId: '/OperationalDivision',
    Operational_delete: '/OperationalDivision',

    Insert_cityCategoryMaster: '/CityCategory',
    Get_cityCategoryMaster: '/CityCategory',
    GetById_cityCategoryMaster: '/CityCategory',
    Update_cityCategoryMaster: '/CityCategory',
    Delete_cityCategoryMaster: '/CityCategory',


    Insert_CategoryMaster: '/Category',
    Get_CategoryMaster: '/Category',
    GetById_CategoryMaster: '/Category',
    Update_CategoryMaster: '/Category',
    Delete_CategoryMaster: '/Category',

    Insert_natureMaster: '/Nature',
    Get_natureMaster: '/Nature',
    GetById_natureMaster: '/Nature',
    Update_natureMaster: '/Nature',
    Delete_natureMaster: '/Nature',

    Insert_bankMaster: '/Bank',
    Get_bankMaster: '/Bank',
    GetById_bankMaster: '/Bank',
    Update_bankMaster: '/Bank',
    Delete_bankMaster: '/Bank',

    //Department
    Department: '/Department',
    gellAllDepartment: '/Department',
    deleteDepartment: '/Department',

    //Designation
    Insert_designation: '/Designation',
    gellAllDesignation: '/Designation',
    deleteDesignation: '/Designation',
    Update_designation: '/Designation',
    gellAllDesignationById: '/Designation',

    //Zone
    Insert_Zone: '/Zone',
    get_All_Zone: '/Zone',
    delete_Zone: '/Zone',
    Update_Zone: '/Zone',
    get_ZoneById: '/Zone',

    //Shift
    Insert_Shift: '/Shift',
    get_All_Shift: '/Shift',
    delete_Shift: '/Shift',
    Update_Shift: '/Shift',
    get_ShiftById: '/Shift',

    //City
    Insert_City: '/City',
    get_All_City: '/City',
    delete_City: '/City',
    Update_City: '/City',
    get_CityById: '/City',

    //LWF
    Insert_LWFSlab: '/LWFSlab',
    get_All_LWFSlab: '/LWFSlab',
    delete_LWFSlab: '/LWFSlab',
    Update_LWFSlab: '/LWFSlab',
    get_ByIdLWFSlab: '/LWFSlab',

    //WeekLyOff Insert
    WeeklyOff_insert: '/WeeklyOff',
    WeeklyOff_getall: '/WeeklyOff',
    WeeklyOff_update: '/WeeklyOff',
    WeeklyOff_getbyId: '/WeeklyOff',
    WeeklyOff_delete: '/WeeklyOff',

    //Holiday Insert

    Insert_holidayMaster: '/Holiday',
    Get_holidayMaster: '/Holiday',
    GetById_holidayMaster: '/Holiday',
    Update_holidayMaster: '/Holiday',
    Delete_holidayMaster: '/Holiday',

    InsertWorkingDayMasterAsync: '/Holiday/insert',
    WorkingDayMasterGetAll: '/Holiday/GetAll',
    GetWorkingDayMasterByIdAsync: '/Holiday/GetById',
    UpdateWorkingDayMasterAsync: '/Holiday/Update',
    DeleteWorkingDayMasterAsync: '/Holiday/Delete',

    //Grad
    Insert_Grade: '/Grade',
    get_Grade: '/Grade',
    delete_Grade: '/Grade',
    Update_Grade: '/Grade',
    get_GradeById: '/Grade',
    get_Grade_Excel: '/Grade',

    //Experience Details
    Insert_PrevJob: '/ExperienceDetails',
    gellAllPrevJob: '/ExperienceDetails',
    deletePrevJob: '/ExperienceDetails',
    Update_PrevJob: '/ExperienceDetails',
    gellAllPrevJobById: '/ExperienceDetails',

    //Qulification Details
    Insert_EmpQualif: '/QualificationDetails',
    gellAllEmpQualif: '/QualificationDetails',
    deleteEmpQualif: '/QualificationDetails',
    Update_EmpQualif: '/QualificationDetails',
    gellAll_EmpQualifbyId: '/QualificationDetails',

    //for leave Assignment
    getEmployeeDetails: '/LeaveAssignment',
    getLeaveDetails: '/LeaveAssignment',
    addleave: '/LeaveAssignment',
    get_All_leave: '/LeaveAssignment',
    getById_leave: '/LeaveAssignment/GetById',
    update_leave: '/LeaveAssignment',
    delete_leave: '/LeaveAssignment',

    //perquisite
    add_Perquisite: '/Perquisite',
    get_Perquisite: '/Perquisite',
    delete_Perquisite: '/Perquisite',
    getPerquisiteById: '/Perquisite',
    update_Perquisite: '/Perquisite',
    DownloadExcel1: '/Perquisite',

    //section

    add_section: '/Section',
    get_section: '/Section',
    delete_section: '/Section',
    getsectionById: '/Section',
    update_section: '/Section',
    DownloadExcel: '/Section',

    //City
    Insert_resHoliday: '/RestriHoliday',
    get_All_resHoliday: '/RestriHoliday',
    delete_resHoliday: '/RestriHoliday',
    Update_resHoliday: '/RestriHoliday',
    get_resHoliday: '/RestriHoliday',

    downloadExcel: '/RestriHoliday',

    //Head
    Insert_headMaster: '/Head',
    Get_headMaster: '/Head',
    GetById_headMaster: '/Head',
    Update_headMaster: '/Head',
    Delete_headMaster: '/Head',

    SubSection_insert: '/SubSection',
    SubSection_getall: '/SubSection',
    SubSection_update: '/SubSection',
    SubSection_getbyId: '/SubSection',
    SubSection_delete: '/SubSection',

    //EmpWeekLyOff Insert
    EmpWeeklyOff_insert: '/EmpWeekOff',
    EmpWeeklyOff_getall: '/EmpWeekOff',
    EmpWeeklyOff_update: '/EmpWeekOff',
    EmpWeeklyOff_getbyId: '/EmpWeekOff',
    EmpWeeklyOff_delete: '/EmpWeekOff',

    //LeaveType
    Insert_LeaveType: '/LeaveType',
    get_LeaveTypeList: '/LeaveType',
    delete_LeaveType: '/LeaveType',
    Update_LeaveType: '/LeaveType',
    get_LeaveTypeById: '/LeaveType',
    get_LeaveList_Excel: '/LeaveType',

    //Empolyee
    Get_employeeMobile: '/EmployeeMobile/GetAllEmployeeForMobile',
    Update_employeeMobile: '/EmployeeMobile',

    Get_employeeEmail: '/EmployeeEmail/GetAllEmployeeForEmail',
    Update_employeeeEmail: '/EmployeeEmail',

    Get_debitCard: '/EmployeeDebitCard/GetAllEmployeeForDebitCard',
    Update_debitCard: '/EmployeeDebitCard',

    //Tax

    Insert_professionalTaxSlab: '/ProfessionalTaxSlab',
    Get_professionalTaxSlab: '/ProfessionalTaxSlab',
    GetById_professionalTaxSlab: '/ProfessionalTaxSlab',
    Update_professionalTaxSlab: '/ProfessionalTaxSlab',
    Delete_professionalTaxSlab: '/ProfessionalTaxSlab',

    Insert_deductionSlab: '/DeductionSlab',
    Get_deductionSlab: '/DeductionSlab',
    GetById_deductionSlab: '/DeductionSlab',
    Update_deductionSlab: '/DeductionSlab',
    Delete_deductionSlab: '/DeductionSlab',

    Demographic_GetAll: '/Demographic/GetAllDemographic',
    Demographic_update: '/Demographic',
    Demographic_getbyId: '/Demographic',

    //Perquisite Assignment

    add_perquisite: '/PerquisiteAssignment',
    get_All_perquisite: '/PerquisiteAssignment',
    getById_perquisite: '/PerquisiteAssignment',
    update_perquisite: '/PerquisiteAssignment',
    delete_perquisite: '/PerquisiteAssignment',

    //for other income
    add_Income: '/EmployeeOtherIncome',
    get_All_Income: '/EmployeeOtherIncome',
    getById_Income: '/EmployeeOtherIncome',
    update_Income: '/EmployeeOtherIncome',
    delete_Income: '/EmployeeOtherIncome',

    //Reim doc status
    add_Reimdoc_Status: '/ReimDocStatus',
    get_All_docStatus: '/ReimDocStatus',
    getById_docStatus: '/ReimDocStatus',
    update_docStatus: '/ReimDocStatus',
    delete_docStatus: '/ReimDocStatus',

    //for section doc
    add_Sectiondoc: '/SectionDoc',
    get_All_Sectiondoc: '/SectionDoc',
    getById_Sectiondoc: '/SectionDoc',
    update_Sectiondoc: '/SectionDoc',
    delete_Sectiondoc: '/SectionDoc',
    GetSubSectionDropdown: '/SectionDoc/SubsectionDropdownList',

    Insert_functionalMaster: '/Functional',
    Get_functionalMaster: '/Functional',
    GetById_functionalMaster: '/Functional',
    Update_functionalMaster: '/Functional',
    Delete_functionalMaster: '/Functional',

    Insert_CostMaster: '/Cost',
    Get_CostMaster: '/Cost',
    GetById_CostMaster: '/Cost',
    Update_CostMaster: '/Cost',
    Delete_CostMaster: '/Cost',

    //for monthly rent detail
    add_Rent: '/EmployeeRentDetail',
    get_All_Rent: '/EmployeeRentDetail',
    getById_Rent: '/EmployeeRentDetail',
    update_Rent: '/EmployeeRentDetail',
    delete_Rent: '/EmployeeRentDetail',
    GetMonthDropdown: '/EmployeeRentDetail/MonthDropdownList',

    //Employee
    Insert_employee: '/EmployeeMst',
    Insert_employee_Shift: '/EmployeeMst/InsertEmployeeShift',
    Get_employee: '/EmployeeMst/GetAllEmployees',
    GetById_employee: '/EmployeeMst',
    Update_employee: '/EmployeeMst',
    Update_employee_Shift: '/EmployeeMst/UpdtEmployeeShift',
    Delete_employee: '/EmployeeMst',
    Insert_employeeHead: '/EmployeeMst/head',
    GetById_employeeAttendance: '/EmployeeMst/EmployeeAttendance',
    Update_employeeAttendance: '/EmployeeMst/EmployeeAttendance',
    GetById_employeeOtherDetails: '/EmployeeMst/EmployeeOtherDetails',
    Update_employeeOtherDetails: '/EmployeeMst/EmployeeOtherDetails',
    GetById_employeeheadDetails: '/EmployeeMst/EmployeeHeadDetails',
    Update_employeeheadDetails: '/EmployeeMst/EmployeeHeadDetails',

    //-------SubDepartment DropDown---
    get_SubDepartment_DropDown: '/EmployeeMst/SubDepartment',


    EmployeeServiceTypeMapping_GetAll: '/EmployeeServiceTypeMapping/GetAll',
    EmployeeServiceTypeMapping_GetById: '/EmployeeServiceTypeMapping',
    EmployeeServiceTypeMapping_Insert: '/EmployeeServiceTypeMapping/Insert',
    EmployeeServiceTypeMapping_Update: '/EmployeeServiceTypeMapping/Update',

    // Customer Shift Rate & Bonus
    CustomerShiftRateBonus_GetAll: '/CustomerShiftRateBonus/GetAll',
    CustomerShiftRateBonus_GetById: '/CustomerShiftRateBonus/GetById',
    CustomerShiftRateBonus_Insert: '/CustomerShiftRateBonus/Insert',
    CustomerShiftRateBonus_Update: '/CustomerShiftRateBonus/Update',
    CustomerShiftRateBonus_Delete: '/CustomerShiftRateBonus/Delete',
    CustomerShiftRateBonus_BulkInsert: '/CustomerShiftRateBonus/BulkInsert',

    //TaxDeductor

    TaxDeductor_insert: '/TaxDeductor',
    TaxDeductor_getall: '/TaxDeductor',
    TaxDeductor_update: '/TaxDeductor',
    TaxDeductor_getbyId: '/TaxDeductor',
    TaxDeductor_delete: '/TaxDeductor',

    //ApprovalSectionDoc

    ApprovalSectionDoc_insert: '/ApprovalSectionDoc',
    ApprovalSectionDoc_GetAll: '/ApprovalSectionDoc/GetAll',

    //LeaveTransaction

    Get_PendingLeave: '/LeaveTransaction/LeavePendingList',
    Approve_PendingLeave: '/LeaveTransaction/ApprovePendingLeave',
    Delete_PendingLeave: '/LeaveTransaction',

    GetEmpDetailsandListById: '/LeaveTransaction',

    GetLeaveBalance: '/LeaveTransaction/GetLeaveBalnace',

    generateLeaveTakenbyDate: '/LeaveTransaction/EmpLeavesOnDates',

    Insert_Leave_Transaction: '/LeaveTransaction/InsertLeaveTaken',

    get_LeaveTaken_Details: '/LeaveTransaction/GetLeaveTakenList',

    getById_LeaveTaken_Details: '/LeaveTransaction/GetById',
    Update_LeaveTaken_Details: '/LeaveTransaction/UpdateLeaveTaken',
    Delete_LeaveTaken_Details: '/LeaveTransaction/Delete',

    //LoanAllotment
    LoanAllotment_insert: '/LoanAllotment',
    LoanAllotment_getall: '/LoanAllotment',
    LoanAllotment_update: '/LoanAllotment',
    LoanAllotment_getbyId: '/LoanAllotment',
    LoanAllotment_delete: '/LoanAllotment',

    LoanTransaction_insert: '/LoanTransaction',
    LoanTransaction_getall: '/LoanTransaction',
    LoanTransaction_update: '/LoanTransaction',
    LoanTransaction_getbyId: '/LoanTransaction',
    LoanTransaction_delete: '/LoanTransaction',

    add_LeaveEncash: '/LeaveEncashment',
    get_All_LeaveEncash: '/LeaveEncashment',
    getById_LeaveEncash: '/LeaveEncashment',
    update_LeaveEncash: '/LeaveEncashment',
    delete_LeaveEncash: '/LeaveEncashment',
    getBalanceLeave: '/LeaveEncashment',
    calculateLeaveEncashment: '/LeaveEncashment/calculate',

    //
    //Attendance Adjustment
    get_AttendanceAdjustment: '/AttendanceAdjustment',
    update_Attendance: '/AttendanceAdjustment',

    //Stop Salary

    get_SalaryList: '/StopSalary/GetSalaryList',
    Stop_Salary: '/StopSalary/StopSalary',
    Upstop_SalaryList: '/StopSalary/Unstop-Salary',
    get_SalaryStopPaidList: '/StopSalary/GetSalaryStopPaidList',

    get_SalaryPaidList: '/StopSalary/GetSalaryPaidList',

    Pay_Salary: '/StopSalary/PayStopSalary',

    //LeaveAccural
    get_LeaveAccruallist: '/LeaveAccrual',
    delete_leaveAccrual: '/LeaveAccrual/delete',
    insert_leaveAccrual: '/LeaveAccrual/insert',

    //Manual Punch

    Get_ManualPunch: '/ManualPunch',
    getById_InOut: '/ManualPunch/InOut',

    get_All_HeadAssign: '/HeadAssign/GetAllEmployeeForHeadAssign',
    Update_HeadAssign: '/HeadAssign',
    GetAttendanceList: '/EmployeeRentDetail/GetAttendanceList',
    EmployeeAttendance: '/EmployeeRentDetail/InsertAttendance',
    DeleteEmployeeAttendance: '/EmployeeRentDetail/DeleteAttendance',

    GetSalaryProcessList: '/EmployeeRentDetail/autoSalaryProcess',
    PostSalaryProcess: '/EmployeeRentDetail/InsertautoSalaryProcess',
    deleteSalaryProcess: '/EmployeeRentDetail/deleteSalaryProcess',

    GetSalaryProcessListReim: '/EmployeeRentDetail/autoSalaryProcessReim',
    PostSalaryProcessReim: '/EmployeeRentDetail/InsertautoSalaryProcessReim',
    deleteSalaryProcessReim: '/EmployeeRentDetail/deleteSalaryProcessReim',

    GetBonusProcessList: '/EmployeeRentDetail/autoBonusProcess',
    PostBonusProcess: '/EmployeeRentDetail/InsertautoBonusProcess',
    deleteBonusProcess: '/EmployeeRentDetail/deleteBonusProcess',


    GetArrearProcessList: '/EmployeeRentDetail/GetArrearProcessList',
    PostArrearProcess: '/EmployeeRentDetail/InserArrearProcess',
    deleteArrearProcess: '/EmployeeRentDetail/deleteArrearProcess',
    GetITProcessList: '/EmployeeRentDetail/GetITProcessList',
    InserITProcess: '/EmployeeRentDetail/InserITProcess',
    deleteITProcess: '/EmployeeRentDetail/deleteITProcess',
    GetLockITList: '/EmployeeRentDetail/GetLockITList',

    InserLockITProcess: '/EmployeeRentDetail/InserLockITProcess',
    DeleteITLock: '/EmployeeRentDetail/DeleteITLock',

    //company parameter
    add_companyparameter: '/CompanyConfig',
    get_All_companyparameter: '/CompanyConfig',
    getById_companyparameter: '/CompanyConfig',
    update_companyparameter: '/CompanyConfig',


    LeavetypeClient: '/LeaveTypeClient',

    ManualIncomeTax_Getall: '/ManualIncomeTax/GetAllData',
    ManualIncomeTax_Update: '/ManualIncomeTax',

    Tax_getall: '/TaxConfig',
    Tax_Update: '/TaxConfig',
    Tax_insert: '/TaxConfig',

    LeaveConfig_getall: '/LeaveConfig',
    LeaveConfig_update: '/LeaveConfig',
    LeaveConfig_insert: '/LeaveConfig',

    AttendanceConfig_getall: '/AttendanceConfig',
    AttendanceConfig_update: '/AttendanceConfig',
    AttendanceConfig_insert: '/AttendanceConfig',

    EmailConfig_getall: '/EmailConfig',
    EmailConfig_update: '/EmailConfig',
    EmailConfig_insert: '/EmailConfig',


    Insert_channelMaster: '/Channel',
    Get_channelMaster: '/Channel',
    GetById_channelMaster: '/Channel',
    Update_channelMaster: '/Channel',
    Delete_channelMaster: '/Channel',
    //
    MonthSalSlip_update: '/MonthlySalarySlip/Update',
    MonthSalSlip_Insert: '/MonthlySalarySlip/Insert',
    MonthSalSlip_getbyId: '/MonthlySalarySlip/GetById',
    MonthSalSlip_delete: '/MonthlySalarySlip/Delete',

    //
    Get_Salarylock: '/SalaryLockUnlock/GetsalarylockList',
    Get_UnlockSalaryemplyeelist: '/SalaryLockUnlock/UnlockSalaryEmplyeelist',
    Get_lockSalaryemplyeelist: '/SalaryLockUnlock/LockSalaryEmplyeelist',
    // for salary approve
    GetsalaryApprovedList: '/SalaryLockUnlock/GetsalaryApprovedList',
    DisapproveSalaryEmplyeelist: '/SalaryLockUnlock/DisapproveSalaryEmplyeelist',
    approveSalaryEmplyeelist: '/SalaryLockUnlock/approveSalaryEmplyeelist',
    //

    add_location: '/CommonLocation',
    get_location: '/CommonLocation',
    delete_location: '/CommonLocation',
    getlocationById: '/CommonLocation',
    update_location: '/CommonLocation',

    //
    Insert_officeTypeMaster: '/OfficeTypeMaster',
    Get_officeTypeMaster: '/OfficeTypeMaster',
    GetById_officeTypeMaster: '/OfficeTypeMaster',
    Update_officeTypeMaster: '/OfficeTypeMaster',
    Delete_officeTypeMaster: '/OfficeTypeMaster',

    UserMaster_insert: '/UserMaster',
    UserMaster_getall: '/UserMaster',
    UserMaster_update: '/UserMaster',
    UserMaster_getbyId: '/UserMaster',
    UserMaster_delete: '/UserMaster',
    Export_emplyeelist: '/ExportReport/ViewSalaryReportlist',
    downloadViewSalaryReportlist: '/ExportReport/downloadViewSalaryReportlist',

    downloadComplianceExcel: '/ExportReport/downloadComplianceExcel',
    Export_Compliancelist: '/ExportReport/ViewComplianceReport',
    GeneratePfForm3: '/ExportReport/PFForm3',



    Get_payrolldashboardlist: '/ExportReport/PayrollDashboradlist',
    UserChangePassword: '/User/ChangePassword',

    get_RoleMaster: '/RoleMaster',
    getRoleMasterById: '/RoleMaster',
    delete_RoleMaster: '/RoleMaster',
    update_RoleMaster: '/RoleMaster',
    add_RoleMaster: '/RoleMaster',
    Export_attendance: '/ExportReport/ViewAttendanceReportlist',
    downloadViewAttendanceReportlist: '/ExportReport/downloadViewAttendanceReportlist',

    Export_leave: '/ExportReport/ViewLeaveReportlist',
    downloadViewLeaveReportlist: '/ExportReport/downloadViewLeaveReportlist',

    Export_loan: '/ExportReport/ViewLoanReportlist',
    downloadViewLoanReportlist: '/ExportReport/downloadViewLoanReportlist',

    Export_canteen: '/ExportReport/GetCanteenExcel',
    View_canteen: '/ExportReport/ViewCanteenReportlist',
    downloadViewCanteenReportlist: '/ExportReport/downloadViewCanteenReportlist',

    Insert_Fin_Year: '/FinancialYear/Insert',
    Update_Fin_Year: '/FinancialYear/Update',
    Get_Fin_Year: '/FinancialYear/GetAll',
    Delete_Fin_Year: '/FinancialYear/Delete',
    GetById_Fin_Year: '/FinancialYear/GetById',
    Forchangeyeardata: '/FinancialYear/changeyeardata',
    OnChange: '/FinancialYear/OnChange',

    employeeuploadexcel: '/ImportExcle/upload-excel',
    SAL_EmpAttendance_ForExportImport: '/ImportExcle/GetAttendanceList',
    //for day wise
    GetAttendanceListfordaywiseImport: '/ImportExcle/GetAttendanceListfordaywiseImport',
    SAL_EmpdaywiseAttendance_ForExport: '/ImportExcle/exportAttendancedaywise',
    SAL_EmpdaywiseAttendance_ForImport: '/ImportExcle/ImportDaywiseAttendance',

    SAL_EmpAttendance_ForExport: '/ImportExcle/exportAttendance',
    SAL_EmpAttendance_ForImport: '/ImportExcle/ImportAttendance',
    ExportImportSalaryHeadList: '/ImportExcle/ExportImportSalaryHeadList',
    exportsalartHead: '/ImportExcle/exportsalartHead',
    ImportSalaryHead: '/ImportExcle/ImportSalaryHead',

    delete_RoleMasters: '/RoleMasters',
    getById_RoleMasters: '/RoleMasters',
    update_RoleMasters: '/RoleMasters',
    add_RoleMasters: '/RoleMasters',
    get_RoleMasters: '/RoleMasters',

    Insert_SubDepartment: '/SubDepartment/Insert',
    Update_SubDepartment: '/SubDepartment/Update',
    get_SubDepartment: '/SubDepartment/GetAll',
    get_SubDepartmentById: '/SubDepartment',
    delete_SubDepartment: '/SubDepartment',

    GetById_organizationChart: '/OrganizationChart',

    GetAllEmpDetailsinoutForAll:
      '/EmployeeRentDetail/GetAllEmpDetailsinoutForAll',
    UpdateAttendanceInOut: '/EmployeeRentDetail/UpdateAttendanceInOut',

    ShiftMstGetByName: '/EmployeeRentDetail/ShiftMstGetByName',
    AttendanceStatusList: '/EmployeeRentDetail/AttendanceStatus',

    BankMaster: '',
    ExportMaster: '',
    Export_pdf: '/ExportReport/GetPdf',

    DownloadPdfFile: '/ExportReport/DownloadPdfFile',
    DownloadPdfFileV2: '/ExportReport/DownloadPdfFileV2',//added ragini
    GenerateForm5: '/ExportReport/GenerateForm5',
    GenerateForm10: '/ExportReport/GenerateForm10',
    GeneratePFStatement: '/ExportReport/GeneratePFStatement',
    //added new
    GenerateESIStatement: '/ExportReport/GenerateESIStatement',
    GeneratePFform12A: '/ExportReport/GenerateForm12A',


    IncomeTaxReport: '/ExportReport/ViewIncomeTaxReportlist',
    downloadExport_IncomeTaxReport: '/ExportReport/downloadViewIncomeTaxReportlist',



    // Customer Rate Card
    customerRateCard_insert: '/CustomerRateCard/Insert',
    customerRateCard_update: '/CustomerRateCard/Update',
    customerRateCard_getAll: '/CustomerRateCard/GetAll',
    customerRateCard_getById: '/CustomerRateCard',

  },

  Training: {
    add_TrainingInstitute: '/TrainingInstitute',
    get_TrainingInstitute: '/TrainingInstitute',
    delete_TrainingInstitute: '/TrainingInstitute',
    getTrainingInstituteById: '/TrainingInstitute',
    update_TrainingInstitute: '/TrainingInstitute',
    Insert_videoUrlUpld: '/VideoURLUpload/InsertTrainingVideo',
    Update_videoUrlUpld: '/VideoURLUpload/UpdateTrainingVideo',
    getAll_videoUrlUpld: '/VideoURLUpload/GetAll',
    delete_videoUrlUpld: '/VideoURLUpload',
    get_videoUrlUpldById: '/VideoURLUpload',
    Insert_Training_Type: '/TrainingTypeMaster',
    GetAll_Training_Type: '/TrainingTypeMaster',
    GetById_Training_Type: '/TrainingTypeMaster',
    Delete_Training_Type: '/TrainingTypeMaster',
    Update_Training_Type: '/TrainingTypeMaster',
    getAll_Training: '/TrainingRatingMasters',
    insert_Training: '/TrainingRatingMasters',
    update_Training: '/TrainingRatingMasters',
    delete_Training: '/TrainingRatingMasters',
    getById_Training: '/TrainingRatingMasters',
    // Training Program
    add_TrainingProgram: '/TrainingProgram/Insert',
    getAll_TrainingProgram: '/TrainingProgram/GetAll',
    GetById_TrainingProgram: '/TrainingProgram',
    update_TrainingProgram: '/TrainingProgram/Update',
    delete_TrainingProgram: '/TrainingProgram',

    // Training Sub-Program
    add_TrainingsubProgram: '/TrainingSubProgram/Insert',
    getAll_TrainingsubProgram: '/TrainingSubProgram',
    GetById_TrainingsubProgram: '/TrainingSubProgram',
    update_TrainingsubProgram: '/TrainingSubProgram',
    delete_TrainingsubProgram: '/TrainingSubProgram',


    insert_TNI: '/TrainingNeedIdentification/Insert',
    getAll_TNI: '/TrainingNeedIdentification/GetAll',
    TNI_subprogram: '/TrainingNeedIdentification/Subprogram',
    TNI_EMp_List: '/TrainingNeedIdentification/GetAll_TNI',
    TNI_subprogramForPlanning: '/TrainingNeedIdentification/SubprogramForTni',


    add_TrainingPlanning: '/TrainingPlanning/insert',
    getAll_TrainingPlanning: '/TrainingPlanning',
    GetById_TrainingPlanning: '/TrainingPlanning/GetById',
    update_TrainingPlanning: '/TrainingPlanning/update',
    delete_TrainingPlanning: '/TrainingPlanning/Delete',



    AdminList_TNI: '/TrainingNeedIdentification/admin/list',
    AdminAction_TNI: '/TrainingNeedIdentification/admin/action',
    TNI_GetAll: '/TrainingNeedIdentification/approved-TNI-List',

    TNI_PlannedEmployee: '/TrainingPlanning/ViewAllPlannedEmployee',
    TNI_View: '/TrainingNeedIdentification/employee-view',

    TrainingCalendar_getAllForEmployee: '/TrainingCalendar/GetforAttendancemark',

    EmpAttenadanceFor_Traininig: '/TrainingCalendar/attendance/insert',
    Training_EmpAttenadanceByAdmin: '/TrainingCalendar/attendanceByAdmin/insert',

    TrainingMeterial: '/TrainingCalendar/UploadMaterial',
    UpdateTrainingMeterial: '/TrainingCalendar/UpdateMaterial',
    GetAll_TrainingUMeterial: '/TrainingCalendar/MaterialGetAll',
    GetById_TrainingMeterial: '/TrainingCalendar/MaterialGetbyId',
    Give_Feedback: '/TrainingCalendar/GiveFeedback',




    CheckEmpAttenadance_Traininig: '/TrainingCalendar/attendance/check-today',
    ViewEmpAttenadance_Traininig: '/TrainingCalendar/TrainingAttendanceView',
    Attenadance_TraininigForadmin: '/TrainingPlanning/TrainingAttendanceforAdmin',
    TrainingCalendar_getbyid: '/TrainingCalendar/GetById',

    GetFeedBack_Training: '/TrainingPlanning/CompletedPrograms'
  },

  attendance: {
    Get_AttendanceMarkInfo: '/Employee/GetEmployeeInfoForAttendanceMark',
    Insert_AttendanceMark: '/Employee/MarkEmployeeAttendanceAsync',
  },

  Hrdocument: {
    get_EmployeeLetters: '/HrLetter/GetEmployeeLetters',
    UpdateStatus: '/GenerateLetter/UpdateStatus',
    Hrpolicy: '/HrPolicy',
    Get_Doc: '/HrPolicy/download-file',

    get_HrLetter: '/HrLetter',
    getHrdoc: '/HrLetter/GetFile',
    downloadletter: '/HrLetter/DownloadFormat', //anjali
  },

  HR: {
    SelectEmployee: '/GenerateLetter/SelectEmployee', //ad anjali 4 feb
    publishLetter: '/GenerateLetter/publish',//Add anjali 6 feb
    EventDahsboard: '/EventMst/EmployeeEventDashboard',
    EventRecentActivity: '/EventMst/GetRecentActivity',
    insert_letter: '/GenerateLetter',
    GetHeads: '/GenerateLetter/GetHeads',
    getCandidateLetterGrid: '/GenerateLetter/getCandidateLetterGrid',
    delete: '/GenerateLetter',
    downloadletter: '/GenerateLetter/DownloadFormat',

    GetTodayBirthday: '/Event/GetTodayBirthday',
    GetUpcomingBirthday: '/Event/GetUpcomingBirthday',
    GetAniversary: '/Event/GetAniversary',
    GetEvents: '/Event/GetEvents',
    GetActivity: '/Event/GetActivity',

    Insert_DocUpload: '/DocumentUpload',
    Update_DocUpload: '/DocumentUpload',
    get_DocUpload: '/DocumentUpload',
    get_DocUploadById: '/DocumentUpload/GetById',
    delete_DocUpload: '/DocumentUpload',
    user_image: '/DocumentUpload/GetFile',

    Download_SalarySlip: '/ExportReport/DownloadSalarySlipAsync',

    Employee_Image_Upload: '/Employee/UploadEmployeeImage',
    Employee_Image_Get: '/Employee/GetImageForEmployees',
    Employee_Image_Delete: '/Employee/DeleteImage',
    usr_image: '/Employee/images',

    get_dashboard: '/Dashboard',
    delete_dashboard: '/Dashboard',
    get_dashboard_ById: '/Dashboard',
    update_dashboard: '/Dashboard',
    add_dashboard: '/Dashboard',

    update_skipAttribute: '/SkipAttribute',
    get_skipAttributeBYid: '/SkipAttribute',
    delete_skipAttribute: '/SkipAttribute',
    get_skipAttribute: '/SkipAttribute',
    add_skipAttribute: '/SkipAttribute',

    update_cardAppreciator: '/CardAppreciator',
    get_cardAppreciatorByid: '/CardAppreciator',
    delete_cardAppreciator: '/CardAppreciator',
    get_cardAppreciator: '/CardAppreciator',
    add_cardAppreciator: '/CardAppreciator',

    add_accidentDetail: '/AccidentDetails',
    get_accidentDetail: '/AccidentDetails',
    delete_accidentDetail: '/AccidentDetails',
    get_accidentDetailByid: '/AccidentDetails',
    update_accidentDetail: '/AccidentDetails',
    User_image: '/AccidentDetails/images',

    get_Candidate: '/CandidateMaster',
    update_Candidate: '/CandidateMaster',
    get_Candidate_ById: '/CandidateMaster',
    delete_Candidate: '/CandidateMaster',
    add_Candidate: '/CandidateMaster',

    General_IsValueAvailable: '/General/IsValueAvailable',
    IsValueAvailable: '/General/IsValueAvailable',

    Insert_LanguageMaster: '/LanguageMaster',
    Get_LanguageMaster: '/LanguageMaster',
    GetById_LanguageMaster: '/LanguageMaster',
    Update_LanguageMaster: '/LanguageMaster',
    Delete_LanguageMaster: '/LanguageMaster',

    HRComplaint_insert: '/HRComplaint',
    HRComplaint_getall: '/HRComplaint',
    HRComplaint_update: '/HRComplaint',
    HRComplaint_getbyId: '/HRComplaint',
    HRComplaint_delete: '/HRComplaint',

    HrAppreciation_insert: '/Appreciation',
    HrAppreciation_getall: '/Appreciation',
    HrAppreciation_update: '/Appreciation/update',
    HrAppreciation_getbyId: '/Appreciation',
    HrAppreciation_delete: '/Appreciation',
    Image: '/Appreciation/images',

    get_list: '/EmployeeKRAPLI',
    updateEmployeeKRA: '/EmployeeKRAPLI',

    HR_event_Insert: '/EventMst/Insert',
    HR_event_update: '/EventMst/update',
    HR_event_delete: '/EventMst/delete',
    HR_event_getbyId: '/EventMst',
    HR_event__getall: '/EventMst'
  },
  Requitment: {
    add_candidateMaster: '/Candidate',
    get_candidateMaster: '/Candidate',
    update_candidateMaster: '/Candidate',
    delete_candidateMaster: '/Candidate',
    get_candidateMasterByid: '/Candidate',
    get_candidateByemailmobile: '/Candidate/by-emailormobile',
    send_onboarding_email: '/Candidate/send-onboarding-email',//added code

    get_recruitmentMaster: '/RecruitModeMaster',
    update_recruitmentMaster: '/RecruitModeMaster',
    get_recruitmentMaster_ById: '/RecruitModeMaster',
    delete_recruitmentMaster: '/RecruitModeMaster',
    add_recruitmentMaster: '/RecruitModeMaster',

    add_externalMember: '/ExternalMember',
    get_externalMember: '/ExternalMember',
    update_externalMember: '/ExternalMember',
    delete_externalMember: '/ExternalMember',
    get_externalMemberByid: '/ExternalMember',

    get_ScreeningCommittee_ById: '/ScreeningCommittee',
    update_ScreeningCommittee: '/ScreeningCommittee',
    delete_ScreeningCommittee: '/ScreeningCommittee',
    get_ScreeningCommittee: '/ScreeningCommittee',
    add_ScreeningCommittee: '/ScreeningCommittee',

    get_ScreeningApp: '/ScreeningApp',
    update_ScreeningApp: '/ScreeningApp',

    JobMaster_insert: '/Newjob',
    JobMaster_getall: '/Newjob',
    JobMaster_update: '/Newjob/update',
    JobMaster_getbyId: '/Newjob',
    JobMaster_delete: '/Newjob',
    Appreciation_image: '/Newjob/images',

    get_ConductInterview_ById: '/InterviewEvaluation',
    delete_ConductInterview: '/InterviewEvaluation',
    update_ConductInterview: '/InterviewEvaluation',
    add_ConductInterview: '/InterviewEvaluation',
    get_ConductInterview: '/InterviewEvaluation/GetALL',
    Getinterviewdropdown: '/InterviewEvaluation/GetInterviewRounds',
    GetCandidatedropdown: '/InterviewEvaluation/Getdropdown',

    get_CandidateSalary: '/CandidateSalary',
    Insert_CandidateSalary: '/CandidateSalary',
    Update_CandidateSalary: '/CandidateSalary',
    delete_CandidateSalary: '/CandidateSalary',
    get_CandidateName: '/CandidateSalary/CandidateSearch',
    get_CandidateDetails: '/CandidateSalary/CandidateDetails',

    Specialization_insert: '/Specialization',
    Specialization_getall: '/Specialization',
    Specialization_update: '/Specialization',
    Specialization_getbyId: '/Specialization',
    Specialization_delete: '/Specialization',

    SelectedCandidate_update: '/SelectedCandidates',
    SelectedCandidate_getById: '/SelectedCandidates',

    Qualification_insert: '/Qualification',
    Qualification_getall: '/Qualification',
    Qualification_update: '/Qualification',
    Qualification_getbyId: '/Qualification',
    Qualification_delete: '/Qualification',

    Project_insert: '/Project',
    Project_getall: '/Project',
    Project_update: '/Project',
    Project_getbyId: '/Project',
    Project_delete: '/Project',

    NewsPaper_insert: '/NewsPaper',
    NewsPaper_getall: '/NewsPaper',
    NewsPaper_update: '/NewsPaper',
    NewsPaper_getbyId: '/NewsPaper',
    NewsPaper_delete: '/NewsPaper',

    ScheduleInterview_insert: '/ScheduleInterview',
    ScheduleInterview_getById: '/ScheduleInterview',

    ConfirmationEmail_insert: '/ConfirmationEmail',
    ConfirmationEmail_getall: '/ConfirmationEmail',
    ConfirmationEmail_update: '/ConfirmationEmail',
    ConfirmationEmail_getbyId: '/ConfirmationEmail',
    ConfirmationEmail_delete: '/ConfirmationEmail',

    FreezeCandidate_update: '/FreezingStatus',
    FreezeCandidate_getById: '/FreezingStatus',

    Rolewise_KRA_getList: '/KRA',

    Rolewise_KRA_Ins: '/KRA',
    Rolewise_KRA_Delete: '/KRA/DeleteRolewise',
    Rolewise_KRA_GetById: '/KRA/GetRoleId',
    Employeewise_KRA_Ins: '/KRA',

    Employeewise_KRA_Delete: '/KRA/DeleteEmployeewise',
    Employeewise_KRA_GetALL: '/KRA/GetEmpList',
    Employeewise_KRA_GetById: '/KRA/GetEmpId',

    Emp_Self_Assessment_KRA: '/KRA/Self_KRA',
    Emp_Self_getByempId: '/KRA/Self_Assesment_Data',

    Emp_Assessment_getById: '/KRA/Assesment_DataByID',

    Emp_RMAssessment_getAll: '/KRA/RMList',
    Kra_Period_DropDown: '/KRA/KRAPeriod',

    Emp_SelfAssessment_getAll: '/KRA/SelfList',

    Emp_HODAssessment_getAll: '/KRA/HODList',
    RoleWise_Assessment_getAll: '/KRA/Role_Assessment_List',
    RoleWise_Assessment_Insert: '/KRA/RoleWise_Assessment_Insert',
    Role_Assessment_getByempId: '/KRA/Role_Assesment_Data',

    Employeewise_KRAGetEmployeeKRAIdAsync: '/KRA/GetEmployeeKRAIdAsync',

    Emp_Self_Assessment_KRA_Upd: '/KRA/Self_KRA_Update',

    RM_getByempId: '/KRA/RMAssesment_DataByID',
    HOD_getByempId: '/KRA/HODAssesment_DataByID',

    RM_Assessment_Upd: '/KRA/RM_Assessment_Update',
    HOD_Assessment_Upd: '/KRA/HOD_Assessment_Update',

    candidate_GetAll: '/CandidateMedical/candidate',

    CandidateMedical_GetById: '/CandidateMedical/medical',
    CandidateMedical_Delete: '/CandidateMedical/medical',
    CandidateMedical_GetAll: '/CandidateMedical/AllMedical',
    CandidateMedical_Insert: '/CandidateMedical',
    CandidateMedical_Update: '/CandidateMedical/updatemedical',

    candidateRefrence_GetById: '/CandidateMedical/refrence',
    candidateRefrence_Delete: '/CandidateMedical/reference',
    candidateRefrence_GetAll: '/CandidateMedical/Allrefrence',
    candidateRefrence_Insert: '/CandidateMedical/refrence',
    candidateRefrence_Update: '/CandidateMedical/updaterefrence',

    Insert_behavioralMaster: '/BehavioralAreaMaster',
    Get_behavioralMaster: '/BehavioralAreaMaster',
    GetById_behavioralMaster: '/BehavioralAreaMaster',
    Update_behavioralMaster: '/BehavioralAreaMaster',
    Delete_behavioralMaster: '/BehavioralAreaMaster',
    validatePeriod: '/KRA/validatePeriod',

    Import_Rolewise_KRA: '/RoleWiseKRAImport/ImportRolewiseKRA',
    EmpWiseKRAImport: '/EmpKraImport/ImportEmpKRANew',

    insert_Manpower: '/Manpower',
    getAll_Manpower: '/Manpower',
    update_Manpower: '/Manpower',
    getById_Manpower: '/Manpower/getbyid',
    delete_Manpower: '/Manpower',

    insert_ManpowerApproval: '/ManPowerApprove',
    getAll_ManpowerApproval: '/ManPowerApprove',
  },
  Appraisal: {
    AppraisalDetails: '/RecruitModeMaster/AppraisalDetails',
    AppraisalYearDdl: '/RecruitModeMaster/AppraisalYearDdl',
    AppraisalInsert: '/RecruitModeMaster/AppraisalInsert',
    getappraisalList: '/RecruitModeMaster/EmployeeAppraisalList',
    getappraisalListhod: '/RecruitModeMaster/EmployeeAppraisalListforHOd',
    getappraisalById: '/RecruitModeMaster/AppraisalDetailsById',
    checkAppraisalExists: '/RecruitModeMaster/Appraisalcheck-duplicate',

    add_Reminder_Setup: '/ReminderSetup',
    insert_Appraisal: '/Appraisal',
    getAll_Appraisal: '/Appraisal',
    getById_Appraisal: '/Appraisal',
    update_Appraisal: '/Appraisal',
    delete_Appraisal: '/Appraisal',
    getAll: '/EmpwiseKraReport/get-kra-report',
    rolewiseKRA_Report: '/RolewiseKRAReport',
    getAppraisalStatusList: '/EmpAppraisalStatus',
    getAppraisalPdfData: '/EmpAppraisalStatus/pdf',
    selfassessment_Report: '/SelfAssessmentReport',
  },
  Travel_expense: {
    add_lodging_Boarding: '/LodgingBoarding',
    get_lodging_Boarding: '/LodgingBoarding/grid',
    delete_lodging_Boarding: '/LodgingBoarding',
    get_lodging_Boarding_ById: '/LodgingBoarding',
    update_lodging_Boarding: '/LodgingBoarding',

    add_TravelRate: '/TravelRate',
    get_TravelRate: '/TravelRate/grid',
    delete_TravelRate: '/TravelRate',
    get_TravelRate_ById: '/TravelRate',
    update_TravelRate: '/TravelRate',
    insertTravelExpence: '/TravelMaster',
    listTravelExpence: '/TravelMaster',
    deleteTravelExpence: '/TravelMaster',
    updateTravelExpence: '/TravelMaster',
    getByIdTravelExpence: '/TravelMaster',
    IsValueAvailableTravelExpence: '/TravelMaster',

    TravelExpence_Insert: '/TravelModeMaster',
    TravelExpence_GetAll: '/TravelModeMaster/GetAll',
    TravelExpence_Delete: '/TravelModeMaster',
    TravelExpence_GetById: '/TravelModeMaster',
    TravelExpence_Upd: '/TravelModeMaster',

    insertLocalTravel: '/LocalTravel',
    getAllLocalTravels: '/LocalTravel',
    getLocalTravelById: '/LocalTravel',
    deleteLocalTravel: '/LocalTravel',
    updateLocalTravel: '/LocalTravel',
    localTravelDetailsView: '/LocalTravel/DetailsView',
    downloadPrint: '/LocalTravel/download-pdf',
    getImage: '/LocalTravel/GetImage',  // ← ADD THIS LINE
    finalSubmit: '/LocalTravel/SubmitLocalTravel'
  },
  visitor: {
    GetAll_Visitor: '/Visitor',
  },

  vendorEmployeeDoc: {
    GetVendorEmpDocList: '/VendorEmployeeDoc/GetVendorEmpDocList',
    GetHREmpDocList: '/VendorEmployeeDoc/GetHREmpDocList',
    GetDocsByEmpAndVendor: '/VendorEmployeeDoc/GetDocsByEmpAndVendor',
    UploadEmployeeDocuments: '/VendorEmployeeDoc/UploadEmployeeDocuments',
    UpdateDocStatus: '/VendorEmployeeDoc/UpdateDocStatus',
    DeleteDocument: '/VendorEmployeeDoc/DeleteDocument',
    DownloadDocument: '/VendorEmployeeDoc/DownloadDocument',
    GetEmployeesByVendor: '/VendorEmployeeDoc/GetEmployeesByVendor',
  },

  vendor: {
    GetHIDashboardSummary: '/Vendor/GetHIDashboardSummary',
    GetVendorDownloadVerificationList: '/Vendor/GetVendorDownloadVerificationList',
    DownloadVendorVerificationExcel: '/Vendor/DownloadVendorVerificationExcel',
    VendorList: '/Vendor/GetAllVendors',
    GetVendorById: '/Vendor/GetVendorById',
    InsertVendor: '/Vendor/InsertVendor',
    UpdateVendor: '/Vendor/UpdateVendor',
    DeleteVendor: '/Vendor/DeleteVendor',
    GetVendorAuditLogs: '/Vendor/GetVendorAuditLogs',
    UploadVendorExcel: '/Vendor/UploadVendorExcel',
    VendorServiceGetLocationsByVendor: '/VendorService/GetLocationsByVendor',
    VendorServiceUploadExcel: '/VendorService/UploadExcel',

    SaveUploadFileHistory: '/UploadFileHistory/SaveHistory',
    GetUploadFileHistory: '/UploadFileHistory/GetHistory',
    DownloadUploadFileHistory: '/UploadFileHistory/Download',
    ViewUploadFileHistory: '/UploadFileHistory/View',

    GetLinkedFHRIDs: '/Vendor/GetLinkedFHRIDs',
    UploadRateCard: '/Vendor/UploadRateCard',
    getVendorFHRIDHistory: '/Vendor/fhrid-history/',

    GetVendorDashboardSummary: '/Vendor/GetVendorDashboardSummary',
    SaveExcelDocument: '/Vendor/SaveExcelDocument',
    GetVendorMasterUploadDocumentList: '/Vendor/GetVendorMasterUploadDocumentList',
    DownloadVendorMasterDocument: '/Vendor/DownloadVendorMasterDocument',
    GetModelListByClient: '/ClientMaster/GetModelListByClient',
    GetVendorRateCards: '/Vendor/GetVendorRateCards',
    GetVendorRateCardHistory: '/Vendor/ratecard-history',

    GetAllBlockRateCard: '/AmazonDspBlockRateCard/GetAll',
    GetByIdBlockRateCard: '/AmazonDspBlockRateCard/GetById',
    InsertBlockRateCard: '/AmazonDspBlockRateCard/Insert',
    UpdateBlockRateCard: '/AmazonDspBlockRateCard/Update',
    UploadBlockRateCard: '/AmazonDspBlockRateCard/UploadBlockRateCard',
    GetBlockRateCardExcelDocumentList: '/AmazonDspBlockRateCard/GetExcelDocumentList',
    DownloadBlockRateCardExcelDocument: '/AmazonDspBlockRateCard/DownloadExcelDocument',

    GetAuditLogDocumentNames: '/Vendor/audit-log/document-names',
    GetAuditLogs: '/Vendor/audit-log/list',

    //new
    GetRateCardUploadedFiles: '/Vendor/GetRateCardUploadedFiles',
    DownloadRateCardFile: '/Vendor/DownloadRateCardFile',
    UploadVendorFHRIDMappingExcel: '/Vendor/UploadVendorFHRIDMappingExcel',
    GetVendorFHRIDFiles: '/Vendor/GetVendorFHRIDFiles',
    GetVendorTransactionRanges: '/Vendor/TransactionRanges',
    SearchVendors: '/Vendor/SearchVendors',
    GetVendorTransactionList: '/Vendor/TransactionList',
    DownloadVendorFHRIDFile: '/Vendor/DownloadVendorFHRIDFile',

    GetVendorFHRIDMappingStats: '/Vendor/GetVendorFHRIDMappingStats',
    GetVendorMappedUnmappedList: '/Vendor/GetVendorMappedUnmappedList',
    GetVendorAgentDropdown: '/Vendor/GetVendorAgentDropdown',

    //vendor CJDARCL added code starts
    VendorServiceGetAll: '/VendorService/GetAll',
    VendorServiceGetById: '/VendorService/GetById',
    VendorServiceInsert: '/VendorService/Insert',
    VendorServiceUpdate: '/VendorService/Update',
    VendorServiceDelete: '/VendorService/Delete',
    VendorServiceGetVendors: '/VendorService/GetVendors',
    VendorServiceGetLocations: '/VendorService/GetLocations',
    VendorServiceGetClients: '/VendorService/GetClients',
    //vendor CJDARCL added code ends
  },
  //vendor CJDARCL added code starts
  vendorLite: {
    UploadVendorLogo: '/VendorLite/UploadVendorLogo',
    GetAll: '/VendorLite/GetAll',
    GetById: '/VendorLite/GetById',
    InsertVendorLite: '/VendorLite/InsertVendorLite',
    UpdateVendorLite: '/VendorLite/UpdateVendorLite',
    UploadDocuments: '/VendorLite/UploadVendorDocuments',
    GetDocuments: '/VendorLite/GetVendorDocuments',
    DeleteDocument: '/VendorLite/DeleteDocument',
  },
  //vendor CJDARCL added code ends

  //Employee
  Leave: {



    LeaveTypeClientWise: '/LeaveTypeClient/LeaveTypeClientWise',

    DeleteShortLeave: '/Emp_LeaveRequest/DeleteShortLeave',
    DeleteCompoffLeave: '/CompOffRequest/DeleteCompOffLeave',
    LeaveDash: '/LeaveDash',
    Emp_DropdownList: '/General/Emp_dropdownList',
    Ins_LeaveRequest: '/Emp_LeaveRequest/InsertLeaveApply',
    get_LeaveRequest_list: '/Emp_LeaveRequest/GetAllLeaveRequest',
    get_LeaveRequest_Detail: '/Emp_LeaveRequest/GetAllLeaveDetails',

    Get_LeaveBalance: '/Emp_LeaveRequest/Emp_GetLeaveBalnace',
    Emp_generateLeaveTakenbyDate: '/Emp_LeaveRequest/EmpLeavesOnDates',

    Emp_ViewLeaveBalance: '/Emp_LeaveRequest/Emp_GetViewBalnace',
    get_restrictedHolidays: '/RestrictedHolidays',
    get_GazettedHolidays: '/RestrictedHolidays/Gazatted',

    insert_CompOffRequest: '/CompOffRequest',
    getAll_CompOffRequest: '/CompOffRequest/compoff',
    getById_CompOffRequest: '/CompOffRequest',
    getTotalDays_CompOffRequest: '/CompOffRequest/compoff_Attendance',

    insert_CompOffRequestApproval: '/CompOffApproval',
    getAll_CompOffRequestApproval: '/CompOffApproval',
    getById_CompOffRequestApproval: '/CompOffApproval',
    //approvarl
    ApproveshortLeaveList: '/Emp_LeaveRequest/ApproveshortLeave',
    ApproveshortLeave_Insert: '/Emp_LeaveRequest/ApproveshortLeave',
    get_ApprovalLeaveOd_list: '/Emp_LeaveRequest/ApprovalLeaveOd',
    Ins_ApprovalLeaveOd: '/Emp_LeaveRequest/ApprovalLeaveOd',
    ApprovedDisapprovedList: '/Emp_LeaveRequest/ApprovedDisapprovedList',
    InsertshortLeave: '/Emp_LeaveRequest/shortLeave',
    shortLeaveList: '/Emp_LeaveRequest/shortLeave',
    getShortLeaveById: '/Emp_LeaveRequest',
    validate_leaveblance: '/Emp_LeaveRequest/validateleavebalance',
    DeleteLeave: '/Emp_LeaveRequest/DeleteLeave',

  },

  Attendace: {
    EMPAttendanceDashNew: '/RegulariseAttendance/EMPAttendanceDashNew',
    Emp_ODApply: '/Emp_LeaveRequest/InsertODApply',
    Emp_ApproveRegularization: '/Emp_LeaveRequest/ApproveRegularization',
    Emp_GetByIdApproveRegularization:
      '/Emp_LeaveRequest/ApproveRegularization/GetById',
    Emp_UpdateApproveRegularization: '/Emp_LeaveRequest/approveRegularization',

    insert_RegulariseAttendance: '/RegulariseAttendance',
    insert_cdo: '/RegulariseAttendance/InsertCDO',




    getAll_RegulariseAttendance: '/RegulariseAttendance',
    DdlRegulariseAttendance: '/RegulariseAttendance/regularisationDates',
    getInOutTime: '/RegulariseAttendance/getInOutTime',

    Emp_AttendanceList: '/RegulariseAttendance/ViewAttendance',
    ViewTeamAttendance: '/RegulariseAttendance/ViewTeamAttendance',
    EmployeeNameList: '/RegulariseAttendance/GetEmployeeNameDropdownList',
    EMPAttendanceDash: '/RegulariseAttendance/EMPAttendanceDash',
    DeleteAttendanceRegularisation: '/RegulariseAttendance/DeleteAttendanceRegularisation',


  },
  Compensation: {

    Download_salaryslip_pdf_ForEmployee: '/ExportReport/DownloadEmpSalarySlipPdfAsync',
    GetAll_CTCforAdmin: '/CTC/forAdmin',

    GetAll_PrograssionDetail: '/PrograssionDetail',
    GetAll_CTC: '/CTC',
    get_RentDetailsList: '/PrograssionDetail/RentDetailsList',
    add_RentDetails: '/PrograssionDetail/RentDetails',
    RentDetailsById: '/PrograssionDetail/RentDetailsById',
    FinancialYearMonth: '/PrograssionDetail/GetFinyear',
    update_RentDetails: '/PrograssionDetail/UpdateRentDetails',
    Get_All_RentDetailsList: '/PrograssionDetail/GetAll',
    Get_RebateDocumentList: '/Tax_Rebate/GetRebateDocumentList',
    Get_sectionDropdown: '/Tax_Rebate/sectiondropdown',
    UpdateAsyncTaxReigme: '/TaxRegism/UpdateAsync',

    GetActiveModules: '/PageRights/GetActiveModules',


    Get_subsectionDropdown: '/Tax_Rebate/Subsectiondropdown',
    insert_RebateDocument: '/Tax_Rebate/InsertRebateDoc',
    Get_RebateDoc: '/Tax_Rebate/download-file',
    Get_RebateDocById: '/Tax_Rebate/RebateDoc/GetById',
    Update_RebateDocById: '/Tax_Rebate/UpdateRebateDoc',
    Get_TaxComputationlist: '/Tax_Rebate/GetTaxComputationList',
    Get_Finyear: '/Tax_Rebate/GetFinyear',
    Get_HeadNamedetails: '/Tax_Rebate/getheadnamelist',
    Get_Emp_Salary_PaySlip: '/Tax_Rebate/GetEmp_Salary_PaySlip',
    Get_ConsolidatedSalary: '/Tax_Rebate/GetConsolidatedSalary',
    Download_salaryslip_ForEmployee: '/ExportReport/DownloadEmpSalarySlipAsync',

    insertFlexiBill: '/EMPFlexiSalary', // POST
    getFlexiBills: '/EMPFlexiSalary', // GET
    deleteFlexiBill: '/EMPFlexiSalary', // DELETE by ID
    getFlexiHeadDropdown: '/EMPFlexiSalary/FlexiHeadDropdown', // GET
    validateBill: '/EMPFlexiSalary/validate-bill', // GET with query
  },
  Salary: {

    ViewSalaryDash: '/SalaryDashboard/ViewSalaryDashbord',



  },
  //User profile
  userprofile: {
    getUserProfile: '/EmployeeProfile',
  },
  Exit: {
    ExitDashBoard: '/ExitDashboard/GetExitDashboard',
    ExitInterviewInsert: '/ExitInterview',
    ExitInterviewGetAll: '/ExitInterview',
    ExitInterviewGetById: '/ExitInterview',
    ExitInterviewUpdate: '/ExitInterview',
    ExitInterviewDelete: '/ExitInterview',

    ExitInterviewAdminHodGetAll: '/ExitInterview/AdminHodList',
    ExitInterviewAdminHodView: '/ExitInterview/AdminHodView',
    ExitInterviewReportPdf: '/ExitInterview/ReportPdf',

    NoDueDeclarationInsert: '/NoDueDeclaration',
    NoDueDeclarationGetAll: '/NoDueDeclaration',
    NoDueDeclarationGetById: '/NoDueDeclaration',
    NoDueDeclarationUpdate: '/NoDueDeclaration',
    NoDueDeclarationDelete: '/NoDueDeclaration',
    NoDueDeclarationGetEmpDetails: '/NoDueDeclaration/GetEmpDetails',
    NoDueDeclarationDownloadPdf: '/NoDueDeclaration/ReportPdf',
    NoDueDeclarationPreviewPdf: '/NoDueDeclaration/PreviewPdf',
    NoDueDeclarationAdminHodGetAll: '/NoDueDeclaration/AdminHodList',
    NoDueDeclarationAdminHodView: '/NoDueDeclaration/AdminHodView',

    DueClearanceUserGetAll: '/DueClearance/UserList',
    DueClearanceUserInsert: '/DueClearance/User',
    DueClearanceUserUpdate: '/DueClearance/User',
    DueClearanceUserGetById: '/DueClearance/User',
    DueClearanceUserGetParams: '/DueClearance/GetParamsByDept',
    DueClearanceHODList: '/DueClearance/HODClearanceList',
    DueClearanceHODByEmp: '/DueClearance/HODClearanceByEmp',
    DueClearanceHODUpdate: '/DueClearance/HODClearance',
    MyClearance: '/DueClearance/MyClearance',
    DueClearanceList: '/DueClearance/MyClearanceStatus',
    DueClearance: '/DueClearance/DueClearance',
    GetClearanceByEmp: '/DueClearance/GetClearanceByEmp',
    AdminClearanceStatusList: '/DueClearance/AdminClearanceStatusList',
    ViewFnfReportlist: '/FNF/ViewFnfReportlist',
    DownloadFnfSettlementPdf: '/FNF/download-pdf',
    DueClearenceMasterGetAll: '/DueClearance',
    DueClearenceMasterGetById: '/DueClearance',
    DueClearenceMasterDelete: '/DueClearance/Delete',
    DueClearenceMasterInsert: '/DueClearance',
    DueClearenceMasterUpdate: '/DueClearance',

    SeparationRequestInsert: '/SeparationRequest',
    SeparationRequestGetAll: '/SeparationRequest',
    SeparationRequestGetById: '/SeparationRequest',
    SeparationRequestUpdate: '/SeparationRequest',
    SeparationRequestDelete: '/SeparationRequest',
    SeparationRequestNoticePeriod: '/SeparationRequest/notice-period',
    SeparationRequestApprovalList: '/SeparationRequest/approval-list',
    SeparationRequestApproval: '/SeparationRequest/approval',
    SeparationRequestDownloadPdf: '/SeparationRequest/download-pdf',
    SeparationRequestWithdraw: '/SeparationRequest/withdraw',
    SeparationRequestAdminList: '/SeparationRequest/admin-list',
    SeparationRequestAdminReportList: '/SeparationRequest/admin-report-list',
    SeparationRequestAdminExitReportList: '/SeparationRequest/admin-exitreport-list',
    SeparationRequestDashboardCount: '/SeparationRequest/dashboard-count',
    SeparationRequestLetterData: '/SeparationRequest/letter-data',
    SeparationRequestRelievingLetter: '/SeparationRequest/RelievingLetter',
    SeparationRequestExperienceLetter: '/SeparationRequest/ExperienceLetter',


    ExitDashboard: '/ExitDashboard/GetExitDashboard',
    //DueClarance
    GetAll: '/DueClaranceUser',
    delete_ClaranceUser: '/DueClaranceUser',
    addClearance: '/DueClaranceUser',
    updateClearance: '/DueClaranceUser',
    getByIdClearanceUser: '/DueClaranceUser',

    FnfSettlementGetDetail: '/FNF/GetDetail',
    FnfSettlementInsert: '/FNF',
    FnfSettlementView: '/FNF/View',
    SaveExitAuthority: '/exitformauthority',

  },


  RecruitmentReports: {
    // Job Report
    JobReport_GetMasterData: '/JobReport/GetReportMasterData',
    JobReport_Get: '/JobReport/GetJobReport',
    JobReport_DownloadExcel: '/JobReport/DownloadJobReportExcel',

    // MRF Report
    MrfReport_GetMasterData: '/MrfReport/GetReportMasterData',
    MrfReport_Get: '/MrfReport/GetMrfReport',
    MrfReport_DownloadExcel: '/MrfReport/DownloadMrfReportExcel',

    // Candidate Report
    CandidateReport_GetMasterData: '/CandidateReport/GetReportMasterData',
    CandidateReport_Get: '/CandidateReport/GetCandidateReport',
    CandidateReport_DownloadExcel: '/CandidateReport/DownloadCandidateReportExcel',

    // Location Report
    LocationReport_GetMasterData: '/LocationReport/GetReportMasterData',
    LocationReport_Get: '/LocationReport/GetLocationReport',
    LocationReport_GetLocationWiseJobs: '/LocationReport/GetLocationWiseJobsReport',
    LocationReport_DownloadExcel: '/LocationReport/DownloadLocationReportExcel',
    LocationReport_DownloadLocationWiseJobsExcel: '/LocationReport/DownloadLocationWiseJobsReportExcel',

    // Vendor Report
    VendorReport_GetMasterData: '/VendorReport/GetReportMasterData',
    VendorReport_Get: '/VendorReport/GetVendorReport',
    VendorReport_GetVendorWise: '/VendorReport/GetVendorWiseReport',
    VendorReport_DownloadExcel: '/VendorReport/DownloadVendorReportExcel',
    VendorReport_DownloadVendorWiseExcel: '/VendorReport/DownloadVendorWiseReportExcel'
  },
  BranchMst: '/Branch',
  dealerOutlet: '/DealerOutlet',


  AttendanceDashboard: {
    GetKPIs: '/AttendanceDashboard/GetKPIs',
    GetEmployeeGrid: '/AttendanceDashboard/GetEmployeeGrid',
    ExportToExcel: '/AttendanceDashboard/ExportToExcel',
    GetEmployeeOccurrences: '/AttendanceDashboard/GetEmployeeOccurrences',
    ExportEmployeeOccurrencesPdf: '/AttendanceDashboard/ExportEmployeeOccurrencesPdf',
    GetImage: '/AttendanceDashboard/images'
  }
};
