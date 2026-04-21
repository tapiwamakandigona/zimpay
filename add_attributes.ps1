# Adds all required attributes for profiles and transactions collections
$project = '69e62515000e9e781653'
$key = 'standard_82d94d34809e22342ac2aeda1f6c3f61b12112548ebfcf358ab5d98b4239c9f7d76fab664290734674178d073ac60a478de6f40df491ef7fc926629c989e5e1aee2ec22cd3686e65723e6b9d9883b4ad2e631fda0ce186bfced7ff8983a1843233df115c2614cde9935fed899c5d9f437fcea8732b7b42207b35f7cfea53957e'
$api = 'https://fra.cloud.appwrite.io/v1'
$headers = @{
    'X-Appwrite-Project' = $project
    'X-Appwrite-Key' = $key
    'Content-Type' = 'application/json'
}

# Add attributes to 'profiles' collection
Write-Host "Adding attributes to 'profiles' collection..."
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/profiles/attributes/email" -Method Post -Headers $headers -Body (@{ key='email'; type='string'; size=254; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/profiles/attributes/full_name" -Method Post -Headers $headers -Body (@{ key='full_name'; type='string'; size=100; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/profiles/attributes/username" -Method Post -Headers $headers -Body (@{ key='username'; type='string'; size=50; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/profiles/attributes/phone_number" -Method Post -Headers $headers -Body (@{ key='phone_number'; type='string'; size=32; required=$false; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/profiles/attributes/balance" -Method Post -Headers $headers -Body (@{ key='balance'; type='double'; required=$true; array=$false; default=1000 } | ConvertTo-Json)

# Add attributes to 'transactions' collection
Write-Host "Adding attributes to 'transactions' collection..."
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/transactions/attributes/sender_id" -Method Post -Headers $headers -Body (@{ key='sender_id'; type='string'; size=36; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/transactions/attributes/receiver_id" -Method Post -Headers $headers -Body (@{ key='receiver_id'; type='string'; size=36; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/transactions/attributes/amount" -Method Post -Headers $headers -Body (@{ key='amount'; type='double'; required=$true; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/transactions/attributes/description" -Method Post -Headers $headers -Body (@{ key='description'; type='string'; size=255; required=$false; array=$false } | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/databases/ZimpayDB/collections/transactions/attributes/status" -Method Post -Headers $headers -Body (@{ key='status'; type='string'; size=32; required=$true; array=$false; default='pending' } | ConvertTo-Json)
