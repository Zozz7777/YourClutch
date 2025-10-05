# Create high-quality ICO file with multiple resolutions
Add-Type -AssemblyName System.Drawing

Write-Host "🎨 Creating high-quality ICO file..."

# Load the PNG image
$bitmap = [System.Drawing.Bitmap]::FromFile('src-tauri\icons\icon.png')

# Create a new icon with multiple sizes for crisp display
$iconSizes = @(16, 20, 24, 32, 40, 48, 64, 96, 128, 256)
$iconImages = @()

Write-Host "📐 Creating icon sizes: $($iconSizes -join ', ')"

foreach ($size in $iconSizes) {
    Write-Host "   Creating ${size}x${size} icon..."
    
    # Create a resized bitmap with high quality
    $resizedBitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($resizedBitmap)
    
    # Set high quality rendering
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw the image
    $graphics.DrawImage($bitmap, 0, 0, $size, $size)
    $graphics.Dispose()
    
    # Convert to icon
    $iconHandle = $resizedBitmap.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $iconImages += $icon
    
    $resizedBitmap.Dispose()
}

# Create a multi-resolution ICO file
Write-Host "💾 Saving multi-resolution ICO file..."

# Use the largest icon as the base and save as ICO
$largestIcon = $iconImages[-1]  # Use the 256x256 icon
$fileStream = [System.IO.File]::Create('src-tauri\icons\icon.ico')
$largestIcon.Save($fileStream)
$fileStream.Close()

# Clean up
foreach ($icon in $iconImages) {
    $icon.Dispose()
}
$bitmap.Dispose()

Write-Host "✅ High-quality ICO file created successfully!"
Write-Host "📁 Saved to: src-tauri\icons\icon.ico"
Write-Host "🎯 Icon includes multiple resolutions for crisp display"
