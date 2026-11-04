namespace HRMSWebAPI.Models
{
    public class Hrchat
    {
        public long ChatId { get; set; }
    }
    public class ChatMessage
    {
        public long ChatId { get; set; }
        public string ConversationId { get; set; }
        public string SenderUserId { get; set; }
        public string ReceiverUserId { get; set; }
        public string SenderRole { get; set; }
        public string ReceiverRole { get; set; }
        public string MessageText { get; set; }
        public string AttachmentPath { get; set; }
        public DateTime SentAt { get; set; }
        public bool IsRead { get; set; }
        public string? SenderName { get; set; }
        public string? NotificationType { get; set; }

        public string? RedirectUrl { get; set; }
    }



    public class MarkAsReadRequest
    {
        public long? ChatId { get; set; }
        public string? SenderUserId { get; set; }
        public string SenderRole { get; set; } // HR / EMP

    }



}
