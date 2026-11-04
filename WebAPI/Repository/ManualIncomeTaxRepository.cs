using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ManualIncomeTaxRepository : IManualIncomeTaxRepository
    {
        public async Task<IEnumerable<ManualIncomeTaxMst>> GetAllManualITaxAsync(ManualIncomeTaxMstRequest filter)
        {
            var commonFunction = new CommonFunction();
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Create combined XML for locations and departments
            var combinedXml = commonFunction.GetRecords(filter.SelectedLocations, filter.SelectedDepartments);

            dynamicParameters.Add("@empcode", filter.empcode ?? "");
            dynamicParameters.Add("@empcodemanual", filter.empcodemanual ?? "");
            dynamicParameters.Add("@empname", filter.empname ?? "");
            dynamicParameters.Add("@xmlDoc", combinedXml ?? "");
            dynamicParameters.Add("@fk_designationid", filter.selectedDesignation ?? "");
            dynamicParameters.Add("@fk_nature", filter.selectedNature ?? "");
            dynamicParameters.Add("@fk_cityid", filter.selectedCity ?? "");
            dynamicParameters.Add("@shortby", filter.sortBy ?? "empcode");
            dynamicParameters.Add("@fk_monthId", filter.fk_monthId ?? "");
            dynamicParameters.Add("@fk_yearId", filter.fk_yearId ?? "");

            var result = DataBaseFactory.QuerySP<ManualIncomeTaxMst>(
                "SAL_Employee_ManualITax_SelForGrid",
                dynamicParameters
            );

            return result; // No need to call .ToList()
        }


//     public async Task<bool> UpdateManualIncomeTaxAsync(ManualIncomeTaxMst manualTax)
//{
//    DynamicParameters dynamicParameters = new DynamicParameters();

//    dynamicParameters.Add("@pk_salid", (object)manualTax.pk_salid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
//    dynamicParameters.Add("@itax", (object)manualTax.IT, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
//    dynamicParameters.Add("@surcharge", (object)manualTax.CsurCharge, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
//    dynamicParameters.Add("@cesscharge", (object)manualTax.ECessCharge, new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
//    dynamicParameters.Add("@fk_locid", (object)manualTax.fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
//    dynamicParameters.Add("@fk_userID", (object)"1", new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?()); // Static user ID for now

//    int n = DataBaseFactory.QuerySP("SAL_Manual_ITax_Upd", dynamicParameters, "Manual_ITax_Update");

//    return n > 0; // Return true if rows were affected
//}


        public async Task<bool> UpdateManualIncomeTaxAsync(List<ManualIncomeTaxMst> manualTaxList, string fk_locid, string fk_userID)
        {
            if (manualTaxList == null || !manualTaxList.Any())
                return false;

            string pk_salid = string.Join("~", manualTaxList.Select(x => x.pk_salid));
            string itax = string.Join("~", manualTaxList.Select(x => x.IT));
            string surcharge = string.Join("~", manualTaxList.Select(x => x.CsurCharge));
            string cesscharge = string.Join("~", manualTaxList.Select(x => x.ECessCharge));

            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_salid", (object)pk_salid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@itax", (object)itax, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@surcharge", (object)surcharge, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@cesscharge", (object)cesscharge, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_locid", (object)fk_locid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_userID", (object)fk_userID, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("SAL_Manual_ITax_Upd", dynamicParameters, "Manual_ITax_Update");

            return n > 0;
        }








    }
}
