using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using static Dapper.SqlMapper;

namespace HRMSWebAPI.Repository
{
    public class MonthlySalSlipRepository : IMonthlySalSlipRepository
    {



        public async Task<bool> InsertMonthlySalarySlipMessageAsync(ManthlySalSlipDataset salaryMessages, string fk_finid)
        {
            

            // 2. Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(salaryMessages);

            // 3. Prepare parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String); // Use the fk_finid passed from the controller

            // 5. Call Stored Procedure
            int result =  DataBaseFactory.QuerySP("SAL_SalarySlip_Message_Ins", dynamicParameters, "SalarySlipMessage_Insert");

            // 6. Return result
            return result > 0;
        }


        public async Task<bool> UpdateMonthlySalarySlipMessageAsync(ManthlySalSlipDataset salaryMessages, string fk_finid)
        {
            string xmlData = XmlUtility.XmlSerializeToString(salaryMessages);
            // 3. Prepare parameters
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String); // Use the fk_finid passed from the controller

            // 5. Call Stored Procedure
            int result = DataBaseFactory.QuerySP("SAL_SalarySlip_Message_Upd", dynamicParameters, "SAL_SalarySlip_Message");

            // 6. Return result
            return result > 0;
        }



        // get by id


        public async Task<(List<GetbyidModelTempMassage>, List<GetbyidModelMassage>)> GetById(string fk_finid)
        {
            var dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_finid", fk_finid, DbType.String, ParameterDirection.Input);

            // Use the stored procedure name and parameters
            var tuple = DataBaseFactory.QueryMultipleSP<GetbyidModelTempMassage, GetbyidModelMassage>(
                "SAL_SalarySlip_Message_Edit",  // Stored Procedure Name
                dynamicParameters,
                "SAL_SalarySlip_Message_Edit"                    // Connection Name
            );

            // Extract the 3 result sets
            //GetbyidModelTempMassage TempMessage = null;
            //GetbyidModelMassage SalaryMessage= null;
            List<GetbyidModelTempMassage> TempMessage = new();
            List<GetbyidModelMassage> SalaryMessage = new();

            if (tuple != null)
            {
                TempMessage = tuple.Item1?.ToList();
                SalaryMessage = tuple.Item2?.ToList();
                
            }

            return (TempMessage, SalaryMessage);
        }




        public async Task<bool> Delete(string fk_finid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_finid", (object)fk_finid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
        
            int n = DataBaseFactory.QuerySP("SAL_SalarySlip_Message_Del", dynamicParameters, "SAL_SalarySlip_Message_Del");
            return n > 0; // Return true if rows were affected
        }

    }


}
