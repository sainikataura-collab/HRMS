using System;
using System.ComponentModel.DataAnnotations;

namespace HRMSWebAPI.Models
{
    public class ExternalCandidate
    {
        public string? ExternalId { get; set; }
        public string? SourcePlatform { get; set; } // "Naukri", "Indeed", etc.
        public string? JobId { get; set; } // The ID of the job they applied for
        
        [Required]
        public string? FullName { get; set; }
        
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
        
        public string? PhoneNumber { get; set; }
        public string? Location { get; set; }
        
        public string? ResumeUrl { get; set; }
        public string? LinkedInProfileUrl { get; set; }
        
        public decimal? YearsOfExperience { get; set; }
        public string? CurrentCompany { get; set; }
        public string? CurrentDesignation { get; set; }
        
        public DateTime ApplicationDate { get; set; }
        
        // Status of the application on the external platform
        public string? Status { get; set; } 
    }
}
