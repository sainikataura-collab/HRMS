using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IExportReportRepository
    {
        Task<IEnumerable<dynamic>> ViewCanteenReportlistAsync(ReportModelRequest request);
        Task<IEnumerable<dynamic>> ViewLoanReportAsync(ReportModelRequest request);
        //Task<IEnumerable<dynamic>> ViewLeaveReportAsync(ReportModelRequest request);
        Task<(int totalCount, IEnumerable<dynamic>)> ViewLeaveReportAsync(ReportModelRequest request);

        Task<IEnumerable<dynamic>> ViewAttendanceReportAsync(ReportModelRequest request);
        //Task<IEnumerable<dynamic>> ViewSalaryReportAsync(ReportModelRequest request);

        Task<IEnumerable<dynamic>> GetPayrollADashboardAsync(string fk_monthId, string fk_yearId, string Userid);

        Task<(int totalCount, IEnumerable<dynamic>)> ViewSalaryReportAsync(ReportModelRequest request);



        Task<IEnumerable<dynamic>> DownloadMonthlySalarySlipAsync(ReportModelRequest request);
        Task<IEnumerable<dynamic>> DownloadMonthlySalarySlipforEmpAsync(string fk_empId, string fk_monthId, string fk_yearId, string fk_companyId);
        Task<(int totalCount, IEnumerable<dynamic> employees, IEnumerable<dynamic> company, IEnumerable<dynamic> head, IEnumerable<dynamic> Leavedetail)> DownloadMonthlySalarySlipforEmpTupleAsync(string fk_empId, string fk_monthId, string fk_yearId, string fk_companyId);


        Task<IEnumerable<dynamic>> ViewIncomeTaxReportAsync(ReportModelRequest request);
        // added new for pdf data 
        //public Task<(int totalCount, IEnumerable<dynamic>)> PDFdata(ReportModelRequest request);
        public Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFdata(ReportModelRequest request);

        public Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalaryRegisterdata(ReportModelRequest request, string fk_companyId);
        public Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalaryRegisterdataV2(ReportModelRequest request, string fk_companyId);


        // salry head

        public Task<IEnumerable<dynamic>> GetSalaryHeadShortDescActiveAsync();


        Task<(int totalCount, IEnumerable<dynamic>)> ViewEmployeeReportAsync(ReportModelRequest request);

        //ANJali
        //  public Task<IEnumerable<dynamic>> GetMusterRollForPdfAsync(string monthId, string yearId);
        public Task<(int totalCount, IEnumerable<dynamic>)> GetMusterRollForPdfAsync(ReportModelRequest request);
        //16 Jan
        // Task<(int totalCount, IEnumerable<dynamic> employees, IEnumerable<dynamic> company)> EqualRemuneration(ReportModelRequest request);
        public Task<(int totalCount, IEnumerable<dynamic>)> EqualRemuneration(ReportModelRequest request);



        // for company name 
        //Task<dynamic> GetCompanyNameAsync();
        public Task<dynamic> GetCompanyNameAsync(string fk_companyid);

        public Task<(dynamic header, IEnumerable<dynamic> contributions)> PFForm3(ReportModelRequest request);

        public Task<(int totalCount, IEnumerable<dynamic>)> ViewComplianceReportAsync(ReportModelRequest request);


        public Task<(int totalCount, IEnumerable<dynamic>)> GetOvertimeDataPdfAsync(ReportModelRequest request);






        //new add 

        Task<(int totalCount, IEnumerable<dynamic>)> ViewSalaryPayoutPdfAsync(ReportModelRequest request);


        public Task<(int totalCount, object totals, IEnumerable<dynamic>, object invoiceDetails)> ViewBillFormAsync(ReportModelRequest request);
        public Task<bool> SaveBillDataAsync(BillSaveRequest request);
        public Task<(int totalCount, IEnumerable<dynamic>)> GetBillGenerationListAsync(ReportModelRequest request);
        public Task<(int totalCount, IEnumerable<dynamic>)> GetBillGenerationEmployeeListAsync(ReportModelRequest request);
        public Task<IEnumerable<dynamic>> GetBillGenerationDetailAsync(string billId);
        public Task<(int totalCount, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>, IEnumerable<dynamic>)> PDFSalarySlip(ReportModelRequest request, string fk_companyId);



    }


}
