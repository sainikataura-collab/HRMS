using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;

namespace HRMSWebAPI.Repository
{
    public class ManualRepository : IManualRepository
    {

        public async Task<Result<List<ManualMst>>> GetAllAsync(string fk_empid, string fk_monthId, string fk_yearId, string flag)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@fk_empid", (object)fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_monthId", (object)fk_monthId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_yearId", (object)fk_yearId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@flag", (object)null, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());


            var tuple =  DataBaseFactory.QueryMultipleSP<ManualMst,leavecount>("EMP_Attendance_Details_inout", dynamicParameters, "Attendance_Details");
            List<ManualMst> data = [];
            if (tuple!=null && tuple.Item1 != null)
            {
                data = tuple.Item1.ToList();
            }
            var totalLeaveCount = 0;

            if(tuple!=null && tuple.Item2 != null)
            {
                leavecount lv = tuple.Item2.FirstOrDefault();
                totalLeaveCount = lv.totalleavetaken;
            }
            //var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ManualMst>("EMP_Attendance_Details", dynamicParameters, "Attendance_Details");
            var finalResult = new Result<List<ManualMst>>
            {
                //IsSuccessfull = dynamicParameters.Get<bool>("@IsSuccessfull"),
                //Message = dynamicParameters.Get<string>("@Message"),
                Data = data.ToList(),
                count = totalLeaveCount
            };

            return finalResult;
        }
        public async Task<ManualMst> GetInOutByIdAsync(string pk_inoutid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Pk_inoutid", (object)pk_inoutid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ManualMst>("SAL_Attendance_Mispunch_InOut_Edit", (object)dynamicParameters, "Mispunch InOut - GetById").FirstOrDefault<ManualMst>();
        }

        public async Task<bool> UpdateInOutAsync(ManualMst manualMst)
        {
            try
            {
                DynamicParameters dynamicParameters = new DynamicParameters();
                //ManualMstDataSet dataset = new ManualMstDataSet { manualMst = manualMst };

                //string xmlData = XmlUtility.XmlSerializeToString(dataset);

                dynamicParameters.Add("@fk_empid", (object)manualMst.fk_empid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@dated", (object)manualMst.dated, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@InTime ", (object)manualMst.intime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
                dynamicParameters.Add("@OutTime", (object)manualMst.outtime, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

                int result = DataBaseFactory.QuerySP("SAL_Mispuntch_Upd", dynamicParameters, "Mispuntch_Upd");

                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error updating Manual: " + ex.Message);
                return false;
            }

        }



    }

}
