namespace HRMSWebAPI.Models
{
    public class TrainingInstituteMst
    {

        public long? pk_instituteId { get; set; }
        public string? description { get; set; }      // VARCHAR(100)
        public string? type { get; set; }               // CHAR(1)
        public bool? active { get; set; }             // BIT
        public string? remarks { get; set; }          // VARCHAR(255)\

        public byte[]? Timestamp { get; set; }

    }

    public class getall
    {

        public long pk_instituteId { get; set;}
        public string description { get; set; }      // VARCHAR(100)
        public string type { get; set; }               // CHAR(1)
        public string active { get; set; }             // BIT
        public string remarks { get; set; }          // VARCHAR(255)
    }
}
