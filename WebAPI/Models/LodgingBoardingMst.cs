using System.Xml.Serialization;

namespace HRMSWebAPI.Models
{

    [XmlRoot("NewDataSet")]
    public class LodgingBoardingXmlModel
    {
        [XmlElement("LTRN_LodgingBoarding_Mst")]
        public List<LodgingBoardingMst> LodgingBoardingMst { get; set; }
    }

    public class LodgingBoardingMst
    {
         public int pk_lodgingboardingId { get; set; }
        public string fk_classid { get; set; }
        public long fk_classTvlId { get; set; }
        public string lodgingboarding { get; set; }
        public string fixedFda { get; set; }
        public string fixedLta { get; set; }
        public string effectivedate { get; set; }
        public bool isActive { get; set; }



      
    }

    public class LodgingBoardingMstGrid {

        public int pk_lodgingboardingId { get; set; }
        public string fk_classid { get; set; }
        public long fk_classTvlId { get; set; }
        public string lodgingboarding { get; set; }
        public string fixedFda { get; set; }
        public string fixedLta { get; set; }
        public string effectivedate { get; set; }
        public string isActive { get; set; }



        //for grid
        public string grade { get; set; } // From SAL_Class_Mst
        public string classname { get; set; } // From LTRN_Class_Mst

    }
}
