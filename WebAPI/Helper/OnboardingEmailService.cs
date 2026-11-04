using HRMSWebAPI.Models;
using HRMSWebAPI.Helper;
using System.Linq;

public class OnboardingEmailService
{
    private readonly EmailService _emailService;
    private readonly EmailGatewayService _emailGatewayService;
    private readonly string _frontendBaseUrl;
    private readonly bool _useEmailGateway;
    private readonly string _companyLogoFolderPath;
    private readonly string _apiBaseUrl;

    public OnboardingEmailService(
        EmailService emailService,
        EmailGatewayService emailGatewayService,
        IConfiguration configuration)
    {
        _emailService = emailService;
        _emailGatewayService = emailGatewayService;
        _frontendBaseUrl = configuration["FrontendSettings:Domain"];
        _useEmailGateway = configuration.GetValue<bool>("EmailSettings:UseEmailGateway", false);
        _companyLogoFolderPath = configuration["AppSettings:CompanyLogoFolderPath"]
            ?? configuration["CompanyLogoFolderPath"]
            ?? "";
        _apiBaseUrl = configuration["ApiSettings:Domain"] ?? "http://localhost:45392";
        Console.WriteLine($"[OnboardingEmail] CompanyLogoFolderPath = '{_companyLogoFolderPath}'");
        Console.WriteLine($"[OnboardingEmail] ApiBaseUrl = '{_apiBaseUrl}'");
    }

    // ✅ Existing method - for candidate onboarding invitation
    public async Task<bool> SendOnboardingEmailAsync(
        string candidateId,
        string candidateName,
        string candidateEmail,
        string candidateKey,
        string firstVisibleRoute,
        CompanyConfig? config = null,
        string companyId = "")
    {
        try
        {
            string onboardingLink = $"{_frontendBaseUrl}/#/on_boarding/{firstVisibleRoute}?key={candidateKey}";
            string subject = "Complete Your Onboarding - Action Required";
            string documentsHtml = GenerateDocumentsHtml(config);
            string companyName = config?.compname ?? "HR Book";
            // Resolve logo file path on server — CID embedding works in all email clients
            string logoFilePath = GetLogoFilePath(config?.Company_LogoPath ?? "");
            // Pass "cid:company_logo_cid" as the logo src — EmailService will attach the actual file
            string logoSrc = string.IsNullOrEmpty(logoFilePath) ? "" : "cid:company_logo_cid";
            string body = GetEmailBodyFromDb(candidateName, onboardingLink, "Initial", documentsHtml, companyName, logoSrc);

            if (_useEmailGateway)
            {
                // Gateway mode: INSERT into Empower_EmailServer..SAL_Email_Log
                var (success, errorMsg) = await _emailGatewayService.InsertToEmailQueueAsync(
                    candidateEmail, subject, body, companyId);

                if (!success)
                {
                    await LogEmailErrorAsync(candidateName, candidateEmail, subject, body, errorMsg);
                    Console.WriteLine($"[EmailGateway] INSERT failed: {errorMsg}");
                }

                return success;
            }
            else
            {
                // Direct SMTP mode — pass logo file path for CID embedding
                bool emailSent = await _emailService.SendEmailWithLogoAsync(
                    candidateEmail, subject, body, logoFilePath, companyId);
                return emailSent;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("========== ONBOARDING EMAIL ERROR ==========");
            Console.WriteLine(ex.ToString());
            Console.WriteLine("============================================");
            throw;
        }
    }

    // Re-Initiate email - sent when HR sends vendor back to correct and resubmit
    public async Task<bool> SendReInitiateEmailAsync(
        string candidateName,
        string candidateEmail,
        string candidateKey,
        string firstVisibleRoute)
    {
        try
        {
            string onboardingLink = $"{_frontendBaseUrl}/#/on_boarding/{firstVisibleRoute}?key={candidateKey}";
            string subject = "Action Required: Please Re-Submit Your Onboarding Form";
            // For re-initiate, we might not have the config easily available here unless passed,
            // but usually we can just pass empty or fetch it. For now, assuming no config is passed for ReInitiate,
            // or we could change the signature of SendReInitiateEmailAsync. Let's just pass empty for now.
            string body = GetEmailBodyFromDb(candidateName, onboardingLink, "ReInitiate", "");

            return await _emailService.SendEmailAsync(candidateEmail, subject, body);
        }
        catch (Exception ex)
        {
            Console.WriteLine("========== RE-INITIATE EMAIL ERROR ==========");
            Console.WriteLine(ex.ToString());
            throw;
        }
    }

    // Logs email errors to our own HRBook SAL_Email_Log when gateway insert fails
    private async Task LogEmailErrorAsync(
        string profileName,
        string toAddress,
        string subject,
        string mailBody,
        string errorMsg)
    {
        try
        {
            var p = new Dapper.DynamicParameters();
            p.Add("@ProfileName", profileName);
            p.Add("@TOAddress", toAddress);
            p.Add("@TOSubject", subject);
            p.Add("@MailBody", mailBody);
            p.Add("@ErrorMsg", errorMsg);
            await HRMSWebAPI.Helper.DataBaseFactory.QuerySPAsync("SAL_Email_Log_Ins", p);
        }
        catch (Exception logEx)
        {
            Console.WriteLine($"[LogEmailError] Failed to log error to SAL_Email_Log: {logEx.Message}");
        }
    }

    /// <summary>
    /// Resolves the company logo to an actual file path on disk.
    /// Used for CID embedding — EmailService attaches the file directly.
    /// </summary>
    private string GetLogoFilePath(string logoFileName)
    {
        if (string.IsNullOrWhiteSpace(logoFileName))
        {
            Console.WriteLine("[LogoFile] logoFileName is null/empty.");
            return "";
        }

        string safeName = System.IO.Path.GetFileName(logoFileName);
        var searchPaths = new List<string>();

        if (!string.IsNullOrWhiteSpace(_companyLogoFolderPath))
            searchPaths.Add(System.IO.Path.Combine(_companyLogoFolderPath, safeName));
        searchPaths.Add(System.IO.Path.Combine(@"d:\HRMS\Frontend\src\assets\Image\Logo", safeName));
        searchPaths.Add(System.IO.Path.Combine(@"D:\HRBOOK SSPL 10-06-2026\HrBook\Frontend\src\assets\Image\Logo", safeName));

        string? resolved = searchPaths.FirstOrDefault(p => System.IO.File.Exists(p));
        Console.WriteLine(resolved != null
            ? $"[LogoFile] ✅ Found: {resolved}"
            : $"[LogoFile] ❌ Not found: {safeName}");
        return resolved ?? "";
    }

    //  NEW method - for HR notification when candidate completes onboarding

    public async Task<bool> SendHRNotificationEmailAsync(
        string hrEmail,
        string candidateName,
        string candidateId,
        string candidateEmail,
        string candidateMobile,
        string candidateKey)
    {
        try
        {
            // Generate review link using candidate key
            string reviewLink = $"{_frontendBaseUrl}/#/candidate-review/{candidateKey}";

            string subject = $"New Onboarding Submission - {candidateName}";
            string body = GenerateHRNotificationEmailBody(
                candidateName,
                candidateId,
                candidateEmail,
                candidateMobile,
                reviewLink
            );

            bool emailSent = await _emailService.SendEmailAsync(hrEmail, subject, body);
            return emailSent;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending HR notification email: {ex.Message}");
            return false;
        }
    }


    private string GenerateHRNotificationEmailBody(
        string candidateName,
        string candidateId,
        string candidateEmail,
        string candidateMobile,
        string reviewLink)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            border-bottom: 3px solid #3498db;
        }}
        .content {{
            background-color: white;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }}
        .info-box {{
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .info-table {{
            width: 100%;
            border-collapse: collapse;
        }}
        .info-table td {{
            padding: 8px 0;
        }}
        .info-label {{
            font-weight: bold;
            width: 40%;
            color: #2c3e50;
        }}
        .button {{
            display: inline-block;
            background-color: #3498db;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
        }}
        .button:hover {{
            background-color: #2980b9;
        }}
        .note {{
            background-color: #e8f4f8;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #7f8c8d;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2 style='margin: 0;'>📋 New Candidate Onboarding Submission</h2>
        </div>
        
        <div class='content'>
            <p>Dear HR Team,</p>
            
            <p>A new candidate has successfully completed their onboarding form and submitted all required details.</p>
            
            <div class='info-box'>
                <h3 style='margin-top: 0; color: #2c3e50;'>Candidate Information</h3>
                <table class='info-table'>
                    <tr>
                        <td class='info-label'>Name:</td>
                        <td>{candidateName}</td>
                    </tr>
                    
                    <tr>
                        <td class='info-label'>Email:</td>
                        <td>{candidateEmail}</td>
                    </tr>
                    <tr>
                        <td class='info-label'>Mobile:</td>
                        <td>{candidateMobile}</td>
                    </tr>
                    <tr>
                        <td class='info-label'>Submission Date:</td>
                        <td>{DateTime.Now:dd-MMM-yyyy HH:mm}</td>
                    </tr>
                </table>
            </div>
            
           
            
           
            
            <p>Please review the candidate's information at your earliest convenience.</p>
            
            <p>Best regards,<br>
            <strong>HR Book</strong></p>
            
            <div class='footer'>
                <p>This is an automated email from the HR Management System.</p>
                <p>Please do not reply to this email.</p>
                
            </div>
        </div>
    </div>
</body>
</html>
";
    }



    private string GenerateDocumentsHtml(CompanyConfig? config)
    {
        var docList = new List<string>();
        if (config != null)
        {
            // Sequence: BasicInfo → Photo → Aadhaar → PAN → Voter → DL/Vehicle → Edu → Exp → Family → Bank → VendorGST → E-Shram → Ayushman → Signature
            if (config.basicinfo_visible)
                docList.Add("Basic Information" + (config.basicinfo_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.photograph_visible)
                docList.Add("Recent Photograph" + (config.photograph_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.aadhaar_visible)
                docList.Add("Aadhaar Card" + (config.aadhaar_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.pan_visible)
                docList.Add("PAN Card" + (config.pan_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.voter_visible)
                docList.Add("Voter ID" + (config.voter_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.driving_licence_visible)
                docList.Add("Driving Licence" + (config.driving_licence_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.vehicle_insurance_visible)
                docList.Add("Vehicle Insurance" + (config.vehicle_insurance_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.vehicle_rc_visible)
                docList.Add("Vehicle RC" + (config.vehicle_rc_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.qualification_visible)
                docList.Add("Educational Qualifications" + (config.qualification_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.experience_visible)
                docList.Add("Work Experience Details" + (config.experience_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.family_visible)
                docList.Add("Family Details" + (config.family_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.bankaccount_visible)
                docList.Add("Bank Account / Cancelled Cheque" + (config.bankaccount_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.vendor_gst_visible)
                docList.Add("Vendor GST Details" + (config.vendor_gst_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.eshram_visible)
                docList.Add("E-Shram Card" + (config.eshram_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.ayushman_visible)
                docList.Add("Ayushman Card" + (config.ayushman_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
            if (config.signature_visible)
                docList.Add("Signature Image" + (config.signature_mandatory ? " <span style='color:red; font-size:12px;'>*(Mandatory)</span>" : ""));
        }

        string documentsHtml = "";
        if (docList.Count > 0)
        {
            var listItems = string.Join("", docList.Select(d => $"<li style='margin-bottom: 6px;'>{d}</li>"));
            documentsHtml = $@"
            <div style='background-color: #f0f7ff; border: 1px solid #b8daff; border-left: 4px solid #007bff; padding: 15px; border-radius: 4px; margin: 20px 0;'>
                <strong style='color: #004085; font-size: 15px;'>&#128196; Required Documents &amp; Parameters:</strong>
                <p style='margin: 8px 0 6px 0; color: #555; font-size: 13px;'>Please keep the following documents ready before completing your onboarding:</p>
                <ul style='margin: 0; padding-left: 20px; color: #333;'>
                    {listItems}
                </ul>
            </div>";
        }
        return documentsHtml;
    }

    private string GetEmailBodyFromDb(string candidateName, string onboardingLink, string emailType, string documentsHtml = "", string companyName = "", string companyLogoPath = "")
    {
        try
        {
            var p = new Dapper.DynamicParameters();
            p.Add("@CandidateName", candidateName);
            p.Add("@OnboardingLink", onboardingLink);
            p.Add("@EmailType", emailType);
            // Use size -1 = NVARCHAR(MAX) to handle large HTML/Base64 strings without truncation
            p.Add("@DocumentsHtml", documentsHtml, System.Data.DbType.String, size: -1);
            p.Add("@CompanyName", companyName);
            p.Add("@CompanyLogoPath", companyLogoPath, System.Data.DbType.String, size: -1);

            var result = HRMSWebAPI.Helper.DataBaseFactory.QuerySP<dynamic>("USP_Get_OnboardingEmailBody", p, "GetEmailBody");
            var row = result?.FirstOrDefault();

            if (row != null && ((IDictionary<string, object>)row).ContainsKey("MailBody"))
            {
                return ((IDictionary<string, object>)row)["MailBody"]?.ToString() ?? string.Empty;
            }
            return string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching email body from DB: {ex.Message}");
            return string.Empty;
        }
    }
}