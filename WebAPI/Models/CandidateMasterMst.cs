using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{
    public class CandidateMasterMst
    {
        public string pk_recId { get; set; }
        public string candidate_name { get; set; }
        public string dob { get; set; }  // Stored as VARCHAR(25) in SP, consider DateTime if needed
        public string phone { get; set; }

        public string mobile { get; set; }
        public string filename { get; set; }
        public string picturename { get; set; }

        public string? onboardFormStatus { get; set; }


    }

    public class Mst1
    {
        public string? pk_recId { get; set; }
        public string? fk_jobId { get; set; }
        public string? candidate_name { get; set; }
        public string? father_name { get; set; }
        public string? gender { get; set; }
        public string? fk_specializationId { get; set; }
        public string? fk_recmodeid { get; set; }
        public string? phone { get; set; }
        public string? refcode { get; set; }
        public string? refname { get; set; }
        public string? refmobno { get; set; }
        public string? mobile { get; set; }
        public string? email { get; set; }
        public string? EmailID { get; set; }
        public string? dateofbirth { get; set; }         // Format: dd/MM/yyyy
        public string? dated { get; set; }               // Format: dd/MM/yyyy
        public string? totexperience { get; set; }
        public string? currentctc { get; set; }
        public string? expectedctc { get; set; }
        public string? npmonth { get; set; }
        public string? npdys { get; set; }
        public string? keyskills { get; set; }
        public string? corresAddress { get; set; }
        public string? corresContactNo { get; set; }
        public string? permanentAddress { get; set; }
        public string? permanentContactNo { get; set; }
        public string? height { get; set; }
        public string? weight { get; set; }
        public string? bloodgroup { get; set; }
        public string? medicallyfit { get; set; }
        public string? picturename { get; set; }
        public string? picturetype { get; set; }
        public byte[]? pictureattachment { get; set; }
        public string? filename { get; set; }
        public string? contenttype { get; set; }
        public byte[]? attachment { get; set; }

        [XmlIgnore]
        public IFormFile? File { get; set; }

        [XmlIgnore]
        public IFormFile? Pic { get; set; }
        public string? remarks { get; set; }
        public int? interviewroundcandidate { get; set; }
        public string? Reason_for_Change { get; set; }
        public string? Ready_For_Any_location { get; set; }
        public string? nativity { get; set; }
        public string? selection_remarks { get; set; }
        public byte[]? Timestamp { get; set; }
        public string? education { get; set; }
        public string? designation { get; set; }
        public string? functionName { get; set; }
        public string? department { get; set; }
        public string? interviewer { get; set; }
        public string? status { get; set; }
        public string? Joinindays { get; set; }
        public string? fk_zoneId { get; set; }

        public string? UpdFileChange { get; set; }

        public string? UpdPicChange { get; set; }

        public string? CandidateKey { get; set; } //added code LR

        public bool IsOnboardingDone = false; //added code LR

        public string? VerificationLink { get; set; }

    }

    public class Mst2
    {
        public string? fk_recId { get; set; }
        public string? fk_qualiId { get; set; }
        public string? qualification { get; set; }
        public string? subjects { get; set; }
        public string? marks_obtained { get; set; }
        public string? percentage { get; set; }
        public string? fk_updDateID { get; set; }
    }

    public class Mst3
    {
        public string? fk_recId { get; set; }
        public string? companyname { get; set; }
        public string? designation { get; set; }
        public string? profile { get; set; }
        public string? fromdate { get; set; }  // Format: dd/MM/yyyy
        public string? todate { get; set; }    // Format: dd/MM/yyyy
        public string? fk_updDateID { get; set; }
    }

    public class Mst4
    {
        public string? fk_recId { get; set; }
        public string? familyname { get; set; }
        public string? familydob { get; set; }   // Format: dd/MM/yyyy
        public string? familyage { get; set; }
        public string? familyrelationship { get; set; }
        public string? fk_updDateID { get; set; }

    }

    [XmlRoot(ElementName = "NewDataSet")]
    public class CandidateXmlModel
    {
        [XmlElement("REC_Candidate_Details")]
        public Mst1 Mst1 { get; set; }

        //[XmlElement("REC_Candidate_Educational_Details")]
        //public List<Mst2> Mst2 { get; set; } = [];

       

        //[XmlElement("REC_Candidate_Experience_Details")]
        //public List<Mst3> Mst3 { get; set; } = [];

        //[XmlElement("REC_Candidate_FamilyDetails_Mst")]
        //public List<Mst4> Mst4 { get; set; } = [];
    }
    public class Response
    {
        public Mst1 Mst1 { get; set; }
        public Mst2 Mst2 { get; set; }
        public Mst3 Mst3 { get; set; }
        public Mst4 Mst4 { get; set; }
    }

}
