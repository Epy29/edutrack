
try {
    console.log("Attempting to import database module...");
    const db = await import('./src/lib/db.js');
    console.log("Database module loaded successfully.");

    console.log("Running test query...");
    const [rows] = await db.mysqlConn.execute('SELECT 1 as val');
    console.log("Test Query Result:", rows);

    console.log("Closing connection...");
    await db.mysqlConn.end();
    console.log("Done.");
} catch (e) {
    console.error("---------------------------------------------------");
    console.error("CONNECTION FAILED");
    console.error("---------------------------------------------------");
    console.error(e);
    // Print specifically if it's an access denied error
    if (e.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error("\nError: The password '1234' for user 'root' was rejected.");
    } else if (e.code === 'ER_BAD_DB_ERROR') {
        console.error("\nError: The database 'edutrackTest' does not exist.");
    }
}
