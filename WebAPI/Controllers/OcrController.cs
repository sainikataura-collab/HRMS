using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OcrController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public OcrController(
                IWebHostEnvironment env,
                IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }

        private async Task<(string fullText, List<string> lines, bool success, string message)> ExecuteOcrProcessAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return ("", new List<string>(), false, "Image file is required.");
            }

            string tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}");
            try
            {
                using (var stream = new FileStream(tempFile, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                //string scriptPath = Path.Combine(_env.ContentRootPath, "Scripts", "win_ocr.ps1");
                //if (!System.IO.File.Exists(scriptPath))
                //{
                //    scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts", "win_ocr.ps1");
                //}

                string configuredPath = _configuration["OcrSettings:ScriptPath"]
                    ?? throw new InvalidOperationException(
                        "OCR script path is not configured in appsettings.json."
                    );

                                string scriptPath = Path.IsPathRooted(configuredPath)
                                    ? configuredPath
                                    : Path.Combine(_env.ContentRootPath, configuredPath);

                                if (!System.IO.File.Exists(scriptPath))
                                {
                                    return ("", new List<string>(), false,
                                        $"OCR script not found at: {scriptPath}");
                                }

                var psi = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{scriptPath}\" -ImagePath \"{tempFile}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    StandardOutputEncoding = System.Text.Encoding.UTF8,
                    StandardErrorEncoding = System.Text.Encoding.UTF8,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = new Process { StartInfo = psi };
                process.Start();

                string output = await process.StandardOutput.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (string.IsNullOrWhiteSpace(output))
                {
                    return ("", new List<string>(), false, "Could not extract text from document.");
                }

                int jsonStart = output.IndexOf('{');
                int jsonEnd = output.LastIndexOf('}');
                if (jsonStart < 0 || jsonEnd <= jsonStart)
                {
                    return ("", new List<string>(), false, "Could not parse OCR response.");
                }

                string jsonStr = output.Substring(jsonStart, jsonEnd - jsonStart + 1);
                jsonStr = Regex.Replace(jsonStr, @"[\u0000-\u0008\u000B\u000C\u000E-\u001F]", " ");
                using var doc = JsonDocument.Parse(jsonStr);
                var root = doc.RootElement;

                if (!root.TryGetProperty("isSuccess", out var isSuccessProp) || !isSuccessProp.GetBoolean())
                {
                    return ("", new List<string>(), false, "Could not detect clear text details.");
                }

                string fullText = root.GetProperty("text").GetString() ?? "";
                var lines = new List<string>();
                if (root.TryGetProperty("lines", out var linesProp))
                {
                    foreach (var item in linesProp.EnumerateArray())
                    {
                        var s = item.GetString();
                        if (!string.IsNullOrWhiteSpace(s)) lines.Add(s.Trim());
                    }
                }

                return (fullText, lines, true, "");
            }
            catch (Exception ex)
            {
                return ("", new List<string>(), false, "OCR scanning error: " + ex.Message);
            }
            finally
            {
                try
                {
                    if (System.IO.File.Exists(tempFile))
                    {
                        System.IO.File.Delete(tempFile);
                    }
                }
                catch { }
            }
        }

        [HttpPost("scan-pan")]
        public async Task<IActionResult> ScanPan([FromForm] IFormFile file)
        {
            var (fullText, lines, success, error) = await ExecuteOcrProcessAsync(file);
            if (!success)
            {
                return Ok(new { isSuccess = false, message = error });
            }

            // 1. Cross-document checks
            if (Regex.IsMatch(fullText, @"AADHAAR|आधार|UNIQUE\s+IDENTIFICATION|UIDAI|MERA\s+AADHAAR", RegexOptions.IgnoreCase))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded an Aadhaar card instead of a PAN card." });
            }
            if (Regex.IsMatch(fullText, @"ELECTION\s+COMMISSION|ELECTOR\s+PHOTO|निर्वाचन|EPIC\s*NO", RegexOptions.IgnoreCase))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded a Voter ID card instead of a PAN card." });
            }

            // 2. Official Government Header Check
            bool hasOfficialHeader = Regex.IsMatch(fullText, @"INCOME\s*TAX|INCOMETAX|GOVT.*INDIA|PERMANENT\s*ACCOUNT|आयकर|भारत\s*सरकार|स्थायी\s*लेखा|संख्या\s*कार्ड", RegexOptions.IgnoreCase);
            if (!hasOfficialHeader)
            {
                return Ok(new
                {
                    isSuccess = false,
                    message = "Invalid document! The uploaded image is not a valid PAN Card. Please upload a clear photo of your PAN Card."
                });
            }

            // 3. Extract PAN Number
            string panNo = ExtractPanNumber(fullText, lines);

            // 4. DOB extraction
            string dob = "";
            var dobMatch = Regex.Match(fullText, @"\b([0-3]?[0-9])[\/\.\-]([0-1]?[0-9])[\/\.\-]((?:19|20)\d{2})\b");
            if (dobMatch.Success)
            {
                string dd = dobMatch.Groups[1].Value.PadLeft(2, '0');
                string mm = dobMatch.Groups[2].Value.PadLeft(2, '0');
                string yyyy = dobMatch.Groups[3].Value;
                if (IsValidDate(yyyy, mm, dd))
                {
                    dob = $"{yyyy}-{mm}-{dd}";
                }
            }
            if (string.IsNullOrEmpty(dob))
            {
                dob = TryDecodeDistortedDob(lines, fullText);
            }

            // 5. Name extraction
            string name = ExtractCandidateName(lines, panNo);

            bool hasValidPan = !string.IsNullOrEmpty(panNo) && Regex.IsMatch(panNo, @"^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$");
            if (!hasValidPan && string.IsNullOrEmpty(name))
            {
                return Ok(new
                {
                    isSuccess = false,
                    message = "Could not detect valid PAN details from the image. Please upload a clear image of your PAN card."
                });
            }

            return Ok(new
            {
                isSuccess = true,
                data = new
                {
                    panNo,
                    name,
                    dob,
                    rawText = fullText
                }
            });
        }

        [HttpPost("scan-aadhaar")]
        public async Task<IActionResult> ScanAadhaar([FromForm] IFormFile file, [FromForm] string? side = "front", [FromForm] string? expectedAadhaarNo = null)
        {
            var (fullText, lines, success, error) = await ExecuteOcrProcessAsync(file);
            if (!success)
            {
                return Ok(new { isSuccess = false, message = error });
            }

            // 1. Cross-document validation
            if (Regex.IsMatch(fullText, @"INCOME\s*TAX|PERMANENT\s*ACCOUNT|आयकर", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(fullText, @"\b[A-Z]{3}P[A-Z][0-9]{4}[A-Z]\b"))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded a PAN card instead of an Aadhaar card." });
            }

            if (Regex.IsMatch(fullText, @"ELECTION\s+COMMISSION|ELECTOR\s+PHOTO|निर्वाचन|EPIC\s*NO", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(fullText, @"\b[A-Z]{3}[0-9]{7}\b"))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded a Voter ID card instead of an Aadhaar card." });
            }

            string sideLower = (side ?? "front").ToLower().Trim();

            // 3. Extract Aadhaar Number (12 digits formatted as XXXX XXXX XXXX)
            string aadhaarNo = ExtractAadhaarNumber(fullText, lines);

            // Cross-check: If Back image is uploaded with expected Front Aadhaar, ensure they match!
            if (sideLower.Contains("back") && !string.IsNullOrWhiteSpace(expectedAadhaarNo))
            {
                string cleanExpected = Regex.Replace(expectedAadhaarNo, @"\D", "");
                if (cleanExpected.Length == 12)
                {
                    // 1. Full 12-digit number check if found on Back
                    if (!string.IsNullOrEmpty(aadhaarNo))
                    {
                        string cleanBack = Regex.Replace(aadhaarNo, @"\D", "");
                        if (cleanBack.Length == 12 && cleanExpected != cleanBack)
                        {
                            return Ok(new
                            {
                                isSuccess = false,
                                message = $"Front and Back Aadhaar cards do not match! Front Aadhaar is {expectedAadhaarNo}, but Back image belongs to another Aadhaar card ({aadhaarNo}). Please upload both sides of the same Aadhaar card."
                            });
                        }
                    }

                    // 2. Masked Aadhaar check on Back (e.g. XXXX XXXX 1234)
                    var maskedMatch = Regex.Match(fullText, @"(?:[Xx\*\.]{4}\s?){2}(\d{4})");
                    if (maskedMatch.Success)
                    {
                        string last4 = maskedMatch.Groups[1].Value;
                        if (cleanExpected.Substring(8, 4) != last4)
                        {
                            return Ok(new
                            {
                                isSuccess = false,
                                message = $"Front and Back Aadhaar cards do not match! Front ends in {cleanExpected.Substring(8, 4)}, but Back ends in {last4}. Please upload both sides of the same Aadhaar card."
                            });
                        }
                    }
                }
            }

            // 2. Official Aadhaar government header validation or valid Aadhaar markers
            bool hasAadhaarMarkers = Regex.IsMatch(fullText, @"GOVERNMENT\s+OF\s+INDIA|भारत\s*सरकार|UNIQUE\s+IDENTIFICATION|AUTHORITY\s+OF\s+INDIA|UIDAI|MERA\s+AADHAAR|मेरा\s*आधार|माझे\s*आधार|आधार|मेरी\s*पहचान|माझी\s*ओळख|ENROLMENT|HELP@UIDAI|1947|WWW\.UIDAI|P\.O\.\s*BOX|\bVID\b|Virtual\s*ID|Mobile\s*No", RegexOptions.IgnoreCase);

            bool isAadhaarDoc = !string.IsNullOrEmpty(aadhaarNo) || hasAadhaarMarkers;

            if (!isAadhaarDoc)
            {
                return Ok(new
                {
                    isSuccess = false,
                    message = "Invalid document! The uploaded image is not a valid Aadhaar Card. Please upload a clear photo of your Aadhaar Card."
                });
            }

            // 4. Extract Date of Birth
            string dob = ExtractAadhaarDob(fullText, lines);

            // 5. Extract Gender
            string gender = ExtractAadhaarGender(fullText);

            // 6. Extract Name
            string name = ExtractAadhaarName(fullText, lines, aadhaarNo);

            // 7. Extract Address & Pincode
            string address = ExtractAadhaarAddress(fullText, lines);
            string pincode = ExtractAadhaarPincode(address, fullText);

            if (sideLower.Contains("back"))
            {
                // Check if user accidentally uploaded Front page in Back slot
                bool isFrontCard = (!string.IsNullOrEmpty(dob) || !string.IsNullOrEmpty(gender)) &&
                                   string.IsNullOrEmpty(address) && string.IsNullOrEmpty(pincode);
                if (isFrontCard)
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Wrong side uploaded! You uploaded the Front page in the Back page slot. Please upload the Back page containing your Address."
                    });
                }

                if (string.IsNullOrEmpty(address) && string.IsNullOrEmpty(pincode))
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Could not detect address or PIN code from Aadhaar Back image. Please upload a clear image."
                    });
                }
            }
            else // FRONT SIDE
            {
                // Check if user accidentally uploaded Back page in Front slot!
                bool isBackCard = Regex.IsMatch(fullText, @"(?:Address|पत्ता|Addres)[:\s]", RegexOptions.IgnoreCase) &&
                                  (!string.IsNullOrEmpty(address) || !string.IsNullOrEmpty(pincode)) &&
                                  string.IsNullOrEmpty(dob) && string.IsNullOrEmpty(gender);
                if (isBackCard)
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Wrong side uploaded! You uploaded the Back page in the Front page slot. Please upload the Front page of your Aadhaar Card."
                    });
                }

                if (string.IsNullOrEmpty(aadhaarNo) && string.IsNullOrEmpty(name))
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Could not detect 12-digit Aadhaar number from image. Please upload a clear Aadhaar Front image."
                    });
                }
            }

            return Ok(new
            {
                isSuccess = true,
                data = new
                {
                    aadhaarNo,
                    name,
                    dob,
                    gender,
                    address,
                    pincode,
                    rawText = fullText
                }
            });
        }

        [HttpPost("scan-voter")]
        public async Task<IActionResult> ScanVoter([FromForm] IFormFile file, [FromForm] string? side = "front")
        {
            var (fullText, lines, success, error) = await ExecuteOcrProcessAsync(file);
            if (!success)
            {
                return Ok(new { isSuccess = false, message = error });
            }

            // 1. Cross-document validation
            if (Regex.IsMatch(fullText, @"INCOME\s*TAX|PERMANENT\s*ACCOUNT|आयकर", RegexOptions.IgnoreCase) ||
                Regex.IsMatch(fullText, @"\b[A-Z]{3}P[A-Z][0-9]{4}[A-Z]\b"))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded a PAN card instead of a Voter ID card." });
            }

            if (Regex.IsMatch(fullText, @"\b([2-9]\d{3})[\s\-\.]?(\d{4})[\s\-\.]?(\d{4})\b") &&
                Regex.IsMatch(fullText, @"AADHAAR|आधार|UNIQUE\s+IDENTIFICATION|UIDAI|MERA\s+AADHAAR|मेरी\s*पहचान", RegexOptions.IgnoreCase))
            {
                return Ok(new { isSuccess = false, message = "Wrong document! You uploaded an Aadhaar card instead of a Voter ID card." });
            }

            // 2. Official Voter ID markers check
            bool hasVoterMarkers = Regex.IsMatch(fullText, @"ELECTION\s+COMMISSION|ELECTOR\s+PHOTO|IDENTITY\s+CARD|निर्वाचन\s*आयोग|पहचान\s*पत्र|EPIC|ELECTORAL|मतदाता|BHARAT\s+NIRVACHAN", RegexOptions.IgnoreCase) ||
                                   Regex.IsMatch(fullText, @"\b[A-Z]{3}[0-9]{7}\b");

            if (!hasVoterMarkers)
            {
                return Ok(new
                {
                    isSuccess = false,
                    message = "Invalid document! The uploaded image is not a valid Voter ID Card. Please upload a clear photo of your Voter ID Card."
                });
            }

            string sideLower = (side ?? "front").ToLower().Trim();

            // 3. Extract Voter / EPIC Number
            string voterNo = ExtractVoterNumber(fullText, lines);

            // 4. Extract Date of Birth
            string dob = ExtractVoterDob(fullText, lines);

            // 5. Extract Gender
            string gender = ExtractVoterGender(fullText);

            // 6. Extract Candidate Name
            string name = ExtractVoterName(fullText, lines, voterNo);

            // 7. Extract Address & Pincode
            string address = ExtractVoterAddress(fullText, lines);
            string pincode = ExtractAadhaarPincode(address, fullText);

            if (sideLower.Contains("back"))
            {
                if (string.IsNullOrEmpty(address) && string.IsNullOrEmpty(pincode))
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Could not detect address or PIN code from Voter ID Back image. Please upload a clear image."
                    });
                }
            }
            else
            {
                if (string.IsNullOrEmpty(voterNo) && string.IsNullOrEmpty(name))
                {
                    return Ok(new
                    {
                        isSuccess = false,
                        message = "Could not detect Voter ID Number or Name from image. Please upload a clear Voter ID Front image."
                    });
                }
            }

            return Ok(new
            {
                isSuccess = true,
                data = new
                {
                    voterNo,
                    name,
                    dob,
                    gender,
                    address,
                    pincode,
                    rawText = fullText
                }
            });
        }

        private static string TryDecodeDistortedDob(List<string> lines, string fullText)
        {
            // 1. Standard regex across fullText (handles slash, hyphen, dot, space separators)
            var dobMatch = Regex.Match(fullText, @"\b([0-3]?[0-9])[\/\.\-\s]([0-1]?[0-9])[\/\.\-\s]((?:19|20)\d{2})\b");
            if (dobMatch.Success)
            {
                string dd = dobMatch.Groups[1].Value.PadLeft(2, '0');
                string mm = dobMatch.Groups[2].Value.PadLeft(2, '0');
                string yyyy = dobMatch.Groups[3].Value;
                if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
            }

            // 2. Scan lines with flexible separators (including missing separator, quotes, dots, slashes)
            foreach (var line in lines)
            {
                // Pattern like 1207/2006, 12/07/2006, 12'072006, 12107/2006, 05/08/2003
                var m = Regex.Match(line, @"\b([0-3]?[0-9])[\/\.\-\s'lI,]?([0-1]?[0-9])[\/\.\-\s'lI,]?((?:19|20)\d{2})\b");
                if (m.Success)
                {
                    string dd = m.Groups[1].Value.PadLeft(2, '0');
                    string mm = m.Groups[2].Value.PadLeft(2, '0');
                    string yyyy = m.Groups[3].Value;
                    if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
                }

                // Distorted month patterns like 05/0V2003 or 05/080003
                var vMatch = Regex.Match(line, @"([0-3]?[0-9OSos])[\,\.\/\-\s\']*(W|0?V|ov|0?B|ob|08|[0-1]?[0-9])[\,\.\/\-\s\']*([12][90]\d{2}|[0-9]{4})");
                if (vMatch.Success)
                {
                    string rawDay = vMatch.Groups[1].Value.ToUpper().Replace("O", "0").Replace("S", "5");
                    string dd = rawDay.PadLeft(2, '0');
                    string rawM = vMatch.Groups[2].Value.ToUpper();
                    string mm = (rawM == "W" || rawM == "OV" || rawM == "0V" || rawM == "V" || rawM == "OB" || rawM == "0B" || rawM == "B") ? "08" : rawM.PadLeft(2, '0');
                    string rawYr = vMatch.Groups[3].Value;
                    if (rawYr.StartsWith("00")) rawYr = "20" + rawYr.Substring(2);
                    else if (rawYr.StartsWith("0")) rawYr = "2" + rawYr.Substring(1);
                    string yyyy = CleanYear(rawYr);
                    if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
                }
            }

            // 3. Line by line distorted date checking
            foreach (var line in lines)
            {
                // Normalize patterns like 2.404 into 24/04
                string normLine = Regex.Replace(line, @"([1-3])\.(\d)(0[1-9]|1[0-2])", "$1$2/$3");
                var dotMatch = Regex.Match(normLine, @"([0-3]?[0-9])[\.\/\-\s]([0-1]?[0-9])(?:[\.\/\-\s'’]*([2Zz][0Oo][0-9Oo][0-9A-Za-zå\u00E5]))?");
                if (dotMatch.Success)
                {
                    string rawD = dotMatch.Groups[1].Value.Replace(".", "");
                    string rawM = dotMatch.Groups[2].Value.Replace(".", "");
                    string dd = rawD.PadLeft(2, '0');
                    string mm = rawM.PadLeft(2, '0');
                    string yyyy = "";

                    if (dotMatch.Groups[3].Success && !string.IsNullOrWhiteSpace(dotMatch.Groups[3].Value))
                    {
                        yyyy = CleanYear(dotMatch.Groups[3].Value);
                    }
                    else
                    {
                        var yrMatch = Regex.Match(fullText, @"\b((?:19|20)\d{2})\b");
                        if (yrMatch.Success) yyyy = yrMatch.Groups[1].Value;
                    }

                    if (!string.IsNullOrEmpty(yyyy) && IsValidDate(yyyy, mm, dd))
                    {
                        return $"{yyyy}-{mm}-{dd}";
                    }
                }

                // Generic 8-character continuous date (e.g. 12072006 or 05082003)
                var clean = Regex.Replace(line.ToUpper(), @"[^0-9OISBLZ]", "");
                clean = NormalizeOcrDigits(clean);
                if (clean.Length == 8)
                {
                    string dd = clean.Substring(0, 2);
                    string mm = clean.Substring(2, 2);
                    string yyyy = clean.Substring(4, 4);
                    if (IsValidDate(yyyy, mm, dd))
                    {
                        return $"{yyyy}-{mm}-{dd}";
                    }
                }
            }
            return "";
        }

        private static string CleanYear(string raw)
        {
            char[] chars = raw.ToCharArray();
            for (int i = 0; i < chars.Length; i++)
            {
                if (chars[i] == 'Z' || chars[i] == 'z') chars[i] = '2';
                else if (chars[i] == 'O' || chars[i] == 'o' || chars[i] == 'Ø') chars[i] = '0';
                else if (chars[i] == 's' || chars[i] == 'S' || chars[i] == 'å' || chars[i] == '\u00E5' || chars[i] == 'a') chars[i] = '5';
                else if (chars[i] == 'I' || chars[i] == 'l' || chars[i] == '|') chars[i] = '1';
                else if (chars[i] == 'B') chars[i] = '8';
            }
            string yr = new string(chars);
            if (yr.Length < 4) yr = yr.PadLeft(4, '2');
            return yr;
        }

        private static bool IsValidDate(string yyyy, string mm, string dd)
        {
            if (int.TryParse(yyyy, out int y) && int.TryParse(mm, out int m) && int.TryParse(dd, out int d))
            {
                int maxYear = DateTime.Now.Year;
                if (y >= 1920 && y <= maxYear && m >= 1 && m <= 12 && d >= 1 && d <= 31)
                {
                    return DateTime.TryParse($"{yyyy}-{mm.PadLeft(2, '0')}-{dd.PadLeft(2, '0')}", out _);
                }
            }
            return false;
        }

        private static string ExtractPanNumber(string fullText, List<string> lines)
        {
            // 1. Direct standard regex match for Person PAN (4th char 'P')
            var panMatch = Regex.Match(fullText.ToUpper(), @"\b([A-Z]{3}P[A-Z][0-9]{4}[A-Z])\b");
            if (panMatch.Success)
            {
                return panMatch.Groups[1].Value;
            }

            foreach (var line in lines)
            {
                var clean = Regex.Replace(line.ToUpper(), @"[^A-Z0-9]", "");
                if (clean.Length == 10 && Regex.IsMatch(clean, @"^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$"))
                {
                    return clean;
                }
            }

            // 2. Fuzzy PAN search with character confusion normalization
            // (e.g. OCR misreading 'O' as '0' in positions 0-4 or '0' as 'O' in positions 5-8)
            var candidates = new List<string>();

            foreach (var line in lines)
            {
                var words = Regex.Split(line.ToUpper(), @"[^A-Z0-9]+");
                foreach (var w in words)
                {
                    if (w.Length == 10) candidates.Add(w);
                }

                var clean = Regex.Replace(line.ToUpper(), @"[^A-Z0-9]", "");
                if (clean.Length == 10)
                {
                    candidates.Add(clean);
                }
                else if (clean.Length > 10)
                {
                    for (int i = 0; i <= clean.Length - 10; i++)
                    {
                        candidates.Add(clean.Substring(i, 10));
                    }
                }
            }

            var tokens = Regex.Matches(fullText.ToUpper(), @"[A-Z0-9]{10}");
            foreach (Match m in tokens)
            {
                candidates.Add(m.Value);
            }

            foreach (var c in candidates.Distinct())
            {
                string normalized = TryNormalizePan(c);
                if (!string.IsNullOrEmpty(normalized))
                {
                    return normalized;
                }
            }

            return "";
        }

        private static string TryNormalizePan(string token)
        {
            if (string.IsNullOrWhiteSpace(token) || token.Length != 10) return "";
            char[] chars = token.ToUpper().ToCharArray();

            // First 5 characters MUST be alphabetic
            for (int i = 0; i < 5; i++)
            {
                if (char.IsLetter(chars[i])) continue;
                if (chars[i] == '0') chars[i] = 'O';
                else if (chars[i] == '1') chars[i] = 'I';
                else if (chars[i] == '8') chars[i] = 'B';
                else if (chars[i] == '5') chars[i] = 'S';
                else if (chars[i] == '2') chars[i] = 'Z';
                else if (chars[i] == '6') chars[i] = 'G';
                else return "";
            }

            // In HRMS candidate onboarding, the PAN MUST be for an individual Person ('P')
            if (chars[3] != 'P')
            {
                return "";
            }

            // Next 4 characters (index 5 to 8) MUST be digits
            for (int i = 5; i < 9; i++)
            {
                if (char.IsDigit(chars[i])) continue;
                if (chars[i] == 'O' || chars[i] == 'D' || chars[i] == 'Q') chars[i] = '0';
                else if (chars[i] == 'I' || chars[i] == 'L' || chars[i] == 'T') chars[i] = '1';
                else if (chars[i] == 'Z') chars[i] = '2';
                else if (chars[i] == 'S') chars[i] = '5';
                else if (chars[i] == 'B') chars[i] = '8';
                else if (chars[i] == 'G') chars[i] = '6';
                else return "";
            }

            // Last character (index 9) MUST be alphabetic
            if (!char.IsLetter(chars[9]))
            {
                if (chars[9] == '0') chars[9] = 'O';
                else if (chars[9] == '1') chars[9] = 'I';
                else if (chars[9] == '8') chars[9] = 'B';
                else if (chars[9] == '5') chars[9] = 'S';
                else if (chars[9] == '2') chars[9] = 'Z';
                else return "";
            }

            string res = new string(chars);
            if (Regex.IsMatch(res, @"^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$"))
            {
                return res;
            }
            return "";
        }

        private static string ExtractCandidateName(List<string> lines, string panNo)
        {
            var badWords = new Regex(@"INCOME|TAX|DEPARTMENT|GOVT|INDIA|PERMANENT|ACCOUNT|NUMBER|CARD|SIGNATURE|FATHER|DATE|BIRTH|DOB|PHOTO|DIGITALLY|SIGNED|HOLDER|भारत|सरकार|आयकर|विभाग|FAMES|GOVR|GOWN|FARER|FARERS|FARRER|FATTER|PEER|BARTH|BATH|WRTH|TINME|NURG|FATES|FETES|FEES|FEDS|FCHS|FUHS|KAMT|KARR|NATT|NATR|NARNE|NURT|NERE|SWUTUTE|SIWUTUTE|SIGNATUTE|SIGNATUCE|SWUIUTE|AFTERNOON|WELCOME|DASHBOARD|ADMIN|SETTING|EMPLOYEE|ATTENDANCE|PAYROLL|RECRUITMENT|PERFORMANCE|BILLING|VENDOR|VISITOR|SUNDAY|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|OCTOBER|NOVEMBER|DECEMBER|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|LOGIN|SIGNIN|SIGN\s*IN|PASSWORD|CREDENTIAL|LOGISTICS|TRANSPORT|EMPOWER|PORTAL|SYSTEM|COMPANY\s*CODE|ROTATE|LEFT|RIGHT|ORIENTATION|MODAL|CLOSE|PREVIEW|IMAGE|UPLOAD|RESET|VIEW", RegexOptions.IgnoreCase);
            var fatherRegex = new Regex(@"FATHER|पिता|FAMES|FARER|FARERS|FARRER|FATTER|PEER|FATES|FETES|FEES|FEDS|FCHS|FUHS", RegexOptions.IgnoreCase);
            var nameLabelRegex = new Regex(@"\b(?:Name|नाम|tlome|uatne|nearne|iname|tinme)\b", RegexOptions.IgnoreCase);

            char surnameChar = (panNo.Length == 10 && panNo[3] == 'P') ? panNo[4] : ' ';

            // 1. Collect full father names and father first names
            var fatherFullNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var fatherFirstNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var fatherLineIndices = new HashSet<int>();

            for (int i = 0; i < lines.Count; i++)
            {
                if (fatherRegex.IsMatch(lines[i]))
                {
                    fatherLineIndices.Add(i);
                    if (i + 1 < lines.Count)
                    {
                        fatherLineIndices.Add(i + 1);
                        string cleanedFather = CleanName(lines[i + 1]);
                        if (!string.IsNullOrWhiteSpace(cleanedFather))
                        {
                            fatherFullNames.Add(cleanedFather);
                            var parts = cleanedFather.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                            if (parts.Length > 0 && parts[0].Length >= 3)
                            {
                                fatherFirstNames.Add(parts[0]);
                            }
                        }
                    }
                }
            }

            bool IsFatherName(string cand)
            {
                if (string.IsNullOrWhiteSpace(cand)) return true;
                if (fatherFullNames.Contains(cand)) return true;
                var parts = cand.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length > 0 && fatherFirstNames.Contains(parts[0]))
                {
                    if (parts.Length == 1) return true;
                    if (fatherFullNames.Any(f => f.Equals(cand, StringComparison.OrdinalIgnoreCase))) return true;
                }
                return false;
            }

            // Tier 1: Lines directly between Name label and Father label
            var tier1 = new List<string>();
            for (int i = 0; i < lines.Count; i++)
            {
                if (nameLabelRegex.IsMatch(lines[i]) && !fatherRegex.IsMatch(lines[i]))
                {
                    string inline = CleanName(lines[i]);
                    if (IsValidName(inline, badWords, panNo) && !IsFatherName(inline)) tier1.Add(inline);

                    if (i + 1 < lines.Count && !fatherLineIndices.Contains(i + 1))
                    {
                        string next = CleanName(lines[i + 1]);
                        if (IsValidName(next, badWords, panNo) && !fatherRegex.IsMatch(next) && !IsFatherName(next))
                        {
                            tier1.Add(next);
                        }
                    }
                }
            }

            // Tier 2: Lines immediately BEFORE Father's label
            var tier2 = new List<string>();
            for (int i = 0; i < lines.Count; i++)
            {
                if (fatherRegex.IsMatch(lines[i]) && i > 0 && !fatherLineIndices.Contains(i - 1))
                {
                    string prev = CleanName(lines[i - 1]);
                    if (IsValidName(prev, badWords, panNo) && !IsFatherName(prev))
                    {
                        tier2.Add(prev);
                    }
                }
            }

            // Tier 3: All other valid lines (excluding father lines)
            var tier3 = new List<string>();
            for (int i = 0; i < lines.Count; i++)
            {
                if (fatherLineIndices.Contains(i)) continue;
                string c = CleanName(lines[i]);
                if (IsValidName(c, badWords, panNo) && !IsFatherName(c) && !tier1.Contains(c) && !tier2.Contains(c))
                {
                    tier3.Add(c);
                }
            }

            // Helper to check if any word/initial in candidate name matches PAN 5th char
            bool MatchesSurnameInitial(string name)
            {
                if (surnameChar == ' ') return false;
                var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                return parts.Any(p => p.StartsWith(surnameChar.ToString(), StringComparison.OrdinalIgnoreCase));
            }

            // Prioritize Tier 1 (explicit Name label)
            var t1Match = tier1.FirstOrDefault(MatchesSurnameInitial);
            if (t1Match != null) return t1Match;
            if (tier1.Count > 0) return tier1.First();

            // Prioritize Tier 2 (line right before Father label)
            var t2Match = tier2.FirstOrDefault(MatchesSurnameInitial);
            if (t2Match != null) return t2Match;
            if (tier2.Count > 0) return tier2.First();

            // Prioritize Tier 3 with surname match
            var t3Match = tier3.FirstOrDefault(MatchesSurnameInitial);
            if (t3Match != null) return t3Match;

            // Fallback: pick longest candidate in Tier 3
            return tier3.OrderByDescending(c => c.Length).FirstOrDefault() ?? "";
        }

        private static string CleanName(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return "";

            // 1. Strip leading labels like "Name /", "नाम :", "Name:", etc.
            string cleaned = Regex.Replace(raw, @"^.*?(?:Name|नाम|tlome|uatne|nearne|iname|tinme)\s*[\/:\-\.]*", "", RegexOptions.IgnoreCase);

            // 2. Generic OCR character confusion (digits misread as letters inside words)
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])0(?=[A-Za-z])", "O");
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])[1\|](?=[A-Za-z])", "I");
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])5(?=[A-Za-z])", "S");
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])8(?=[A-Za-z])", "B");
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])2(?=[A-Za-z])", "Z");

            // Common digit-at-start OCR misreads (e.g. '3' or '8' for 'S', '0' for 'O', '1' for 'I')
            cleaned = Regex.Replace(cleaned, @"\b[358](?=[A-Za-z]{2,})", "S");
            cleaned = Regex.Replace(cleaned, @"\b[0](?=[A-Za-z]{2,})", "O");
            cleaned = Regex.Replace(cleaned, @"\b[1\|](?=[A-Za-z]{2,})", "I");

            // 3. Remove hyphens or dots inside connected words (e.g. MANGAL-DEEP -> MANGALDEEP)
            cleaned = Regex.Replace(cleaned, @"(?<=[A-Za-z])[\-\.](?=[A-Za-z])", "");

            // 4. Strip leading non-letters, bullets, and symbols
            cleaned = Regex.Replace(cleaned, @"^[^A-Za-z]+", "");
            cleaned = Regex.Replace(cleaned, @"^[Iil1|]\s+", "");

            // 5. Replace any remaining non-letter characters with space and normalize whitespace
            cleaned = Regex.Replace(cleaned, @"[^A-Za-z\s]", " ");
            cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim().ToUpper();

            return cleaned;
        }

        private static bool IsValidName(string str, Regex badWords, string panNo)
        {
            if (string.IsNullOrWhiteSpace(str)) return false;
            if (str.Length < 3 || str.Length > 40) return false;
            if (badWords.IsMatch(str)) return false;
            if (!string.IsNullOrEmpty(panNo))
            {
                string strippedPan = panNo.Replace(" ", "").ToUpper();
                string strippedStr = str.Replace(" ", "").ToUpper();
                string panPrefix = strippedPan.Length >= 5 ? strippedPan.Substring(0, 5) : strippedPan;
                if (strippedStr.Contains(strippedPan) || strippedPan.Contains(strippedStr) || strippedStr.Contains(panPrefix))
                {
                    return false;
                }
            }

            var words = str.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length == 0 || words.Length > 4) return false;
            if (words.All(w => w.Length < 2)) return false;

            // If 2 words and one is a single-letter initial (e.g. "SABITHA K" or "K SABITHA"):
            // require the other word to have at least 3 letters and contain a vowel.
            if (words.Length == 2 && (words[0].Length <= 1 || words[1].Length <= 1))
            {
                var longWord = words[0].Length > 1 ? words[0] : words[1];
                if (longWord.Length < 3 || !Regex.IsMatch(longWord, @"[AEIOUY]")) return false;
            }

            if (!Regex.IsMatch(str, @"[AEIOUY]")) return false;

            // Filter single-word OCR artifacts with excessive vowel ratio (e.g. OSAOAOT)
            if (words.Length == 1 && str.Length > 4 && str.Count(ch => "AEIOUY".Contains(ch)) >= (str.Length * 0.65))
            {
                return false;
            }

            return true;
        }

        // =====================================================================
        //                      AADHAAR EXTRACTION HELPERS
        // =====================================================================

        private static string ExtractAadhaarNumber(string fullText, List<string> lines)
        {
            // 1. Direct standard regex: 1234 5678 9012 or 1234-5678-9012
            var match = Regex.Match(fullText, @"\b([2-9]\d{3})[\s\-\.]?(\d{4})[\s\-\.]?(\d{4})\b");
            if (match.Success)
            {
                string a = match.Groups[1].Value;
                string b = match.Groups[2].Value;
                string c = match.Groups[3].Value;
                if (!IsAllSameDigit(a + b + c))
                {
                    return $"{a} {b} {c}";
                }
            }

            // 2. Scan lines with OCR digit normalizations (e.g. 'O' -> '0', 'I'/'l' -> '1', 'S' -> '5')
            foreach (var line in lines)
            {
                var clean = Regex.Replace(line.ToUpper(), @"[^0-9OISBLZ]", "");
                clean = NormalizeOcrDigits(clean);
                var m = Regex.Match(clean, @"\b([2-9]\d{3})(\d{4})(\d{4})\b");
                if (m.Success && !IsAllSameDigit(m.Value))
                {
                    return $"{m.Groups[1].Value} {m.Groups[2].Value} {m.Groups[3].Value}";
                }
            }

            return "";
        }

        private static bool IsAllSameDigit(string s)
        {
            if (string.IsNullOrEmpty(s)) return true;
            return s.All(ch => ch == s[0]);
        }

        private static string NormalizeOcrDigits(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            char[] chars = s.ToCharArray();
            for (int i = 0; i < chars.Length; i++)
            {
                if (chars[i] == 'O' || chars[i] == 'o') chars[i] = '0';
                else if (chars[i] == 'I' || chars[i] == 'l' || chars[i] == '|') chars[i] = '1';
                else if (chars[i] == 'S' || chars[i] == 's') chars[i] = '5';
                else if (chars[i] == 'B') chars[i] = '8';
                else if (chars[i] == 'Z' || chars[i] == 'z') chars[i] = '2';
            }
            return new string(chars);
        }

        private static string ExtractAadhaarDob(string fullText, List<string> lines)
        {
            // 1. Explicit label (DOB / Date of Birth / जन्म तारीख / जन्म वर्ष)
            var dobMatch = Regex.Match(fullText, @"(?:DOB|BIRTH|YEAR\s+OF\s+BIRTH|जन्म\s*तारीख|जन्म\s*वर्ष|तारीख|तिथि|YOB)[\s\S]{0,15}?([0-3]?[0-9])\s*[\/\.\-]\s*([0-1]?[0-9])\s*[\/\.\-]\s*((?:19|20)\d{2})", RegexOptions.IgnoreCase);
            if (dobMatch.Success)
            {
                string dd = dobMatch.Groups[1].Value.PadLeft(2, '0');
                string mm = dobMatch.Groups[2].Value.PadLeft(2, '0');
                string yyyy = dobMatch.Groups[3].Value;
                if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
            }

            // Line by line explicit DOB search
            foreach (var line in lines)
            {
                if (Regex.IsMatch(line, @"(?:DOB|BIRTH|जन्म|तारीख)", RegexOptions.IgnoreCase))
                {
                    var m = Regex.Match(line, @"([0-3]?[0-9])\s*[\/\.\-]\s*([0-1]?[0-9])\s*[\/\.\-]\s*((?:19|20)\d{2})");
                    if (m.Success)
                    {
                        string dd = m.Groups[1].Value.PadLeft(2, '0');
                        string mm = m.Groups[2].Value.PadLeft(2, '0');
                        string yyyy = m.Groups[3].Value;
                        if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
                    }
                }
            }

            // 2. Year only (Year of Birth: YYYY)
            var yobMatch = Regex.Match(fullText, @"(?:YEAR\s+OF\s+BIRTH|जन्म\s*वर्ष)[:\s]*((?:19|20)\d{2})", RegexOptions.IgnoreCase);
            if (yobMatch.Success)
            {
                string yyyy = yobMatch.Groups[1].Value;
                if (int.TryParse(yyyy, out int y) && y >= 1920 && y <= DateTime.Now.Year)
                {
                    return $"{yyyy}-01-01";
                }
            }

            // 3. Generic Date in lines (avoiding issue date or details as on)
            foreach (var line in lines)
            {
                if (Regex.IsMatch(line, @"(?:issue|issued|as\s+on|details)", RegexOptions.IgnoreCase)) continue;

                var genMatch = Regex.Match(line, @"\b([0-3]?[0-9])\s*[\/\.\-]\s*([0-1]?[0-9])\s*[\/\.\-]\s*((?:19|20)\d{2})\b");
                if (genMatch.Success)
                {
                    string dd = genMatch.Groups[1].Value.PadLeft(2, '0');
                    string mm = genMatch.Groups[2].Value.PadLeft(2, '0');
                    string yyyy = genMatch.Groups[3].Value;
                    if (IsValidDate(yyyy, mm, dd)) return $"{yyyy}-{mm}-{dd}";
                }
            }

            return "";
        }

        private static string ExtractAadhaarGender(string fullText)
        {
            if (Regex.IsMatch(fullText, @"\bFEMALE\b|महिला", RegexOptions.IgnoreCase)) return "FEMALE";
            if (Regex.IsMatch(fullText, @"\bMALE\b|पुरुष", RegexOptions.IgnoreCase)) return "MALE";
            if (Regex.IsMatch(fullText, @"TRANSGENDER", RegexOptions.IgnoreCase)) return "TRANSGENDER";
            return "";
        }

        private static string ExtractAadhaarName(string fullText, List<string> lines, string aadhaarNo)
        {
            var badWords = new Regex(@"GOVERNMENT|INDIA|BHARAT|SARKAR|UNIQUE|IDENTIFICATION|AUTHORITY|UIDAI|AADHAAR|आधार|DOB|DATE|BIRTH|YEAR|MALE|FEMALE|TRANSGENDER|पुरुष|महिला|HELP|ENROLMENT|ENROLLMENT|WWW|DOWNLOAD|ISSUE|VID|FATHER|HUSBAND|ADDRESS|पता|MOBILE|DETAILS", RegexOptions.IgnoreCase);

            int govIdx = -1;
            int dobIdx = -1;
            int genderIdx = -1;

            for (int i = 0; i < lines.Count; i++)
            {
                var l = lines[i];
                if (Regex.IsMatch(l, @"GOVERNMENT\s+OF\s+INDIA|भारत\s*सरकार|UNIQUE\s+IDENTIFICATION", RegexOptions.IgnoreCase))
                {
                    govIdx = Math.Max(govIdx, i);
                }
                if (dobIdx < 0 && Regex.IsMatch(l, @"DOB|BIRTH|YEAR\s+OF\s+BIRTH|जन्म", RegexOptions.IgnoreCase))
                {
                    dobIdx = i;
                }
                if (genderIdx < 0 && Regex.IsMatch(l, @"\b(MALE|FEMALE|पुरुष|महिला)\b", RegexOptions.IgnoreCase))
                {
                    genderIdx = i;
                }
            }

            int endIdx = dobIdx > 0 ? dobIdx : (genderIdx > 0 ? genderIdx : lines.Count);
            int startIdx = govIdx >= 0 ? govIdx + 1 : 0;

            var candidates = new List<string>();
            for (int i = startIdx; i < endIdx; i++)
            {
                string line = lines[i];
                string c = CleanName(line);
                if (IsValidName(c, badWords, ""))
                {
                    candidates.Add(c);
                }
            }

            // On Aadhaar cards with local script + English name:
            // The English candidate name typically has 2 or more words (First Name + Father/Last Name)
            var multiWord = candidates.Where(c => c.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length >= 2).ToList();
            if (multiWord.Count > 0)
            {
                return multiWord.Last();
            }

            if (candidates.Count > 0)
            {
                return candidates.Last();
            }

            // Fallback: check all non-header lines
            var allMultiWord = new List<string>();
            for (int i = 0; i < lines.Count; i++)
            {
                string c = CleanName(lines[i]);
                if (IsValidName(c, badWords, ""))
                {
                    if (c.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length >= 2)
                    {
                        allMultiWord.Add(c);
                    }
                    else
                    {
                        candidates.Add(c);
                    }
                }
            }

            if (allMultiWord.Count > 0) return allMultiWord.First();
            if (candidates.Count > 0) return candidates.First();

            return "";
        }

        private static string ExtractAadhaarAddress(string fullText, List<string> lines)
        {
            // 1. Explicit Address label
            var addrMatch = Regex.Match(fullText, @"(?:Address|पता|Addres)[:\s]*([\s\S]+?)(?=\b[1-9][0-9]{5}\b|$)", RegexOptions.IgnoreCase);
            if (addrMatch.Success && addrMatch.Groups[1].Value.Length > 10)
            {
                string raw = addrMatch.Groups[1].Value;
                raw = Regex.Replace(raw, @"[\r\n]+", ", ");
                raw = Regex.Replace(raw, @"\s{2,}", " ");
                raw = raw.Trim(' ', ',', '-');
                var pin = Regex.Match(fullText, @"\b[1-9][0-9]{5}\b");
                if (pin.Success && !raw.Contains(pin.Value))
                {
                    raw += $", {pin.Value}";
                }
                return raw;
            }

            // 2. Search lines around PIN code
            int pinLineIdx = -1;
            for (int i = 0; i < lines.Count; i++)
            {
                var pm = Regex.Match(lines[i], @"\b([1-9][0-9]{5})\b");
                if (pm.Success)
                {
                    pinLineIdx = i;
                    break;
                }
            }

            if (pinLineIdx >= 0)
            {
                int start = Math.Max(0, pinLineIdx - 3);
                var addrLines = lines.Skip(start).Take(pinLineIdx - start + 1)
                                     .Where(l => !Regex.IsMatch(l, @"UIDAI|WWW|1947|HELP|GOVERNMENT|UNIQUE", RegexOptions.IgnoreCase))
                                     .Select(l => l.Trim())
                                     .ToList();
                if (addrLines.Count > 0)
                {
                    string addr = string.Join(", ", addrLines);
                    addr = Regex.Replace(addr, @"^.*?(?:Address|पता|Addres)[:\s]*", "", RegexOptions.IgnoreCase);
                    return addr.Trim(' ', ',');
                }
            }

            return "";
        }

        private static string ExtractAadhaarPincode(string address, string fullText)
        {
            var match = Regex.Match(address, @"\b([1-9][0-9]{5})\b");
            if (match.Success) return match.Groups[1].Value;

            match = Regex.Match(fullText, @"\b([1-9][0-9]{5})\b");
            if (match.Success) return match.Groups[1].Value;

            return "";
        }

        // =====================================================================
        //                      VOTER ID EXTRACTION HELPERS
        // =====================================================================

        private static string ExtractVoterNumber(string fullText, List<string> lines)
        {
            // 1. Direct standard EPIC regex: 3 letters + 7 digits (e.g. ABC1234567, WBF1234567)
            var match = Regex.Match(fullText, @"\b([A-Z]{3})[\s\-\.]*([0-9]{7})\b");
            if (match.Success)
            {
                return $"{match.Groups[1].Value}{match.Groups[2].Value}";
            }

            // 2. Scan lines with character substitution for 10-char alphanumeric tokens
            foreach (var line in lines)
            {
                var words = line.ToUpper().Split(new[] { ' ', '\t', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var w in words)
                {
                    var clean = Regex.Replace(w, @"[^A-Z0-9]", "");
                    if (clean.Length == 10)
                    {
                        var chars = clean.ToCharArray();
                        // First 3 chars: digits to letters
                        for (int i = 0; i < 3; i++)
                        {
                            if (chars[i] == '0') chars[i] = 'O';
                            else if (chars[i] == '1') chars[i] = 'I';
                            else if (chars[i] == '5') chars[i] = 'S';
                            else if (chars[i] == '8') chars[i] = 'B';
                            else if (chars[i] == '2') chars[i] = 'Z';
                        }
                        // Next 7 chars: letters to digits
                        for (int i = 3; i < 10; i++)
                        {
                            if (chars[i] == 'O' || chars[i] == 'o') chars[i] = '0';
                            else if (chars[i] == 'I' || chars[i] == 'l' || chars[i] == 'L' || chars[i] == '|') chars[i] = '1';
                            else if (chars[i] == 'S' || chars[i] == 's') chars[i] = '5';
                            else if (chars[i] == 'B') chars[i] = '8';
                            else if (chars[i] == 'Z' || chars[i] == 'z') chars[i] = '2';
                        }
                        string candidate = new string(chars);
                        if (Regex.IsMatch(candidate, @"^[A-Z]{3}[0-9]{7}$"))
                        {
                            return candidate;
                        }
                    }
                }
            }

            // 3. Alternate legacy Voter ID formats (e.g., 2-4 letters + 6-8 digits, or slash separated like RJ/01/023/123456)
            var altMatch = Regex.Match(fullText, @"\b([A-Z]{2,4}[0-9]{6,8})\b|\b([A-Z]{2,3}\/[0-9]{2}\/[0-9]{2,3}\/[0-9]{4,6})\b");
            if (altMatch.Success)
            {
                return altMatch.Value;
            }

            return "";
        }

        private static string ExtractVoterDob(string fullText, List<string> lines)
        {
            int currentYear = DateTime.Now.Year;
            int maxBirthYear = Math.Min(2010, currentYear - 18);

            // 1. Explicit DOB label (DOB / Date of Birth / जन्म तारीख / जन्म तिथि)
            var dobMatch = Regex.Match(fullText, @"(?:DOB|BIRTH|जन्म\s*तारीख|जन्म\s*तिथि)[:\s]*([0-3]?[0-9])[\/\.\-]([0-1]?[0-9])[\/\.\-]((?:19|20)\d{2})", RegexOptions.IgnoreCase);
            if (dobMatch.Success)
            {
                string dd = dobMatch.Groups[1].Value.PadLeft(2, '0');
                string mm = dobMatch.Groups[2].Value.PadLeft(2, '0');
                string yyyy = dobMatch.Groups[3].Value;
                if (IsValidDate(yyyy, mm, dd) && int.Parse(yyyy) <= maxBirthYear && int.Parse(yyyy) >= 1940)
                {
                    return $"{yyyy}-{mm}-{dd}";
                }
            }

            // 2. Generic date in fullText
            var genMatch = Regex.Match(fullText, @"\b([0-3]?[0-9])[\/\.\-]([0-1]?[0-9])[\/\.\-]((?:19|20)\d{2})\b");
            if (genMatch.Success)
            {
                string dd = genMatch.Groups[1].Value.PadLeft(2, '0');
                string mm = genMatch.Groups[2].Value.PadLeft(2, '0');
                string yyyy = genMatch.Groups[3].Value;
                if (IsValidDate(yyyy, mm, dd) && int.Parse(yyyy) <= maxBirthYear && int.Parse(yyyy) >= 1940)
                {
                    return $"{yyyy}-{mm}-{dd}";
                }
            }

            // 3. Age estimation if DOB is not present (e.g. Age as on 01.01.2023 : 25 years or आयु : 25 वर्ष)
            var ageMatch = Regex.Match(fullText, @"(?:AGE|आयु)[:\s]*.*?(\d{2})\s*(?:YEARS|वर्ष)?", RegexOptions.IgnoreCase);
            if (ageMatch.Success && int.TryParse(ageMatch.Groups[1].Value, out int age) && age >= 18 && age <= 95)
            {
                int estYear = currentYear - age;
                return $"{estYear}-01-01";
            }

            return "";
        }

        private static string ExtractVoterGender(string fullText)
        {
            if (Regex.IsMatch(fullText, @"\bFEMALE\b|महिला|FEM\b", RegexOptions.IgnoreCase)) return "FEMALE";
            if (Regex.IsMatch(fullText, @"\bMALE\b|पुरुष", RegexOptions.IgnoreCase)) return "MALE";
            if (Regex.IsMatch(fullText, @"TRANSGENDER", RegexOptions.IgnoreCase)) return "TRANSGENDER";
            return "";
        }

        private static string ExtractVoterName(string fullText, List<string> lines, string voterNo)
        {
            var badWords = new Regex(@"ELECTION|COMMISSION|ELECTOR|IDENTITY|CARD|EPIC|INDIA|BHARAT|NIRVACHAN|AYOG|GOVT|SARKAR|FATHER|HUSBAND|MOTHER|पिता|पति|माता|DATE|BIRTH|DOB|SEX|MALE|FEMALE|पुरुष|महिला|ADDRESS|पता|SIGNATURE|PHOTO|PLACE|ASSEMBLY|CONSTITUENCY", RegexOptions.IgnoreCase);

            // Tier 1: Look for explicit 'Name : ...' or 'Elector's Name : ...'
            for (int i = 0; i < lines.Count; i++)
            {
                string line = lines[i];
                if (Regex.IsMatch(line, @"Father|पिता|Husband|पति|Mother|माता|Fiiners|Falher", RegexOptions.IgnoreCase))
                {
                    continue;
                }

                var m = Regex.Match(line, @"(?:^|[^\w])(?:Name|Elector\'?s?\s*Name|नाम)\s*[\:\.\-\/\s]+\s*([A-Za-z][A-Za-z\s\.\']{2,})", RegexOptions.IgnoreCase);
                if (m.Success)
                {
                    string cand = CleanName(m.Groups[1].Value);
                    if (IsValidName(cand, badWords, voterNo))
                    {
                        return cand;
                    }
                }
            }

            // Tier 2: Line immediately following standalone 'Name' / 'नाम' line (skipping Father/Husband)
            for (int i = 0; i < lines.Count - 1; i++)
            {
                string line = lines[i];
                if (Regex.IsMatch(line, @"\b(?:Name|नाम|Elector\'?s?\s*Name)\b", RegexOptions.IgnoreCase) &&
                    !Regex.IsMatch(line, @"Father|पिता|Husband|पति|Mother|माता", RegexOptions.IgnoreCase))
                {
                    string cand = CleanName(lines[i + 1]);
                    if (IsValidName(cand, badWords, voterNo))
                    {
                        return cand;
                    }
                }
            }

            // Tier 3: Line above Father's Name / Husband's Name line
            int fatherIdx = lines.FindIndex(l => Regex.IsMatch(l, @"FATHER|पिता|HUSBAND|पति|FIINERS|FALHER", RegexOptions.IgnoreCase));
            if (fatherIdx > 0)
            {
                for (int k = fatherIdx - 1; k >= Math.Max(0, fatherIdx - 3); k--)
                {
                    if (Regex.IsMatch(lines[k], @"ELECTION|COMMISSION|ELECTOR|IDENTITY|CARD|EPIC|INDIA|निर्वाचन", RegexOptions.IgnoreCase)) continue;
                    if (Regex.IsMatch(lines[k], @"[A-Z]{3}[0-9]{7}")) continue;
                    string cand = CleanName(lines[k]);
                    if (IsValidName(cand, badWords, voterNo))
                    {
                        return cand;
                    }
                }
            }

            // Tier 4: Look between Header/EPIC and Father/Gender/DOB lines
            int epicIdx = lines.FindIndex(l => Regex.IsMatch(l, @"[A-Z]{3}[0-9]{7}") || Regex.IsMatch(l, @"EPIC|ELECTOR\s+PHOTO", RegexOptions.IgnoreCase));
            int start = epicIdx >= 0 ? epicIdx + 1 : 0;
            int end = fatherIdx > 0 ? fatherIdx : lines.Count;

            for (int i = start; i < end; i++)
            {
                if (Regex.IsMatch(lines[i], @"ELECTION|COMMISSION|ELECTOR|IDENTITY|CARD|EPIC|INDIA|BHARAT|MALE|FEMALE", RegexOptions.IgnoreCase)) continue;
                string cand = CleanName(lines[i]);
                if (IsValidName(cand, badWords, voterNo))
                {
                    return cand;
                }
            }

            return "";
        }

        private static string ExtractVoterAddress(string fullText, List<string> lines)
        {
            // 1. Explicit Address label
            var addrMatch = Regex.Match(fullText, @"(?:Address|पता)[:\s\-]+([\s\S]+?)(?=(?:Date|दिनांक|Place|स्थान|Electoral|निर्वाचक|\b[1-9][0-9]{5}\b|$))", RegexOptions.IgnoreCase);
            if (addrMatch.Success && addrMatch.Groups[1].Value.Length > 10)
            {
                string raw = addrMatch.Groups[1].Value;
                raw = Regex.Replace(raw, @"[\r\n]+", ", ");
                raw = Regex.Replace(raw, @"\s{2,}", " ");
                raw = raw.Trim(' ', ',', '-');
                var pin = Regex.Match(fullText, @"\b[1-9][0-9]{5}\b");
                if (pin.Success && !raw.Contains(pin.Value))
                {
                    raw += $", {pin.Value}";
                }
                return raw;
            }

            // 2. Lines preceding/including PIN code
            int pinLineIdx = -1;
            for (int i = 0; i < lines.Count; i++)
            {
                var pm = Regex.Match(lines[i], @"\b([1-9][0-9]{5})\b");
                if (pm.Success)
                {
                    pinLineIdx = i;
                    break;
                }
            }

            if (pinLineIdx >= 0)
            {
                int start = Math.Max(0, pinLineIdx - 3);
                var addrLines = lines.Skip(start).Take(pinLineIdx - start + 1)
                                     .Where(l => !Regex.IsMatch(l, @"ELECTION|COMMISSION|ELECTORAL|REGISTRATION|OFFICER", RegexOptions.IgnoreCase))
                                     .Select(l => l.Trim())
                                     .ToList();
                if (addrLines.Count > 0)
                {
                    string addr = string.Join(", ", addrLines);
                    addr = Regex.Replace(addr, @"^.*?(?:Address|पता)[:\s\-]*", "", RegexOptions.IgnoreCase);
                    return addr.Trim(' ', ',');
                }
            }

            return "";
        }
    }
}
