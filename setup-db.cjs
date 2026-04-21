const { Client, Databases, Permission, Role } = require('node-appwrite');

const c = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69e62515000e9e781653')
  .setKey('standard_82d94d34809e22342ac2aeda1f6c3f61b12112548ebfcf358ab5d98b4239c9f7d76fab664290734674178d073ac60a478de6f40df491ef7fc926629c989e5e1aee2ec22cd3686e65723e6b9d9883b4ad2e631fda0ce186bfced7ff8983a1843233df115c2614cde9935fed899c5d9f437fcea8732b7b42207b35f7cfea53957e');

const d = new Databases(c);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Creating database...');
  try {
    const db = await d.create('zimpaydb', 'ZimpayDB');
    const dbId = db['$id'];
    console.log('DB: ' + dbId);

    console.log('Creating profiles collection...');
    const p = await d.createCollection(dbId, 'profiles', 'profiles', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ]);
    const pId = p['$id'];
    console.log('PROF: ' + pId);

    await d.createEmailAttribute(dbId, pId, 'email', true);
    await d.createStringAttribute(dbId, pId, 'full_name', 255, true);
    await d.createStringAttribute(dbId, pId, 'username', 255, true);
    await d.createStringAttribute(dbId, pId, 'phone_number', 50, false);
    await d.createFloatAttribute(dbId, pId, 'balance', true, 0, 999999999, 1000);

    console.log('Waiting 8s for attributes...');
    await wait(8000);

    await d.createIndex(dbId, pId, 'username_idx', 'unique', ['username']);
    await d.createIndex(dbId, pId, 'email_idx', 'unique', ['email']);
    await d.createIndex(dbId, pId, 'phone_idx', 'key', ['phone_number']);

    console.log('Creating transactions collection...');
    const t = await d.createCollection(dbId, 'transactions', 'transactions', [
      Permission.read(Role.users()),
      Permission.create(Role.users()),
    ]);
    const tId = t['$id'];
    console.log('TX: ' + tId);

    await d.createStringAttribute(dbId, tId, 'sender_id', 255, true);
    await d.createStringAttribute(dbId, tId, 'receiver_id', 255, true);
    await d.createFloatAttribute(dbId, tId, 'amount', true);
    await d.createStringAttribute(dbId, tId, 'description', 255, false);
    await d.createStringAttribute(dbId, tId, 'status', 50, false);

    console.log('Waiting 8s for attributes...');
    await wait(8000);

    await d.createIndex(dbId, tId, 'sender_idx', 'key', ['sender_id']);
    await d.createIndex(dbId, tId, 'receiver_idx', 'key', ['receiver_id']);

    console.log('');
    console.log('==== DONE ====');
    console.log('VITE_APPWRITE_DATABASE_ID=' + dbId);
    console.log('VITE_APPWRITE_PROFILES_COLLECTION_ID=' + pId);
    console.log('VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID=' + tId);
  } catch (e) {
    console.error('ERR:', e.message);
  }
}

run();
