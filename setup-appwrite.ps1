$AW_KEY = 'standard_82d94d34809e22342ac2aeda1f6c3f61b12112548ebfcf358ab5d98b4239c9f7d76fab664290734674178d073ac60a478de6f40df491ef7fc926629c989e5e1aee2ec22cd3686e65723e6b9d9883b4ad2e631fda0ce186bfced7ff8983a1843233df115c2614cde9935fed899c5d9f437fcea8732b7b42207b35f7cfea53957e'
$AW_PROJECT = '69e62515000e9e781653'
$BASE = 'https://fra.cloud.appwrite.io/v1'
$headers = @{ 'X-Appwrite-Project' = $AW_PROJECT; 'X-Appwrite-Key' = $AW_KEY; 'Content-Type' = 'application/json' }

function AW($method, $path, $body) {
    $json = if ($body) { $body | ConvertTo-Json -Depth 5 } else { $null }
    try {
        Invoke-RestMethod -Method $method -Uri "$BASE$path" -Headers $headers -Body $json
    } catch {
        $_.Exception.Response | Out-Null
        throw $_
    }
}

# 1. Create Database
Write-Host "Creating database..."
$db = AW POST '/databases' @{ databaseId = 'zimpaydb'; name = 'ZimpayDB' }
$dbId = $db.'$id'
Write-Host "DB ID: $dbId"

# 2. Create profiles collection
Write-Host "Creating profiles collection..."
$prof = AW POST "/databases/$dbId/collections" @{
    collectionId = 'profiles'; name = 'profiles';
    permissions = @('read("users")','create("users")','update("users")','delete("users")')
}
$profId = $prof.'$id'
Write-Host "Profiles ID: $profId"

# 3. Profile attributes
Write-Host "Adding profile attributes..."
AW POST "/databases/$dbId/collections/$profId/attributes/email" @{ key='email'; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$profId/attributes/string" @{ key='full_name'; size=255; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$profId/attributes/string" @{ key='username'; size=255; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$profId/attributes/string" @{ key='phone_number'; size=50; required=$false } | Out-Null
AW POST "/databases/$dbId/collections/$profId/attributes/float" @{ key='balance'; required=$true; min=0; max=999999999; default=1000 } | Out-Null
Write-Host "Waiting for attributes..."
Start-Sleep -Seconds 6

# 4. Profile indexes
Write-Host "Creating profile indexes..."
AW POST "/databases/$dbId/collections/$profId/indexes" @{ key='username_idx'; type='unique'; attributes=@('username') } | Out-Null
AW POST "/databases/$dbId/collections/$profId/indexes" @{ key='email_idx'; type='unique'; attributes=@('email') } | Out-Null
AW POST "/databases/$dbId/collections/$profId/indexes" @{ key='phone_idx'; type='key'; attributes=@('phone_number') } | Out-Null

# 5. Create transactions collection
Write-Host "Creating transactions collection..."
$tx = AW POST "/databases/$dbId/collections" @{
    collectionId = 'transactions'; name = 'transactions';
    permissions = @('read("users")','create("users")')
}
$txId = $tx.'$id'
Write-Host "Transactions ID: $txId"

# 6. Transaction attributes
Write-Host "Adding transaction attributes..."
AW POST "/databases/$dbId/collections/$txId/attributes/string" @{ key='sender_id'; size=255; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$txId/attributes/string" @{ key='receiver_id'; size=255; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$txId/attributes/float" @{ key='amount'; required=$true } | Out-Null
AW POST "/databases/$dbId/collections/$txId/attributes/string" @{ key='description'; size=255; required=$false } | Out-Null
AW POST "/databases/$dbId/collections/$txId/attributes/string" @{ key='status'; size=50; required=$true; default='pending' } | Out-Null
Write-Host "Waiting for attributes..."
Start-Sleep -Seconds 6

# 7. Transaction indexes
Write-Host "Creating transaction indexes..."
AW POST "/databases/$dbId/collections/$txId/indexes" @{ key='sender_idx'; type='key'; attributes=@('sender_id') } | Out-Null
AW POST "/databases/$dbId/collections/$txId/indexes" @{ key='receiver_idx'; type='key'; attributes=@('receiver_id') } | Out-Null

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "VITE_APPWRITE_DATABASE_ID=$dbId"
Write-Host "VITE_APPWRITE_PROFILES_COLLECTION_ID=$profId"
Write-Host "VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID=$txId"
