using HRMSWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json; // Required for generic object deserialization

namespace HRMSWebAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration configuration;
        private readonly string _pythonApiBaseUrl; //"http://localhost:8000"; // Centralize the Python API URL

        public ChatController(IHttpClientFactory httpClientFactory, IConfiguration _configuration)
        {
            _httpClientFactory = httpClientFactory;
            configuration = _configuration;
            _pythonApiBaseUrl = configuration["FrontendSettings:APAPI"];
        }

        // --- ENDPOINT 1: For general text queries ---
        [HttpPost("query")]
        [Authorize]
        public async Task<IActionResult> GetBotReply([FromBody] ChatRequest request)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                string lowerPrompt = request.Query?.ToLower() ?? "";

                // Determine the correct Python endpoint based on keywords
                string endpoint;
                if (lowerPrompt.Contains("chart") || lowerPrompt.Contains("compare"))
                {
                    endpoint = $"{_pythonApiBaseUrl}/chart";
                }
                else if (lowerPrompt.Contains("reminder") || lowerPrompt.Contains("birthday"))
                {
                    endpoint = $"{_pythonApiBaseUrl}/reminder";
                }
                else if (lowerPrompt.Contains("letter") || lowerPrompt.Contains("generate"))
                {
                    endpoint = $"{_pythonApiBaseUrl}/letter";
                }
                else
                {
                    endpoint = $"{_pythonApiBaseUrl}/query";
                }

                Console.WriteLine($"🔁 Routing query to endpoint: {endpoint}");

                var payload = new { prompt = request.Query };
                var response = await httpClient.PostAsJsonAsync(endpoint, payload);

                return await ProcessPythonResponse(response);
            }
            catch (Exception ex)
            {
                return CreateErrorResponse("An unexpected error occurred in the query endpoint: " + ex.Message);
            }
        }

        // --- ENDPOINT 2: For letter form submissions ---
        [HttpPost("letter")]
        [Authorize]
        public async Task<IActionResult> HandleLetterRequest([FromBody] JsonElement details)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var endpoint = $"{_pythonApiBaseUrl}/letter";
                Console.WriteLine($"🔁 Routing letter details to endpoint: {endpoint}");

                var response = await httpClient.PostAsJsonAsync(endpoint, details);
                return await ProcessPythonResponse(response);
            }
            catch (Exception ex)
            {
                return CreateErrorResponse("An unexpected error occurred in the letter endpoint: " + ex.Message);
            }
        }

        // --- ENDPOINT 3: For reminder form submissions ---
        [HttpPost("reminder")]
        [Authorize]
        public async Task<IActionResult> HandleReminderRequest([FromBody] JsonElement details)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var endpoint = $"{_pythonApiBaseUrl}/reminder";
                Console.WriteLine($"🔁 Routing reminder details to endpoint: {endpoint}");

                var response = await httpClient.PostAsJsonAsync(endpoint, details);
                return await ProcessPythonResponse(response);
            }
            catch (Exception ex)
            {
                return CreateErrorResponse("An unexpected error occurred in the reminder endpoint: " + ex.Message);
            }
        }

        // --- HELPER METHODS ---

        private async Task<IActionResult> ProcessPythonResponse(HttpResponseMessage pythonResponse)
        {
            if (!pythonResponse.IsSuccessStatusCode)
            {
                return CreateErrorResponse($"LLM backend error: {pythonResponse.StatusCode}", (int)pythonResponse.StatusCode);
            }

            // Read the raw JSON content from Python as a string
            var jsonString = await pythonResponse.Content.ReadAsStringAsync();
            // Deserialize into a generic object to preserve the structure for the frontend
            var dataObject = JsonSerializer.Deserialize<object>(jsonString);

            var modelResponse = new ModelResponse
            {
                IsSuccess = true,
                Message = "Response received.",
                StatusCode = 200,
                Data = dataObject
            };

            return Ok(modelResponse);
        }

        private IActionResult CreateErrorResponse(string message, int statusCode = 500)
        {
            return Ok(new ModelResponse
            {
                IsSuccess = false,
                Message = message,
                StatusCode = statusCode
            });
        }
    }
}
