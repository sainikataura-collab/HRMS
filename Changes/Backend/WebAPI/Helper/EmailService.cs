using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;
using Dapper;
using HRMSWebAPI.Models;
using Microsoft.Extensions.Configuration;

namespace HRMSWebAPI.Helper
{
    public class EmailService
    {
        private readonly string smtpServer;
        private readonly int smtpPort;
        private readonly string smtpUser;
        private readonly string smtpPass;
        private readonly string _dbName;
        private readonly string? _defaultCompanyId;

        public EmailService(IConfiguration configuration, string? defaultCompanyId = null)
        {
            smtpServer = configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            smtpPort = int.TryParse(configuration["EmailSettings:SmtpPort"], out int p) ? p : 587;
            smtpUser = configuration["EmailSettings:SmtpUser"] ?? "";
            smtpPass = configuration["EmailSettings:SmtpPass"] ?? "";
            _defaultCompanyId = defaultCompanyId;

            var mainConn = configuration.GetConnectionString("WebApplication1DBConnection") ?? "";
            try
            {
                var builder = new System.Data.SqlClient.SqlConnectionStringBuilder(mainConn);
                _dbName = builder.InitialCatalog ?? "HRBook";
            }
            catch
            {
                _dbName = "HRBook";
            }
        }

        /// <summary>
        /// Retrieves SMTP configuration dynamically from Comm_Email_Config via Stored Procedure Comm_EmailConfig_Edit.
        /// Zero inline SQL.
        /// </summary>
        public static async Task<EmailConfigMst?> GetCompanyEmailConfigAsync(string? companyId)
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var p = new DynamicParameters();
                p.Add("@fk_companyId", companyId, DbType.String);

                var configs = await conn.QueryAsync<EmailConfigMst>(
                    "Comm_EmailConfig_Edit",
                    p,
                    commandType: CommandType.StoredProcedure);

                return configs.FirstOrDefault();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Failed to load Comm_EmailConfig_Edit for company [{companyId}]: {ex.Message}");
                return null;
            }
        }

        private async Task<(string server, int port, string user, string pass, bool ssl, string from, string? companyId)> ResolveCredentialsAsync(string? companyId)
        {
            var targetCompany = !string.IsNullOrWhiteSpace(companyId) ? companyId : _defaultCompanyId;
            var cfg = await GetCompanyEmailConfigAsync(targetCompany);

            string server = !string.IsNullOrWhiteSpace(cfg?.host) ? cfg.host : smtpServer;
            int port = cfg != null && cfg.port.HasValue && cfg.port.Value > 0 ? cfg.port.Value : smtpPort;
            string user = !string.IsNullOrWhiteSpace(cfg?.userName) ? cfg.userName : smtpUser;
            string pass = !string.IsNullOrWhiteSpace(cfg?.password) ? cfg.password : smtpPass;
            bool ssl = cfg?.sslEnabled ?? true;
            string from = !string.IsNullOrWhiteSpace(cfg?.fromEmailAddress) ? cfg.fromEmailAddress : user;

            return (server, port, user, pass, ssl, from, cfg?.fk_companyId ?? targetCompany);
        }

        private async Task LogEmailAuditAsync(
            string toEmail, string subject, string body, bool isSuccess, string? errorMsg,
            string server, int port, string user, string pass, bool ssl, string from,
            string? companyId, string? documentPath)
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var p = new DynamicParameters();
                p.Add("@TOAddress", toEmail, DbType.String);
                p.Add("@TOSubject", subject, DbType.String);
                p.Add("@MailBody", body, DbType.String);
                p.Add("@status", isSuccess ? 1 : 0, DbType.Int32);
                p.Add("@ErrorMsg", errorMsg, DbType.String);
                p.Add("@fk_companyId", companyId, DbType.String);
                p.Add("@host", server, DbType.String);
                p.Add("@port", port, DbType.Int32);
                p.Add("@userName", user, DbType.String);
                p.Add("@password", pass, DbType.String);
                p.Add("@sslEnabled", ssl, DbType.Boolean);
                p.Add("@fromEmailAddress", from, DbType.String);
                p.Add("@DocumentPath", documentPath, DbType.String);
                p.Add("@dbName", _dbName, DbType.String);
                p.Add("@ProfileName", "Recruitment", DbType.String);

                await conn.ExecuteAsync("SAL_Email_Log_Ins", p, commandType: CommandType.StoredProcedure);
            }
            catch (Exception logEx)
            {
                Console.WriteLine($"[EmailService] Failed to log email audit: {logEx.Message}");
            }
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, string? companyId = null)
        {
            return await SendEmailWithLogoAsync(toEmail, subject, body, null, companyId);
        }

        public async Task<bool> SendEmailWithMultipleAttachmentsAsync(
            string toEmail, string subject, string body,
            List<(byte[] Bytes, string FileName)> attachments,
            string? companyId = null,
            string? documentPath = null)
        {
            var creds = await ResolveCredentialsAsync(companyId);
            string? docPaths = !string.IsNullOrWhiteSpace(documentPath)
                ? documentPath.Replace(", ", ";").Replace(",", ";")
                : ((attachments != null && attachments.Count > 0)
                    ? string.Join(";", attachments.ConvertAll(a => a.FileName))
                    : null);

            try
            {
                using var client = new SmtpClient(creds.server, creds.port)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(creds.user, creds.pass),
                    EnableSsl = creds.ssl,
                    DeliveryMethod = SmtpDeliveryMethod.Network
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(creds.from),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                foreach (var addr in toEmail.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var clean = addr.Trim();
                    if (!string.IsNullOrWhiteSpace(clean))
                        mailMessage.To.Add(clean);
                }

                var openedStreams = new List<MemoryStream>();
                try
                {
                    if (attachments != null)
                    {
                        foreach (var att in attachments)
                        {
                            if (att.Bytes != null && att.Bytes.Length > 0)
                            {
                                var ms = new MemoryStream(att.Bytes);
                                openedStreams.Add(ms);
                                string mimeType = att.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)
                                    ? "application/pdf"
                                    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                                mailMessage.Attachments.Add(new Attachment(ms, att.FileName, mimeType));
                            }
                        }
                    }

                    await client.SendMailAsync(mailMessage);
                }
                finally
                {
                    foreach (var s in openedStreams)
                    {
                        s.Dispose();
                    }
                }

                await LogEmailAuditAsync(toEmail, subject, body, true, null,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, docPaths);

                return true;
            }
            catch (Exception ex)
            {
                await LogEmailAuditAsync(toEmail, subject, body, false, ex.Message,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, docPaths);
                Console.WriteLine($"[EmailService] Error sending email with multiple attachments: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendEmailWithAttachmentAsync(
            string toEmail, string subject, string body,
            byte[] attachmentBytes, string attachmentFileName,
            string? companyId = null, string? documentPath = null)
        {
            var creds = await ResolveCredentialsAsync(companyId);
            try
            {
                using var client = new SmtpClient(creds.server, creds.port)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(creds.user, creds.pass),
                    EnableSsl = creds.ssl,
                    DeliveryMethod = SmtpDeliveryMethod.Network
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(creds.from),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                foreach (var addr in toEmail.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var clean = addr.Trim();
                    if (!string.IsNullOrWhiteSpace(clean))
                        mailMessage.To.Add(clean);
                }

                if (attachmentBytes != null && attachmentBytes.Length > 0)
                {
                    using var ms = new MemoryStream(attachmentBytes);
                    string mimeType = attachmentFileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)
                        ? "application/pdf"
                        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    mailMessage.Attachments.Add(new Attachment(ms, attachmentFileName, mimeType));

                    await client.SendMailAsync(mailMessage);
                }
                else
                {
                    await client.SendMailAsync(mailMessage);
                }

                string docPath = !string.IsNullOrWhiteSpace(documentPath) ? documentPath : attachmentFileName;
                await LogEmailAuditAsync(toEmail, subject, body, true, null,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, docPath);

                return true;
            }
            catch (Exception ex)
            {
                await LogEmailAuditAsync(toEmail, subject, body, false, ex.Message,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, documentPath ?? attachmentFileName);
                Console.WriteLine($"[EmailService] Error sending email with attachment: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> SendEmailWithLogoAsync(
            string toEmail, string subject, string body, string? logoFilePath,
            string? companyId = null)
        {
            var creds = await ResolveCredentialsAsync(companyId);
            try
            {
                using var client = new SmtpClient(creds.server, creds.port)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(creds.user, creds.pass),
                    EnableSsl = creds.ssl,
                    DeliveryMethod = SmtpDeliveryMethod.Network
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(creds.from),
                    Subject = subject,
                    IsBodyHtml = true
                };

                foreach (var addr in toEmail.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    var clean = addr.Trim();
                    if (!string.IsNullOrWhiteSpace(clean))
                        mailMessage.To.Add(clean);
                }

                if (!string.IsNullOrWhiteSpace(logoFilePath) && File.Exists(logoFilePath))
                {
                    var htmlView = AlternateView.CreateAlternateViewFromString(body, null, "text/html");
                    var logoResource = new LinkedResource(logoFilePath)
                    {
                        ContentId = "company_logo_cid",
                        TransferEncoding = TransferEncoding.Base64
                    };
                    string ext = Path.GetExtension(logoFilePath).ToLowerInvariant();
                    logoResource.ContentType = new ContentType(ext switch
                    {
                        ".png" => "image/png",
                        ".jpg" => "image/jpeg",
                        ".jpeg" => "image/jpeg",
                        ".gif" => "image/gif",
                        _ => "image/png"
                    });
                    htmlView.LinkedResources.Add(logoResource);
                    mailMessage.AlternateViews.Add(htmlView);
                }
                else
                {
                    mailMessage.Body = body;
                }

                await client.SendMailAsync(mailMessage);

                await LogEmailAuditAsync(toEmail, subject, body, true, null,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, null);

                return true;
            }
            catch (Exception ex)
            {
                await LogEmailAuditAsync(toEmail, subject, body, false, ex.Message,
                    creds.server, creds.port, creds.user, creds.pass, creds.ssl, creds.from, creds.companyId, null);
                Console.WriteLine($"[EmailService] Error sending email: {ex.Message}");
                return false;
            }
        }
    }
}
