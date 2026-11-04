
using Dapper;
using System.Collections;
using System.Collections.Concurrent;

using System.Collections.ObjectModel;

using System.Data;
using System.Data.Common;
using System.Data.SqlClient;

using System.Reflection;


namespace HRMSWebAPI.Helper
{
    public static class DataBaseFactory
    {
        public static Func<DbConnection> ConnString { get; private set; }

        // Method to initialize the connection string
        public static void Initialize(IConfiguration configuration)
        {
            // Set the ConnString Func to create a new SqlConnection using the connection string from configuration
            ConnString = () =>
            {
                return new SqlConnection(configuration.GetConnectionString("WebApplication1DBConnection"));
            };
        }
        public static int ConnectionTimeout
        {
            get;
            set;
        } = 600; // 10 minutes default

        private static IHttpContextAccessor _httpContextAccessor;

        public static void Initialize(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public static void RedirectToErrorPage(int num)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                httpContext.Response.Redirect($"~/Home/Error/{num}", true);
            }
        }
        
        public static IEnumerable<T> Cast<T>(this DataTable table, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            IEnumerable<T> enumerable = DataBaseFactory.ToEnumerable<T>(table, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue);
            return enumerable;
        }

        public static IEnumerable<T> Cast<T>(this DataTable table, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            return DataBaseFactory.ToEnumerable<T>(table, instanceHandler, getValue);
        }

        public static IEnumerable<T> Cast<T>(this DataView view, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            IEnumerable<T> enumerable = DataBaseFactory.ToEnumerable<T>(view, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue);
            return enumerable;
        }

        public static IEnumerable<T> Cast<T>(this DataView view, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            return DataBaseFactory.ToEnumerable<T>(view, instanceHandler, getValue);
        }

        public static int GetTimeout(int? commandTimeout = null)
        {
            return (!commandTimeout.HasValue ? DataBaseFactory.ConnectionTimeout : commandTimeout.Value);
        }

        private static IEnumerable[] QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(int readCount, string sql, object param = null, string module = null)
        {
            IEnumerable[] enumerableArray;
            DbConnection connString = DataBaseFactory.ConnString();
            try
            {
                connString.Open();
                try
                {
                    //int? nullable = null;
                    int? nullable = ConnectionTimeout;
                    SqlMapper.GridReader gridReader = connString.QueryMultiple(sql, param, null, nullable, new CommandType?(CommandType.StoredProcedure));
                    IEnumerable[] enumerableArray1 = new IEnumerable[readCount];
                    if ((readCount < 1 ? false : !gridReader.IsConsumed))
                    {
                        enumerableArray1[0] = gridReader.Read<T1>(true);
                        if ((readCount < 2 ? false : !gridReader.IsConsumed))
                        {
                            enumerableArray1[1] = gridReader.Read<T2>(true);
                            if ((readCount < 3 ? false : !gridReader.IsConsumed))
                            {
                                enumerableArray1[2] = gridReader.Read<T3>(true);
                                if ((readCount < 4 ? false : !gridReader.IsConsumed))
                                {
                                    enumerableArray1[3] = gridReader.Read<T4>(true);
                                    if ((readCount < 5 ? false : !gridReader.IsConsumed))
                                    {
                                        enumerableArray1[4] = gridReader.Read<T5>(true);
                                        if ((readCount < 6 ? false : !gridReader.IsConsumed))
                                        {
                                            enumerableArray1[5] = gridReader.Read<T6>(true);
                                            if ((readCount < 7 ? false : !gridReader.IsConsumed))
                                            {
                                                enumerableArray1[6] = gridReader.Read<T7>(true);
                                                if ((readCount < 8 ? false : !gridReader.IsConsumed))
                                                {
                                                    enumerableArray1[7] = gridReader.Read<T8>(true);
                                                    if ((readCount < 9 ? false : !gridReader.IsConsumed))
                                                    {
                                                        enumerableArray1[8] = gridReader.Read<T9>(true);
                                                        if ((readCount < 10 ? false : !gridReader.IsConsumed))
                                                        {
                                                            enumerableArray1[9] = gridReader.Read<T10>(true);
                                                            if ((readCount < 11 ? false : !gridReader.IsConsumed))
                                                            {
                                                                enumerableArray1[10] = gridReader.Read<T11>(true);
                                                                if ((readCount < 12 ? false : !gridReader.IsConsumed))
                                                                {
                                                                    enumerableArray1[11] = gridReader.Read<T12>(true);
                                                                    if ((readCount < 13 ? false : !gridReader.IsConsumed))
                                                                    {
                                                                        enumerableArray1[12] = gridReader.Read<T13>(true);
                                                                        if ((readCount < 14 ? false : !gridReader.IsConsumed))
                                                                        {
                                                                            enumerableArray1[13] = gridReader.Read<T14>(true);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    enumerableArray = enumerableArray1;
                }
                catch (Exception exception)
                {
                   // int num = ExceptionUtility.LogException(exception, module, SessionUtility.LoginUserId);
                   // DataBaseFactory.RedirectToErrorPage(num);                 
                   // HttpContext.Current.Response.Redirect(string.Concat("~/Home/Error/", num), true);
                    throw;
                }
            }
            finally
            {
                if (connString != null)
                {
                    ((IDisposable)connString).Dispose();
                }
            }
            return enumerableArray;
        }

        public static IEnumerable<IEnumerable<object>> QueryMultipleSP(string storedProcedure, object param = null, string module = null)
        {
            IEnumerable<IEnumerable<object>> enumerables;
            DbConnection connString = DataBaseFactory.ConnString();
            try
            {
                connString.Open();
                DbTransaction dbTransaction = connString.BeginTransaction();
                try
                {
                    try
                    {
                        //int? nullable = null;
                        int? nullable = ConnectionTimeout;
                        SqlMapper.GridReader gridReader = connString.QueryMultiple(storedProcedure, param, dbTransaction, nullable, new CommandType?(CommandType.StoredProcedure));
                        List<IEnumerable<object>> enumerables1 = new List<IEnumerable<object>>();
                        while (!gridReader.IsConsumed)
                        {
                            enumerables1.Add(gridReader.Read(true));
                        }
                        dbTransaction.Commit();
                        enumerables = enumerables1;
                    }
                    catch (Exception exception1)
                    {
                        Exception exception = exception1;
                        dbTransaction.Rollback();
                        //int num = ExceptionUtility.LogException(exception, module, SessionUtility.LoginUserId);
                       // DataBaseFactory.RedirectToErrorPage(num);
                        //HttpContext.Current.Response.Redirect(string.Concat("~/Home/Error/", num), true);
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        ((IDisposable)dbTransaction).Dispose();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    ((IDisposable)connString).Dispose();
                }
            }
            return enumerables;
        }

        public static IEnumerable<IEnumerable<T>> QueryMultipleSP<T>(string storedProcedure, object param = null, string module = null)
        {
            IEnumerable<IEnumerable<T>> enumerables;
            DbConnection connString = DataBaseFactory.ConnString();
            try
            {
                connString.Open();
                DbTransaction dbTransaction = connString.BeginTransaction();
                try
                {
                    try
                    {
                        //int? nullable = null;
                        int? nullable = ConnectionTimeout;
                        SqlMapper.GridReader gridReader = connString.QueryMultiple(storedProcedure, param, dbTransaction, nullable, new CommandType?(CommandType.StoredProcedure));
                        List<IEnumerable<T>> enumerables1 = new List<IEnumerable<T>>();
                        while (!gridReader.IsConsumed)
                        {
                            enumerables1.Add(gridReader.Read<T>(true));
                        }
                        dbTransaction.Commit();
                        enumerables = enumerables1;
                    }
                    catch (Exception exception1)
                    {
                        Exception exception = exception1;
                        dbTransaction.Rollback();
                        //int num = ExceptionUtility.LogException(exception, module, SessionUtility.LoginUserId);
                        //DataBaseFactory.RedirectToErrorPage(num);
                        //HttpContext.Current.Response.Redirect(string.Concat("~/Home/Error/", num), true);
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        ((IDisposable)dbTransaction).Dispose();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    ((IDisposable)connString).Dispose();
                }
            }
            return enumerables;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>> QueryMultipleSP<T1, T2>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, object, object, object, object, object, object, object, object, object, object, object, object>(2, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>> QueryMultipleSP<T1, T2, T3>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, object, object, object, object, object, object, object, object, object, object, object>(3, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>> QueryMultipleSP<T1, T2, T3, T4>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, object, object, object, object, object, object, object, object, object, object>(4, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>> QueryMultipleSP<T1, T2, T3, T4, T5>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, object, object, object, object, object, object, object, object, object>(5, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>> QueryMultipleSP<T1, T2, T3, T4, T5, T6>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, object, object, object, object, object, object, object, object>(6, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, object, object, object, object, object, object, object>(7, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, object, object, object, object, object, object>(8, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>>((IEnumerable<T8>)enumerableArray[7]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, object, object, object, object, object>(9, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, object, object, object, object>(10, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, object, object, object>(11, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, object, object>(12, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, object>(13, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11], (IEnumerable<T13>)enumerableArray[12]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>> QueryMultipleSP<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(string storedProcedure, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(14, storedProcedure, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11], (IEnumerable<T13>)enumerableArray[12], (IEnumerable<T14>)enumerableArray[13]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>> QueryMultipleSQL<T1, T2>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, object, object, object, object, object, object, object, object, object, object, object, object>(2, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>> QueryMultipleSQL<T1, T2, T3>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, object, object, object, object, object, object, object, object, object, object, object>(3, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>> QueryMultipleSQL<T1, T2, T3, T4>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, object, object, object, object, object, object, object, object, object, object>(4, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>> QueryMultipleSQL<T1, T2, T3, T4, T5>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, object, object, object, object, object, object, object, object, object>(5, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, object, object, object, object, object, object, object, object>(6, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, object, object, object, object, object, object, object>(7, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6]);
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, object, object, object, object, object, object>(8, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>>((IEnumerable<T8>)enumerableArray[7]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, object, object, object, object, object>(9, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, object, object, object, object>(10, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, object, object, object>(11, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, object, object>(12, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, object>(13, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11], (IEnumerable<T13>)enumerableArray[12]));
            return tuple;
        }

        public static Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>> QueryMultipleSQL<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(string sql, dynamic param = null, string module = null)
        {
            IEnumerable[] enumerableArray = (IEnumerable[])DataBaseFactory.QueryMultiple<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(14, sql, param, module);
            Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>> tuple = new Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>>((IEnumerable<T1>)enumerableArray[0], (IEnumerable<T2>)enumerableArray[1], (IEnumerable<T3>)enumerableArray[2], (IEnumerable<T4>)enumerableArray[3], (IEnumerable<T5>)enumerableArray[4], (IEnumerable<T6>)enumerableArray[5], (IEnumerable<T7>)enumerableArray[6], new Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>((IEnumerable<T8>)enumerableArray[7], (IEnumerable<T9>)enumerableArray[8], (IEnumerable<T10>)enumerableArray[9], (IEnumerable<T11>)enumerableArray[10], (IEnumerable<T12>)enumerableArray[11], (IEnumerable<T13>)enumerableArray[12], (IEnumerable<T14>)enumerableArray[13]));
            return tuple;
        }

        public static IEnumerable<T> QuerySP<T>(string storedProcedure, object param = null, string module = null)
        where T : class
        {
            IEnumerable<T> ts;
            DbConnection connString = DataBaseFactory.ConnString();
            try
            {
                connString.Open();
                DbTransaction dbTransaction = connString.BeginTransaction();
                try
                {
                    try
                    {
                        //int? nullable = null;
                        int? nullable = ConnectionTimeout;
                        IEnumerable<T> ts1 = connString.Query<T>(storedProcedure, param, dbTransaction, true, nullable, new CommandType?(CommandType.StoredProcedure));
                        dbTransaction.Commit();
                        ts = ts1;
                    }
                    catch (Exception exception1)
                    {
                        Exception exception = exception1;
                        dbTransaction.Rollback();
                       // int num = ExceptionUtility.LogException(exception, module, SessionUtility.LoginUserId);
                       // DataBaseFactory.RedirectToErrorPage(num);
                        // HttpContext.Current.Response.Redirect(string.Concat("~/Home/Error/", num), true);
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        ((IDisposable)dbTransaction).Dispose();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    ((IDisposable)connString).Dispose();
                }
            }
            return ts;
        }

        public static async Task<IEnumerable<T>> QuerySPAsync<T>(string storedProcedure, object param = null, string module = null)
    where T : class
        {
            IEnumerable<T> ts;
            DbConnection connString = DataBaseFactory.ConnString();

            try
            {
                await connString.OpenAsync();
                DbTransaction dbTransaction = connString.BeginTransaction();

                try
                {
                    try
                    {
                        //int? commandTimeout = null;
                        int? commandTimeout = ConnectionTimeout;
                        ts = await connString.QueryAsync<T>(storedProcedure, param, dbTransaction, commandTimeout, CommandType.StoredProcedure);
                        dbTransaction.Commit();
                    }
                    catch (Exception exception)
                    {
                        dbTransaction.Rollback();
                        // Log the exception (e.g., ExceptionUtility.LogException) and redirect to an error page if needed
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        await dbTransaction.DisposeAsync();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    await connString.DisposeAsync();
                }
            }

            return ts;
        }


        public static int QuerySP(string storedProcedure, object param = null, string module = null)
        {
            int num;
            DbConnection connString = DataBaseFactory.ConnString();
            try
            {
                connString.Open();
                DbTransaction dbTransaction = connString.BeginTransaction();
                try
                {
                    try
                    {
                        //int? nullable = null;
                        int? nullable = ConnectionTimeout;
                        int num1 = connString.Execute(storedProcedure, param, dbTransaction, nullable, new CommandType?(CommandType.StoredProcedure));
                        dbTransaction.Commit();
                        num = num1;
                    }
                    catch (Exception exception1)
                    {
                        Exception exception = exception1;
                        dbTransaction.Rollback();
                        //int num2 = ExceptionUtility.LogException(exception, module, SessionUtility.LoginUserId);
                        //DataBaseFactory.RedirectToErrorPage(num2);
                        //HttpContext.Current.Response.Redirect(string.Concat("~/Home/Error/", num2), true);
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        ((IDisposable)dbTransaction).Dispose();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    ((IDisposable)connString).Dispose();
                }
            }
            return num;
        }

        public static async Task<int> QuerySPAsync(string storedProcedure, object param = null, string module = null)
        {
            int num;
            DbConnection connString = DataBaseFactory.ConnString();

            try
            {
                await connString.OpenAsync();
                DbTransaction dbTransaction = connString.BeginTransaction();

                try
                {
                    try
                    {
                        //int? commandTimeout = null;
                        int? commandTimeout = ConnectionTimeout;
                        num = await connString.ExecuteAsync(storedProcedure, param, dbTransaction, commandTimeout, CommandType.StoredProcedure);
                        dbTransaction.Commit();
                    }
                    catch (Exception exception)
                    {
                        dbTransaction.Rollback();
                        // Log the exception and redirect to an error page if needed
                        throw;
                    }
                }
                finally
                {
                    if (dbTransaction != null)
                    {
                        await dbTransaction.DisposeAsync();
                    }
                }
            }
            finally
            {
                if (connString != null)
                {
                    await connString.DisposeAsync();
                }
            }

            return num;
        }


        public static void SetOrdinal(this DataTable table, params string[] columnNames)
        {
            if ((table == null || columnNames == null ? false : (int)columnNames.Length != 0))
            {
                int num = 0;
                string[] strArrays = columnNames;
                for (int i = 0; i < (int)strArrays.Length; i++)
                {
                    string str = strArrays[i];
                    int num1 = num;
                    num = num1 + 1;
                    table.Columns[str].SetOrdinal(num1);
                }
            }
        }

        public static T[] ToArray<T>(this DataTable table, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            T[] enumerable = DataBaseFactory.ToEnumerable<T>(table, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue);
            return enumerable;
        }


        public static T[] ToArray<T>(this DataTable table, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            return DataBaseFactory.ToEnumerable<T>(table, instanceHandler, getValue);
        }

        public static T[] ToArray<T>(this DataView view, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            T[] enumerable = DataBaseFactory.ToEnumerable<T>(view, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue);
            return enumerable;
        }

        public static T[] ToArray<T>(this DataView view, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            return DataBaseFactory.ToEnumerable<T>(view, instanceHandler, getValue);
        }

        public static DataSet ToDataSet(this IEnumerable<IEnumerable<dynamic>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                int num = 0;
                foreach (IEnumerable<object> instance in instances)
                {
                    if (instance != null)
                    {
                        DataTableCollection tables = dataSet.Tables;
                        IEnumerable<object> objs = instance;
                        if (typeNames == null || (int)typeNames.Length <= num)
                        {
                            str = null;
                        }
                        else
                        {
                            str = typeNames[num];
                        }
                        tables.Add(objs.ToDataTable<object>(str, memberTypes, null));
                    }
                    num++;
                }
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T>(this IEnumerable<IEnumerable<T>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                int num = 0;
                foreach (IEnumerable<T> instance in instances)
                {
                    DataTableCollection tables = dataSet.Tables;
                    IEnumerable<T> ts = instance;
                    Type type = typeof(T);
                    if (typeNames == null || (int)typeNames.Length <= num)
                    {
                        str = null;
                    }
                    else
                    {
                        str = typeNames[num];
                    }
                    tables.Add(DataBaseFactory.ToDataTable(ts, type, str, memberTypes, null));
                    num++;
                }
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2>(this Tuple<IEnumerable<T1>, IEnumerable<T2>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            string str9;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                DataTableCollection dataTableCollection4 = dataSet.Tables;
                IEnumerable<T10> t10s = instances.Rest.Item3;
                Type type9 = typeof(T10);
                if (typeNames == null || (int)typeNames.Length <= 9)
                {
                    str9 = null;
                }
                else
                {
                    str9 = typeNames[9];
                }
                dataTableCollection4.Add(DataBaseFactory.ToDataTable(t10s, type9, str9, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            string str9;
            string str10;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                DataTableCollection dataTableCollection4 = dataSet.Tables;
                IEnumerable<T10> t10s = instances.Rest.Item3;
                Type type9 = typeof(T10);
                if (typeNames == null || (int)typeNames.Length <= 9)
                {
                    str9 = null;
                }
                else
                {
                    str9 = typeNames[9];
                }
                dataTableCollection4.Add(DataBaseFactory.ToDataTable(t10s, type9, str9, memberTypes, null));
                DataTableCollection tables5 = dataSet.Tables;
                IEnumerable<T11> t11s = instances.Rest.Item4;
                Type type10 = typeof(T11);
                if (typeNames == null || (int)typeNames.Length <= 10)
                {
                    str10 = null;
                }
                else
                {
                    str10 = typeNames[10];
                }
                tables5.Add(DataBaseFactory.ToDataTable(t11s, type10, str10, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            string str9;
            string str10;
            string str11;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                DataTableCollection dataTableCollection4 = dataSet.Tables;
                IEnumerable<T10> t10s = instances.Rest.Item3;
                Type type9 = typeof(T10);
                if (typeNames == null || (int)typeNames.Length <= 9)
                {
                    str9 = null;
                }
                else
                {
                    str9 = typeNames[9];
                }
                dataTableCollection4.Add(DataBaseFactory.ToDataTable(t10s, type9, str9, memberTypes, null));
                DataTableCollection tables5 = dataSet.Tables;
                IEnumerable<T11> t11s = instances.Rest.Item4;
                Type type10 = typeof(T11);
                if (typeNames == null || (int)typeNames.Length <= 10)
                {
                    str10 = null;
                }
                else
                {
                    str10 = typeNames[10];
                }
                tables5.Add(DataBaseFactory.ToDataTable(t11s, type10, str10, memberTypes, null));
                DataTableCollection dataTableCollection5 = dataSet.Tables;
                IEnumerable<T12> t12s = instances.Rest.Item5;
                Type type11 = typeof(T12);
                if (typeNames == null || (int)typeNames.Length <= 11)
                {
                    str11 = null;
                }
                else
                {
                    str11 = typeNames[11];
                }
                dataTableCollection5.Add(DataBaseFactory.ToDataTable(t12s, type11, str11, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            string str9;
            string str10;
            string str11;
            string str12;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                DataTableCollection dataTableCollection4 = dataSet.Tables;
                IEnumerable<T10> t10s = instances.Rest.Item3;
                Type type9 = typeof(T10);
                if (typeNames == null || (int)typeNames.Length <= 9)
                {
                    str9 = null;
                }
                else
                {
                    str9 = typeNames[9];
                }
                dataTableCollection4.Add(DataBaseFactory.ToDataTable(t10s, type9, str9, memberTypes, null));
                DataTableCollection tables5 = dataSet.Tables;
                IEnumerable<T11> t11s = instances.Rest.Item4;
                Type type10 = typeof(T11);
                if (typeNames == null || (int)typeNames.Length <= 10)
                {
                    str10 = null;
                }
                else
                {
                    str10 = typeNames[10];
                }
                tables5.Add(DataBaseFactory.ToDataTable(t11s, type10, str10, memberTypes, null));
                DataTableCollection dataTableCollection5 = dataSet.Tables;
                IEnumerable<T12> t12s = instances.Rest.Item5;
                Type type11 = typeof(T12);
                if (typeNames == null || (int)typeNames.Length <= 11)
                {
                    str11 = null;
                }
                else
                {
                    str11 = typeNames[11];
                }
                dataTableCollection5.Add(DataBaseFactory.ToDataTable(t12s, type11, str11, memberTypes, null));
                DataTableCollection tables6 = dataSet.Tables;
                IEnumerable<T13> t13s = instances.Rest.Item6;
                Type type12 = typeof(T13);
                if (typeNames == null || (int)typeNames.Length <= 12)
                {
                    str12 = null;
                }
                else
                {
                    str12 = typeNames[12];
                }
                tables6.Add(DataBaseFactory.ToDataTable(t13s, type12, str12, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataSet ToDataSet<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14>(this Tuple<IEnumerable<T1>, IEnumerable<T2>, IEnumerable<T3>, IEnumerable<T4>, IEnumerable<T5>, IEnumerable<T6>, IEnumerable<T7>, Tuple<IEnumerable<T8>, IEnumerable<T9>, IEnumerable<T10>, IEnumerable<T11>, IEnumerable<T12>, IEnumerable<T13>, IEnumerable<T14>>> instances, string[] typeNames = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataSet dataSet = null)
        {
            DataSet dataSet1;
            string str;
            string str1;
            string str2;
            string str3;
            string str4;
            string str5;
            string str6;
            string str7;
            string str8;
            string str9;
            string str10;
            string str11;
            string str12;
            string str13;
            if (instances != null)
            {
                if (dataSet == null)
                {
                    dataSet = new DataSet();
                }
                DataTableCollection tables = dataSet.Tables;
                IEnumerable<T1> item1 = instances.Item1;
                Type type = typeof(T1);
                if (typeNames == null || (int)typeNames.Length <= 0)
                {
                    str = null;
                }
                else
                {
                    str = typeNames[0];
                }
                tables.Add(DataBaseFactory.ToDataTable(item1, type, str, memberTypes, null));
                DataTableCollection dataTableCollection = dataSet.Tables;
                IEnumerable<T2> item2 = instances.Item2;
                Type type1 = typeof(T2);
                if (typeNames == null || (int)typeNames.Length <= 1)
                {
                    str1 = null;
                }
                else
                {
                    str1 = typeNames[1];
                }
                dataTableCollection.Add(DataBaseFactory.ToDataTable(item2, type1, str1, memberTypes, null));
                DataTableCollection tables1 = dataSet.Tables;
                IEnumerable<T3> item3 = instances.Item3;
                Type type2 = typeof(T3);
                if (typeNames == null || (int)typeNames.Length <= 2)
                {
                    str2 = null;
                }
                else
                {
                    str2 = typeNames[2];
                }
                tables1.Add(DataBaseFactory.ToDataTable(item3, type2, str2, memberTypes, null));
                DataTableCollection dataTableCollection1 = dataSet.Tables;
                IEnumerable<T4> item4 = instances.Item4;
                Type type3 = typeof(T4);
                if (typeNames == null || (int)typeNames.Length <= 3)
                {
                    str3 = null;
                }
                else
                {
                    str3 = typeNames[3];
                }
                dataTableCollection1.Add(DataBaseFactory.ToDataTable(item4, type3, str3, memberTypes, null));
                DataTableCollection tables2 = dataSet.Tables;
                IEnumerable<T5> item5 = instances.Item5;
                Type type4 = typeof(T5);
                if (typeNames == null || (int)typeNames.Length <= 4)
                {
                    str4 = null;
                }
                else
                {
                    str4 = typeNames[4];
                }
                tables2.Add(DataBaseFactory.ToDataTable(item5, type4, str4, memberTypes, null));
                DataTableCollection dataTableCollection2 = dataSet.Tables;
                IEnumerable<T6> item6 = instances.Item6;
                Type type5 = typeof(T6);
                if (typeNames == null || (int)typeNames.Length <= 5)
                {
                    str5 = null;
                }
                else
                {
                    str5 = typeNames[5];
                }
                dataTableCollection2.Add(DataBaseFactory.ToDataTable(item6, type5, str5, memberTypes, null));
                DataTableCollection tables3 = dataSet.Tables;
                IEnumerable<T7> item7 = instances.Item7;
                Type type6 = typeof(T7);
                if (typeNames == null || (int)typeNames.Length <= 6)
                {
                    str6 = null;
                }
                else
                {
                    str6 = typeNames[6];
                }
                tables3.Add(DataBaseFactory.ToDataTable(item7, type6, str6, memberTypes, null));
                DataTableCollection dataTableCollection3 = dataSet.Tables;
                IEnumerable<T8> t8s = instances.Rest.Item1;
                Type type7 = typeof(T8);
                if (typeNames == null || (int)typeNames.Length <= 7)
                {
                    str7 = null;
                }
                else
                {
                    str7 = typeNames[7];
                }
                dataTableCollection3.Add(DataBaseFactory.ToDataTable(t8s, type7, str7, memberTypes, null));
                DataTableCollection tables4 = dataSet.Tables;
                IEnumerable<T9> t9s = instances.Rest.Item2;
                Type type8 = typeof(T9);
                if (typeNames == null || (int)typeNames.Length <= 8)
                {
                    str8 = null;
                }
                else
                {
                    str8 = typeNames[8];
                }
                tables4.Add(DataBaseFactory.ToDataTable(t9s, type8, str8, memberTypes, null));
                DataTableCollection dataTableCollection4 = dataSet.Tables;
                IEnumerable<T10> t10s = instances.Rest.Item3;
                Type type9 = typeof(T10);
                if (typeNames == null || (int)typeNames.Length <= 9)
                {
                    str9 = null;
                }
                else
                {
                    str9 = typeNames[9];
                }
                dataTableCollection4.Add(DataBaseFactory.ToDataTable(t10s, type9, str9, memberTypes, null));
                DataTableCollection tables5 = dataSet.Tables;
                IEnumerable<T11> t11s = instances.Rest.Item4;
                Type type10 = typeof(T11);
                if (typeNames == null || (int)typeNames.Length <= 10)
                {
                    str10 = null;
                }
                else
                {
                    str10 = typeNames[10];
                }
                tables5.Add(DataBaseFactory.ToDataTable(t11s, type10, str10, memberTypes, null));
                DataTableCollection dataTableCollection5 = dataSet.Tables;
                IEnumerable<T12> t12s = instances.Rest.Item5;
                Type type11 = typeof(T12);
                if (typeNames == null || (int)typeNames.Length <= 11)
                {
                    str11 = null;
                }
                else
                {
                    str11 = typeNames[11];
                }
                dataTableCollection5.Add(DataBaseFactory.ToDataTable(t12s, type11, str11, memberTypes, null));
                DataTableCollection tables6 = dataSet.Tables;
                IEnumerable<T13> t13s = instances.Rest.Item6;
                Type type12 = typeof(T13);
                if (typeNames == null || (int)typeNames.Length <= 12)
                {
                    str12 = null;
                }
                else
                {
                    str12 = typeNames[12];
                }
                tables6.Add(DataBaseFactory.ToDataTable(t13s, type12, str12, memberTypes, null));
                DataTableCollection dataTableCollection6 = dataSet.Tables;
                IEnumerable<T14> t14s = instances.Rest.Item7;
                Type type13 = typeof(T14);
                if (typeNames == null || (int)typeNames.Length <= 13)
                {
                    str13 = null;
                }
                else
                {
                    str13 = typeNames[13];
                }
                dataTableCollection6.Add(DataBaseFactory.ToDataTable(t14s, type13, str13, memberTypes, null));
                dataSet1 = dataSet;
            }
            else
            {
                dataSet1 = null;
            }
            return dataSet1;
        }

        public static DataTable ToDataTable(this Type type, string typeName = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property)
        {
            return DataBaseFactory.ToDataTable(null, type, typeName, memberTypes, null);
        }

        public static DataTable ToDataTable<T>(this IEnumerable<T> instances, string typeName = null, MemberTypes memberTypes = MemberTypes.Field | MemberTypes.Property, DataTable table = null)
        {
            return DataBaseFactory.ToDataTable(instances, typeof(T), typeName, memberTypes, table);
        }

        private static DataTable ToDataTable(IEnumerable instances, Type type, string typeName, MemberTypes memberTypes, DataTable table)
        {
            DataTable dataTable;
            //object value;
            //if (!(instances is IEnumerable<IDictionary<string, object>>))
            //{
            //    bool flag = (memberTypes & MemberTypes.Field) == MemberTypes.Field;
            //    bool flag1 = (memberTypes & MemberTypes.Property) == MemberTypes.Property;
            //    var collection =
            //        from c in (
            //            from f in type.GetFields(BindingFlags.Instance | BindingFlags.Public)
            //            where flag
            //            select new { ColumnName = f.Name, ColumnType = f.FieldType, IsField = true, MemberInfo = f }).Union(
            //            from p in type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            //            where flag1
            //            where p.CanRead
            //            where p.GetGetMethod(true).IsPublic
            //            where (int)p.GetIndexParameters().Length == 0
            //            select new { ColumnName = p.Name, ColumnType = p.PropertyType, IsField = false, MemberInfo = p })
            //        orderby c.MemberInfo.MetadataToken
            //        select c;
            //    if (table == null)
            //    {
            //        table = new DataTable();
            //        table.Columns.AddRange((
            //            from c in collection
            //            select new DataColumn(c.ColumnName, (!c.ColumnType.IsGenericType || !(c.ColumnType.GetGenericTypeDefinition() == typeof(Nullable<>)) ? c.ColumnType : c.ColumnType.GetGenericArguments()[0]))).ToArray<DataColumn>());
            //    }
            //    if (instances != null)
            //    {
            //        table.BeginLoadData();
            //        try
            //        {
            //            foreach (object instance in instances)
            //            {
            //                if (instance != null)
            //                {
            //                    DataRow dataRow = table.NewRow();
            //                    foreach (var variable in collection)
            //                    {
            //                        DataRow dataRow1 = dataRow;
            //                        string columnName = variable.ColumnName;
            //                        value = (variable.IsField ? ((FieldInfo)variable.MemberInfo).GetValue(instance) : ((PropertyInfo)variable.MemberInfo).GetValue(instance, null));
            //                        if (value == null)
            //                        {
            //                            value = DBNull.Value;
            //                        }
            //                        dataRow1[columnName] = value;
            //                    }
            //                    table.Rows.Add(dataRow);
            //                }
            //            }
            //        }
            //        finally
            //        {
            //            table.EndLoadData();
            //        }
            //    }
            //    table.SetTypeName(typeName);
            //    dataTable = table;
            //}
            //else
            //{
            //    dataTable = ((IEnumerable<IDictionary<string, object>>)instances).ToDataTable(false, typeName, table, null, null);
            //}

            dataTable = ((IEnumerable<IDictionary<string, object>>)instances).ToDataTable(false, typeName, table, null, null);

            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            //string key = null;
            //IDictionary<string, object> property = null;
            DataTable dataTable;
            IEnumerable<IDictionary<string, object>> properties = objs.ToProperties(getValue, columnNames);
            IDictionary<string, object> strs = properties.FirstOrDefault<IDictionary<string, object>>();
            if (strs != null)
            {
                if (table == null)
                {
                    Dictionary<string, List<Type>> strs1 = new Dictionary<string, List<Type>>(strs.Keys.Count);
                    foreach (string key in strs.Keys)
                    {
                        strs1.Add(key, new List<Type>(1));
                    }
                    foreach (IDictionary<string, object> property in properties)
                    {
                        foreach (string str in property.Keys.Except<string>(strs1.Keys))
                        {
                            strs1.Add(str, new List<Type>(1));
                        }
                        foreach (KeyValuePair<string, List<Type>> keyValuePair in strs1)
                        {
                            if (property.ContainsKey(keyValuePair.Key))
                            {
                                object item = property[keyValuePair.Key];
                                if ((item == null ? false : item != DBNull.Value))
                                {
                                    Type type = item.GetType();
                                    if (!keyValuePair.Value.Contains(type))
                                    {
                                        keyValuePair.Value.Add(type);
                                    }
                                }
                            }
                        }
                    }
                    table = new DataTable();
                    table.Columns.AddRange((
                        from c in strs1
                        select new DataColumn(c.Key, (c.Value.Count == 1 ? c.Value[0] : typeof(object)))).ToArray<DataColumn>());
                }
                if (!toEmptyDataTable)
                {
                    table.BeginLoadData();
                    try
                    {
                        string[] array = (
                            from DataColumn c in table.Columns
                            select c.ColumnName).ToArray<string>();
                        foreach (IDictionary<string, object> property1 in properties)
                        {
                            DataRow dataRow = table.NewRow();
                            string[] strArrays = array;
                            for (int i = 0; i < (int)strArrays.Length; i++)
                            {
                                string str1 = strArrays[i];
                                if (property1.ContainsKey(str1))
                                {
                                    DataRow dataRow1 = dataRow;
                                    string str2 = str1;
                                    object value = property1[str1];
                                    if (value == null)
                                    {
                                        value = DBNull.Value;
                                    }
                                    dataRow1[str2] = value;
                                }
                            }
                            table.Rows.Add(dataRow);
                        }
                    }
                    finally
                    {
                        table.EndLoadData();
                    }
                }
                table.SetTypeName(typeName);
                dataTable = table;
            }
            else
            {
                if (table == null)
                {
                    table = new DataTable();
                }
                table.SetTypeName(typeName);
                dataTable = table;
            }
            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this IEnumerable<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this dynamic[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this IDictionary<string, object>[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Dictionary<string, object>[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedDictionary<string, object>[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }


        public static DataTable ToDataTable(this SortedList<string, object>[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentDictionary<string, object>[] objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this List<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this List<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this List<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this List<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this List<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this List<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this HashSet<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this LinkedList<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Queue<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this SortedSet<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Stack<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this BlockingCollection<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentBag<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentQueue<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ConcurrentStack<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this Collection<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ObservableCollection<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyCollection<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<dynamic> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable;
            dataTable = (!(objs is IEnumerable<IDictionary<string, object>>) ? ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable<IDictionary<string, object>>(typeName, MemberTypes.Field | MemberTypes.Property, table) : ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames));
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<IDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<Dictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<SortedDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<SortedList<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        public static DataTable ToDataTable(this ReadOnlyObservableCollection<ConcurrentDictionary<string, object>> objs, bool toEmptyDataTable = false, string typeName = null, DataTable table = null, DataBaseFactory.ValueHandler getValue = null, params string[] columnNames)
        {
            DataTable dataTable = ((IEnumerable<IDictionary<string, object>>)objs).ToDataTable(toEmptyDataTable, typeName, table, getValue, columnNames);
            return dataTable;
        }

        private static T[] ToEnumerable<T>(DataTable table, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue)
        {
            T[] tArray;
            //if (table == null)
            //{
            //    tArray = null;
            //}
            //else if (table.Rows.Count != 0)
            //{
            //    Type type = typeof(T);
            //    var collection =
            //        from  in (
            //            from f in type.GetFields(BindingFlags.Instance | BindingFlags.Public)
            //            select new { ColumnName = f.Name, ColumnType = f.FieldType, IsField = true, MemberInfo = f }).Union(
            //            from p in type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            //            where p.CanWrite
            //            where p.CanRead
            //            where p.GetGetMethod(true).IsPublic
            //            where (int)p.GetIndexParameters().Length == 0
            //            select new { ColumnName = p.Name, ColumnType = p.PropertyType, IsField = false, MemberInfo = p })
            //        where table.Columns.Contains(c.ColumnName)
            //        select;
            //    T[] tArray1 = new T[table.Rows.Count];
            //    int num = 0;
            //    foreach (DataRow row in table.Rows)
            //    {
            //        T t = instanceHandler();
            //        foreach (var variable in collection)
            //        {
            //            object item = row[variable.ColumnName];
            //            if (getValue != null)
            //            {
            //                item = getValue(variable.ColumnName, variable.ColumnType, item);
            //            }
            //            if (item is DBNull)
            //            {
            //                item = null;
            //            }
            //            else if ((item == null ? false : variable.ColumnType != typeof(Type)))
            //            {
            //                if (item.GetType() != variable.ColumnType)
            //                {
            //                    if ((!variable.ColumnType.IsGenericType ? true : !(variable.ColumnType.GetGenericTypeDefinition() == typeof(Nullable<>))))
            //                    {
            //                        item = Convert.ChangeType(item, variable.ColumnType);
            //                    }
            //                    else if (item.GetType() != Nullable.GetUnderlyingType(variable.ColumnType))
            //                    {
            //                        item = Convert.ChangeType(item, Nullable.GetUnderlyingType(variable.ColumnType));
            //                    }
            //                }
            //            }
            //            if (!variable.IsField)
            //            {
            //                ((PropertyInfo)variable.MemberInfo).SetValue(t, item, null);
            //            }
            //            else
            //            {
            //                ((FieldInfo)variable.MemberInfo).SetValue(t, item);
            //            }
            //        }
            //        int num1 = num;
            //        num = num1 + 1;
            //        tArray1[num1] = t;
            //    }
            //    tArray = tArray1;
            //}
            //else
            //{
            //    tArray = new T[0];
            //}

            tArray = new T[0];

            return tArray;
        }

        private static T[] ToEnumerable<T>(DataView view, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue)
        {
            T[] tArray;
            //if (view == null)
            //{
            //    tArray = null;
            //}
            //else if (view.Count != 0)
            //{
            //    Type type = typeof(T);
            //    var collection =
            //        from  in (
            //            from f in type.GetFields(BindingFlags.Instance | BindingFlags.Public)
            //            select new { ColumnName = f.Name, ColumnType = f.FieldType, IsField = true, MemberInfo = f }).Union(
            //            from p in type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            //            where p.CanWrite
            //            where p.CanRead
            //            where p.GetGetMethod(true).IsPublic
            //            where (int)p.GetIndexParameters().Length == 0
            //            select new { ColumnName = p.Name, ColumnType = p.PropertyType, IsField = false, MemberInfo = p })
            //        where view.Table.Columns.Contains(c.ColumnName)
            //        select;
            //    T[] tArray1 = new T[view.Count];
            //    int num = 0;
            //    foreach (DataRowView dataRowView in view)
            //    {
            //        T t = instanceHandler();
            //        foreach (var variable in collection)
            //        {
            //            object item = dataRowView[variable.ColumnName];
            //            if (getValue != null)
            //            {
            //                item = getValue(variable.ColumnName, variable.ColumnType, item);
            //            }
            //            if (item is DBNull)
            //            {
            //                item = null;
            //            }
            //            else if ((item == null ? false : variable.ColumnType != typeof(Type)))
            //            {
            //                if (item.GetType() != variable.ColumnType)
            //                {
            //                    if ((!variable.ColumnType.IsGenericType ? true : !(variable.ColumnType.GetGenericTypeDefinition() == typeof(Nullable<>))))
            //                    {
            //                        item = Convert.ChangeType(item, variable.ColumnType);
            //                    }
            //                    else if (item.GetType() != Nullable.GetUnderlyingType(variable.ColumnType))
            //                    {
            //                        item = Convert.ChangeType(item, Nullable.GetUnderlyingType(variable.ColumnType));
            //                    }
            //                }
            //            }
            //            if (!variable.IsField)
            //            {
            //                ((PropertyInfo)variable.MemberInfo).SetValue(t, item, null);
            //            }
            //            else
            //            {
            //                ((FieldInfo)variable.MemberInfo).SetValue(t, item);
            //            }
            //        }
            //        int num1 = num;
            //        num = num1 + 1;
            //        tArray1[num1] = t;
            //    }
            //    tArray = tArray1;
            //}
            //else
            //{
            //    tArray = new T[0];
            //}

            tArray = new T[0];

            return tArray;
        }

        public static List<T> ToList<T>(this DataTable table, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            List<T> list = DataBaseFactory.ToEnumerable<T>(table, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue).ToList<T>();
            return list;
        }

        public static List<T> ToList<T>(this DataTable table, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            List<T> list = DataBaseFactory.ToEnumerable<T>(table, instanceHandler, getValue).ToList<T>();
            return list;
        }

        public static List<T> ToList<T>(this DataView view, DataBaseFactory.ValueHandler getValue = null)
        where T : new()
        {
            List<T> list = DataBaseFactory.ToEnumerable<T>(view, () => {
                T t;
                T t1 = default(T);
                if (t1 == null)
                {
                    t = Activator.CreateInstance<T>();
                }
                else
                {
                    t1 = default(T);
                    t = t1;
                }
                return t;
            }, getValue).ToList<T>();
            return list;
        }

        public static List<T> ToList<T>(this DataView view, Func<T> instanceHandler, DataBaseFactory.ValueHandler getValue = null)
        {
            List<T> list = DataBaseFactory.ToEnumerable<T>(view, instanceHandler, getValue).ToList<T>();
            return list;
        }

        public static IDictionary<string, object> ToProperties(this IDictionary<string, object> obj, params string[] columnNames)
        {
            return obj.ToProperties(null, columnNames);
        }

        public static IDictionary<string, object> ToProperties(this IDictionary<string, object> obj, DataBaseFactory.ValueHandler getValue, params string[] columnNames)
        {
            IDictionary<string, object> strs;
            //KeyValuePair<string, object> keyValuePair = new KeyValuePair<string, object>();
            IDictionary<string, object> strs1;
            if (!(columnNames == null ? true : (int)columnNames.Length <= 0))
            {
                strs = new Dictionary<string, object>();
                if (getValue == null)
                {
                    foreach (KeyValuePair<string, object> keyValuePair1 in obj)
                    {
                        if (columnNames.Contains<string>(keyValuePair1.Key))
                        {
                            strs.Add(keyValuePair1.Key, keyValuePair1.Value);
                        }
                    }
                }
                else
                {
                    foreach (KeyValuePair<string, object> keyValuePair2 in obj)
                    {
                        if (columnNames.Contains<string>(keyValuePair2.Key))
                        {
                            strs.Add(keyValuePair2.Key, getValue(keyValuePair2.Key, (keyValuePair2.Value != null ? keyValuePair2.Value.GetType() : typeof(object)), keyValuePair2.Value));
                        }
                    }
                }
                strs1 = strs;
            }
            else if (getValue == null)
            {
                strs1 = obj;
            }
            else
            {
                strs = new Dictionary<string, object>();
                foreach (KeyValuePair<string, object> keyValuePair in obj)
                {
                    strs.Add(keyValuePair.Key, getValue(keyValuePair.Key, (keyValuePair.Value != null ? keyValuePair.Value.GetType() : typeof(object)), keyValuePair.Value));
                }
                strs1 = strs;
            }
            return strs1;
        }

        public static IDictionary<string, object> ToProperties(object obj, params string[] columnNames)
        {
            return DataBaseFactory.ToProperties(obj, null, columnNames);
        }

        public static IDictionary<string, object> ToProperties(object obj, DataBaseFactory.ValueHandler getValue, params string[] columnNames)
        {
            // var variable = null;
            IDictionary<string, object> strs;
            bool flag;

            //if (!(obj is IDictionary<string, object>))
            //{
            //    Type type = obj.GetType();
            //    var collection =
            //        from c in (
            //            from f in (IEnumerable<FieldInfo>)type.GetFields(BindingFlags.Instance | BindingFlags.Public)
            //            select new { ColumnName = f.Name, ColumnType = f.FieldType, IsField = true, MemberInfo = f }).Union(
            //            from p in (IEnumerable<PropertyInfo>)type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            //            where p.CanRead
            //            where p.GetGetMethod(true).IsPublic
            //            where (int)p.GetIndexParameters().Length == 0
            //            select new { ColumnName = p.Name, ColumnType = p.PropertyType, IsField = false, MemberInfo = p })
            //        where (columnNames == null || (int)columnNames.Length <= 0 ? true : columnNames.Contains<string>(c.ColumnName))
            //        select c;
            //    IDictionary<string, object> strs1 = new Dictionary<string, object>();
            //    if (getValue == null)
            //    {
            //        foreach (var variable in collection)
            //        {
            //            strs1.Add(variable.ColumnName, (variable.IsField ? ((FieldInfo)variable.MemberInfo).GetValue(obj) : ((PropertyInfo)variable.MemberInfo).GetValue(obj, null)));
            //        }
            //    }
            //    else
            //    {
            //        foreach (var variable1 in collection)
            //        {
            //            strs1.Add(variable1.ColumnName, getValue(variable1.ColumnName, variable1.ColumnType, (variable1.IsField ? ((FieldInfo)variable1.MemberInfo).GetValue(obj) : ((PropertyInfo)variable1.MemberInfo).GetValue(obj, null))));
            //        }
            //    }
            //    strs = strs1;
            //}
            //else
            //{
            //    if (getValue != null)
            //    {
            //        flag = false;
            //    }
            //    else
            //    {
            //        flag = (columnNames == null ? true : (int)columnNames.Length <= 0);
            //    }
            //    strs = (flag ? (IDictionary<string, object>)obj : ((IDictionary<string, object>)obj).ToProperties(getValue, columnNames));
            //}


            if (getValue != null)
            {
                flag = false;
            }
            else
            {
                flag = (columnNames == null ? true : (int)columnNames.Length <= 0);
            }
            strs = (flag ? (IDictionary<string, object>)obj : ((IDictionary<string, object>)obj).ToProperties(getValue, columnNames));

            return strs;
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties(this IEnumerable<IDictionary<string, object>> objs, params string[] columnNames)
        {
            return objs.ToProperties(null, columnNames);
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties(this IEnumerable<IDictionary<string, object>> objs, DataBaseFactory.ValueHandler getValue, params string[] columnNames)
        {
            List<IDictionary<string, object>> dictionaries;
            //IDictionary<string, object> obj = null;
            IDictionary<string, object> strs;
            //KeyValuePair<string, object> keyValuePair = new KeyValuePair<string, object>();
            IEnumerable<IDictionary<string, object>> dictionaries1;
            if (!(columnNames == null ? true : (int)columnNames.Length <= 0))
            {
                dictionaries = new List<IDictionary<string, object>>();
                if (getValue == null)
                {
                    foreach (IDictionary<string, object> obj1 in objs)
                    {
                        strs = new Dictionary<string, object>();
                        foreach (KeyValuePair<string, object> keyValuePair1 in obj1)
                        {
                            if (columnNames.Contains<string>(keyValuePair1.Key))
                            {
                                strs.Add(keyValuePair1.Key, keyValuePair1.Value);
                            }
                        }
                        dictionaries.Add(strs);
                    }
                }
                else
                {
                    foreach (IDictionary<string, object> strs1 in objs)
                    {
                        strs = new Dictionary<string, object>();
                        foreach (KeyValuePair<string, object> keyValuePair2 in strs1)
                        {
                            if (columnNames.Contains<string>(keyValuePair2.Key))
                            {
                                strs.Add(keyValuePair2.Key, getValue(keyValuePair2.Key, (keyValuePair2.Value != null ? keyValuePair2.Value.GetType() : typeof(object)), keyValuePair2.Value));
                            }
                        }
                        dictionaries.Add(strs);
                    }
                }
                dictionaries1 = dictionaries;
            }
            else if (getValue == null)
            {
                dictionaries1 = objs;
            }
            else
            {
                dictionaries = new List<IDictionary<string, object>>();
                foreach (IDictionary<string, object> obj in objs)
                {
                    strs = new Dictionary<string, object>();
                    foreach (KeyValuePair<string, object> keyValuePair in obj)
                    {
                        strs.Add(keyValuePair.Key, getValue(keyValuePair.Key, (keyValuePair.Value != null ? keyValuePair.Value.GetType() : typeof(object)), keyValuePair.Value));
                    }
                    dictionaries.Add(strs);
                }
                dictionaries1 = dictionaries;
            }
            return dictionaries1;
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties<T>(this IEnumerable<T> objs, params string[] columnNames)
        {
            return objs.ToProperties<T>(null, columnNames);
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties<T>(this IEnumerable<T> objs, DataBaseFactory.ValueHandler getValue, params string[] columnNames)
        {
            T obj = default(T);
            Dictionary<string, object> strs;
            //var variable = null;
            IEnumerable<IDictionary<string, object>> dictionaries;
            bool flag;
            //if (!(objs is IEnumerable<IDictionary<string, object>>))
            //{
            //    Type type = typeof(T);
            //    var collection =
            //        from  in (
            //            from f in type.GetFields(BindingFlags.Instance | BindingFlags.Public)
            //            select new { ColumnName = f.Name, ColumnType = f.FieldType, IsField = true, MemberInfo = f }).Union(
            //            from p in type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
            //            where p.CanRead
            //            where p.GetGetMethod(true).IsPublic
            //            where (int)p.GetIndexParameters().Length == 0
            //            select new { ColumnName = p.Name, ColumnType = p.PropertyType, IsField = false, MemberInfo = p })
            //        where(columnNames == null || (int)columnNames.Length <= 0 ? true : columnNames.Contains<string>(c.ColumnName))
            //        select;
            //    List<IDictionary<string, object>> dictionaries1 = new List<IDictionary<string, object>>();
            //    if (getValue == null)
            //    {
            //        foreach (T obj in objs)
            //        {
            //            strs = new Dictionary<string, object>();
            //            foreach (var variable in collection)
            //            {
            //                strs.Add(variable.ColumnName, (variable.IsField ? ((FieldInfo)variable.MemberInfo).GetValue(obj) : ((PropertyInfo)variable.MemberInfo).GetValue(obj, null)));
            //            }
            //            dictionaries1.Add(strs);
            //        }
            //    }
            //    else
            //    {
            //        foreach (T t in objs)
            //        {
            //            strs = new Dictionary<string, object>();
            //            foreach (var variable1 in collection)
            //            {
            //                strs.Add(variable1.ColumnName, getValue(variable1.ColumnName, variable1.ColumnType, (variable1.IsField ? ((FieldInfo)variable1.MemberInfo).GetValue(t) : ((PropertyInfo)variable1.MemberInfo).GetValue(t, null))));
            //            }
            //            dictionaries1.Add(strs);
            //        }
            //    }
            //    dictionaries = dictionaries1;
            //}
            //else
            //{
            //    if (getValue != null)
            //    {
            //        flag = false;
            //    }
            //    else
            //    {
            //        flag = (columnNames == null ? true : (int)columnNames.Length <= 0);
            //    }
            //    dictionaries = (flag ? (IEnumerable<IDictionary<string, object>>)objs : ((IEnumerable<IDictionary<string, object>>)objs).ToProperties(getValue, columnNames));
            //}


            if (getValue != null)
            {
                flag = false;
            }
            else
            {
                flag = (columnNames == null ? true : (int)columnNames.Length <= 0);
            }
            dictionaries = (flag ? (IEnumerable<IDictionary<string, object>>)objs : ((IEnumerable<IDictionary<string, object>>)objs).ToProperties(getValue, columnNames));

            return dictionaries;
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties(this IEnumerable<object> objs, params string[] columnNames)
        {
            return objs.ToProperties(null, columnNames);
        }

        public static IEnumerable<IDictionary<string, object>> ToProperties(this IEnumerable<object> objs, DataBaseFactory.ValueHandler getValue, params string[] columnNames)
        {
            IEnumerable<IDictionary<string, object>> dictionaries;
            if ((getValue != null || columnNames != null && (int)columnNames.Length != 0 ? true : !(objs is IEnumerable<IDictionary<string, object>>)))
            {
                List<IDictionary<string, object>> dictionaries1 = new List<IDictionary<string, object>>();
                foreach (object obj in objs)
                {
                    dictionaries1.Add(DataBaseFactory.ToProperties(obj, getValue, columnNames));
                }
                dictionaries = dictionaries1;
            }
            else
            {
                dictionaries = (IEnumerable<IDictionary<string, object>>)objs;
            }
            return dictionaries;
        }

       

        public delegate object ValueHandler(string columnName, Type columnType, object value);




    }
}
