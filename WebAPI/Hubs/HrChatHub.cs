using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace HRMSWebAPI.Hubs
{
    public class HrChatHub : Hub
    {
        private readonly IHrchatRepository _repo;

        // ✅ Track user connections (userId -> List of connectionIds)
        private static readonly ConcurrentDictionary<string, HashSet<string>> _userConnections
            = new ConcurrentDictionary<string, HashSet<string>>();

        public HrChatHub(IHrchatRepository repo)
        {
            _repo = repo;
        }

        // ✅ Register user connection when they connect
        public override async Task OnConnectedAsync()
        {
            // Get userId from query string: /hrchathub?userId=1
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Request.Query["userId"].ToString();

            if (!string.IsNullOrEmpty(userId))
            {
                // Add connection to tracking dictionary
                _userConnections.AddOrUpdate(
                    userId,
                    new HashSet<string> { Context.ConnectionId },
                    (key, existing) =>
                    {
                        existing.Add(Context.ConnectionId);
                        return existing;
                    }
                );

                Console.WriteLine($"🔌 User Connected:");
                Console.WriteLine($"   UserId: {userId}");
                Console.WriteLine($"   ConnectionId: {Context.ConnectionId}");
                Console.WriteLine($"   Total connections for user: {_userConnections[userId].Count}");

                // Send unread messages
                if (int.TryParse(userId, out int userIdInt))
                {
                    var unread = _repo.GetUnreadMessages(userIdInt);
                    await Clients.Caller.SendAsync("UnreadMessages", unread);
                    Console.WriteLine($"📬 Sent {unread.Count()} unread messages to user {userId}");
                }
            }
            else
            {
                Console.WriteLine($"⚠️ User connected without userId: {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        // ✅ Remove connection when user disconnects
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Find and remove this connection
            var connectionId = Context.ConnectionId;
            var userToRemove = _userConnections
                .FirstOrDefault(kvp => kvp.Value.Contains(connectionId));

            if (!string.IsNullOrEmpty(userToRemove.Key))
            {
                _userConnections[userToRemove.Key].Remove(connectionId);

                // Remove user entry if no more connections
                if (_userConnections[userToRemove.Key].Count == 0)
                {
                    _userConnections.TryRemove(userToRemove.Key, out _);
                }

                Console.WriteLine($"🔌 User Disconnected:");
                Console.WriteLine($"   UserId: {userToRemove.Key}");
                Console.WriteLine($"   ConnectionId: {connectionId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // ✅ Send message with proper user targeting
        public async Task SendMessage(ChatMessage message)
        {
            try
            {
                Console.WriteLine($"📤 SendMessage called:");
                Console.WriteLine($"   Sender: {message.SenderUserId} ({message.SenderRole})");
                Console.WriteLine($"   Receiver: {message.ReceiverUserId} ({message.ReceiverRole})");
                Console.WriteLine($"   ConversationId: {message.ConversationId}");
                Console.WriteLine($"   Message: {message.MessageText}");

                // ✅ CRITICAL: Validate message
                if (string.IsNullOrEmpty(message.ConversationId))
                {
                    Console.WriteLine("❌ ConversationId is null or empty");
                    await Clients.Caller.SendAsync("Error", "ConversationId is required");
                    return;
                }

                //if (message.SenderUserId == 0 || message.ReceiverUserId == 0)
                //{
                //    Console.WriteLine("❌ Invalid sender or receiver ID");
                //    await Clients.Caller.SendAsync("Error", "Invalid user IDs");
                //    return;
                //}

                // ✅ Insert into database
                long chatId = _repo.InsertChatMessage(message);

                if (chatId == 0)
                {
                    Console.WriteLine("❌ Failed to insert message - ChatId is 0");
                    await Clients.Caller.SendAsync("Error", "Failed to save message");
                    return;
                }

                message.ChatId = chatId;
                message.SentAt = DateTime.UtcNow;
                message.IsRead = false;

                Console.WriteLine($"✅ Message inserted with ChatId: {chatId}");

                // ✅ Send to receiver using tracked connections
                string receiverUserId = message.ReceiverUserId.ToString();

                if (_userConnections.TryGetValue(receiverUserId, out var receiverConnections))
                {
                    // Send to all receiver's connections
                    await Clients.Clients(receiverConnections.ToList())
                        .SendAsync("ReceiveMessage", message);

                    Console.WriteLine($"✅ Message sent to receiver (UserId: {receiverUserId}, Connections: {receiverConnections.Count})");
                }
                else
                {
                    Console.WriteLine($"⚠️ Receiver not connected (UserId: {receiverUserId})");
                }

                // ✅ Send confirmation to sender
                await Clients.Caller.SendAsync("MessageSent", message);
                Console.WriteLine($"✅ Confirmation sent to sender");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in SendMessage:");
                Console.WriteLine($"   Message: {ex.Message}");
                Console.WriteLine($"   StackTrace: {ex.StackTrace}");

                await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
                throw;
            }
        }

        // ✅ Mark messages as read
        public async Task MarkRead(int conversationId, int userId, int senderUserId)
        {
            try
            {
                Console.WriteLine($"👁️ MarkRead called:");
                Console.WriteLine($"   ConversationId: {conversationId}");
                Console.WriteLine($"   ReaderUserId: {userId}");
                Console.WriteLine($"   SenderUserId: {senderUserId}");

                bool success = _repo.MarkMessagesAsRead(conversationId, userId);

                if (success)
                {
                    // Notify sender that messages were read
                    string senderUserIdStr = senderUserId.ToString();

                    if (_userConnections.TryGetValue(senderUserIdStr, out var senderConnections))
                    {
                        await Clients.Clients(senderConnections.ToList())
                            .SendAsync("MessagesRead", new
                            {
                                ConversationId = conversationId,
                                ReaderUserId = userId
                            });

                        Console.WriteLine($"✅ Read receipt sent to sender (UserId: {senderUserId})");
                    }
                }
                else
                {
                    Console.WriteLine($"⚠️ MarkMessagesAsRead returned false");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in MarkRead: {ex.Message}");
            }
        }

        // ✅ Debug method to check active connections
        public async Task GetActiveUsers()
        {
            var activeUsers = _userConnections.Keys.ToList();
            await Clients.Caller.SendAsync("ActiveUsers", activeUsers);
            Console.WriteLine($"📊 Active users: {string.Join(", ", activeUsers)}");
        }
    }
}