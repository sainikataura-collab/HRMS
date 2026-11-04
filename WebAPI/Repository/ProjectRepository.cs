using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class ProjectRepository : IProjectRepository
    {
        public async Task<bool> InsertProjectMstAsync(ProjectMst projectMst, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@Projectcode", (object)projectMst.Projectcode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Projectname", (object)projectMst.Projectname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)projectMst.active, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Project_Mst_Ins", dynamicParameters, "ProjectMst_Insert");
            return n > 0;
        }

        public async Task<(int totalCount, IEnumerable<ProjectMst>)> GetAllProjectsAsync(int pageIndex, int pageSize, string fk_companyId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", (object)pageIndex, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@pagesize", (object)pageSize, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@fk_companyId", (object)fk_companyId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?());

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, ProjectMst>("REC_Project_Mst_SelForGrid", dynamicParameters, "ProjectMst_GetAll");
            if (tuple == null || tuple.Item2 == null) return (0, []);

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
                             ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<ProjectMst> GetProjectByIdAsync(long pk_ProjectId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ProjectId", (object)pk_ProjectId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            return DataBaseFactory.QuerySP<ProjectMst>("REC_Project_Mst_Edit", (object)dynamicParameters, "Project Master - GetById").FirstOrDefault<ProjectMst>();
        }

        public async Task<bool> UpdateProjectMstAsync(ProjectMst projectMst)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_ProjectId", (object)projectMst.pk_ProjectId, new DbType?(DbType.Int64), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Projectcode", (object)projectMst.Projectcode, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@Projectname", (object)projectMst.Projectname, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());
            dynamicParameters.Add("@active", (object)projectMst.active, new DbType?(DbType.Boolean), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            // Execute stored procedure for update
            int n = DataBaseFactory.QuerySP("REC_Project_Mst_Upd", dynamicParameters, "Project_Mst_Update");

            return n > 0; // Return true if rows were affected
        }

        public async Task<bool> DeleteProjectMstAsync(long projectId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("pk_ProjectId", (object)projectId, new DbType?(DbType.String), new ParameterDirection?(), new int?(), new byte?(), new byte?());

            int n = DataBaseFactory.QuerySP("REC_Project_Mst_Del", dynamicParameters, "Project_Mst_Delete");

            return n > 0; // Return true if rows were affected
        }





    }
}
