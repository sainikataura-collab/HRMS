using Syncfusion.DocIO;
using Syncfusion.DocIO.DLS;
using Syncfusion.DocIORenderer;
using Syncfusion.Pdf;
using System;
using System.IO;

namespace HRMSWebAPI.Helper
{
    /// <summary>
    /// Generates offer letter PDF from Word template using Syncfusion DocIO.
    /// Template: LetterTemplates/offer_letter_template.docx
    /// Placeholders: {{CandidateName}}, {{Designation}}, {{GrossCTC}}, etc.
    /// </summary>
    public static class OfferLetterGenerator
    {
        public static byte[] GenerateOfferLetterPdf(OfferLetterData data, string templateFolderPath)
        {
            string? templatePath = ResolveTemplatePath(templateFolderPath);

            WordDocument doc = !string.IsNullOrWhiteSpace(templatePath) && File.Exists(templatePath)
                ? new WordDocument(templatePath, FormatType.Docx)
                : CreateDefaultOfferLetterWordDocument(data);

            using var _ = doc;

            // ── Dynamic CTC Calculation: strictly non-zero heads only ──
            var nonZeroHeads = data.SalaryHeads?.Where(h => h.AnnualAmount > 0).ToList() ?? new List<HRMSWebAPI.Models.OfferSalaryHeadDto>();
            if (nonZeroHeads.Count > 0)
            {
                decimal sumHeads = nonZeroHeads.Sum(h => h.AnnualAmount);
                data.GrossCTC = sumHeads;
                // PF and other deductions are non-mandatory; strictly respect entered value (0 if not entered)
                if (data.PfDeduction < 0) data.PfDeduction = 0;
            }
            else
            {
                // Fallback: check which individual heads have > 0 values (only non-zero heads)
                var candidateHeads = new List<HRMSWebAPI.Models.OfferSalaryHeadDto>();
                if (data.BasicSalary > 0)
                    candidateHeads.Add(new() { HeadName = "Basic Salary", AnnualAmount = data.BasicSalary, MonthlyAmount = Math.Round(data.BasicSalary / 12m) });
                if (data.HRA > 0)
                    candidateHeads.Add(new() { HeadName = "House Rent Allowance (HRA)", AnnualAmount = data.HRA, MonthlyAmount = Math.Round(data.HRA / 12m) });
                if (data.DA > 0)
                    candidateHeads.Add(new() { HeadName = "Dearness Allowance (DA)", AnnualAmount = data.DA, MonthlyAmount = Math.Round(data.DA / 12m) });
                if (data.Conveyance > 0)
                    candidateHeads.Add(new() { HeadName = "Conveyance Allowance", AnnualAmount = data.Conveyance, MonthlyAmount = Math.Round(data.Conveyance / 12m) });
                if (data.MedicalAllowance > 0)
                    candidateHeads.Add(new() { HeadName = "Medical Allowance", AnnualAmount = data.MedicalAllowance, MonthlyAmount = Math.Round(data.MedicalAllowance / 12m) });
                if (data.OtherAllowance > 0)
                    candidateHeads.Add(new() { HeadName = "Special / Other Allowance", AnnualAmount = data.OtherAllowance, MonthlyAmount = Math.Round(data.OtherAllowance / 12m) });

                // If no breakdown heads were entered at all, but a lump-sum GrossCTC exists
                if (candidateHeads.Count == 0 && data.GrossCTC > 0)
                {
                    decimal g = data.GrossCTC;
                    decimal b = Math.Round(g * 0.40m);
                    decimal h = Math.Round(g * 0.20m);
                    decimal d = Math.Round(g * 0.10m);
                    decimal c = g >= 200000m ? 19200m : 0m;
                    decimal m = g >= 200000m ? 15000m : 0m;
                    decimal o = Math.Max(0, g - (b + h + d + c + m));

                    if (b > 0) candidateHeads.Add(new() { HeadName = "Basic Salary", AnnualAmount = b, MonthlyAmount = Math.Round(b / 12m) });
                    if (h > 0) candidateHeads.Add(new() { HeadName = "House Rent Allowance (HRA)", AnnualAmount = h, MonthlyAmount = Math.Round(h / 12m) });
                    if (d > 0) candidateHeads.Add(new() { HeadName = "Dearness Allowance (DA)", AnnualAmount = d, MonthlyAmount = Math.Round(d / 12m) });
                    if (c > 0) candidateHeads.Add(new() { HeadName = "Conveyance Allowance", AnnualAmount = c, MonthlyAmount = Math.Round(c / 12m) });
                    if (m > 0) candidateHeads.Add(new() { HeadName = "Medical Allowance", AnnualAmount = m, MonthlyAmount = Math.Round(m / 12m) });
                    if (o > 0) candidateHeads.Add(new() { HeadName = "Special / Other Allowance", AnnualAmount = o, MonthlyAmount = Math.Round(o / 12m) });
                }

                nonZeroHeads = candidateHeads;
                if (data.GrossCTC <= 0 && nonZeroHeads.Count > 0)
                {
                    data.GrossCTC = nonZeroHeads.Sum(x => x.AnnualAmount);
                }
                if (data.PfDeduction < 0) data.PfDeduction = 0;
            }

            // ── V1_Vendor Offer Letter_Draft Placeholders ─────────────
            string vendor = !string.IsNullOrWhiteSpace(data.VendorName)
                ? data.VendorName
                : (!string.IsNullOrWhiteSpace(data.CompanyName) ? data.CompanyName : "Staffing Partner");
            string candName = data.CandidateName ?? "";
            string issuedDate = data.IssuedDate ?? DateTime.Now.ToString("dd MMMM yyyy");
            string joinDateStr = data.JoiningDate.HasValue
                ? data.JoiningDate.Value.ToString("dd MMMM yyyy")
                : DateTime.Now.AddDays(7).ToString("dd MMMM yyyy");

            doc.Replace("[VENDOR NAME]", vendor, true, true);
            doc.Replace("_[VENDOR NAME]_", vendor, true, true);
            doc.Replace("_[EMPLOYEE NAME]_", candName, true, true);
            doc.Replace("[EMPLOYEE NAME]", candName, true, true);
            doc.Replace("Date: _______________", $"Date: {issuedDate}", true, true);
            doc.Replace("S/o / D/o: ____________", $"S/o / D/o: {(string.IsNullOrWhiteSpace(data.FatherName) ? "—" : data.FatherName)}", true, true);
            doc.Replace("Address: ____________", $"Address: {(string.IsNullOrWhiteSpace(data.CandidateAddress) ? "—" : data.CandidateAddress)}", true, true);
            doc.Replace("Employee Code (to be assigned): ____________", $"Employee Code (to be assigned): {(string.IsNullOrWhiteSpace(data.CandidateCode) ? "—" : data.CandidateCode)}", true, true);
            doc.Replace("_[DESIGNATION]_", data.Designation ?? "Executive", true, true);
            doc.Replace("_ [DATE OF JOINING] _", joinDateStr, true, true);
            doc.Replace("_ [CLIENT LOCATION/SITE ADDRESS]", data.Location ?? "Gurugram", true, true);
            doc.Replace("_[SIGNATURE]_", " ", true, true);
            doc.Replace("Name: ____________", $"Name: {candName}", true, true);
            doc.Replace("[EMPLOYEE SIGNATURE]", " ", true, true);

            // ── Insert Dynamic Compensation Table at [COMPENSATION] ──
            InsertCompensationTable(doc, data, nonZeroHeads);

            // ── Backward-compatible {{Placeholders}} ──────────────────
            doc.Replace("{{CompanyName}}",      vendor,                                 true, true);
            doc.Replace("{{CompanyAddress}}",   data.CompanyAddress ?? "",              true, true);
            doc.Replace("{{CandidateName}}",    candName,                               true, true);
            doc.Replace("{{FatherName}}",       data.FatherName       ?? "",            true, true);
            doc.Replace("{{CandidateAddress}}", data.CandidateAddress ?? "",            true, true);
            doc.Replace("{{Designation}}",      data.Designation      ?? "",            true, true);
            doc.Replace("{{Department}}",       data.Department       ?? "",            true, true);
            doc.Replace("{{Location}}",         data.Location         ?? "",            true, true);
            doc.Replace("{{ReportingManager}}", data.ReportingManager ?? "",            true, true);
            doc.Replace("{{JoiningDate}}",      joinDateStr,                            true, true);
            doc.Replace("{{ProbationPeriod}}",  data.ProbationPeriod ?? "90 Days",      true, true);
            doc.Replace("{{NoticePeriod}}",     data.NoticePeriod    ?? "30 Days",      true, true);
            doc.Replace("{{BasicSalary}}",      FormatINR(data.BasicSalary),            true, true);
            doc.Replace("{{HRA}}",              FormatINR(data.HRA),                    true, true);
            doc.Replace("{{DA}}",               FormatINR(data.DA),                     true, true);
            doc.Replace("{{Conveyance}}",       FormatINR(data.Conveyance),             true, true);
            doc.Replace("{{MedicalAllowance}}", FormatINR(data.MedicalAllowance),        true, true);
            doc.Replace("{{OtherAllowance}}",   FormatINR(data.OtherAllowance),         true, true);
            doc.Replace("{{GrossCTC}}",         FormatINR(data.GrossCTC),               true, true);
            doc.Replace("{{PfDeduction}}",      FormatINR(data.PfDeduction),            true, true);
            doc.Replace("{{NetSalary}}",        FormatINR(data.NetSalary),              true, true);
            doc.Replace("{{NetPerMonth}}",      FormatINR(Math.Round(data.NetSalary / 12m)), true, true);
            doc.Replace("{{OfferCode}}",        data.OfferCode  ?? "",                  true, true);
            doc.Replace("{{IssuedDate}}",       issuedDate,                             true, true);
            doc.Replace("{{IssuedBy}}",         data.IssuedBy   ?? "Corporate HR",      true, true);

            // If template had static [EARNINGS] table
            PopulateDynamicCtcTable(doc, nonZeroHeads, data);

            // ── Convert Word → PDF ───────────────────────────────────
            using var renderer = new DocIORenderer();
            using var pdfDoc   = renderer.ConvertToPDF(doc);
            using var ms       = new MemoryStream();
            pdfDoc.Save(ms);
            pdfDoc.Close(true);

            return ms.ToArray();
        }

        private static string? ResolveTemplatePath(string templateFolderPath)
        {
            var preferredNames = new[]
            {
                "V1_Vendor Offer Letter_Draft.docx",
                "offer_letter_template.docx"
            };

            foreach (var name in preferredNames)
            {
                if (!string.IsNullOrWhiteSpace(templateFolderPath))
                {
                    string p1 = Path.Combine(templateFolderPath, name);
                    if (File.Exists(p1)) return p1;
                }

                var candidates = new[]
                {
                    Path.Combine(AppContext.BaseDirectory, "LetterTemplates", name),
                    Path.Combine(Directory.GetCurrentDirectory(), "LetterTemplates", name),
                    Path.Combine(AppContext.BaseDirectory, "wwwroot", "LetterTemplates", name),
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "LetterTemplates", name),
                    Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "LetterTemplates", name),
                    Path.Combine(@"d:\hr_24_10\WebAPI\WebAPI\LetterTemplates", name)
                };

                foreach (var cand in candidates)
                {
                    if (File.Exists(cand)) return cand;
                }
            }

            if (!string.IsNullOrWhiteSpace(templateFolderPath) && File.Exists(templateFolderPath))
                return templateFolderPath;

            return null;
        }

        private static WordDocument CreateDefaultOfferLetterWordDocument(OfferLetterData data)
        {
            var doc = new WordDocument();
            var section = doc.AddSection();
            section.PageSetup.Margins.All = 36f;

            // Company Header
            var pHeader = section.AddParagraph();
            pHeader.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Center;
            var trComp = pHeader.AppendText("{{CompanyName}}\n");
            trComp.CharacterFormat.FontSize = 16;
            trComp.CharacterFormat.Bold = true;

            var trAddr = pHeader.AppendText("{{CompanyAddress}}\n\n");
            trAddr.CharacterFormat.FontSize = 9.5f;

            var pDivider = section.AddParagraph();
            pDivider.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Center;
            pDivider.AppendText("───────────────────────────────────────────────────────────────────\n\n");

            // Title
            var pTitle = section.AddParagraph();
            pTitle.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Center;
            var trTitle = pTitle.AppendText("LETTER OF APPOINTMENT / OFFER OF EMPLOYMENT\n\n");
            trTitle.CharacterFormat.FontSize = 13;
            trTitle.CharacterFormat.Bold = true;
            trTitle.CharacterFormat.UnderlineStyle = UnderlineStyle.Single;

            // Ref No & Date
            var pMeta = section.AddParagraph();
            pMeta.AppendText("Ref No: {{OfferCode}}                                                       Date: {{IssuedDate}}\n\n");
            pMeta.AppendText("To,\n");
            var trCand = pMeta.AppendText("{{CandidateName}}\n");
            trCand.CharacterFormat.Bold = true;
            pMeta.AppendText("Address: {{CandidateAddress}}\n\n");

            pMeta.AppendText("Dear {{CandidateName}},\n\n");

            // Offer Introduction
            var pIntro = section.AddParagraph();
            pIntro.AppendText("We are pleased to extend this formal offer of employment for the position of ");
            var trDesg = pIntro.AppendText("{{Designation}}");
            trDesg.CharacterFormat.Bold = true;
            pIntro.AppendText(" in the Department of ");
            var trDept = pIntro.AppendText("{{Department}}");
            trDept.CharacterFormat.Bold = true;
            pIntro.AppendText(" at our {{Location}} office, reporting to {{ReportingManager}}.\n\n");
            pIntro.AppendText("Your official joining date is scheduled for {{JoiningDate}}. You will be on a probation period of {{ProbationPeriod}} from the date of joining. The applicable notice period for separation is {{NoticePeriod}}.\n\n");

            // Compensation Section Placeholder
            var pCompTitle = section.AddParagraph();
            var trCompTitle = pCompTitle.AppendText("Annexure A: Compensation & Benefits Structure\n");
            trCompTitle.CharacterFormat.Bold = true;
            trCompTitle.CharacterFormat.FontSize = 11;

            var pComp = section.AddParagraph();
            pComp.AppendText("[COMPENSATION]\n\n");

            // Terms
            var pTerms = section.AddParagraph();
            var trTermsTitle = pTerms.AppendText("General Terms & Guidelines:\n");
            trTermsTitle.CharacterFormat.Bold = true;
            pTerms.AppendText("1. This offer is contingent upon verification of your academic, statutory, and employment background.\n");
            pTerms.AppendText("2. You will be governed by the standard company code of conduct, employment policies, and service rules.\n");
            pTerms.AppendText("3. Please confirm your acceptance by signing and returning the duplicate copy of this letter.\n\n");

            // Signatures
            var pSig = section.AddParagraph();
            pSig.AppendText("For {{CompanyName}},\n\n\n\n");
            var trIssued = pSig.AppendText("Authorized Signatory ({{IssuedBy}})\n\n\n");
            trIssued.CharacterFormat.Bold = true;
            pSig.AppendText("Candidate Acceptance:\n");
            pSig.AppendText("I have read, understood, and accept the terms and conditions outlined in this offer letter.\n\n");
            pSig.AppendText("Signature: __________________________        Date: _________________\n");

            return doc;
        }

        private static void InsertCompensationTable(WordDocument doc, OfferLetterData data, List<HRMSWebAPI.Models.OfferSalaryHeadDto> nonZeroHeads)
        {
            try
            {
                var selection = doc.Find("[COMPENSATION]", false, true);
                if (selection == null) return;

                var tr = selection.GetAsOneRange();
                var p = tr.OwnerParagraph;
                var body = p.OwnerTextBody;
                int pIndex = body.ChildEntities.IndexOf(p);

                var table = new WTable(doc);
                table.TableFormat.Borders.BorderType = BorderStyle.Single;
                table.TableFormat.Borders.Color = Syncfusion.Drawing.Color.FromArgb(203, 213, 225); // slate-300
                table.TableFormat.Borders.LineWidth = 0.75f;
                table.TableFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.RowAlignment.Center;
                table.TableFormat.LeftIndent = 0f;

                decimal gross = data.GrossCTC > 0 ? data.GrossCTC : nonZeroHeads.Sum(h => h.AnnualAmount);
                decimal pf = data.PfDeduction > 0 ? data.PfDeduction : 0;
                bool hasPf = pf > 0;

                int totalRows = 1 // Title
                              + 1 // Column headers
                              + nonZeroHeads.Count // Dynamic non-zero earnings heads
                              + 1 // Gross total
                              + (hasPf ? 2 : 0) // Statutory deductions header + PF deduction
                              + 1; // Net take home

                table.ResetCells(totalRows, 3);

                // Printable A4 page width = 450pt (595pt page - 2x72pt margins)
                const float col0 = 230f; // Salary Component / Head
                const float col1 = 110f; // Monthly (₹)
                const float col2 = 110f; // Annual (₹)

                // Enforce uniform column widths across every single row before merging
                for (int i = 0; i < totalRows; i++)
                {
                    table.Rows[i].Cells[0].Width = col0;
                    table.Rows[i].Cells[1].Width = col1;
                    table.Rows[i].Cells[2].Width = col2;
                }

                int currRow = 0;

                // Title Banner Row: Annexure - 1
                var titleRow = table.Rows[currRow];
                var titleCell = titleRow.Cells[0];
                titleCell.CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(37, 99, 235); // primary blue
                titleCell.CellFormat.Paddings.Top = 4f;
                titleCell.CellFormat.Paddings.Bottom = 4f;
                while (titleCell.Paragraphs.Count > 0) titleCell.Paragraphs.RemoveAt(0);
                var titleP = titleCell.AddParagraph();
                titleP.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Center;
                titleP.ParagraphFormat.LeftIndent = 0f;
                titleP.ParagraphFormat.RightIndent = 0f;
                titleP.ParagraphFormat.FirstLineIndent = 0f;
                titleP.ParagraphFormat.BeforeSpacing = 3f;
                titleP.ParagraphFormat.AfterSpacing = 3f;
                var titleText = titleP.AppendText("ANNEXURE – 1 : COMPENSATION STRUCTURE");
                titleText.CharacterFormat.FontName = "Calibri";
                titleText.CharacterFormat.FontSize = 10.5f;
                titleText.CharacterFormat.Bold = true;
                titleText.CharacterFormat.TextColor = Syncfusion.Drawing.Color.White;
                table.ApplyHorizontalMerge(currRow, 0, 2);
                currRow++;

                // Column Header Row: Component | Monthly (INR) | Annual (INR)
                var headerRow = table.Rows[currRow];
                headerRow.IsHeader = true;
                SetupHeaderCell(headerRow.Cells[0], "Salary Component / Head", col0, Syncfusion.DocIO.DLS.HorizontalAlignment.Left);
                SetupHeaderCell(headerRow.Cells[1], "Monthly (₹)", col1, Syncfusion.DocIO.DLS.HorizontalAlignment.Right);
                SetupHeaderCell(headerRow.Cells[2], "Annual (₹)", col2, Syncfusion.DocIO.DLS.HorizontalAlignment.Right);
                currRow++;

                // Populate Each Non-Zero Dynamic Salary Head
                foreach (var head in nonZeroHeads)
                {
                    var r = table.Rows[currRow];
                    string displayName = CleanHeadDisplayName(head.HeadName);
                    decimal monthly = head.MonthlyAmount > 0 ? head.MonthlyAmount : Math.Round(head.AnnualAmount / 12m);

                    SetupDataCell(r.Cells[0], displayName, col0, Syncfusion.DocIO.DLS.HorizontalAlignment.Left, bold: false);
                    SetupDataCell(r.Cells[1], $"₹ {monthly:N0}", col1, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: false);
                    SetupDataCell(r.Cells[2], $"₹ {head.AnnualAmount:N0}", col2, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: false);
                    currRow++;
                }

                // Gross Total Row
                decimal grossMonthly = Math.Round(gross / 12m);
                var grossRow = table.Rows[currRow];
                grossRow.Cells[0].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(241, 245, 249);
                grossRow.Cells[1].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(241, 245, 249);
                grossRow.Cells[2].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(241, 245, 249);
                SetupDataCell(grossRow.Cells[0], "GROSS SALARY (Total Earnings)", col0, Syncfusion.DocIO.DLS.HorizontalAlignment.Left, bold: true);
                SetupDataCell(grossRow.Cells[1], $"₹ {grossMonthly:N0}", col1, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: true);
                SetupDataCell(grossRow.Cells[2], $"₹ {gross:N0}", col2, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: true);
                currRow++;

                // Statutory Deductions (e.g. PF) - strictly only if PF entered > 0
                if (hasPf)
                {
                    var dedHeaderCell = table.Rows[currRow].Cells[0];
                    dedHeaderCell.CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(248, 250, 252);
                    dedHeaderCell.CellFormat.Paddings.Top = 3f;
                    dedHeaderCell.CellFormat.Paddings.Bottom = 3f;
                    while (dedHeaderCell.Paragraphs.Count > 0) dedHeaderCell.Paragraphs.RemoveAt(0);
                    var dedP = dedHeaderCell.AddParagraph();
                    dedP.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Left;
                    dedP.ParagraphFormat.LeftIndent = 0f;
                    dedP.ParagraphFormat.RightIndent = 0f;
                    dedP.ParagraphFormat.FirstLineIndent = 0f;
                    dedP.ParagraphFormat.BeforeSpacing = 2f;
                    dedP.ParagraphFormat.AfterSpacing = 2f;
                    var dedT = dedP.AppendText("STATUTORY DEDUCTIONS");
                    dedT.CharacterFormat.FontName = "Calibri";
                    dedT.CharacterFormat.FontSize = 9.5f;
                    dedT.CharacterFormat.Bold = true;
                    dedT.CharacterFormat.TextColor = Syncfusion.Drawing.Color.FromArgb(71, 85, 105);
                    table.ApplyHorizontalMerge(currRow, 0, 2);
                    currRow++;

                    var pfRow = table.Rows[currRow];
                    decimal pfMonthly = Math.Round(pf / 12m);
                    SetupDataCell(pfRow.Cells[0], "Provident Fund (PF - Employee Share)", col0, Syncfusion.DocIO.DLS.HorizontalAlignment.Left, bold: false);
                    SetupDataCell(pfRow.Cells[1], $"₹ {pfMonthly:N0}", col1, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: false);
                    SetupDataCell(pfRow.Cells[2], $"₹ {pf:N0}", col2, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: false);
                    currRow++;
                }

                // Net Take Home Row
                decimal net = gross - pf;
                decimal netMonthly = Math.Round(net / 12m);
                var netRow = table.Rows[currRow];
                netRow.Cells[0].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(226, 232, 240);
                netRow.Cells[1].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(226, 232, 240);
                netRow.Cells[2].CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(226, 232, 240);
                SetupDataCell(netRow.Cells[0], "NET TAKE HOME SALARY", col0, Syncfusion.DocIO.DLS.HorizontalAlignment.Left, bold: true);
                SetupDataCell(netRow.Cells[1], $"₹ {netMonthly:N0}", col1, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: true);
                SetupDataCell(netRow.Cells[2], $"₹ {net:N0}", col2, Syncfusion.DocIO.DLS.HorizontalAlignment.Right, bold: true);

                // Insert table into body at placeholder location
                body.ChildEntities.Remove(p);
                body.ChildEntities.Insert(pIndex, table);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting compensation table: {ex}");
            }
        }

        private static void SetupHeaderCell(WTableCell cell, string text, float width, Syncfusion.DocIO.DLS.HorizontalAlignment align)
        {
            cell.Width = width;
            cell.CellFormat.BackColor = Syncfusion.Drawing.Color.FromArgb(241, 245, 249);
            cell.CellFormat.VerticalAlignment = Syncfusion.DocIO.DLS.VerticalAlignment.Middle;
            cell.CellFormat.Paddings.Left = 5f;
            cell.CellFormat.Paddings.Right = 5f;
            cell.CellFormat.Paddings.Top = 3.5f;
            cell.CellFormat.Paddings.Bottom = 3.5f;
            while (cell.Paragraphs.Count > 0) cell.Paragraphs.RemoveAt(0);
            var p = cell.AddParagraph();
            p.ParagraphFormat.HorizontalAlignment = align;
            p.ParagraphFormat.LeftIndent = 0f;
            p.ParagraphFormat.RightIndent = 0f;
            p.ParagraphFormat.FirstLineIndent = 0f;
            p.ParagraphFormat.BeforeSpacing = 2.5f;
            p.ParagraphFormat.AfterSpacing = 2.5f;
            var t = p.AppendText(text);
            t.CharacterFormat.FontName = "Calibri";
            t.CharacterFormat.FontSize = 10f;
            t.CharacterFormat.Bold = true;
            t.CharacterFormat.TextColor = Syncfusion.Drawing.Color.FromArgb(30, 41, 59);
        }

        private static void SetupDataCell(WTableCell cell, string text, float width, Syncfusion.DocIO.DLS.HorizontalAlignment align, bool bold)
        {
            cell.Width = width;
            cell.CellFormat.VerticalAlignment = Syncfusion.DocIO.DLS.VerticalAlignment.Middle;
            cell.CellFormat.Paddings.Left = 5f;
            cell.CellFormat.Paddings.Right = 5f;
            cell.CellFormat.Paddings.Top = 3f;
            cell.CellFormat.Paddings.Bottom = 3f;
            while (cell.Paragraphs.Count > 0) cell.Paragraphs.RemoveAt(0);
            var p = cell.AddParagraph();
            p.ParagraphFormat.HorizontalAlignment = align;
            p.ParagraphFormat.LeftIndent = 0f;
            p.ParagraphFormat.RightIndent = 0f;
            p.ParagraphFormat.FirstLineIndent = 0f;
            p.ParagraphFormat.BeforeSpacing = 2.5f;
            p.ParagraphFormat.AfterSpacing = 2.5f;
            var t = p.AppendText(text);
            t.CharacterFormat.FontName = "Calibri";
            t.CharacterFormat.FontSize = 9.5f;
            t.CharacterFormat.Bold = bold;
            t.CharacterFormat.TextColor = Syncfusion.Drawing.Color.FromArgb(15, 23, 42);
        }

        private static void PopulateDynamicCtcTable(WordDocument doc, List<HRMSWebAPI.Models.OfferSalaryHeadDto> nonZeroHeads, OfferLetterData data)
        {
            try
            {
                WTable? ctcTable = null;
                foreach (WSection section in doc.Sections)
                {
                    foreach (WTable table in section.Tables)
                    {
                        foreach (WTableRow row in table.Rows)
                        {
                            if (RowContains(row, "EARNINGS"))
                            {
                                ctcTable = table;
                                break;
                            }
                        }
                        if (ctcTable != null) break;
                    }
                    if (ctcTable != null) break;
                }

                if (ctcTable == null) return;

                int earningsRowIdx = -1;
                int grossRowIdx = -1;
                for (int i = 0; i < ctcTable.Rows.Count; i++)
                {
                    var r = ctcTable.Rows[i];
                    if (RowContains(r, "EARNINGS")) earningsRowIdx = i;
                    else if (RowContains(r, "GROSS CTC")) { grossRowIdx = i; break; }
                }

                if (earningsRowIdx >= 0 && grossRowIdx > earningsRowIdx)
                {
                    WTableRow templateRow = ctcTable.Rows[earningsRowIdx + 1];
                    int rowsToRemove = grossRowIdx - (earningsRowIdx + 1);
                    for (int r = 0; r < rowsToRemove; r++)
                    {
                        ctcTable.Rows.RemoveAt(earningsRowIdx + 1);
                    }

                    int insertIdx = earningsRowIdx + 1;
                    foreach (var head in nonZeroHeads)
                    {
                        var newRow = (WTableRow)templateRow.Clone();
                        string displayName = CleanHeadDisplayName(head.HeadName);

                        if (newRow.Cells.Count > 0)
                        {
                            while (newRow.Cells[0].Paragraphs.Count > 0)
                            {
                                newRow.Cells[0].Paragraphs.RemoveAt(0);
                            }
                            var p0 = newRow.Cells[0].AddParagraph();
                            var t0 = p0.AppendText(displayName);
                            t0.CharacterFormat.FontName = "Calibri";
                            t0.CharacterFormat.FontSize = 10;
                            t0.CharacterFormat.Bold = false;
                        }
                        if (newRow.Cells.Count > 1)
                        {
                            while (newRow.Cells[1].Paragraphs.Count > 0)
                            {
                                newRow.Cells[1].Paragraphs.RemoveAt(0);
                            }
                            var p1 = newRow.Cells[1].AddParagraph();
                            p1.ParagraphFormat.HorizontalAlignment = Syncfusion.DocIO.DLS.HorizontalAlignment.Right;
                            decimal mo = head.MonthlyAmount > 0 ? head.MonthlyAmount : Math.Round(head.AnnualAmount / 12m);
                            string formattedAmt = $"₹ {head.AnnualAmount:N0} (₹ {mo:N0}/mo)";
                            var t1 = p1.AppendText(formattedAmt);
                            t1.CharacterFormat.FontName = "Calibri";
                            t1.CharacterFormat.FontSize = 10;
                            t1.CharacterFormat.Bold = false;
                        }
                        ctcTable.Rows.Insert(insertIdx++, newRow);
                    }
                }
            }
            catch
            {
                // Fallback gracefully to standard text replacements
            }
        }

        private static bool RowContains(WTableRow row, string needle)
        {
            foreach (WTableCell cell in row.Cells)
            {
                foreach (WParagraph p in cell.Paragraphs)
                {
                    if (p.Text != null && p.Text.IndexOf(needle, StringComparison.OrdinalIgnoreCase) >= 0)
                        return true;
                    foreach (Entity ent in p.ChildEntities)
                    {
                        if (ent is WTextRange tr && tr.Text != null && tr.Text.IndexOf(needle, StringComparison.OrdinalIgnoreCase) >= 0)
                            return true;
                    }
                }
            }
            return false;
        }

        private static string CleanHeadDisplayName(string? headName)
        {
            if (string.IsNullOrWhiteSpace(headName)) return "Allowance";

            var trimmed = headName.Trim();
            var lower = trimmed.ToLowerInvariant();

            if (lower == "basic") return "Basic Salary";
            if (lower == "hra") return "House Rent Allowance (HRA)";
            if (lower == "da") return "Dearness Allowance (DA)";
            if (lower == "convall" || lower == "conveyance") return "Conveyance Allowance";
            if (lower == "mediclaim" || lower == "medical") return "Medical Allowance (Mediclaim)";
            if (lower == "att_incentive") return "Attendance Incentive";
            if (lower == "att_incentive_quaterly") return "Quarterly Attendance Incentive";
            if (lower == "sale_peak_incentive") return "Sale Peak Incentive";
            if (lower == "food_ert_incentive") return "Food / ERT Incentive";
            if (lower == "performance_inc") return "Performance Incentive";
            if (lower == "perfor_incentive2") return "Performance Incentive II";
            if (lower == "perfor_incentive4") return "Performance Incentive IV";
            if (lower == "nightallowance") return "Night Allowance";
            if (lower == "leavewages") return "Leave Wages";
            if (lower == "other_spcl_wash_allow") return "Special / Washing Allowance";
            if (lower == "accom_allow") return "Accommodation Allowance";
            if (lower == "uniform") return "Uniform Allowance";
            if (lower == "payholiday") return "Holiday Pay";
            if (lower == "bonus") return "Bonus";
            if (lower == "cca") return "City Compensatory Allowance (CCA)";
            if (lower == "otherpay") return "Other Pay";
            if (lower == "reliver") return "Reliever Allowance";

            return trimmed.Replace('_', ' ');
        }

        private static string FormatINR(decimal amount)
            => amount == 0 ? "—" : $"₹ {amount:N0}";
    }

    public class OfferLetterData
    {
        // Company
        public string? CompanyName    { get; set; }
        public string? CompanyAddress { get; set; }

        // Candidate
        public long    AppId           { get; set; }
        public string? CandidateName   { get; set; }
        public string? FatherName      { get; set; }
        public string? CandidateAddress{ get; set; }
        public string? CandidateEmail  { get; set; }
        public string? VendorEmail     { get; set; }
        public string? VendorCode      { get; set; }
        public string? VendorName      { get; set; }

        // Position
        public string? Designation      { get; set; }
        public string? Department       { get; set; }
        public string? Location         { get; set; }
        public string? ReportingManager { get; set; }
        public DateTime? JoiningDate    { get; set; }
        public string? ProbationPeriod  { get; set; }
        public string? NoticePeriod     { get; set; }

        // CTC
        public decimal GrossCTC         { get; set; }
        public decimal BasicSalary      { get; set; }
        public decimal HRA              { get; set; }
        public decimal DA               { get; set; }
        public decimal Conveyance       { get; set; }
        public decimal MedicalAllowance { get; set; }
        public decimal OtherAllowance   { get; set; }
        public decimal PfDeduction      { get; set; }
        public decimal NetSalary        => GrossCTC - PfDeduction;

        // Dynamic company salary heads filled on CTC page
        public List<HRMSWebAPI.Models.OfferSalaryHeadDto>? SalaryHeads { get; set; } = new();

        // Letter meta
        public int     OfferId          { get; set; }
        public string? OfferCode        { get; set; }
        public string? CandidateCode    { get; set; }
        public string? IssuedBy         { get; set; }
        public string? IssuedDate       { get; set; }
    }
}
