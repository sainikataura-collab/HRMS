//namespace HRMSWebAPI.Repository
//{
//    public class LocalTravelRepository
//    {
//    }
//}


using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
   

    public class LocalTravelRepository : ILocalTravelRepository
    {
        /// <summary>
        /// Insert new Local Travel Requisition
        /// </summary>
        public async Task<bool> CreateAsync(LocalTravelMst model)
        {
            string xmlData = XmlUtility.XmlSerializeToString(model);

            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Call the stored procedure
            int n = DataBaseFactory.QuerySP("TVL_LocalTravelRequisition_Mst_Insert", dynamicParameters, "TVL_LocalTravelRequisition_Mst_Insert");

            return n > 0;
        }

        /// <summary>
        /// Get all Local Travel Requisitions for employee
        /// </summary>
        public async Task<List<LocalTravelGet>> GetAll(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", (object)fk_empid, DbType.String);

            // Call the stored procedure
            var result = DataBaseFactory.QuerySP<LocalTravelGet>(
                "TVL_LocalTravelRequisition_Mst_Selforgrid",
                dynamicParameters,
                "Selected all");

            return await Task.FromResult(result.ToList());
        }

        /// <summary>
        /// Get Local Travel Requisition by ID for editing
        /// </summary>
        public async Task<ResponseIdMst> GetByIdAsync(long pk_localtravelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_localtravelId", pk_localtravelId, DbType.Int64);

            var tuple = DataBaseFactory.QueryMultipleSP<LocalTravelRequisitionMst, LocalTravelRequisitionDateTransactionTrn, EmployeeDetailsDTO>(
                "TVL_LocalTravelRequisition_Mst_Edit",
                dynamicParameters,
                "Edited");

            var result = new ResponseIdMst();

            if (tuple != null && tuple?.Item1 != null)
            {
                result.LocalTravelRequisitionMst = tuple.Item1.ToList();
            }
            if (tuple != null && tuple?.Item2 != null)
            {
                result.LocalTravelRequisitionDateTransactionTrn = tuple.Item2.ToList();
            }
            if (tuple.Item3 != null)
            {
                result.EmployeeDetails = tuple.Item3.FirstOrDefault();
            }


            return result;
        }

        /// <summary>
        /// Delete Local Travel Requisition (only if not approved)
        /// </summary>
        public async Task<(bool isSuccess, string message)> DeleteAsync(long pk_localtravelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_localtravelId", (object)pk_localtravelId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@IsSuccessful", (object)null, new DbType?(DbType.Boolean), new ParameterDirection?(ParameterDirection.Output), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Message", (object)null, new DbType?(DbType.String), new ParameterDirection?(ParameterDirection.Output), new int?(255), new byte?(), new byte?());

            DataBaseFactory.QuerySP("TVL_LocalTravelRequisition_Mst_delNotApproved", dynamicParameters, "Delete");

            bool isSuccessful = dynamicParameters.Get<bool>("IsSuccessful");
            string message = dynamicParameters.Get<string>("Message");

            return (isSuccessful, message);
        }

        /// <summary>
        /// Update Local Travel Requisition
        /// </summary>
        //public async Task<bool> UpdateLocalTravelMstAsync(LocalTravelMst model )
        //{
        //    string xmlData = XmlUtility.XmlSerializeToString(model);

        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@Doc", (object)xmlData, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //    dynamicParameters.Add("@pk_localtraveIDateId", (object)LocalTravelRequisitionDateTransaction.pk_localtraveIDateId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        //   // dynamicParameters.Add("@pk_localtraveIDateId", (object)LocalTravelRequisitionDateTransaction.pk_localtraveIDateId, DbType.String);

        //    // Execute stored procedure for update
        //    int n = DataBaseFactory.QuerySP("TVL_LocalTravelRequisition_Mst_Upd", dynamicParameters, "LocalTravel_Mst_Update");

        //    return n > 0; // Return true if rows were affected
        //}
   public async Task<bool> UpdateLocalTravelMstAsync(LocalTravelMst model)
{
    string xmlData = XmlUtility.XmlSerializeToString(model);
    
    DynamicParameters dynamicParameters = new DynamicParameters();
    dynamicParameters.Add("@Doc", xmlData, DbType.String);
    dynamicParameters.Add("@pk_localtravelId", model.LocalTravelRequisitionMst[0].pk_localtravelId, DbType.Int64);
    
            int n = DataBaseFactory.QuerySP("TVL_LocalTravelRequisition_Mst_Update", dynamicParameters, "LocalTravel_Mst_Update");
    return n > 0;
}

        public async Task<bool> SubmitLocalTravel(string fk_empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empid", fk_empid, DbType.String);

            int n = DataBaseFactory.QuerySP("TVL_LocalTravelRequisition_Mst_Submit",
                dynamicParameters,
                "LocalTravel_Submit");

            return n > 0;
        }

    }






}