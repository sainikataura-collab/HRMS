using Microsoft.AspNetCore.SignalR;

namespace HRMSWebAPI.Helper
{
    public class CustomUserIdProvider:IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // This assumes you pass userId as a query string or token
            return connection.GetHttpContext()?.Request.Query["userId"];
        }
    }
}
