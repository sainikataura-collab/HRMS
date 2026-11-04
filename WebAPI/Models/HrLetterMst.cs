namespace HRMSWebAPI.Models
{
    public class HrLetterMst
    {
        public bool Status { get; set; }
        public string description { get; set; }
        public string dated { get; set; }
        public string filename { get; set; }

        public string department { get; set; }


        //
        public long pk_trnid { get; set; }
        public string name { get; set; }
        //public string description { get; set; }
        public string formattype { get; set; }
        public string formatTypeName { get; set; }
        public string refno { get; set; }
       // public DateTime? dated { get; set; }
        public DateTime? confirmdate { get; set; }
        public bool StatusId { get; set; }


    }
}
