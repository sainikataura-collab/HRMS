using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace HRMSWebAPI.Hubs
{
    public class TaskHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> _taskConnections = new();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"[TaskHub] Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userEntry = _taskConnections.FirstOrDefault(x => x.Value == Context.ConnectionId);
            if (!string.IsNullOrEmpty(userEntry.Key))
            {
                _taskConnections.TryRemove(userEntry.Key, out _);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userEntry.Key);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "TaskWorkspaceBoard");
                Console.WriteLine($"[TaskHub] User {userEntry.Key} disconnected");
            }
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Join user-specific notification group + task workspace board group.
        /// Registers raw, stripped, and prefixed forms of all user IDs passed.
        /// </summary>
        public async Task JoinTaskWorkspace(string empId)
        {
            if (string.IsNullOrEmpty(empId))
            {
                return;
            }

            var ids = empId.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (var raw in ids)
            {
                var trimmed = raw.Trim();
                if (string.IsNullOrEmpty(trimmed)) continue;

                _taskConnections[trimmed] = Context.ConnectionId;
                await Groups.AddToGroupAsync(Context.ConnectionId, trimmed);

                if (trimmed.StartsWith("GU-", StringComparison.OrdinalIgnoreCase))
                {
                    var noPrefix = trimmed.Substring(3);
                    _taskConnections[noPrefix] = Context.ConnectionId;
                    await Groups.AddToGroupAsync(Context.ConnectionId, noPrefix);
                }
                else if (int.TryParse(trimmed, out _))
                {
                    var withPrefix = "GU-" + trimmed;
                    _taskConnections[withPrefix] = Context.ConnectionId;
                    await Groups.AddToGroupAsync(Context.ConnectionId, withPrefix);
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, "TaskWorkspaceBoard");
            Console.WriteLine($"[TaskHub] User '{empId}' joined TaskWorkspace (Conn: {Context.ConnectionId})");
        }

        /// <summary>
        /// Leave workspace
        /// </summary>
        public async Task LeaveTaskWorkspace(string empId)
        {
            if (!string.IsNullOrEmpty(empId))
            {
                _taskConnections.TryRemove(empId, out _);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, empId);
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "TaskWorkspaceBoard");
            }
        }
    }
}

