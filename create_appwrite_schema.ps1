# PowerShell script to create ZimpayDB and necessary collections in Appwrite
$project = '69e62515000e9e781653'
$key = 'standard_82d94d34809e22342ac2aeda1f6c3f61b12112548ebfcf358ab5d98b4239c9f7d76fab664290734674178d073ac60a478de6f40df491ef7fc926629c989e5e1aee2ec22cd3686e65723e6b9d9883b4ad2e631fda0ce186bfced7ff8983a1843233df115c2614cde9935fed899c5d9f437fcea8732b7b42207b35f7cfea53957e'
$api = 'https://fra.cloud.appwrite.io/v1'

$headers = @{
    'X-Appwrite-Project' = $project
    'X-Appwrite-Key' = $key
    'Content-Type' = 'application/json'
}

# Database already exists, skip creation

# 2. Create 'profiles' collection
Write-Host "Creating 'profiles' collection..."
$permissionsProfiles = @(
  'read("any")',
  'create("any")',
  'update("users")',
  'delete("users")'
)
$bodyProfiles = @{ collectionId='profiles'; name='profiles'; permissions=$permissionsProfiles } | ConvertTo-Json
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections" -Method Post -Headers $headers -Body $bodyProfiles

# 3. Create 'transactions' collection
Write-Host "Creating 'transactions' collection..."
$permissionsTransactions = @(
  'read("any")',
  'create("users")'
)
$bodyTransactions = @{ collectionId='transactions'; name='transactions'; permissions=$permissionsTransactions } | ConvertTo-Json
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections" -Method Post -Headers $headers -Body $bodyTransactions
