using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ReimDocStatusRepository:IReimDocStatusRepository
    {
        
        //for insert
        public async Task<bool> InsertReimDocStatus(List<ReimDocStatusMst> reimDocStatusMst, string fk_locid, string fk_userid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
           ReimDocStatusMstDataSet dataset = new ReimDocStatusMstDataSet { ReimdocStatus = reimDocStatusMst};

             // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
             dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                 // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("SAL_Employee_ReimburseDocStatus_Ins", dynamicParameters, "Reim.Doc status_Insert");

            return result > 0;
        }



        //for get all
        public async Task<(int totalCount, IEnumerable<ReimDocStatusMst>)> GetAll(int pageindex, int pagesize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageindex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pagesize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ReimDocStatusMst>("SAL_Employee_ReimburseDocStatus_SelForGrid", dynamicParameters, "Reim Docstatus_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        //get by id
        public async Task<ReimDocStatusMst> GetReimDocstatusById(string pk_docid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ReimDocStatusMst>("SAL_Employee_ReimburseDocStatus_Edit", (object)dynamicParameters, "Reim. doc status  - GetById").FirstOrDefault<ReimDocStatusMst>();

        }
        //for delete
        //delete
        public async Task<bool> DeleteDocStatus(string pk_docid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Employee_ReimburseDocStatus_Del", dynamicParameters, "Reim.doc status_Delete");

            return n > 0; // Return true if rows were affected
        }
        //for update
       
        public async Task<bool> UpdateReimDocStatus(string pk_docid, ReimDocStatusMst reimDocStatusMst, string fk_locid, string fk_userid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            ReimDocStatusMstDataSet dataset = new ReimDocStatusMstDataSet { ReimdocStatus = new List<ReimDocStatusMst> { reimDocStatusMst } };

          
            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_docid", (object)pk_docid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@xmlDoc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userid", (object)fk_userid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            dynamicParameters.Add("@Timestamp", (object)reimDocStatusMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), null, new byte?(), new byte?());

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result =  DataBaseFactory.QuerySP("SAL_Employee_ReimburseDocStatus_Upd", dynamicParameters, "Reim.Doc status_update");

            return result > 0;
        }


    }
}
