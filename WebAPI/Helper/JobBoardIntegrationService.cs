using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using HRMSWebAPI.Models;
using HRMSWebAPI.Repository;

namespace HRMSWebAPI.Helper
{
    public interface IJobBoardIntegrationService
    {
        Task<bool> PostJobToExternalBoardsAsync(NewjobMst job, bool postToNaukri, bool postToIndeed);
        Task<List<ExternalCandidate>> FetchCandidatesFromJobBoardsAsync(string jobId);
    }

    public class JobBoardIntegrationService : IJobBoardIntegrationService
    {
        private readonly IExternalCandidateRepository _externalCandidateRepository;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public JobBoardIntegrationService(
            IExternalCandidateRepository externalCandidateRepository,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _externalCandidateRepository = externalCandidateRepository;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> PostJobToExternalBoardsAsync(NewjobMst job, bool postToNaukri, bool postToIndeed)
        {
            bool overallSuccess = true;
            using var httpClient = _httpClientFactory.CreateClient();

            if (postToNaukri)
            {
                try
                {
                    string naukriBaseUrl = _configuration["JobBoardIntegrations:Naukri:BaseUrl"];
                    string naukriClientId = _configuration["JobBoardIntegrations:Naukri:ClientId"];
                    string naukriClientSecret = _configuration["JobBoardIntegrations:Naukri:ClientSecret"];
                    
                    // Example payload structure for job board
                    var payload = new
                    {
                        title = job.Job_title,
                        description = job.jobResponsibilities,
                        openings = job.No_of_post
                    };

                    if (!string.IsNullOrEmpty(naukriBaseUrl) && !naukriBaseUrl.Contains("PLACEHOLDER"))
                    {
                        httpClient.DefaultRequestHeaders.Clear();
                        httpClient.DefaultRequestHeaders.Add("Client-Id", naukriClientId);
                        httpClient.DefaultRequestHeaders.Add("Client-Secret", naukriClientSecret);
                        
                        var response = await httpClient.PostAsJsonAsync($"{naukriBaseUrl}jobs", payload);
                        if (!response.IsSuccessStatusCode)
                        {
                            overallSuccess = false;
                        }
                    }
                    else
                    {
                        // Fallback simulated success if no real API key is configured yet
                        await Task.Delay(200);
                        Console.WriteLine($"[SIMULATION] Posted job {job.Job_title} to Naukri.");
                    }
                }
                catch(Exception ex)
                {
                    Console.WriteLine($"Error posting to Naukri: {ex.Message}");
                    overallSuccess = false;
                }
            }
            
            if (postToIndeed)
            {
                try
                {
                    string indeedBaseUrl = _configuration["JobBoardIntegrations:Indeed:BaseUrl"];
                    string indeedClientId = _configuration["JobBoardIntegrations:Indeed:ClientId"];
                    string indeedClientSecret = _configuration["JobBoardIntegrations:Indeed:ClientSecret"];
                    
                    var payload = new
                    {
                        title = job.Job_title,
                        description = job.jobResponsibilities,
                        openings = job.No_of_post
                    };

                    if (!string.IsNullOrEmpty(indeedBaseUrl) && !indeedBaseUrl.Contains("PLACEHOLDER"))
                    {
                        httpClient.DefaultRequestHeaders.Clear();
                        httpClient.DefaultRequestHeaders.Add("Client-Id", indeedClientId);
                        httpClient.DefaultRequestHeaders.Add("Client-Secret", indeedClientSecret);
                        
                        var response = await httpClient.PostAsJsonAsync($"{indeedBaseUrl}jobs", payload);
                        if (!response.IsSuccessStatusCode)
                        {
                            overallSuccess = false;
                        }
                    }
                    else
                    {
                        // Fallback simulated success if no real API key is configured yet
                        await Task.Delay(200);
                        Console.WriteLine($"[SIMULATION] Posted job {job.Job_title} to Indeed.");
                    }
                }
                catch(Exception ex)
                {
                    Console.WriteLine($"Error posting to Indeed: {ex.Message}");
                    overallSuccess = false;
                }
            }

            return overallSuccess;
        }

        public async Task<List<ExternalCandidate>> FetchCandidatesFromJobBoardsAsync(string jobId)
        {
            // Fetch candidates from the database
            // Real candidates will now only be inserted via the Webhooks endpoints (JobBoardWebhookController)
            return await _externalCandidateRepository.GetExternalCandidatesByJobIdAsync(jobId);
        }
    }
}
