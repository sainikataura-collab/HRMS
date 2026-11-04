using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSWebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LocationTrackerController : ControllerBase
    {
        /// <summary>
        /// GET /api/v1/LocationTracker/status?userId={userId}
        /// Calls USP_LocationTracker_GetUserTrackingStatus to check if location tracking is ON or OFF for user
        /// </summary>
        [HttpGet("status")]
        [AllowAnonymous]
        public IActionResult GetUserTrackingStatus([FromQuery] string userId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var status = DataBaseFactory.QuerySP<UserTrackingStatusDto>(
                    "USP_LocationTracker_GetUserTrackingStatus",
                    new { UserId = userId }
                ).FirstOrDefault();

                modelResponse.IsSuccess = true;
                modelResponse.Message = "User tracking status retrieved.";
                modelResponse.Data = status ?? new UserTrackingStatusDto { UserId = userId, IsTrackingEnabled = true };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        /// <summary>
        /// POST /api/v1/LocationTracker/toggle-status
        /// Calls USP_LocationTracker_SetUserTrackingStatus to turn tracking ON (1) or OFF (0) for user
        /// </summary>
        [HttpPost("toggle-status")]
        [AllowAnonymous]
        public IActionResult ToggleUserTrackingStatus([FromBody] ToggleTrackingDto dto)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.UserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                string updatedBy = HttpContext.Items["DecryptedUserId"]?.ToString() ?? "Admin";

                var status = DataBaseFactory.QuerySP<UserTrackingStatusDto>(
                    "USP_LocationTracker_SetUserTrackingStatus",
                    new
                    {
                        UserId = dto.UserId,
                        IsTrackingEnabled = dto.IsEnabled,
                        UpdatedBy = updatedBy
                    }
                ).FirstOrDefault();

                modelResponse.IsSuccess = true;
                modelResponse.Message = dto.IsEnabled 
                    ? $"Location tracking ENABLED (ON) for user '{dto.UserId}'." 
                    : $"Location tracking DISABLED (OFF) for user '{dto.UserId}'.";
                modelResponse.Data = status;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        /// <summary>
        /// GET /api/v1/LocationTracker/live?userId={userId}
        /// Calls USP_LocationTracker_GetLiveLocation to fetch top 1 most recent ping for user
        /// </summary>
        [HttpGet("live")]
        [AllowAnonymous]
        public IActionResult GetLiveLocation([FromQuery] string userId)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                var record = DataBaseFactory.QuerySP<LocationRecordDto>(
                    "USP_LocationTracker_GetLiveLocation",
                    new { UserId = userId }
                ).FirstOrDefault();

                if (record == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = $"No location records found for user '{userId}'.";
                    modelResponse.StatusCode = 404;
                    return Ok(modelResponse);
                }

                modelResponse.IsSuccess = true;
                modelResponse.Message = "Latest live location retrieved successfully.";
                modelResponse.Data = record;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        /// <summary>
        /// GET /api/v1/LocationTracker/history?userId={userId}&date={yyyy-MM-dd}
        /// Calls USP_LocationTracker_GetLocationHistory to fetch all entries for a date
        /// </summary>
        [HttpGet("history")]
        [AllowAnonymous]
        public IActionResult GetLocationHistory([FromQuery] string userId, [FromQuery] string? date)
        {
            var modelResponse = new ModelResponse();
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId is required.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                DateTime? targetDate = null;
                if (!string.IsNullOrWhiteSpace(date) && DateTime.TryParse(date, out var parsedDate))
                {
                    targetDate = parsedDate.Date;
                }

                var list = DataBaseFactory.QuerySP<LocationRecordDto>(
                    "USP_LocationTracker_GetLocationHistory",
                    new { UserId = userId, TargetDate = targetDate }
                ).ToList();

                modelResponse.IsSuccess = true;
                modelResponse.Message = $"Retrieved {list.Count} location records.";
                modelResponse.Data = list;
                modelResponse.TotalCount = list.Count;
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }

        /// <summary>
        /// POST /api/v1/LocationTracker
        /// Calls USP_LocationTracker_SaveLocation to store a new location ping
        /// Supports Employee ID from payload or JWT claims token, with GPS coordinate validation
        /// Returns IsTrackingEnabled flag so mobile app background worker knows if tracking is active or stopped
        /// </summary>
        [HttpPost]
        [HttpPost("/api/Location/update")]
        [AllowAnonymous]
        public IActionResult PostLocation([FromBody] LocationPostDto dto)
        {
            var modelResponse = new ModelResponse();
            try
            {
                // Manage Employee ID / UserId: Support payload userId or JWT claims
                string? effectiveUserId = !string.IsNullOrWhiteSpace(dto?.UserId)
                    ? dto.UserId.Trim()
                    : HttpContext.Items["DecryptedUserId"]?.ToString()?.Trim();

                if (string.IsNullOrWhiteSpace(effectiveUserId))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "UserId / Employee ID is required (either in payload or JWT token).";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                if (dto == null)
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid location payload.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                // Coordinate sanity check (guard against null island 0,0 or out of range coords)
                if (dto.Latitude < -90 || dto.Latitude > 90 || dto.Longitude < -180 || dto.Longitude > 180 ||
                    (Math.Abs(dto.Latitude) < 0.0001 && Math.Abs(dto.Longitude) < 0.0001))
                {
                    modelResponse.IsSuccess = false;
                    modelResponse.Message = "Invalid GPS coordinates received. Latitude/Longitude out of range or unacquired.";
                    modelResponse.StatusCode = 400;
                    return Ok(modelResponse);
                }

                string id = Guid.NewGuid().ToString("N");

                var saveResult = DataBaseFactory.QuerySP<UserTrackingStatusDto>(
                    "USP_LocationTracker_SaveLocation",
                    new
                    {
                        Id = id,
                        UserId = effectiveUserId,
                        Latitude = dto.Latitude,
                        Longitude = dto.Longitude,
                        Accuracy = dto.Accuracy,
                        ClientTimestamp = dto.Timestamp,
                        IsBackground = dto.IsBackground,
                        BatteryLevel = dto.BatteryLevel,
                        DeviceInfo = dto.DeviceInfo ?? "Unknown"
                    }
                ).FirstOrDefault();

                bool isTrackingEnabled = saveResult?.IsTrackingEnabled ?? true;

                modelResponse.IsSuccess = true;
                modelResponse.Message = isTrackingEnabled ? "Location stored successfully." : "Tracking disabled for this user.";
                modelResponse.Data = new { isTrackingEnabled };
                modelResponse.StatusCode = 200;
                return Ok(modelResponse);
            }
            catch (Exception ex)
            {
                modelResponse.IsSuccess = false;
                modelResponse.Message = ex.Message;
                modelResponse.StatusCode = 500;
                return Ok(modelResponse);
            }
        }
    }

    public class LocationRecordDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Accuracy { get; set; }
        public DateTime ClientTimestamp { get; set; }
        public DateTime ServerReceivedAt { get; set; }
        public bool IsBackground { get; set; }
        public int? BatteryLevel { get; set; }
        public string? DeviceInfo { get; set; }
    }

    public class LocationPostDto
    {
        public string UserId { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Accuracy { get; set; }
        public DateTime? Timestamp { get; set; }
        public bool IsBackground { get; set; }
        public int? BatteryLevel { get; set; }
        public string? DeviceInfo { get; set; }
    }

    public class ToggleTrackingDto
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
    }

    public class UserTrackingStatusDto
    {
        public string UserId { get; set; } = string.Empty;
        public bool IsTrackingEnabled { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
