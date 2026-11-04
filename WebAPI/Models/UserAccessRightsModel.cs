namespace HRMSWebAPI.Models
{
    /// <summary>
    /// Returned by UM_SP_GetUserAccessRights.
    /// Contains aggregated L1/L2/L3 and functional rights for a user+module,
    /// plus the list of location IDs assigned via UM_UserModuleDetails.
    /// </summary>
    public class UserAccessRightsModel
    {
        public bool         L1_Access           { get; set; }
        public bool         L2_Access           { get; set; }
        public bool         L3_Access           { get; set; }
        public bool         CanRaiseRequisition { get; set; }
        public bool         CanEditManpower     { get; set; }
        public List<string> AssignedLocationIds { get; set; } = new();
    }

    // Internal DTO to map RS1 of the USP
    internal class UserAccessFlagsDto
    {
        public int L1_Access           { get; set; }
        public int L2_Access           { get; set; }
        public int L3_Access           { get; set; }
        public int CanRaiseRequisition { get; set; }
        public int CanEditManpower     { get; set; }
    }

    // Internal DTO to map RS2 location rows
    internal class UserLocationDto
    {
        public string fk_locid { get; set; }
    }
}
