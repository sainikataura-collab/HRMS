namespace HRMSWebAPI.Models

{
    public class ModelResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string DocumentId { get; set; }
        public string DocumentNo { get; set; }
        public object? DataObj { get; set; }
        public object? Data { get; set; }

        public int StatusCode { get; set; }
        public int TotalCount { get; set; }

        public string? LoginType { get; set; }
        public bool ShowAdminSwitch { get; set; }
        public bool isotprequired { get; set; }
        public string? contractor_LabelName { get; set; }
        public bool? ContractorApplicable { get; set; }


        public bool? vendor_Applicable { get; set; }
        public bool? showclientdetails { get; set; }
        public bool? isAutoEmpcode { get; set; }



    }



}
