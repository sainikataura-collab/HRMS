using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.Data;
using System.Xml.Linq;

namespace HRMSWebAPI.Repository
{

    public class FNFRepository:IFNFRepository
    {
        CommonFunction commonFunction = new CommonFunction();

        public async Task<(int TotalCount1, int TotalCount2, IEnumerable<dynamic> PendingData, IEnumerable<dynamic> ProcessedData)>
fnflist(
    int pageIndex1, int pageSize1,
    int pageIndex2, int pageSize2,
    string empCode,
    string empCodeManual,
    string empName,
    List<string> selectedDepartments,
    string selectedDesignation,
    List<string> selectedLocations,
    string selectedNature,
    string selectedCity,
    string sortBy,
    string fkUserId,
    string empStatus,
    string searchTerm1,
    string searchTerm2)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // same xml-building helper your repo already uses for location/department lists
            var combinedXml = commonFunction.GetRecords(selectedLocations, selectedDepartments);

            dynamicParameters.Add("@pageindex1", (object)pageIndex1, DbType.Int32);
            dynamicParameters.Add("@pagesize1", (object)pageSize1, DbType.Int32);
            dynamicParameters.Add("@pageindex2", (object)pageIndex2, DbType.Int32);
            dynamicParameters.Add("@pagesize2", (object)pageSize2, DbType.Int32);
            dynamicParameters.Add("@empcode", (object)empCode ?? "", DbType.String);
            dynamicParameters.Add("@empcodemanual", (object)empCodeManual ?? "", DbType.String);
            dynamicParameters.Add("@empname", (object)empName ?? "", DbType.String);
            dynamicParameters.Add("@xmlDoc", (object)combinedXml, DbType.String);
            dynamicParameters.Add("@fk_designationid", (object)selectedDesignation ?? "", DbType.String);
            dynamicParameters.Add("@fk_nature", (object)selectedNature ?? "", DbType.String);
            dynamicParameters.Add("@fk_cityid", (object)selectedCity ?? "", DbType.String);
            dynamicParameters.Add("@shortby", (object)sortBy ?? "empcode", DbType.String);
            dynamicParameters.Add("@fk_userid", (object)fkUserId ?? "", DbType.String);
            dynamicParameters.Add("@EmpStatus", (object)empStatus ?? "B", DbType.String);
            dynamicParameters.Add("@searchTerm1", (object)searchTerm1, DbType.String);
            dynamicParameters.Add("@searchTerm2", (object)searchTerm2, DbType.String);

            // SP returns 4 result sets in this order:
            // Item1 = TotalCount1 (Pending), Item2 = Pending rows,
            // Item3 = TotalCount2 (Processed), Item4 = Processed rows
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic, dynamic, dynamic>(
                "FFS_FullnFinalSettlement_Mst_PendingDirect_SelforGrid", dynamicParameters, "GetAll");

            int totalCount1 = tuple.Item1 is IEnumerable<dynamic> list1 && list1.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list1.First()).Values.First())
                : 0;

            int totalCount2 = tuple.Item3 is IEnumerable<dynamic> list3 && list3.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)list3.First()).Values.First())
                : 0;

            dynamic pendingData = tuple.Item2?.ToList();
            dynamic processedData = tuple.Item4?.ToList();

            return (totalCount1, totalCount2, pendingData, processedData);
        }



        // aryan

        private readonly Font titleFont =
   FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);

        private readonly Font headingFont =
            FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);

        private readonly Font normalFont =
            FontFactory.GetFont(FontFactory.HELVETICA, 7);

        private readonly Font boldFont =
            FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7);

        private readonly Font tableHeaderFont =
            FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 7, BaseColor.WHITE);

        private readonly Font tableFont =
            FontFactory.GetFont(FontFactory.HELVETICA, 7);
        public async Task<dynamic> GetFullAndFinalSettlementData(string empId)
        {
            try
            {
                DynamicParameters parameters = new DynamicParameters();

                parameters.Add("@fk_empid", empId);

                var tuple = DataBaseFactory.QueryMultipleSP
                    <dynamic, dynamic, dynamic, dynamic, dynamic>
                (
                    "FFS_FullnFinalSettlement_Mst_Print",
                    parameters,
                    "Get Full And Final Settlement Data"
                );

                dynamic header = tuple.Item1.FirstOrDefault();

                var earnings = tuple.Item2.ToList();

                var deductions = tuple.Item3.ToList();

                var otherEarnings = tuple.Item4.ToList();

                var otherDeductions = tuple.Item5.ToList();

                return new
                {
                    Header = header,
                    Earnings = earnings,
                    Deductions = deductions,
                    OtherEarnings = otherEarnings,
                    OtherDeductions = otherDeductions
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    IsSuccessfull = false,
                    Message = ex.Message
                };
            }
        }

        public async Task<byte[]> DownloadPdf(string empId)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@fk_empid", empId);

            var tuple = DataBaseFactory.QueryMultipleSP
                <dynamic, dynamic, dynamic, dynamic, dynamic>
            (
                "FFS_FullnFinalSettlement_Mst_Print",
                parameters,
                "Download PDF"
            );

            dynamic header = tuple.Item1.FirstOrDefault();

            if (header == null)
            {
                throw new Exception("Header data is NULL.");
            }

            var earnings = tuple.Item2.ToList();

            var deductions = tuple.Item3.ToList();

            var otherEarnings = tuple.Item4.ToList();

            var otherDeductions = tuple.Item5.ToList();

            using MemoryStream ms = new MemoryStream();

            Document document = new Document(
                PageSize.A4,
                10,
                10,
                10,
                10);

            PdfWriter writer = PdfWriter.GetInstance(document, ms);
            writer.PageEvent = new PageBorderEvent();

            document.Open();

            AddCompanyHeader(document, header);

            AddEmployeeInformation(document, header);

            AddSalaryTable(document, earnings, deductions, header);

            AddOtherHeads(document, otherEarnings, otherDeductions, header);

            AddTotals(document, header);

            //AddAmountInWords(document, header);

            AddFooter(document);

            document.Close();

            return ms.ToArray();
        }

        public class PageBorderEvent : PdfPageEventHelper
        {
            public override void OnEndPage(PdfWriter writer, Document document)
            {
                PdfContentByte canvas = writer.DirectContentUnder;

                Rectangle rect = new Rectangle(
                    document.PageSize.Left + 10,
                    document.PageSize.Bottom + 10,
                    document.PageSize.Right - 10,
                    document.PageSize.Top - 10);

                rect.BorderColor = BaseColor.BLACK;
                rect.BorderWidth = 1.2f;
                rect.Border = Rectangle.BOX;

                canvas.Rectangle(rect);
            }
        }


        private PdfPCell Cell(
        string text,
        Font font,
        int alignment = Element.ALIGN_LEFT,
        BaseColor bg = null,
        bool bold = false)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text ?? "", font));

            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;

            // Border
            cell.Border = Rectangle.BOX;
            cell.BorderWidth = 0.8f;
            cell.BorderColor = BaseColor.BLACK;

            // Padding
            cell.PaddingTop = 4f;
            cell.PaddingBottom = 4f;
            cell.PaddingLeft = 5f;
            cell.PaddingRight = 5f;



            if (bg != null)
                cell.BackgroundColor = bg;

            return cell;
        }

        private void AddCompanyHeader(Document document, dynamic h)
        {
            Paragraph company =
                new Paragraph(
                    Convert.ToString(h.CompanyName),
                    titleFont);
            //        Paragraph company = new Paragraph(
            //"Shivalaya Construction Limited",
            //titleFont);

            company.Alignment = Element.ALIGN_CENTER;

            document.Add(company);

            Paragraph address =
                new Paragraph(
                    Convert.ToString(h.address1),
                    normalFont);
            //        Paragraph address = new Paragraph(
            //"137, Avtar Enclave, Paschim Vihar, New Delhi-110063",
            //normalFont);

            address.Alignment = Element.ALIGN_CENTER;

            document.Add(address);

            document.Add(new Paragraph(" "));

            Paragraph title =
                new Paragraph(
                    "FULL & FINAL SETTLEMENT",
                    headingFont);

            title.Alignment = Element.ALIGN_CENTER;

            document.Add(title);

            document.Add(new Paragraph(" "));
        }

        private void AddEmployeeInformation(Document document, dynamic h)
        {
            PdfPTable table = new PdfPTable(4);

            table.WidthPercentage = 100;

            table.SetWidths(new float[]
            {
        22,
        28,
        22,
        28
            });

            table.AddCell(Cell("Emp Code", boldFont));
            table.AddCell(Cell(Convert.ToString(h.empcode ?? ""), normalFont));

            table.AddCell(Cell("Total no. of days worked", boldFont));
            table.AddCell(Cell(Convert.ToString(h.totNoOfDaysWorked), normalFont));

            table.AddCell(Cell("Emp Name", boldFont));
            table.AddCell(Cell(Convert.ToString(h.empname), normalFont));

            table.AddCell(Cell("No. of days notice required", boldFont));
            table.AddCell(Cell(Convert.ToString(h.daysNoticeReq), normalFont));

            table.AddCell(Cell("Designation", boldFont));
            table.AddCell(Cell(Convert.ToString(h.designation), normalFont));

            table.AddCell(Cell("No. of days notice given", boldFont));
            table.AddCell(Cell(Convert.ToString(h.daysNoticeGiven), normalFont));

            table.AddCell(Cell("Department", boldFont));
            table.AddCell(Cell(Convert.ToString(h.department), normalFont));

            table.AddCell(Cell("No. of days shortfall", boldFont));
            table.AddCell(Cell(Convert.ToString(h.daysShortfallNotice), normalFont));

            table.AddCell(Cell("Grade", boldFont));
            table.AddCell(Cell(Convert.ToString(h.classname), normalFont));

            table.AddCell(Cell("Shortfall adjusted", boldFont));
            table.AddCell(Cell(Convert.ToString(h.shortfallAdjusted), normalFont));

            table.AddCell(Cell("Location", boldFont));
            table.AddCell(Cell(Convert.ToString(h.locname), normalFont));

            table.AddCell(Cell("Notice recovery days", boldFont));
            table.AddCell(Cell(Convert.ToString(h.noticerecoverydays), normalFont));

            table.AddCell(Cell("DOJ", boldFont));
            table.AddCell(Cell(Convert.ToString(h.dateofjoining), normalFont));

            table.AddCell(Cell("No. of days worked in month", boldFont));
            table.AddCell(Cell(Convert.ToString(h.noOfDaysWorkdInMonth), normalFont));

            table.AddCell(Cell("Left Date", boldFont));
            table.AddCell(Cell(Convert.ToString(h.leftdate), normalFont));

            table.AddCell(Cell("Leave available", boldFont));
            table.AddCell(Cell(Convert.ToString(h.balAnnualLeaveTot), normalFont));

            document.Add(table);

            document.Add(new Paragraph(" "));
        }

        private void AddSalaryTable(
    Document document,
    List<dynamic> earnings,
    List<dynamic> deductions,
    dynamic h)
        {
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.WidthPercentage = 100;
            mainTable.SetWidths(new float[] { 50, 50 });

            mainTable.AddCell(CreateEarningTable(earnings, h));
            mainTable.AddCell(CreateDeductionTable(deductions, h));

            document.Add(mainTable);

            document.Add(new Paragraph(" "));
        }

        private PdfPCell CreateEarningTable(List<dynamic> earnings, dynamic h)
        {
            PdfPTable table = new PdfPTable(4);

            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 10, 45, 20, 25 });

            PdfPCell heading = new PdfPCell(new Phrase("Earning Heads", tableHeaderFont));
            heading.Colspan = 4;
            heading.BackgroundColor = BaseColor.DARK_GRAY;
            heading.HorizontalAlignment = Element.ALIGN_CENTER;
            heading.Padding = 5;

            table.AddCell(heading);

            table.AddCell(Cell("S.No", boldFont, Element.ALIGN_CENTER));
            table.AddCell(Cell("Head Name", boldFont));
            table.AddCell(Cell("Rate", boldFont, Element.ALIGN_RIGHT));
            table.AddCell(Cell("Amount", boldFont, Element.ALIGN_RIGHT));

            foreach (var item in earnings)
            {
                table.AddCell(Cell(item.sno.ToString(), tableFont, Element.ALIGN_CENTER));
                table.AddCell(Cell(item.headName.ToString(), tableFont));
                table.AddCell(Cell(
                    Convert.ToDecimal(item.Rate_amount).ToString("N2"),
                    tableFont,
                    Element.ALIGN_RIGHT));

                table.AddCell(Cell(
                    Convert.ToDecimal(item.amount).ToString("N2"),
                    tableFont,
                    Element.ALIGN_RIGHT));
            }

            PdfPCell totalText = Cell("Total Salary Earnings", boldFont);
            totalText.Colspan = 3;

            table.AddCell(totalText);

            table.AddCell(Cell(
                Convert.ToDecimal(h.totEarnings).ToString("N2"),
                boldFont,
                Element.ALIGN_RIGHT));

            return new PdfPCell(table)
            {
                Padding = 0
            };
        }

        private PdfPCell CreateDeductionTable(List<dynamic> deductions, dynamic h)
        {
            PdfPTable table = new PdfPTable(3);

            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 10, 60, 30 });

            PdfPCell heading = new PdfPCell(new Phrase("Deduction Heads", tableHeaderFont));
            heading.Colspan = 3;
            heading.BackgroundColor = BaseColor.DARK_GRAY;
            heading.HorizontalAlignment = Element.ALIGN_CENTER;
            heading.Padding = 5;

            table.AddCell(heading);

            table.AddCell(Cell("S.No", boldFont, Element.ALIGN_CENTER));
            table.AddCell(Cell("Head Name", boldFont));
            table.AddCell(Cell("Amount", boldFont, Element.ALIGN_RIGHT));

            foreach (var item in deductions)
            {
                table.AddCell(Cell(item.sno.ToString(), tableFont, Element.ALIGN_CENTER));
                table.AddCell(Cell(item.headName.ToString(), tableFont));

                table.AddCell(Cell(
                    Convert.ToDecimal(item.amount).ToString("N2"),
                    tableFont,
                    Element.ALIGN_RIGHT));
            }

            PdfPCell totalText = Cell("Total Salary Deductions", boldFont);
            totalText.Colspan = 2;

            table.AddCell(totalText);

            table.AddCell(Cell(
                Convert.ToDecimal(h.totDeductions).ToString("N2"),
                boldFont,
                Element.ALIGN_RIGHT));

            return new PdfPCell(table)
            {
                Padding = 0
            };
        }

        private void AddOtherHeads(
    Document document,
    List<dynamic> otherEarnings,
    List<dynamic> otherDeductions,
    dynamic h)
        {
            PdfPTable mainTable = new PdfPTable(2);
            mainTable.WidthPercentage = 100;
            mainTable.SetWidths(new float[] { 50, 50 });

            mainTable.AddCell(CreateOtherEarningTable(otherEarnings, h));

            mainTable.AddCell(CreateOtherDeductionTable(otherDeductions, h));

            document.Add(mainTable);

            document.Add(new Paragraph(" "));
        }

        private PdfPCell CreateOtherEarningTable(List<dynamic> otherEarnings, dynamic h)
        {
            PdfPTable table = new PdfPTable(3);

            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 10, 60, 30 });

            PdfPCell title =
                new PdfPCell(new Phrase("Other Earnings", tableHeaderFont));

            title.Colspan = 3;
            title.HorizontalAlignment = Element.ALIGN_CENTER;
            title.BackgroundColor = BaseColor.DARK_GRAY;

            table.AddCell(title);

            table.AddCell(Cell("S.No", boldFont));
            table.AddCell(Cell("Head Name", boldFont));
            table.AddCell(Cell("Amount", boldFont, Element.ALIGN_RIGHT));

            foreach (var item in otherEarnings)
            {
                table.AddCell(Cell(item.sno.ToString(), normalFont));

                table.AddCell(Cell(item.headName.ToString(), normalFont));

                table.AddCell(
                    Cell(
                        Convert.ToDecimal(item.amount).ToString("N2"),
                        normalFont,
                        Element.ALIGN_RIGHT));
            }

            PdfPCell subtotal = Cell("Sub Total", boldFont);
            subtotal.Colspan = 2;

            table.AddCell(subtotal);

            table.AddCell(
                Cell(
                    Convert.ToDecimal(h.totOtherEarnings).ToString("N2"),
                    boldFont,
                    Element.ALIGN_RIGHT));

            return new PdfPCell(table)
            {
                Padding = 0
            };
        }


        private PdfPCell CreateOtherDeductionTable(List<dynamic> otherDeductions, dynamic h)
        {
            PdfPTable table = new PdfPTable(3);

            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 10, 60, 30 });

            PdfPCell title =
                new PdfPCell(new Phrase("Other Deductions", tableHeaderFont));

            title.Colspan = 3;
            title.HorizontalAlignment = Element.ALIGN_CENTER;
            title.BackgroundColor = BaseColor.DARK_GRAY;

            table.AddCell(title);

            table.AddCell(Cell("S.No", boldFont));

            table.AddCell(Cell("Head Name", boldFont));

            table.AddCell(Cell("Amount", boldFont, Element.ALIGN_RIGHT));

            foreach (var item in otherDeductions)
            {
                table.AddCell(Cell(item.sno.ToString(), normalFont));

                table.AddCell(Cell(item.headName.ToString(), normalFont));

                table.AddCell(
                    Cell(
                        Convert.ToDecimal(item.amount).ToString("N2"),
                        normalFont,
                        Element.ALIGN_RIGHT));
            }

            PdfPCell subtotal = Cell("Sub Total", boldFont);
            subtotal.Colspan = 2;

            table.AddCell(subtotal);

            table.AddCell(
                Cell(
                    Convert.ToDecimal(h.totOtherDeductions).ToString("N2"),
                    boldFont,
                    Element.ALIGN_RIGHT));

            return new PdfPCell(table)
            {
                Padding = 0
            };
        }

        private void AddTotals(Document document, dynamic h)
        {
            PdfPTable table = new PdfPTable(2);

            table.WidthPercentage = 40;
            table.HorizontalAlignment = Element.ALIGN_RIGHT;

            table.SetWidths(new float[] { 70, 30 });

            table.AddCell(Cell("Gross Earnings", boldFont));

            table.AddCell(
                Cell(
                    Convert.ToDecimal(h.totGEarnings).ToString("N2"),
                    boldFont,
                    Element.ALIGN_RIGHT));

            table.AddCell(Cell("Total Deductions", boldFont));

            table.AddCell(
                Cell(
                    Convert.ToDecimal(h.totGDeductions).ToString("N2"),
                    boldFont,
                    Element.ALIGN_RIGHT));

            table.AddCell(Cell("Net Pay", boldFont));

            table.AddCell(
                Cell(
                    Convert.ToDecimal(h.NetPay).ToString("N2"),
                    boldFont,
                    Element.ALIGN_RIGHT));

            document.Add(table);

            document.Add(new Paragraph(" "));
        }

        //private void AddAmountInWords(Document document, dynamic h)
        //{
        //    document.Add(
        //        new Paragraph(
        //            "Amount In Words : " + Convert.ToString(h.AmountInWords),
        //            boldFont));


        //    document.Add(new Paragraph(" "));
        //}

        private void AddFooter(Document document)
        {
            PdfPTable table = new PdfPTable(3);

            table.WidthPercentage = 100;

            table.SetWidths(new float[] { 33, 33, 34 });

            table.AddCell(Cell("Prepared By", boldFont, Element.ALIGN_CENTER, null, false));

            table.AddCell(Cell("Checked By", boldFont, Element.ALIGN_CENTER, null, false));

            table.AddCell(Cell("Authorised By", boldFont, Element.ALIGN_CENTER, null, false));

            document.Add(new Paragraph(" "));
            document.Add(new Paragraph(" "));
            document.Add(new Paragraph(" "));

            document.Add(table);
        }


        //rupesh

        //rupesh
        public async Task<FnfSettlementMst?> GetFnfSettlementDetailAsync(string pk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_empid", pk_empid, DbType.String);

            //  Mapped all 5 result sets from SQL SP
            var tuple = DataBaseFactory.QueryMultipleSP<
                FnfSettlementMst,
                FnfSettlementHeadMst,
                FnfSettlementHeadMst,
                FnfSettlementHeadMst,
                FnfSettlementHeadMst
            >(
                "FFS_FullnFinalSettlement_MstDirect_getDetail",
                dynamicParameters,
                "FnfSettlement_GetDetail"
            );

            var result = tuple?.Item1?.FirstOrDefault();

            if (result != null)
            {
                result.heads = new List<FnfSettlementHeadMst>();

                // 1. Map Earnings (Result Set 2) & Fill in defaults
                if (tuple.Item2 != null)
                {
                    foreach (var h in tuple.Item2)
                    {
                        result.heads.Add(new FnfSettlementHeadMst { headName = h.headName, headType = "Earnings", amount = h.amount, isActive = true });
                    }
                }
                //var defaultEarnings = new[] { "Basic", "HRA", "Other Allowance" };
                //foreach (var name in defaultEarnings)
                //{
                //    if (!result.heads.Any(x => x.headType == "Earnings" && x.headName?.Trim().Equals(name, StringComparison.OrdinalIgnoreCase) == true))
                //    {
                //        result.heads.Add(new FnfSettlementHeadMst { headName = name, headType = "Earnings", amount = 0, isActive = true });
                //    }
                //}

                // 2. Map Deductions (Result Set 3) & Fill in defaults
                if (tuple.Item3 != null)
                {
                    foreach (var h in tuple.Item3)
                    {
                        result.heads.Add(new FnfSettlementHeadMst { headName = h.headName, headType = "Deductions", amount = h.amount, isActive = true });
                    }
                }
                //var defaultDeductions = new[] { "PF", "ESI", "LWF", "ProfTax", "IT" };
                //foreach (var name in defaultDeductions)
                //{
                //    if (!result.heads.Any(x => x.headType == "Deductions" && x.headName?.Trim().Equals(name, StringComparison.OrdinalIgnoreCase) == true))
                //    {
                //        result.heads.Add(new FnfSettlementHeadMst { headName = name, headType = "Deductions", amount = 0, isActive = true });
                //    }
                //}

                // 3. Map Other Earnings (Result Set 4) & Fill in defaults
                if (tuple.Item4 != null)
                {
                    foreach (var h in tuple.Item4)
                    {
                        result.heads.Add(new FnfSettlementHeadMst { headName = h.headName, headType = "OtherEarnings", amount = h.amount, isActive = true });
                    }
                }
                //var defaultOtherEarnings = new[] { "Leave Encashment", "Bonus", "LTA", "Ex Gratia", "Arrear", "Notice Pay", "Other" };
                //foreach (var name in defaultOtherEarnings)
                //{
                //    if (!result.heads.Any(x => x.headType == "OtherEarnings" && x.headName?.Trim().Equals(name, StringComparison.OrdinalIgnoreCase) == true))
                //    {
                //        result.heads.Add(new FnfSettlementHeadMst { headName = name, headType = "OtherEarnings", amount = 0, isActive = true });
                //    }
                //}

                // 4. Map Other Deductions (Result Set 5) & Fill in defaults
                if (tuple.Item5 != null)
                {
                    foreach (var h in tuple.Item5)
                    {
                        result.heads.Add(new FnfSettlementHeadMst { headName = h.headName, headType = "OtherDeductions", amount = h.amount, isActive = true });
                    }
                }
                //var defaultOtherDeductions = new[] { "Notice Recovery", "Salary Advance", "Other Deduction", "Assets Deduction", "Telecom Deduction", "Imprest Deduction", "Income Tax" };
                //foreach (var name in defaultOtherDeductions)
                //{
                //    if (!result.heads.Any(x => x.headType == "OtherDeductions" && x.headName?.Trim().Equals(name, StringComparison.OrdinalIgnoreCase) == true))
                //    {
                //        result.heads.Add(new FnfSettlementHeadMst { headName = name, headType = "OtherDeductions", amount = 0, isActive = true });
                //    }
                //}

            }

            return result;
        }
        public async Task<bool> InsertFnfSettlementAsync(FnfSettlementMst fnfSettlementMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            string xmlDoc = GenerateFnfSettlementXml(fnfSettlementMst);

            dynamicParameters.Add("@Doc", xmlDoc, DbType.String);

            DataBaseFactory.QuerySP(
                "FFS_FullnFinalSettlement_Mst_Ins",
                dynamicParameters,
                "FnfSettlement_Insert"
            );

            return true;
        }

        public async Task<FnfSettlementMst?> GetFnfSettlementViewAsync(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<FnfSettlementMst, FnfSettlementHeadMst>(
                "FFS_FullnFinalSettlement_Mst_Print",
                dynamicParameters,
                "FnfSettlement_View"
            );

            var result = tuple?.Item1?.FirstOrDefault();

            if (result != null && tuple?.Item2 != null)
            {
                result.heads = tuple.Item2.ToList();
            }

            return result;
        }

        private string GenerateFnfSettlementXml(FnfSettlementMst model)
        {
            var xml = new XElement("NewDataSet",
                new XElement("FFS_FullnFinalSettlement_Mst",
                    new XElement("fk_empid", model.fk_empid),
                    new XElement("fk_seprequestId", model.fk_seprequestId),
                    new XElement("totNoOfDaysWorked", model.totNoOfDaysWorked),
                    new XElement("daysNoticeReq", model.daysNoticeReq),
                    new XElement("daysNoticeGiven", model.daysNoticeGiven),
                    new XElement("daysShortfallNotice", model.daysShortfallNotice),
                    new XElement("shortfallAdjusted", model.shortfallAdjusted),
                    new XElement("noticerecoverydays", model.noticerecoverydays),
                    new XElement("noOfDaysWorkdInMonth", model.noOfDaysWorkdInMonth),
                    new XElement("noOfDaysConsidered", model.noOfDaysConsidered),
                    new XElement("balAnnualLeaveTot", model.balAnnualLeaveTot),
                    new XElement("totEarnings", model.totEarnings),
                    new XElement("totDeductions", model.totDeductions),
                    new XElement("totOtherEarnings", model.totOtherEarnings),
                    new XElement("totOtherDeductions", model.totOtherDeductions),
                    new XElement("totGEarnings", model.totGEarnings),
                    new XElement("totGDeductions", model.totGDeductions),
                    new XElement("NetPay", model.NetPay),
                    new XElement("TenureYear", model.TenureYear),
                    new XElement("TenureMonth", model.TenureMonth),
                    new XElement("TenureDay", model.TenureDay)
                )
            );

            foreach (var head in model.heads)
            {
                xml.Add(new XElement("FFS_FullnFinalSettlement_Mst_Head",
                    new XElement("headName", head.headName),
                    new XElement("sno", head.sno),
                    new XElement("headType", head.headType),
                    new XElement("amount", head.amount),
                    new XElement("isActive", true),
                    new XElement("Rate_amount", head.Rate_amount)
                ));
            }

            return xml.ToString();
        }


        public async Task<(int totalCount, IEnumerable<dynamic>)> ViewFnfReportAsync(ReportModelRequest request)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var combinedXml = commonFunction.GetRecords(request.SelectedLocations, request.SelectedDepartments);

            dynamicParameters.Add("@pageindex", request.pageIndex);
            dynamicParameters.Add("@pagesize", request.pageSize);
            dynamicParameters.Add("@empcode", request.EmpCode);
            dynamicParameters.Add("@empcodemanual", request.EmpCodeManual);
            dynamicParameters.Add("@empname", request.EmpName);
            dynamicParameters.Add("@xmlDoc", combinedXml);
            dynamicParameters.Add("@fk_designationid", request.SelectedDesignation);
            dynamicParameters.Add("@fk_nature", request.SelectedNature);
            dynamicParameters.Add("@fk_cityid", request.SelectedCity);
            dynamicParameters.Add("@fk_monthId", request.fk_monthId);
            dynamicParameters.Add("@fk_yearId", request.fk_yearId);
            dynamicParameters.Add("@fromdate", request.fromdate);
            dynamicParameters.Add("@todate", request.todate);
            dynamicParameters.Add("@fk_costcentreid", request.fk_costcentreid);
            dynamicParameters.Add("@sortby", request.SortBy);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, dynamic>("FFS_FnFReport_ForExport", dynamicParameters);

            if (tuple == null || tuple.Item2 == null) return (0, Enumerable.Empty<dynamic>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple.Item2.ToList());
        }

    }
}
