using System.Data;
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public class LocationRepository : ILocationRepository
    {
        private readonly ILogger<LocationRepository> _logger;

        public LocationRepository(ILogger<LocationRepository> logger)
        {
            _logger = logger;
        }

        public void EnsureTableExists()
        {
            // Table creation should ideally be managed via scripts directly in the DB.
            // Keeping this empty or logging since we are now relying on provided DB scripts.
            _logger.LogInformation("EnsureTableExists called. Assuming DBScripts are executed.");
        }

        public static DateTime GetIndianStandardTime(DateTime? clientTime = null)
        {
            try
            {
                var targetUtc = clientTime.HasValue ? clientTime.Value.ToUniversalTime() : DateTime.UtcNow;
                var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(targetUtc, istZone);
            }
            catch
            {
                var utc = clientTime.HasValue ? clientTime.Value.ToUniversalTime() : DateTime.UtcNow;
                return utc.AddHours(5).AddMinutes(30);
            }
        }

        public LocationRecord AddLocation(LocationUpdateDto dto)
        {
            var record = new LocationRecord
            {
                Id = Guid.NewGuid().ToString("N"),
                UserId = string.IsNullOrWhiteSpace(dto.UserId) ? "default-user" : dto.UserId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Accuracy = dto.Accuracy,
                ClientTimestamp = GetIndianStandardTime(dto.Timestamp),
                ServerReceivedAt = GetIndianStandardTime(),
                IsBackground = dto.IsBackground,
                BatteryLevel = dto.BatteryLevel,
                DeviceInfo = dto.DeviceInfo ?? "Unknown Device"
            };

            try
            {
                using var conn = DataBaseFactory.ConnString();
                var parameters = new DynamicParameters();
                parameters.Add("@Id", record.Id, DbType.String);
                parameters.Add("@UserId", record.UserId, DbType.String);
                parameters.Add("@Latitude", record.Latitude, DbType.Double);
                parameters.Add("@Longitude", record.Longitude, DbType.Double);
                parameters.Add("@Accuracy", record.Accuracy, DbType.Double);
                parameters.Add("@ClientTimestamp", record.ClientTimestamp, DbType.DateTime);
                parameters.Add("@ServerReceivedAt", record.ServerReceivedAt, DbType.DateTime);
                parameters.Add("@IsBackground", record.IsBackground, DbType.Boolean);
                parameters.Add("@BatteryLevel", record.BatteryLevel, DbType.Int32);
                parameters.Add("@DeviceInfo", record.DeviceInfo, DbType.String);

                conn.Execute("USP_AddLocationRecord", parameters, commandType: CommandType.StoredProcedure);
                _logger.LogInformation("Saved IST location record to SQL Server via USP: User={User}, IST={IstTime}", record.UserId, record.ServerReceivedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save location record to SQL Server database via USP");
            }

            return record;
        }

        public IEnumerable<LocationRecord> GetHistory(string? userId = null, int limit = 100)
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var parameters = new DynamicParameters();
                parameters.Add("@UserId", string.IsNullOrWhiteSpace(userId) ? null : userId, DbType.String);
                parameters.Add("@Limit", limit, DbType.Int32);

                return conn.Query<LocationRecord>("USP_GetLocationHistory", parameters, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to query location history from SQL Server via USP");
                return Enumerable.Empty<LocationRecord>();
            }
        }

        public LocationStats GetStats()
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                var list = conn.Query<LocationRecord>("USP_GetLocationStats", commandType: CommandType.StoredProcedure).ToList();

                if (list.Count == 0)
                {
                    return new LocationStats { TotalRecords = 0, ActiveUsersCount = 0, LatestUpdate = null, TotalDistanceKm = 0 };
                }

                double totalKm = 0;
                for (int i = 1; i < list.Count; i++)
                {
                    totalKm += CalculateDistanceKm(
                        list[i - 1].Latitude, list[i - 1].Longitude,
                        list[i].Latitude, list[i].Longitude
                    );
                }

                return new LocationStats
                {
                    TotalRecords = list.Count,
                    ActiveUsersCount = list.Select(r => r.UserId).Distinct().Count(),
                    LatestUpdate = list.Max(r => (DateTime?)r.ServerReceivedAt),
                    TotalDistanceKm = Math.Round(totalKm, 3)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch stats from SQL Server via USP");
                return new LocationStats();
            }
        }

        public void ClearStore()
        {
            try
            {
                using var conn = DataBaseFactory.ConnString();
                conn.Execute("USP_ClearLocationHistory", commandType: CommandType.StoredProcedure);
                _logger.LogInformation("SQL Server LocationRecords table cleared via USP.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clear LocationRecords table in SQL Server via USP");
            }
        }

        private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371.0;
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private static double ToRadians(double deg) => deg * (Math.PI / 180.0);
    }
}
