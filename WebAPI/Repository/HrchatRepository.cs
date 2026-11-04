using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.SqlClient;

namespace HRMSWebAPI.Repository
{
    public class HrchatRepository:IHrchatRepository
    {

        // public long InsertChatMessage(ChatMessage chat)
        //{
        //    var p = new DynamicParameters();

        //    p.Add("@SenderUserId", chat.SenderUserId);       // string
        //    p.Add("@ReceiverUserId", chat.ReceiverUserId);   // string
        //    p.Add("@SenderRole", chat.SenderRole);
        //    p.Add("@ReceiverRole", chat.ReceiverRole);
        //    p.Add("@MessageText", chat.MessageText);
        //    p.Add("@AttachmentPath", chat.AttachmentPath);
        //    p.Add("@NotificationType", chat.NotificationType);
        //    var result = DataBaseFactory.QuerySP<ChatMessage>("ChatMessage_Ins", p).FirstOrDefault();
        //    return result?.ChatId ?? 0;
        //}


        // Insert Chat message / notification

        public long InsertChatMessage(ChatMessage chat)
        {
            //var p = new DynamicParameters();
            //p.Add("@SenderUserId", chat.SenderUserId);
            //p.Add("@ReceiverUserId", chat.ReceiverUserId);
            //p.Add("@SenderRole", chat.SenderRole);
            //p.Add("@ReceiverRole", chat.ReceiverRole);
            //p.Add("@MessageText", chat.MessageText);
            //p.Add("@AttachmentPath", chat.AttachmentPath);
            //p.Add("@NotificationType", chat.NotificationType);
            //p.Add("@RedirectUrl", chat.RedirectUrl);

            //var result = DataBaseFactory.QuerySP<ChatMessage>("ChatMessage_Ins", p).FirstOrDefault();
            //return result?.ChatId ?? 0;
            try
            {
                var p = new DynamicParameters();
                p.Add("@SenderUserId", chat.SenderUserId);
                p.Add("@ReceiverUserId", chat.ReceiverUserId);
                p.Add("@SenderRole", chat.SenderRole);
                p.Add("@ReceiverRole", chat.ReceiverRole);
                p.Add("@MessageText", chat.MessageText);
                p.Add("@AttachmentPath", chat.AttachmentPath);
                p.Add("@NotificationType", chat.NotificationType);
                p.Add("@RedirectUrl", chat.RedirectUrl);

                using var conn = DataBaseFactory.ConnString();
                var rawId = conn.ExecuteScalar<object>("dbo.ChatMessage_Ins", p, commandType: CommandType.StoredProcedure);
                if (rawId != null && long.TryParse(rawId.ToString(), out long chatId))
                {
                    return chatId;
                }
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HrchatRepository.InsertChatMessage] Error: {ex.Message}");
                return 0;
            }
        }

        // Get unread Notification for a user
        public List<ChatMessage> GetUnreadNotification(string receiverUserId,string receiverRole)

        {
            var p = new DynamicParameters();
            p.Add("@ReceiverUserId", receiverUserId);
            p.Add("@ReceiverRole", receiverRole);

            var messages = DataBaseFactory.QuerySP<ChatMessage>("Notification_GetUnread", p).ToList();
            return messages;
        }

        // Get all Notification for a conversation
        public List<ChatMessage> GetConversationNotification(string userId1, string userId2, int pageNumber = 1, int pageSize = 50)
        {
            var p = new DynamicParameters();
            p.Add("@UserId1", userId1);
            p.Add("@UserId2", userId2);
            p.Add("@PageNumber", pageNumber);
            p.Add("@PageSize", pageSize);

            var messages = DataBaseFactory.QuerySP<ChatMessage>("Notification_GetConversation", p).ToList();
            return messages;
        }

        //// Mark Notification as read
        //public bool MarkNotificationAsReads(string receiverUserId, string senderUserId)
        //{
        //    var p = new DynamicParameters();
        //    p.Add("@ReceiverUserId", receiverUserId);
        //    p.Add("@SenderUserId", senderUserId);

        //    var result = DataBaseFactory.QuerySP("Notification_MarkAsRead", p);
        //    return result > 0;
        //}

        public bool MarkNotificationAsReads(string receiverUserId, string senderUserId, string senderRole)
        {
            var p = new DynamicParameters();
            p.Add("@ReceiverUserId", receiverUserId);
            p.Add("@SenderUserId", senderUserId);
            p.Add("@SenderRole", senderRole);

            var result = DataBaseFactory.QuerySP("Notification_MarkAsRead", p);
            return result > 0;
        }



        //// Mark Notification as read
        //public bool MarkNotificationAsReads(long ChatId)
        //{
        //    var p = new DynamicParameters();
        //    p.Add("@ChatId", ChatId);


        //    var result = DataBaseFactory.QuerySP("Notification_MarkAsRead", p);
        //    return result > 0;
        //}

        // Get unread Notification count for a user
        //  public int GetUnreadNotificationCounts(string receiverUserId)
        public int GetUnreadNotificationCounts(string receiverUserId, string receiverRole = null)

        {
            var p = new DynamicParameters();
            p.Add("@ReceiverUserId", receiverUserId);
            p.Add("@ReceiverRole", receiverRole);


            var result = DataBaseFactory.QuerySP<dynamic>("Notification_GetUnreadCount", p).FirstOrDefault();
            return result?.UnreadCount ?? 0;
        }

        //Notification section END here







        // Fetch messages between two users
        public IEnumerable<ChatMessage> GetConversationMessagesByUsers(string userId1, string userId2, string role1, string role2)
         {
            var p = new DynamicParameters();
            p.Add("@UserId1", userId1);
            p.Add("@UserId2", userId2);
            p.Add("@Role1", role1);     // ✅ Pass sender role
        p.Add("@Role2", role2);

            return DataBaseFactory.QuerySP<ChatMessage>("ChatMessage_SelByUsers", p);
        }

        //public async Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(string currentUserId)
        //{
        //    var p = new DynamicParameters();
        //    p.Add("@CurrentUserId", currentUserId);

        //    return DataBaseFactory.QuerySP<dynamic>(
        //        "HR_Chat_SenderEmployeeList_Sel",
        //        p
        //    );
        //}



        // ==================================================================================

        // ✅ FIXED: Repository implementation (HrchatRepository.cs)



        //public async Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(string currentUserId, string currentUserRole)
        //{
        //    var p = new DynamicParameters();
        //    p.Add("@CurrentUserId", currentUserId);
        //    p.Add("@CurrentUserRole", currentUserRole); // ✅ NEW: Pass role

        //    Console.WriteLine($"📋 Repository: GetSenderEmployeeListAsync");
        //    Console.WriteLine($"   CurrentUserId: {currentUserId}");
        //    Console.WriteLine($"   CurrentUserRole: {currentUserRole}");

        //    var result = DataBaseFactory.QuerySP<dynamic>(
        //        "HR_Chat_SenderEmployeeList_Sel",
        //        p
        //    );

        //    Console.WriteLine($"   Returned: {result.Count()} senders");

        //    return result;
        //}




        // ✅ UPDATED: Repository method with search query parameter
        public async Task<IEnumerable<dynamic>> GetSenderEmployeeListAsync(
            string currentUserId,
            string currentUserRole,
            string searchQuery = null)
        {
            var p = new DynamicParameters();
            p.Add("@CurrentUserId", currentUserId);
            p.Add("@CurrentUserRole", currentUserRole);
            p.Add("@SearchQuery", searchQuery); // ✅ NEW: Add search parameter

            Console.WriteLine($"📋 Repository: GetSenderEmployeeListAsync");
            Console.WriteLine($"   CurrentUserId: {currentUserId}");
            Console.WriteLine($"   CurrentUserRole: {currentUserRole}");
            Console.WriteLine($"   SearchQuery: {searchQuery ?? "None"}");

            var result = DataBaseFactory.QuerySP<dynamic>(
                "HR_Chat_SenderEmployeeList_Sel",
                p
            );

            Console.WriteLine($"   Returned: {result.Count()} senders");

            return result;
        }


        public int MarkMessagesAsRead(string receiverUserId, string senderUserId)
        {
            var p = new DynamicParameters();
            p.Add("@ReceiverUserId", receiverUserId);
            p.Add("@SenderUserId", senderUserId);

            // SP returns no dataset, so we just call QuerySP
            var result = DataBaseFactory.QuerySP<dynamic>("ChatMessage_MarkRead", p);

            // Return 1 (success) – same pattern as your existing code
            return 1;
        }

        public int GetUnreadCount(string userId)
        {
            var p = new DynamicParameters();
            p.Add("@UserId", userId);

            // QuerySP returns a list of dynamic row(s)
            var result = DataBaseFactory.QuerySP<dynamic>("ChatMessage_GetUnreadCount", p);

            // SP returns: SELECT COUNT(*) AS UnreadCount
            var count = result.FirstOrDefault()?.UnreadCount ?? 0;

            return count;
        }

        //not in used GetConversationMessages
        public IEnumerable<ChatMessage> GetConversationMessages(string conversationId)
        {
            var p = new DynamicParameters();
            p.Add("@ConversationId", conversationId);
            return DataBaseFactory.QuerySP<ChatMessage>("ChatMessage_SelByConversation", p);
        }

        public bool MarkMessagesAsRead(int conversationId, int userId)
        {
            var p = new DynamicParameters();
            p.Add("@ConversationId", conversationId);
            p.Add("@UserId", userId);
            DataBaseFactory.QuerySP("ChatMessage_MarkRead", p);
            return true;
        }

        public IEnumerable<ChatMessage> GetUnreadMessages(int userId)
        {
            var p = new DynamicParameters();
            p.Add("@UserId", userId);
            return DataBaseFactory.QuerySP<ChatMessage>("ChatMessage_SelUnread", p);
        }

    }
}
