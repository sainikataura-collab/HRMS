using System.Xml.Serialization;

namespace HRMSWebAPI.Models

{
    // Dataset class for XML serialization
    [XmlRoot("NewDataSet")]
    public class DemographicMstDataSet
    {
        [XmlElement("SAL_EmployeeOther_Details")]
        public List<DemographicMst> Demographic { get; set; }
        
         [XmlElement("SAL_EmployeeFamily_Details")]
        public List<DemographicMstFamily>? FamilyMembers { get; set; }
    }
    public class DemographicMst
    {
        public string fk_empid { get; set; }
        public string? fk_locid { get; set; }
        public string? gender { get; set; }    
        // Gender of the employee
        public string? fk_religionid { get; set; }             // Foreign key for religion ID
        public string? fk_catid { get; set; }                  // Foreign key for category ID
        public string? fk_recmodeid { get; set; }              // Foreign key for recruitment mode ID
        public string? fk_bgroupid { get; set; }               // Foreign key for blood group ID
        public string? paymode { get; set; }                  // Payment mode
        public string? incdate { get; set; }               // Increment date (nullable)
        public string? marriagedate { get; set; }          // Marriage date (nullable)
        public string? spousename { get; set; }               // Spouse's name
        public string? maritalstatus { get; set; }            // Marital status
        public short? totchild { get; set; }                   // Total number of children (nullable)
        public string? emrcontactpername { get; set; }        // Emergency contact person name
        public string? relation { get; set; }                 // Relation with emergency contact
        public string? emrcontactno { get; set; }             // Emergency contact number
        public string? esidispname { get; set; }              // ESI dispensary name
        public string? pfno { get; set; }                     // PF number
        public decimal? prev_pf_amt { get; set; }              // Previous PF amount (nullable)
        public decimal? prev_volpf_amt { get; set; }           // Previous voluntary PF amount (nullable)
        public decimal? prev_epf_amt { get; set; }             // Previous EPF amount (nullable)
        public decimal? prev_eps_amt { get; set; }             // Previous EPS amount (nullable)
        public decimal? leave { get; set; }             // Previous EPS amount (nullable)
        public decimal? superannuation { get; set; }             // Previous EPS amount (nullable)
        public decimal? saf { get; set; }             // Previous EPS amount (nullable)
        public string? esino { get; set; }                    // ESI number

        public string? Vehicles { get; set; }                 // Vehicle details
        public string? height { get; set; }                   // Height
        public string? hobies { get; set; }                  // Hobbies (corrected from "hobies")
        public string? reference { get; set; }
        public string? dept { get; set; }
        public string? fathername { get; set; }
        public string? designation { get; set; }
        public string? empcode { get; set; }                // Reference details
        public string? manualempcode { get; set; }                // Reference details
        public string? empname { get; set; }                // Reference details
        public string? IdentificationMarks { get; set; }      // Identification marks
        public string? scholarships { get; set; }             // Scholarships details
        public string? corresAddress { get; set; }            // Correspondence address
        public string? corresContactNo { get; set; }          // Correspondence contact number
        public string? permanentAddress { get; set; }         // Permanent address
        public string? permanentContactNo { get; set; }       // Permanent contact number
        public string? technicalQualifications { get; set; }  // Technical qualifications
        public decimal? houserent { get; set; }              // House rent amount (nullable)
        public decimal? totalexp { get; set; }                 // Total experience
        public decimal? gratuity { get; set; }                 // Total experience
        public decimal? loans { get; set; }                 // Total experience     
        public string? SAFPolicyNo { get; set; }              // SAF policy number
        public string? passport_no { get; set; }               // Passport number
        public string? Passport_office { get; set; }           // Passport issuing office
        public string? pass_issuedate { get; set; }         // Passport issue date (nullable)
        public string? pass_validity { get; set; }  
        // Passport validity date (nullable)
        [XmlElement("Licenseno")]
        public string? licenseno { get; set; }                // License number
        public string? filename { get; set; }                 // File name for attachment
        public string? contenttype { get; set; }              // Content type of attachment                                                      
        public string? otherLeaveDate { get; set; }        // Other leave date (nullable)
        public bool? otherLeaveLock { get; set; }            // Other leave lock status (nullable)
        public string? fk_updUserID { get; set; }              // Foreign key for updating user ID
        public string? fk_updDateID { get; set; }              // Foreign key for update date ID          // Timestamp (nullable)
        public string? PersonalEmail { get; set; }            // Personal email
        public string? PersonalContactno { get; set; }        // Personal contact number
        public string? OfficialContactno { get; set; }        // Official contact number

       public  List<DemographicMstFamily>? FamilyMembers { get; set; }
    }

    public class DemographicMstFamily
    {
        public string? pk_familyid { get; set; }
        public string? fk_empid { get; set; }
        public string? membername { get; set; }
        public string? relation { get; set; }
        public string? qualification { get; set; }
        public string? occupation { get; set; }
        public string? dob { get; set; }

    }

}
