$categories = @{
    "home" = @("food-delivery.jpg")
    "restaurant" = @(
        "restaurant-1.jpg",
        "restaurant-2.jpg",
        "restaurant-3.jpg",
        "restaurant-4.jpg",
        "restaurant-5.jpg",
        "restaurant-6.jpg",
        "restaurant-7.jpg",
        "restaurant-8.jpg"
    )
    "menu" = @(
        "margherita-pizza.jpg",
        "pepperoni-pizza.jpg",
        "veggie-pizza.jpg",
        "spaghetti-bolognese.jpg",
        "fettuccine-alfredo.jpg",
        "garlic-bread.jpg",
        "caesar-salad.jpg",
        "soft-drinks.jpg",
        "bottled-water.jpg"
    )
    "avatar" = @("restaurant-owner.jpg")
}

$baseDir = Join-Path $PSScriptRoot ".." "public" "images"

# Create directories if they don't exist
foreach ($category in $categories.Keys) {
    $dir = Join-Path $baseDir $category
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Create placeholder images
foreach ($category in $categories.Keys) {
    foreach ($image in $categories[$category]) {
        $filePath = Join-Path $baseDir $category $image
        $svg = @"
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'>
    <rect width='300' height='200' fill='#f0f0f0'/>
    <text x='50%' y='50%' font-family='Arial' font-size='24' fill='#666' text-anchor='middle' dominant-baseline='middle'>$($image -replace '\.jpg$', '')</text>
</svg>
"@
        Set-Content -Path $filePath -Value $svg
        Write-Host "Created: $filePath"
    }
}

Write-Host "All placeholder images created successfully!" 