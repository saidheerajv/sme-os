# Test Entity Filtering API

# This script demonstrates how to test the new filtering functionality
# Make sure your server is running and you have a valid JWT token

$baseUrl = "http://localhost:3000"
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Testing Entity Filtering API" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# First, let's create a Product entity definition (if not exists)
Write-Host "`n1. Creating Product entity definition..." -ForegroundColor Yellow

$productDefinition = @{
    name = "product"
    fields = @(
        @{
            name = "name"
            type = "string"
            required = $true
            maxLength = 100
        },
        @{
            name = "price"
            type = "number"
            required = $true
            min = 0
        },
        @{
            name = "category"
            type = "string"
            required = $true
        },
        @{
            name = "active"
            type = "boolean"
            required = $false
            defaultValue = $true
        },
        @{
            name = "description"
            type = "string"
            required = $false
            maxLength = 500
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/entity-definitions" -Method POST -Body $productDefinition -Headers $headers
    Write-Host "Product entity created successfully" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Product entity already exists" -ForegroundColor Blue
    } else {
        Write-Host "Error creating entity: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Create sample products
Write-Host "`n2. Creating sample products..." -ForegroundColor Yellow

$products = @(
    @{
        name = "MacBook Pro 14"
        price = 1999
        category = "laptops"
        active = $true
        description = "Powerful laptop for professionals"
    },
    @{
        name = "MacBook Air 13"
        price = 1199
        category = "laptops"
        active = $true
        description = "Lightweight laptop for everyday use"
    },
    @{
        name = "Dell XPS 13"
        price = 1299
        category = "laptops"
        active = $true
        description = "Premium Windows laptop"
    },
    @{
        name = "iPad Pro"
        price = 799
        category = "tablets"
        active = $true
        description = "Professional tablet with Apple Pencil support"
    },
    @{
        name = "Surface Pro"
        price = 899
        category = "tablets"
        active = $false
        description = "2-in-1 Windows device"
    },
    @{
        name = "iPhone 15"
        price = 999
        category = "phones"
        active = $true
        description = "Latest iPhone model"
    },
    @{
        name = "Galaxy S24"
        price = 849
        category = "phones"
        active = $true
        description = "Samsung flagship smartphone"
    },
    @{
        name = "Vintage Laptop"
        price = 150
        category = "discontinued"
        active = $false
        description = $null
    }
)

foreach ($product in $products) {
    try {
        $productJson = $product | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$baseUrl/entities/product" -Method POST -Body $productJson -Headers $headers
        Write-Host "Created product: $($product.name)" -ForegroundColor Green
    } catch {
        Write-Host "Error creating product $($product.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test filtering
Write-Host "`n3. Testing filters..." -ForegroundColor Yellow

$testCases = @(
    @{
        name = "All products"
        url = "/entities/product"
    },
    @{
        name = "Products with 'Mac' in name"
        url = "/entities/product?search=name:lkMac"
    },
    @{
        name = "Laptops under $1500"
        url = "/entities/product?search=category:eqlaptops;price:lt1500"
    },
    @{
        name = "Active products only"
        url = "/entities/product?search=active:true"
    },
    @{
        name = "Products in laptops or tablets category"
        url = "/entities/product?search=category:in[laptops,tablets]"
    },
    @{
        name = "Products NOT in discontinued category"
        url = "/entities/product?search=category:nediscontinued"
    },
    @{
        name = "Products with price between 800-1300"
        url = "/entities/product?search=price:gte800;price:lte1300"
    },
    @{
        name = "Products with non-null description"
        url = "/entities/product?search=description:notnull"
    },
    @{
        name = "Products sorted by price ascending"
        url = "/entities/product?sort=price:asc"
    },
    @{
        name = "First 3 products, names only"
        url = "/entities/product?limit=3&select=name,price"
    },
    @{
        name = "Complex query: Active laptops under $1500, sorted by price, names and prices only"
        url = "/entities/product?search=active:true;category:eqlaptops;price:lt1500&sort=price:asc&select=name,price"
    }
)

foreach ($testCase in $testCases) {
    Write-Host "`n--- $($testCase.name) ---" -ForegroundColor Cyan
    Write-Host "URL: $($testCase.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$($testCase.url)" -Method GET -Headers $headers
        Write-Host "Results found: $($response.data.Count)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor White
        $response | ConvertTo-Json -Depth 10 | Write-Host
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n4. Testing error cases..." -ForegroundColor Yellow

$errorCases = @(
    @{
        name = "Invalid field"
        url = "/entities/product?search=invalidField:eqvalue"
    },
    @{
        name = "Invalid operator for field type"
        url = "/entities/product?search=price:lkinvalidtext"
    },
    @{
        name = "Invalid sort direction"
        url = "/entities/product?sort=name:invalid"
    }
)

foreach ($errorCase in $errorCases) {
    Write-Host "`n--- $($errorCase.name) ---" -ForegroundColor Cyan
    Write-Host "URL: $($errorCase.url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$($errorCase.url)" -Method GET -Headers $headers
        Write-Host "Unexpected success - should have failed" -ForegroundColor Yellow
    } catch {
        Write-Host "Expected error: $($_.Exception.Message)" -ForegroundColor Green
    }
}

Write-Host "`n`nTesting completed!" -ForegroundColor Green
Write-Host "Check the FILTER_API_DOCS.md file for complete documentation." -ForegroundColor Blue