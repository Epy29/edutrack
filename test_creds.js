
import mysql from 'mysql2/promise';

async function testConnection(user, password, database) {
    console.log(`\nTesting User: '${user}', DB: '${database}'...`);
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: user,
            password: password,
            database: database
        });
        console.log("✅ SUCCESS! Connected.");
        await conn.end();
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${e.message}`);
        return false;
    }
}

// Run tests
console.log("--- Credential Diagnostics ---");
await testConnection('root', '1234', 'edutrackTest');
await testConnection('EduTrack', 'EduTrack29@', 'edutrackTest');
await testConnection('EduTrack', 'EduTrack29@', 'edutrack');
await testConnection('root', '', 'edutrackTest');
