param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8

    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { 
        $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Length -eq 1 
    } | Select-Object -First 1

    function Await-WinRt($operation, $type) {
        $method = $asTaskGeneric.MakeGenericMethod($type)
        $task = $method.Invoke($null, @($operation))
        $task.Wait() | Out-Null
        return $task.Result
    }

    [Windows.Storage.StorageFile, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapTransform, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapRotation, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null

    $file = Await-WinRt ([Windows.Storage.StorageFile]::GetFileFromPathAsync($ImagePath)) ([Windows.Storage.StorageFile])
    $stream = Await-WinRt ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
    $decoder = Await-WinRt ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

    $rotations = @(
        [Windows.Graphics.Imaging.BitmapRotation]::None,
        [Windows.Graphics.Imaging.BitmapRotation]::Clockwise270Degrees,
        [Windows.Graphics.Imaging.BitmapRotation]::Clockwise90Degrees,
        [Windows.Graphics.Imaging.BitmapRotation]::Clockwise180Degrees
    )

    $maxDim = [Math]::Max($decoder.PixelWidth, $decoder.PixelHeight)
    $targetDim = 2200.0
    $baseScale = [Math]::Max(1.5, [Math]::Min(6.0, $targetDim / $maxDim))
    $scales = @($baseScale, [double]($baseScale * 0.85), 5.0, 4.0, 3.0, 2.0, 1.5) | Select-Object -Unique

    $candidates = @()

    foreach ($rot in $rotations) {
        $foundPanOnThisRot = $false
        foreach ($scale in $scales) {
            $transform = [Windows.Graphics.Imaging.BitmapTransform]::new()
            $transform.Rotation = $rot
            $transform.ScaledWidth = [uint32]($decoder.PixelWidth * $scale)
            $transform.ScaledHeight = [uint32]($decoder.PixelHeight * $scale)
            $transform.InterpolationMode = [Windows.Graphics.Imaging.BitmapInterpolationMode]::Cubic

            $bitmap = Await-WinRt ($decoder.GetSoftwareBitmapAsync([Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8, [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied, $transform, [Windows.Graphics.Imaging.ExifOrientationMode]::RespectExifOrientation, [Windows.Graphics.Imaging.ColorManagementMode]::ColorManageToSRgb)) ([Windows.Graphics.Imaging.SoftwareBitmap])
            $ocrResult = Await-WinRt ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

            if ($ocrResult -and $ocrResult.Text) {
                $text = $ocrResult.Text
                $lines = @()
                foreach ($l in $ocrResult.Lines) {
                    $cleanLine = [regex]::Replace($l.Text, '[\x00-\x1F\x7F]', ' ').Trim()
                    if ($cleanLine) { $lines += $cleanLine }
                }
                $cleanText = [regex]::Replace($text, '[\x00-\x1F\x7F]', ' ').Trim()

                $score = 0
                # PAN detection
                if ($cleanText -match '\b([A-Z]{5}[0-9]{4}[A-Z])\b') { 
                    $score += 50
                    $foundPanOnThisRot = $true
                }
                # Aadhaar detection
                if ($cleanText -match '\b([2-9]\d{3})\s?(\d{4})\s?(\d{4})\b') {
                    $score += 50
                    $foundPanOnThisRot = $true
                }
                if ($cleanText -match 'VID\s*:\s*\d{4}' -or $cleanText -match '\bVID\b') {
                    $score += 30
                }
                if ($cleanText -match 'AADHAAR|आधार|UIDAI|माझे|MERA|GOVERNMENT|UNIQUE|AUTHORITY') {
                    $score += 25
                }
                # Voter detection
                if ($cleanText -match '\b[A-Z]{3}[0-9]{7}\b') {
                    $score += 50
                    $foundPanOnThisRot = $true
                }
                if ($cleanText -match 'ELECTION|COMMISSION|ELECTOR|IDENTITY|निर्वाचन') {
                    $score += 25
                }

                # Dates
                if ($cleanText -match '\b[0-3]?[0-9][\/\.\-][0-1]?[0-9][\/\.\-](?:19|20)\d{2}\b') { 
                    $score += 30 
                } elseif ($cleanText -match 'os[oa0-9]{1,2}[0-9a-z]{4}' -or $cleanText -match '2\.404|24\s*04') {
                    $score += 20
                }
                if ($cleanText -match 'INCOME|TAX|DEPARTMENT|GOVT|INDIA|आयकर|भारत\s*सरकार') { $score += 15 }
                $score += [Math]::Min($lines.Count, 15)

                if ($score -gt 20) {
                    $candidates += [PSCustomObject]@{
                        Score = $score
                        Lines = $lines
                        Text = $cleanText
                    }
                }
            }
        }
        if ($foundPanOnThisRot) {
            break
        }
    }

    # Contrast-enhanced pass for low-contrast / low-resolution cards
    try {
        Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue
        $srcBmp = [System.Drawing.Bitmap]::FromFile($ImagePath)
        $c = 1.5
        $t = (1.0 - $c) / 2.0
        $cScale = if ($maxDim -lt 800) { 3.5 } else { $baseScale }
        $cW = [int]($srcBmp.Width * $cScale)
        $cH = [int]($srcBmp.Height * $cScale)
        $cEnhanced = new-object System.Drawing.Bitmap($cW, $cH)
        $g = [System.Drawing.Graphics]::FromImage($cEnhanced)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $matrix = new-object System.Drawing.Imaging.ColorMatrix( ,@(
            @( $c,  0,  0,  0,  0 ),
            @(  0, $c,  0,  0,  0 ),
            @(  0,  0, $c,  0,  0 ),
            @(  0,  0,  0,  1,  0 ),
            @( $t, $t, $t,  0,  1 )
        ))
        $attr = new-object System.Drawing.Imaging.ImageAttributes
        $attr.SetColorMatrix($matrix)
        $g.DrawImage($srcBmp, [System.Drawing.Rectangle]::new(0, 0, $cW, $cH), 0, 0, $srcBmp.Width, $srcBmp.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
        $g.Dispose()
        $attr.Dispose()
        $srcBmp.Dispose()

        $tempContrast = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "$([System.Guid]::NewGuid()).png")
        $cEnhanced.Save($tempContrast, [System.Drawing.Imaging.ImageFormat]::Png)
        $cEnhanced.Dispose()

        $cFile = Await-WinRt ([Windows.Storage.StorageFile]::GetFileFromPathAsync($tempContrast)) ([Windows.Storage.StorageFile])
        $cStream = Await-WinRt ($cFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
        $cDecoder = Await-WinRt ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($cStream)) ([Windows.Graphics.Imaging.BitmapDecoder])
        $cBitmap = Await-WinRt ($cDecoder.GetSoftwareBitmapAsync([Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8, [Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied)) ([Windows.Graphics.Imaging.SoftwareBitmap])
        $cOcrResult = Await-WinRt ($engine.RecognizeAsync($cBitmap)) ([Windows.Media.Ocr.OcrResult])
        
        [System.IO.File]::Delete($tempContrast)

        if ($cOcrResult -and $cOcrResult.Text) {
            $cLines = @()
            foreach ($l in $cOcrResult.Lines) {
                $cleanLine = [regex]::Replace($l.Text, '[\x00-\x1F\x7F]', ' ').Trim()
                if ($cleanLine) { $cLines += $cleanLine }
            }
            $cCleanText = [regex]::Replace($cOcrResult.Text, '[\x00-\x1F\x7F]', ' ').Trim()
            $candidates += [PSCustomObject]@{
                Score = 40
                Lines = $cLines
                Text = $cCleanText
            }
        }
    } catch {
        # Optional enhancement failed gracefully
    }

    if ($candidates.Count -gt 0) {
        $sorted = $candidates | Sort-Object Score -Descending
        $best = $sorted[0]

        $mergedLines = [System.Collections.Generic.List[string]]::new()
        foreach ($l in $best.Lines) {
            $mergedLines.Add($l)
        }

        foreach ($other in $sorted) {
            foreach ($ol in $other.Lines) {
                if (-not $mergedLines.Contains($ol)) {
                    $mergedLines.Add($ol)
                }
            }
        }

        $fullMergedText = ($mergedLines -join " ")

        $outputObj = @{
            isSuccess = $true
            lines = $mergedLines
            text = $fullMergedText
        }
        $outputObj | ConvertTo-Json -Compress
        exit 0
    }

    @{ isSuccess = $false; message = "No PAN details found" } | ConvertTo-Json -Compress
}
catch {
    @{ isSuccess = $false; message = $_.Exception.Message } | ConvertTo-Json -Compress
    exit 1
}
