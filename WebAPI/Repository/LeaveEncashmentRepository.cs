using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class LeaveEncashmentRepository:ILeaveEncashmentRepository
    {

        //for get all
        public async Task<(int totalCount, IEnumerable<LeaveEncashmentMst>)> GetAll(int pageIndex, int pageSize, string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, LeaveEncashmentMst>("SAL_LeaveEncashment_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<LeaveEncashmentMst> GetByIdAsync(string pk_encashid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_encashid", (object)pk_encashid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<LeaveEncashmentMst>("SAL_LeaveEncashment_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<LeaveEncashmentMst>();

        }

        public async Task<bool> Delete(string pk_encashid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_encashid", (object)pk_encashid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_LeaveEncashment_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        //public Task<bool> InsertAsync(LeaveEncashmentDetail detail, decimal amount_N, string Fk_LocID, string Fk_UserID);

        public async Task<bool> InsertAsync(LeaveEncashmentDetail detail, decimal amount_N, string Fk_LocID, string Fk_UserID)

        {
            DynamicParameters dynamicParameters = new DynamicParameters();



            // Wrap the detail inside the dataset structure
            var dataset = new LeaveEncashmentXmlModel
            {
                Detail = detail
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@amount_N", amount_N, DbType.Decimal);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);

            // Optional: Log for debugging
           // Console.WriteLine("Generated Leave Encashment XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveEncashment_Ins", dynamicParameters, "LeaveEncashment_Insert");

            return result > 0;

        }

        //update

        public async Task<bool> Update(string pk_encashid, LeaveEncashmentDetail detail, decimal amount_N, string Fk_LocID, string Fk_UserID)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();



            // Wrap the detail inside the dataset structure
            var dataset = new LeaveEncashmentXmlModel
            {
                Detail = detail
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_encashid", pk_encashid, DbType.String);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@amount_N", amount_N, DbType.Decimal);
            dynamicParameters.Add("@Fk_LocID", Fk_LocID, DbType.String);
            dynamicParameters.Add("@Fk_UserID", Fk_UserID, DbType.String);
            dynamicParameters.Add("@Timestamp", detail.Timestamp, DbType.Binary);

            // Optional: Log for debugging
            // Console.WriteLine("Generated Leave Encashment XML:\n" + xmlData);

            // Execute stored procedure
            int result = DataBaseFactory.QuerySP("SAL_LeaveEncashment_Upd", dynamicParameters, "LeaveEncashment_update");

            return result > 0;

        }

        //for the balance leave
        public async Task<LeaveEncashmentMst>balanceleave(string fk_empid, decimal Fk_leaveid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Fk_leaveid", (object)Fk_leaveid, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            return DataBaseFactory.QuerySP<LeaveEncashmentMst>("SAL_Employee_LeaveBalance_ForEncash", (object)dynamicParameters, "GetById").FirstOrDefault<LeaveEncashmentMst>();

        }

        //public async Task<bool>calculatedAmmount(calculateAmmount Ammount)

        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();



        //    // Wrap the detail inside the dataset structure
        //    var dataset = new calculateAmmountXmlModel
        //    {
        //        Ammount = Ammount
        //    };

        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(dataset);

        //    // Add parameters
        //    dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

        //    // Optional: Log for debugging
        //    // Console.WriteLine("Generated Leave Encashment XML:\n" + xmlData);

        //    // Execute stored procedure
        //    int result = DataBaseFactory.QuerySP("SAL_LeaveEncashment_Amount", dynamicParameters, "LeaveEncashment_calculation");

        //    return result > 0;

        //}

        public async Task<decimal> calculatedAmmount(calculateAmmount model)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap into XML model
            var dataset = new calculateAmmountXmlModel
            {
                Ammount = model
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add the parameter
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            // Execute SP and return the decimal result
            ResultAmount result = DataBaseFactory.QuerySP<ResultAmount>("SAL_LeaveEncashment_Amount",dynamicParameters,"LeaveEncashment_calculation"
         ).FirstOrDefault<ResultAmount>(); // Since it returns one row with one column (amount)

            Console.WriteLine( result.amount );
            var amt = result.amount;
            return amt;
        }


    }
}
