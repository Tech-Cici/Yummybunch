$defaultImages = @(
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80"
)

$outputDir = "Yummybunch/src/main/resources/static/images/restaurants/defaults"

# Create directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# Download each image
for ($i = 0; $i -lt $defaultImages.Count; $i++) {
    $imageUrl = $defaultImages[$i]
    $outputFile = Join-Path $outputDir "default$($i + 1).jpg"
    
    Write-Host "Downloading image $($i + 1) to $outputFile"
    Invoke-WebRequest -Uri $imageUrl -OutFile $outputFile
}

Write-Host "All default images have been downloaded successfully!" 