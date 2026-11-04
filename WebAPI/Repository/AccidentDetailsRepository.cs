using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class AccidentDetailsRepository:IAccidentDetailsRepository
    {

        public async Task<(int TotalCount, List<AccidentDetailsMst> detailsMst)> GetEmployeeAccidentsAsync(int pageIndex, int pageSize, string fk_empid)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, AccidentDetailsMst>("HR_EmployeeAccident_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //get by id
        public async Task<AccidentDetailsMst> GetById(string pk_accidentId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_accidentId", (object)pk_accidentId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<AccidentDetailsMst>("HR_EmployeeAccident_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<AccidentDetailsMst>();

        }
        //for delete
        //delete
        public async Task<bool> Delete(string pk_accidentId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_accidentId", (object)pk_accidentId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("HR_EmployeeAccident_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }
        //for update


        public async Task<bool> InsertEmployeeAccidentAsync(AccidentDetailsMst AccidentDetails, string fk_locid, string fk_userid)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Serialize XML wrapper dataset model
                AccidentDetailsMstXmlModel dataset = new AccidentDetailsMstXmlModel { AccidentDetails = AccidentDetails };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_locid", fk_locid, DbType.String);
                dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);

                var result = DataBaseFactory.QuerySP("HR_EmployeeAccident_Ins", dynamicParameters); // assuming async call returns affected rows
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }




        public async Task<bool> UpdateEmployeeAccidentAsync(string pk_accidentId, AccidentDetailsMst AccidentDetails, string fk_locid, string fk_userid)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Serialize XML wrapper dataset model
                AccidentDetailsMstXmlModel dataset = new AccidentDetailsMstXmlModel { AccidentDetails = AccidentDetails };

                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@pk_accidentId", pk_accidentId, DbType.String);
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_locid", fk_locid, DbType.String);
                dynamicParameters.Add("@fk_userid", fk_userid, DbType.String);
                dynamicParameters.Add("@Timestamp", AccidentDetails.Timestamp, DbType.Binary);

                var result = DataBaseFactory.QuerySP("HR_EmployeeAccident_Upd", dynamicParameters); // assuming async call returns affected rows
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Error: " + ex.Message);
                return false;
            }
        }

    }
}
