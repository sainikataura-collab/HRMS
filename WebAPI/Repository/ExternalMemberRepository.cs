using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ExternalMemberRepository:IExternalMemberRepository
    {
        public async Task<(int totalCount, IEnumerable<ExternalMemberMst>)> GetAll(int pageIndex, int pageSize)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
           
            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ExternalMemberMst>("REC_ExternalMember_SelForGrid", dynamicParameters, "GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<ExternalMemberMst> GetByIdAsync(string Pk_ExMemberId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_ExMemberId", (object)Pk_ExMemberId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ExternalMemberMst>("REC_ExternalMember_Edit", (object)dynamicParameters, "GetById").FirstOrDefault<ExternalMemberMst>();
        }

        public async Task<bool> DeleteAsync(string Pk_ExMemberId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_ExMemberId", (object)Pk_ExMemberId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_ExternalMember_Del", dynamicParameters, "Delete");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> InsertAsync(ExternalMemberMst ExternalMemberMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Member_Name", (object)ExternalMemberMst.member_name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Designation", (object)ExternalMemberMst.designation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Department", (object)ExternalMemberMst.department, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Address", (object)ExternalMemberMst.address, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Phone", (object)ExternalMemberMst.phone, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Mobile", (object)ExternalMemberMst.mobile, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Email", (object)ExternalMemberMst.email, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@Remarks", (object)ExternalMemberMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)ExternalMemberMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)ExternalMemberMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
           

            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("REC_ExternalMember_Ins", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }

        public async Task<bool> UpdateAsync(ExternalMemberMst ExternalMemberMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_ExMemberId", (object)ExternalMemberMst.pk_exMemberId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
             dynamicParameters.Add("@Member_Name", (object)ExternalMemberMst.member_name, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Designation", (object)ExternalMemberMst.designation, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Department", (object)ExternalMemberMst.department, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Address", (object)ExternalMemberMst.address, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Phone", (object)ExternalMemberMst.phone, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Mobile", (object)ExternalMemberMst.mobile, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Email", (object)ExternalMemberMst.email, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Remarks", (object)ExternalMemberMst.remarks, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_UserID", (object)ExternalMemberMst.Fk_UserID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Fk_LocID", (object)ExternalMemberMst.Fk_LocID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());
            dynamicParameters.Add("@Timestamp", (object)ExternalMemberMst.Timestamp, new DbType?(DbType.Binary), new ParameterDirection?(), new int?(), new byte?());


            // Execute stored procedure (no output parameters)
            int n = DataBaseFactory.QuerySP("REC_ExternalMember_Upd", dynamicParameters, "Insert");

            return n > 0; // Return true if rows were affected

        }



    }

}
