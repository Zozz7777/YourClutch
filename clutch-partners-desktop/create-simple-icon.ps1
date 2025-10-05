# Create a simple, clean icon for the application
Add-Type -AssemblyName System.Drawing

Write-Host "🎨 Creating simple, clean icon..."

# Create a simple icon programmatically
$size = 256
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Set high quality rendering
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Create a simple, clean design
$graphics.Clear([System.Drawing.Color]::White)

# Draw a simple gear/cog icon
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::DarkBlue, 8)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::DarkBlue)

# Draw a simple circle
$graphics.FillEllipse($brush, 20, 20, $size - 40, $size - 40)
$graphics.DrawEllipse($pen, 20, 20, $size - 40, $size - 40)

# Draw a simple "C" for Clutch
$font = New-Object System.Drawing.Font("Arial", 120, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString("C", $font, $textBrush, 80, 80)

# Clean up
$pen.Dispose()
$brush.Dispose()
$textBrush.Dispose()
$font.Dispose()
$graphics.Dispose()

# Save as ICO
$iconHandle = $bitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)

$fileStream = [System.IO.File]::Create('src-tauri\icons\icon.ico')
$icon.Save($fileStream)
$fileStream.Close()

# Clean up
$icon.Dispose()
$bitmap.Dispose()

Write-Host "✅ Simple, clean icon created successfully!"
Write-Host "📁 Saved to: src-tauri\icons\icon.ico"
