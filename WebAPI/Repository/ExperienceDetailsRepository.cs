using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.Common;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ExperienceDetailsRepository : IExperienceDetailsRepository
    {


        public async Task<(int totalCount, IEnumerable<ExperienceDetails>)> GetAll(int pageIndex, int pageSize, string? fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ExperienceDetails>("SAL_Employee_PreJob_SelForGrid", dynamicParameters, "ExperienceDetails_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<ExperienceDetails> GetById(long pk_pjobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_pjobid", (object)pk_pjobid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ExperienceDetails>("SAL_Employee_PreJob_Edit", (object)dynamicParameters, "Experience_Details - GetById").FirstOrDefault<ExperienceDetails>();
        }


        public async Task<bool> InsertEmployeePrevJob(ExperienceDetails designationMst)
        {

            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            ExperienceDetailsDataSet dataset = new ExperienceDetailsDataSet { experienceDetails = designationMst };

            // Convert date fields to valid date strings before serialization
            if (DateTime.TryParse(designationMst.fromdate, out DateTime fromDate))
            {
                designationMst.fromdate = fromDate.ToString("yyyy-MM-dd");
            }
            if (DateTime.TryParse(designationMst.todate, out DateTime toDate))
            {
                designationMst.todate = toDate.ToString("yyyy-MM-dd");
            }

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_PreJob_Ins", dynamicParameters, "Experience_Insert");

            return result > 0;
        }



        public async Task<bool> DeleteExperienceAsync(string pk_pjobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_pjobid", (object)pk_pjobid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_PreJob_Del", dynamicParameters, "Experience_Delete");

            return n > 0; // Return true if rows were affected
        }


        public async Task<bool> UpdateExperienceDetailsAsync(ExperienceDetails experienceDetails)
        {
            
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the model in the required dataset structure
                ExperienceDetailsDataSet dataset = new ExperienceDetailsDataSet { experienceDetails = experienceDetails };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters

                dynamicParameters.Add("@pk_pjobid", (object)experienceDetails.pk_pjobid, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                
                dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                dynamicParameters.Add("@Timestamp", (object)experienceDetails.Timestamp, DbType.Binary); // Assuming timestamp is stored as byte[]

                // Log XML for debugging
                Console.WriteLine("Generated XML:\n" + xmlData);

                // Execute stored procedure
                int result = await DataBaseFactory.QuerySPAsync("SAL_Employee_PreJob_Upd", dynamicParameters, "Experience_Update");

                return result > 0;
          
        }

    }
}



