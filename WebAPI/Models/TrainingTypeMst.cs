namespace HRMSWebAPI.Models
{
    public class TrainingTypeMst
    {
        public long? pk_typeId { get; set; }
        public string description { get; set; }
        public bool active { get; set; }
        public string remarks { get; set; }
        public byte[]? timestamp { get; set; }
    }
    public class TrainingTypeMstGetAll
    {
        public long? pk_typeId { get; set; }
        public string description { get; set; }
        public string active { get; set; }
        public string remarks { get; set; }
    }





}
