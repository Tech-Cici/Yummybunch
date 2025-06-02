$imageUrls = @{
    "home" = @{
        "food-delivery.jpg" = "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
    }
    "restaurant" = @{
        "restaurant-1.jpg" = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
        "restaurant-2.jpg" = "https://images.unsplash.com/photo-1552566626-52f8b828add9"
        "restaurant-3.jpg" = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
        "restaurant-4.jpg" = "https://images.unsplash.com/photo-1559339352-11d035aa65de"
        "restaurant-5.jpg" = "https://images.unsplash.com/photo-1552566626-52f8b828add9"
        "restaurant-6.jpg" = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
        "restaurant-7.jpg" = "https://images.unsplash.com/photo-1559339352-11d035aa65de"
        "restaurant-8.jpg" = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
    }
    "menu" = @{
        "margherita-pizza.jpg" = "https://images.unsplash.com/photo-1513104890138-7c749659a591"
        "pepperoni-pizza.jpg" = "https://images.unsplash.com/photo-1628840042765-356cda07504e"
        "veggie-pizza.jpg" = "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
        "spaghetti-bolognese.jpg" = "https://images.unsplash.com/photo-1563379926898-05f4575a45d8"
        "fettuccine-alfredo.jpg" = "https://images.unsplash.com/photo-1645112598816-397a49a5b2b9"
        "garlic-bread.jpg" = "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c"
        "caesar-salad.jpg" = "https://images.unsplash.com/photo-1550304943-4f24f54ddde9"
        "soft-drinks.jpg" = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97"
        "bottled-water.jpg" = "https://images.unsplash.com/photo-1600271886742-f049cd451bba"
    }
    "avatar" = @{
        "restaurant-owner.jpg" = "https://images.unsplash.com/photo-1560250097-0b93528c311a"
    }
}

$baseDir = Join-Path $PSScriptRoot ".." "public" "images"

foreach ($category in $imageUrls.Keys) {
    $categoryDir = Join-Path $baseDir $category
    if (-not (Test-Path $categoryDir)) {
        New-Item -ItemType Directory -Path $categoryDir -Force | Out-Null
    }

    foreach ($image in $imageUrls[$category].GetEnumerator()) {
        $imagePath = Join-Path $categoryDir $image.Key
        Write-Host "Downloading $($image.Key)..."
        try {
            Invoke-WebRequest -Uri $image.Value -OutFile $imagePath
            Write-Host "Downloaded: $imagePath"
        }
        catch {
            Write-Error "Failed to download $($image.Value): $_"
        }
    }
}

Write-Host "All images downloaded successfully!" 