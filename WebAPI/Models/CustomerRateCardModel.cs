using System;
using System.Collections.Generic;

namespace HRMSWebAPI.Models
{
    public class CustomerRateCardMasterDTO
    {
        public int RateCardId { get; set; }
        public string? fk_CompanyId { get; set; }
        public string? CustomerId { get; set; }
        public string? LocationId { get; set; }
        public int ServiceTypeId { get; set; }
        public string? CategoryId { get; set; }
        public int WorkDuration { get; set; }
        
        // These can be useful for GET responses
        public string? CustomerName { get; set; }
        public string? LocationName { get; set; }
        public string? ServiceTypeName { get; set; }
        public string? CategoryName { get; set; }
        public string? WorkDurationName { get; set; }

        public string? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool IsActive { get; set; }

        public List<CustomerRateCardDetailsDTO> Details { get; set; } = new List<CustomerRateCardDetailsDTO>();
    }

    public class CustomerRateCardDetailsDTO
    {
        public int RateCardDetailId { get; set; }
        public int RateCardId { get; set; }
        public int HeadId { get; set; }
        public string? HeadName { get; set; } // Optional: For display purposes
        public decimal Amount { get; set; }
    }

    public class CustomerRateCardFilterModel
    {
        public int PageIndex { get; set; } = 0;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; } = "";
    }

    public class MinimumWageHeadDTO
    {
        public int HeadId { get; set; }
        public string? ShortDesc { get; set; }
        public string? Description { get; set; }
        public decimal MinAmount { get; set; }
    }

    public class MinimumWageResponseDTO
    {
        public string? StateId { get; set; }
        public string? StateName { get; set; }
        public string? CategoryId { get; set; }
        public decimal MinimumWages { get; set; }
        public List<MinimumWageHeadDTO> Heads { get; set; } = new List<MinimumWageHeadDTO>();
    }
}
