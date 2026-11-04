namespace HRMSWebAPI.Models
{
    public class SeparationRequestAdminCount
    {
        public int TotalResignations { get; set; }

        public int Approved { get; set; }

        public int Pending { get; set; }

        public int Retained { get; set; }

        public int Rejected { get; set; }

        public int Withdraw { get; set; }
    }
}
