using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using System.Data;
using static HRMSWebAPI.Repository.SeparationRequestRepository;

namespace HRMSWebAPI.Repository
{
    public class SeparationRequestRepository : ISeparationRequestRepository
    {
        

        public async Task<(bool IsSuccess, string Message)> InsertSeparationRequest(SeparationRequestMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", model.fk_empid);
            dynamicParameters.Add("@fk_finid", model.fk_finid);
            dynamicParameters.Add("@reqdate", model.resignationDate);
            dynamicParameters.Add("@reqType", model.reason);
            dynamicParameters.Add("@reqReason", model.remarks);
            dynamicParameters.Add("@eDateofrelieving", model.expectedLWD);
            dynamicParameters.Add("@noticePeriod", model.noticePeriod);
            dynamicParameters.Add("@IsNoticePeriodServed", model.isNoticePeriodServed);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@pk_seprequestId",
                dbType: DbType.Int64,
                direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "FFS_Separation_Request_Mst_Ins",
                dynamicParameters,
                "Insert Separation Request");

            return (
                dynamicParameters.Get<bool>("@IsSuccessfull"),
                dynamicParameters.Get<string>("@Message")
            );
        }
        public async Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAll(string empId,int pageIndex,int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", empId);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            var result = DataBaseFactory
                .QuerySP<SeparationRequestMst>(
                    "FFS_Separation_Request_Mst_SelforGrid",
                    dynamicParameters,
                    "Get All Separation Requests")
                .ToList();

            return (result.Count, result);
        }

        public async Task<SeparationRequestMst> GetById(long pk_seprequestId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_seprequestId", pk_seprequestId);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            return DataBaseFactory
                .QuerySP<SeparationRequestMst>(
                    "FFS_Separation_Request_Mst_Edit",
                    dynamicParameters,
                    "Get Separation Request By Id")
                .FirstOrDefault();
        }

        public async Task<bool> UpdateSeparationRequest(SeparationRequestMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_seprequestId", model.PkSepRequestId);
            dynamicParameters.Add("@reqdate", model.resignationDate);
            dynamicParameters.Add("@reqType", model.reason);
            dynamicParameters.Add("@reqReason", model.remarks);
            dynamicParameters.Add("@eDateofrelieving", model.expectedLWD);
            dynamicParameters.Add("@noticePeriod", model.noticePeriod);
            dynamicParameters.Add("@IsNoticePeriodServed", model.isNoticePeriodServed);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "FFS_Separation_Request_Mst_Upd",
                dynamicParameters,
                "Update Separation Request");

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }

        public async Task<bool> DeleteSeparationRequest(long pk_seprequestId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_seprequestId", pk_seprequestId);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "FFS_Separation_Request_Mst_Del",
                dynamicParameters,
                "Delete Separation Request");

            return dynamicParameters.Get<bool>("@IsSuccessfull");
        }


        public async Task<int> GetNoticePeriod(string empId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", empId);

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            var result = DataBaseFactory.QuerySP<dynamic>(
                "SAL_Employee_NoticePeriod",
                dynamicParameters,
                "Get Notice Period");

            if (result != null && result.Any())
            {
                return Convert.ToInt32(result.First().NoticePeriod);
            }

            return 0;
        }



        public async Task<(bool IsSuccess, string Message)> ApproveResignation(
    SeparationRequestMst model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add(
                "@pk_seprequestId",
                model.PkSepRequestId);

            dynamicParameters.Add(
                "@Status",
                model.status);

            dynamicParameters.Add(
                "@ApprovalRemarks",
                model.ApprovalRemarks);

            dynamicParameters.Add(
                "@ApprovedBy",
                model.ApprovedBy);

            dynamicParameters.Add(
                "@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add(
                "@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "FFS_Separation_Request_Approval_Upd",
                dynamicParameters,
                "Approve Resignation");

            return
            (
                dynamicParameters.Get<bool>("@IsSuccessfull"),
                dynamicParameters.Get<string>("@Message")
            );
        }


        public async Task<(int totalCount, IEnumerable<SeparationRequestMst>)>
    GetApprovalList(string hodId)
        {
            DynamicParameters dynamicParameters =
                new DynamicParameters();

            dynamicParameters.Add(
                "@LoggedInHODId",
                hodId);

            dynamicParameters.Add(
                "@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add(
                "@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            var result =
                DataBaseFactory
                .QuerySP<SeparationRequestMst>(
                    "FFS_Separation_Request_Approval_List",
                    dynamicParameters,
                    "Get Approval List")
                .ToList();

            return (result.Count, result);
        }


        public async Task<SeparationRequestMst> GetReport(long pk_seprequestId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add(
                "@pk_seprequestId",
                pk_seprequestId);

            dynamicParameters.Add(
                "@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add(
                "@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            return DataBaseFactory
                .QuerySP<SeparationRequestMst>(
                    "FFS_Separation_Request_Mst_Report",
                    dynamicParameters,
                    "Get Resignation Report")
                .FirstOrDefault();
        }


        public async Task<(bool IsSuccess, string Message)> WithdrawResignation(
    SeparationRequestMst model)
        {
            DynamicParameters dynamicParameters =
                new DynamicParameters();

            dynamicParameters.Add(
                "@pk_seprequestId",
                model.PkSepRequestId);

            dynamicParameters.Add(
                "@WithdrawalRemarks",
                model.WithdrawalRemarks);

            dynamicParameters.Add(
                "@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add(
                "@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            DataBaseFactory.QuerySP(
                "FFS_Separation_Request_Withdraw_Upd",
                dynamicParameters,
                "Withdraw Resignation");

            return
            (
                dynamicParameters.Get<bool>("@IsSuccessfull"),
                dynamicParameters.Get<string>("@Message")
            );
        }


        public async Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAdminList(int pageIndex,
    int pageSize,
    string searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex);
            dynamicParameters.Add("@pagesize", pageSize);
            dynamicParameters.Add("@searchTerm", string.IsNullOrEmpty(searchTerm) ? null : searchTerm);

            dynamicParameters.Add("@IsSuccessfull",dbType: DbType.Boolean,direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",dbType: DbType.String,size: 255,direction: ParameterDirection.Output);

            //var result =
            //    DataBaseFactory
            //    .QuerySP<SeparationRequestMst>(
            //        "FFS_Separation_Request_Admin_List",
            //        dynamicParameters,
            //        "Get Admin Resignation List")
            //    .ToList();

            //return (result.Count, result);
                var result = DataBaseFactory
                        .QuerySP<SeparationRequestMst>(
                            "FFS_Separation_Request_Admin_List",
                            dynamicParameters,
                            "Get Admin Resignation List")
                        .ToList();

            int totalCount = result.Any() ? result.First().TotalCount : 0;

            return (totalCount, result);
       }

        public async Task<(int totalCount, IEnumerable<SeparationRequestMst>)> GetAdminReportList(int pageIndex,
    int pageSize,
    string searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex);
            dynamicParameters.Add("@pagesize", pageSize);
            dynamicParameters.Add("@searchTerm", string.IsNullOrEmpty(searchTerm) ? null : searchTerm);

            dynamicParameters.Add("@IsSuccessfull",dbType: DbType.Boolean,direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",dbType: DbType.String,size: 255,direction: ParameterDirection.Output);

            var result = DataBaseFactory
                    .QuerySP<SeparationRequestMst>(
                        "FFS_Separation_Request_Admin_Report_List",
                        dynamicParameters,
                        "Get Admin Resignation Report List")
                    .ToList();

            int totalCount = result.Any() ? result.First().TotalCount : 0;

            return (totalCount, result);
       }

        public async Task<(int totalCount, IEnumerable<dynamic>)> GetAdminExitReportList(int pageIndex,
    int pageSize,
    string searchTerm)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", pageIndex);
            dynamicParameters.Add("@pagesize", pageSize);
            dynamicParameters.Add("@searchTerm", string.IsNullOrEmpty(searchTerm) ? null : searchTerm);

            dynamicParameters.Add("@IsSuccessfull",dbType: DbType.Boolean,direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",dbType: DbType.String,size: 255,direction: ParameterDirection.Output);

            var result = DataBaseFactory
                    .QuerySP<dynamic>(
                        "FFS_Separation_Request_Admin_ExitReport_List",
                        dynamicParameters,
                        "Get Admin Resignation ExitReport List")
                    .ToList();

            int totalCount = result.Any() ? Convert.ToInt32(result.First().TotalCount) : 0;

            return (totalCount, result);
       }

         public async Task<SeparationRequestMst> GetLetterData(long id)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                dynamicParameters.Add("@Id", id);

                dynamicParameters.Add("@IsSuccessfull",
                    dbType: DbType.Boolean,
                    direction: ParameterDirection.Output);

                dynamicParameters.Add("@Message",
                    dbType: DbType.String,
                    size: 255,
                    direction: ParameterDirection.Output);


                return DataBaseFactory.QuerySP<SeparationRequestMst>("FFS_Separation_Request_Mst_GetLetterData",
                            dynamicParameters,
                            "Get Letter Data")
                        .FirstOrDefault();
            }
            catch (Exception ex)
            {
                return new SeparationRequestMst
                {
                    IsSuccessfull = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<byte[]> DownloadRelievingLetter(long id)
        {
            var report = await GetLetterData(id);

            if (report == null)
                return Array.Empty<byte>();

            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4, 40, 40, 30, 30);

                PdfWriter.GetInstance(document, ms);

                document.Open();

                //==========================
                // Fonts
                //==========================

                Font companyFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                Font addressFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);

                Font headingFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);

                Font normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);

                Font boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);

                //=========================================
                // Company Logo + Name
                //=========================================

                // Use your existing helper methods here
                //
                // Example:
                //
                // string logo = await GetCompanyLogo(httpContext);
                // PdfPTable header = BuildCompanyHeader(...);
                // document.Add(header);

                Paragraph company = new Paragraph(report.CompanyName ?? "", companyFont);
                company.Alignment = Element.ALIGN_CENTER;

                document.Add(company);
                Font addressFont2 = FontFactory.GetFont(
FontFactory.HELVETICA_BOLD,
10,
BaseColor.BLACK
);

                Paragraph address = new Paragraph(report.CompanyAddress ?? "", addressFont2);
                address.Alignment = Element.ALIGN_CENTER;

                document.Add(address);
                
                document.Add(new Paragraph(" "));

                LineSeparator line = new LineSeparator();
                document.Add(new Chunk(line));

                document.Add(new Paragraph(" "));

                //=========================================
                // Date + Ref No
                //=========================================

                PdfPTable dateTable = new PdfPTable(2);
                dateTable.WidthPercentage = 100;

                dateTable.SetWidths(new float[] { 50, 50 });

                PdfPCell left =
                    new PdfPCell(
                        new Phrase(
                            "Date: " +
                            DateTime.Now.ToString("dd-MMM-yyyy"),
                            boldFont));

                left.Border = Rectangle.NO_BORDER;

                PdfPCell right =
                    new PdfPCell(
                        new Phrase(
                            $"Ref No: RL/{report.EmployeeCode}/{DateTime.Now.Year}",
                            boldFont));

                right.HorizontalAlignment = Element.ALIGN_RIGHT;

                right.Border = Rectangle.NO_BORDER;

                dateTable.AddCell(left);
                dateTable.AddCell(right);

                document.Add(dateTable);

                document.Add(new Paragraph(" "));

                //=========================================
                // To
                //=========================================

                document.Add(new Paragraph("To,", normalFont));

                document.Add(
                    new Paragraph(
                        report.EmployeeName ?? "",
                        boldFont));

                document.Add(
                    new Paragraph(
                        $"{report.Designation} — {report.Department}",
                        normalFont));

                document.Add(new Paragraph(" "));

                //=========================================
                // Subject
                //=========================================

                document.Add(
                    new Paragraph(
                        "Subject: Relieving Letter",
                        boldFont));

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                //=========================================
                // Body
                //=========================================

                document.Add(
                    new Paragraph(
                        $"Dear {report.EmployeeName},",
                        normalFont));

                document.Add(new Paragraph(" "));

                Paragraph p1 =
                    new Paragraph();

                p1.Add(
                    new Chunk(
                        "This is to certify that ",
                        normalFont));

                p1.Add(
                    new Chunk(
                        report.EmployeeName,
                        boldFont));

                p1.Add(
                    new Chunk(
                        $" (Employee Code: {report.EmployeeCode}) has been employed with ",
                        normalFont));

                p1.Add(
                    new Chunk(
                        report.CompanyName,
                        boldFont));

                p1.Add(
                    new Chunk(
                        $" as ",
                        normalFont));

                p1.Add(
                    new Chunk(
                        report.Designation,
                        boldFont));

                p1.Add(
                    new Chunk(
                        $" in the ",
                        normalFont));

                p1.Add(
                    new Chunk(
                        report.Department,
                        boldFont));

                p1.Add(
                    new Chunk(
                        $" department from {report.DateOfJoining:dd-MMM-yyyy} to {report.expectedLWD:dd-MMM-yyyy}.",
                        normalFont));

                document.Add(p1);

                document.Add(new Paragraph(" "));

                Paragraph p2 =
                    new Paragraph(
                        $"We confirm that {report.EmployeeName} has been relieved from services w.e.f. {report.expectedLWD:dd-MMM-yyyy} after completing all exit formalities.",
                        normalFont);

                document.Add(p2);

                document.Add(new Paragraph(" "));

                Paragraph p3 =
                    new Paragraph(
                        $"During their tenure, {report.EmployeeName} demonstrated dedication and professionalism. We appreciate their contribution and wish them success in future endeavours.",
                        normalFont);

                document.Add(p3);

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                //=========================================
                // Signature
                //=========================================

                document.Add(
                    new Paragraph(
                        $"For {report.CompanyName},",
                        boldFont));

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                document.Add(
                    new Paragraph(
                        "Authorized Signatory",
                        boldFont));

                document.Add(
                    new Paragraph(
                        "HR Department",
                        normalFont));

                document.Close();

                return ms.ToArray();
            }
        }

        public async Task<byte[]> DownloadExperienceLetter(long id)
        {
            var report = await GetLetterData(id);

            if (report == null)
                return Array.Empty<byte>();

            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4, 40, 40, 30, 30);

                PdfWriter.GetInstance(document, ms);

                document.Open();

                //==========================
                // Fonts
                //==========================

                Font companyFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                //Font addressFont = FontFactory.GetFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
                Font addressFont = FontFactory.GetFont(
       FontFactory.HELVETICA_BOLD,
       10,
       BaseColor.BLACK
   );

                Font headingFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                Font normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);
                Font boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);

                //=========================================
                // Company Header
                //=========================================

                // Use your existing Logo/Header helper here

                Paragraph company = new Paragraph(report.CompanyName ?? "", companyFont);
                company.Alignment = Element.ALIGN_CENTER;
                document.Add(company);

                //Paragraph address = new Paragraph(report.CompanyAddress ?? "", addressFont);
                //address.Alignment = Element.ALIGN_CENTER;
                //document.Add(address);

   

                Paragraph address = new Paragraph(report.CompanyAddress ?? "", addressFont);
                address.Alignment = Element.ALIGN_CENTER;

               

                document.Add(address);

                document.Add(new Paragraph(" "));

                LineSeparator line = new LineSeparator();
                document.Add(new Chunk(line));

                document.Add(new Paragraph(" "));

                //=========================================
                // Date + Ref No
                //=========================================

                PdfPTable dateTable = new PdfPTable(2);
                dateTable.WidthPercentage = 100;
                dateTable.SetWidths(new float[] { 50, 50 });

                PdfPCell left = new PdfPCell(
                    new Phrase(
                        "Date: " + DateTime.Now.ToString("dd-MMM-yyyy"),
                        boldFont));

                left.Border = Rectangle.NO_BORDER;

                PdfPCell right = new PdfPCell(
                    new Phrase(
                        $"Ref No: EL/{report.EmployeeCode}/{DateTime.Now.Year}",
                        boldFont));

                right.Border = Rectangle.NO_BORDER;
                right.HorizontalAlignment = Element.ALIGN_RIGHT;

                dateTable.AddCell(left);
                dateTable.AddCell(right);

                document.Add(dateTable);

                document.Add(new Paragraph(" "));

                //=========================================
                // Subject
                //=========================================

                document.Add(
                    new Paragraph(
                        "Subject: Experience Certificate",
                        boldFont));

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                //=========================================
                // Body
                //=========================================

                document.Add(
                    new Paragraph(
                        "To Whom It May Concern,",
                        normalFont));

                document.Add(new Paragraph(" "));

                Paragraph p1 = new Paragraph();

                p1.Add(new Chunk("This is to certify that ", normalFont));

                p1.Add(new Chunk(report.EmployeeName, boldFont));

                p1.Add(new Chunk(
                    $" (Employee Code: {report.EmployeeCode}) was employed with ",
                    normalFont));

                p1.Add(new Chunk(report.CompanyName, boldFont));

                p1.Add(new Chunk(" as ", normalFont));

                p1.Add(new Chunk(report.Designation, boldFont));

                p1.Add(new Chunk(" in the ", normalFont));

                p1.Add(new Chunk(report.Department, boldFont));

                p1.Add(new Chunk(
                    $" department from {report.DateOfJoining:dd-MMM-yyyy} to {report.expectedLWD:dd-MMM-yyyy}.",
                    normalFont));

                document.Add(p1);

                document.Add(new Paragraph(" "));

                Paragraph p2 = new Paragraph(
                    "During the period of employment, the employee performed the assigned responsibilities diligently, demonstrated professionalism, and maintained good conduct throughout the tenure.",
                    normalFont);

                document.Add(p2);

                document.Add(new Paragraph(" "));

                Paragraph p3 = new Paragraph(
                    $"We wish {report.EmployeeName} every success in future endeavours.",
                    normalFont);

                document.Add(p3);

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                //=========================================
                // Signature
                //=========================================

                document.Add(
                    new Paragraph(
                        $"For {report.CompanyName},",
                        boldFont));

                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));

                document.Add(
                    new Paragraph(
                        "Authorized Signatory",
                        boldFont));

                document.Add(
                    new Paragraph(
                        "HR Department",
                        normalFont));

                document.Close();

                return ms.ToArray();
            }
        }


        public async Task<(SeparationRequestAdminCount Data, bool IsSuccess, string Message)> GetDashboardCount()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@IsSuccessfull",
                dbType: DbType.Boolean,
                direction: ParameterDirection.Output);

            dynamicParameters.Add("@Message",
                dbType: DbType.String,
                size: 255,
                direction: ParameterDirection.Output);

            var data = DataBaseFactory
                .QuerySP<SeparationRequestAdminCount>(
                    "FFS_Separation_Request_Admin_Count",
                    dynamicParameters,
                    "Get Dashboard Count")
                .FirstOrDefault();

            return
            (
                data ?? new SeparationRequestAdminCount(),
                dynamicParameters.Get<bool>("@IsSuccessfull"),
                dynamicParameters.Get<string>("@Message")
            );
        }


    }
}