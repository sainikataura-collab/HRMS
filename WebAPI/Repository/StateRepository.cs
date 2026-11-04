using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;
using System.Linq;
namespace HRMSWebAPI.Repository
{
    public class StateRepository : IStateRepository
    {
        public async Task<bool> InsertStateAsync(StateMst state)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@description", (object)state.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lwf_applicable", (object)state.lwf_applicable, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pt_applicable", (object)state.pt_applicable, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)state.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pt_number", (object)state.pt_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lwf_number", (object)state.lwf_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esi_number", (object)state.esi_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pf_number", (object)state.pf_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@minimum_wages", (object)(state.minimum_wages ?? 0), new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@is_minimum_wages", (object)(state.is_minimum_wages ?? false), new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_catid", (object)state.fk_catid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            string? headsJson = (state.earning_heads != null && state.earning_heads.Count > 0)
                ? System.Text.Json.JsonSerializer.Serialize(state.earning_heads)
                : null;
            dynamicParameters.Add("@heads_json", (object)headsJson, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            string? categoriesJson = (state.category_minimum_wages != null && state.category_minimum_wages.Count > 0)
                ? System.Text.Json.JsonSerializer.Serialize(state.category_minimum_wages)
                : null;
            dynamicParameters.Add("@categories_json", (object)categoriesJson, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int result = DataBaseFactory.QuerySP("SAL_State_Mst_Ins", dynamicParameters, "State_Insert");
            return result > 0 || result == -1;
        }


        public async Task<(int totalCount, IEnumerable<StateMst>)> GetAll(int pageIndex, int pageSize,string fk_companyId, string searchTerm = "")
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.Int32), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@SearchTerm", searchTerm ?? "", DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, StateMst>("SAL_State_Mst_SelForGrid", dynamicParameters, "State_GetAll");


            if (tuple == null || tuple.Item2 == null) return (0, []);
            //Convert Total Count
            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;
            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<StateMst> GetStateByIdAsync(string stateId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_state_id", (object)stateId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            
            var tuple = DataBaseFactory.QueryMultipleSP<StateMst, StateCategoryMinWageModel, StateCategoryMinWageHeadDbModel>("SAL_State_Mst_Edit", (object)dynamicParameters, "State Master - GetById");
            if (tuple != null && tuple.Item1 != null)
            {
                var state = tuple.Item1.FirstOrDefault();
                if (state != null)
                {
                    var categories = tuple.Item2?.ToList() ?? new List<StateCategoryMinWageModel>();
                    var allHeads = tuple.Item3?.ToList() ?? new List<StateCategoryMinWageHeadDbModel>();

                    foreach (var cat in categories)
                    {
                        cat.earning_heads = allHeads
                            .Where(h => h.fk_state_cat_min_wage_id == cat.pk_state_cat_min_wage_id)
                            .Select(h => new StateEarningHeadMst
                            {
                                pk_headid = h.fk_headid,
                                description = h.description,
                                shortdesc = h.shortdesc,
                                amount = h.amount
                            }).ToList();
                    }

                    state.category_minimum_wages = categories;

                    if (categories.Count > 0)
                    {
                        state.fk_catid = categories[0].fk_catid;
                        state.minimum_wages = categories[0].minimum_wages;
                        state.earning_heads = categories[0].earning_heads;
                    }
                    else
                    {
                        state.earning_heads = new List<StateEarningHeadMst>();
                    }

                    return state;
                }
            }
            return new StateMst();
        }

        public async Task<bool> UpdateStateAsync(StateMst state)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            dynamicParameters.Add("@pk_state_id", (object)state.pk_stateid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@description", (object)state.description, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lwf_applicable", (object)state.lwf_applicable, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pt_applicable", (object)state.pt_applicable, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)state.fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pt_number", (object)state.pt_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@lwf_number", (object)state.lwf_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@esi_number", (object)state.esi_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pf_number", (object)state.pf_number, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@minimum_wages", (object)(state.minimum_wages ?? 0), new DbType?(DbType.Decimal), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@is_minimum_wages", (object)(state.is_minimum_wages ?? false), new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_catid", (object)state.fk_catid, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            string? headsJson = (state.earning_heads != null && state.earning_heads.Count > 0)
                ? System.Text.Json.JsonSerializer.Serialize(state.earning_heads)
                : null;
            dynamicParameters.Add("@heads_json", (object)headsJson, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            string? categoriesJson = (state.category_minimum_wages != null && state.category_minimum_wages.Count > 0)
                ? System.Text.Json.JsonSerializer.Serialize(state.category_minimum_wages)
                : null;
            dynamicParameters.Add("@categories_json", (object)categoriesJson, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("SAL_State_Mst_Upd", dynamicParameters, "State_Mst_Update");
            return n > 0 || n == -1; // Return true if rows were affected or successful
        }

        public async Task<bool> DeleteStateMstAsync(string stateId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_state_id", (object)stateId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            int n = DataBaseFactory.QuerySP("SAL_State_Mst_Del", dynamicParameters, "State_Mst_Delete");
            return n > 0; // Return true if rows were affected
        }

        public async Task<IEnumerable<HeadMst>> GetEarningHeadsAsync(string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            var result = DataBaseFactory.QuerySP<HeadMst>("SAL_Head_Mst_GetEarningHeads", (object)dynamicParameters, "State Master - GetEarningHeads");
            return result?.ToList() ?? new List<HeadMst>();
        }

    }
}
