using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class DesignationRepository : IDesignationRepository
    {
     

        public async Task<bool> InsertDesignationMstAsync(DesignationMst designationMst)
        {
            
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the model in the required dataset structure
                DesignationMstDataSet dataset = new DesignationMstDataSet { Designation = designationMst };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_userid", (object)designationMst.fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_locid", (object)designationMst.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@fk_companyId", (object)designationMst.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                // Log XML for debugging
                Console.WriteLine("Generated XML:\n" + xmlData);

                // Execute stored procedure
                int result =  DataBaseFactory.QuerySP("SAL_Designation_Ins", dynamicParameters, "Designation_Insert");

                return result > 0;
          
        }
        public async Task<(int totalCount, IEnumerable<DesignationMst>)> GetAll(int pageIndex, int pageSize, string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, DesignationMst>("SAL_Designation_SelForGrid", dynamicParameters, "Designation_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }





        public async Task<DesignationMst> GetDesignationByIdAsync(string desigId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_desgid", (object)desigId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<DesignationMst>("SAL_Designation_Edit", (object)dynamicParameters, "Designation Master - GetById").FirstOrDefault<DesignationMst>();
        }


        public async Task<bool> DeleteDesignationMstAsync(string id)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_desgid", (object)id, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Designation_Del", dynamicParameters, "Designation_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }



        public async Task<bool> UpdateDesignationMstAsync(DesignationMst designationMst)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();

                // Wrap the model in the required dataset structure
                DesignationMstDataSet dataset = new DesignationMstDataSet { Designation = designationMst };

                // Serialize to XML
                string xmlData = XmlUtility.XmlSerializeToString(dataset);

                // Add parameters
                dynamicParameters.Add("@pk_desgid", designationMst.pk_desgid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                //dynamicParameters.Add("@pk_desgid", designationMst.pk_desgid, DbType.String);
                dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
                dynamicParameters.Add("@fk_userid", designationMst.fk_userid, DbType.String);
                dynamicParameters.Add("@fk_locid", designationMst.fk_locid, DbType.String);
                dynamicParameters.Add("@Timestamp", designationMst.Timestamp, DbType.Binary); // Assuming timestamp is stored as byte[]

                // Log XML for debugging
                Console.WriteLine("Generated XML:\n" + xmlData);

                // Execute stored procedure
                int result =  DataBaseFactory.QuerySP("SAL_Designation_Upd", dynamicParameters, "Designation_Update");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating designation: " + ex.Message);
                return false;
            }
        }









    }
}
