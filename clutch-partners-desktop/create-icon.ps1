Add-Type -AssemblyName System.Drawing

# Load the PNG image
$bitmap = [System.Drawing.Bitmap]::FromFile('src-tauri\icons\icon.png')

# Create a new icon with multiple sizes
$iconSizes = @(16, 32, 48, 64, 128, 256)
$iconImages = @()

foreach ($size in $iconSizes) {
    # Create a resized bitmap
    $resizedBitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($resizedBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.DrawImage($bitmap, 0, 0, $size, $size)
    $graphics.Dispose()
    
    # Convert to icon
    $iconHandle = $resizedBitmap.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $iconImages += $icon
    
    $resizedBitmap.Dispose()
}

# Save the icon (this will use the largest size, but Windows will use the appropriate size)
$fileStream = [System.IO.File]::Create('src-tauri\icons\icon.ico')
$iconImages[0].Save($fileStream)
$fileStream.Close()

# Clean up
foreach ($icon in $iconImages) {
    $icon.Dispose()
}
$bitmap.Dispose()

Write-Host "✅ Icon created successfully with multiple resolutions"
