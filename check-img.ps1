Add-Type -AssemblyName System.Drawing

$b = [System.Drawing.Bitmap]::FromFile('c:\Users\sriva\OneDrive\Desktop\.codebenders\resqmeal\public\resqmeal-van3.jpg')
$bg = $b.GetPixel(5, 5)
Write-Host "BG color: $($bg.R), $($bg.G), $($bg.B)"
Write-Host "Size: $($b.Width) x $($b.Height)"
$b.Dispose()
