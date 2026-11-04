using HRBook.Repository;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Hubs;
using HRMSWebAPI.Middleware;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using HRMSWebAPI.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.OpenApi.Models;
using Microsoft.Win32;
using Syncfusion.Licensing;
using ConnectionString = HRMSWebAPI.Helper.ConnectionString;

SyncfusionLicenseProvider.RegisterLicense("NxYtFisQPR08Cit/Vkd+XU9FcVRDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS3tSdkVlWXtecHBWR2hbUk91Xg==");
var builder = WebApplication.CreateBuilder(args);

//Set Dapper to match underscores to PascalCase
Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;


// Load JWT settings from appsettings.json
var jwtSettingsSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtSettings>(jwtSettingsSection);

builder.Services.AddHttpClient();

// Add services to the container
//builder.Services.AddControllers();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelAttribute>(); // Add your custom validation attribute
}).ConfigureApiBehaviorOptions(options =>
{
    options.SuppressModelStateInvalidFilter = true; // Disable automatic model validation
}).AddJsonOptions(options =>
{
  
  

    options.JsonSerializerOptions.Converters.Add(new DynamicStringConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicBoolConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicIntConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicLongConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicFloatConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicByteConverter());
    options.JsonSerializerOptions.Converters.Add(new DynamicShortConverter());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddSwaggerGen(c =>
{
    c.SchemaFilter<SwaggerIgnoreFilter>();
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRMS WebAPI", Version = "v1" });

    // Define the Bearer token scheme globally
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });



    // Optional: Use custom filters for controlling which endpoints require Authorization
    c.OperationFilter<AuthorizeCheckOperationFilter>();
});

// Bind AppSettings section from appsettings.json
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));

// Register the FileService
builder.Services.AddScoped<FileService>();

builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<EncryptionHelper>();

// Add SignalR Services
builder.Services.AddSignalR();

builder.Services.AddScoped<IRequestLogRepository, RequestLogRepository>();
builder.Services.AddScoped<ITaskManagerRepository, TaskManagerRepository>();
builder.Services.AddHostedService<RecurringTaskHostedService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBankRepository, BankRepository>();
builder.Services.AddScoped<IGeneralRepository, GeneralRepository>();
builder.Services.AddScoped<ICTCConfigRepository, CTCConfigRepository>();

builder.Services.AddScoped<IDepartmentMasterRepository, DepartmentMasterRepository>();
builder.Services.AddScoped<IDesignationRepository,DesignationRepository>();
builder.Services.AddScoped<IZoneRepository, ZoneRepository>();
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<ICityRepository, CityRepository>();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<INatureRepository, NatureRepository>();
builder.Services.AddScoped<ILWFSlabRepository, LWFSlabRepository>();
builder.Services.AddScoped<ILocalTravelRepository, LocalTravelRepository>();

builder.Services.AddScoped<IClientMasterRepository, ClientMasterRepository>();
builder.Services.AddScoped<IDailyAttendanceRepository, DailyAttendanceRepository>();
builder.Services.AddScoped<ISeparationRequestRepository, SeparationRequestRepository>();
builder.Services.AddScoped<IExitInterviewRepository, ExitInterviewRepository>();
builder.Services.AddScoped<INoDueDeclarationRepository, NoDueDeclarationRepository>();
builder.Services.AddScoped<IDueClearanceRepository, DueClearanceRepository>();
builder.Services.AddScoped<IExitDashboardRepository, ExitDashboardRepository>();
builder.Services.AddScoped<IVendorReportRepository, VendorReportRepository>();
builder.Services.AddScoped<ILocationReportRepository, LocationReportRepository>();
builder.Services.AddScoped<IJobReportRepository, JobReportRepository>();
builder.Services.AddScoped<IMrfReportRepository, MrfReportRepository>();
builder.Services.AddScoped<ICandidateReportRepository, CandidateReportRepository>();


builder.Services.AddScoped<ILevelRepository, LevelRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IOperationalDivisionRepository, OperationalDivisionRepository>();
builder.Services.AddScoped<IReligionRepository, ReligionRepository>();
builder.Services.AddScoped<IStateRepository, StateRepository>();

builder.Services.AddScoped<IWeeklyOffRepository, WeeklyOffRepository>();
builder.Services.AddScoped<IWeeklyOffRepository, WeeklyOffRepository>();
builder.Services.AddScoped<IHolidayRepository, HolidayRepository>();
builder.Services.AddScoped<IGradeRepository, GradeRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IExperienceDetailsRepository,ExperienceDetailsRepository>();
builder.Services.AddScoped <IQualificationDetailsRepository, QualificationDetailsRepository>();

builder.Services.AddScoped <IleaveAssignmentRepository, leaveAssignmentRepository>();
builder.Services.AddScoped <IPerquisiteRepository,PerquisiteRepository>();
builder.Services.AddScoped <IRestric_HolidayRepository,Restric_HolidayRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();


builder.Services.AddScoped<IChannelRepository, ChannelRepository>();

builder.Services.AddScoped<OnboardingEmailService>();
builder.Services.AddScoped<EmailGatewayService>();



builder.Services.AddScoped<IHeadRepository, HeadRepository>();
builder.Services.AddScoped<IProfessionalTaxSlabRepository, ProfessionalTaxSlabRepository>();
builder.Services.AddScoped<IDeductionSlabRepository, DeductionSlabRepository>();
builder.Services.AddScoped<IEmployeeMobileRepository, EmployeeMobileRepository>();
builder.Services.AddScoped<IEmployeeEmailRepository, EmployeeEmailRepository>();
builder.Services.AddScoped<IEmployeeDebitCardRepository, EmployeeDebitCardRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();

builder.Services.AddScoped<IWeeklyOffRepository, WeeklyOffRepository>();
builder.Services.AddScoped<IEmpWeekOffRepository, EmpWeekOffRepository>();
builder.Services.AddScoped<ISubSectionRepository, SubSectionRepository>();
builder.Services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();
builder.Services.AddScoped<IDealerOutletRepository, DealerOutletRepository>(); //addded code
builder.Services.AddScoped<IBranchRepositorycs, BranchRepository>(); //addded code
builder.Services.AddScoped<IAttendanceDashboardRepository, AttendanceDashboardRepository>();
builder.Services.AddScoped<IleaveTypeClientRepository, leaveTypeClientRepository>(); //addded code

builder.Services.AddScoped<IDemographicRepository, DemographicRepository>();

builder.Services.AddScoped<IOtpRepository,OtpRepository>();
builder.Services.AddScoped<IEmployeeOtherIncomeRepository,EmployeeOtherIncomeRepository>();
builder.Services.AddScoped<IPerquisiteAssignmentRepository, PerquisiteAssignmentRepository>();
builder.Services.AddScoped<IReimDocStatusRepository, ReimDocStatusRepository>();
builder.Services.AddScoped<ISectionDocRepository, SectionDocRepository>();
builder.Services.AddScoped<IFunctionalRepository, FunctionalRepository>();

builder.Services.AddScoped<ILeaveTransactionRepository, LeaveTransactionRepository>();
builder.Services.AddScoped<IEmployeeRentDetailRepository, EmployeeRentDetailRepository>();
builder.Services.AddScoped<IEmployeeMstRepository, EmployeeMstRepository>();
builder.Services.AddScoped<IManualRepository, ManualRepository>();

builder.Services.AddScoped<ISalaryPayoutRepository, SalaryPayoutRepository>();

builder.Services.AddScoped<IApprovalSectionDocRepository,ApprovalSectionDocRepository>();

builder.Services.AddScoped<ITaxDeductorRepository, TaxDeductorRepository>();

builder.Services.AddScoped<ILoanAllotmentRepository, LoanAllotmentRepository>();

builder.Services.AddScoped<ILoanTransactionRepository,LoanTransactionRepository>();



builder.Services.AddScoped<ILeaveEncashmentRepository, LeaveEncashmentRepository>();
builder.Services.AddScoped<IAttendanceAdjustmentRepository, AttendanceAdjustmentRepository>();
builder.Services.AddScoped<IStopSalaryRepository, StopSalaryRepository>();

builder.Services.AddScoped<IMonthlySalSlipRepository, MonthlySalSlipRepository>();
builder.Services.AddScoped<IHeadAssignRepository, HeadAssignRepository>();
builder.Services.AddScoped<ICompanyConfigRepository, CompanyConfigRepository>();

builder.Services.AddScoped<IManualIncomeTaxRepository, ManualIncomeTaxRepository>();
builder.Services.AddScoped<ITaxConfigRepository, TaxConfigRepository>();
builder.Services.AddScoped<ILeaveConfigRepository, LeaveConfigRepository>();
builder.Services.AddScoped<IEmailConfigRepository, EmailConfigRepository>();

builder.Services.AddScoped<ISalaryLockUnlockRepository, SalaryLockUnlockRepository>();
builder.Services.AddScoped<ICommonLocationRepository, CommonLocationRepository>();
builder.Services.AddScoped<IUserMasterRepository, UserMasterRepository>();
builder.Services.AddScoped<IOfficeTypeMasterRepository, OfficeTypeMasterRepository>();
builder.Services.AddScoped<IExportReportRepository, ExportReportRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();

builder.Services.AddScoped<IFinancialYearRepository, FinancialYearRepository>();

builder.Services.AddScoped<IImportExcleRepository, ImportExcleRepository>();
builder.Services.AddScoped<IOrganizationChartRepository, OrganizationChartRepository>();

builder.Services.AddScoped<IRoleMastersRepository, RoleMastersRepository>();
builder.Services.AddScoped<ISubDepartmentRepository, SubDepartmentRepository>();

builder.Services.AddScoped<IDocumentUploadRepository, DocumentUploadRepository>();

builder.Services.AddScoped<ICostRepository, CostRepository>();
builder.Services.AddScoped<IleaveAccrualRepository, leaveAccrualRepository>();


builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<EmailService>();


builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<ISkipAttributeRepository, SkipAttributeRepository>();
builder.Services.AddScoped<ICardAppreciatorRepository, CardAppreciatorRepository>();
builder.Services.AddScoped<IEmployeeKRAPLIRepository, EmployeeKRAPLIRepository>();

builder.Services.AddScoped<IAccidentDetailsRepository, AccidentDetailsRepository>();
builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
builder.Services.AddScoped<IExternalCandidateRepository, ExternalCandidateRepository>();

builder.Services.AddScoped<IExternalMemberRepository, ExternalMemberRepository>();
builder.Services.AddScoped<IRecruitModeRepository, RecruitModeRepository>();
builder.Services.AddScoped<IScreeningCommitteeRepository, ScreeningCommitteeRepository>();

builder.Services.AddScoped<ILanguageMasterRepository, LanguageMasterRepository>();

builder.Services.AddScoped<IScreeningAppRepository, ScreeningAppRepository>();
builder.Services.AddScoped<ICandidateMasterRepository, CandidateMasterRepository>();

builder.Services.AddScoped<INewjobRepository, NewjobRepository>();
builder.Services.AddScoped<ICandidateSalaryRepository, CandidateSalaryRepository>();
builder.Services.AddScoped<IInterviewEvaluationRepository, InterviewEvaluationRepository>();




builder.Services.AddScoped<IAppreciationRepository, AppreciationRepository>();
builder.Services.AddScoped<IFreezingStatusRepository, FreezingStatusRepository>();
builder.Services.AddScoped<IHRComplaintRepository, HRComplaintRepository>();
builder.Services.AddScoped<IConfirmationEmailRepository, ConfirmationEmailRepository>();
builder.Services.AddScoped<IScheduleInterviewRepository, ScheduleInterviewRepository>();
builder.Services.AddScoped<INewsPaperRepository, NewsPaperRepository>();
builder.Services.AddScoped<IQualificationRepository, QualificationRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ISelectedCandidatesRepository, SelectedCandidatesRepository>();
builder.Services.AddScoped<ISpecializationRepository, SpecializationRepository>();
builder.Services.AddScoped<IKRARepository, KRARepository>();

builder.Services.AddScoped<ICandidateMedicalRepository, CandidateMedicalRepository>();
builder.Services.AddScoped<IEmp_LeaveRequestRepository, Emp_LeaveRequestRepository>();
builder.Services.AddScoped<IRestrictedHolidaysRepository, RestrictedHolidaysRepository>();
builder.Services.AddScoped<ICompOffRequestRepository, CompOffRequestRepository>();
builder.Services.AddScoped<ICompOffApprovalRepository, CompOffApprovalRepository>();
builder.Services.AddScoped<IRegulariseAttendanceRepository, RegulariseAttendanceRepository>();

builder.Services.AddScoped<IPrograssionDetailRepository, PrograssionDetailRepository>();
builder.Services.AddScoped<ICTCRepository, CTCRepository>();
builder.Services.AddScoped<IBehavioralAreaMasterRepository, BehavioralAreaMasterRepository>();
builder.Services.AddScoped<IReminderSetupRepository, ReminderSetupRepository>();
builder.Services.AddScoped<IHrLetterRepository, HrLetterRepository>();
builder.Services.AddScoped<IHrPolicyRepositoy, HrPolicyRepositoy>();
builder.Services.AddScoped<IAppraisalRepository, AppraisalRepository>();
builder.Services.AddScoped<IEmpKraImportRepository, EmpKraImportRepository>();
builder.Services.AddScoped<IRoleWiseKRAImportRepository, RoleWiseKRAImportRepository>();
builder.Services.AddScoped<ILodgingBoardingRepository, LodgingBoardingRepository>();
builder.Services.AddScoped<ITravelRateRepository, TravelRateRepository>();
builder.Services.AddScoped<IEmpwiseKraReportRepository, EmpwiseKraReportRepository>();
builder.Services.AddScoped<ITravelMasterRepository, TravelMasterRepository>();
builder.Services.AddScoped<IVisitorRepository, VisitorRepository>();
builder.Services.AddScoped<IRebateRepository, RebateRepository>();
builder.Services.AddScoped<ITravelModeMasterRepository, TravelModeMasterRepository>();
builder.Services.AddScoped<IRolewiseKRAReportRepository, RolewiseKRAReportRepository>();
builder.Services.AddScoped<IEmpAppraisalStatusRepository, EmpAppraisalStatusRepository>();
builder.Services.AddScoped<ISelfAssessmentReportRepository, SelfAssessmentReportRepository>();
builder.Services.AddScoped<IEMPFlexiSalaryRepository, EMPFlexiSalaryRepository>();
builder.Services.AddScoped<IFlexibillRepository, FlexibillRepository>();
builder.Services.AddScoped<IManPowerApproveRepository, ManPowerApproveRepository>();
builder.Services.AddScoped<IManpowerRepository, ManpowerRepository>();
builder.Services.AddScoped<ITrainingRatingRepository, TrainingRatingRepository>();
builder.Services.AddScoped<ITrainingTypeMasterRepository, TrainingTypeMasterRepository>();
builder.Services.AddScoped<ITrainingInstituteRepository, TrainingInstituteRepository>();
builder.Services.AddScoped<IPageRightsRepository, PageRightsRepository>();
builder.Services.AddScoped<ISalaryDashboardRepository, SalaryDashboardRepository>();
builder.Services.AddScoped<ILeaveDashReposoitory, LeaveDashReposoitory>();
builder.Services.AddScoped<IEmployeeProfileRepository, EmployeeProfileRepository>();
builder.Services.AddScoped<IDueClearanceRepository, DueClearanceRepository>();
builder.Services.AddScoped<IDueClaranceUserRepository, DueClaranceUserRepository>();
builder.Services.AddScoped<IExitFormAuthorityRepository, ExitFormAuthorityRepository>();
builder.Services.AddScoped<ITaxRegismRepository, TaxRegismRepository>();
builder.Services.AddScoped<IAttendanceConfigRepository, AttendanceConfigRepository>();
builder.Services.AddScoped<ITrainingPlanningRepository, TrainingPlanningRepository>();
builder.Services.AddScoped<ITNIRepository, TNIRepository>();
builder.Services.AddScoped<ITrainingProgramMasterRepository, TrainingProgramMasterRepository>();
builder.Services.AddScoped<ITrainingSubProgramRepository, TrainingSubProgramRepository>();
builder.Services.AddScoped<ITrainingCalendarRepository, TrainingCalendarRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventMstRepository, EventMstRepository>();

builder.Services.AddScoped<IHrchatRepository, HrchatRepository>();
builder.Services.AddScoped<IRecruitmentNotificationService, RecruitmentNotificationService>();

builder.Services.AddScoped<IGenerateLetterRepository, GenerateLetterRepository>();
builder.Services.AddScoped<ICandidateExperienceDetailsRepository, CandidateExperienceDetailsRepository>();//added code 
builder.Services.AddScoped<ICandidateQualificationRepository, CandidateQualificationRepository>(); //addded code
builder.Services.AddScoped<IFNFRepository, FNFRepository>(); //addded code
builder.Services.AddScoped<ILocationRepository, LocationRepository>();

builder.Services.AddScoped<IVendorRepository, VendorRepository>();
builder.Services.AddScoped<IAmazonDspBlockRateCardRepository, AmazonDspBlockRateCardRepository>();
builder.Services.AddScoped<ICommonRateCardRepository, CommonRateCardRepository>();
builder.Services.AddScoped<IShiftRosterRepository, ShiftRosterRepository>();
//cjdarcl vendor management starts
builder.Services.AddScoped<ICustomerRateCardRepository, CustomerRateCardRepository>();
builder.Services.AddScoped<IVendorServiceRepository, VendorServiceRepository>();
builder.Services.AddScoped<IVendorLiteRepository, VendorLiteRepository>();
builder.Services.AddScoped <ICustomerShiftRateBonusRepository, CustomerShiftRateBonusRepository>();
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IEmployeeServiceTypeMappingRepository, EmployeeServiceTypeMappingRepository>();
builder.Services.AddScoped<IUploadFileHistoryRepository, UploadFileHistoryRepository>();
builder.Services.AddScoped<IVendorEmployeeDocRepository, VendorEmployeeDocRepository>();
builder.Services.AddScoped<IAtsLifecycleRepository, AtsLifecycleRepository>();
builder.Services.AddScoped<IAtsJobRequisitionRepository, AtsJobRequisitionRepository>();


//cjdarcl vendor managemement ends




// Register the FileService
builder.Services.AddScoped<FileService>();

//added code LR starts 5dec 2025

builder.Services.AddScoped<OnboardingEmailService>();


//added code LR starts 5dec 2025 ends

builder.Services.AddScoped<IJobBoardIntegrationService, JobBoardIntegrationService>();
builder.Services.AddEndpointsApiExplorer();


// Initialize the ConnectionString class
ConnectionString.Initialize(builder.Configuration);

// Initialize the DataBaseFactory
DataBaseFactory.Initialize(builder.Configuration);

//HR Chat
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAll", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowCredentials().SetIsOriginAllowed(_ => true));
//});
//// ? CRITICAL: CORS configuration
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAngular", policy =>
//    {
//        policy.WithOrigins(
//            "http://localhost:4200",
//            "http://localhost:4201",
//            "http://localhost:4202"
//        )
//        .AllowAnyHeader()
//        .AllowAnyMethod()
//        .AllowCredentials(); // CRITICAL for SignalR
//    });
//});


// Define the policy name
const string SignalRCors = "SignalRCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(SignalRCors, policy =>
    {
        policy //.WithOrigins("http://localhost:4200", "http://10.1.16.5/hrbook") // Add your Angular production URL here too
              .SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});


var app = builder.Build();

//app.UseCors(option => option.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod().AllowCredentials());//always use cors before any middleware and jsut after app-build
// 1. Use the specific SignalR CORS policy instead of AllowAnyOrigin
app.UseCors(SignalRCors);

app.UseStaticFiles();
try
{
    var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
    if (!Directory.Exists(uploadsDir)) Directory.CreateDirectory(uploadsDir);
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsDir),
        RequestPath = "/Uploads"
    });
}
catch { }

// Initialize ConnectionString with IConfiguration
ConnectionString.Initialize(app.Configuration);

// Use the middleware
app.UseMiddleware<JsonExceptionHandlingMiddleware>();
app.UseMiddleware<RequestTrackingMiddleware>(); //added on 10oct2026
app.UseMiddleware<TokenValidationMiddleware>();
app.UseMiddleware<CandidateKeyValidationMiddleware>();

app.UseSwagger();
//app.UseSwaggerUI();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRMS WebAPI V1");
});
app.UseHttpsRedirection();
// ? CRITICAL: CORS must come BEFORE authentication
//app.UseCors("AllowAngular");


app.UseAuthorization();

app.MapControllers();

// 2. Map the SignalR Hub endpoint
app.MapHub<ChatHub>("/chatHub");
app.Run();
