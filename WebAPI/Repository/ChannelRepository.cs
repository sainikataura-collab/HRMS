//namespace HRMSWebAPI.Repository
//{
//    public class ChannelRepository
//    {
//    }
//}

using Dapper;
using DocumentFormat.OpenXml.Bibliography;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ChannelRepository : IChannelRepository
    {
        //public async Task<bool> InsertChannelMstAsync(ChannelMst channelMst)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    dynamicParameters.Add("@ChannelCode", channelMst.ChannelCode, DbType.String);
        //    dynamicParameters.Add("@ChannelName", channelMst.ChannelName, DbType.String);
        //    dynamicParameters.Add("@CompanyName", channelMst.CompanyName, DbType.String);
        //    dynamicParameters.Add("@ContactPerson", channelMst.ContactPerson, DbType.String);
        //    dynamicParameters.Add("@ContactNo", channelMst.ContactNo, DbType.String);
        //    dynamicParameters.Add("@EmailId", channelMst.EmailId, DbType.String);
        //    dynamicParameters.Add("@Address", channelMst.Address, DbType.String);
        //    dynamicParameters.Add("@Fk_UserID", channelMst.Fk_UserID, DbType.String);
        //    dynamicParameters.Add("@Fk_LocID", channelMst.Fk_LocID, DbType.String);
        //    dynamicParameters.Add("@isActive", channelMst.IsActive, DbType.Boolean);
        //    dynamicParameters.Add("@UserId", channelMst.UserId, DbType.String);
        //    dynamicParameters.Add("@Password", channelMst.Password, DbType.String);
        //    dynamicParameters.Add("@City", channelMst.City, DbType.String);
        //    dynamicParameters.Add("@Location", channelMst.Location, DbType.String);
        //    dynamicParameters.Add("@Officetype", channelMst.OfficeType, DbType.String);



        //    // dynamicParameters.Add("@fk_companyId", channelMst.Fk_CompanyId, DbType.String);


        //    // Execute stored procedure
        //    int n = DataBaseFactory.QuerySP("SAL_Channel_Ins", dynamicParameters, "ChannelMst_Insert");

        //    return true;
        //}
        public async Task<bool> InsertChannelMstAsync(ChannelMst channelMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@ChannelCode", channelMst.ChannelCode, DbType.String);
            dynamicParameters.Add("@ChannelName", channelMst.ChannelName, DbType.String);
            dynamicParameters.Add("@CompanyName", channelMst.CompanyName, DbType.String);
            dynamicParameters.Add("@ContactPerson", channelMst.ContactPerson, DbType.String);
            dynamicParameters.Add("@ContactNo", channelMst.ContactNo, DbType.String);
            dynamicParameters.Add("@EmailId", channelMst.EmailId, DbType.String);
            dynamicParameters.Add("@Address", channelMst.Address, DbType.String);
            dynamicParameters.Add("@Fk_UserID", channelMst.Fk_UserID, DbType.String);
                dynamicParameters.Add("@Fk_LocID", channelMst.Fk_LocID, DbType.String);

            // REMOVED: @Fk_LocID - now auto-generated in SP
            dynamicParameters.Add("@isActive", channelMst.IsActive, DbType.Boolean);
            dynamicParameters.Add("@UserId", channelMst.UserId, DbType.String);
            dynamicParameters.Add("@Password", channelMst.Password, DbType.String);
            dynamicParameters.Add("@City", channelMst.City, DbType.String);

            dynamicParameters.Add("@Location", channelMst.Location, DbType.String);
            dynamicParameters.Add("@Officetype", channelMst.OfficeType, DbType.String);
            dynamicParameters.Add("@fk_stateid", (object)channelMst.fk_stateid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            int n = DataBaseFactory.QuerySP("SAL_Channel_Ins", dynamicParameters, "ChannelMst_Insert");
            return true;
        }
        public async Task<IEnumerable<ChannelMst>> GetAll()
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            var result = DataBaseFactory.QuerySP<ChannelMst>("SAL_Channel_SelForGrid", dynamicParameters, "ChannelMst_GetAll");

            return result ?? new List<ChannelMst>();
        }

        public async Task<ChannelMst> GetChannelByIdAsync(string channelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ChannelId", channelId, DbType.String);


            return DataBaseFactory.QuerySP<ChannelMst>("SAL_Channel_SelById", dynamicParameters, "ChannelMst_GetById").FirstOrDefault();
        }
        //public async Task<ChannelMst?> GetChannelByIdAsync(string channelId, string fkCompanyId)
        //{
        //    var parameters = new DynamicParameters();
        //    parameters.Add("@pk_ChannelId", channelId, DbType.String);
        //    parameters.Add("@Fk_CompanyId", fkCompanyId, DbType.String);

        //    var result = DataBaseFactory
        //        .QuerySP<ChannelMst>(
        //            "SAL_Channel_SelById",
        //            parameters,
        //            "ChannelMst_GetById"
        //        )
        //        .FirstOrDefault();

        //    return result;
        //}


        public async Task<bool> UpdateChannelMstAsync(ChannelMst channelMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_ChannelId", channelMst.Pk_ChannelId, DbType.String);
            dynamicParameters.Add("@ChannelCode", channelMst.ChannelCode, DbType.String);
            dynamicParameters.Add("@ChannelName", channelMst.ChannelName, DbType.String);
            dynamicParameters.Add("@CompanyName", channelMst.CompanyName, DbType.String);
            dynamicParameters.Add("@ContactPerson", channelMst.ContactPerson, DbType.String);
            dynamicParameters.Add("@ContactNo", channelMst.ContactNo, DbType.String);
            dynamicParameters.Add("@EmailId", channelMst.EmailId, DbType.String);
            dynamicParameters.Add("@Address", channelMst.Address, DbType.String);
            dynamicParameters.Add("@Fk_UserID", channelMst.Fk_UserID, DbType.String);
            dynamicParameters.Add("@Fk_LocID", channelMst.Fk_LocID, DbType.String);
            dynamicParameters.Add("@isActive", channelMst.IsActive, DbType.Boolean);
            dynamicParameters.Add("@UserId", channelMst.UserId, DbType.String);
            dynamicParameters.Add("@Password", channelMst.Password, DbType.String);
            dynamicParameters.Add("@City", channelMst.City, DbType.String);
            dynamicParameters.Add("@Location", channelMst.Location, DbType.String);
            dynamicParameters.Add("@Officetype", channelMst.OfficeType, DbType.String);
            dynamicParameters.Add("@fk_stateid", (object)channelMst.fk_stateid, new DbType?(DbType.Int16), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // dynamicParameters.Add("@fk_companyId", channelMst.Fk_CompanyId, DbType.String);


            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_Channel_Upd", dynamicParameters, "ChannelMst_Update");

            return n > 0;
        }

        public async Task<bool> DeleteChannelMstAsync(string channelId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ChannelId", channelId, DbType.String);

            int n = DataBaseFactory.QuerySP("SAL_Channel_Del", dynamicParameters, "ChannelMst_Delete");

            return n > 0;
        }
    }
}