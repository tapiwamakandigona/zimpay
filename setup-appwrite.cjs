const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('69e62515000e9e781653')
    .setKey('standard_82d94d34809e22342ac2aeda1f6c3f61b12112548ebfcf358ab5d98b4239c9f7d76fab664290734674178d073ac60a478de6f40df491ef7fc926629c989e5e1aee2ec22cd3686e65723e6b9d9883b4ad2e631fda0ce186bfced7ff8983a1843233df115c2614cde9935fed899c5d9f437fcea8732b7b42207b35f7cfea53957e');

const databases = new Databases(client);

async function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function setup() {
    try {
        console.log('Step 1: Creating database...');
        const db = await databases.create('unique()', 'ZimpayDB');
        const dbId = db['$id'];
        console.log('Database ID: ' + dbId);

        console.log('Step 2: Creating profiles collection...');
        const profiles = await databases.createCollection(dbId, 'unique()', 'profiles', [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ]);
        const profilesId = profiles['$id'];
        console.log('Profiles ID: ' + profilesId);

        console.log('Step 3: Adding profile attributes...');
        await databases.createEmailAttribute(dbId, profilesId, 'email', true);
        await databases.createStringAttribute(dbId, profilesId, 'full_name', 255, true);
        await databases.createStringAttribute(dbId, profilesId, 'username', 255, true);
        await databases.createStringAttribute(dbId, profilesId, 'phone_number', 50, false);
        await databases.createFloatAttribute(dbId, profilesId, 'balance', true, 0.0, 999999999.0, 1000.0);

        console.log('Waiting 6s for attributes...');
        await wait(6000);

        console.log('Step 4: Creating profile indexes...');
        await databases.createIndex(dbId, profilesId, 'username_idx', 'unique', ['username']);
        await databases.createIndex(dbId, profilesId, 'email_idx', 'unique', ['email']);
        await databases.createIndex(dbId, profilesId, 'phone_idx', 'key', ['phone_number']);

        console.log('Step 5: Creating transactions collection...');
        const txs = await databases.createCollection(dbId, 'unique()', 'transactions', [
            Permission.read(Role.users()),
            Permission.create(Role.users())
        ]);
        const txsId = txs['$id'];
        console.log('Transactions ID: ' + txsId);

        console.log('Step 6: Adding transaction attributes...');
        await databases.createStringAttribute(dbId, txsId, 'sender_id', 255, true);
        await databases.createStringAttribute(dbId, txsId, 'receiver_id', 255, true);
        await databases.createFloatAttribute(dbId, txsId, 'amount', true);
        await databases.createStringAttribute(dbId, txsId, 'description', 255, false);
        await databases.createStringAttribute(dbId, txsId, 'status', 50, true, 'pending');

        console.log('Waiting 6s for attributes...');
        await wait(6000);

        console.log('Step 7: Creating transaction indexes...');
        await databases.createIndex(dbId, txsId, 'sender_idx', 'key', ['sender_id']);
        await databases.createIndex(dbId, txsId, 'receiver_idx', 'key', ['receiver_id']);

        console.log('\n=== DONE ===');
        console.log('VITE_APPWRITE_DATABASE_ID=' + dbId);
        console.log('VITE_APPWRITE_PROFILES_COLLECTION_ID=' + profilesId);
        console.log('VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID=' + txsId);

    } catch (e) {
        console.error('FAILED:', e.message || e);
    }
}

setup();
