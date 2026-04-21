# Reliable attribute creation for Appwrite Collections (Windows PowerShell)
# USAGE: Fill in $apiEndpoint, $projectId, $apiKey, $databaseId, and collection IDs below
# Run in PowerShell from this script's folder.

$apiEndpoint = "https://YOUR_REGION.cloud.appwrite.io/v1"   # Set to your Appwrite API endpoint
$projectId = "YOUR_PROJECT_ID"
$apiKey = "YOUR_SECRET_API_KEY"
$databaseId = "YOUR_DATABASE_ID"

# Map of collection IDs and attribute groups (customize as needed)
$collections = @{
  "profiles_collection_id" = @(
    @{ key = "username"; type = "string"; size = 64; required = $true; unique = $true; array = $false },
    @{ key = "full_name"; type = "string"; size = 128; required = $true; array = $false },
    @{ key = "email"; type = "email"; required = $true; unique = $true; array = $false },
    @{ key = "balance"; type = "float"; required = $true; array = $false; default = 0.0 }
  );
  "transactions_collection_id" = @(
    @{ key = "from_user"; type = "string"; size = 64; required = $true; array = $false },
    @{ key = "to_user"; type = "string"; size = 64; required = $true; array = $false },
    @{ key = "amount"; type = "float"; required = $true; array = $false },
    @{ key = "timestamp"; type = "datetime"; required = $true; array = $false },
    @{ key = "status"; type = "enum"; required = $true; array = $false; elements = @("pending", "completed", "failed") },
    @{ key = "reference"; type = "string"; size = 32; required = $false; array = $false }
  );
}

# Helper: attribute type -> endpoint path
$endpoints = @{ 
  "string" = "/attributes/string"; 
  "email" = "/attributes/email";
  "float" = "/attributes/float";
  "datetime" = "/attributes/datetime";
  "enum" = "/attributes/enum";
}

Write-Host "Starting attribute creation..."

foreach ($collectionId in $collections.Keys) {
  $attributes = $collections[$collectionId]
  foreach ($attr in $attributes) {
    $type = $attr.type
    $endpointSuffix = $endpoints[$type]
    $url = "$apiEndpoint/databases/$databaseId/collections/$collectionId$endpointSuffix"

    # Payload creation
    $payload = @{
      key = $attr.key
      required = $attr.required
      array = $attr.array
    }
    if ($type -eq "string") { $payload.size = $attr.size }
    if ($type -eq "enum")  { $payload.elements = $attr.elements }
    if ($type -eq "float" -and $attr.ContainsKey('default')) { $payload.default = $attr.default }
    if ($attr.ContainsKey('unique')) { $payload.unique = $attr.unique }

    $payloadJson = $payload | ConvertTo-Json -Compress
    $tmpFile = "_appwriteattr_$($collectionId)_$($attr.key).json"
    Set-Content -Encoding UTF8 -Path $tmpFile -Value $payloadJson

    Write-Host "Creating [$($attr.key)] on collection [$collectionId]..."
    $curlArgs = @(
      '-X', 'POST',
      $url,
      '-H', "Content-Type: application/json",
      '-H', "X-Appwrite-Project: $projectId",
      '-H', "X-Appwrite-Key: $apiKey",
      '-d', "@$tmpFile"
    )
    $result = & curl @curlArgs 2>&1
    Write-Host $result
    Remove-Item $tmpFile
    Start-Sleep -Seconds 1 # Give Appwrite time between calls, recommended by docs
  }
}

Write-Host "All attributes attempted. Check your Appwrite Console or verify via API."
