// CandidateExperienceDetailsRepository.cs
using Dapper;
using HRMSWebAPI.Helper;
using HRMSWebAPI.Models;
using System.Data;

namespace HRMSWebAPI.Repository
{
    public class CandidateExperienceDetailsRepository : ICandidateExperienceDetailsRepository
    {
        public async Task<(int totalCount, IEnumerable<CandidateExperienceDetails>)> GetAll(int pageIndex, int pageSize, string fk_recId)  // Changed parameter type
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);  // Changed from DbType.Int64 to DbType.String

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateExperienceDetails>(
                "REC_Candidate_PreJob_SelForGrid",
                dynamicParameters,
                "CandidateExperienceDetails_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, new List<CandidateExperienceDetails>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CandidateExperienceDetails> GetById(long pk_cpjobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cpjobid", pk_cpjobid, DbType.Int64);

            return DataBaseFactory.QuerySP<CandidateExperienceDetails>(
                "REC_Candidate_PreJob_Edit",
                dynamicParameters,
                "CandidateExperience_Details_GetById").FirstOrDefault();
        }

        public async Task<bool> InsertCandidatePrevJob(CandidateExperienceDetails candidateExperienceDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateExperienceDetailsDataSet dataset = new CandidateExperienceDetailsDataSet
            {
                candidateExperienceDetails = candidateExperienceDetails
            };

            // Convert date fields to valid date strings before serialization
            if (DateTime.TryParse(candidateExperienceDetails.fromdate, out DateTime fromDate))
            {
                candidateExperienceDetails.fromdate = fromDate.ToString("yyyy-MM-dd");
            }
            if (DateTime.TryParse(candidateExperienceDetails.todate, out DateTime toDate))
            {
                candidateExperienceDetails.todate = toDate.ToString("yyyy-MM-dd");
            }

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("REC_Candidate_PreJob_Ins", dynamicParameters, "CandidateExperience_Insert");

            return result > 0;
        }

        //public async Task<bool> UpdateCandidateExperienceDetailsAsync(CandidateExperienceDetails candidateExperienceDetails)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();

        //    // Wrap the model in the required dataset structure
        //    CandidateExperienceDetailsDataSet dataset = new CandidateExperienceDetailsDataSet
        //    {
        //        candidateExperienceDetails = candidateExperienceDetails
        //    };

        //    // Serialize to XML
        //    string xmlData = XmlUtility.XmlSerializeToString(dataset);

        //    // Add parameters
        //    dynamicParameters.Add("@pk_cpjobid", candidateExperienceDetails.pk_cpjobid, DbType.Int64);
        //    dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
        //    dynamicParameters.Add("@Timestamp", candidateExperienceDetails.Timestamp, DbType.Binary);

        //    // Log XML for debugging
        //    Console.WriteLine("Generated XML:\n" + xmlData);

        //    // Execute stored procedure
        //    int result = await DataBaseFactory.QuerySPAsync("REC_Candidate_PreJob_Upd", dynamicParameters, "CandidateExperience_Update");

        //    return result > 0;
        //}




        public async Task<bool> UpdateCandidateExperienceDetailsAsync(CandidateExperienceDetails candidateExperienceDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateExperienceDetailsDataSet dataset = new CandidateExperienceDetailsDataSet
            {
                candidateExperienceDetails = candidateExperienceDetails
            };

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_cpjobid", candidateExperienceDetails.pk_cpjobid, DbType.Int64);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Timestamp", candidateExperienceDetails.Timestamp, DbType.Binary);

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("REC_Candidate_PreJob_Upd", dynamicParameters, "CandidateExperience_Update");

            return result > 0;
        }
        public async Task<bool> DeleteCandidateExperienceAsync(long pk_cpjobid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_cpjobid", pk_cpjobid, DbType.Int64);

            int n = DataBaseFactory.QuerySP("REC_Candidate_PreJob_Del", dynamicParameters, "CandidateExperience_Delete");

            return n > 0;
        }

        //public async Task<bool> CompleteOnboarding(string candidateId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@pk_recId", candidateId, DbType.String);

        //    int n = DataBaseFactory.QuerySP(
        //        "REC_Candidate_CompleteOnboarding",
        //        dynamicParameters,
        //        "Candidate_CompleteOnboarding"
        //    );

        //    return n > 0;
        //}


        public async Task<(bool success, CandidateHREmailDetails details)> CompleteOnboarding(string candidateId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recId", candidateId, DbType.String);

            // Use tuple to get both results
            var result = DataBaseFactory.QueryMultipleSP<dynamic, CandidateHREmailDetails>(
                "REC_Candidate_CompleteOnboarding",
                dynamicParameters,
                "Candidate_CompleteOnboarding"
            );

            if (result == null) return (false, null);

            //  Get rows affected from first result set
            int rowsAffected = 0;
            if (result.Item1 is IEnumerable<dynamic> firstSet && firstSet.Any())
            {
                rowsAffected = Convert.ToInt32(((IDictionary<string, object>)firstSet.First())["RowsAffected"]);
            }

            //  Get candidate details from second result set
            var candidateDetails = result.Item2?.FirstOrDefault();

            return (rowsAffected > 0, candidateDetails);
        }


        public async Task<CandidateBasicDetails> GetCandidateByKeyForHR(string candidateKey)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@CandidateKey", candidateKey, DbType.String);

            var result = DataBaseFactory.QuerySP<CandidateBasicDetails>(
                "REC_Candidate_GetByKeyForHR",
                dynamicParameters,
                "Candidate_GetByKeyForHR"
            ).FirstOrDefault();

            return result;
        }


        public async Task<CompanyConfig> GetMandatorySettings(string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);

            var result = DataBaseFactory.QuerySP<CompanyConfig>(
                "SAL_Company_Config_GetMandatorySettings",
                dynamicParameters,
                "CompanyConfig_GetMandatorySettings"
            ).FirstOrDefault();

            return result ?? new CompanyConfig
            {
                // Mandatory
                photograph_livecapture = false,
                pan_mandatory = false,
                aadhaar_mandatory = false,
                basicinfo_mandatory = false,
                qualification_mandatory = false,
                experience_mandatory = false,
                family_mandatory = false,
                voter_mandatory = false,
                bankaccount_mandatory = false,

                // Verification
                pan_verification = false,
                aadhaar_verification = false,
                voter_verification = false,
                bankaccount_verification = false,

                // Visibility (NEW)
                pan_visible = true,
                aadhaar_visible = true,
                basicinfo_visible = true,
                qualification_visible = true,
                experience_visible = true,
                family_visible = true,
                voter_visible = false,
                bankaccount_visible = false,
                vehicle_insurance_visible = true,
                vehicle_rc_visible = true,
                vehicle_insurance_mandatory = false,
                vehicle_rc_mandatory = false,

                // E-Shram
                eshram_mandatory = false,
                eshram_verification = false,
                eshram_visible = false,

                // Ayushman
                ayushman_mandatory = false,
                ayushman_verification = false,
                ayushman_visible = false,

                lifeinsurance_mandatory = false,
                lifeinsurance_verification = false,
                lifeinsurance_visible = false
            };
        }

        // Life Insurance Repository Methods
        public async Task<bool> InsertLifeInsuranceAsync(LifeInsuranceModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@LifeInsurance_No", model.LifeInsurance_No, DbType.String);
                param.Add("@LifeInsurance_Photo", model.LifeInsurance_Photo, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_LifeInsurance_Ins",
                    param,
                    "LifeInsurance_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert LifeInsurance Error: " + ex.Message);
                return false;
            }
        }

        public async Task<LifeInsuranceModel> GetLifeInsuranceByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<LifeInsuranceModel>(
                "KYC_LifeInsurance_Sel_ById",
                parameters,
                "LifeInsurance_GetById"
            );
            return result.FirstOrDefault();
        }

        //public async Task<CompanyConfig> GetMandatorySettings(string fk_recId)
        //{
        //    DynamicParameters dynamicParameters = new DynamicParameters();
        //    dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);

        //    var result = DataBaseFactory.QuerySP<CompanyConfig>(
        //        "SAL_Company_Config_GetMandatorySettings",
        //        dynamicParameters,
        //        "CompanyConfig_GetMandatorySettings"
        //    ).FirstOrDefault();

        //    // Return default values if no config found
        //    return result ?? new CompanyConfig
        //    {
        //        pan_mandatory = false,
        //        aadhaar_mandatory = false,
        //        basicinfo_mandatory = false,
        //        qualification_mandatory = false,
        //        experience_mandatory = false,
        //        family_mandatory = false,
        //        voter_mandatory = false,
        //        bankaccount_mandatory = false,
        //        pan_verification = false,
        //        aadhaar_verification = false,
        //        voter_verification = false,
        //        bankaccount_verification = false
        //    };
        //}

        public async Task<CandidateFinalSummary> GetCandidateFinalSummary(string pk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_recId", pk_recId, DbType.String);

            var result = DataBaseFactory.QueryMultipleSP<
        OnboardCandidateBasicInfo,
        OnboardCandidateAadhaarDetails,
        OnboardCandidatePANDetails,
        OnboardCandidateQualificationDetails,
        OnboardCandidateExperienceDetails,
        OnboardCandidateFamilyDetails,
        OnboardCandidateBankDetails,
        OnboardCandidateVoterDetails,
        VendorGSTModel,
        VendorAgreementDetailsDto,
        VendorActiveRateCardDto
    >(
        "REC_Candidate_FinalSummary_Get",
        dynamicParameters,
        "Candidate_FinalSummary_Get"
    );

            if (result == null) return null;

            var summary = new CandidateFinalSummary
            {
                BasicInfo = result.Item1?.FirstOrDefault(),
                AadhaarDetails = result.Item2?.FirstOrDefault(),
                PANDetails = result.Item3?.FirstOrDefault(),
                Qualifications = result.Item4?.ToList() ?? new List<OnboardCandidateQualificationDetails>(),
                Experience = result.Item5?.ToList() ?? new List<OnboardCandidateExperienceDetails>(),
                Family = result.Item6?.ToList() ?? new List<OnboardCandidateFamilyDetails>(),
                BankDetails = result.Item7?.FirstOrDefault(),
                VoterDetails = result.Rest.Item1?.FirstOrDefault(),
                VendorGstDetails = result.Rest.Item2?.FirstOrDefault(),
                VendorAgreement = result.Rest.Item3?.FirstOrDefault(),
                VendorActiveRateCards = result.Rest.Item4?.ToList() ?? new List<VendorActiveRateCardDto>()
            };

            try
            {
                summary.DrivingLicenceData = await GetDrivingLicenceByIdAsync(pk_recId);
            }
            catch { }

            try
            {
                if (summary.VendorAgreement == null || string.IsNullOrEmpty(summary.VendorAgreement.SignaturePhoto))
                {
                    var sig = await GetSignatureByIdAsync(pk_recId);
                    if (sig != null && !string.IsNullOrEmpty(sig.SignaturePhoto))
                    {
                        if (summary.VendorAgreement == null) summary.VendorAgreement = new VendorAgreementDetailsDto();
                        summary.VendorAgreement.SignaturePhoto = sig.SignaturePhoto;
                    }
                }
            }
            catch { }

            try
            {
                if (summary.BasicInfo != null && string.IsNullOrEmpty(summary.BasicInfo.Photo))
                {
                    var photo = await GetPhotographByIdAsync(pk_recId);
                    if (photo != null && !string.IsNullOrEmpty(photo.Photo))
                    {
                        summary.BasicInfo.Photo = photo.Photo;
                    }
                }
            }
            catch { }

            try
            {
                if (summary.BasicInfo == null)
                {
                    summary.BasicInfo = new OnboardCandidateBasicInfo { pk_recId = pk_recId };
                }

                // If mobile, email, address, or pincode is missing from SP, fetch from Vendor_GetById
                if (string.IsNullOrWhiteSpace(summary.BasicInfo.mobile) ||
                    string.IsNullOrWhiteSpace(summary.BasicInfo.email) ||
                    string.IsNullOrWhiteSpace(summary.BasicInfo.Address) ||
                    string.IsNullOrWhiteSpace(summary.BasicInfo.Pincode))
                {
                    using var conn = DataBaseFactory.ConnString();
                    using var multi = await conn.QueryMultipleAsync("Vendor_GetById", new { pk_recId = pk_recId }, commandType: CommandType.StoredProcedure);
                    var vendor = multi.Read<VendorModel>().FirstOrDefault();
                    if (vendor != null)
                    {
                        summary.BasicInfo.isVendor = true;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.candidate_name))
                            summary.BasicInfo.candidate_name = vendor.Vendor_Name;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.mobile))
                            summary.BasicInfo.mobile = !string.IsNullOrWhiteSpace(vendor.Vendor_ContactNo) ? vendor.Vendor_ContactNo : vendor.EmergencyContactNo;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.email))
                            summary.BasicInfo.email = vendor.EmailID;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.Pincode))
                            summary.BasicInfo.Pincode = !string.IsNullOrWhiteSpace(vendor.CurrentPinCode) ? vendor.CurrentPinCode : vendor.PermanentPinCode;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.Address))
                            summary.BasicInfo.Address = !string.IsNullOrWhiteSpace(vendor.Vendor_Address) ? vendor.Vendor_Address : vendor.Vendor_PermanentAddress;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.StateName))
                            summary.BasicInfo.StateName = !string.IsNullOrWhiteSpace(vendor.StateName) ? vendor.StateName : vendor.Vendor_State;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.CityName))
                            summary.BasicInfo.CityName = !string.IsNullOrWhiteSpace(vendor.CityName) ? vendor.CityName : vendor.Vendor_City;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.StateId))
                            summary.BasicInfo.StateId = !string.IsNullOrWhiteSpace(vendor.Vendor_FKStateId) ? vendor.Vendor_FKStateId : vendor.Vendor_FKPermStateId;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.CityId))
                            summary.BasicInfo.CityId = !string.IsNullOrWhiteSpace(vendor.Vendor_FKCityId) ? vendor.Vendor_FKCityId : vendor.Vendor_FKPermCityId;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.Vendor_Code))
                            summary.BasicInfo.Vendor_Code = vendor.Vendor_Code;

                        if (string.IsNullOrWhiteSpace(summary.BasicInfo.Vendor_Status))
                            summary.BasicInfo.Vendor_Status = vendor.Vendor_Status;
                    }
                }

                // If Address is still missing, fallback to Aadhaar address
                if (string.IsNullOrWhiteSpace(summary.BasicInfo.Address) && summary.AadhaarDetails != null && !string.IsNullOrWhiteSpace(summary.AadhaarDetails.AadhaarAddress))
                {
                    summary.BasicInfo.Address = summary.AadhaarDetails.AadhaarAddress;
                }

                // Also enrich VendorAgreement if address/name is missing
                if (summary.VendorAgreement != null)
                {
                    if (string.IsNullOrWhiteSpace(summary.VendorAgreement.Vendor_Address) && !string.IsNullOrWhiteSpace(summary.BasicInfo.Address))
                    {
                        summary.VendorAgreement.Vendor_Address = summary.BasicInfo.Address;
                    }
                    if (string.IsNullOrWhiteSpace(summary.VendorAgreement.Vendor_Name) && !string.IsNullOrWhiteSpace(summary.BasicInfo.candidate_name))
                    {
                        summary.VendorAgreement.Vendor_Name = summary.BasicInfo.candidate_name;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error enriching vendor basic info in GetCandidateFinalSummary: " + ex.Message);
            }

            return summary;
        }





        //FAMILY

        public async Task<(int totalCount, IEnumerable<CandidateFamilyDetails>)> GetAllFamily(int pageIndex, int pageSize, string fk_recId)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pageindex", pageIndex, DbType.Int32);
            dynamicParameters.Add("@pagesize", pageSize, DbType.Int32);
            dynamicParameters.Add("@fk_recId", fk_recId, DbType.String);

            var tuple = DataBaseFactory.QueryMultipleSP<dynamic, CandidateFamilyDetails>(
                "REC_CandidateFamily_SelForGrid",
                dynamicParameters,
                "CandidateFamilyDetails_GetAll");

            if (tuple == null || tuple.Item2 == null) return (0, new List<CandidateFamilyDetails>());

            int totalCount = tuple.Item1 is IEnumerable<dynamic> totalList && totalList.Any()
               ? Convert.ToInt32(((IDictionary<string, object>)totalList.First()).Values.First()) : 0;

            return (totalCount, tuple?.Item2?.ToList());
        }

        public async Task<CandidateFamilyDetails> GetByIdFamily(long pk_familyid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_familyid", pk_familyid, DbType.Int64);

            return DataBaseFactory.QuerySP<CandidateFamilyDetails>(
                "REC_CandidateFamily_Edit",
                dynamicParameters,
                "CandidateFamily_Details_GetById").FirstOrDefault();
        }

        public async Task<bool> InsertCandidateFamily(CandidateFamilyDetails candidateFamilyDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateFamilyDetailsDataSet dataset = new CandidateFamilyDetailsDataSet
            {
                candidateFamilyDetails = candidateFamilyDetails
            };

            // Convert date fields to valid date strings before serialization
            if (DateTime.TryParse(candidateFamilyDetails.dob, out DateTime dob))
            {
                candidateFamilyDetails.dob = dob.ToString("yyyy-MM-dd");
            }

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("REC_CandidateFamily_Ins", dynamicParameters, "CandidateFamily_Insert");

            return result > 0;
        }

        public async Task<bool> UpdateCandidateFamilyDetailsAsync(CandidateFamilyDetails candidateFamilyDetails)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();

            // Wrap the model in the required dataset structure
            CandidateFamilyDetailsDataSet dataset = new CandidateFamilyDetailsDataSet
            {
                candidateFamilyDetails = candidateFamilyDetails
            };

            // Convert date fields to valid date strings before serialization
            if (DateTime.TryParse(candidateFamilyDetails.dob, out DateTime dob))
            {
                candidateFamilyDetails.dob = dob.ToString("yyyy-MM-dd");
            }

            // Serialize to XML
            string xmlData = XmlUtility.XmlSerializeToString(dataset);

            // Add parameters
            dynamicParameters.Add("@pk_familyid", candidateFamilyDetails.pk_familyid, DbType.Int64);
            dynamicParameters.Add("@xmlDoc", xmlData, DbType.String);
            dynamicParameters.Add("@Timestamp", candidateFamilyDetails.Timestamp, DbType.Binary);

            // Log XML for debugging
            Console.WriteLine("Generated XML:\n" + xmlData);

            // Execute stored procedure
            int result = await DataBaseFactory.QuerySPAsync("REC_CandidateFamily_Upd", dynamicParameters, "CandidateFamily_Update");

            return result > 0;
        }

        public async Task<bool> DeleteCandidateFamilyAsync(long pk_familyid)
        {
            DynamicParameters dynamicParameters = new DynamicParameters();
            dynamicParameters.Add("@pk_familyid", pk_familyid, DbType.Int64);

            int n = DataBaseFactory.QuerySP("REC_CandidateFamily_Del", dynamicParameters, "CandidateFamily_Delete");

            return n > 0;
        }







        // Bank Repository Methods
        public async Task<bool> InsertBankAsync(BankModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                string xmlData = XmlUtility.XmlSerializeToString(model);
                param.Add("@xmlDoc", xmlData, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_BankVerification_Ins",
                    param,
                    "Bank_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Bank Error: " + ex.Message);
                return false;
            }
        }

        public async Task<BankModel> GetBankByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<BankModel>(
                "KYC_BankVerification_Sel_ById",
                parameters,
                "Bank_GetById"
            );
            return result.FirstOrDefault();
        }

        // Voter Repository Methods
        public async Task<bool> InsertVoterAsync(VoterModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                string xmlData = XmlUtility.XmlSerializeToString(model);
                param.Add("@xmlDoc", xmlData, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_VoterVerification_Ins",
                    param,
                    "Voter_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Voter Error: " + ex.Message);
                return false;
            }
        }

        public async Task<VoterModel> GetVoterByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<VoterModel>(
                "KYC_VoterVerification_Sel_ById",
                parameters,
                "Voter_GetById"
            );
            return result.FirstOrDefault();
        }

        //new added 




        

        public async Task<DrivingLicenceModel> GetDrivingLicenceByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<DrivingLicenceModel>(
                "KYC_DrivingLicence_Sel_ById",
                parameters,
                "DL_GetById"
            );
            return result.FirstOrDefault();
        }

        // Vendor GST Repository Methods
        public async Task<bool> InsertVendorGSTAsync(VendorGSTModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@Vendor_IsGSTApplicable", model.Vendor_IsGSTApplicable, DbType.Boolean);
                param.Add("@Vendor_GSTNo", model.Vendor_GSTNo, DbType.String);
                param.Add("@GSTPhoto", model.GSTPhoto, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_VendorGST_Ins",
                    param,
                    "GST_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Vendor GST Error: " + ex.Message);
                return false;
            }
        }

        public async Task<VendorGSTModel> GetVendorGSTByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<VendorGSTModel>(
                "KYC_VendorGST_Sel_ById",
                parameters,
                "GST_GetById"
            );
            return result.FirstOrDefault();
        }

        // Signature Repository Methods
        public async Task<bool> InsertSignatureAsync(SignatureModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@SignaturePhoto", model.SignaturePhoto, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_Signature_Ins",
                    param,
                    "Signature_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Signature Error: " + ex.Message);
                return false;
            }
        }

        public async Task<SignatureModel> GetSignatureByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<SignatureModel>(
                "KYC_Signature_Sel_ById",
                parameters,
                "Signature_GetById"
            );
            return result.FirstOrDefault();
        }

        // Photograph Repository Methods
        public async Task<bool> InsertPhotographAsync(PhotographModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@Photo", model.Photo, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_Photograph_Ins",
                    param,
                    "Photograph_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Photograph Error: " + ex.Message);
                return false;
            }
        }

        public async Task<PhotographModel> GetPhotographByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<PhotographModel>(
                "KYC_Photograph_Sel_ById",
                parameters,
                "Photograph_GetById"
            );
            return result.FirstOrDefault();
        }

        public async Task<VendorAgreementDetailsDto> GetVendorAgreementDetails(string pk_recId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);

            using var conn = DataBaseFactory.ConnString();
            if (conn.State != ConnectionState.Open) await conn.OpenAsync();

            var multi = await conn.QueryMultipleAsync("REC_Vendor_Agreement_Details_Get", parameters, commandType: CommandType.StoredProcedure);
            var master = (await multi.ReadAsync<VendorAgreementDetailsDto>()).FirstOrDefault();
            if (master != null)
            {
                master.ActiveRateCards = (await multi.ReadAsync<VendorActiveRateCardDto>()).ToList();
            }
            return master;
        }

        //added code 16 sept starts
        // Driving Licence Repository Methods
        public async Task<bool> InsertDrivingLicenceAsync(DrivingLicenceModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@DLNo", model.DLNo, DbType.String);
                param.Add("@DLPhoto", model.DLPhoto, DbType.String);
                param.Add("@Vehicle_Insurance_No", model.Vehicle_Insurance_No, DbType.String);
                param.Add("@Vehicle_Insurance_Photo", model.Vehicle_Insurance_Photo, DbType.String);
                param.Add("@Vehicle_RC_No", model.Vehicle_RC_No, DbType.String);
                param.Add("@Vehicle_RC_Photo", model.Vehicle_RC_Photo, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_DrivingLicence_Ins",
                    param,
                    "DL_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Driving Licence Error: " + ex.Message);
                return false;
            }
        }

    

        // Eshram Repository Methods
        public async Task<bool> InsertEshramAsync(EshramModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@Eshram_UAN", model.Eshram_UAN, DbType.String);
                param.Add("@Eshram_Photo", model.Eshram_Photo, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_Eshram_Ins",
                    param,
                    "Eshram_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Eshram Error: " + ex.Message);
                return false;
            }
        }

        public async Task<EshramModel> GetEshramByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<EshramModel>(
                "KYC_Eshram_Sel_ById",
                parameters,
                "Eshram_GetById"
            );
            return result.FirstOrDefault();
        }

        // Ayushman Repository Methods
        public async Task<bool> InsertAyushmanAsync(AyushmanModel model)
        {
            try
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@pk_recId", model.pk_recId, DbType.String);
                param.Add("@Ayushman_PMJAY_ID", model.Ayushman_PMJAY_ID, DbType.String);
                param.Add("@Ayushman_Photo", model.Ayushman_Photo, DbType.String);

                int result = await DataBaseFactory.QuerySPAsync(
                    "KYC_Ayushman_Ins",
                    param,
                    "Ayushman_Insert");
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Insert Ayushman Error: " + ex.Message);
                return false;
            }
        }

        public async Task<AyushmanModel> GetAyushmanByIdAsync(string pk_recId)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@pk_recId", pk_recId, DbType.String);
            var result = await DataBaseFactory.QuerySPAsync<AyushmanModel>(
                "KYC_Ayushman_Sel_ById",
                parameters,
                "Ayushman_GetById"
            );
            return result.FirstOrDefault();
        }



        
        //added code 16 sept ends

    }
}