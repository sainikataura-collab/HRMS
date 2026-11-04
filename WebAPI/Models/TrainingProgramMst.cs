using DocumentFormat.OpenXml.Wordprocessing;

namespace HRMSWebAPI.Models
{
    public class TrainingProgramMst
    {
        public long? pk_programId {  get; set; }
        public string? description {  get; set; }
        public string? remarks {  get; set; }
        public bool? active { get; set; }
        public string? isactive { get; set; }

        public byte[]? Timestamp { get; set; }
    }

}
