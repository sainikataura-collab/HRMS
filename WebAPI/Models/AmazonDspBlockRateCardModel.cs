using System;

namespace HRMSWebAPI.Models
{
    public class AmazonDspBlockRateCardModel
    {
        public long pk_BlockRateCardID { get; set; }
        public string? LocationID { get; set; }
        public string? LocationName { get; set; }
        public string? Block { get; set; }
        public string? BlockName { get; set; }
        public string? VehicleType { get; set; }
        public string? VehicleTypeName { get; set; }
        public string? Rate { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public string? fk_CompanyID { get; set; }
        public DateTime? Dated { get; set; }
        public string? Source { get; set; }
        public string? FilePath { get; set; }
        public DateTime? UploadTime { get; set; }
        public string? fk_InsUserID { get; set; }
        public string? fk_UpdUserID { get; set; }
        public string? fk_InsDateID { get; set; }
        public string? fk_UpdDateID { get; set; }


        public string? InsertedByName { get; set; }
        public string? UpdatedByName { get; set; }
        public DateTime? InsertedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class AmazonDspBlockRateCardResponseModel
    {
        public bool IsSuccessfully { get; set; }
        public string? IsMessage { get; set; }
        public long? pk_BlockRateCardID { get; set; }
    }

    // Amazon DSP Block RateCard=================
    public class BlockRateCardResponseModel
    {
        public bool IsSuccessfully { get; set; }
        public string? IsMessage { get; set; }
        public long? RecId { get; set; }
        public string? pk_recId { get; set; }
        public int? File_Id { get; set; }
    }

    public class BlockRateCardUploadRowModel
    {
        public string? Location { get; set; }
        public string? Block { get; set; }
        public string? VehicleType { get; set; }
        public string? Rate { get; set; }
        public string? EffectiveDate { get; set; }
        public bool IsSuccess { get; set; }
        public string? Status { get; set; }
        public string? Message { get; set; }
        public int? File_Id { get; set; }
        public string? uploadedByName { get; set; }
        public int? FileID { get => File_Id; set => File_Id = value; }
    }

    public class BlockRateCardUploadFileItemModel
    {
        public int pk_id { get; set; }
        public int? File_Id { get; set; }
        public long pk_BlockRateCardID { get; set; }
        public string? originalFileName { get; set; }
        public string? savedFileName { get; set; }
        public string? savedFilePath { get; set; }
        public string? FilePath { get; set; }
        public DateTime? UploadTime { get; set; }
        public DateTime? createdDate { get; set; }
        public string? fk_companyId { get; set; }
        public string? fk_userId { get; set; }
        public string? fk_InsUserID { get; set; }
        public int totalRecords { get; set; }
        public string? uploadedByName { get; set; }
        public int successCount { get; set; }
        public int failedCount { get; set; }
        public int TotalCount { get; set; }
    }

    [System.Xml.Serialization.XmlRoot("AmazonDspBlockRateCards")]
    public class AmazonDspBlockRateCardXmlRequest
    {
        [System.Xml.Serialization.XmlElement("Row")]
        public List<AmazonDspBlockRateCardXmlItem> Rows { get; set; } = new();
    }

    public class AmazonDspBlockRateCardXmlItem
    {
        public string? Location { get; set; }
        public string? Block { get; set; }
        public string? VehicleType { get; set; }
        public string? Rate { get; set; }
        public string? EffectiveDate { get; set; }
    }


}
