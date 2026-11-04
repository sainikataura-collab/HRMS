using Dapper;
using HRMSWebAPI.Hubs;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.SignalR;
using System.Data;

namespace HRMSWebAPI.Helper
{
    public interface IRecruitmentNotificationService
    {
        Task<int> SendVendorJobAssignmentNotificationAsync(string companyId, string vendorId, string mrfCode, string jobTitle, string senderUserId = "System");
        Task<bool> SendWorkflowApprovalNotificationAsync(string companyId, string approverUserId, string mrfCode, string jobTitle, int level, string senderUserId = "System");
        Task<bool> SendWorkflowDecisionNotificationAsync(string companyId, string requesterUserId, string mrfCode, string jobTitle, string decisionStatus, string senderUserId = "System");
        Task<int> SendVendorCandidateStatusNotificationAsync(string companyId, string vendorId, string candidateName, string mrfCode, string statusText, string senderUserId = "System");
        Task<int> SendVendorCandidateSelectedActionNotificationAsync(string companyId, string vendorId, string candidateName, string mrfCode, long appId, string senderUserId = "System");
        Task<int> SendHrCandidateSubmissionNotificationAsync(string companyId, string hrUserId, string vendorName, string mrfCode, int candidateCount, string senderUserId = "Vendor");
        Task<int> SendWorkflowApprovalNotificationToLevelApproversAsync(string companyId, string mrfCode, string jobTitle, int targetLevel, string? specificApproverId = null, string senderUserId = "System");
    }

    public class RecruitmentNotificationService : IRecruitmentNotificationService
    {
        private readonly IHrchatRepository _hrchatRepo;
        private readonly IHubContext<ChatHub> _hubContext;

        public RecruitmentNotificationService(IHrchatRepository hrchatRepo, IHubContext<ChatHub> hubContext)
        {
            _hrchatRepo = hrchatRepo;
            _hubContext = hubContext;
        }

        public async Task<int> SendVendorJobAssignmentNotificationAsync(string companyId, string vendorId, string mrfCode, string jobTitle, string senderUserId = "System")
        {
            int dispatchedCount = 0;
            try
            {
                if (string.IsNullOrWhiteSpace(vendorId)) return 0;

                using var conn = DataBaseFactory.ConnString();
                var vendorUsers = (await conn.QueryAsync<dynamic>(
                    "dbo.USP_REC_GetVendorUsersForNotification",
                    new { companyId = companyId ?? "", vendorId = vendorId },
                    commandType: CommandType.StoredProcedure)).ToList();

                foreach (var vu in vendorUsers)
                {
                    string targetUserId = vu.pk_userId?.ToString();
                    if (string.IsNullOrEmpty(targetUserId)) continue;

                    var chatMsg = new ChatMessage
                    {
                        SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "System" : senderUserId,
                        ReceiverUserId = targetUserId,
                        SenderRole = "HR",
                        ReceiverRole = "Vendor", // Explicitly Vendor role for vendor user accounts
                        NotificationType = "VENDOR_ASSIGNMENT",
                        MessageText = $"New Mandate Assigned: {jobTitle} ({mrfCode})",
                        RedirectUrl = "/dash/recruitment/vendor-candidates",
                        SentAt = DateTime.UtcNow,
                        IsRead = false,
                        SenderName = "CJ DARCL Talent Acquisition"
                    };

                    long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                    if (chatId > 0)
                    {
                        dispatchedCount++;
                        // SignalR group for Vendor
                        string groupKey = $"{targetUserId}:Vendor";
                        await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });

                        // Fallback broadcast to user group directly in case connection didn't specify suffix
                        await _hubContext.Clients.Group(targetUserId).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending vendor notification: {ex.Message}");
            }
            return dispatchedCount;
        }

        public async Task<bool> SendWorkflowApprovalNotificationAsync(string companyId, string approverUserId, string mrfCode, string jobTitle, int level, string senderUserId = "System")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(approverUserId)) return false;

                var chatMsg = new ChatMessage
                {
                    SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "System" : senderUserId,
                    ReceiverUserId = approverUserId,
                    SenderRole = "HR",
                    ReceiverRole = "HR",
                    NotificationType = "MRF_APPROVAL",
                    MessageText = $"Requisition {mrfCode} ({jobTitle}) is awaiting your Level {level} approval",
                    RedirectUrl = $"/dash/recruitment/recruitmentdashboard/job-management?tab=Approvals&level=L{level}",
                    SentAt = DateTime.UtcNow,
                    IsRead = false,
                    SenderName = "ATS Workflow"
                };

                long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                if (chatId > 0)
                {
                    string groupKey = $"{approverUserId}:HR";
                    await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });

                    await _hubContext.Clients.Group(approverUserId).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending approval notification: {ex.Message}");
            }
            return false;
        }

        public async Task<bool> SendWorkflowDecisionNotificationAsync(string companyId, string requesterUserId, string mrfCode, string jobTitle, string decisionStatus, string senderUserId = "System")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterUserId)) return false;

                var chatMsg = new ChatMessage
                {
                    SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "System" : senderUserId,
                    ReceiverUserId = requesterUserId,
                    SenderRole = "HR",
                    ReceiverRole = "HR",
                    NotificationType = "MRF_DECISION",
                    MessageText = $"Requisition {mrfCode} ({jobTitle}) has been {decisionStatus.ToUpper()}",
                    RedirectUrl = "/dash/recruitment/recruitmentdashboard/job-management",
                    SentAt = DateTime.UtcNow,
                    IsRead = false,
                    SenderName = "ATS Workflow"
                };

                long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                if (chatId > 0)
                {
                    string groupKey = $"{requesterUserId}:HR";
                    await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });

                    await _hubContext.Clients.Group(requesterUserId).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending decision notification: {ex.Message}");
            }
            return false;
        }

        public async Task<int> SendVendorCandidateStatusNotificationAsync(string companyId, string vendorId, string candidateName, string mrfCode, string statusText, string senderUserId = "System")
        {
            int dispatchedCount = 0;
            try
            {
                if (string.IsNullOrWhiteSpace(vendorId)) return 0;

                using var conn = DataBaseFactory.ConnString();
                var vendorUsers = (await conn.QueryAsync<dynamic>(
                    "dbo.USP_REC_GetVendorUsersForNotification",
                    new { companyId = companyId ?? "", vendorId = vendorId },
                    commandType: CommandType.StoredProcedure)).ToList();

                foreach (var vu in vendorUsers)
                {
                    string targetUserId = vu.pk_userId?.ToString();
                    if (string.IsNullOrEmpty(targetUserId)) continue;

                    var chatMsg = new ChatMessage
                    {
                        SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "System" : senderUserId,
                        ReceiverUserId = targetUserId,
                        SenderRole = "HR",
                        ReceiverRole = "Vendor",
                        NotificationType = "CANDIDATE_STATUS",
                        MessageText = $"Candidate Update: {candidateName} ({mrfCode}) - Status: {statusText}",
                        RedirectUrl = "/dash/recruitment/vendor-candidates",
                        SentAt = DateTime.UtcNow,
                        IsRead = false,
                        SenderName = "CJ DARCL Talent Acquisition"
                    };

                    long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                    if (chatId > 0)
                    {
                        dispatchedCount++;
                        string groupKey = $"{targetUserId}:Vendor";
                        await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });

                        await _hubContext.Clients.Group(targetUserId).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending vendor status notification: {ex.Message}");
            }
            return dispatchedCount;
        }

        public async Task<int> SendVendorCandidateSelectedActionNotificationAsync(string companyId, string vendorId, string candidateName, string mrfCode, long appId, string senderUserId = "System")
        {
            int dispatchedCount = 0;
            try
            {
                if (string.IsNullOrWhiteSpace(vendorId)) return 0;

                using var conn = DataBaseFactory.ConnString();
                var vendorUsers = (await conn.QueryAsync<dynamic>(
                    "dbo.USP_REC_GetVendorUsersForNotification",
                    new { companyId = companyId ?? "", vendorId = vendorId },
                    commandType: CommandType.StoredProcedure)).ToList();

                foreach (var vu in vendorUsers)
                {
                    string targetUserId = vu.pk_userId?.ToString();
                    if (string.IsNullOrEmpty(targetUserId)) continue;

                    var chatMsg = new ChatMessage
                    {
                        SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "System" : senderUserId,
                        ReceiverUserId = targetUserId,
                        SenderRole = "HR",
                        ReceiverRole = "Vendor",
                        NotificationType = "CANDIDATE_SELECTED_UPLOAD_DETAILS",
                        MessageText = $"Action Required: Your candidate {candidateName} has been SELECTED for {mrfCode}. Please upload the candidate's onboarding dossier details and mandatory documents.",
                        RedirectUrl = "/dash/recruitment/recruitmentdashboard/vendor-portal?tab=selected",
                        SentAt = DateTime.UtcNow,
                        IsRead = false,
                        SenderName = "CJ DARCL Talent Acquisition"
                    };

                    long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                    if (chatId > 0)
                    {
                        dispatchedCount++;
                        string groupKey = $"{targetUserId}:Vendor";
                        await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });

                        await _hubContext.Clients.Group(targetUserId).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending vendor selected notification: {ex.Message}");
            }
            return dispatchedCount;
        }

        public async Task<int> SendHrCandidateSubmissionNotificationAsync(string companyId, string hrUserId, string vendorName, string mrfCode, int candidateCount, string senderUserId = "Vendor")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(hrUserId)) return 0;

                var chatMsg = new ChatMessage
                {
                    SenderUserId = string.IsNullOrWhiteSpace(senderUserId) ? "Vendor" : senderUserId,
                    ReceiverUserId = hrUserId,
                    SenderRole = "Vendor",
                    ReceiverRole = "HR",
                    NotificationType = "VENDOR_SUBMISSION",
                    MessageText = $"Partner {vendorName} submitted {candidateCount} candidate(s) for {mrfCode}",
                    RedirectUrl = "/dash/recruitment/candidate-pipeline",
                    SentAt = DateTime.UtcNow,
                    IsRead = false,
                    SenderName = vendorName ?? "Vendor Partner"
                };

                long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                if (chatId > 0)
                {
                    string groupKey = $"{hrUserId}:HR";
                    await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });

                    await _hubContext.Clients.Group(hrUserId).SendAsync("ReceiveNotification", new
                    {
                        senderId = chatMsg.SenderUserId,
                        senderName = chatMsg.SenderName,
                        senderRole = chatMsg.SenderRole,
                        receiverRole = chatMsg.ReceiverRole,
                        message = chatMsg.MessageText,
                        notificationType = chatMsg.NotificationType,
                        redirectUrl = chatMsg.RedirectUrl,
                        timestamp = DateTime.UtcNow,
                        chatId = chatId
                    });
                    return 1;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending HR submission notification: {ex.Message}");
            }
            return 0;
        }

        public async Task<int> SendWorkflowApprovalNotificationToLevelApproversAsync(
            string companyId,
            string mrfCode,
            string jobTitle,
            int targetLevel,
            string? specificApproverId = null,
            string senderUserId = "System")
        {
            int dispatchedCount = 0;
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var approvers = (await conn.QueryAsync<dynamic>(
                    "dbo.USP_REC_GetApproverUsersForNotification",
                    new
                    {
                        CompanyId = companyId ?? "",
                        ApprovalLevel = targetLevel,
                        SpecificApproverId = specificApproverId
                    },
                    commandType: CommandType.StoredProcedure)).ToList();

                Console.WriteLine($"[RecruitmentNotificationService] Sending L{targetLevel} notification for {mrfCode} (Company: '{companyId}'). Found {approvers.Count} approver(s).");

                foreach (var approver in approvers)
                {
                    string targetUserId = approver.pk_userId?.ToString();
                    if (string.IsNullOrWhiteSpace(targetUserId)) continue;

                    // If sender matches target, use System to prevent client-side self-message suppression
                    string effectiveSenderId = (!string.IsNullOrWhiteSpace(senderUserId) && senderUserId != targetUserId)
                        ? senderUserId
                        : "System";

                    var chatMsg = new ChatMessage
                    {
                        SenderUserId = effectiveSenderId,
                        ReceiverUserId = targetUserId,
                        SenderRole = "HR",
                        ReceiverRole = "HR",
                        NotificationType = $"MRF_APPROVAL_L{targetLevel}",
                        MessageText = $"Requisition {mrfCode} ({jobTitle}) is awaiting your Level {targetLevel} approval",
                        RedirectUrl = $"/dash/recruitment/recruitmentdashboard/job-management?tab=Approvals&level=L{targetLevel}",
                        SentAt = DateTime.UtcNow,
                        IsRead = false,
                        SenderName = "ATS Workflow"
                    };

                    long chatId = _hrchatRepo.InsertChatMessage(chatMsg);
                    Console.WriteLine($"[RecruitmentNotificationService] Target: {targetUserId}, Inserted ChatId: {chatId}");
                    if (chatId > 0)
                    {
                        dispatchedCount++;

                        string groupKey = $"{targetUserId}:HR";
                        await _hubContext.Clients.Group(groupKey).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });

                        await _hubContext.Clients.Group(targetUserId).SendAsync("ReceiveNotification", new
                        {
                            senderId = chatMsg.SenderUserId,
                            senderName = chatMsg.SenderName,
                            senderRole = chatMsg.SenderRole,
                            receiverRole = chatMsg.ReceiverRole,
                            message = chatMsg.MessageText,
                            notificationType = chatMsg.NotificationType,
                            redirectUrl = chatMsg.RedirectUrl,
                            timestamp = DateTime.UtcNow,
                            chatId = chatId
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[RecruitmentNotificationService] Error sending Level {targetLevel} approval notification: {ex.Message}");
            }
            return dispatchedCount;
        }
    }
}
