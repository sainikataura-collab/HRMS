using System.Data;

namespace HRMSWebAPI.Helper
{
   
    public class CommonFunction
    {
        public string GetRecords(List<string> selectedLocations, List<string> selectedDepartments)
        {
            DataSet ds = new DataSet();
            DataSet LocationList = new DataSet();
            DataSet DepartmentList = new DataSet();

            LocationList.Tables.Add("LocationList");
            LocationList.Tables[0].Columns.Add("fk_locid");
            foreach (var item in selectedLocations)
            {
                DataRow dr = LocationList.Tables[0].NewRow();
                dr["fk_locid"] = item.ToString().Trim();
                LocationList.Tables[0].Rows.Add(dr);
            }

            DepartmentList.Tables.Add("DepartmentList");
            DepartmentList.Tables[0].Columns.Add("fk_deptid");

            foreach (var item in selectedDepartments)
            {
                DataRow dr = DepartmentList.Tables[0].NewRow();
                dr["fk_deptid"] = item.ToString().Trim();
                DepartmentList.Tables[0].Rows.Add(dr);
            }
            ds = LocationList;
            ds.Merge(DepartmentList);
            LocationList = null;
            DepartmentList = null;

            return ds.GetXml();
        }
    }
}
