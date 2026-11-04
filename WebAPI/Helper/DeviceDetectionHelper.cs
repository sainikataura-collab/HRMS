using System;
using System.Collections.Generic;
using System.Linq;
using UAParser;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Helper
{
    public static class DeviceDetectionHelper
    {
        private static readonly Parser uaParser = Parser.GetDefault();

        public static DeviceInformation GetDeviceInformation(string userAgent)
        {
            var deviceInfo = new DeviceInformation();

            if (string.IsNullOrEmpty(userAgent))
            {
                return deviceInfo;
            }

            try
            {
                // Parse user agent
                ClientInfo clientInfo = uaParser.Parse(userAgent);

                // Device Information
                deviceInfo.DeviceBrand = clientInfo.Device.Family ?? "Unknown";
                deviceInfo.DeviceModel = clientInfo.Device.Family ?? "Unknown";
                deviceInfo.DeviceType = DetermineDeviceType(clientInfo, userAgent);

                // OS Information
                deviceInfo.OS = clientInfo.OS.Family ?? "Unknown";
                deviceInfo.OSVersion = GetOSVersion(clientInfo.OS);

                // Browser Information
                deviceInfo.Browser = clientInfo.UA.Family ?? "Unknown";
                deviceInfo.BrowserVersion = GetBrowserVersion(clientInfo.UA);

                // Platform
                deviceInfo.Platform = DeterminePlatform(clientInfo, userAgent);

                // Bot Detection
                deviceInfo.IsBot = IsBot(userAgent, clientInfo);

                return deviceInfo;
            }
            catch (Exception)
            {
                return deviceInfo;
            }
        }

        private static string DetermineDeviceType(ClientInfo clientInfo, string userAgent)
        {
            var deviceFamily = clientInfo.Device.Family?.ToLower() ?? "";
            var userAgentLower = userAgent.ToLower();

            // Bot Detection
            if (IsBot(userAgent, clientInfo))
                return "Bot";

            // Specific Device Types
            if (deviceFamily.Contains("iphone")) return "iPhone";
            if (deviceFamily.Contains("ipad")) return "iPad";
            if (deviceFamily.Contains("ipod")) return "iPod";
            if (deviceFamily.Contains("samsung")) return "Samsung Phone";
            if (deviceFamily.Contains("huawei")) return "Huawei Phone";
            if (deviceFamily.Contains("xiaomi")) return "Xiaomi Phone";
            if (deviceFamily.Contains("oppo")) return "Oppo Phone";
            if (deviceFamily.Contains("vivo")) return "Vivo Phone";
            if (deviceFamily.Contains("oneplus")) return "OnePlus Phone";
            if (deviceFamily.Contains("google")) return "Google Pixel";

            // Generic Categories
            if (userAgentLower.Contains("mobile")) return "Mobile";
            if (userAgentLower.Contains("tablet") || userAgentLower.Contains("ipad")) return "Tablet";

            return "Desktop";
        }

        private static string DeterminePlatform(ClientInfo clientInfo, string userAgent)
        {
            var userAgentLower = userAgent.ToLower();

            if (userAgentLower.Contains("mobile") ||
                userAgentLower.Contains("iphone") ||
                userAgentLower.Contains("android"))
                return "Mobile";

            if (userAgentLower.Contains("tablet") ||
                userAgentLower.Contains("ipad"))
                return "Tablet";

            return "Desktop";
        }

        private static string GetOSVersion(OS os)
        {
            var parts = new List<string>();

            if (!string.IsNullOrEmpty(os.Major)) parts.Add(os.Major);
            if (!string.IsNullOrEmpty(os.Minor)) parts.Add(os.Minor);
            if (!string.IsNullOrEmpty(os.Patch)) parts.Add(os.Patch);

            return parts.Count > 0 ? string.Join(".", parts) : "Unknown";
        }

        private static string GetBrowserVersion(UserAgent ua)
        {
            var parts = new List<string>();

            if (!string.IsNullOrEmpty(ua.Major)) parts.Add(ua.Major);
            if (!string.IsNullOrEmpty(ua.Minor)) parts.Add(ua.Minor);
            if (!string.IsNullOrEmpty(ua.Patch)) parts.Add(ua.Patch);

            return parts.Count > 0 ? string.Join(".", parts) : "Unknown";
        }

        private static bool IsBot(string userAgent, ClientInfo clientInfo)
        {
            var userAgentLower = userAgent.ToLower();
            var deviceFamily = clientInfo.Device.Family?.ToLower() ?? "";
            var uaFamily = clientInfo.UA.Family?.ToLower() ?? "";

            var botIndicators = new[]
            {
                "bot", "crawler", "spider", "scraper", "curl", "wget",
                "python", "java", "postman", "insomnia", "httpclient",
                "googlebot", "bingbot", "slackbot", "facebookexternalhit",
                "twitterbot", "linkedinbot", "whatsapp", "telegrambot"
            };

            return botIndicators.Any(indicator =>
                userAgentLower.Contains(indicator) ||
                deviceFamily.Contains(indicator) ||
                uaFamily.Contains(indicator));
        }
    }
}
