using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class TNIRepository: ITNIRepository
    {


        public async Task<bool> InsertTNIAsync(TNIRequest tniRequest, List<TNIRequestLine> Details)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();


            string xmlData = XmlUtility.XmlSerializeToString(Details);

            dynamicParameters.Add("@fk_empId", tniRequest.UserId, DbType.String);
            dynamicParameters.Add("@Reason", tniRequest.ReasonForTraining, DbType.String);
            dynamicParameters.Add("@Priority", tniRequest.Priority, DbType.String);
            dynamicParameters.Add("@ProposedTimeline", tniRequest.ProposedTimeline, DbType.String);
            dynamicParameters.Add("@TargetAudience", tniRequest.TargetAudience, DbType.String);
            dynamicParameters.Add("@TrainingXML", xmlData, DbType.String);
            dynamicParameters.Add("@Remarks", tniRequest.Remarks, DbType.String);
            dynamicParameters.Add("@AttachmentPath", tniRequest.AttachmentPath, DbType.String);
            dynamicParameters.Add("@UserID", tniRequest.UserId, DbType.String);
            int result = DataBaseFactory.QuerySP("Training_need_Identification_Insert", dynamicParameters, "TNI_Insert");
            return result > 0;
        }


        public async Task<(int totalCount, IEnumerable<TNIListRow>)> GetAll(int pageIndex, int pageSize,string empid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@empId", (object)empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, TNIListRow>("Trn_Training_need_Identification_SelForGrid", dynamicParameters, "Program-GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }






        //for admin portal
        public async Task<(int totalCount, IEnumerable<TNIListRow>)> GetTNIAdminListAsync(TNIListFilter filter)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@Status", filter.Status, DbType.String);
            parameters.Add("@Priority", filter.Priority, DbType.String);
            parameters.Add("@FromDate", filter.FromDate, DbType.DateTime);
            parameters.Add("@ToDate", filter.ToDate, DbType.DateTime);
            parameters.Add("@Search", filter.Search, DbType.String);
            parameters.Add("@PageNo", filter.PageNo, DbType.Int32);
            parameters.Add("@PageSize", filter.PageSize, DbType.Int32);

            var result =  DataBaseFactory.QuerySP<TNIListRow>(
                "TRN_TNI_Admin_List",
                parameters
            );

            if (result == null || !result.Any())
                return (0, new List<TNIListRow>());

            // totalCount le lo from first row
            int totalCount = result.First().TotalCount;

            return (totalCount, result);
        }


        public async Task<bool> TakeTNIActionAsync(TNIActionRequest req)
        {
            var p = new DynamicParameters();
            p.Add("@Pk_TNIId", req.Pk_TNIId, DbType.Int32);
            p.Add("@Action", req.Action, DbType.String);                // Approve/Reject/Hold
            p.Add("@LineId", req.TNILineId, DbType.String);                // Approve/Reject/Hold
       
            p.Add("@AdminComments", req.AdminComments, DbType.String);
            p.Add("@UserID", req.UserId, DbType.String);

            int result = DataBaseFactory.QuerySP(
                "TRN_TNI_Admin_Action", p, "TRN_TNI_Admin_Action");

            return result > 0; // relies on RETURN 1/0
        }



        public async Task<IEnumerable<TNIRequest>> GetApprovedTNIAsync(int? subProgramId = null,int? TNIId=null)
        {
            var param = new DynamicParameters();
            param.Add("@SubProgramId", subProgramId, DbType.Int32);
            param.Add("@TNIId", TNIId, DbType.Int32);

            // Procedure से दो result sets मिलेंगे (Header + Lines)
            var tuple = DataBaseFactory.QueryMultipleSP<TNIRequest, TNIRequestLine>(
                "GetApproved_TNI",
                param
            );

            List<TNIRequest> approvedTnis = new List<TNIRequest>();

            if (tuple != null)
            {
                var headers = tuple.Item1?.ToList() ?? new List<TNIRequest>();
                var lines = tuple.Item2?.ToList() ?? new List<TNIRequestLine>();

                foreach (var header in headers)
                {
                    // Map all lines to this header
                    header.LineItems = lines
                        .Where(l => l.fk_TNIId == header.Pk_TNIId)
                        .ToList();

                    approvedTnis.Add(header);
                }
            }

            return approvedTnis;
        }





        public async Task<Result<List<NameValue>>> GetsubProgDropdownList(string fk_deptid, string userId, string companyId)
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_programId", fk_deptid, DbType.String);

                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("Sal_Subprogram_Selforddl", dynamicParameters, "[Sal_Subprogram_Selforddl]");

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = data.ToList();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }
        public async Task<Result<List<NameValue>>> GetTNIsubProgDropdownList(string fk_programid, string userId, string companyId)
        {
            var result = new Result<List<NameValue>>();
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                dynamicParameters.Add("@fk_programId", fk_programid, DbType.String);

                // If your QuerySP is not async, remove async/await
                var data = DataBaseFactory.QuerySP<NameValue>("Sal_TNISubprogram_Selforddl", dynamicParameters, "[Sal_Subprogram_Selforddl]");

                result.IsSuccessfull = data != null && data.Any();
                result.Message = result.IsSuccessfull ? "Data retrieved" : "No record found";
                result.Data = data.ToList();
            }
            catch (Exception ex)
            {
                result.IsSuccessfull = false;
                result.Message = $"Error: {ex.Message}";
                result.Data = new List<NameValue>();
            }

            return result;
        }



        public async Task<TrainingCalendarEmployeeView> GetEmpView(string empid, long programId, long subProgramId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_empId", (object)empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_programId", (object)programId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_subProgramId", (object)subProgramId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<TrainingCalendarEmployeeView>("TRN_TrainingCalendar_Employee_List", (object)dynamicParameters, "TRN_TrainingCalendar_Employee_List - GetById").FirstOrDefault<TrainingCalendarEmployeeView>();
        }


        //public async Task<object> CheckPlanningAllowedAsync(int tniId, int programId, int subProgramId)
        //{
        //    DynamicParameters parameters = new DynamicParameters();
        //        parameters.Add("@Pk_TNIId", tniId);
        //        parameters.Add("@ProgramId", programId);
        //        parameters.Add("@SubProgramId", subProgramId);

        //    // Stored procedure returns "Allowed" if planning is possible
        //    var result = DataBaseFactory.QuerySP("Training_need_Identification_Insert",parameters, "TNI_Insert");
        //    return result; // will be null if RAISERROR triggered in SP

        //}



    }
}
