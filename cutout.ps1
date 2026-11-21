Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Users\sriva\OneDrive\Desktop\.codebenders\resqmeal\public\resqmeal-van3.jpg"
$outputPath = "c:\Users\sriva\OneDrive\Desktop\.codebenders\resqmeal\public\resqmeal-van-transparent.png"

$src = [System.Drawing.Bitmap]::FromFile($inputPath)
$width = $src.Width
$height = $src.Height

# Create ARGB bitmap
$dst = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $dst.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytes = [Math]::Abs($srcData.Stride) * $height
$rgbValues = New-Object byte[] $bytes

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $rgbValues, 0, $bytes)

# BFS flood fill from edges to find background
$visited = New-Object bool[] ($width * $height)
$queue = New-Object System.Collections.Generic.Queue[int]

# Add all border pixels to queue
for ($x = 0; $x -lt $width; $x++) {
    $queue.Enqueue($x) # y = 0
    $visited[$x] = $true
    $bottomIdx = ($height - 1) * $width + $x
    $queue.Enqueue($bottomIdx)
    $visited[$bottomIdx] = $true
}
for ($y = 1; $y -lt ($height - 1); $y++) {
    $leftIdx = $y * $width
    $queue.Enqueue($leftIdx)
    $visited[$leftIdx] = $true
    $rightIdx = $y * $width + ($width - 1)
    $queue.Enqueue($rightIdx)
    $visited[$rightIdx] = $true
}

$bgR = 254; $bgG = 236; $bgB = 214
$tolerance = 38

while ($queue.Count -gt 0) {
    $idx = $queue.Dequeue()
    $px = $idx % $width
    $py = [Math]::Floor($idx / $width)
    $byteOffset = $py * $srcData.Stride + $px * 4
    
    $b = $rgbValues[$byteOffset]
    $g = $rgbValues[$byteOffset + 1]
    $r = $rgbValues[$byteOffset + 2]
    
    # Check if this pixel is background color
    $dr = [Math]::Abs($r - $bgR)
    $dg = [Math]::Abs($g - $bgG)
    $db = [Math]::Abs($b - $bgB)
    
    # Also check if it's very close to background color or ground shadow
    if ($dr -le $tolerance -and $dg -le $tolerance -and $db -le $tolerance) {
        # Mark transparent
        $rgbValues[$byteOffset + 3] = 0
        
        # Enqueue neighbors
        $neighbors = @(
            @($px - 1, $py),
            @($px + 1, $py),
            @($px, $py - 1),
            @($px, $py + 1)
        )
        foreach ($n in $neighbors) {
            $nx = $n[0]; $ny = $n[1]
            if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
                $nidx = $ny * $width + $nx
                if (-not $visited[$nidx]) {
                    $visited[$nidx] = $true
                    $queue.Enqueue($nidx)
                }
            }
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $dstData.Scan0, $bytes)

$src.UnlockBits($srcData)
$dst.UnlockBits($dstData)

$dst.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$dst.Dispose()

Write-Host "Saved cutout to $outputPath"
