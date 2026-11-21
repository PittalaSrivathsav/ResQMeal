Add-Type -AssemblyName System.Drawing

$b = [System.Drawing.Bitmap]::FromFile('c:\Users\sriva\OneDrive\Desktop\.codebenders\resqmeal\public\resqmeal-van-transparent.png')
Write-Host "Pixel (0,0) Alpha:" $b.GetPixel(0,0).A
Write-Host "Pixel (500,200) Alpha:" $b.GetPixel(500,200).A "Color:" $b.GetPixel(500,200).R $b.GetPixel(500,200).G $b.GetPixel(500,200).B
Write-Host "Pixel (100,500) Alpha:" $b.GetPixel(100,500).A
$b.Dispose()
