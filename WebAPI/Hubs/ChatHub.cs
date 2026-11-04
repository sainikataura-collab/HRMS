

//using Microsoft.AspNetCore.SignalR;

//namespace HRMSWebAPI.Hubs
//{
//    public class ChatHub : Hub
//    {
//        // Maps the connection to a specific User ID group
//        public async Task JoinChat(string userId)
//        {
//            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
//        }
//    }
//}




//using Microsoft.AspNetCore.SignalR;
//using System.Collections.Concurrent;

//namespace HRMSWebAPI.Hubs
//{
//    public class ChatHub : Hub
//    {
//        // Track active connections (optional, for debugging)
//        private static readonly ConcurrentDictionary<string, string> _connections = new();

//        public override async Task OnConnectedAsync()
//        {
//            Console.WriteLine($"✅ Client connected: {Context.ConnectionId}");
//            await base.OnConnectedAsync();
//        }

//        public override async Task OnDisconnectedAsync(Exception? exception)
//        {
//            // Remove from tracking
//            var userId = _connections.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
//            if (userId != null)
//            {
//                _connections.TryRemove(userId, out _);
//                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
//                Console.WriteLine($"❌ User {userId} disconnected");
//            }

//            await base.OnDisconnectedAsync(exception);
//        }

//        /// <summary>
//        /// Add the connection to a user-specific group
//        /// </summary>
//        public async Task JoinChat(string userId)
//        {
//            if (string.IsNullOrEmpty(userId))
//            {
//                Console.WriteLine("⚠️ JoinChat called with empty userId");
//                return;
//            }

//            // Track the connection
//            _connections[userId] = Context.ConnectionId;

//            // Add to group
//            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
//            Console.WriteLine($"✅ User {userId} joined chat group (ConnectionId: {Context.ConnectionId})");
//        }

//        /// <summary>
//        /// Optional: Test method to send notification from client
//        /// </summary>
//        public async Task SendNotificationToUser(string targetUserId, string message)
//        {
//            await Clients.Group(targetUserId).SendAsync("ReceiveNotification", new
//            {
//                senderId = "System",
//                message = message,
//                timestamp = DateTime.UtcNow
//            });

//            Console.WriteLine($"📤 Sent notification to user {targetUserId}: {message}");
//        }







//        /// <summary>
//        /// ✅ NEW: Send typing indicator
//        /// </summary>
//        public async Task SendTypingIndicator(string receiverUserId, string senderUserId, string senderName, bool isTyping)
//        {
//            await Clients.Group(receiverUserId).SendAsync("ReceiveTypingIndicator", new
//            {
//                senderId = senderUserId,
//                senderName = senderName,
//                isTyping = isTyping,
//                timestamp = DateTime.UtcNow
//            });

//            Console.WriteLine($"⌨️ Typing indicator: {senderName} {(isTyping ? "is typing" : "stopped typing")} to {receiverUserId}");
//        }

//        /// <summary>
//        /// ✅ NEW: Send read receipt
//        /// </summary>
//        public async Task SendReadReceipt(string senderUserId, string receiverUserId, long chatId)
//        {
//            await Clients.Group(senderUserId).SendAsync("ReceiveReadReceipt", new
//            {
//                receiverUserId = receiverUserId,
//                chatId = chatId,
//                readAt = DateTime.UtcNow
//            });

//            Console.WriteLine($"✓✓ Read receipt: Message {chatId} read by {receiverUserId}");
//        }










//        /// <summary>
//        /// Get count of active connections (for debugging)
//        /// </summary>
//        public int GetActiveConnectionCount()
//        {
//            return _connections.Count;
//        }
//    }
//}


using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace HRMSWebAPI.Hubs
{
    public class ChatHub : Hub
    {
        // Track active connections with role info
        private static readonly ConcurrentDictionary<string, (string ConnectionId, string Role)> _connections = new();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"✅ Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove from tracking
            var userEntry = _connections.FirstOrDefault(x => x.Value.ConnectionId == Context.ConnectionId);
            if (!string.IsNullOrEmpty(userEntry.Key))
            {
                _connections.TryRemove(userEntry.Key, out _);

                // Remove from group using the composite key
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEntry.Key);
                Console.WriteLine($"❌ User {userEntry.Key} disconnected");
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// ✅ FIXED: Add connection to role-specific group
        /// Use composite key: userId + role to differentiate HR and Employee
        /// </summary>
        public async Task JoinChat(string userId, string userRole = "")
        {
            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("⚠️ JoinChat called with empty userId");
                return;
            }

            // ✅ Create unique group identifier with role
            // For GU-1 HR: "GU-1:HR"
            // For GU-1 Employee: "GU-1:EMP"
            string groupKey = string.IsNullOrEmpty(userRole)
                ? userId
                : $"{userId}:{userRole}";

            // Track the connection with role info
            _connections[groupKey] = (Context.ConnectionId, userRole);

            // Add to role-specific group
            await Groups.AddToGroupAsync(Context.ConnectionId, groupKey);
            Console.WriteLine($"✅ User {userId} ({userRole}) joined chat group: {groupKey} (ConnectionId: {Context.ConnectionId})");
        }

        /// <summary>
        /// Optional: Test method to send notification from client
        /// </summary>
        public async Task SendNotificationToUser(string targetUserId, string targetRole, string message)
        {
            string groupKey = string.IsNullOrEmpty(targetRole)
                ? targetUserId
                : $"{targetUserId}:{targetRole}";

            await Clients.Group(groupKey).SendAsync("ReceiveNotification", new
            {
                senderId = "System",
                message = message,
                timestamp = DateTime.UtcNow
            });

            Console.WriteLine($"📤 Sent notification to {groupKey}: {message}");
        }

        /// <summary>
        /// ✅ FIXED: Send typing indicator with role
        /// </summary>
        public async Task SendTypingIndicator(string receiverUserId, string receiverRole, string senderUserId, string senderName, bool isTyping)
        {
            // ✅ Target specific role
            string receiverGroupKey = $"{receiverUserId}:{receiverRole}";

            await Clients.Group(receiverGroupKey).SendAsync("ReceiveTypingIndicator", new
            {
                senderId = senderUserId,
                senderName = senderName,
                isTyping = isTyping,
                timestamp = DateTime.UtcNow
            });

            Console.WriteLine($"⌨️ Typing indicator: {senderName} {(isTyping ? "is typing" : "stopped typing")} → {receiverGroupKey}");
        }

        /// <summary>
        /// ✅ FIXED: Send read receipt with role
        /// </summary>
        public async Task SendReadReceipt(string senderUserId, string senderRole, string receiverUserId, long chatId)
        {
            // ✅ Target specific role
            string senderGroupKey = $"{senderUserId}:{senderRole}";

            await Clients.Group(senderGroupKey).SendAsync("ReceiveReadReceipt", new
            {
                receiverUserId = receiverUserId,
                chatId = chatId,
                readAt = DateTime.UtcNow
            });

            Console.WriteLine($"✓✓ Read receipt: Message {chatId} read by {receiverUserId} → sent to {senderGroupKey}");
        }

        /// <summary>
        /// Get count of active connections (for debugging)
        /// </summary>
        public int GetActiveConnectionCount()
        {
            return _connections.Count;
        }
    }
}