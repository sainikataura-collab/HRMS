
using HRMSWebAPI.Hubs;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class HRchatController : ControllerBase
    {
        private readonly IHrchatRepository _repo;
        private readonly IHubContext<ChatHub> _hubContext;

        public HRchatController(IHrchatRepository repo, IHubContext<ChatHub> hubContext)
        {
            _repo = repo;
            _hubContext = hubContext;

        }



        //[HttpPost("send")]
        //[Authorize]
        //public IActionResult SendMessage([FromBody] ChatMessage message)
        //{
        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
        //        message.SenderUserId = decryptedUserId;

        //        long chatId = _repo.InsertChatMessage(message);

        //        if (chatId == 0)
        //            return StatusCode(500, new { success = false, message = "Failed to save message" });

        //        return Ok(new
        //        {
        //            success = true,
        //            chatId = chatId,
        //            message = "Message sent successfully",
        //            conversationId = message.ConversationId
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}


        //[HttpPost("send")]
        //[Authorize]
        //public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        //{
        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            return Unauthorized(new { success = false, message = "User not authenticated" });
        //        }

        //        message.SenderUserId = decryptedUserId;

        //        // Validate required fields
        //        if (string.IsNullOrEmpty(message.ReceiverUserId) || string.IsNullOrEmpty(message.MessageText))
        //        {
        //            return BadRequest(new { success = false, message = "Receiver and message text are required" });
        //        }

        //        // 1. Save message to database
        //        long chatId = _repo.InsertChatMessage(message);

        //        if (chatId > 0)
        //        {
        //            Console.WriteLine($"💾 Message saved to DB: ChatId={chatId}");

        //            // 2. Send real-time notification to receiver
        //            try
        //            {
        //                await _hubContext.Clients.Group(message.ReceiverUserId)
        //                    .SendAsync("ReceiveNotification", new
        //                    {
        //                        senderId = message.SenderUserId,
        //                        senderName = message.SenderName,
        //                        message = message.MessageText,
        //                        timestamp = DateTime.UtcNow,
        //                        chatId = chatId
        //                    });

        //                Console.WriteLine($"✅ Real-time notification sent to user: {message.ReceiverUserId}");
        //            }
        //            catch (Exception signalREx)
        //            {
        //                // Log but don't fail the request if SignalR fails
        //                Console.WriteLine($"⚠️ SignalR notification failed: {signalREx.Message}");
        //            }

        //            return Ok(new
        //            {
        //                success = true,
        //                chatId = chatId,
        //                message = "Message sent successfully",
        //                timestamp = DateTime.UtcNow
        //            });
        //        }

        //        return StatusCode(500, new { success = false, message = "Failed to save message to database" });
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Error in SendMessage: {ex.Message}");
        //        Console.WriteLine($"   Stack Trace: {ex.StackTrace}");
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}









        //not in used (GetConversation)

        [HttpGet("conversation/{conversationId}")]
        [Authorize]
        public IActionResult GetConversation(string conversationId)
        {
            try
            {
                Console.WriteLine($"📡 GetConversation called: {conversationId}");
                var data = _repo.GetConversationMessages(conversationId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetConversation: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }


        // Get unread messages for a user
        [HttpGet("unread/{userId}")]
        [Authorize]
        public IActionResult GetUnread(int userId)
        {
            try
            {
                Console.WriteLine($"📡 GetUnread called: {userId}");
                var data = _repo.GetUnreadMessages(userId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetUnread: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }


        // Mark messages as read
        [HttpPost("mark-read")]
        [Authorize]
        public IActionResult MarkRead([FromBody] dynamic payload)
        {
            try
            {
                int conversationId = payload.conversationId;
                int userId = payload.userId;

                Console.WriteLine($"👁️ MarkRead called:");
                Console.WriteLine($"   ConversationId: {conversationId}");
                Console.WriteLine($"   UserId: {userId}");

                bool result = _repo.MarkMessagesAsRead(conversationId, userId);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in MarkRead: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        // Getconversation Used this ggggg

        [HttpGet("Getconversation")]
        [Authorize]
        public IActionResult GetConversationn(string otherUserId, string otherUserRole, string myRole)
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                // conversationId backend me banega
                //var conversationId = GenerateConversationIdd(decryptedUserId, otherUserId);

                var messages = _repo.GetConversationMessagesByUsers(decryptedUserId, otherUserId,otherUserRole,myRole);

                return Ok(new
                {
                    currentUserId = decryptedUserId,
                    messages = messages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }


        }


        //[HttpGet("GetChatSenderEmployeeList")]
        //[Authorize]
        //public async Task<IActionResult> GetChatSenderEmployeeListAsync()
        //{
        //    var response = new ModelResponse();

        //    try
        //    {

        //        // var data = _repo.GetSenderEmployeeListAsync(); // dynamic result
        //        //var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        //var data = _repo.GetSenderEmployeeListAsync(decryptedUserId); // pass logged-in emp

        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        var data = await _repo.GetSenderEmployeeListAsync(decryptedUserId);

        //        if (data == null)
        //        {
        //            response.IsSuccess = false;
        //            response.Message = "No sender found.";
        //            response.StatusCode = 404;
        //            return Ok(response);
        //        }

        //        response.IsSuccess = true;
        //        response.Message = "Sender employee list retrieved successfully.";
        //        response.StatusCode = 200;
        //        response.Data = data;

        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        response.IsSuccess = false;
        //        response.Message = ex.Message;
        //        response.StatusCode = 500;
        //        return Ok(response);
        //    }
        //}





        //// ✅ FIXED: Controller method in HRchatController.cs

        //[HttpGet("GetChatSenderEmployeeList")]
        //[Authorize]
        //public async Task<IActionResult> GetChatSenderEmployeeListAsync()
        //{
        //    var response = new ModelResponse();

        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            response.IsSuccess = false;
        //            response.Message = "User not authenticated";
        //            response.StatusCode = 401;
        //            return Ok(response);
        //        }

        //        // ✅ CRITICAL FIX: Get the current user's role from request header or session
        //        // The frontend should send this in the request
        //        var currentUserRole = HttpContext.Request.Headers["X-User-Role"].ToString();

        //        // ✅ Fallback: Determine role based on usertype if header not present
        //        if (string.IsNullOrEmpty(currentUserRole))
        //        {
        //            var userType = HttpContext.Items["usertype"]?.ToString() ??
        //                          HttpContext.Request.Headers["X-User-Type"].ToString();
        //            currentUserRole = userType == "User" ? "HR" : "EMP";
        //        }

        //        Console.WriteLine($"📋 GetChatSenderEmployeeList called:");
        //        Console.WriteLine($"   UserId: {decryptedUserId}");
        //        Console.WriteLine($"   Role: {currentUserRole}");

        //        // ✅ Pass role to repository
        //        var data = await _repo.GetSenderEmployeeListAsync(decryptedUserId, currentUserRole);

        //        if (data == null || !data.Any())
        //        {
        //            response.IsSuccess = false;
        //            response.Message = "No senders found.";
        //            response.StatusCode = 404;
        //            return Ok(response);
        //        }

        //        response.IsSuccess = true;
        //        response.Message = "Sender employee list retrieved successfully.";
        //        response.StatusCode = 200;
        //        response.Data = data;

        //        Console.WriteLine($"   Returned {((IEnumerable<dynamic>)data).Count()} senders");

        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Error in GetChatSenderEmployeeList: {ex.Message}");
        //        response.IsSuccess = false;
        //        response.Message = ex.Message;
        //        response.StatusCode = 500;
        //        return Ok(response);
        //    }
        //}


        // ✅ UPDATED: Controller with search query parameter
        [HttpGet("GetChatSenderEmployeeList")]
        [Authorize]
        public async Task<IActionResult> GetChatSenderEmployeeListAsync([FromQuery] string searchQuery = null)
        {
            var response = new ModelResponse();
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    response.IsSuccess = false;
                    response.Message = "User not authenticated";
                    response.StatusCode = 401;
                    return Ok(response);
                }

                // ✅ Get the current user's role from request header or session
                var currentUserRole = HttpContext.Request.Headers["X-User-Role"].ToString();

                // ✅ Fallback: Determine role based on usertype if header not present
                if (string.IsNullOrEmpty(currentUserRole))
                {
                    var userType = HttpContext.Items["usertype"]?.ToString() ??
                                  HttpContext.Request.Headers["X-User-Type"].ToString();
                    currentUserRole = userType == "User" ? "HR" : "EMP";
                }

                Console.WriteLine($"📋 GetChatSenderEmployeeList called:");
                Console.WriteLine($"   UserId: {decryptedUserId}");
                Console.WriteLine($"   Role: {currentUserRole}");
                Console.WriteLine($"   SearchQuery: {searchQuery ?? "None"}");

                // ✅ Pass search query to repository
                var data = await _repo.GetSenderEmployeeListAsync(decryptedUserId, currentUserRole, searchQuery);

                if (data == null || !data.Any())
                {
                    response.IsSuccess = false;
                    response.Message = searchQuery != null ? "No employees found matching search." : "No senders found.";
                    response.StatusCode = 404;
                    return Ok(response);
                }

                response.IsSuccess = true;
                response.Message = searchQuery != null
                    ? "Search results retrieved successfully."
                    : "Sender employee list retrieved successfully.";
                response.StatusCode = 200;
                response.Data = data;

                Console.WriteLine($"   Returned {((IEnumerable<dynamic>)data).Count()} senders");

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetChatSenderEmployeeList: {ex.Message}");
                response.IsSuccess = false;
                response.Message = ex.Message;
                response.StatusCode = 500;
                return Ok(response);
            }
        }



        [HttpGet("UnreadCount")]
        [Authorize]
        public IActionResult GetUnreadCount()
        {
            var response = new ModelResponse();

            try
            {
                var userId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var count = _repo.GetUnreadCount(userId);

                response.IsSuccess = true;
                response.Message = "Unread count retrieved.";
                response.Data = count;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
            }

            return Ok(response);
        }


        [HttpPost("MarkAsRead")]
        [Authorize]
        public IActionResult MarkAsRead(string senderUserId)
        {
            var response = new ModelResponse();

            try
            {
                var receiverUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                var rows = _repo.MarkMessagesAsRead(receiverUserId, senderUserId);

                response.IsSuccess = true;
                response.Message = "Messages marked as read.";
                response.Data = rows;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
            }

            return Ok(response);
        }















        // Notification Section Start

        // Send a message used in CHat and Notification
        //[HttpPost("send")]
        //[Authorize]
        //public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        //{
        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            return Unauthorized(new { success = false, message = "User not authenticated" });
        //        }

        //        message.SenderUserId = decryptedUserId;

        //        if (string.IsNullOrEmpty(message.ReceiverUserId) || string.IsNullOrEmpty(message.MessageText))
        //        {
        //            return BadRequest(new { success = false, message = "Receiver and message text are required" });
        //        }

        //        // 1. Save message to database
        //        long chatId = _repo.InsertChatMessage(message);

        //        if (chatId > 0)
        //        {
        //            Console.WriteLine($"💾 Message saved to DB: ChatId={chatId}");

        //            // 2. Send real-time notification to receiver
        //            try
        //            {
        //                await _hubContext.Clients.Group(message.ReceiverUserId)
        //                    .SendAsync("ReceiveNotification", new
        //                    {
        //                        senderId = message.SenderUserId,
        //                        senderName = message.SenderName,
        //                        message = message.MessageText,
        //                        notificationType = message.NotificationType,
        //                        attachmentPath=message.AttachmentPath,
        //                        timestamp = DateTime.UtcNow,
        //                        chatId = chatId
        //                    });

        //                Console.WriteLine($"✅ Real-time notification sent to user: {message.ReceiverUserId}");
        //            }
        //            catch (Exception signalREx)
        //            {
        //                Console.WriteLine($"⚠️ SignalR notification failed: {signalREx.Message}");
        //            }

        //            return Ok(new
        //            {
        //                success = true,
        //                chatId = chatId,
        //                message = "Message sent successfully",
        //                timestamp = DateTime.UtcNow
        //            });
        //        }

        //        return StatusCode(500, new { success = false, message = "Failed to save message to database" });
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Error in SendMessage: {ex.Message}");
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}
        /// <summary>
        /// ✅ FIXED: Send message with role-based SignalR notification
        /// </summary>
        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                message.SenderUserId = decryptedUserId;

                if (string.IsNullOrEmpty(message.ReceiverUserId) || string.IsNullOrEmpty(message.MessageText))
                {
                    return BadRequest(new { success = false, message = "Receiver and message text are required" });
                }

                // 1. Save message to database
                long chatId = _repo.InsertChatMessage(message);

                if (chatId > 0)
                {
                    Console.WriteLine($"💾 Message saved to DB: ChatId={chatId}");

                    // ✅ 2. Send real-time notification to receiver WITH ROLE
                    try
                    {
                        // Create role-specific group key
                        string receiverGroupKey = $"{message.ReceiverUserId}:{message.ReceiverRole}";

                        await _hubContext.Clients.Group(receiverGroupKey)
                            .SendAsync("ReceiveNotification", new
                            {
                                senderId = message.SenderUserId,
                                senderName = message.SenderName,
                                senderRole = message.SenderRole,
                                message = message.MessageText,
                                notificationType = message.NotificationType,
                                attachmentPath = message.AttachmentPath,
                                timestamp = DateTime.UtcNow,
                                chatId = chatId
                            });

                        Console.WriteLine($"✅ Real-time notification sent to: {receiverGroupKey}");
                        Console.WriteLine($"   From: {message.SenderUserId} ({message.SenderRole})");
                        Console.WriteLine($"   To: {message.ReceiverUserId} ({message.ReceiverRole})");
                    }
                    catch (Exception signalREx)
                    {
                        Console.WriteLine($"⚠️ SignalR notification failed: {signalREx.Message}");
                    }

                    return Ok(new
                    {
                        success = true,
                        chatId = chatId,
                        message = "Message sent successfully",
                        timestamp = DateTime.UtcNow
                    });
                }

                return StatusCode(500, new { success = false, message = "Failed to save message to database" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in SendMessage: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }





        // Get unread Notification on page load
        [HttpGet("unreads")]
        [Authorize]
        public IActionResult GetUnreadNotification()
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var currentUserRole = HttpContext.Request.Headers["X-User-Role"].ToString();


                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var messages = _repo.GetUnreadNotification(decryptedUserId,currentUserRole);

                return Ok(new
                {
                    success = true,
                    data = messages,
                    count = messages.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Get unread Notification count badge
        [Authorize]
        [HttpGet("unread-counts")]
        public IActionResult GetUnreadNotificationCount()
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();
                var currentUserRole = HttpContext.Request.Headers["X-User-Role"].ToString();


                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                //int count = _repo.GetUnreadNotificationCounts(decryptedUserId);
                int count = _repo.GetUnreadNotificationCounts(decryptedUserId, currentUserRole);


                return Ok(new
                {
                    success = true,
                    unreadCount = count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        //// Mark Notification as read
        //[HttpPost("mark-reads")]
        //[Authorize]
        //public IActionResult MarkNotificationAsReads([FromBody] MarkAsReadRequest request)
        //{
        //    try
        //    {
        //        var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

        //        if (string.IsNullOrEmpty(decryptedUserId))
        //        {
        //            return Unauthorized(new { success = false, message = "User not authenticated" });
        //        }

        //        bool result = _repo.MarkNotificationAsReads(decryptedUserId, request.SenderUserId);

        //        return Ok(new
        //        {
        //            success = result,
        //            message = result ? "Messages marked as read" : "Failed to mark messages as read"
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}

        [HttpPost("mark-reads")]
        [Authorize]
        public IActionResult MarkNotificationAsReads([FromBody] MarkAsReadRequest request)
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                bool result = _repo.MarkNotificationAsReads(
                    decryptedUserId,
                    request.SenderUserId,
                    request.SenderRole
                );

                return Ok(new
                {
                    success = result,
                    message = result ? "Messages marked as read" : "Failed to mark messages as read"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }




        //// Mark Notification as read


        //[Authorize]
        //[HttpPost("mark-reads")]
        //public IActionResult MarkNotificationAsReads([FromBody] MarkAsReadRequest request)
        //{
        //    try
        //    {


        //        bool result = _repo.MarkNotificationAsReads(request.ChatId);

        //        return Ok(new
        //        {
        //            success = result,
        //            message = result ? "Messages marked as read" : "Failed to mark messages as read"
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = ex.Message });
        //    }
        //}

        // Get Notification conversation history
        [Authorize]
        [HttpGet("conversations/{otherUserId}")]
        public IActionResult GetConversationNotification(string otherUserId, [FromQuery] int page = 1)
        {
            try
            {
                var decryptedUserId = HttpContext.Items["DecryptedUserId"]?.ToString();

                if (string.IsNullOrEmpty(decryptedUserId))
                {
                    return Unauthorized(new { success = false, message = "User not authenticated" });
                }

                var messages = _repo.GetConversationNotification(decryptedUserId, otherUserId, page);

                return Ok(new
                {
                    success = true,
                    data = messages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Notification Section End   
    }
}