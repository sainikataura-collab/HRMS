using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IEmployeeRentDetailRepository
    {
        //for get all
        public Task<(int totalCount, IEnumerable<EmployeeRentMst>)> GetAll(string fk_empid);

        //get by id
        Task<EmployeeRentDetailResult> GetById(string fk_empid, string fk_finid);
        //insert 

        //insert 
        Task<bool> Insert(EmployeeRentDetailDataSet dataMst, string fk_locId, string fk_userId);

        //update

        Task<bool> Update(int pk_rentId, EmployeeRentDetailDataSet dataMst, string fk_locId, string fk_userId);


        //get by id
        Task<EmployeeRentDetailResult> delete(string fk_empid, string fk_finid);


        //for dropdown

        public Task<Result<List<NameValue>>> GetMonthDropdownList(string EmpId, string companyId, string userId);

        Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
        GetAutoIncentiveprocessAsync(
        int pageIndex1, int pageSize1,
        int pageIndex2, int pageSize2,
        int pageIndex3, int pageSize3,
        string empCode,
        string empCodeManual,
        string empName,
        List<string> selectedDepartments,
        string selectedDesignation,
        List<string> selectedLocations,
        string selectedNature,
        string selectedCity,
        string sortBy,
        string FkMonthId,
        string FkYearId,
        string fk_costcentreid,
        string EmpStatus,
        DateTime? fromDate,
DateTime? toDate

        );

        Task<bool> InsertAutoIncentiveProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> DeleteIncentiveProcessAsync(AutoSalaryProcessPostModel dataMst);



        Task<(int notMarkedCount, int markedCount, int lockedCount, EmployeeAttendanceModel result)>
       GetEmployeeAttendanceAsync(
    int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string FkMonthId,
string FkYearId,
 string fk_costcentreid
);

        Task<bool> InsertEmployeeAttendanceAsync(EmpAttendancePostModel dataMst, string fk_locId, string fk_userId, string fk_companyId, string fk_finid);
        Task<bool> DeleteEmployeeAttendanceAsync(EmpAttendancePostModel dataMst);



        //auto salary processs
        Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
     GetAutosalaryprocessAsync(
     int pageIndex1, int pageSize1,
     int pageIndex2, int pageSize2,
     int pageIndex3, int pageSize3,
     string empCode,
     string empCodeManual,
     string empName,
     List<string> selectedDepartments,
     string selectedDesignation,
     List<string> selectedLocations,
     string selectedNature,
     string selectedCity,
     string sortBy,
     string FkMonthId,
     string FkYearId,
     string fk_costcentreid


     );

        Task<bool> InsertAutoSalaryProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> DeleteSalaryProcessAsync(AutoSalaryProcessPostModel dataMst);



        //Arrear processs
        Task<(int ArrearUnProcessedCount, int ArrearProcessedCount, arrearProcessModel result)>
      GetArrearprocessAsync(
      int pageIndex1, int pageSize1,
      int pageIndex2, int pageSize2,
      string empCode,
      string empCodeManual,
      string empName,
      List<string> selectedDepartments,
      string selectedDesignation,
      List<string> selectedLocations,
      string selectedNature,
      string selectedCity,
      string sortBy,
      string FkMonthId,
      string FkYearId, string Type);
        Task<bool> InsertArrearProcessAsync(ArrearProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> ArrearUnProcessAsync(ArrearProcessPostModel dataMst);



        //ITProcess

        Task<(int UnprocessedCount, int ProcessedCount, int LockedCount, ITProcessModel result)>
   GetITProcessedDataAsync(
   int pageIndex1, int pageSize1,
   int pageIndex2, int pageSize2,
   int pageIndex3, int pageSize3,
   string empCode,
   string empCodeManual,
   string empName,
   List<string> selectedDepartments,
   string selectedDesignation,
   List<string> selectedLocations,
   string selectedNature,
   string selectedCity,
   string sortBy,
   string FkMonthId,
   string FkYearId);


        Task<bool> InsertITProcessAsync(ITProcessePostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> ITUnProcessAsync(ITProcessePostModel dataMst);


        //lock Income Tax
        Task<(int ITNotLockedCount, int ITLockedCount, int ITLocked_ITNotProcessed, LockITModel result)>
GetLockITAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string FkMonthId,
string FkYearId);

        Task<bool> InsertITLockAsync(ITProcessePostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> ITLockAsync(ITProcessePostModel dataMst);



        // Attendance InOut SHift

        Task<(int totalCount, IEnumerable<dynamic>, string)> AttendanceDetailsinoutForAll(
       int pageindex,
       int pagesize,
      string empCode,
      string empCodeManual,
      string empName,
      List<string> selectedDepartments,
      string selectedDesignation,
      List<string> selectedLocations,
      string selectedNature,
      string selectedCity,
      string sortBy,
      string FkMonthId,
      string FkYearId,
      string fk_costcentreid



      );

        //Task<bool> UpdateAttendanceAsync(AttendanceUpdateModel model);
        Task<Result> UpdateAttendanceAsync(AttendanceUpdateModel model, string fk_finid, string userId);
        Task<IEnumerable<ShiftTimeModel>> ShiftMstGetByNameAsync(long pk_shiftId);
        Task<IEnumerable<AttendanceStatusDDLModel>> GetAttendanceStatusForDDLAsync(string empId = null);

        Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
                GetAutobonusprocessAsync(
                int pageIndex1, int pageSize1,
                int pageIndex2, int pageSize2,
                int pageIndex3, int pageSize3,
                string empCode,
                string empCodeManual,
                string empName,
                List<string> selectedDepartments,
                string selectedDesignation,
                List<string> selectedLocations,
                string selectedNature,
                string selectedCity,
                string sortBy,
                string FkMonthId,
                string FkYearId,
                string fk_costcentreid,
                    DateTime? fromDate,
                    DateTime? toDate,
                    string EmpStatus
                );

        Task<bool> InsertAutoBonusProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> DeleteBonusProcessAsync(AutoSalaryProcessPostModel dataMst);

        //Reim
        Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
GetAutosalaryprocessReimAsync(
int pageIndex1, int pageSize1,
int pageIndex2, int pageSize2,
int pageIndex3, int pageSize3,
string empCode,
string empCodeManual,
string empName,
List<string> selectedDepartments,
string selectedDesignation,
List<string> selectedLocations,
string selectedNature,
string selectedCity,
string sortBy,
string FkMonthId,
string FkYearId,
string fk_costcentreid);
        Task<bool> InsertAutoSalaryProcessReimAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> DeleteSalaryProcessReimAsync(AutoSalaryProcessPostModel dataMst);

        Task<(int notMarkedCount, int markedCount, int lockedCount, autosalaryprocessModel result)>
        GetAutoLTAprocessAsync(
        int pageIndex1, int pageSize1,
        int pageIndex2, int pageSize2,
        int pageIndex3, int pageSize3,
        string empCode,
        string empCodeManual,
        string empName,
        List<string> selectedDepartments,
        string selectedDesignation,
        List<string> selectedLocations,
        string selectedNature,
        string selectedCity,
        string sortBy,
        string FkMonthId,
        string FkYearId,
        string fk_costcentreid,
            DateTime? fromDate,
            DateTime? toDate,
            string EmpStatus
        );

        Task<bool> InsertAutoLTAProcessAsync(AutoSalaryProcessPostModel dataMst, string fk_locId, string fk_userId, string fk_finid);
        Task<bool> DeleteLTAProcessAsync(AutoSalaryProcessPostModel dataMst);


    }
}