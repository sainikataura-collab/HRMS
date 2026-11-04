

using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class QualificationDetailsRepository: IQualificationDetailsRepository
    {


        public async Task<bool> InsertEmpQuali(QualificationDetails qualificationMst)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            QualificationDetailsDataSet dataset = new QualificationDetailsDataSet { qualificationDetails = qualificationMst };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());



            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("HR_Employee_Qualif_Ins", dynamicParameters, "Qualification_Insert");

            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<QualificationDetails>)> GetAll(int pageIndex, int pageSize, string? fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, QualificationDetails>("HR_Employee_Qualif_SelForGrid", dynamicParameters, "EmpQualification_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }
        

        public async Task<QualificationDetails> GetById(string pk_empqualid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empqualid", (object)pk_empqualid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<QualificationDetails>("HR_Employee_Qualif_Edit", (object)dynamicParameters, "Qulaification_Details - GetById").FirstOrDefault<QualificationDetails>();
        }

        public async Task<bool> DeleteQualifiacationAsync(string pk_empqualid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_empqualid", (object)pk_empqualid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_Employee_Qualif_Del", dynamicParameters, "EMpQualification_Delete");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> UpdateQualificationDetails(QualificationDetails experienceDetails)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            QualificationDetailsDataSet dataset = new QualificationDetailsDataSet { qualificationDetails = experienceDetails };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters

            dynamicParameters.Add("@pk_empqualid", (object)experienceDetails.pk_empqualid, DbType.String);
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)experienceDetails.Timestamp, DbType.Binary); // Assuming timestamp is stored as byte[]

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("HR_Employee_Qualif_Upd", dynamicParameters, "Qualification_Update");

            return result > 0;

        }


    }
}
