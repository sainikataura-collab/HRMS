using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IHrchatRepository
    {
        long InsertChatMessage(ChatMessage chat);
        IEnumerable<ChatMessage> GetConversationMessagesByUsers(string userId1, string userId2, string role1, string role2);
        //Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(string currentUserId);

        // ✅ UPDATED: Add role parameter
     //   Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(string currentUserId, string currentUserRole);
        Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(
            string currentUserId,
            string currentUserRole,
            string searchQuery = null);
        int MarkMessagesAsRead(string receiverUserId, string senderUserId);
        int GetUnreadCount(string userId);

        //not in used
        IEnumerable<ChatMessage> GetConversationMessages(string conversationId);
        bool MarkMessagesAsRead(int conversationId, int userId);
        IEnumerable<ChatMessage> GetUnreadMessages(int userId);




        //FOR Notification

        List<ChatMessage> GetUnreadNotification(string receiverUserId, string receiverRole);
        List<ChatMessage> GetConversationNotification(string userId1, string userId2, int pageNumber = 1, int pageSize = 50);


        bool MarkNotificationAsReads(string receiverUserId, string senderUserId, string senderRole);

        //bool MarkNotificationAsReads(string receiverUserId, string senderUserId);
        //bool MarkNotificationAsReads(long ChatId);
        //int GetUnreadNotificationCounts(string receiverUserId);
        int GetUnreadNotificationCounts(string receiverUserId, string receiverRole = null);



    }
}
